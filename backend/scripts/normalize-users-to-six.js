const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString:
      'postgresql://postgres.wnnkwjlrqvczdleqngyu:%40Wb15262578750@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres',
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  const sys = (
    await client.query('SELECT id, email FROM "User" WHERE email = $1 LIMIT 1', ['sysadmin@example.com'])
  ).rows[0];
  if (!sys) throw new Error('sysadmin@example.com 不存在');

  const extras = (
    await client.query('SELECT id, email FROM "User" WHERE email IN ($1, $2)', [
      'admin@zyuf.com',
      'runner8680@zyuf.com',
    ])
  ).rows;

  await client.query('BEGIN');
  try {
    for (const u of extras) {
      await client.query('UPDATE "MaterialTask" SET "userId" = $1 WHERE "userId" = $2', [sys.id, u.id]);
      await client.query('UPDATE "OperationLog" SET "userId" = $1 WHERE "userId" = $2', [sys.id, u.id]);
      await client.query('UPDATE "ReviewTask" SET "createdBy" = $1 WHERE "createdBy" = $2', [sys.id, u.id]);
      await client.query('UPDATE "ReviewTask" SET "reviewerId" = $1 WHERE "reviewerId" = $2', [sys.id, u.id]);
    }

    await client.query('DELETE FROM "User" WHERE email IN ($1, $2)', ['admin@zyuf.com', 'runner8680@zyuf.com']);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  }

  const count = await client.query('SELECT COUNT(*)::int AS n FROM "User"');
  const users = await client.query('SELECT username, email, role FROM "User" ORDER BY email');
  console.log({ count: count.rows[0].n, users: users.rows });
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
