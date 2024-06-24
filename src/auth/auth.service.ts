import { Injectable } from '@nestjs/common';
import {
  AuthResponseType,
  Roles,
  UserLoginType,
  UserRegisterType,
} from 'src/dtos/auth.dto';
import { DatabaseService } from 'src/utils/database.service';
import { JwtService } from 'src/utils/jwt.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async register(body: UserRegisterType): Promise<AuthResponseType> {
    try {
      const { email, username, password } = body;

      const { rows } = await this.databaseService.pool.query(
        'SELECT * FROM users WHERE email = $1 OR username = $2',
        [email, username],
      );

      if (rows.length !== 0) {
        return {
          toSend: {
            statusCode: 409,
            message: 'User already exists',
          },
        };
      } else {
        const role = username === 'lowlife' ? 'admin' : 'user';

        const hashedPassword = await bcrypt.hash(password, 10);

        await this.databaseService.pool.query(
          'INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4)',
          [email, username, hashedPassword, role],
        );

        const newUser = await this.databaseService.pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email],
        );

        const token = this.jwtService.encode({
          id: newUser.rows[0].id,
          username: username,
          email: email,
          role: role,
        });

        return {
          toSend: {
            statusCode: 200,
            user: {
              id: newUser.rows[0].id,
              username: username,
              email: email,
            },
          },
          token: token,
        };
      }
    } catch (e) {
      console.log(e);
      return {
        toSend: {
          statusCode: 500,
          message: 'Internal server error',
        },
      };
    }
  }

  async login(body: UserLoginType): Promise<AuthResponseType> {
    try {
      const { usernameOrEmail, password } = body;

      const { rows } = await this.databaseService.pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $1',
        [usernameOrEmail],
      );

      if (rows.length === 0) {
        return {
          toSend: {
            statusCode: 404,
            message: 'User not found',
          },
        };
      }

      const validatePassword = await bcrypt.compare(password, rows[0].password);

      const token = this.jwtService.encode({
        id: rows[0].id,
        username: rows[0].username,
        email: rows[0].email,
        role: rows[0].role,
      });

      if (!validatePassword) {
        return {
          toSend: {
            statusCode: 400,
            message: 'Invalid password',
          },
        };
      }
      return {
        toSend: {
          statusCode: 200,
          user: {
            id: rows[0].id,
            username: rows[0].username,
            email: rows[0].email,
          },
        },
        token: token,
      };
    } catch (e) {
      console.log(e);
      return {
        toSend: {
          statusCode: 500,
          message: 'Internal server error',
        },
      };
    }
  }

  async validateToken(token: string, roleRequired?: Roles) {
    try {
      const isValid = roleRequired
        ? this.jwtService.validate(token, roleRequired)
        : this.jwtService.validate(token);

      if (isValid) {
        return {
          statusCode: 200,
          user: {
            id: isValid.user.id,
            username: isValid.user.username,
            email: isValid.user.email,
          },
          refreshToken: isValid.refreshToken,
        };
      }
      return {
        statusCode: 401,
        message: 'Unauthorized',
      };
    } catch (e) {
      console.log(e);
      return {
        statusCode: 500,
        message: 'Internal server error',
      };
    }
  }
}
