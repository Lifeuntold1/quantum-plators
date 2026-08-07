import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    // Single source of truth config sheet ID
    const sheetId = "1q-1dAUPRYSgkHb1C4J2nk6BuToC7iNFkyqblSPZHsJo";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch finance sheet: ${response.statusText}`);
    }

    const text = await response.text();
    const match = text.match(/google\.visualization\.Query\.setResponse\((.+)\)/s);
    if (!match || !match[1]) {
      throw new Error("Invalid response format from Google Visualization API");
    }

    const json = JSON.parse(match[1]);
    const table = json.table;
    const rows = table?.rows || [];

    let studentCount = 0;
    let totalPaid = 0;
    let coreLegacyPaid = 0;
    let dinnerUpgradePaid = 0;
    let digitalPlatformPaid = 0;

    rows.forEach((r: any) => {
      const c = r?.c || [];
      const studentName = c[0]?.v;
      if (!studentName || String(studentName).trim() === "" || String(studentName) === "Student Name") {
        return; // Skip empty rows or header if present
      }

      studentCount++;
      const paid = typeof c[1]?.v === 'number' ? c[1].v : parseFloat(c[1]?.v) || 0;
      totalPaid += paid;

      // Columns E(4) to I(8) are custom sash, legacy project, yearbook, sign-out banner, coordinator gift (Cap: 9000)
      const sash = typeof c[4]?.v === 'number' ? c[4].v : parseFloat(c[4]?.v) || 0;
      const legacy = typeof c[5]?.v === 'number' ? c[5].v : parseFloat(c[5]?.v) || 0;
      const yearbook = typeof c[6]?.v === 'number' ? c[6].v : parseFloat(c[6]?.v) || 0;
      const banner = typeof c[7]?.v === 'number' ? c[7].v : parseFloat(c[7]?.v) || 0;
      const gift = typeof c[8]?.v === 'number' ? c[8].v : parseFloat(c[8]?.v) || 0;
      
      coreLegacyPaid += (sash + legacy + yearbook + banner + gift);

      // Column J(9) is dinner experience (Cap: 21000)
      const dinner = typeof c[9]?.v === 'number' ? c[9].v : parseFloat(c[9]?.v) || 0;
      dinnerUpgradePaid += dinner;

      // Allocate remaining paid to digital platform (Cap: 1000 per student)
      const allocated = (sash + legacy + yearbook + banner + gift + dinner);
      if (paid > allocated) {
        digitalPlatformPaid += (paid - allocated);
      }
    });

    const targetPerStudent = 31000;
    const totalExpected = Math.max(1, studentCount) * targetPerStudent;
    const percentage = Math.min(100, Math.round((totalPaid / totalExpected) * 100));

    // Clean summary data per specification
    const summary = {
      totalPaid,
      totalExpected,
      percentage,
      studentCount,
      breakdown: [
        {
          category: "Core Legacy & Projects",
          description: "Custom Sash, Legacy Project, Class Yearbook, Sign-Out Banner, Coordinator Gift",
          paid: coreLegacyPaid,
          target: Math.max(1, studentCount) * 9000,
          cap: 9000,
        },
        {
          category: "Dinner & Awards Experience",
          description: "Venue, catering, awards ceremony, and entertainment",
          paid: dinnerUpgradePaid,
          target: Math.max(1, studentCount) * 21000,
          cap: 21000,
        },
        {
          category: "Digital Platform & Hosting",
          description: "Domain, continuous hosting, and data infrastructure",
          paid: digitalPlatformPaid,
          target: Math.max(1, studentCount) * 1000,
          cap: 1000,
        }
      ],
      fetchedAt: new Date().toISOString(),
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(summary),
    };
  } catch (error: any) {
    console.error("Error fetching finance proxy:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Failed to load finance data", details: error?.message }),
    };
  }
};
