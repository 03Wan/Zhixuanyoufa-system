import { ReviewStatus } from '@prisma/client';
import { ReviewsService } from './reviews.service';

describe('ReviewsService.startReview', () => {
  it.each([ReviewStatus.IN_PROGRESS, ReviewStatus.APPROVED, ReviewStatus.RETURNED, ReviewStatus.HOLD])(
    'does not overwrite a %s review when the detail page is opened',
    async (status) => {
      const prisma: any = { reviewTask: { update: jest.fn() } };
      const logs: any = { createLog: jest.fn() };
      const service = new ReviewsService(prisma, logs);
      const review: any = { id: 'review-1', status, history: [], taskId: 'task-1' };
      jest.spyOn(service, 'detail').mockResolvedValue(review);

      const result = await service.startReview('reviewer-1', 'review-1');

      expect(result).toEqual({ success: true, alreadyStarted: true, review });
      expect(prisma.reviewTask.update).not.toHaveBeenCalled();
      expect(logs.createLog).not.toHaveBeenCalled();
    },
  );

  it('transitions a pending review once and records the start', async () => {
    const prisma: any = { reviewTask: { update: jest.fn().mockResolvedValue({ id: 'review-1', status: ReviewStatus.IN_PROGRESS }) } };
    const logs: any = { createLog: jest.fn().mockResolvedValue(undefined) };
    const service = new ReviewsService(prisma, logs);
    jest.spyOn(service, 'detail').mockResolvedValue({ id: 'review-1', status: ReviewStatus.PENDING, history: [], taskId: 'task-1' } as any);

    await service.startReview('reviewer-1', 'review-1');

    expect(prisma.reviewTask.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'review-1' },
      data: expect.objectContaining({ status: ReviewStatus.IN_PROGRESS, reviewerId: 'reviewer-1' }),
    }));
    expect(logs.createLog).toHaveBeenCalledTimes(1);
  });
});
