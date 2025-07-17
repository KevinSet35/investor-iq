import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TradingModule } from './modules/trading/trading.module';

@Module({
    imports: [UsersModule, AuthModule, TradingModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
