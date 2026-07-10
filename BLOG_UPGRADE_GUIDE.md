# Blog System Upgrade - Implementation Guide

## 🎉 Overview

Complete upgrade of the blog system with rich text editing, image uploads, categories, and content filtering. This guide covers all the changes made.

---

## ✅ What Was Implemented

### 1. **Rich Text Editor (TipTap)**
- **Location**: `src/components/admin/RichTextEditor.tsx`
- **Features**:
  - Bold, Italic, Underline formatting
  - Headings (H1, H2, H3)
  - Bullet & Numbered lists
  - Links (with URL prompt)
  - Images (upload + drag-drop)
  - Code blocks
  - Blockquotes
  - Undo/Redo
- **Content Format**: Stored as HTML in database
- **Image Upload**: Integrated with existing upload system

### 2. **Blog Categories System**
- **Backend**:
  - New `BlogCategory` model in Prisma
  - Category controller: `GET /categories`, `POST /categories`, `DELETE /categories/:id`
  - Category service with soft delete support
  - Module registered in AppModule

- **Frontend**:
  - `BlogCategory` type in `types/index.ts`
  - Categories API: `categoriesAPI`

### 3. **Content Filtering**
- **Backend**:
  - `findAllPublic()` now accepts optional `categoryId` parameter
  - Endpoint: `GET /blog/public?categoryId={id}`

- **Frontend**:
  - Public blog page has category filter pills
  - Clicking category reloads filtered posts
  - "All Posts" button to clear filter

### 4. **Admin Blog Enhancements**
- **Updated form fields**:
  - Category dropdown (populated from API)
  - Rich text editor replacing plain textarea
  - Featured image upload
  - Excerpt, meta title, meta description

- **Post listing**:
  - Shows category badge for each post
  - Shows publish status
  - Edit/Delete actions

### 5. **Public Blog Features**
- **Blog listing page** (`src/app/(public)/blog/page.tsx`):
  - Category filter with pills
  - Safe HTML rendering for excerpts
  - Loading and error states

- **Blog detail page** (`src/app/(public)/blog/[slug]/page.tsx`):
  - Full rich content display
  - Safe HTML rendering with DOMPurify
  - Category badge
  - Publication date
  - Back to blog link
  - Responsive prose styling

### 6. **Security - HTML Sanitization**
- **Utility**: `src/lib/sanitize.ts`
- **Library**: DOMPurify
- **Features**:
  - Prevents XSS attacks
  - Allows safe HTML tags for blog content
  - Sanitizes all user-generated HTML before rendering

---

## 📁 File Structure

### Backend Changes
```
src/categories/
  ├── categories.controller.ts
  ├── categories.service.ts
  ├── categories.module.ts
  └── dto/
      └── create-blog-category.dto.ts

src/blog/
  ├── dto/
  │   └── create-blog-post.dto.ts (updated)
  ├── blog.service.ts (updated - added filtering)
  └── blog.controller.ts (updated)

prisma/
  └── schema.prisma (updated - new BlogCategory model)

src/app.module.ts (updated - added CategoriesModule)
```

### Frontend Changes
```
src/components/admin/
  └── RichTextEditor.tsx (new)

src/app/(auth)/admin/
  └── blog/page.tsx (updated)

src/app/(public)/blog/
  ├── page.tsx (updated)
  └── [slug]/
      └── page.tsx (new detail page)

src/lib/
  ├── api.ts (updated - added categoriesAPI)
  ├── sanitize.ts (new - DOMPurify utilities)

src/types/
  └── index.ts (updated - added BlogCategory)

package.json (updated - added TipTap + DOMPurify)
```

---

## 🚀 How to Use

### For Content Managers (Admin)

#### Creating a Blog Post
1. Go to Admin → Blog Posts Management
2. Click "+ New Post"
3. Fill in the form:
   - **Title**: Post headline
   - **Slug**: URL-friendly name (auto-generated)
   - **Category**: Select from dropdown
   - **Featured Image**: Upload via image uploader
   - **Excerpt**: Short summary for listings
   - **Content**: Use the rich text editor
     - Write your content
     - Format with toolbar buttons
     - Insert images via drag-drop or click button
     - Add links by selecting text and clicking link button
   - **Meta Title/Description**: For SEO
   - **Publish**: Check to publish immediately
4. Click Create

#### Publishing Changes
- **As Draft**: Leave "Publish" unchecked
- **As Published**: Check "Publish" and save
- **Unpublishing**: Edit post and uncheck "Publish"

### For Blog Readers (Public)

#### Reading Blog Posts
1. Go to Blog page
2. See all published posts with:
   - Featured image
   - Category badge
   - Excerpt
   - Publication date
3. Click "Read more" to view full post
4. Filter by category using pills at the top

#### Filtering by Category
1. Click category pill to filter
2. Posts update to show only that category
3. Click "All Posts" to see everything again

---

