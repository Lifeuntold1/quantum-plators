import type { ImageMetadata } from 'astro';

// Import all images in assets directory at build time (supporting standard, iPhone HEIC, and uppercase variations)
const imageFiles = import.meta.glob<{ default: ImageMetadata }>('/assets/images/**/*.{png,jpg,jpeg,webp,gif,HEIC,heic,HEIF,heif,PNG,JPG,JPEG,WEBP,GIF}', { eager: true });
const videoFiles = import.meta.glob('/assets/videos/**/*.{mp4,webm,mov,MP4,WEBM,MOV}', { eager: true, import: 'default' });

export interface MediaItem {
  path: string;
  filename: string;
  metadata: ImageMetadata;
}

export function getProfImages(): MediaItem[] {
  const results: MediaItem[] = [];
  for (const [path, mod] of Object.entries(imageFiles)) {
    if (path.startsWith('/assets/images/prof/')) {
      const filename = path.split('/').pop() || '';
      results.push({
        path,
        filename,
        metadata: mod.default,
      });
    }
  }
  return results.sort((a, b) => a.filename.localeCompare(b.filename));
}

export function getSlideshowImages(): MediaItem[] {
  const results: MediaItem[] = [];
  for (const [path, mod] of Object.entries(imageFiles)) {
    if (path.startsWith('/assets/images/slideshow/')) {
      const filename = path.split('/').pop() || '';
      results.push({
        path,
        filename,
        metadata: mod.default,
      });
    }
  }
  return results.sort((a, b) => a.filename.localeCompare(b.filename));
}

export function getStudentImages(): MediaItem[] {
  const results: MediaItem[] = [];
  for (const [path, mod] of Object.entries(imageFiles)) {
    if (path.startsWith('/assets/images/students/')) {
      const filename = path.split('/').pop() || '';
      results.push({
        path,
        filename,
        metadata: mod.default,
      });
    }
  }
  return results;
}

