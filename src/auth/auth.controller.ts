import { Controller, Post, Body, Res, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserLoginType, UserRegisterType } from '../dtos/auth.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Res() res: Response, @Body() body: UserRegisterType) {
    const { toSend, token } = await this.authService.register(body);

    if (token) {
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000 * 24,
      });
    }

    res.send(toSend);
  }

  @Post('login')
  async login(@Res() res: Response, @Body() body: UserLoginType) {
    const { toSend, token } = await this.authService.login({
      usernameOrEmail: body.usernameOrEmail,
      password: body.password,
    });

    if (token) {
      res.cookie('token', token, {
        httpOnly: true,
        maxAge: 3600000 * 24,
      });
    }

    res.send(toSend);
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    res.clearCookie('token');
    res.send({ statusCode: 200, message: 'Logout successful' });
  }

  @Get('validate-admin-token')
  async validateAdminToken(@Req() req: Request) {
    const token = await req.cookies.token;

    if (token) {
      return this.authService.validateToken(token, 'admin');
    } else {
      return {
        statusCode: 401,
        message: 'Unauthorized',
      };
    }
  }

  @Get('validate-token')
  async validateToken(@Req() req: Request, @Res() res: Response) {
    const token = await req.cookies.token;

    if (token) {
      const response = await this.authService.validateToken(token);

      if (response.refreshToken) {
        res.clearCookie('token');
        res.cookie('token', response.refreshToken, {
          httpOnly: true,
          maxAge: 3600000 * 24,
        });
      }

      res.send(response);
    } else {
      res.send({
        statusCode: 401,
        message: 'Unauthorized',
      });
    }
  }
}
