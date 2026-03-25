
export interface District {
  id: string;
  name: string;
}

export type ReportingStatus = 'reported' | 'not_reported';
export type Rating = 'A' | 'B' | 'C' | 'D';

export interface ReportRecord {
  id: string;
  district_id: string;
  district_name: string;
  month: string;
  year: number; // Christian Year
  jpth_status: ReportingStatus;
  jpth_timestamp: string | null;
  issue_5plus1_status: ReportingStatus;
  issue_5plus1_timestamp: string | null;
}

export interface DistrictSummary {
  district_id: string;
  district_name: string;
  month: string;
  year: number;
  jpth_status: ReportingStatus;
  jpth_ontime: boolean;
  issue_status: ReportingStatus;
  issue_ontime: boolean;
  rating: Rating;
}

export type Page = 'dashboard' | 'districts' | 'database' | 'report';
