import { Module } from '@nestjs/common';

import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { JwtService } from './utils/jwt.service';
import { DatabaseService } from './utils/database.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [AuthModule, ConfigModule.forRoot()],
  controllers: [],
  providers: [AuthService, JwtService, DatabaseService],
})
export class AppModule {}
