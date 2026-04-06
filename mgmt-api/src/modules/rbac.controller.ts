import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RbacGuard } from '../auth/rbac.guard';
import { RbacAdminService } from './rbac-admin.service';


@Controller('rbac')
@UseGuards(JwtAuthGuard, RbacGuard)
export class RbacController {
  constructor(private readonly rbacAdminService: RbacAdminService) {}

  @Get('roles')
  async getRoles() {
    return this.rbacAdminService.getRoles();
  }

  @Post('roles')
  async createRole(@Body() data: { name: string; code: string; description?: string }) {
    return this.rbacAdminService.createRole(data);
  }

  @Delete('roles/:roleCode')
  async deleteRole(@Param('roleCode') roleCode: string) {
    return this.rbacAdminService.deleteRole(roleCode);
  }

  @Put('roles/:roleCode')
  async updateRole(@Param('roleCode') roleCode: string, @Body() data: { name: string; description?: string }) {
    return this.rbacAdminService.updateRole(roleCode, data);
  }

  @Get('users')
  async getUsers() {
    return this.rbacAdminService.getUsers();
  }

  @Post('users')
  async createUser(
    @Body()
    body: {
      username: string;
      phone_number: string;
      password: string;
      status?: number;
      role_id?: string | number;
      roleCode?: string;
    },
  ) {
    return this.rbacAdminService.createUser(body);
  }

  @Put('users/:userCode')
  async updateUser(@Param('userCode') userCode: string, @Body() data: { username: string; phone_number: string }) {
    return this.rbacAdminService.updateUser(userCode, data);
  }

  @Delete('users/:userCode')
  async deleteUser(@Param('userCode') userCode: string) {
    return this.rbacAdminService.deleteUser(userCode);
  }

  @Put('users/:userCode/role')
  async updateUserRole(
    @Param('userCode') userCode: string,
    @Body() data: { roleId?: string | number; roleCode?: string },
  ) {
    return this.rbacAdminService.updateUserRole(userCode, data.roleCode ?? data.roleId ?? null);
  }

  @Put('users/:userCode/status')
  async updateUserStatus(@Param('userCode') userCode: string, @Body() data: { status: number }) {
    return this.rbacAdminService.updateUserStatus(userCode, data.status);
  }

  @Put('users/:userCode/password')
  async resetPassword(@Param('userCode') userCode: string, @Body() data: { password: string }) {
    return this.rbacAdminService.resetPassword(userCode, data.password);
  }

  @Get('users/:userCode/role')
  async getUserRole(@Param('userCode') userCode: string) {
    return this.rbacAdminService.getUserRole(userCode);
  }

  @Get('my-menus')
  async getMyMenus(@Request() req: { user: { role: string } }) {
    return this.rbacAdminService.getMyMenus(req.user.role);
  }

  @Get('menus')
  async getMenuTree() {
    return this.rbacAdminService.getMenuTree();
  }

  @Get('role-perms/:roleCode')
  async getRolePerms(@Param('roleCode') roleCode: string) {
    return this.rbacAdminService.getRolePerms(roleCode);
  }

  @Post('assign-perms')
  async assignPerms(@Body() data: { roleId?: string | number; roleCode?: string; menuIds: number[] }) {
    return this.rbacAdminService.assignPerms(data);
  }
}
