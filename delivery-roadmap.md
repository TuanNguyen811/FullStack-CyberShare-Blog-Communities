# Roadmap phát triển SyberShare

Tài liệu mô tả các giai đoạn triển khai, deliverable chính và tiêu chí nghiệm thu cho SyberShare. Mỗi giai đoạn bao gồm backend, frontend, database migration, Definition of Done (DoD) và chỉ dẫn test nhanh.

## Giai đoạn 0 – Khởi tạo & khung dự án

**Mục tiêu:** chạy được skeleton FE/BE/DB, có Swagger & healthcheck.

- **Backend**
  - Spring Boot modules: web, security, validation, JPA, MySQL driver, Flyway.
  - Cấu hình profiles `dev` và `prod`; bật CORS mở cho domain FE dev.
  - Swagger/OpenAPI UI tại `/swagger-ui`.
  - Health check qua `/actuator/health` (Spring Actuator).
- **Frontend**
  - React + Vite + TailwindCSS + React Router.
  - Layout cơ bản (Header + Content), trang 404.
- **DB Migration**
  - `V1__users_auth_basics.sql`: bảng `users`, `oauth_accounts`, `refresh_tokens`, `password_resets`.
- **Definition of Done**
  - `GET /actuator/health` trả về `UP`.
  - Swagger UI hiển thị danh sách API mẫu.
  - FE render trang “Hello SyberShare”.
- **Test nhanh**
  - Postman ping `/actuator/health`.
  - FE gọi GET `/actuator/health` và hiển thị status.

## Giai đoạn 1 – Xác thực & Hồ sơ (Auth)

**Mục tiêu:** đăng ký/đăng nhập/refresh/logout; xem/sửa hồ sơ.

