# TÀI LIỆU ĐẶC TẢ YÊU CẦU HỆ THỐNG (SRS)

## 1. Giới thiệu

### 1.1 Thông tin chung
- **Tên dự án:** SyberShare Platform – Website Blog Mạng Xã Hội Đa Người Dùng.
- **Mô tả ngắn:** Hệ thống cho phép người dùng đăng tải, chia sẻ, tương tác với bài viết và xây dựng cộng đồng thông qua cơ chế theo dõi, bình luận, thông báo và đề xuất nội dung.

### 1.2 Mục tiêu
- Cung cấp trải nghiệm blog hiện đại, thân thiện trên cả desktop và mobile.
- Đảm bảo an toàn dữ liệu, phân quyền rõ ràng giữa các loại người dùng.
- Thiết kế mở để dễ tích hợp thuật toán đề xuất, dịch vụ AI và mở rộng sang mobile app.

### 1.3 Phạm vi
- Nền tảng web responsive (desktop/mobile) với frontend ReactJS + Tailwind/Shadcn và backend Spring Boot REST API.
- Quản lý người dùng, bài viết, danh mục, thẻ, tương tác xã hội và thông báo thời gian thực.
- Hỗ trợ triển khai container hóa với Docker, Nginx reverse proxy và lưu trữ nội dung trên cloud storage.

## 2. Đối tượng người dùng

| Loại người dùng | Quyền hạn chính |
| --- | --- |
| Khách (Guest) | Duyệt bài công khai, đăng ký tài khoản. |
| Người dùng (User) | Đọc, thích, bình luận, lưu bài viết. |
| Tác giả (Author) | Tất cả quyền của User + soạn, xuất bản, quản lý bài viết cá nhân. |
| Quản trị viên (Admin) | Quản lý người dùng, duyệt nội dung, quản lý danh mục/thẻ, thống kê hệ thống. |

## 3. Kiến trúc hệ thống

- **Frontend:** ReactJS (Vite), TailwindCSS, Shadcn UI.
- **Backend:** Spring Boot, Spring Security, MapStruct, JWT...
- **Database:** MySQL hoặc PostgreSQL (JPA/Hibernate).
- **Authentication:** JWT Access + Refresh token, OAuth2 Google sign-in.
- **Storage:** AWS S3 hoặc Supabase Storage cho hình ảnh/asset.
- **Triển khai:** Dockerized services + Nginx reverse proxy + CI/CD.
- **Mở rộng:** Recommendation Engine độc lập (Python Flask/TensorFlow hoặc module Java), chatbot AI qua API.

## 4. Yêu cầu chức năng

### 4.1 Quản lý tài khoản & hồ sơ
- **FR-ACC-01:** Người dùng đăng ký bằng email/password hoặc Google OAuth2.
- **FR-ACC-02:** Mật khẩu lưu trữ dạng bcrypt hash; bắt buộc xác minh email khi quên/đặt lại mật khẩu.
- **FR-ACC-03:** Đăng nhập/đăng xuất bằng JWT access token + refresh token; token refresh tự động trước khi hết hạn.
- **FR-ACC-04:** Người dùng cập nhật ảnh đại diện, tên hiển thị, bio, thông tin liên hệ.
- **FR-ACC-05:** Username được tạo tự động từ email, có thể thay đổi nếu chưa tồn tại trong hệ thống.

### 4.2 Quản lý bài viết
- **FR-POST-01:** Tác giả soạn thảo bằng Markdown hoặc Rich Text (TipTap/QuillJS), cho phép chèn ảnh, code snippet.
- **FR-POST-02:** Trạng thái bài viết: Draft, Pending Review, Published, Archived; hỗ trợ lưu nháp và tiếp tục chỉnh sửa.
- **FR-POST-03:** Trang Post Detail hiển thị nội dung, lượt xem, tác giả, thời gian đăng, tags, bình luận dạng luồng.
- **FR-POST-04:** Mục “My Posts” lọc theo trạng thái và cho phép chỉnh sửa/xóa bài thuộc quyền sở hữu.

### 4.3 Danh mục & thẻ
- **FR-CAT-01:** Admin CRUD danh mục và thẻ (category, tag).
- **FR-CAT-02:** Tác giả chọn 1 danh mục chính và nhiều thẻ khi đăng bài.
- **FR-CAT-03:** Người dùng duyệt bài theo danh mục hoặc thẻ, có phân trang và sort mặc định.

### 4.4 Tương tác người dùng
- **FR-SOC-01:** Bình luận dạng cây 2 cấp (comment/reply) với quyền chỉnh sửa/xóa của chủ comment trong giới hạn thời gian.
- **FR-SOC-02:** Người dùng có thể thích (Like/Clap) bài viết một lần, có thể bỏ thích.
- **FR-SOC-03:** Bookmark lưu bài viết vào danh sách riêng tư, đồng bộ realtime với backend.
- **FR-SOC-04:** Cơ chế Follow/Unfollow tác giả; feed cập nhật bài mới từ tác giả đã theo dõi.

### 4.5 Hệ thống thông báo
- **FR-NOTI-01:** Notification được tạo khi có lượt thích, bình luận, follow mới hoặc khi bài viết được duyệt/từ chối.
- **FR-NOTI-02:** Thông báo gồm: `id, receiver_id, type, content, reference_id, is_read, created_at`.
- **FR-NOTI-03:** Cập nhật realtime qua WebSocket (hoặc long polling fallback); trạng thái đọc đồng bộ giữa client và server.

