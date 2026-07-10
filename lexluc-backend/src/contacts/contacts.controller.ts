import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Query, Req } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { ContactListQueryDto, ContactMessageStatus, UpdateContactMessageResponseDto, UpdateContactMessageStatusDto } from './dto/update-contact-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('contacts')
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  create(@Body() createContactMessageDto: CreateContactMessageDto, @Req() req: any) {
    const identifier = `${req.ip || 'unknown-ip'}:${createContactMessageDto.email}`;
    return this.contactsService.create(createContactMessageDto, identifier);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  stats() {
    return this.contactsService.findStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  findAll(@Query() query: ContactListQueryDto) {
    return this.contactsService.findAll(query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  findOne(@Param('id') id: string) {
    return this.contactsService.findOne(id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  markAsRead(@Param('id') id: string) {
    return this.contactsService.markAsRead(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  updateStatus(@Param('id') id: string, @Body() body: UpdateContactMessageStatusDto) {
    return this.contactsService.updateStatus(id, body.status);
  }

  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  respond(@Param('id') id: string, @Body() body: UpdateContactMessageResponseDto) {
    return this.contactsService.respond(id, body.response);
  }

  @Patch(':id/close')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('BOOKING_MANAGER', 'CONTENT_MANAGER', 'SUPER_ADMIN')
  close(@Param('id') id: string) {
    return this.contactsService.close(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.contactsService.remove(id);
  }
}
