import configData from '../../data/config.json';
import awardsData from '../../data/awards.json';
import fybWeekData from '../../data/fyb-week.json';
import opportunitiesData from '../../data/opportunities.json';
import rosterData from '../../data/students-roster.json';
import { auditStudentPhotos, matchStudentPhoto } from './media';
import type { ImageMetadata } from 'astro';

export interface Student {
  slug: string;
  fullName?: string;
  nickname?: string;
  matricNumber?: string;
  birthday?: string;
  stateOfOrigin?: string;
  hobbies?: string;
  relationshipStatus?: string;
  partingWords?: string;
  shoutOut?: string;
  socialHandles?: string;
  photo?: ImageMetadata | null;
  nominations?: { categoryName: string; categoryId: string; votes: number }[];
  isCompleteProfile?: boolean;
}

export interface FinanceSummary {
  totalPaid: number;
  totalExpected: number;
  percentage: number;
  studentCount: number;
  breakdown: {
    category: string;
    description: string;
    paid: number;
    target: number;
    cap: number;
  }[];
  fetchedAt: string;
}

export async function getStudents(): Promise<Student[]> {
  // Initialize student baseline from verified 400-Level departmental roster
  const rosterMap = new Map<string, Student>();
  const slugToKeyMap = new Map<string, string>();
  
  rosterData.forEach((item: any) => {
    const matricKey = item.matricNumber ? String(item.matricNumber).trim().toLowerCase() : undefined;
    const nameKey = item.fullName ? String(item.fullName).trim().toLowerCase() : item.slug;
    const primaryKey = matricKey || nameKey;
    
    const student: Student = {
      slug: item.slug,
      fullName: item.fullName,
      matricNumber: item.matricNumber || undefined,
      photo: matchStudentPhoto(item.matricNumber, item.fullName),
      nominations: getStudentNominations(item.fullName),
      isCompleteProfile: false,
    };
    
    rosterMap.set(primaryKey, student);
    if (nameKey) slugToKeyMap.set(nameKey, primaryKey);
  });

  try {
    // Attempt live synchronization with Google Sheets responses via gviz endpoint
    const sheetId = configData.sheets.students;
    const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
    
    const response = await fetch(url);
    if (response.ok) {
      const text = await response.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\((.+)\)/s);
      
      if (match && match[1]) {
        const json = JSON.parse(match[1]);
        const cols = json.table?.cols || [];
        const rows = json.table?.rows || [];
        
        // Dynamically resolve column indexes by label or fallback to default Form sequence
        const getColIdx = (keywords: string[], defaultIdx: number) => {
          const found = cols.findIndex((c: any) => c && c.label && keywords.some(k => c.label.toLowerCase().includes(k)));
          return found >= 0 ? found : defaultIdx;
        };

        const idxName = getColIdx(['name', 'full name'], 1);
        const idxNick = getColIdx(['nickname', 'nick'], 2);
        const idxMatric = getColIdx(['matric', 'id', 'number'], 3);
        const idxBirth = getColIdx(['birth', 'dob', 'date of birth'], 4);
        const idxState = getColIdx(['state', 'origin'], 5);
        const idxHobbies = getColIdx(['hobby', 'hobbies', 'interest'], 6);
        const idxRel = getColIdx(['relationship', 'status'], 7);
        const idxParting = getColIdx(['parting', 'words', 'quote'], 8);
        const idxShout = getColIdx(['shout', 'special'], 9);
        const idxSocial = getColIdx(['social', 'handle', 'instagram', 'twitter'], 10);

        // Helper to normalize strings for intelligent profile linking
        const normalizeMatric = (m: string) => m.toLowerCase().replace(/[^a-z0-9]/g, '');
        const getMatricDigits = (m: string) => m.replace(/[^0-9]/g, '');
        const normalizeName = (n: string) => n.toLowerCase().replace(/[^a-z]/g, ' ').trim().split(/\s+/).sort().join(' ');

        let startIndex = (rows.length > 0 && rows[0].c && rows[0].c[0]?.v === "Timestamp") ? 1 : 0;

        for (let i = startIndex; i < rows.length; i++) {
          const r = rows[i]?.c || [];
          if (!r || r.length === 0) continue;
          
          const fullName = r[idxName]?.v ? String(r[idxName].v).trim() : undefined;
          const nickname = r[idxNick]?.v ? String(r[idxNick].v).trim() : undefined;
          const matricNumber = r[idxMatric]?.v ? String(r[idxMatric].v).trim() : undefined;
          
          if (!fullName && !matricNumber) continue;

          // Attempt precise profile linking against roster
          let matchedKey: string | undefined = undefined;
          const targetMatricNorm = matricNumber ? normalizeMatric(matricNumber) : '';
          const targetMatricDigits = matricNumber ? getMatricDigits(matricNumber) : '';
          const targetNameNorm = fullName ? normalizeName(fullName) : '';

          for (const [key, student] of rosterMap.entries()) {
            if (student.matricNumber && targetMatricNorm && normalizeMatric(student.matricNumber) === targetMatricNorm) {
              matchedKey = key;
              break;
            }
            if (student.matricNumber && targetMatricDigits && targetMatricDigits.length >= 4 && getMatricDigits(student.matricNumber).endsWith(targetMatricDigits)) {
              matchedKey = key;
              break;
            }
            if (student.fullName && targetNameNorm && normalizeName(student.fullName) === targetNameNorm) {
              matchedKey = key;
              break;
            }
          }

          const existing: Student = matchedKey ? (rosterMap.get(matchedKey) as Student) : {
            slug: (fullName || matricNumber || `student-${i}`)
              .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            fullName,
            matricNumber,
          };

          const getCellVal = (idx: number, fallback?: string) => {
            const v = r[idx]?.v ? String(r[idx].v).trim() : undefined;
            return (v && v !== 'null' && v !== 'undefined') ? v : fallback;
          };

          // Merge synchronized sheet parameters over roster baseline
          const updated: Student = {
            ...existing,
            fullName: fullName || existing.fullName,
            nickname: nickname || existing.nickname,
            matricNumber: matricNumber || existing.matricNumber,
            birthday: getCellVal(idxBirth, existing.birthday),
            stateOfOrigin: getCellVal(idxState, existing.stateOfOrigin),
            hobbies: getCellVal(idxHobbies, existing.hobbies),
            relationshipStatus: getCellVal(idxRel, existing.relationshipStatus),
            partingWords: getCellVal(idxParting, existing.partingWords),
            shoutOut: getCellVal(idxShout, existing.shoutOut),
            socialHandles: getCellVal(idxSocial, existing.socialHandles),
            isCompleteProfile: true,
          };

          updated.photo = matchStudentPhoto(updated.matricNumber, updated.fullName, updated.nickname) || existing.photo;
          updated.nominations = getStudentNominations(updated.fullName);

          const finalKey = matchedKey || updated.matricNumber || updated.slug;
          rosterMap.set(finalKey, updated);
          if (fullName) slugToKeyMap.set(fullName.toLowerCase(), finalKey);
        }
      }
    }
  } catch (err) {
    console.warn("Notice: Live spreadsheet synchronization offline or unseeded; rendering verified departmental roster baseline.", err);
  }

  const allStudents = Array.from(rosterMap.values());

  // Assign any discovered photography and evaluate complete profile status
  allStudents.forEach(s => {
    if (!s.photo) s.photo = matchStudentPhoto(s.matricNumber, s.fullName, s.nickname);
    s.isCompleteProfile = Boolean(s.nickname || s.partingWords || s.hobbies || s.shoutOut || s.photo);
  });

  // Sort alphabetically by full name for immaculate presentation
  allStudents.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));

  // Audit and flag unmatched student photos per specification
  auditStudentPhotos(allStudents);

  return allStudents;
}

