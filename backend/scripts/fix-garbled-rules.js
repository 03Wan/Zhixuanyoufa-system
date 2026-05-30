const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.wnnkwjlrqvczdleqngyu:%40Wb15262578750@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const before = await client.query(
    'SELECT id, name, market FROM "Rule" WHERE name LIKE $1 OR market LIKE $1 OR suggestion LIKE $1',
    ['%?%'],
  );
  console.log('before:', before.rows);

  for (const row of before.rows) {
    await client.query(
      `
      UPDATE "Rule"
      SET
        name = $1,
        market = $2,
        keywords = $3::jsonb,
        suggestion = $4,
        "updatedAt" = NOW()
      WHERE id = $5
      `,
      [
        'Amazon 标题不得包含夸大宣传词',
        '全球',
        JSON.stringify(['最强', '第一', '永久', '100%有效', '绝对', '全网最低', '立刻见效']),
        '请改为客观可验证描述，避免绝对化宣传词。',
        row.id,
      ],
    );
  }

  const ids = before.rows.map((x) => x.id);
  if (ids.length > 0) {
    const after = await client.query('SELECT id, name, market FROM "Rule" WHERE id = ANY($1::text[])', [ids]);
    console.log('after:', after.rows);
  }

  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
