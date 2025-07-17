// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './clerk-auth.guard';

@Module({
    providers: [ClerkService, ClerkAuthGuard],
    exports: [ClerkService, ClerkAuthGuard],
})
export class AuthModule { }