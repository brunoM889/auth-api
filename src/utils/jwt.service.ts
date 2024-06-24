import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ClientUserDataType, PayloadType, Roles } from 'src/dtos/auth.dto';
import * as timestamp from 'unix-timestamp';

@Injectable()
export class JwtService {
  private secret = process.env.JWT_SECRET;

  validate(token: string, roleRequired?: Roles) {
    try {
      const payload = jwt.verify(token, this.secret) as PayloadType;

      const userData = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
      };

      const now = timestamp.now();

      if (roleRequired && payload.role !== roleRequired) {
        return null;
      }

      if (payload.exp - now < 60 * 60 * 12) {
        return {
          user: userData,
          refreshToken: this.encode(userData),
        };
      }

      return {
        user: userData,
        refreshToken: null,
      };
    } catch (e) {
      return null;
    }
  }

  encode(data: ClientUserDataType & { role: string }) {
    const token = jwt.sign(data, this.secret, {
      expiresIn: '24h',
    });

    return token;
  }
}
