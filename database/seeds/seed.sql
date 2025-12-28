-- Example seed data for blog_db
USE `blog_db`;

-- Categories
INSERT INTO `categories` (`name`,`slug`,`description`) VALUES
('General','general','Bài viết tổng quan'),
('Programming','programming','Bài viết về lập trình'),
('Tutorials','tutorials','Hướng dẫn kỹ thuật');

-- Users (replace tokens below with bcrypt hashes before running or update later)
-- Generate bcrypt on your machine and replace 'BCRYPT_HASH_ADMIN' etc.
INSERT INTO `users` (`email`,`password_hash`,`full_name`,`role`) VALUES
('admin@example.com','BCRYPT_HASH_ADMIN','Administrator','admin'),
('user1@example.com','BCRYPT_HASH_USER1','User One','user');

-- Example posts (author_id refers to the above users' ids; update ids if necessary)
INSERT INTO `posts` (`author_id`,`category_id`,`title`,`slug`,`excerpt`,`content`,`status`,`published_at`) VALUES
(2,2,'Làm quen với React','lam-quen-voi-react','React basics','Nội dung bài viết về React...','published', NOW()),
(2,3,'Hướng dẫn cài đặt Node.js','huong-dan-cai-dat-node','Cài Node','Hướng dẫn cài Node.js ...','published', NOW());

-- Example comments
INSERT INTO `comments` (`post_id`,`user_id`,`content`) VALUES
(1,2,'Bài viết rất hữu ích, cảm ơn bạn!'),
(1,2,'Một bình luận khác.');