### 4.6 Khám phá nội dung
- **FR-DISC-01:** Trang chủ hiển thị bài mới nhất, nổi bật và gợi ý từ hệ thống đề xuất.
- **FR-DISC-02:** Trang Trending dựa trên tổng hợp lượt xem, thích và tương tác trong 7 ngày gần nhất.
- **FR-DISC-03:** Gợi ý bài tương tự dựa trên tags, tác giả theo dõi, lịch sử bookmark/đọc.
- **FR-DISC-04:** Tìm kiếm toàn văn (full-text) theo tiêu đề, nội dung, tác giả, tags.

### 4.7 Quản trị hệ thống
- **FR-ADM-01:** Admin đăng nhập riêng với 2FA tùy chọn.
- **FR-ADM-02:** Quản lý người dùng: danh sách, khóa/mở khóa, gán vai trò, chỉnh sửa profile.
- **FR-ADM-03:** Duyệt bài viết chờ, chỉnh sửa hoặc ẩn/xóa nội dung vi phạm.
- **FR-ADM-04:** Thống kê tổng quan: số người dùng, bài viết, lượt xem, top trending theo khoảng thời gian.

### 4.8 Chức năng nâng cao
- **FR-ADV-01:** Chatbot AI theo ngữ cảnh bài viết (tích hợp API bên thứ ba).
- **FR-ADV-02:** Recommendation Engine (content-based + collaborative filtering) dựa trên lịch sử đọc, bookmark, tags quan tâm.
- **FR-ADV-03:** SEO-friendly URL (slug), metadata động (OpenGraph/Twitter Cards), caching cho bài phổ biến.

## 5. Yêu cầu phi chức năng

- **NFR-Bảo mật:** CSRF protection, chống XSS, giới hạn rate API, refresh token rotation, phân quyền REST bằng role-based ACL.
- **NFR-Hiệu năng:** Trang chủ tải < 3s với 90% lượng truy cập; API phản hồi < 500ms với 95th percentile; hỗ trợ cache Redis.
- **NFR-Mở rộng:** Thiết kế microservice-ready; backend stateless để scale ngang; storage CDN để giảm latency.
- **NFR-Tính sẵn sàng:** Triển khai tối thiểu 2 replica backend; backup DB hàng ngày; theo dõi bằng Prometheus/Grafana.
- **NFR-Khả dụng:** UI responsive, hỗ trợ dark mode, tuân thủ tiêu chuẩn truy cập WCAG mức AA.
- **NFR-Logging & Audit:** Ghi nhật ký hành động quan trọng (đăng nhập, thay đổi quyền, duyệt bài) và lưu trữ tối thiểu 90 ngày.

## 6. Mô hình dữ liệu chính

- `users`: id, email, password_hash, username, display_name, bio, avatar_url, role, status, created_at, updated_at.
- `posts`: id, author_id, title, slug, content, cover_image, status, views, published_at, created_at, updated_at.
- `categories`, `tags`, `post_tags`.
- `comments`: id, post_id, author_id, parent_id, content, status, created_at.
- `likes`, `bookmarks`, `follows`: lưu quan hệ người dùng-bài viết/tác giả.
- `notifications`: id, receiver_id, type, content, reference_id, is_read, created_at.

## 7. Quy trình nghiệp vụ chính (Use Case tóm tắt)

1. **Đăng ký/Giữ phiên:** Guest cung cấp email/password → hệ thống gửi email xác nhận → kích hoạt tài khoản → login phát hành JWT.
2. **Soạn & duyệt bài:** Author viết bài → lưu nháp → gửi duyệt → Admin kiểm tra và phê duyệt/ghi lý do từ chối → bài published hiển thị công khai.
3. **Tương tác:** User đọc bài → thích/bình luận/bookmark → tác giả nhận notification realtime → có thể trả lời hoặc ẩn bình luận vi phạm.
4. **Đề xuất nội dung:** Service phân tích lịch sử đọc/bookmark/tags → ghi điểm relevance → FE hiển thị gợi ý trong trang home/trending/post detail.

## 8. Tiêu chí hoàn thành & kết quả mong đợi

- Nền tảng vận hành đầy đủ các luồng đăng ký, đăng bài, tương tác và quản trị tương đương phiên bản rút gọn của Medium.
- Hệ thống sẵn sàng triển khai production với Docker + Nginx, CI/CD, logging/monitoring cơ bản.
- Có nền tảng để tích hợp mobile app hoặc mở rộng module recommendation/AI trong tương lai.

## 9. Tài nguyên & công nghệ đề xuất

| Thành phần | Công nghệ |
| --- | --- |
| Frontend | ReactJS, Vite, TailwindCSS, Shadcn UI |
| Backend | Spring Boot, Spring Security, MapStruct |
| Database/ORM | MySQL hoặc PostgreSQL + Hibernate/JPA |
| Authentication | JWT + Refresh Token, OAuth2 Google |
| Storage | AWS S3 hoặc Supabase Storage |
| Triển khai | Docker, Docker Compose, Nginx, CI/CD |
| Recommendation (Optional) | Python Flask hoặc Java module, TensorFlow |
| Editor | TipTap / QuillJS (Rich Text) |

