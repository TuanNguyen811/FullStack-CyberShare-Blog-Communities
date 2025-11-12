Thiết kế Schema Database
1. Bảng users

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	ID định danh.
username	VARCHAR(50)	UNIQUE, NOT NULL	Tên đăng nhập.
email	VARCHAR(255)	UNIQUE, NOT NULL	Email.
password_hash	VARCHAR(255)	NOT NULL	Mật khẩu đã hash.
display_name	VARCHAR(100)	NOT NULL	Tên hiển thị.
bio	TEXT		Tiểu sử ngắn.
avatar_url	VARCHAR(255)		URL ảnh đại diện.
role	VARCHAR(20)	NOT NULL, DEFAULT 'USER'	Vai trò (USER, AUTHOR, ADMIN).
status	VARCHAR(20)	NOT NULL, DEFAULT 'ACTIVE'	Trạng thái (ACTIVE, INACTIVE, BANNED).
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian tạo.
updated_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP	Thời gian cập nhật.
2. Bảng categories

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	ID định danh.
name	VARCHAR(100)	UNIQUE, NOT NULL	Tên danh mục.
slug	VARCHAR(100)	UNIQUE, NOT NULL	Slug thân thiện với URL.
description	TEXT		Mô tả (tùy chọn).
3. Bảng posts

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	ID định danh.
author_id	BIGINT	NOT NULL, FOREIGN KEY (users.id)	Tác giả bài viết.
category_id	BIGINT	FOREIGN KEY (categories.id)	Danh mục chính.
title	VARCHAR(255)	NOT NULL	Tiêu đề.
slug	VARCHAR(255)	UNIQUE, NOT NULL	Slug thân thiện với URL.
content	LONGTEXT		Nội dung bài viết.
cover_image_url	VARCHAR(255)		URL ảnh bìa.
status	VARCHAR(20)	NOT NULL, DEFAULT 'DRAFT'	Trạng thái (DRAFT, PENDING_REVIEW, PUBLISHED, ARCHIVED).
views	BIGINT	DEFAULT 0	Lượt xem.
published_at	TIMESTAMP		Thời gian xuất bản.
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian tạo.
updated_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP	Thời gian cập nhật.
4. Bảng tags

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	ID định danh.
name	VARCHAR(50)	UNIQUE, NOT NULL	Tên thẻ.
slug	VARCHAR(50)	UNIQUE, NOT NULL	Slug thân thiện với URL.
5. Bảng post_tags (Bảng nối)

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
post_id	BIGINT	PRIMARY KEY, FOREIGN KEY (posts.id)	Khóa ngoại tới posts.
tag_id	BIGINT	PRIMARY KEY, FOREIGN KEY (tags.id)	Khóa ngoại tới tags.
6. Bảng comments

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	ID định danh.
post_id	BIGINT	NOT NULL, FOREIGN KEY (posts.id)	Bài viết chứa bình luận.
author_id	BIGINT	NOT NULL, FOREIGN KEY (users.id)	Tác giả bình luận.
parent_id	BIGINT	FOREIGN KEY (comments.id)	Dành cho bình luận lồng nhau.
content	TEXT	NOT NULL	Nội dung bình luận.
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian tạo.
updated_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP	Thời gian cập nhật.
7. Bảng likes

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
user_id	BIGINT	PRIMARY KEY, FOREIGN KEY (users.id)	Người dùng đã thích.
post_id	BIGINT	PRIMARY KEY, FOREIGN KEY (posts.id)	Bài viết được thích.
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian thích.
8. Bảng bookmarks

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
user_id	BIGINT	PRIMARY KEY, FOREIGN KEY (users.id)	Người dùng đã lưu.
post_id	BIGINT	PRIMARY KEY, FOREIGN KEY (posts.id)	Bài viết được lưu.
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian lưu.
9. Bảng follows

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
follower_id	BIGINT	PRIMARY KEY, FOREIGN KEY (users.id)	Người theo dõi.
following_id	BIGINT	PRIMARY KEY, FOREIGN KEY (users.id)	Người được theo dõi.
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian theo dõi.
10. Bảng notifications

Cột	Kiểu dữ liệu	Ràng buộc	Mô tả
id	BIGINT	PRIMARY KEY, AUTO_INCREMENT	ID định danh.
receiver_id	BIGINT	NOT NULL, FOREIGN KEY (users.id)	Người nhận thông báo.
sender_id	BIGINT	FOREIGN KEY (users.id)	Người gửi thông báo (tùy chọn).
type	VARCHAR(50)	NOT NULL	Loại thông báo (NEW_COMMENT, NEW_LIKE, NEW_FOLLOWER).
reference_id	BIGINT		ID của đối tượng liên quan.
is_read	BOOLEAN	NOT NULL, DEFAULT FALSE	Đã đọc hay chưa.
created_at	TIMESTAMP	DEFAULT CURRENT_TIMESTAMP	Thời gian tạo.
Bây giờ, tôi sẽ tạo các file migration Flyway tương ứng, bắt đầu với V1__create_initial_schema.sql.