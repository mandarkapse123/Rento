import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  // 1. Fetch all rent data from the database
  const allRents = await prisma.rent.findMany({
    orderBy: { date: 'desc' },
  });

  // 2. Set up the column headers for Excel/CSV
  const csvHeader = 'Date,Period,Amount,Mode,Notes\n';

  // 3. Map the database rows to Excel rows
  const csvRows = allRents.map((rent: any) => {
    // If notes have commas, wrap them in quotes so they don't break the columns
    const safeNotes = rent.notes ? `"${rent.notes}"` : '';
    return `${rent.date},${rent.period},${rent.amount},${rent.mode},${safeNotes}`;
  }).join('\n');

  const csvData = csvHeader + csvRows;

  // 4. Force the browser to download the file
  return new Response(csvData, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="rent_tracker_backup.csv"',
    },
  });
}