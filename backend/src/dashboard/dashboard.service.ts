import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private async buildTaskScope(userId: string, extra: Record<string, any> = {}) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { role: true, companyId: true } });
    if (!user) return { id: '__never__' };
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'ADMIN') return { ...extra };
    if (user.companyId) return { ...extra, companyId: user.companyId };
    return { ...extra, userId };
  }

  private async safeCount(promise: Promise<number>) {
    try {
      return await promise;
    } catch {
      return 0;
    }
  }

  async getDashboard(userId: string) {
    const taskScope = await this.buildTaskScope(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScope = { ...taskScope, createdAt: { gte: today } };

    // The frontend obtains its detailed charts from the paginated task/report
    // endpoints. Keep this endpoint focused on its visible KPIs so it remains
    // reliable with Supabase's single-connection transaction pool.
    const todayTaskCount = await this.safeCount(this.prisma.materialTask.count({ where: todayScope }));
    const pendingReviewCount = await this.safeCount(this.prisma.reviewTask.count({ where: { task: { is: taskScope }, status: 'PENDING' } }));
    const highRiskCount = await this.safeCount(this.prisma.detectionResult.count({ where: { task: { is: taskScope }, riskLevel: { in: ['HIGH', 'CRITICAL'] } } }));
    const reportCount = await this.safeCount(this.prisma.report.count({ where: { task: { is: taskScope } } }));
    // Keep the dashboard available while a deployment is still applying the
    // publication-outcome migration or when an older test double is in use.
    const outcomes = (this.prisma as any).publicationOutcome;
    const publishedCount = outcomes ? await this.safeCount(outcomes.count({ where: { task: { is: taskScope } } })) : 0;
    const firstPassCount = outcomes ? await this.safeCount(outcomes.count({ where: { task: { is: taskScope }, firstPass: true } })) : 0;
    const highRiskTasks = await this.prisma.materialTask
      .findMany({
        where: { ...taskScope, detectionResult: { is: { riskLevel: { in: ['HIGH', 'CRITICAL'] } } } },
        select: {
          id: true,
          productName: true,
          platform: true,
          market: true,
          detectionResult: { select: { riskLevel: true, decision: true } },
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
      })
      .catch(() => []);

    return {
      metrics: { todayTaskCount, pendingReviewCount, highRiskCount, reportCount, publishedCount, firstPassRate: publishedCount ? Math.round((firstPassCount / publishedCount) * 100) : 0 },
      highRiskTasks: highRiskTasks.map((task) => ({
        id: task.id,
        productName: task.productName,
        platform: task.platform,
        market: task.market,
        riskLevel: task.detectionResult?.riskLevel ?? 'HIGH',
        decision: task.detectionResult?.decision ?? 'HOLD',
      })),
      enhanced: {},
    };
  }
}
