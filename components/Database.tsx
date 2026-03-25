
import React, { useMemo } from 'react';
import { ReportRecord } from '../types';
import { getDistrictSummary } from '../utils';
import { DISTRICTS, REPORTING_PERIODS } from '../constants';

interface DatabaseProps {
  records: ReportRecord[];
  selectedMonth: string;
  selectedDistrict: string;
  onMonthChange: (m: string) => void;
  onDistrictChange: (d: string) => void;
}

const Database: React.FC<DatabaseProps> = ({ 
  records, selectedMonth, selectedDistrict, onMonthChange, onDistrictChange 
}) => {
  
  const displayRecords = useMemo(() => {
    return records.filter(r => {
      const matchMonth = selectedMonth === 'all' || `${r.month}-${r.year}` === selectedMonth;
      const matchDistrict = selectedDistrict === 'all' || r.district_id === selectedDistrict;
      return matchMonth && matchDistrict;
    }).sort((a, b) => {
      // Sort by Year desc, then Month Index desc
      if (a.year !== b.year) return b.year - a.year;
      return 0; // Simplified for this set
    });
  }, [records, selectedMonth, selectedDistrict]);

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const StatusPill = ({ reported, ontime }: { reported: boolean, ontime: boolean }) => {
    if (reported) {
      if (ontime) {
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">ตรงเวลา</span>;
      }
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">เกินเวลา</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">ยังไม่รายงาน</span>;
  };

  const RatingPill = ({ record }: { record: ReportRecord }) => {
    const summary = getDistrictSummary(record);
    const colors = {
      'A': 'bg-emerald-100 text-emerald-800',
      'B': 'bg-blue-100 text-blue-800',
      'C': 'bg-amber-100 text-amber-800',
      'D': 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm ${colors[summary.rating]}`}>
        {summary.rating}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-md">ฐานข้อมูลการรายงาน</h2>
        
        <div className="flex flex-wrap gap-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
          <div className="flex flex-col">
            <label className="text-xs text-blue-100 mb-1 font-medium">งวดการรายงาน</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-white/90 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400 min-w-[160px]"
            >
              <option value="all">ทุกงวด</option>
              {REPORTING_PERIODS.map(p => (
                <option key={`${p.month}-${p.year}`} value={`${p.month}-${p.year}`}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-blue-100 mb-1 font-medium">อำเภอ</label>
            <select 
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-white/90 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400 min-w-[140px]"
            >
              <option value="all">ทุกอำเภอ</option>
              {DISTRICTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-white uppercase bg-gradient-to-r from-[#667eea] to-[#764ba2]">
              <tr>
                <th className="px-6 py-4 font-semibold">อำเภอ</th>
                <th className="px-6 py-4 font-semibold">เดือนที่รายงาน</th>
                <th className="px-6 py-4 font-semibold">สถานะ จปฐ.</th>
                <th className="px-6 py-4 font-semibold">เวลาส่ง จปฐ.</th>
                <th className="px-6 py-4 font-semibold">สถานะ 5+1</th>
                <th className="px-6 py-4 font-semibold">เวลาส่ง 5+1</th>
                <th className="px-6 py-4 font-semibold text-center">เกรด</th>
              </tr>
            </thead>
            <tbody>
              {displayRecords.length > 0 ? (
                displayRecords.map((record) => {
                  const summary = getDistrictSummary(record);
                  return (
                    <tr key={record.id} className="bg-white border-b hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{record.district_name}</td>
                      <td className="px-6 py-4 font-medium">{record.month} {record.year + 543}</td>
                      <td className="px-6 py-4">
                        <StatusPill reported={record.jpth_status === 'reported'} ontime={summary.jpth_ontime} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{formatDate(record.jpth_timestamp)}</td>
                      <td className="px-6 py-4">
                        <StatusPill reported={record.issue_5plus1_status === 'reported'} ontime={summary.issue_ontime} />
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-mono text-xs">{formatDate(record.issue_5plus1_timestamp)}</td>
                      <td className="px-6 py-4 text-center">
                        <RatingPill record={record} />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl mb-3">📊</div>
                      <p className="font-medium">ไม่พบข้อมูลตามเงื่อนไขที่เลือก</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Database;
