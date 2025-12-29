"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const postController_1 = require("../controllers/postController");
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
router.get('/', postController_1.listPosts);
router.get('/saved', auth_1.default, postController_1.getSavedPosts);
router.get('/:slug', postController_1.getPostBySlug);
// Protected routes
router.post('/', auth_1.default, postController_1.createPost);
router.post('/:id/save', auth_1.default, postController_1.savePost);
router.delete('/:id/save', auth_1.default, postController_1.unsavePost);
router.put('/:id', auth_1.default, postController_1.updatePost);
router.delete('/:id', auth_1.default, postController_1.deletePost);
exports.default = router;
//# sourceMappingURL=postRoutes.js.map