export function matchStudentPhoto(matricNumber?: string, fullName?: string, nickname?: string): ImageMetadata | null {
  const studentImages = getStudentImages();
  if (studentImages.length === 0) return null;

  const clean = (str?: string) => (str || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
  const normMatric = clean(matricNumber);
  
  // Split full name and nickname into meaningful word tokens (e.g. HARUNA, THURAM, ENE, JOY)
  const nameTokens: string[] = [];
  if (fullName) {
    fullName.split(/[\s,-]+/).forEach(token => {
      const cleaned = clean(token);
      if (cleaned.length >= 2) nameTokens.push(cleaned);
    });
    nameTokens.push(clean(fullName));
  }
  if (nickname) {
    nickname.split(/[\s,-]+/).forEach(token => {
      const cleaned = clean(token);
      if (cleaned.length >= 2) nameTokens.push(cleaned);
    });
    nameTokens.push(clean(nickname));
  }

  for (const img of studentImages) {
    const filenameNoExt = img.filename.substring(0, img.filename.lastIndexOf('.')) || img.filename;
    const normFile = clean(filenameNoExt);
    const fileTokens = filenameNoExt.toLowerCase().split(/[\s,._-]+/).map(clean).filter(Boolean);

    // 1. Exact matric number match
    if (normMatric && normFile === normMatric) {
      return img.metadata;
    }

    // 2. Exact match of file name to any student name token or combination
    if (nameTokens.length > 0) {
      // Check if filename equals one of their names directly (e.g., "Thuram.jpg" matches "HARUNA MICHEAL THURAM")
      if (nameTokens.includes(normFile)) {
        return img.metadata;
      }
      // Check if all words in filename appear in student's full name (e.g., "Queen Ogwuche.png")
      if (fileTokens.length > 0 && fileTokens.every(ft => nameTokens.includes(ft))) {
        return img.metadata;
      }
      // Check if any significant token in the filename (length >= 3) matches a unique student token
      if (fileTokens.some(ft => ft.length >= 3 && nameTokens.includes(ft))) {
        return img.metadata;
      }
    }
  }

  return null;
}

export function auditStudentPhotos(students: { matricNumber?: string; fullName?: string; nickname?: string }[]): void {
  const studentImages = getStudentImages();
  if (studentImages.length === 0) {
    console.warn("[Media Matching] /assets/images/students/ is currently empty. Text-only cards will be used.");
    return;
  }
  
  const allTokens = new Set<string>();
  students.forEach(s => {
    if (s.matricNumber) allTokens.add(s.matricNumber.replace(/[^a-z0-9]/gi, '').toLowerCase());
    if (s.fullName) {
      s.fullName.split(/[\s,-]+/).forEach(t => {
        const cleaned = t.replace(/[^a-z0-9]/gi, '').toLowerCase();
        if (cleaned.length >= 2) allTokens.add(cleaned);
      });
      allTokens.add(s.fullName.replace(/[^a-z0-9]/gi, '').toLowerCase());
    }
    if (s.nickname) {
      allTokens.add(s.nickname.replace(/[^a-z0-9]/gi, '').toLowerCase());
    }
  });

  for (const img of studentImages) {
    const filenameNoExt = img.filename.substring(0, img.filename.lastIndexOf('.')) || img.filename;
    const normFile = filenameNoExt.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const fileTokens = filenameNoExt.toLowerCase().split(/[\s,._-]+/).map(t => t.replace(/[^a-z0-9]/gi, '')).filter(Boolean);

    const isMatched = allTokens.has(normFile) || fileTokens.some(t => allTokens.has(t));
    if (!isMatched) {
      console.warn(`[Media Matching] FLAG: Unmatched photo found in /assets/images/students/: ${img.filename}`);
    }
  }
}

export function getEventDayImages(dayFolder: string): MediaItem[] {
  const results: MediaItem[] = [];
  const targetPrefix = `/${dayFolder.replace(/^\/+/, '')}`;
  
  for (const [path, mod] of Object.entries(imageFiles)) {
    if (path.startsWith(targetPrefix)) {
      const filename = path.split('/').pop() || '';
      results.push({
        path,
        filename,
        metadata: mod.default,
      });
    }
  }
  return results.sort((a, b) => a.filename.localeCompare(b.filename));
}

export function getAllGallerySectioned(): { id: string; title: string; date?: string; items: MediaItem[] }[] {
  const sections: { id: string; title: string; date?: string; items: MediaItem[] }[] = [];
  
  // Master vault event folders including group shots and FYB week memories
  const eventSections = [
    { folder: 'assets/images/events/fyb-week/2026-07-20-corporate-day', title: 'Corporate Day (FYB Week)', date: '2026-07-20' },
    { folder: 'assets/images/events/fyb-week/2026-07-21-denim-on-denim', title: 'Denim on Denim (FYB Week)', date: '2026-07-21' },
    { folder: 'assets/images/events/fyb-week/2026-07-22-jersey-day', title: 'Jersey Day (FYB Week)', date: '2026-07-22' },
    { folder: 'assets/images/events/fyb-week/2026-07-23-old-school-costume', title: 'Old School Costume (FYB Week)', date: '2026-07-23' },
    { folder: 'assets/images/events/fyb-week/2026-07-24-cultural-day', title: 'Cultural Day (FYB Week)', date: '2026-07-24' },
    { folder: 'assets/images/events/fyb-week/2026-07-25-class-picnic-signout', title: 'Class Picnic (FYB Week)', date: '2026-07-25' },
    { folder: 'assets/images/events/dinner-night', title: 'Dinner & Awards Night', date: 'TBD' },
    { folder: 'assets/images/prof', title: 'Prof. E.W. Mangset Memorial Vault', date: 'Class of 2024' }
  ];

  for (const s of eventSections) {
    const items = getEventDayImages(s.folder);
    sections.push({
      id: s.folder.split('/').pop() || '',
      title: s.title,
      date: s.date,
      items
    });
  }

  return sections;
}
