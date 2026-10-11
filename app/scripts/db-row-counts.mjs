// Prints how many rows each table has (no values). Handy before resetting the database.
//   node --env-file=.env.local scripts/db-row-counts.mjs
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows: tables } = await client.query(
  "select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by table_name",
);
for (const { table_name } of tables) {
  const { rows } = await client.query(`select count(*)::int as n from "${table_name}"`);
  if (rows[0].n > 0 || ["members", "orders", "users", "memberships"].includes(table_name)) {
    console.log(`${table_name}: ${rows[0].n}`);
  }
}
await client.end();
