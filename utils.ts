
import { DISTRICTS, MONTHS, JPTH_SHEET_ID, ISSUE_SHEET_ID, CORS_PROXY, REPORTING_PERIODS } from './constants';
import { ReportRecord, DistrictSummary, ReportingStatus } from './types';

const MONTH_MAP: { [key: string]: number } = {
  'มกราคม': 0, 'กุมภาพันธ์': 1, 'มีนาคม': 2, 'เมษายน': 3, 'พฤษภาคม': 4, 'มิถุนายน': 5,
  'กรกฎาคม': 6, 'สิงหาคม': 7, 'กันยายน': 8, 'ตุลาคม': 9, 'พฤศจิกายน': 10, 'ธันวาคม': 11
};

/**
 * Advanced normalization for Thai strings used for value matching.
 * Removes spaces, invisible characters, and common prefixes.
 */
function normalizeThaiValue(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .replace(/\s+/g, '') 
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/อำเภอ/g, '') 
    .replace(/อ\./g, '');   
}

/**
 * Lightweight normalization for header detection.
 */
function normalizeHeader(str: string): string {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * Parses date string from Google Sheets.
 */
function parseSheetDate(dateStr: string): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  try {
    const cleanStr = dateStr.replace(/,/g, '').trim();
    const parts = cleanStr.split(/\s+/);
    const datePart = parts[0];
    const timePart = parts.length > 1 ? parts[1] : '00:00:00';

    const separators = /[\/\-\.]/;
    const dateSegments = datePart.split(separators);
    if (dateSegments.length !== 3) return null;

    let day, month, year;
    const p1 = parseInt(dateSegments[0]);
    const p2 = parseInt(dateSegments[1]);
    const p3 = parseInt(dateSegments[2]);

    if (p1 > 31) {
      year = p1; month = p2 - 1; day = p3;
    } else {
      day = p1; month = p2 - 1; year = p3;
    }

    if (year > 2400) year -= 543;
    if (year < 100) year += 2000;

    const timeSegments = timePart.split(':');
    const hour = parseInt(timeSegments[0] || '0');
    const minute = parseInt(timeSegments[1] || '0');
    const second = parseInt(timeSegments[2] || '0');

    const dateObj = new Date(year, month, day, hour, minute, second);
    return isNaN(dateObj.getTime()) ? null : dateObj.toISOString();
  } catch (e) {
    return null;
  }
}

export const isOnTime = (timestamp: string | null, monthName: string, targetYear: number): boolean => {
  if (!timestamp) return false;
  const submitDate = new Date(timestamp);
  const targetMonthIndex = MONTH_MAP[monthName];
  if (targetMonthIndex === undefined) return false;
  
  const deadline = new Date(targetYear, targetMonthIndex, 15, 23, 59, 59);
  return submitDate <= deadline;
};

export const calculateRating = (
  jpthStatus: ReportingStatus,
  jpthOntime: boolean,
  issueStatus: ReportingStatus,
  issueOntime: boolean
): 'A' | 'B' | 'C' | 'D' => {
  const jpthReported = jpthStatus === 'reported';
  const issueReported = issueStatus === 'reported';

  if (jpthReported && issueReported && jpthOntime && issueOntime) return 'A';
  if (jpthReported && issueReported && (jpthOntime || issueOntime)) return 'B';
  if (jpthReported && issueReported) return 'C';
  if ((jpthReported && jpthOntime) || (issueReported && issueOntime)) return 'B';
  return 'D';
};

export const getDistrictSummary = (record: ReportRecord): DistrictSummary => {
  const jpthOntime = isOnTime(record.jpth_timestamp, record.month, record.year);
  const issueOntime = isOnTime(record.issue_5plus1_timestamp, record.month, record.year);
  
  return {
    district_id: record.district_id,
    district_name: record.district_name,
    month: record.month,
    year: record.year,
    jpth_status: record.jpth_status,
    jpth_ontime: jpthOntime,
    issue_status: record.issue_5plus1_status,
    issue_ontime: issueOntime,
    rating: calculateRating(record.jpth_status, jpthOntime, record.issue_5plus1_status, issueOntime)
  };
};

