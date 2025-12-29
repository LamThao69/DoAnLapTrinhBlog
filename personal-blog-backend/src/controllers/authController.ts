import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { signToken } from '../utils/token';
import { validateEmail, validatePassword, validatePhoneNumber } from '../utils/validation';
import { AuthRequest } from '../middleware/auth';

// Đăng ký
export async function register(req: Request, res: Response) {
  try {
    // Debug: log request body to help identify malformed requests
    console.log('Register request body:', req.body);

    const { email, password, displayName, phoneNumber, gender, role } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email không hợp lệ' });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }

    // Kiểm tra số điện thoại nếu có
    if (phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: { phoneNumber },
      });

      if (existingPhone) {
        return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        displayName: displayName || null,
        phoneNumber: phoneNumber || null,
        gender: gender || 'OTHER',
        role: role === 'ADMIN' ? 'ADMIN' : 'USER', // Allow ADMIN role if specified
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        gender: true,
        role: true,
        createdAt: true,
      },
    });

    // Tạo token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.status(201).json({
      message: 'Đăng ký thành công',
      user,
      token,
    });
  } catch (error) {
    // Log full error stack for debugging
    console.error('Register error:', error);
    if (error instanceof Error) console.error(error.stack);

    // Handle Prisma unique constraint error (duplicate email / phone)
    // Use a loose any cast to access Prisma error properties without importing Prisma type
    const errAny = error as any;
    if (errAny && errAny.code === 'P2002') {
      const target = errAny?.meta?.target;
      if (typeof target === 'string' && target.toLowerCase().includes('email')) {
        return res.status(400).json({ error: 'Email đã được sử dụng' });
      }
      if (typeof target === 'string' && target.toLowerCase().includes('phonenumber')) {
        return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
      }

      return res.status(400).json({ error: 'Dữ liệu trùng lặp' });
    }

    // Generic server error
    res.status(500).json({ error: 'Lỗi server khi đăng ký', details: (error as Error).message });
  }
}

// Đăng nhập
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
    }

    // Tìm user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Trả về thông tin user (không bao gồm password)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Đăng nhập thành công',
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
  }
}

// Lấy thông tin user hiện tại
export async function getMe(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        address: true,
        birthYear: true,
        avatar: true,
        gender: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
}

// Cập nhật thông tin profile
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const { displayName, phoneNumber, gender, address, birthYear, avatar } = req.body;

    // Validate phone if provided
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
    }

    // Check if phone already exists (and belongs to different user)
    if (phoneNumber) {
      const existingPhone = await prisma.user.findFirst({
        where: { phoneNumber },
      });

      if (existingPhone && existingPhone.id !== userId) {
        return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
      }
    }

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (gender !== undefined) updateData.gender = gender;
    if (address !== undefined) updateData.address = address;
    if (birthYear !== undefined) updateData.birthYear = birthYear ? parseInt(birthYear, 10) : null;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        address: true,
        birthYear: true,
        avatar: true,
        gender: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ message: 'Cập nhật thông tin thành công', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Lỗi server khi cập nhật thông tin' });
  }
}

// Đổi mật khẩu
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Không xác thực được người dùng' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại và mật khẩu mới là bắt buộc' });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ error: passwordValidation.message });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Lỗi server khi đổi mật khẩu' });
  }
}

// GET /api/auth/users - Get all users (Admin only)
export async function getAllUsers(req: AuthRequest, res: Response) {
  try {
    const user = req.user;
    
    // Check if user is admin
    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền truy cập' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        phoneNumber: true,
        address: true,
        gender: true,
        birthYear: true,
        role: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ users });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách người dùng' });
  }
}

// DELETE /api/auth/users/:id - Delete user (Admin only)
export async function deleteUser(req: AuthRequest, res: Response) {
  try {
    const currentUser = req.user;
    const userId = parseInt(req.params.id);

    // Check if user is admin
    if (!currentUser || currentUser.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Chỉ admin mới có quyền xóa người dùng' });
    }

    // Check if userId is valid
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'ID người dùng không hợp lệ' });
    }

    // Prevent deleting self
    if (currentUser.id === userId) {
      return res.status(400).json({ error: 'Không thể xóa chính mình' });
    }

    // Check if user exists
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userToDelete) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'Xóa người dùng thành công' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Lỗi server khi xóa người dùng' });
  }
}