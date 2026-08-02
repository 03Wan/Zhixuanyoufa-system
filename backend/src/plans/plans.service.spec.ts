import { PLAN_ADD_ONS, PLAN_SEEDS } from './plan.constants';
import { PlansService } from './plans.service';

describe('PlansService', () => {
  const prisma = {
    plan: {
      count: jest.fn(),
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('seeds structured launch pricing and returns add-ons', async () => {
    prisma.plan.count.mockResolvedValue(0);
    prisma.plan.createMany.mockResolvedValue({ count: PLAN_SEEDS.length });
    prisma.plan.findMany.mockResolvedValue(PLAN_SEEDS);

    const result = await new PlansService(prisma).list();

    expect(prisma.plan.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({
          name: 'Starter',
          monthlyPrice: 79,
          launchMonthlyPrice: 39,
          annualPrice: 799,
          launchAnnualPrice: 399,
          quota: 200,
        }),
        expect.objectContaining({
          name: 'Growth',
          launchMonthlyPrice: 149,
          includedSeats: 5,
          quota: 1000,
        }),
      ]),
    });
    expect(result.plans).toHaveLength(5);
    expect(result.addOns).toEqual(PLAN_ADD_ONS);
    expect(result.notice).toContain('价格锁定12个月');
  });
});
