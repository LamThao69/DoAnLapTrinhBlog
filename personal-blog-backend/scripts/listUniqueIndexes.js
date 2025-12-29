const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sql = `
    SELECT OBJECT_NAME(i.object_id) AS table_name,
           i.name AS index_name,
           i.is_unique,
           c.name AS column_name
    FROM sys.indexes i
    JOIN sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
    JOIN sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    WHERE OBJECT_NAME(i.object_id) = 'User'
    ORDER BY i.name, ic.key_ordinal;
  `;

  const rows = await prisma.$queryRawUnsafe(sql);
  console.log('Unique indexes on User table:');
  console.table(rows);
}

main()
  .catch(e => {
    console.error('Query failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
