import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { env } from './env.js';

export const sign = async (payload: JWTPayload): Promise<string> => {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1h')
        .sign(Buffer.from(env.JWT_SECRET));
}

export const verify = async (token: string): Promise<boolean> => {
    try {
        await jwtVerify(token, Buffer.from(env.JWT_SECRET));
        return true;
    } catch {
        return false;
    }
}