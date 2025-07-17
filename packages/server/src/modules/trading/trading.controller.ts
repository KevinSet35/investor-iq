// src/trading/trading.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ClerkAuthGuard } from '../auth/clerk-auth.guard';

interface ToggleTradingDto {
    active: boolean;
    stocks: string[];
    userId: string;
}

@Controller('trading')
@UseGuards(ClerkAuthGuard)
export class TradingController {

    @Post('toggle')
    async toggleTrading(@Body() dto: ToggleTradingDto, @Req() req: any) {
        console.log('🔄 Trading toggle request:', {
            user: req.user.sub,
            active: dto.active,
            stocks: dto.stocks
        });

        // Here you would integrate with Robinhood API
        // For now, just return success
        return {
            success: true,
            message: dto.active ? 'Auto trading started' : 'Auto trading stopped',
            stocks: dto.stocks,
            userId: dto.userId,
            nextTrade: dto.active ? 'Tomorrow at 9:30 AM EST' : null
        };
    }
}