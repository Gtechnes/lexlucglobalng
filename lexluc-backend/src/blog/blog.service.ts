import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  AssistBlogDto,
  BlogArticleLength,
  BlogArticleType,
  BlogAssistAction,
  BlogPostStatus,
  BlogSeoFocus,
  BlogTargetAudience,
  BlogTone,
  CreateBlogPostDto,
  GenerateBlogDto,
} from './dto/create-blog-post.dto';

interface TourSource {
  id: string;
  title: string;
  slug: string;
  category?: string;
  destination: string;
  departureLocation?: string;
  shortDescription?: string;
  description: string;
  startDate?: Date;
  endDate?: Date;
  price: number;
  currency: string;
  availableSlots?: number;
  discount?: number;
  featuredImage?: string;
  gallery: string[];
  itinerary?: any[];
  inclusions: string[];
  featured: boolean;
  status: string;
  seoKeywords?: string;
  highlights: string[];
}

@Injectable()
export class BlogService {
  private logger = new Logger('BlogService');

  constructor(private prisma: PrismaService) {}

  async create(createBlogPostDto: CreateBlogPostDto) {
    try {
      const slug = this.normalizeSlug(createBlogPostDto.slug || createBlogPostDto.title);
      const existing = await this.prisma.blogPost.findFirst({ where: { slug, deletedAt: null } });
      if (existing) {
        throw new ConflictException(`Blog slug "${slug}" already exists`);
      }

      const data = this.mapCreateData(createBlogPostDto, slug);
      this.logger.log(`Creating blog post: title="${createBlogPostDto.title}", status="${data.status}"`);
      const created = await this.prisma.blogPost.create({ data, include: { category: true } });
      return this.normalizeBlogPost(created);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to create blog post: ${message}`);
      throw err;
    }
  }

  async findAllPublic(page?: string, limit?: string, categoryId?: string) {
    await this.publishScheduledPosts();
    this.logger.debug(`Fetching public posts, categoryId=${categoryId}`);
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = Math.min(this.parsePositiveInt(limit, 12), 100);
    const where: any = {
      deletedAt: null,
      status: BlogPostStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
    };
    if (categoryId) where.categoryId = categoryId;

    const [data] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        include: { category: true },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return data.map((post) => this.normalizeBlogPost(post));
  }

  async findAllAdmin(page?: string, limit?: string) {
    await this.publishScheduledPosts();
    this.logger.debug('Fetching admin posts');
    const parsedPage = this.parsePositiveInt(page, 1);
    const parsedLimit = Math.min(this.parsePositiveInt(limit, 100), 100);
    const [data] = await Promise.all([
      this.prisma.blogPost.findMany({
        where: { deletedAt: null },
        include: { category: true },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        skip: (parsedPage - 1) * parsedLimit,
        take: parsedLimit,
      }),
      this.prisma.blogPost.count({ where: { deletedAt: null } }),
    ]);

    return data.map((post) => this.normalizeBlogPost(post));
  }

  findOne(id: string) {
    return this.prisma.blogPost
      .findUnique({ where: { id, deletedAt: null }, include: { category: true } })
      .then((post) => (post ? this.normalizeBlogPost(post) : null)) as any;
  }

  findBySlug(slug: string) {
    return this.prisma.blogPost
      .findUnique({
        where: { slug, deletedAt: null },
        include: { category: true },
      })
      .then((post) => (post && post.status === BlogPostStatus.PUBLISHED ? this.normalizeBlogPost(post) : null)) as any;
  }

  async update(id: string, updateBlogPostDto: Partial<CreateBlogPostDto>) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    const slug = this.normalizeSlug(updateBlogPostDto.slug || existing.slug || updateBlogPostDto.title || existing.title);
    if (slug !== existing.slug) {
      const duplicate = await this.prisma.blogPost.findFirst({ where: { slug, deletedAt: null, id: { not: id } } });
      if (duplicate) {
        throw new ConflictException(`Blog slug "${slug}" already exists`);
      }
    }

    const data = this.mapUpdateData(updateBlogPostDto, existing, slug);
    this.logger.log(`Updating blog post: id="${id}", status="${data.status}"`);
    const updated = await this.prisma.blogPost.update({ where: { id }, data, include: { category: true } });
    return this.normalizeBlogPost(updated);
  }

  remove(id: string) {
    return this.prisma.blogPost.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async publish(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        status: BlogPostStatus.PUBLISHED,
        isPublished: true,
        publishedAt: new Date(),
      },
      include: { category: true },
    });
    return this.normalizeBlogPost(updated);
  }

  async archive(id: string) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new NotFoundException('Blog post not found');
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        status: BlogPostStatus.ARCHIVED,
        isPublished: false,
        publishedAt: null,
      },
      include: { category: true },
    });
    return this.normalizeBlogPost(updated);
  }

  async incrementViews(id: string) {
    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: { category: true },
    });
    return this.normalizeBlogPost(updated);
  }

  async getAiSources(sourceSelection = {}) {
    const tours = await this.selectTours(sourceSelection);
    const destinations = await this.prisma.tour.groupBy({
      by: ['destination'],
      where: { deletedAt: null, destination: { not: '' } },
      orderBy: { destination: 'asc' },
    });
    const categories = await this.prisma.tour.groupBy({
      by: ['category'],
      where: { deletedAt: null, category: { not: '' } },
      orderBy: { category: 'asc' },
    });

    return {
      tours: tours.map((tour) => ({
        id: tour.id,
        title: tour.title,
        destination: tour.destination,
        category: tour.category || '',
        featured: tour.featured,
        status: tour.status,
        image: tour.featuredImage || tour.gallery?.[0] || '',
      })),
      destinations: destinations.map((item) => item.destination).filter(Boolean),
      categories: categories.map((item) => item.category).filter(Boolean),
    };
  }

  async generateAiBlog(dto: GenerateBlogDto) {
    const tours = await this.selectTours(dto.sourceSelection || {});
    if (tours.length === 0) {
      throw new BadRequestException('No tour data found for the selected source. Choose at least one tour, destination, or category.');
    }

    const topic = dto.customTopic || this.getPrimaryTopic(tours);
    const title = dto.title || this.createGeneratedTitle(dto.articleType, tours, topic);
    const excerpt = this.createExcerpt(dto, tours, topic);
    const content = this.createArticleHtml(dto, tours, topic);
    const metaTitle = dto.title || this.createGeneratedTitle(dto.articleType, tours, topic);
    const metaDescription = this.createMetaDescription(dto, tours, topic);
    const seoKeywords = this.extractKeywords(tours, topic);
    const tags = this.generateTags(tours, topic);
    const image = this.selectFeaturedImage(tours);
    const sourceTourIds = tours.map((tour) => tour.id);

    return {
      title,
      excerpt,
      content,
      metaTitle,
      metaDescription,
      seoKeywords,
      tags,
      image,
      sourceTourIds,
      aiGenerated: true,
    };
  }

  async assistAiBlog(dto: AssistBlogDto) {
    const tours = await this.selectTours(dto.sourceSelection || {});
    const topic = this.getPrimaryTopic(tours) || dto.title || 'travel experience';

    switch (dto.action) {
      case BlogAssistAction.IMPROVE_WRITING:
        return {
          content: this.improveWriting(dto.content, tours, topic),
          excerpt: dto.excerpt || this.createExcerptFromHtml(dto.content),
        };
      case BlogAssistAction.EXPAND_CONTENT:
        return { content: this.expandContent(dto.content, tours, topic) };
      case BlogAssistAction.SHORTEN_CONTENT:
        return { content: this.shortenContent(dto.content) };
      case BlogAssistAction.IMPROVE_SEO:
        return this.improveSeo(dto, tours, topic);
      case BlogAssistAction.GENERATE_META_TAGS:
        return this.improveSeo(dto, tours, topic);
      case BlogAssistAction.GENERATE_TAGS:
        return { tags: this.generateTags(tours, topic), seoKeywords: this.extractKeywords(tours, topic) };
      case BlogAssistAction.GENERATE_CTA:
        return { content: this.createCta(tours) };
      default:
        throw new BadRequestException('Unsupported AI blog assist action');
    }
  }

  async getStats() {
    await this.publishScheduledPosts();
    const posts = await this.prisma.blogPost.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { views: 'desc' },
    });
    const normalized = posts.map((post) => this.normalizeBlogPost(post));
    const statusCounts = normalized.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: normalized.length,
      draft: statusCounts[BlogPostStatus.DRAFT] || 0,
      underReview: statusCounts[BlogPostStatus.UNDER_REVIEW] || 0,
      scheduled: statusCounts[BlogPostStatus.SCHEDULED] || 0,
      published: statusCounts[BlogPostStatus.PUBLISHED] || 0,
      archived: statusCounts[BlogPostStatus.ARCHIVED] || 0,
      views: normalized.reduce((sum, post) => sum + post.views, 0),
      likes: normalized.reduce((sum, post) => sum + post.likes, 0),
      shares: normalized.reduce((sum, post) => sum + post.shares, 0),
      mostPopular: normalized.slice(0, 5).map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        views: post.views,
        likes: post.likes,
        shares: post.shares,
        publishedAt: post.publishedAt,
      })),
    };
  }

  private async publishScheduledPosts() {
    await this.prisma.blogPost.updateMany({
      where: {
        deletedAt: null,
        status: BlogPostStatus.SCHEDULED,
        scheduledFor: { lte: new Date() },
      },
      data: {
        status: BlogPostStatus.PUBLISHED,
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  private mapCreateData(dto: CreateBlogPostDto, slug: string) {
    const status = dto.status || (dto.isPublished ? BlogPostStatus.PUBLISHED : BlogPostStatus.DRAFT);
    const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : status === BlogPostStatus.PUBLISHED ? new Date() : null;

    return {
      title: dto.title,
      slug,
      content: dto.content,
      excerpt: dto.excerpt,
      image: dto.image,
      status,
      isPublished: status === BlogPostStatus.PUBLISHED,
      publishedAt,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : null,
      aiGenerated: dto.aiGenerated || false,
      sourceTourIds: dto.sourceTourIds || [],
      lastAutosavedAt: dto.lastAutosavedAt ? new Date(dto.lastAutosavedAt) : null,
      views: dto.views || 0,
      likes: dto.likes || 0,
      shares: dto.shares || 0,
      commentsCount: dto.commentsCount || 0,
      categoryId: dto.categoryId,
      metaTitle: dto.metaTitle,
      metaDescription: dto.metaDescription,
      seoKeywords: dto.seoKeywords || [],
      tags: dto.tags || [],
    };
  }

  private mapUpdateData(dto: Partial<CreateBlogPostDto>, existing: any, slug: string) {
    const requestedStatus = dto.status || (dto.isPublished ? BlogPostStatus.PUBLISHED : undefined);
    const status = requestedStatus || existing.status;
    const data: any = {
      title: dto.title,
      slug,
      content: dto.content,
      excerpt: dto.excerpt,
      image: dto.image,
      status,
      scheduledFor: dto.scheduledFor ? new Date(dto.scheduledFor) : existing.scheduledFor,
      aiGenerated: dto.aiGenerated ?? existing.aiGenerated,
      sourceTourIds: dto.sourceTourIds ?? existing.sourceTourIds,
      lastAutosavedAt: dto.lastAutosavedAt ? new Date(dto.lastAutosavedAt) : existing.lastAutosavedAt,
      views: dto.views ?? existing.views,
      likes: dto.likes ?? existing.likes,
      shares: dto.shares ?? existing.shares,
      commentsCount: dto.commentsCount ?? existing.commentsCount,
      categoryId: dto.categoryId ?? existing.categoryId,
      metaTitle: dto.metaTitle ?? existing.metaTitle,
      metaDescription: dto.metaDescription ?? existing.metaDescription,
      seoKeywords: dto.seoKeywords ?? existing.seoKeywords,
      tags: dto.tags ?? existing.tags,
    };

    if (status === BlogPostStatus.PUBLISHED) {
      data.isPublished = true;
      data.publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : existing.publishedAt || new Date();
    } else {
      data.isPublished = false;
      data.publishedAt = null;
    }

    return data;
  }

  private normalizeBlogPost(post: any) {
    return {
      ...post,
      status: post.status || (post.isPublished ? BlogPostStatus.PUBLISHED : BlogPostStatus.DRAFT),
      isPublished: post.status === BlogPostStatus.PUBLISHED,
      sourceTourIds: post.sourceTourIds || [],
      seoKeywords: post.seoKeywords || [],
      tags: post.tags || [],
      views: post.views || 0,
      likes: post.likes || 0,
      shares: post.shares || 0,
      commentsCount: post.commentsCount || 0,
    };
  }

  private async selectTours(sourceSelection: any): Promise<TourSource[]> {
    const now = new Date();
    const where: any = { deletedAt: null };
    const filters: any[] = [];

    if (sourceSelection?.tourIds?.length) {
      where.id = { in: sourceSelection.tourIds };
    }
    if (sourceSelection?.destination) {
      where.destination = { contains: sourceSelection.destination, mode: 'insensitive' };
    }
    if (sourceSelection?.category) {
      where.category = { contains: sourceSelection.category, mode: 'insensitive' };
    }
    if (sourceSelection?.featured !== undefined) {
      where.featured = sourceSelection.featured;
    }
    if (sourceSelection?.upcoming) {
      filters.push({ startDate: { gt: now } });
    }
    if (sourceSelection?.completed) {
      filters.push({ status: 'COMPLETED' });
      filters.push({ endDate: { lt: now } });
    }
    if (filters.length > 0) {
      const currentWhere = { ...where };
      delete currentWhere.id;
      delete currentWhere.destination;
      delete currentWhere.category;
      delete currentWhere.featured;
      where.OR = filters.map((filter) => ({ ...currentWhere, ...filter }));
    }

    const tours = await this.prisma.tour.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 12,
    });

    return tours.map((tour) => ({
      id: tour.id,
      title: tour.title,
      slug: tour.slug,
      category: tour.category || undefined,
      destination: tour.destination,
      departureLocation: tour.departureLocation || undefined,
      shortDescription: tour.shortDescription || undefined,
      description: tour.description || tour.shortDescription || '',
      startDate: tour.startDate || undefined,
      endDate: tour.endDate || undefined,
      price: Number(tour.price),
      currency: tour.currency,
      availableSlots: tour.availableSlots || undefined,
      discount: tour.discount || 0,
      featuredImage: tour.featuredImage || undefined,
      gallery: tour.gallery || [],
      itinerary: Array.isArray(tour.itinerary) ? tour.itinerary : [],
      inclusions: tour.inclusions || [],
      featured: tour.featured,
      status: tour.status,
      seoKeywords: tour.seoKeywords || undefined,
      highlights: tour.highlights || [],
    }));
  }

  private createGeneratedTitle(articleType: BlogArticleType, tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || 'Your Destination';
    const firstTour = tours[0]?.title || 'this tour';

    switch (articleType) {
      case BlogArticleType.TRAVEL_GUIDE:
        return `Complete Guide to Visiting ${destination}`;
      case BlogArticleType.DESTINATION_SPOTLIGHT:
        return `Top Attractions and Experiences in ${destination}`;
      case BlogArticleType.TOUR_HIGHLIGHTS:
        return `What Makes Our ${firstTour} Special`;
      case BlogArticleType.TRAVEL_TIPS:
        return `10 Essential Travel Tips Before Visiting ${destination}`;
      case BlogArticleType.COMPANY_EXPERIENCE_STORY:
        return `How LexLuc Global Creates Unforgettable Travel Experiences in ${destination}`;
      case BlogArticleType.CUSTOM:
      default:
        return topic;
    }
  }

  private createExcerpt(dto: GenerateBlogDto, tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours);
    const firstTour = tours[0]?.title || 'this tour';
    const text =
      dto.articleType === BlogArticleType.TOUR_HIGHLIGHTS
        ? `Discover the standout moments, expert guidance, and unforgettable experiences that make ${firstTour} a compelling choice for ${dto.targetAudience.toLowerCase()} travelers.`
        : `Explore ${destination || topic} with practical travel insights, curated highlights, and expert recommendations designed for ${dto.targetAudience.toLowerCase()} travelers.`;
    return text.slice(0, 220);
  }

  private createArticleHtml(dto: GenerateBlogDto, tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const firstTour = tours[0];
    const toneLine = this.getToneLine(dto.tone);
    const audienceLine = this.getAudienceLine(dto.targetAudience);
    const highlights = this.collectHighlights(tours);
    const inclusions = this.collectInclusions(tours);
    const itinerary = this.collectItinerary(tours);
    const recommendations = this.createRecommendations(tours, dto);
    const imageHtml = firstTour?.featuredImage ? `<p><img src="${this.escapeHtml(firstTour.featuredImage)}" alt="${this.escapeHtml(firstTour.title)}" /></p>` : '';

    return `
<h2>Introduction</h2>
<p>${toneLine} ${destination} has become one of the most compelling destinations for ${audienceLine.toLowerCase()} seeking meaningful travel experiences. ${this.getOpeningSentence(tours, topic)}</p>
${imageHtml}
<h2>Why ${destination} Deserves a Place on Your Travel List</h2>
<p>${this.createDestinationOverview(tours, topic)}</p>
<p>Whether you are comparing guided tours, planning an independent itinerary, or looking for a trusted travel partner, ${firstTour?.title || 'LexLuc Global'} helps transform travel planning into a confident, memorable experience.</p>
<h2>Main Sections</h2>
${this.createMainSections(tours, dto.articleLength)}
<h2>Travel Highlights</h2>
<ul>${highlights.map((highlight) => `<li>${this.escapeHtml(highlight)}</li>`).join('')}</ul>
<h2>Recommended Itinerary Flow</h2>
${itinerary.length ? `<ol>${itinerary.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')}</ol>` : `<p>${this.escapeHtml(firstTour?.shortDescription || firstTour?.description || 'Plan each day around your preferred pace, local culture, scenic stops, and rest periods that keep the trip enjoyable.')}</p>`}
<h2>Practical Recommendations</h2>
<ul>${recommendations.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')}</ul>
${inclusions.length ? `<h2>Included Services to Look For</h2><ul>${inclusions.map((item) => `<li>${this.escapeHtml(item)}</li>`).join('')}</ul>` : ''}
<h2>Conclusion</h2>
<p>${this.createConclusion(tours, destination)}</p>
${this.createCta(tours)}
`.trim();
  }

  private createMainSections(tours: TourSource[], articleLength: BlogArticleLength) {
    const sections = [
      {
        title: 'Destination Character',
        body: `The selected tours point to ${this.getPrimaryDestination(tours) || 'a destination'} with a strong mix of culture, scenery, hospitality, and carefully planned experiences. Travelers can expect a journey that balances discovery with comfort.`,
      },
      {
        title: 'What to Experience',
        body: `From signature sights to local interactions, the best itineraries give travelers enough structure to feel supported while leaving space for personal discovery.`,
      },
      {
        title: 'Planning Considerations',
        body: `Pricing, travel dates, included services, and available slots should be reviewed before booking so expectations align with the experience.`,
      },
    ];

    if (articleLength === BlogArticleLength.LONG) {
      sections.push(
        {
          title: 'Best Time to Travel',
          body: `Reviewing travel dates helps travelers choose periods with favorable weather, smoother logistics, and better availability for guided activities.`,
        },
        {
          title: 'Traveler Preparation',
          body: `Confirming inclusions, packing essentials, and understanding the itinerary reduces stress and improves the overall travel experience.`,
        },
      );
    }

    return sections
      .map(
        (section) => `
<h3>${section.title}</h3>
<p>${this.escapeHtml(section.body)}</p>
`,
      )
      .join('');
  }

  private createRecommendations(tours: TourSource[], dto: GenerateBlogDto) {
    const destination = this.getPrimaryDestination(tours) || 'your destination';
    return [
      `Book early when ${destination} tours have limited available slots or fixed departure dates.`,
      `Compare inclusions carefully, especially transport, accommodation, guide support, meals, and activity fees.`,
      `Choose a travel pace that matches ${dto.targetAudience.toLowerCase()} expectations and comfort level.`,
      `Keep digital and printed copies of booking details, identification, and emergency contacts.`,
      `Ask your travel consultant about seasonal conditions, local customs, and recommended packing items.`,
    ];
  }

  private createCta(tours: TourSource[]) {
    const destination = this.getPrimaryDestination(tours) || 'your next destination';
    const firstTour = tours[0]?.title || 'your preferred tour';
    return `<h2>Ready to Plan Your Trip?</h2><p>Contact LexLuc Global today to explore ${firstTour}, compare available options, and build a travel experience around ${destination} with professional guidance from inquiry to departure.</p><p><strong>Call to action:</strong> Request a personalized itinerary or speak with a LexLuc Global travel consultant to confirm availability, pricing, and the best travel dates.</p>`;
  }

  private improveWriting(content: string, tours: TourSource[], topic: string) {
    const professionalIntro = `<h2>Professional Travel Overview</h2><p>Designed for travelers who value clarity, comfort, and meaningful experiences, this article highlights the essential details, memorable moments, and practical considerations that make ${this.getPrimaryDestination(tours) || topic} worth exploring with confidence.</p>`;
    return `${professionalIntro}${content}${this.createCta(tours)}`;
  }

  private expandContent(content: string, tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const additions = `
<h2>Local Culture and Traveler Expectations</h2>
<p>${this.escapeHtml(destination)} offers more than sightseeing. Travelers benefit from understanding local customs, respectful behavior, and the small details that make each interaction more meaningful.</p>
<h2>Comfort, Safety, and Logistics</h2>
<p>A well-planned itinerary should consider transport comfort, guide availability, rest periods, weather conditions, and clear communication before and during the trip.</p>
<h2>Why Guided Travel Adds Value</h2>
<p>Guided travel can reduce uncertainty, improve access to local knowledge, and help travelers focus on the experience instead of logistics.</p>
`;
    return `${content}${additions}${this.createCta(tours)}`;
  }

  private shortenContent(content: string) {
    const text = this.stripHtml(content);
    const shortened = text.replace(/\s+/g, ' ').trim().slice(0, 900);
    return `<p>${this.escapeHtml(shortened || 'This travel article highlights the key experiences, practical recommendations, and planning considerations for a memorable trip. Review the full draft before publishing.')}...</p>`;
  }

  private improveSeo(dto: AssistBlogDto, tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const title = dto.title || dto.metaTitle || `Best Travel Guide to ${destination}`;
    const description = dto.metaDescription || this.createMetaDescription(
      {
        articleType: BlogArticleType.TRAVEL_GUIDE,
        tone: BlogTone.PROFESSIONAL,
        articleLength: BlogArticleLength.MEDIUM,
        seoFocus: BlogSeoFocus.BALANCED,
        targetAudience: BlogTargetAudience.TOURISTS,
        sourceSelection: dto.sourceSelection,
      },
      tours,
      topic,
    );
    return {
      metaTitle: title,
      metaDescription: description,
      seoKeywords: this.extractKeywords(tours, topic),
      tags: this.generateTags(tours, topic),
    };
  }

  private createMetaDescription(dto: GenerateBlogDto, tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const focus = dto.seoFocus === BlogSeoFocus.SEO_OPTIMIZED ? 'SEO-friendly travel guide' : dto.seoFocus === BlogSeoFocus.READER_FOCUSED ? 'practical travel advice' : 'balanced travel guide';
    return `${focus} for ${destination}, featuring curated tour highlights, planning tips, recommended experiences, and expert guidance for ${dto.targetAudience.toLowerCase()} travelers.`;
  }

  private extractKeywords(tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const words = [
      destination,
      'travel',
      'tourism',
      'vacation',
      'adventure',
      this.getPrimaryCategory(tours) || 'guided tours',
      ...tours.flatMap((tour) => [tour.title, tour.destination, ...(tour.seoKeywords ? tour.seoKeywords.split(',').map((item) => item.trim()) : [])]),
    ];
    return Array.from(new Set(words.map((word) => word.trim()).filter((word) => word && word.length > 2))).slice(0, 12);
  }

  private generateTags(tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const category = this.getPrimaryCategory(tours) || 'Travel';
    return Array.from(new Set(['Travel', 'Tourism', destination, category, 'Vacation', 'Adventure', 'LexLuc Global'])).slice(0, 10);
  }

  private selectFeaturedImage(tours: TourSource[]) {
    return tours.find((tour) => tour.featuredImage)?.featuredImage || tours.find((tour) => tour.gallery?.[0])?.gallery?.[0] || '';
  }

  private getPrimaryTopic(tours: TourSource[]) {
    return this.getPrimaryDestination(tours) || tours[0]?.title || 'travel';
  }

  private getPrimaryDestination(tours: TourSource[]) {
    return tours[0]?.destination || '';
  }

  private getPrimaryCategory(tours: TourSource[]) {
    return tours[0]?.category || 'Travel';
  }

  private getOpeningSentence(tours: TourSource[], topic: string) {
    const firstTour = tours[0];
    if (firstTour?.shortDescription) return firstTour.shortDescription;
    if (firstTour?.description) return firstTour.description.slice(0, 260);
    return `${topic} offers travelers a practical blend of discovery, comfort, and carefully curated experiences.`;
  }

  private getToneLine(tone: BlogTone) {
    const lines: Record<BlogTone, string> = {
      [BlogTone.PROFESSIONAL]: 'This guide presents a professional overview of the destination, highlighting the details travelers should consider before booking.',
      [BlogTone.LUXURY]: 'This guide presents a refined view of the destination, emphasizing comfort, exclusivity, and memorable travel moments.',
      [BlogTone.INFORMATIVE]: 'This guide provides clear, practical information to help travelers understand what to expect and how to prepare.',
      [BlogTone.CONVERSATIONAL]: 'This guide keeps the planning process simple, friendly, and easy to follow for travelers comparing their options.',
      [BlogTone.CORPORATE]: 'This guide provides a structured overview for travelers and organizations seeking dependable, well-coordinated travel experiences.',
      [BlogTone.INSPIRATIONAL]: 'This guide highlights the inspiring moments, cultural discoveries, and lasting memories that make travel worthwhile.',
    };
    return lines[tone] || lines[BlogTone.PROFESSIONAL];
  }

  private getAudienceLine(audience: BlogTargetAudience) {
    return audience || BlogTargetAudience.TOURISTS;
  }

  private collectHighlights(tours: TourSource[]) {
    const highlights = tours.flatMap((tour) => tour.highlights || []);
    if (highlights.length > 0) return highlights;
    return tours.map((tour) => `${tour.title}: experience ${tour.destination} with curated travel planning and local insight.`);
  }

  private collectInclusions(tours: TourSource[]) {
    return Array.from(new Set(tours.flatMap((tour) => tour.inclusions || []))).slice(0, 10);
  }

  private collectItinerary(tours: TourSource[]) {
    return tours
      .flatMap((tour) => (Array.isArray(tour.itinerary) ? tour.itinerary : []))
      .map((item: any) => {
        if (typeof item === 'string') return item;
        if (item?.title && item?.description) return `Day ${item.day || ''}: ${item.title} - ${item.description}`;
        if (item?.title) return `Day ${item.day || ''}: ${item.title}`;
        return '';
      })
      .filter(Boolean)
      .slice(0, 8);
  }

  private createDestinationOverview(tours: TourSource[], topic: string) {
    const destination = this.getPrimaryDestination(tours) || topic;
    const priceText = tours.some((tour) => tour.price > 0)
      ? ` The selected options include pricing information that can help travelers compare value, inclusions, and available dates.`
      : '';
    return `${destination} is positioned as a destination for travelers who want a balanced mix of discovery, comfort, and reliable planning. ${priceText} By using tour titles, descriptions, highlights, itineraries, and available services as source material, this article keeps the recommendation relevant to real LexLuc Global offerings.`;
  }

  private createConclusion(tours: TourSource[], destination: string) {
    const firstTour = tours[0]?.title || 'the selected tour';
    return `A well-planned trip to ${destination} begins with the right information. ${firstTour} and the related tour data show how thoughtful planning, trusted guidance, and curated experiences can turn a travel idea into a confident booking decision.`;
  }

  private createExcerptFromHtml(content: string) {
    return this.stripHtml(content).replace(/\s+/g, ' ').trim().slice(0, 220);
  }

  private stripHtml(html: string) {
    return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private escapeHtml(value: string) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private normalizeSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'blog-post';
  }

  private parsePositiveInt(value: string | undefined, fallback: number) {
    const parsed = Number.parseInt(value || '', 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
}
