"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getMe = getMe;
exports.updateProfile = updateProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../lib/prisma"));
const token_1 = require("../utils/token");
const validation_1 = require("../utils/validation");
// Đăng ký
async function register(req, res) {
    try {
        // Debug: log request body to help identify malformed requests
        console.log('Register request body:', req.body);
        const { email, password, displayName, phoneNumber, gender } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
        }
        if (!(0, validation_1.validateEmail)(email)) {
            return res.status(400).json({ error: 'Email không hợp lệ' });
        }
        const passwordValidation = (0, validation_1.validatePassword)(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({ error: passwordValidation.message });
        }
        if (phoneNumber && !(0, validation_1.validatePhoneNumber)(phoneNumber)) {
            return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
        }
        // Kiểm tra email đã tồn tại chưa
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'Email đã được sử dụng' });
        }
        // Kiểm tra số điện thoại nếu có
        if (phoneNumber) {
            const existingPhone = await prisma_1.default.user.findFirst({
                where: { phoneNumber },
            });
            if (existingPhone) {
                return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
            }
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Tạo user mới
        const user = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                displayName: displayName || null,
                phoneNumber: phoneNumber || null,
                gender: gender || 'OTHER',
                role: 'USER',
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
        const token = (0, token_1.signToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            message: 'Đăng ký thành công',
            user,
            token,
        });
    }
    catch (error) {
        // Log full error stack for debugging
        console.error('Register error:', error);
        if (error instanceof Error)
            console.error(error.stack);
        // Handle Prisma unique constraint error (duplicate email / phone)
        // Use a loose any cast to access Prisma error properties without importing Prisma type
        const errAny = error;
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
        res.status(500).json({ error: 'Lỗi server khi đăng ký', details: error.message });
    }
}
// Đăng nhập
async function login(req, res) {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email và mật khẩu là bắt buộc' });
        }
        // Tìm user
        const user = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }
        // Kiểm tra password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
        }
        // Tạo token
        const token = (0, token_1.signToken)({
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
    }
}
// Lấy thông tin user hiện tại
async function getMe(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
        }
        const user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ error: 'Lỗi server' });
    }
}
// Cập nhật thông tin profile
async function updateProfile(req, res) {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Không xác thực được người dùng' });
        }
        const { displayName, phoneNumber, gender, address, birthYear, avatar } = req.body;
        // Validate phone if provided
        if (phoneNumber && !(0, validation_1.validatePhoneNumber)(phoneNumber)) {
            return res.status(400).json({ error: 'Số điện thoại không hợp lệ' });
        }
        // Check if phone already exists (and belongs to different user)
        if (phoneNumber) {
            const existingPhone = await prisma_1.default.user.findFirst({
                where: { phoneNumber },
            });
            if (existingPhone && existingPhone.id !== userId) {
                return res.status(400).json({ error: 'Số điện thoại đã được sử dụng' });
            }
        }
        const updateData = {};
        if (displayName !== undefined)
            updateData.displayName = displayName;
        if (phoneNumber !== undefined)
            updateData.phoneNumber = phoneNumber;
        if (gender !== undefined)
            updateData.gender = gender;
        if (address !== undefined)
            updateData.address = address;
        if (birthYear !== undefined)
            updateData.birthYear = birthYear ? parseInt(birthYear, 10) : null;
        if (avatar !== undefined)
            updateData.avatar = avatar;
        const user = await prisma_1.default.user.update({
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Lỗi server khi cập nhật thông tin' });
    }
}
//# sourceMappingURL=authController.js.map