async function fetchCSV(sheetId: string): Promise<string[][]> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&cache_bust=${Date.now()}`;
  const corsUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(corsUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    try {
        const fallbackUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(fallbackUrl);
        const text = await response.text();
        return parseCSV(text);
    } catch (e) {
        console.error("CSV fetch failed for", sheetId);
        return [];
    }
  }
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (inQuotes) {
      if (char === '"' && nextChar === '"') { currentField += '"'; i++; }
      else if (char === '"') inQuotes = false;
      else currentField += char;
    } else {
      if (char === '"') inQuotes = true;
      else if (char === ',') { currentRow.push(currentField.trim()); currentField = ''; }
      else if (char === '\n' || char === '\r') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.length > 0) rows.push(currentRow);
        currentRow = [];
        if (char === '\r' && nextChar === '\n') i++;
      } else { currentField += char; }
    }
  }
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    rows.push(currentRow);
  }
  return rows;
}

interface SheetEntry {
  timestamp: string;
  districtId: string;
  monthName: string;
}

function processSheetData(rows: string[][], label: string): SheetEntry[] {
  if (rows.length < 2) return [];
  
  // Use light normalization for header search to avoid stripping keywords like 'อำเภอ'
  const rawHeaders = rows[0].map(h => h.trim());
  const normHeaders = rawHeaders.map(normalizeHeader);
  
  // Find indices using multiple possible matches
  const timestampIdx = normHeaders.findIndex(h => h.includes('เวลา') || h.includes('ประทับ') || h.includes('time'));
  const districtIdx = normHeaders.findIndex(h => h.includes('อำเภอ') || h.includes('district') || h === 'อ.' || h.includes('หน่วยงาน'));
  const monthIdx = normHeaders.findIndex(h => h.includes('เดือน') || h.includes('month'));

  if (timestampIdx === -1 || districtIdx === -1 || monthIdx === -1) {
    console.error(`Columns not found in ${label} sheet. Headers:`, rawHeaders);
    return [];
  }

  const entries: SheetEntry[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const rawTimestamp = row[timestampIdx];
    const timestamp = parseSheetDate(rawTimestamp);
    if (!timestamp) continue;

    const rawDistrict = normalizeThaiValue((row[districtIdx] || ''));
    const matchedDistrict = DISTRICTS.find(d => {
        const normName = normalizeThaiValue(d.name);
        return rawDistrict === normName || rawDistrict.includes(normName) || normName.includes(rawDistrict);
    });
    
    if (!matchedDistrict) continue;

    const rawMonth = normalizeThaiValue((row[monthIdx] || ''));
    const foundMonth = MONTHS.find(m => rawMonth.includes(normalizeThaiValue(m)));
    if (!foundMonth) continue;

    entries.push({ 
      timestamp, 
      districtId: matchedDistrict.id, 
      monthName: foundMonth 
    });
  }
  console.log(`[${label}] Successfully processed ${entries.length} records.`);
  return entries;
}

const CACHE_KEY = 'nan_province_performance_data';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const fetchData = async (forceRefresh = false): Promise<ReportRecord[]> => {
  // 1. Check Cache
  if (!forceRefresh) {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_TTL) {
          console.log('Using cached data (Age: ' + Math.round((Date.now() - timestamp) / 1000) + 's)');
          return data;
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }
  }

  console.log('Fetching fresh data from Google Sheets...');
  const [jpthRaw, issueRaw] = await Promise.all([
    fetchCSV(JPTH_SHEET_ID),
    fetchCSV(ISSUE_SHEET_ID)
  ]);

  const jpthEntries = processSheetData(jpthRaw, 'JPTH');
  const issueEntries = processSheetData(issueRaw, 'Issue 5+1');
  
  // 2. Pre-index entries for faster lookup O(N)
  const createEntryMap = (entries: SheetEntry[]) => {
    const map = new Map<string, SheetEntry[]>();
    entries.forEach(e => {
      const normMonth = normalizeThaiValue(e.monthName);
      const key = `${e.districtId}-${normMonth}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    // Sort each group by timestamp descending
    map.forEach(list => {
      list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    });
    return map;
  };

  const jpthMap = createEntryMap(jpthEntries);
  const issueMap = createEntryMap(issueEntries);

  const records: ReportRecord[] = [];

  REPORTING_PERIODS.forEach(period => {
    const normPeriodMonth = normalizeThaiValue(period.month);
    
    DISTRICTS.forEach(district => {
      const key = `${district.id}-${normPeriodMonth}`;
      
      const findMatch = (map: Map<string, SheetEntry[]>) => {
        const matches = map.get(key) || [];
        // Filter by year (approximate)
        return matches.find(e => {
          const tsYear = new Date(e.timestamp).getFullYear();
          return Math.abs(tsYear - period.year) <= 1;
        });
      };

      const jpthMatch = findMatch(jpthMap);
      const issueMatch = findMatch(issueMap);

      records.push({
        id: `${district.id}-${period.month}-${period.year}`,
        district_id: district.id,
        district_name: district.name,
        month: period.month,
        year: period.year,
        jpth_status: jpthMatch ? 'reported' : 'not_reported',
        jpth_timestamp: jpthMatch ? jpthMatch.timestamp : null,
        issue_5plus1_status: issueMatch ? 'reported' : 'not_reported',
        issue_5plus1_timestamp: issueMatch ? issueMatch.timestamp : null,
      });
    });
  });

  // 3. Save to Cache
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data: records,
    timestamp: Date.now()
  }));

  return records;
};
