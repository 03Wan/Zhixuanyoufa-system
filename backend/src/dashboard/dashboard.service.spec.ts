import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  it('uses date-scoped KPI counts without loading every task', async () => {
    const prisma: any = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ role: 'SYSTEM_ADMIN', companyId: null }),
        findMany: jest.fn().mockResolvedValue([{ id: 'u1', companyName: '示例企业' }]),
      },
      materialTask: {
        count: jest.fn().mockResolvedValue(2),
        findMany: jest.fn().mockResolvedValue([]),
      },
      reviewTask: { count: jest.fn().mockResolvedValue(0) },
      detectionResult: {
        count: jest.fn().mockResolvedValue(0),
      },
      report: { count: jest.fn().mockResolvedValue(1) },
    };
    const service = new DashboardService(prisma);

    const dashboard = await service.getDashboard('u1');

    expect(dashboard.metrics.todayTaskCount).toBe(2);
    expect(dashboard.enhanced).toEqual({});
    expect(prisma.materialTask.count.mock.calls[0][0].where.createdAt.gte).toBeInstanceOf(Date);
    expect(prisma.materialTask.findMany.mock.calls[0][0]).toHaveProperty('take', 10);
  });
});
