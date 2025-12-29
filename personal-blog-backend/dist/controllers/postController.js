"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listPosts = listPosts;
exports.getPostBySlug = getPostBySlug;
exports.createPost = createPost;
exports.updatePost = updatePost;
exports.deletePost = deletePost;
exports.savePost = savePost;
exports.unsavePost = unsavePost;
exports.getSavedPosts = getSavedPosts;
const prisma_1 = __importDefault(require("../lib/prisma"));
// GET /api/posts
async function listPosts(req, res) {
    try {
        const { page = '1', limit = '10', search = '', category } = req.query;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (pageNum - 1) * limitNum;
        const where = { published: true };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (category) {
            where.category = { name: category };
        }
        const [posts, total] = await Promise.all([
            prisma_1.default.post.findMany({
                where,
                include: {
                    author: { select: { id: true, email: true, displayName: true } },
                    category: { select: { id: true, name: true, slug: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.default.post.count({ where }),
        ]);
        res.json({ posts, total, page: pageNum, limit: limitNum });
    }
    catch (error) {
        console.error('List posts error:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy danh sách bài viết' });
    }
}
// GET /api/posts/:slug
async function getPostBySlug(req, res) {
    try {
        const { slug } = req.params;
        if (!slug) {
            return res.status(400).json({ error: 'Slug là bắt buộc' });
        }
        const post = await prisma_1.default.post.findUnique({
            where: { slug },
            include: {
                author: { select: { id: true, email: true, displayName: true } },
                category: { select: { id: true, name: true, slug: true } },
                comments: true,
                likes: true,
            },
        });
        if (!post) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }
        res.json({ post });
    }
    catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy bài viết' });
    }
}
// POST /api/posts (protected)
async function createPost(req, res) {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Không xác thực' });
        const { title, content, description, image, categoryId, published = true, slug } = req.body;
        if (!title || !content)
            return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
        const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const post = await prisma_1.default.post.create({
            data: {
                title,
                content,
                slug: finalSlug,
                published: !!published,
                author: { connect: { id: user.userId } },
                category: categoryId ? { connect: { id: categoryId } } : undefined,
                ...(image && { image }),
            },
        });
        res.status(201).json({ post });
    }
    catch (error) {
        console.error('Create post error:', error);
        if (error.code === 'P2002')
            return res.status(400).json({ error: 'Slug đã tồn tại' });
        res.status(500).json({ error: 'Lỗi server khi tạo bài viết' });
    }
}
// PUT /api/posts/:id (protected)
async function updatePost(req, res) {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Không xác thực' });
        const postId = parseInt(req.params.id || '0', 10);
        if (isNaN(postId))
            return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        const { title, content, image, categoryId, published } = req.body;
        const post = await prisma_1.default.post.update({
            where: { id: postId },
            data: {
                title,
                content,
                published,
                category: categoryId ? { connect: { id: categoryId } } : undefined,
                ...(image !== undefined && { image }),
            },
        });
        res.json({ post });
    }
    catch (error) {
        console.error('Update post error:', error);
        res.status(500).json({ error: 'Lỗi server khi cập nhật bài viết' });
    }
}
// DELETE /api/posts/:id (protected)
async function deletePost(req, res) {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ error: 'Không xác thực' });
        const postId = parseInt(req.params.id || '0', 10);
        if (isNaN(postId))
            return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        await prisma_1.default.post.delete({ where: { id: postId } });
        res.json({ message: 'Xóa bài viết thành công' });
    }
    catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ error: 'Lỗi server khi xóa bài viết' });
    }
}
// POST /api/posts/:id/save - Save a post
async function savePost(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
        }
        const postId = parseInt(req.params.id || '0', 10);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        }
        // Check if post exists
        const post = await prisma_1.default.post.findUnique({ where: { id: postId } });
        if (!post) {
            return res.status(404).json({ error: 'Bài viết không tồn tại' });
        }
        // Check if already saved
        const existing = await prisma_1.default.savedPost.findUnique({
            where: { postId_userId: { postId, userId } },
        });
        if (existing) {
            return res.status(400).json({ error: 'Bài viết đã được lưu' });
        }
        const saved = await prisma_1.default.savedPost.create({
            data: { postId, userId },
            include: {
                post: {
                    include: {
                        author: { select: { id: true, email: true, displayName: true } },
                        category: { select: { id: true, name: true, slug: true } },
                    },
                },
            },
        });
        res.json({ message: 'Lưu bài viết thành công', saved });
    }
    catch (error) {
        console.error('Save post error:', error);
        res.status(500).json({ error: 'Lỗi server khi lưu bài viết' });
    }
}
// DELETE /api/posts/:id/save - Unsave a post
async function unsavePost(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
        }
        const postId = parseInt(req.params.id || '0', 10);
        if (isNaN(postId)) {
            return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
        }
        await prisma_1.default.savedPost.deleteMany({
            where: { postId, userId },
        });
        res.json({ message: 'Bỏ lưu bài viết thành công' });
    }
    catch (error) {
        console.error('Unsave post error:', error);
        res.status(500).json({ error: 'Lỗi server khi bỏ lưu bài viết' });
    }
}
// GET /api/posts/saved - Get all saved posts for current user
async function getSavedPosts(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
        }
        const { page = '1', limit = '10' } = req.query;
        const pageNum = Math.max(parseInt(page, 10) || 1, 1);
        const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
        const skip = (pageNum - 1) * limitNum;
        const [savedPosts, total] = await Promise.all([
            prisma_1.default.savedPost.findMany({
                where: { userId },
                include: {
                    post: {
                        include: {
                            author: { select: { id: true, email: true, displayName: true } },
                            category: { select: { id: true, name: true, slug: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum,
            }),
            prisma_1.default.savedPost.count({ where: { userId } }),
        ]);
        res.json({ posts: savedPosts.map(s => s.post), total, page: pageNum, limit: limitNum });
    }
    catch (error) {
        console.error('Get saved posts error:', error);
        res.status(500).json({ error: 'Lỗi server khi lấy bài viết đã lưu' });
    }
}
//# sourceMappingURL=postController.js.map