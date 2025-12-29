import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// GET /api/categories
export async function listCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    
    res.json({ categories });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách danh mục' });
  }
}
