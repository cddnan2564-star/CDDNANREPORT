
import { District } from './types';

export const DISTRICTS: District[] = [
  { id: '1', name: 'เมืองน่าน' },
  { id: '2', name: 'แม่จริม' },
  { id: '3', name: 'บ้านหลวง' },
  { id: '4', name: 'นาน้อย' },
  { id: '5', name: 'ปัว' },
  { id: '6', name: 'ท่าวังผา' },
  { id: '7', name: 'เวียงสา' },
  { id: '8', name: 'ทุ่งช้าง' },
  { id: '9', name: 'เชียงกลาง' },
  { id: '10', name: 'นาหมื่น' },
  { id: '11', name: 'สันติสุข' },
  { id: '12', name: 'บ่อเกลือ' },
  { id: '13', name: 'สองแคว' },
  { id: '14', name: 'ภูเพียง' },
  { id: '15', name: 'เฉลิมพระเกียรติ' }
];

export const MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export interface ReportingPeriod {
  month: string;
  year: number; // Christian Year
  label: string; // Thai Label
}

export const REPORTING_PERIODS: ReportingPeriod[] = [
  { month: 'ตุลาคม', year: 2025, label: 'ตุลาคม 2568' },
  { month: 'พฤศจิกายน', year: 2025, label: 'พฤศจิกายน 2568' },
  { month: 'ธันวาคม', year: 2025, label: 'ธันวาคม 2568' },
  { month: 'มกราคม', year: 2026, label: 'มกราคม 2569' },
  { month: 'กุมภาพันธ์', year: 2026, label: 'กุมภาพันธ์ 2569' },
  { month: 'มีนาคม', year: 2026, label: 'มีนาคม 2569' },
  { month: 'เมษายน', year: 2026, label: 'เมษายน 2569' },
  { month: 'พฤษภาคม', year: 2026, label: 'พฤษภาคม 2569' },
  { month: 'มิถุนายน', year: 2026, label: 'มิถุนายน 2569' },
  { month: 'กรกฎาคม', year: 2026, label: 'กรกฎาคม 2569' },
  { month: 'สิงหาคม', year: 2026, label: 'สิงหาคม 2569' },
  { month: 'กันยายน', year: 2026, label: 'กันยายน 2569' },
];

export const JPTH_FORM_URL = 'https://forms.gle/EdmYLuoSgmjvn6Wm8';
export const ISSUE_FORM_URL = 'https://forms.gle/ijAuVg8Exb7x1u7UA';

export const JPTH_SHEET_ID = '14HkJZWL_t4P0WW4KLiZs8k2VzdHOto8atXlzbMwm2zo';
export const ISSUE_SHEET_ID = '1nAeYlfjXQgJ-hCgz8aEpAmT8bYJxvgaBgGaipsF7Xz0';

export const CORS_PROXY = 'https://corsproxy.io/?';
