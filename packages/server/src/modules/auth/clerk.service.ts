// src/auth/clerk.service.ts
import { Injectable } from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';

@Injectable()
export class ClerkService {
    async verifyToken(token: string) {
        try {
            const payload = await clerkClient.verifyToken(token);
            return payload;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async getUser(userId: string) {
        try {
            const user = await clerkClient.users.getUser(userId);
            return user;
        } catch (error) {
            throw new Error('User not found');
        }
    }
}