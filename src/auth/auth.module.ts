import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtService } from 'src/utils/jwt.service';
import { DatabaseService } from 'src/utils/database.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService, DatabaseService],
})
export class AuthModule {}
