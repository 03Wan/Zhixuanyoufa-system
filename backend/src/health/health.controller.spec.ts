import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns live status without checking dependencies', () => {
    const prisma = { $queryRaw: jest.fn() };
    const controller = new HealthController(prisma as any);

    expect(controller.live()).toEqual({ status: 'ok' });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it('returns ready status when the database query succeeds', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]) };
    const controller = new HealthController(prisma as any);

    await expect(controller.ready()).resolves.toEqual({ status: 'ok' });
  });

  it('throws 503 when the database query fails', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('database down')) };
    const controller = new HealthController(prisma as any);

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
