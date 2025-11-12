# Posts CRUD Feature - Testing Guide

## Features Implemented

### Backend
- ✅ Database migration V2 (categories + posts tables)
- ✅ Domain models: Category, Post, PostStatus enum
- ✅ DTOs: CreatePostRequest, UpdatePostRequest, PostDto, PostListDto, CategoryDto
- ✅ Repositories: CategoryRepository, PostRepository with custom queries
- ✅ Services: CategoryService, PostService with slug generation
- ✅ Controllers: CategoryController, PostController with pagination

### Frontend
- ✅ WritePage: Markdown editor with SimpleMDE/EasyMDE
- ✅ DashboardPage: List user's posts with status filters
- ✅ Routes: /write, /dashboard (protected)
- ✅ Header: Added "My Posts" link in dropdown menu

## API Endpoints

### Categories
- `GET /api/categories` - Get all categories (public)
- `GET /api/categories/{id}` - Get category by ID (public)

### Posts
- `POST /api/posts` - Create post (authenticated)
- `PATCH /api/posts/{id}` - Update post (author only)
- `DELETE /api/posts/{id}` - Delete post (author only)
- `GET /api/posts/{id}` - Get post by ID (public)
- `GET /api/posts/slug/{slug}` - Get post by slug (public)
- `GET /api/posts` - Get published posts with pagination (public)
- `GET /api/posts/my-posts?status=DRAFT` - Get current user's posts (authenticated)

## Testing Instructions

### 1. Start Backend
```bash
cd server
./mvnw spring-boot:run
```

Flyway will automatically run V2 migration and create:
- `categories` table with 6 default categories
- `posts` table with proper indexes and foreign keys

### 2. Start Frontend
```bash
cd client
npm run dev
```

### 3. Test Flow

#### A. Create a Draft Post
1. Login with your account
2. Click "Write" button in header (or navigate to /write)
3. Enter title: "My First Post"
4. Select category (e.g., "Technology")
5. Write content in markdown editor
6. Click "Save Draft"
7. You'll be redirected to /dashboard

#### B. View My Posts Dashboard
1. Navigate to /dashboard (or click "My Posts" in user dropdown)
2. You should see your draft post listed
3. Filter by status: All / Published / Drafts / Archived
4. Note the status badge and metadata (views, date)

#### C. Publish a Post
1. Go to /write
2. Create a new post or edit existing draft
3. Click "Publish" instead of "Save Draft"
4. You'll be redirected to the post detail page (slug URL)
5. The `published_at` timestamp is set automatically

#### D. Edit a Post
1. From /dashboard, click the edit icon (pen) on any post
2. TODO: Create EditPostPage component (similar to WritePage)
3. Update title/content/category
4. Save changes

#### E. Delete a Post
1. From /dashboard, click the trash icon on any post
2. Confirm deletion in the alert dialog
3. Post is removed from database and UI updates

### 4. Authorization Testing

Try these scenarios to verify security:

**Test 1: Cannot edit others' posts**
- Login as User A, create a post
- Login as User B
- Try to PATCH /api/posts/{postId} (User A's post)
- Should get 401 or "Unauthorized" message

**Test 2: Draft posts are private**
- Create a draft post
- Logout or open incognito
- Try GET /api/posts (public endpoint)
- Draft should NOT appear in the list

**Test 3: Published posts are public**
- Create and publish a post
- Logout
- Navigate to / (home page)
- Published post should be visible

### 5. Database Verification

Check MySQL to see data:

```sql
-- View all categories
SELECT * FROM categories;

-- View all posts with author info
SELECT p.id, p.title, p.slug, p.status, u.username, c.name as category
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN categories c ON p.category_id = c.id;

-- View post by slug
SELECT * FROM posts WHERE slug = 'my-first-post';
```

### 6. Swagger Testing

1. Open http://localhost:8080/swagger-ui/index.html
2. Navigate to "Post" section
3. Try endpoints:
   - POST /api/posts (requires Bearer token)
   - GET /api/posts (public, with pagination params)
   - GET /api/posts/my-posts (requires Bearer token)

## Known Limitations

1. **Edit Post Page**: Not yet implemented. Currently can only delete from dashboard.
2. **Post Detail Page**: Route exists but page needs to be created to view full post with markdown rendering.
3. **Image Upload**: Cover image accepts URL only. File upload can be added later.
4. **Tags**: Not implemented yet (Phase 3).
5. **Search**: Not implemented yet (Phase 4).

## Next Steps

To complete the posts feature:
1. Create `EditPostPage.jsx` (similar to WritePage but loads existing post)
2. Create `PostDetailPage.jsx` (render markdown, show author, comments section)
3. Add route: `/post/:slug` → PostDetailPage
4. Add route: `/edit/:id` → EditPostPage
5. Update Home page to fetch and display published posts

## Troubleshooting

**Issue: "Category not found"**
- Run migration: `./mvnw flyway:migrate`
- Check categories table has data

**Issue: Slug collision**
- Service automatically appends `-1`, `-2` etc. to make unique
- Check `posts` table for existing slugs

**Issue: 401 Unauthorized**
- Verify JWT token in localStorage
- Check Authorization header in Network tab
- Token might be expired (1 hour lifetime)

**Issue: Markdown not rendering**
- SimpleMDE is for editing, not rendering
- For post detail page, use `react-markdown` or similar
