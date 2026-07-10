import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactMessageStatus } from './dto/update-contact-message.dto';

interface ContactListQuery {
  page?: string;
  limit?: string;
  status?: ContactMessageStatus;
  search?: string;
  sort?: 'createdAt' | 'updatedAt' | 'fullName' | 'email' | 'subject' | 'status';
  sortDir?: 'asc' | 'desc';
}

@Injectable()
export class ContactsService {
  private readonly logger = new Logger(ContactsService.name);
  private readonly rateLimitWindowMs = 15 * 60 * 1000;
  private readonly rateLimitMax = 5;
  private readonly requestTimestamps = new Map<string, number[]>();

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(createContactMessageDto: CreateContactMessageDto, clientIdentifier: string) {
    this.validateSpamProtection(createContactMessageDto);
    this.enforceRateLimit(clientIdentifier);

    const normalized = this.normalizeInput(createContactMessageDto);

    const existing = await this.prisma.contactMessage.findFirst({
      where: {
        email: normalized.email,
        subject: normalized.subject,
        message: normalized.message,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('This inquiry has already been submitted.');
    }

    const created = await this.prisma.contactMessage.create({
      data: {
        fullName: normalized.fullName,
        email: normalized.email,
        phone: normalized.phone,
        company: normalized.company,
        subject: normalized.subject,
        message: normalized.message,
        status: ContactMessageStatus.NEW,
        isRead: false,
        userId: normalized.userId,
      },
    });

    this.sendEmailNotifications(created).catch((error) => {
      this.logger.error(`Failed to send contact email notifications for ${created.id}`, error instanceof Error ? error.stack : error);
    });

    return this.normalizeContact(created);
  }

  async findAll(query: ContactListQuery = {}) {
    const page = this.parsePositiveInt(query.page, 1);
    const limit = Math.min(this.parsePositiveInt(query.limit, 25), 100);
    const where: any = { deletedAt: null };
    const orderBy: any[] = [];

    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { phone: { contains: query.search, mode: 'insensitive' } },
        { company: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
        { message: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const sortField = ['createdAt', 'updatedAt', 'fullName', 'email', 'subject', 'status'].includes(query.sort || 'createdAt')
      ? query.sort || 'createdAt'
      : 'createdAt';
    const sortDir = query.sortDir === 'asc' ? 'asc' : 'desc';
    orderBy.push({ [sortField]: sortDir });

    const [data, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return {
      data: data.map((contact) => this.normalizeContact(contact)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findStats() {
    const [total, newMessages, inProgress, responded, closed, unread] = await Promise.all([
      this.prisma.contactMessage.count({ where: { deletedAt: null } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null, status: ContactMessageStatus.NEW } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null, status: ContactMessageStatus.IN_PROGRESS } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null, status: ContactMessageStatus.RESPONDED } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null, status: ContactMessageStatus.CLOSED } }),
      this.prisma.contactMessage.count({ where: { deletedAt: null, isRead: false } }),
    ]);

    return { total, new: newMessages, inProgress, responded, closed, unread };
  }

  async findOne(id: string) {
    const contact = await this.prisma.contactMessage.findUnique({ where: { id, deletedAt: null } });
    if (!contact) throw new NotFoundException('Contact message not found');
    return this.normalizeContact(contact);
  }

  async markAsRead(id: string) {
    const contact = await this.findOne(id);
    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    return this.normalizeContact(updated);
  }

  async updateStatus(id: string, status: ContactMessageStatus) {
    await this.findOne(id);
    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: { status, isRead: true },
    });

    return this.normalizeContact(updated);
  }

  async respond(id: string, response: string) {
    await this.findOne(id);
    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: { status: ContactMessageStatus.RESPONDED, response: this.sanitizeText(response), isRead: true, respondedAt: new Date() },
    });

    return this.normalizeContact(updated);
  }

  async close(id: string) {
    await this.findOne(id);
    const updated = await this.prisma.contactMessage.update({
      where: { id },
      data: { status: ContactMessageStatus.CLOSED, isRead: true },
    });

    return this.normalizeContact(updated);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contactMessage.update({ where: { id }, data: { deletedAt: new Date() } });
    return { deleted: true };
  }

  private async sendEmailNotifications(contact: any) {
    await Promise.all([
      this.emailService.sendCompanyInquiryNotification({
        fullName: contact.fullName,
        email: contact.email,
        phone: contact.phone,
        company: contact.company,
        subject: contact.subject,
        message: contact.message,
        submittedAt: contact.createdAt,
      }),
      this.emailService.sendCustomerConfirmation({
        fullName: contact.fullName,
        email: contact.email,
        subject: contact.subject,
      }),
    ]);
  }

  private validateSpamProtection(dto: CreateContactMessageDto) {
    if (dto.honeypot) {
      throw new BadRequestException('Spam detected');
    }
  }

  private enforceRateLimit(identifier: string) {
    const now = Date.now();
    const timestamps = this.requestTimestamps.get(identifier) || [];
    const recent = timestamps.filter((timestamp) => now - timestamp < this.rateLimitWindowMs);

    if (recent.length >= this.rateLimitMax) {
      throw new BadRequestException('Too many contact submissions. Please try again later.');
    }

    recent.push(now);
    this.requestTimestamps.set(identifier, recent);
  }

  private normalizeInput(dto: CreateContactMessageDto) {
    return {
      fullName: this.sanitizeText(dto.fullName),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone ? this.sanitizeText(dto.phone) : undefined,
      company: dto.company ? this.sanitizeText(dto.company) : undefined,
      subject: this.sanitizeText(dto.subject),
      message: this.sanitizeText(dto.message),
      userId: dto.userId,
    };
  }

  private sanitizeText(value: string) {
    return value
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
      .trim();
  }

  private parsePositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  private normalizeContact(contact: any) {
    return {
      id: contact.id,
      fullName: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      company: contact.company,
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
      isRead: contact.isRead,
      response: contact.response,
      respondedAt: contact.respondedAt,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
