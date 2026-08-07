import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  try {
    // Single source of truth config sheet ID
    const sheetId = "123L0bms0FDQcheS0O_46Nxc_XFj6-2xFXN7V2hvjsE4";
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch student sheet: ${response.statusText}`);
    }

    const text = await response.text();
    // Strip google.visualization.Query.setResponse wrapper
    const match = text.match(/google\.visualization\.Query\.setResponse\((.+)\)/s);
    if (!match || !match[1]) {
      throw new Error("Invalid response format from Google Visualization API");
    }

    const json = JSON.parse(match[1]);
    const table = json.table;
    const rows = table?.rows || [];

    // Determine headers from row 0 if Timestamp is in row 0
    let startIndex = 0;
    const headers: string[] = [];
    
    if (rows.length > 0 && rows[0].c && rows[0].c[0]?.v === "Timestamp") {
      rows[0].c.forEach((cell: any, index: number) => {
        headers[index] = cell?.v ? String(cell.v).trim() : `Column_${index}`;
      });
      startIndex = 1;
    } else {
      // Fallback to table.cols label if available
      table?.cols?.forEach((col: any, index: number) => {
        headers[index] = col?.label ? String(col.label).trim() : `Column_${index}`;
      });
    }

    const students: any[] = [];
    
    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i]?.c || [];
      if (!row || row.length === 0) continue;

      const fullName = row[1]?.v ? String(row[1].v).trim() : "";
      const matricNumber = row[3]?.v ? String(row[3].v).trim() : "";
      
      // Skip empty or filler rows
      if (!fullName && !matricNumber) continue;

      const student: Record<string, any> = {
        fullName: fullName || null,
        nickname: row[2]?.v ? String(row[2].v).trim() : null,
        matricNumber: matricNumber || null,
        birthday: row[4]?.v ? String(row[4].v).trim() : null,
        stateOfOrigin: row[5]?.v ? String(row[5].v).trim() : null,
        hobbies: row[6]?.v ? String(row[6].v).trim() : null,
        relationshipStatus: row[7]?.v ? String(row[7].v).trim() : null,
        partingWords: row[8]?.v ? String(row[8].v).trim() : null,
        shoutOut: row[9]?.v ? String(row[9].v).trim() : null,
        socialHandles: row[10]?.v ? String(row[10].v).trim() : null,
      };

      // Create clean URL slug from full name or matric number
      const baseForSlug = fullName || matricNumber || `student-${i}`;
      const slug = baseForSlug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Strict data rule: omit null or empty fields entirely
      const cleanStudent: Record<string, any> = { slug };
      Object.entries(student).forEach(([key, value]) => {
        if (value !== null && value !== "" && value !== undefined) {
          cleanStudent[key] = value;
        }
      });

      students.push(cleanStudent);
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5-minute server-side cache
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        students,
        fetchedAt: new Date().toISOString(),
      }),
    };
  } catch (error: any) {
    console.error("Error fetching students proxy:", error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: "Failed to load student data", details: error?.message }),
    };
  }
};