- **Backend**
  - Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/forgot-password`, `/auth/reset-password`.
  - Người dùng: `/users/me [GET|PATCH]`, `/users/me/password [PATCH]`.
  - Sử dụng JWT access + refresh token, mật khẩu BCrypt.
- **Frontend**
  - Pages: `/login`, `/register`, `/forgot-password`, `/reset-password`.
  - Trang Profile: xem + cập nhật tên, avatar, bio.
  - Route guard: chưa đăng nhập thì redirect `/login`.
- **DB Migration**
  - Dùng schema từ `V1`.
- **Definition of Done**
  - Đăng ký và đăng nhập hoàn tất; refresh token hoạt động; đổi mật khẩu thành công.
- **Test**
  - E2E: đăng ký → login → gọi `/users/me` nhận thông tin chính xác.

## Giai đoạn 2 – Bài viết cơ bản (Posts CRUD)

**Mục tiêu:** tạo/sửa/xóa bài (tác giả), xem chi tiết & danh sách công khai.

- **Backend**
  - Migration `V2__categories_posts.sql`: bảng `categories`, `posts`.
  - API:
    - `POST /posts` (ROLE_AUTHOR trở lên).
    - `PATCH /posts/:id`, `DELETE /posts/:id` (tác giả sở hữu hoặc ADMIN).
    - `GET /posts?status=PUBLISHED&page=..&size=..&sort=publishedAt,desc`.
    - `GET /posts/:slug`.
- **Frontend**
  - `/editor` (Markdown cơ bản), `/dashboard` (My Posts).
  - `/` (Home) hiển thị bài PUBLISHED; `/post/:slug` trang chi tiết.
- **Definition of Done**
  - Tạo và xuất bản 1 bài; bài xuất hiện ở Home và trang chi tiết.
- **Test**
  - Unit validation DTO backend.
  - Frontend form kiểm tra `title` ≥ 3 ký tự.

## Giai đoạn 3 – Tags & Comments + Likes/Bookmarks

**Mục tiêu:** tương tác cơ bản (không realtime) tạo cảm giác mạng xã hội.

- **Backend**
  - Migration `V3__tags_comments_interactions.sql`: `tags`, `post_tags`, `comments`, `likes`, `bookmarks`.
  - API:
    - Tags: `GET /tags?query=..`.
    - Comments: `GET /posts/:slug/comments`, `POST /posts/:id/comments`, `PATCH|DELETE /comments/:id`.
    - Likes: `POST|DELETE /posts/:id/like`.
    - Bookmarks: `POST|DELETE /posts/:id/bookmark`, `GET /me/bookmarks`.
- **Frontend**
  - Post Detail: tab/section Comments dạng cây, nút Like/Bookmark (optimistic UI).
  - `/bookmarks` hiển thị bài đã lưu.
- **Definition of Done**
  - Comment/reply hoạt động; đếm comment/like/bookmark cập nhật đúng.
- **Test**
  - Không thể like 2 lần cùng bài.
  - Xóa comment cha xóa luôn nhánh con (backend test).

## Giai đoạn 4 – Explore/Search + Home/Trending

**Mục tiêu:** tìm kiếm full-text & khám phá nội dung.

- **Backend**
  - Migration `V4__fulltext_search.sql`: fulltext index trên `posts(title, content_md, content_html)`.
  - API:
    - `GET /search?q=...&page=..`.
    - `GET /trending?window=7d` (điểm = views + likes*3 + comments*5 tạm tính ở service).
- **Frontend**
  - `/explore`: thanh search + filter category/tag.
  - Home bổ sung tab “Trending 7 ngày”.
- **Definition of Done**
  - Tìm kiếm tiêu đề/nội dung chính xác; endpoint Trending trả dữ liệu hợp lý.
- **Test**
  - Search từ khóa “android” trả kết quả chứa từ khóa.
  - `/explore` phân trang ổn định.

## Giai đoạn 5 – Follow & Notifications (polling)

**Mục tiêu:** theo dõi tác giả, thông báo cơ bản bằng polling 30–60s.**

- **Backend**
  - Migration `V5__follows_notifications.sql`: bảng `follows`, `notifications`.
  - API:
    - Follow: `POST|DELETE /follows/:username`, `GET /users/:username/followers`, `GET .../following`.
    - Notifications: `GET /notifications?onlyUnread=true&page=..`, `POST /notifications/:id/read`, `POST /notifications/read-all`.
  - Phát sinh notification khi: like, comment, follow, bài được admin approve/reject.
- **Frontend**
  - Trang tác giả `/author/:username`: nút Follow, danh sách bài của tác giả.
  - Bell icon với badge số lượng chưa đọc; trang `/notifications`.
- **Definition of Done**
  - Follow thành công; notification tạo khi có like/comment và hiển thị ở FE.
- **Test**
  - User A like bài của User B ⇒ B nhận đúng 1 notification mới.

## Giai đoạn 6 – Admin & Moderation

**Mục tiêu:** bảng điều khiển quản trị và quy trình duyệt/ẩn nội dung.**

- **Backend**
  - Migration `V6__moderation.sql`: bảng `moderation_actions`.
  - API:
    - Admin Users: list/filter, lock/unlock, đổi role.
    - Admin Posts: list theo status (`PENDING/HIDDEN`), `POST /admin/posts/:id/moderate` (APPROVE/REJECT/HIDE/UNHIDE/EDIT).
- **Frontend**
  - `/admin`: bảng Users, Posts, Categories/Tags.
  - UI duyệt bài từ Pending → Published; hiển thị lý do reject cho tác giả.
- **Definition of Done**
  - Tài khoản ADMIN duyệt/ẩn bài hoạt động, log moderation lưu đúng.
- **Test**
  - AUTHOR không thể duyệt bài người khác; ADMIN có thể.

## Giai đoạn 7 – Chất lượng & Bảo mật

**Mục tiêu:** củng cố chất lượng trước khi mở public.**

- **Backend**
  - Áp dụng `@Valid` cho mọi DTO, format lỗi thống nhất.
  - Rate limit (bucket4j) cho `/auth`, `/comments`, `/likes`.
  - Logging chuẩn + traceId; hỗ trợ Micrometer/Prometheus (nếu khả dụng).
- **Frontend**
  - ErrorBoundary, retry logic, toast thống nhất.
- **Hạ tầng**
  - Docker Compose (api + mysql + adminer).
  - CI chạy unit/integration test + Flyway migrate.
- **Definition of Done**
  - 0 critical bug; test xanh; rate-limit hoạt động.
- **Test**
  - k6 load test 100–200 RPS trong 1–2 phút để phát hiện N+1 hoặc nghẽn kết nối DB.

---

Tài liệu này cùng với `SRS.md` và `database-design.md` tạo thành bộ khung triển khai, giúp đội ngũ phân bổ sprint, ưu tiên migration và đảm bảo mỗi giai đoạn có tiêu chí nghiệm thu rõ ràng.

