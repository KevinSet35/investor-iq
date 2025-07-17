// src/trading/trading.module.ts
import { Module } from '@nestjs/common';
import { TradingController } from './trading.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [AuthModule],
    controllers: [TradingController],
})
export class TradingModule { }