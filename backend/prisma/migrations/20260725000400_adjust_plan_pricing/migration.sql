-- Keep the price catalogue consistent for databases that were seeded before
-- the revised entry-level pricing was introduced.
UPDATE "Plan" SET "priceText" = '19元/次 或 99元/10次' WHERE "name" = '体验包/按次检测';
UPDATE "Plan" SET "priceText" = '99元/月 或 999元/年' WHERE "name" = '基础版';
UPDATE "Plan" SET "priceText" = '399元/月 或 3999元/年' WHERE "name" = '专业版';
UPDATE "Plan" SET "priceText" = '9999—19999元/年' WHERE "name" = '企业版';
UPDATE "Plan" SET "priceText" = '3万—10万元/项目' WHERE "name" = '定制版';
UPDATE "Plan" SET "priceText" = '9999元/年起 或 按调用量' WHERE "name" = 'API接口版';
