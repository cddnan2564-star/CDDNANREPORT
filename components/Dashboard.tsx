
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { ClipboardList, FileText, Clock, Trophy } from 'lucide-react';
import { ReportRecord, DistrictSummary } from '../types';
import { getDistrictSummary } from '../utils';
import { DISTRICTS, REPORTING_PERIODS } from '../constants';

interface DashboardProps {
  records: ReportRecord[];
  selectedMonth: string;
  selectedDistrict: string;
  onMonthChange: (m: string) => void;
  onDistrictChange: (d: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  records, selectedMonth, selectedDistrict, onMonthChange, onDistrictChange 
}) => {

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const matchMonth = selectedMonth === 'all' || `${r.month}-${r.year}` === selectedMonth;
      const matchDistrict = selectedDistrict === 'all' || r.district_id === selectedDistrict;
      return matchMonth && matchDistrict;
    });
  }, [records, selectedMonth, selectedDistrict]);

  const summaries: DistrictSummary[] = useMemo(() => 
    filteredRecords.map(getDistrictSummary), 
  [filteredRecords]);

  const jpthReportedCount = summaries.filter(s => s.jpth_status === 'reported').length;
  const issueReportedCount = summaries.filter(s => s.issue_status === 'reported').length;
  const onTimeCount = summaries.filter(s => s.jpth_ontime && s.issue_ontime && s.jpth_status === 'reported' && s.issue_status === 'reported').length;
  const totalConsidered = summaries.length;
  const onTimeRate = totalConsidered > 0 ? Math.round((onTimeCount / totalConsidered) * 100) : 0;

  const ratingCounts = {
    A: summaries.filter(s => s.rating === 'A').length,
    B: summaries.filter(s => s.rating === 'B').length,
    C: summaries.filter(s => s.rating === 'C').length,
    D: summaries.filter(s => s.rating === 'D').length,
  };

  const isSingleDistrictView = selectedDistrict !== 'all' && selectedMonth !== 'all';
  const singleDistrictRating = isSingleDistrictView && summaries.length > 0 ? summaries[0].rating : null;

  const districtChartData = useMemo(() => {
    // If multiple months selected, average out or just show for latest? 
    // Usually showing the filtered context is better.
    // If "all" months is selected, we group by district name
    const dataMap = new Map();
    summaries.forEach(s => {
      const existing = dataMap.get(s.district_name) || { JPTH: 0, Issue51: 0, count: 0 };
      dataMap.set(s.district_name, {
        name: s.district_name,
        JPTH: existing.JPTH + (s.jpth_status === 'reported' ? 1 : 0),
        Issue51: existing.Issue51 + (s.issue_status === 'reported' ? 1 : 0),
        count: existing.count + 1
      });
    });
    return Array.from(dataMap.values());
  }, [summaries]);

  const monthlyChartData = useMemo(() => {
    return REPORTING_PERIODS.map(p => {
      const recs = records.filter(r => r.month === p.month && r.year === p.year && (selectedDistrict === 'all' || r.district_id === selectedDistrict));
      const jpth = recs.filter(r => r.jpth_status === 'reported').length;
      const issue = recs.filter(r => r.issue_5plus1_status === 'reported').length;
      return { name: p.label, JPTH: jpth, Issue51: issue };
    });
  }, [records, selectedDistrict]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-white drop-shadow-md">ภาพรวมการรายงาน (ธ.ค. 68 - ก.ย. 69)</h2>
        
        <div className="flex flex-wrap gap-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20">
          <div className="flex flex-col">
            <label className="text-xs text-blue-100 mb-1 font-medium">เลือกงวดการรายงาน</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-white/90 text-slate-700 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400 min-w-[160px]"
            >
              <option value="all">ทุกงวดที่ผ่านมา</option>
              {REPORTING_PERIODS.map(p => (
                <option key={`${p.month}-${p.year}`} value={`${p.month}-${p.year}`}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-blue-100 mb-1 font-medium">เลือกอำเภอ</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 border-l-4 border-blue-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">การรายงาน จปฐ.</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-1">{jpthReportedCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl text-blue-500">
              <ClipboardList size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400">จำนวนการส่งรายงาน / {totalConsidered}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 border-l-4 border-cyan-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">การขับเคลื่อน CDD AI</p>
              <h3 className="text-3xl font-bold text-cyan-600 mt-1">{issueReportedCount}</h3>
            </div>
            <div className="p-3 bg-cyan-50 rounded-xl text-cyan-500">
              <FileText size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400">จำนวนการส่งรายงาน / {totalConsidered}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 border-l-4 border-purple-500">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-500 text-sm font-medium">รายงานตรงเวลา</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-1">{onTimeRate}%</h3>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl text-purple-500">
              <Clock size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-400">เทียบกับจำนวนรายงานที่ส่ง</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl hover:-translate-y-1 transition-transform duration-300 border-l-4 border-emerald-500">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-slate-500 text-sm font-medium">สรุปผลการประเมิน</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
              <Trophy size={20} />
            </div>
          </div>
          
          {isSingleDistrictView ? (
             <div className="flex flex-col items-center justify-center py-2 h-[88px]">
                {singleDistrictRating ? (
                  <>
                    <div className={`text-6xl font-bold -mt-2 ${
                      singleDistrictRating === 'A' ? 'text-emerald-500' :
                      singleDistrictRating === 'B' ? 'text-blue-500' :
                      singleDistrictRating === 'C' ? 'text-amber-500' :
                      'text-red-500'
                    }`}>
                      {singleDistrictRating}
                    </div>
                    <span className="text-xs text-slate-400 -mt-1">ระดับคะแนนงวดนี้</span>
                  </>
                ) : (
                   <div className="text-slate-300 text-lg">ไม่มีข้อมูล</div>
                )}
             </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div className="text-center p-2 bg-emerald-50/50 rounded-lg">
                <div className="text-lg font-bold text-emerald-600">A</div>
                <div className="text-[10px] text-slate-500">{ratingCounts.A}</div>
              </div>
              <div className="text-center p-2 bg-blue-50/50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">B</div>
                <div className="text-[10px] text-slate-500">{ratingCounts.B}</div>
              </div>
              <div className="text-center p-2 bg-amber-50/50 rounded-lg">
                <div className="text-lg font-bold text-amber-500">C</div>
                <div className="text-[10px] text-slate-500">{ratingCounts.C}</div>
              </div>
              <div className="text-center p-2 bg-red-50/50 rounded-lg">
                <div className="text-lg font-bold text-red-500">D</div>
                <div className="text-[10px] text-slate-500">{ratingCounts.D}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-700 mb-4">เกณฑ์การประเมิน (ต้องรายงานภายในวันที่ 15 ของเดือน)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-100 bg-emerald-50/30">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 font-bold text-lg">A</div>
            <div>
              <div className="font-bold text-slate-700">ดีเยี่ยม</div>
              <div className="text-xs text-slate-500">ครบ 2 กิจกรรม และตรงเวลาทั้งคู่</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-blue-100 bg-blue-50/30">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600 font-bold text-lg">B</div>
            <div>
              <div className="font-bold text-slate-700">ดี</div>
              <div className="text-xs text-slate-500">ครบ 2 กิจกรรม (ตรงเวลา 1) หรือส่ง 1 (ตรงเวลา)</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-amber-100 bg-amber-50/30">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-100 text-amber-500 font-bold text-lg">C</div>
            <div>
              <div className="font-bold text-slate-700">พอใช้</div>
              <div className="text-xs text-slate-500">ครบ 2 กิจกรรม แต่เกินเวลาทั้งคู่</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-red-100 bg-red-50/30">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-100 text-red-500 font-bold text-lg">D</div>
            <div>
              <div className="font-bold text-slate-700">ต้องปรับปรุง</div>
              <div className="text-xs text-slate-500">ไม่รายงาน หรือไม่ครบ (เกินเวลา)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg min-w-0">
          <h3 className="text-lg font-bold text-slate-700 mb-6">สถานะการรายงานสะสมรายอำเภอ</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <BarChart data={districtChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} tick={{fontSize: 12}} stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <RechartsTooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Bar name="รายงาน จปฐ. (จำนวนครั้ง)" dataKey="JPTH" fill="#667eea" radius={[4, 4, 0, 0]} />
                <Bar name="การขับเคลื่อน CDD AI (จำนวนครั้ง)" dataKey="Issue51" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg min-w-0">
          <h3 className="text-lg font-bold text-slate-700 mb-6">แนวโน้มการส่งรายงานรายเดือน</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              <LineChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" domain={[0, 15]} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                <Line type="monotone" name="รายงาน จปฐ." dataKey="JPTH" stroke="#667eea" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                <Line type="monotone" name="รายงาน 5+1." dataKey="Issue51" stroke="#06b6d4" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
