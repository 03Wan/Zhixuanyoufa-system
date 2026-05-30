import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('api-open')
@UseGuards(JwtAuthGuard)
export class ApiOpenController {
  @Get('catalog')
  catalog() {
    return {
      notice: 'MVP试点版：当前为接口服务规划/试点开放，后续商业化阶段将接入API Key与签名校验。',
      apis: [
        { name: '素材检测接口', path: '/api/tasks/:taskId/detect', status: '内部可用/可开放' },
        { name: '规则检测接口', path: '/api/rules', status: '内部可用/可开放' },
        { name: '报告结果接口', path: '/api/reports/:id', status: '内部可用/可开放' },
        { name: '额度查询接口', path: '/api/subscription/usage', status: '内部可用/可开放' },
        { name: '调用记录接口', path: '/api/api-open/calls', status: 'MVP占位' },
      ],
    };
  }

  @Get('calls')
  calls() {
    return {
      records: [],
      notice: 'MVP版调用记录占位，后续接入API Key后提供真实统计。',
    };
  }
}
