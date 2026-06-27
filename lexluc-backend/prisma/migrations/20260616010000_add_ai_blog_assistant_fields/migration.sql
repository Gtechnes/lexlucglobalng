-- AddBlogPostStatusEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- AddAiBlogAssistantFields
ALTER TABLE "blog_posts"
  ADD COLUMN "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
  ADD COLUMN "scheduledFor" TIMESTAMP(3),
  ADD COLUMN "aiGenerated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "sourceTourIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "lastAutosavedAt" TIMESTAMP(3),
  ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "likes" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "shares" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "commentsCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "seoKeywords" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "blog_posts"
SET
  "status" = CASE WHEN "isPublished" THEN 'PUBLISHED'::"BlogPostStatus" ELSE 'DRAFT'::"BlogPostStatus" END,
  "publishedAt" = COALESCE("publishedAt", CASE WHEN "isPublished" THEN "createdAt" ELSE NULL END);

CREATE INDEX "blog_posts_status_idx" ON "blog_posts"("status");
CREATE INDEX "blog_posts_scheduledFor_idx" ON "blog_posts"("scheduledFor");
CREATE INDEX "blog_posts_views_idx" ON "blog_posts"("views");
