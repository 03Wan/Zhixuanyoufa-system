import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Controller('api-open')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ENTERPRISE_ADMIN', 'MANAGER')
export class ApiOpenController {
  @Get('catalog')
  catalog() {
    return {
      notice: '当前为真实接口目录。API Key 管理和调用配额将在当前账号获批后开通。',
      apis: [
        { name: '素材检测接口', path: '/api/tasks/:taskId/detect', status: '内部可用' },
        { name: '规则管理接口', path: '/api/rules', status: '内部可用' },
        { name: '报告结果接口', path: '/api/reports/:id', status: '内部可用' },
        { name: '额度查询接口', path: '/api/subscription/usage', status: '内部可用' },
      ],
    };
  }

  @Get('calls')
  calls() {
    return {
      records: [],
      notice: '当前账号尚未开通 API Key，暂无调用记录。',
    };
  }
}
