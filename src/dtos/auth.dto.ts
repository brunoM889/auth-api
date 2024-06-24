import { IsEmail, MinLength } from 'class-validator';

export class UserCreated {
  id: string;
  email: string;
  username: string;
  password: string;
  role: Roles;
}
export class ClientUserDataType {
  id: string;
  email: string;
  username: string;
}

export class UserLoginType {
  @MinLength(3)
  usernameOrEmail: string;
  @MinLength(3)
  password: string;
}

export class UserRegisterType {
  @IsEmail()
  email: string;
  @MinLength(3)
  username: string;
  @MinLength(3)
  password: string;
}

export class AuthResponseType {
  toSend: {
    statusCode: number;
    message?: string;
    user?: ClientUserDataType;
  };
  token?: string;
}

export type Roles = 'admin' | 'user';

export class PayloadType extends ClientUserDataType {
  role: string;
  exp: number;
  iat: number;
}
