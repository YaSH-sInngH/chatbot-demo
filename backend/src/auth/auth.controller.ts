import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from '../users/dtos/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserResponseDto } from '../users/dtos/user-response.dto';
import { LoginUserDto } from '../users/dtos/login-user.dto';

@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.authService.register(createUserDto);
    return new UserResponseDto(user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() _loginDto: LoginUserDto, @Req() req): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req): Promise<UserResponseDto> {
    const user = await this.authService.getProfile(req.user.userId);
    if (!user) {
      throw new Error('User not found');
    }
    return new UserResponseDto(user);
  }
}