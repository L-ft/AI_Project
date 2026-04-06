import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { phone: string; password: string; username?: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { phone: string; password: string }) {
    return this.authService.login(body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: { user: unknown }) {
    return this.authService.getProfile(req.user);
  }
}
