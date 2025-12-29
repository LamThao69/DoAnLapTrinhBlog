"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = auth;
const token_1 = require("../utils/token");
function auth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Không có token được cung cấp' });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Token không hợp lệ' });
        }
        const payload = (0, token_1.verifyToken)(token);
        req.user = payload;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}
//# sourceMappingURL=auth.js.map