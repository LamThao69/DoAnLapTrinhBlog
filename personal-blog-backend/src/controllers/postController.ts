import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

// GET /api/posts
export async function listPosts(req: AuthRequest, res: Response) {
  try {
    const { page = '1', limit = '10', search = '', category } = req.query as any;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { published: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) {
      where.category = { name: category };
    }

    const [postsData, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, email: true, displayName: true } },
          category: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.post.count({ where }),
    ]);

    let savedPostIds = new Set<number>();
    const userId = req.user?.userId;

    if (userId && postsData.length > 0) {
      const postIds = postsData.map(p => p.id);
      const saved = await prisma.savedPost.findMany({
        where: {
          userId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      savedPostIds = new Set(saved.map(s => s.postId));
    }

    const posts = postsData.map(post => ({
      ...post,
      isSaved: savedPostIds.has(post.id),
    }));

    res.json({ posts, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('List posts error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách bài viết' });
  }
}

// GET /api/posts/:slug
export async function getPostBySlug(req: AuthRequest, res: Response) {
  try {
    const { slug } = req.params;
    if (!slug) {
      return res.status(400).json({ error: 'Slug là bắt buộc' });
    }
    const postData = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, email: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
        comments: true,
        likes: true,
      },
    });

    if (!postData) {
      return res.status(404).json({ error: 'Không tìm thấy bài viết' });
    }

    let isSaved = false;
    const userId = req.user?.userId;
    if (userId) {
      const saved = await prisma.savedPost.findUnique({
        where: {
          postId_userId: {
            postId: postData.id,
            userId,
          },
        },
      });
      if (saved) {
        isSaved = true;
      }
    }

    const post = {
      ...postData,
      isSaved,
    };

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy bài viết' });
  }
}

// POST /api/posts (protected)
export async function createPost(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Không xác thực' });

    console.log('Creating post with body:', req.body);
    console.log('User:', user);

    const { title, content, description, image, categoryId, published = true, slug } = req.body as any;

    if (!title || !content) {
      console.log('Missing title or content');
      return res.status(400).json({ error: 'Tiêu đề và nội dung là bắt buộc' });
    }

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    console.log('Generated slug:', finalSlug);

    const postData: any = {
      title,
      content,
      slug: finalSlug,
      published: !!published,
      author: { connect: { id: user.userId } },
    };

    if (description) postData.description = description;
    if (image) postData.image = image;
    if (categoryId) postData.category = { connect: { id: categoryId } };

    console.log('Post data to create:', postData);

    const post = await prisma.post.create({
      data: postData,
      include: {
        author: { select: { id: true, email: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    console.log('Post created successfully:', post);
    res.status(201).json({ post });
  } catch (error: any) {
    console.error('Create post error:', error);
    if (error.code === 'P2002') return res.status(400).json({ error: 'Slug đã tồn tại' });
    res.status(500).json({ error: 'Lỗi server khi tạo bài viết', details: error.message });
  }
}

// PUT /api/posts/:id (protected)
export async function updatePost(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Không xác thực' });

    const postId = parseInt(req.params.id || '0', 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
    
    const { title, content, image, categoryId, published, description } = req.body as any;

    console.log('Updating post:', { postId, title, categoryId, published });

    // Build update data
    const updateData: any = {
      title,
      content,
      published,
    };

    // Handle description
    if (description !== undefined) {
      updateData.description = description;
    }

    // Handle image
    if (image !== undefined) {
      updateData.image = image;
    }

    // Handle category update
    if (categoryId !== undefined) {
      if (categoryId === null) {
        // Disconnect category
        updateData.category = { disconnect: true };
      } else {
        // Connect to new category
        updateData.category = { connect: { id: categoryId } };
      }
    }

    const post = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: { select: { id: true, email: true, displayName: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    console.log('Post updated successfully:', post.id);
    res.json({ post });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật bài viết' });
  }
}

// DELETE /api/posts/:id (protected)
export async function deletePost(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Không xác thực' });

    const postId = parseInt(req.params.id || '0', 10);
    if (isNaN(postId)) return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
    
    await prisma.post.delete({ where: { id: postId } });
    res.json({ message: 'Xóa bài viết thành công' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa bài viết' });
  }
}
// POST /api/posts/:id/save - Save a post
export async function savePost(req: AuthRequest, res: Response) {
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
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }

    // Check if already saved
    const existing = await prisma.savedPost.findUnique({
      where: { postId_userId: { postId, userId } },
    });

    if (existing) {
      // Idempotent: if already saved, just acknowledge success
      return res.json({ message: 'Bài viết đã được lưu', saved: true });
    }

    await prisma.savedPost.create({
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

    res.json({ message: 'Lưu bài viết thành công', saved: true });
  } catch (error) {
    console.error('Save post error:', error);
    // Gracefully handle duplicate saves (race conditions)
    if ((error as any)?.code === 'P2002') {
      return res.json({ message: 'Bài viết đã được lưu', saved: true });
    }
    res.status(500).json({ error: 'Lỗi server khi lưu bài viết' });
  }
}

// DELETE /api/posts/:id/save - Unsave a post
export async function unsavePost(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const postId = parseInt(req.params.id || '0', 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
    }

    await prisma.savedPost.deleteMany({
      where: { postId, userId },
    });

    res.json({ message: 'Bỏ lưu bài viết thành công' });
  } catch (error) {
    console.error('Unsave post error:', error);
    res.status(500).json({ error: 'Lỗi server khi bỏ lưu bài viết' });
  }
}

// GET /api/posts/saved - Get all saved posts for current user
export async function getSavedPosts(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const { page = '1', limit = '10' } = req.query as any;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [savedPosts, total] = await Promise.all([
      prisma.savedPost.findMany({
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
      prisma.savedPost.count({ where: { userId } }),
    ]);

    res.json({ posts: savedPosts.map(s => s.post), total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy bài viết đã lưu' });
  }
}

// POST /api/posts/:id/comments - Create a comment
export async function createComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const postId = parseInt(req.params.id || '0', 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
    }

    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Nội dung bình luận không được rỗng' });
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'Bình luận không được quá 500 ký tự' });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: { id: true, email: true, displayName: true, avatar: true },
        },
      },
    });

    res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Lỗi server khi tạo bình luận' });
  }
}

// GET /api/posts/:id/comments - Get comments of a post
export async function getComments(req: AuthRequest, res: Response) {
  try {
    const postId = parseInt(req.params.id || '0', 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: 'ID bài viết không hợp lệ' });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: { id: true, email: true, displayName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy bình luận' });
  }
}

// DELETE /api/posts/:id/comments/:commentId - Delete a comment
export async function deleteComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const postId = parseInt(req.params.id || '0', 10);
    const commentId = parseInt(req.params.commentId || '0', 10);
    
    if (isNaN(postId) || isNaN(commentId)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    // Get comment
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Bình luận không tồn tại' });
    }

    // Check if comment belongs to the post
    if (comment.postId !== postId) {
      return res.status(400).json({ error: 'Bình luận không thuộc bài viết này' });
    }

    // Only comment author or admin can delete
    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bình luận này' });
    }

    await prisma.comment.delete({ where: { id: commentId } });

    res.json({ message: 'Xóa bình luận thành công' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa bình luận' });
  }
}