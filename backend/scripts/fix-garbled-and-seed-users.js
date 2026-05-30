const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.wnnkwjlrqvczdleqngyu:%40Wb15262578750@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    const adminRes = await client.query('SELECT "passwordHash" FROM "User" WHERE email = $1 LIMIT 1', ['admin@zyuf.com']);
    const passwordHash = adminRes.rows[0]?.passwordHash || (await bcrypt.hash('123456', 10));

    const users = [
      ['企业管理员A', 'enterprise_admin@example.com', '智选优发演示企业', 'ENTERPRISE_ADMIN'],
      ['运营人员A', 'operator@example.com', '智选优发演示企业', 'OPERATOR'],
      ['设计人员A', 'designer@example.com', '智选优发演示企业', 'DESIGNER'],
      ['复核人员A', 'reviewer@example.com', '智选优发演示企业', 'REVIEWER'],
      ['管理人员A', 'manager@example.com', '智选优发演示企业', 'MANAGER'],
      ['系统管理员A', 'sysadmin@example.com', '平台方', 'SYSTEM_ADMIN'],
    ];

    for (const [username, email, companyName, role] of users) {
      const existing = await client.query('SELECT id FROM "User" WHERE email = $1 LIMIT 1', [email]);
      if (existing.rows.length > 0) {
        await client.query(
          `
          UPDATE "User"
          SET username = $1, "companyName" = $2, role = $3, "updatedAt" = NOW()
          WHERE email = $4
          `,
          [username, companyName, role, email],
        );
      } else {
        await client.query(
          `
          INSERT INTO "User" (id, username, email, "passwordHash", "companyName", role, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          `,
          [`u_${Math.random().toString(36).slice(2, 12)}`, username, email, passwordHash, companyName, role],
        );
      }
    }

    await client.query(
      `
      UPDATE "MaterialTask"
      SET "productName" = $1, category = $2, market = $3, purpose = $4, "updatedAt" = NOW()
      WHERE id = $5
      `,
      ['便携榨汁杯', '家居用品', '欧美', '上架前审核', 'cmoqmf87q0002131dqurj1has'],
    );

    await client.query(
      `
      UPDATE "MaterialContent"
      SET
        title = $1,
        "detailText" = $2,
        "adText" = $3,
        "sellingPoints" = $4::jsonb,
        "imageUrls" = $5::jsonb,
        "updatedAt" = NOW()
      WHERE "taskId" = $6
      `,
      [
        '便携榨汁杯 大容量双杯设计',
        '适合健身、办公和户外场景，操作便捷，清洗简单。',
        '随时随地鲜榨果汁，轻松补充维C。',
        JSON.stringify(['Type-C 快充', '食品级材质', '一键清洗']),
        JSON.stringify(['https://demo.zyuf.com/img/main-01.jpg', 'https://demo.zyuf.com/img/detail-02.jpg']),
        'cmoqmf87q0002131dqurj1has',
      ],
    );

    await client.query(
      `
      UPDATE "Report"
      SET
        title = $1,
        summary = $2,
        content = $3::jsonb,
        "updatedAt" = NOW()
      WHERE "taskId" = $4
      `,
      [
        '便携榨汁杯 审核报告',
        '任务《便携榨汁杯》综合得分 100，风险等级 LOW。',
        JSON.stringify({
          task: {
            productName: '便携榨汁杯',
            category: '家居用品',
            platform: 'Amazon',
            market: '欧美',
            purpose: '上架前审核',
          },
          result: { totalScore: 100, riskLevel: 'LOW', decision: 'APPROVE' },
        }),
        'cmoqmf87q0002131dqurj1has',
      ],
    );

    const usersCount = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
    const fixedTask = await client.query(
      'SELECT id, "productName", category, market, purpose FROM "MaterialTask" WHERE id = $1',
      ['cmoqmf87q0002131dqurj1has'],
    );
    console.log({ users: usersCount.rows[0].n, fixedTask: fixedTask.rows[0] });
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