export async function getFinance(): Promise<FinanceSummary> {
  // Fetching disabled per request. Returning static breakdown categories only.
  return {
    totalPaid: 0,
    totalExpected: 70 * 30000,
    percentage: 0,
    studentCount: 70,
    breakdown: [
      {
        category: "Core Legacy & Projects",
        description: "Custom Sash, Legacy Project, Class Yearbook, Sign-Out Banner, Coordinator Gift",
        paid: 0,
        target: 0,
        cap: 9000,
      },
      {
        category: "Dinner & Awards Experience",
        description: "Venue, catering, awards ceremony, and entertainment",
        paid: 0,
        target: 0,
        cap: 20000,
      },
      {
        category: "Digital Platform & Hosting",
        description: "Domain, continuous hosting, and data infrastructure",
        paid: 0,
        target: 0,
        cap: 1000,
      }
    ],
    fetchedAt: new Date().toISOString(),
  };
}

export function getStudentNominations(fullName?: string) {
  if (!fullName) return [];
  
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const getTokens = (s: string) => s.toLowerCase().split(/[\s,-]+/).map(clean).filter(t => t.length > 2);
  const nameTokens = getTokens(fullName);
  
  const results: { categoryName: string; categoryId: string; votes: number }[] = [];
  
  awardsData.categories.forEach(cat => {
    cat.nominees.forEach(nom => {
      // Remove any brackets e.g. (Jasperlite) and ignore everything after a dash (e.g. brand names)
      const personPart = nom.name.split('-')[0].replace(/\(.*\)/g, '');
      const nomTokens = getTokens(personPart);
      
      if (nomTokens.length === 0) return;

      // Check if every token in the nominee name is contained within the student's full name tokens
      // Allows for partial token matches (e.g. 'Mayowa' matching 'Oluwamayowa')
      const isMatch = nomTokens.every(nomToken => 
        nameTokens.some(nameToken => nameToken.includes(nomToken) || nomToken.includes(nameToken))
      );
      
      // Fallback for exact string inclusion just in case tokenizer misses something short
      const exactMatch = clean(fullName).includes(clean(personPart)) || clean(personPart).includes(clean(fullName));

      if (isMatch || exactMatch) {
        results.push({
          categoryName: cat.name,
          categoryId: cat.id,
          votes: nom.votes || 0
        });
      }
    });
  });
  
  return results;
}

export function auditAwardNominations(students: Student[]): void {
  const studentNames = new Set(students.map(s => s.fullName ? s.fullName.trim().toLowerCase() : '').filter(Boolean));
  awardsData.categories.forEach(cat => {
    cat.nominees.forEach(nom => {
      const norm = nom.name.trim().toLowerCase();
      if (!studentNames.has(norm) && studentNames.size > 0) {
        console.warn(`[Awards Audit] Nominee name "${nom.name}" in category "${cat.name}" does not match any student Full Name in the spreadsheet.`);
      }
    });
  });
}

export function getConfig() {
  return configData;
}

export function getAwards() {
  return awardsData;
}

export function getFybWeek() {
  return fybWeekData;
}

export function getOpportunities() {
  const now = new Date().getTime();
  const valid = (opportunitiesData.opportunities || []).filter((opp: any) => {
    if (!opp.expiryDate) return true;
    return new Date(opp.expiryDate).getTime() >= now;
  });
  return valid;
}
