export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}
export declare function signToken(payload: TokenPayload, expiresIn?: string): string;
export declare function verifyToken(token: string): TokenPayload;
//# sourceMappingURL=token.d.ts.map