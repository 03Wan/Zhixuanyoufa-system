import { DetectionService } from './detection.service';

describe('DetectionService.evaluate', () => {
  const service = new DetectionService({} as any, {} as any, {} as any, {} as any);

  it('flags prohibited marketing language and missing images for manual review', () => {
    const result = service.evaluate({
      productName: '便携榨汁杯',
      category: '家居',
      platform: 'Amazon',
      market: '全球',
      purpose: '新品上架',
      title: '全网最强榨汁杯',
      sellingPoints: '100%有效，立刻见效',
      detailText: '适合日常使用',
      adText: '现在购买',
      imageUrls: [],
    });

    expect(result.riskLevel).toBe('高风险');
    expect(result.decision).toBe('人工复核');
    expect(result.issues.map((item) => item.hitContent)).toEqual(expect.arrayContaining(['最强', '100%有效', '立刻见效', '无图片']));
  });

  it('returns a publishable decision for complete neutral material', () => {
    const result = service.evaluate({
      productName: '便携榨汁杯',
      category: '家居',
      platform: 'Amazon',
      market: '全球',
      purpose: '新品上架',
      title: '便携榨汁杯',
      sellingPoints: '轻量、大容量、Type-C 充电',
      detailText: '食品接触级材质，附带规格与售后说明。',
      adText: '满足通勤与办公场景的鲜榨需求。',
      imageUrls: ['https://example.com/main.jpg', 'https://example.com/detail.jpg'],
    });

    expect(result.riskLevel).toBe('低风险');
    expect(result.decision).toBe('可发布');
    expect(result.issues).toHaveLength(0);
  });
});
