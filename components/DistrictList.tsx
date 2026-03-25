
import React, { useMemo } from 'react';
import { ReportRecord } from '../types';
import { getDistrictSummary } from '../utils';
import { DISTRICTS, REPORTING_PERIODS } from '../constants';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface DistrictListProps {
  records: ReportRecord[];
  selectedMonth: string;
  onMonthChange: (m: string) => void;
}

const DistrictList: React.FC<DistrictListProps> = ({ records, selectedMonth, onMonthChange }) => {
  
  const latestMonthWithData = useMemo(() => {
    for (let i = REPORTING_PERIODS.length - 1; i >= 0; i--) {
      const p = REPORTING_PERIODS[i];
      const hasData = records.some(r => 
        r.month === p.month && 
        r.year === p.year && 
        (r.jpth_status === 'reported' || r.issue_5plus1_status === 'reported')
      );
      if (hasData) return `${p.month}-${p.year}`;
    }
    return `${REPORTING_PERIODS[0].month}-${REPORTING_PERIODS[0].year}`;
  }, [records]);

  const activeMonthKey = selectedMonth === 'all' ? latestMonthWithData : selectedMonth;

  const displayRecords = useMemo(() => {
    const targetPeriod = REPORTING_PERIODS.find(p => `${p.month}-${p.year}` === activeMonthKey);
    if (!targetPeriod) return [];

    // Ensure we iterate over all districts to guarantee 15 cards
    return DISTRICTS.map(d => {
        const found = records.find(r => r.district_id === d.id && r.month === targetPeriod.month && r.year === targetPeriod.year);
        if (found) return found;
        
        // Fallback dummy record if somehow missing from the array (shouldn't happen with updated fetchData)
        return {
          id: `${d.id}-${targetPeriod.month}-${targetPeriod.year}`,
          district_id: d.id,
          district_name: d.name,
          month: targetPeriod.month,
          year: targetPeriod.year,
          jpth_status: 'not_reported',
          jpth_timestamp: null,
          issue_5plus1_status: 'not_reported',
          issue_5plus1_timestamp: null,
        } as ReportRecord;
    });
  }, [records, activeMonthKey]);

  const summaries = useMemo(() => displayRecords.map(getDistrictSummary), [displayRecords]);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A': return 'bg-emerald-100 text-emerald-600';
      case 'B': return 'bg-blue-100 text-blue-600';
      case 'C': return 'bg-amber-100 text-amber-600';
      case 'D': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const StatusBadge = ({ reported, ontime, label }: { reported: boolean, ontime: boolean, label: string }) => {
    let bgColor = 'bg-red-50';
    let textColor = 'text-red-500';
    let icon = <XCircle size={16} />;
    let text = 'ยังไม่รายงาน';

    if (reported) {
      if (ontime) {
        bgColor = 'bg-emerald-50';
        textColor = 'text-emerald-500';
        icon = <CheckCircle2 size={16} />;
        text = 'รายงานแล้ว (ตรงเวลา)';
      } else {
        bgColor = 'bg-amber-50';
        textColor = 'text-amber-500';
        icon = <Clock size={16} />;
        text = 'รายงานแล้ว (เกินเวลา)';
      }
    }

    return (
      <div className={`flex justify-between items-center p-3 rounded-lg ${bgColor} ${textColor}`}>
        <span className="text-sm font-medium text-slate-600">{label}</span>
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-semibold">{text}</span>
        </div>
      </div>
    );
  };

  const currentPeriodLabel = useMemo(() => {
    const p = REPORTING_PERIODS.find(p => `${p.month}-${p.year}` === activeMonthKey);
    return p ? p.label : '';
  }, [activeMonthKey]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white drop-shadow-md">ข้อมูลสถานะรายอำเภอ</h2>
          <p className="text-blue-100 text-sm">แสดงข้อมูลประจำงวด: {currentPeriodLabel}</p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
          <label className="text-xs text-blue-100 mr-2 font-medium">เลือกงวดการรายงาน</label>
          <select 
            value={selectedMonth} 
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-white/90 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400 min-w-[160px]"
          >
            <option value="all">อัตโนมัติ (ล่าสุดที่มีข้อมูล)</option>
            {REPORTING_PERIODS.map(p => (
              <option key={`${p.month}-${p.year}`} value={`${p.month}-${p.year}`}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {summaries.map((summary) => (
          <div key={summary.district_id} className="bg-white rounded-2xl p-6 shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">{summary.district_name}</h3>
              <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-bold text-lg ${getRatingColor(summary.rating)}`}>
                {summary.rating}
              </div>
            </div>
            
            <div className="space-y-3">
              <StatusBadge 
                label="จปฐ." 
                reported={summary.jpth_status === 'reported'} 
                ontime={summary.jpth_ontime} 
              />
              <StatusBadge 
                label="ประเด็น 5+1" 
                reported={summary.issue_status === 'reported'} 
                ontime={summary.issue_ontime} 
              />
            </div>
            <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-400 text-center">
              งวดการรายงาน: {summary.month} {summary.year + 543}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistrictList;
