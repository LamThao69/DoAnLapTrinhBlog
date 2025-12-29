import { Router } from 'express';
import {
  listPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  savePost,
  unsavePost,
  getSavedPosts,
  createComment,
  getComments,
  deleteComment,
} from '../controllers/postController';
import auth from '../middleware/auth';

const router = Router();

router.get('/', listPosts);
router.get('/saved', auth, getSavedPosts);
router.get('/:slug', getPostBySlug);

// Protected routes
router.post('/', auth, createPost);
router.post('/:id/save', auth, savePost);
router.delete('/:id/save', auth, unsavePost);
router.put('/:id', auth, updatePost);
router.delete('/:id', auth, deletePost);

// Comment routes
router.post('/:id/comments', auth, createComment);
router.get('/:id/comments', getComments);
router.delete('/:id/comments/:commentId', auth, deleteComment);

export default router;

