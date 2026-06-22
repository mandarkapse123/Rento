import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  const allRents = await prisma.rent.findMany({
    orderBy: { date: 'desc' },
  });

  const csvHeader = 'Date,Period,Amount,Mode,Notes\n';

  const csvRows = allRents.map((rent: any) => {
    const safeNotes = rent.notes ? `"${rent.notes}"` : '';
    return `${rent.date},${rent.period},${rent.amount},${rent.mode},${safeNotes}`;
  }).join('\n');

  const csvData = csvHeader + csvRows;

  return new Response(csvData, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="rent_tracker_backup.csv"',
    },
  });
}