## 🔧 API Endpoints

### Categories
```
GET    /api/v1/categories              # Get all categories
POST   /api/v1/categories              # Create category (admin only)
GET    /api/v1/categories/:id          # Get category by ID
GET    /api/v1/categories/slug/:slug   # Get category by slug
PATCH  /api/v1/categories/:id          # Update category (admin only)
DELETE /api/v1/categories/:id          # Soft delete (admin only)
```

### Blog Posts (Updated)
```
GET    /api/v1/blog/public?categoryId={id}  # Public posts (filterable)
GET    /api/v1/blog/admin                   # All posts (admin only)
POST   /api/v1/blog                         # Create post
GET    /api/v1/blog/:id                     # Get by ID
GET    /api/v1/blog/slug/:slug              # Get by slug
PATCH  /api/v1/blog/:id                     # Update post
DELETE /api/v1/blog/:id                     # Soft delete
```

---

## 📝 Data Models

### BlogCategory
```typescript
{
  id: string (UUID)
  name: string (unique)
  slug: string (unique)
  description?: string
  color?: string (hex color for UI)
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime (soft delete)
}
```

### BlogPost (Updated)
```typescript
{
  id: string (UUID)
  title: string
  slug: string (unique)
  content: string (HTML)
  excerpt?: string
  image?: string (featured image URL)
  categoryId?: string (UUID relation)
  category?: BlogCategory (relation)
  isPublished: boolean
  publishedAt?: DateTime
  metaTitle?: string
  metaDescription?: string
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt?: DateTime (soft delete)
}
```

---

## 🔒 Security Features

### HTML Sanitization
- **DOMPurify** sanitizes all user-generated HTML before rendering
- **Safe tags allowed**: p, br, strong, em, u, h1-h6, ul, ol, li, a, img, blockquote, code, pre, div, span
- **Safe attributes**: href, src, alt, title, target, rel, class
- **Prevents XSS attacks** from malicious content

### Access Control
- Category endpoints: Restricted to CONTENT_MANAGER and SUPER_ADMIN roles
- Public blog pages: No authentication required
- Admin pages: JWT authentication + role-based access

---

## 🎯 Key Features

✅ Medium-style rich text editor  
✅ Image uploads inside content (drag-drop support)  
✅ Blog categories system  
✅ Category-based filtering  
✅ Safe HTML rendering (XSS prevention)  
✅ Admin category management  
✅ Soft delete for posts and categories  
✅ SEO-friendly slugs and metadata  
✅ Responsive design  
✅ Pagination ready (structure in place)  

---

## 🔄 Migration Notes

### From Old to New
1. Old `category` string field → New `categoryId` UUID field
2. Plain text content → Now supports HTML/rich formatting
3. Textarea editor → TipTap rich text editor
4. Categories dropdown → Fetched from Categories API

### Backward Compatibility
- Existing posts without category still work (`categoryId` is nullable)
- Existing plain text content still displays (as plain text)
- Old API still works but deprecated

---

## 📦 Dependencies Added

### Frontend
- `@tiptap/react` - Rich text editor framework
- `@tiptap/extension-*` - Editor extensions for formatting
- `dompurify` - HTML sanitization

### Already Included
- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS

---

## 🧪 Testing Checklist

- [ ] Create category in admin
- [ ] Create blog post with rich content
- [ ] Upload image inside editor
- [ ] Publish post
- [ ] View post on public page
- [ ] Filter by category
- [ ] Verify HTML renders correctly
- [ ] Test XSS prevention (paste malicious HTML)
- [ ] Edit existing post
- [ ] Delete category
- [ ] Check responsive design on mobile

---

## 📚 Next Steps (Optional Enhancements)

1. **Draft Autosave**: Save draft every 30 seconds
2. **Image Gallery**: Browse uploaded images instead of uploading new ones
3. **SEO Preview**: Show how post appears in search results
4. **Reading Time**: Calculate and display estimated reading time
5. **Related Posts**: Show similar posts by category
6. **Comments**: Add comment system for readers
7. **Scheduled Publishing**: Schedule posts for future publication
8. **Analytics**: Track post views and engagement

---

## ⚠️ Important Notes

- Always sanitize user input on the backend in production
- Test rich content with various HTML structures
- Monitor file uploads for malicious content
- Regular database backups before major schema changes
- Consider pagination for large blog post collections

---

## 🆘 Troubleshooting

### Rich editor not appearing?
- Ensure TipTap dependencies are installed: `npm install`
- Check browser console for errors

### Images not uploading?
- Verify upload API endpoint is accessible
- Check file size limits
- Ensure auth token is valid

### Categories not loading?
- Check Categories API endpoint
- Verify JWT auth if required
- Check browser Network tab

### HTML not rendering?
- Check DOMPurify is imported correctly
- Verify `dangerouslySetInnerHTML` is used
- Check console for sanitization warnings

---

Generated: May 26, 2026
