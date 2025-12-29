import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare function listPosts(req: Request, res: Response): Promise<void>;
export declare function getPostBySlug(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createPost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updatePost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function savePost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function unsavePost(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getSavedPosts(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=postController.d.ts.map