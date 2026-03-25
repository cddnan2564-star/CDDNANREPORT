import React, { useState, useEffect } from 'react';
import { Home, BarChart2, Database as DbIcon, FileText, RefreshCcw } from 'lucide-react';
import { Page, ReportRecord } from './types';
import { fetchData } from './utils';

import Dashboard from './components/Dashboard';
import DistrictList from './components/DistrictList';
import Database from './components/Database';
import Report from './components/Report';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [data, setData] = useState<ReportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Global filters
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  const loadData = async (force = false) => {
    setLoading(true);
    try {
      const records = await fetchData(force);
      setData(records);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const NavButton = ({ page, icon: Icon, label }: { page: Page, icon: any, label: string }) => {
    const isActive = activePage === page;
    return (
      <button
        onClick={() => setActivePage(page)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${
          isActive 
            ? 'bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white shadow-md transform scale-105' 
            : 'bg-white text-slate-600 hover:bg-slate-50 hover:shadow-sm'
        }`}
      >
        <Icon size={18} />
        <span className="hidden md:inline">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] flex flex-col font-sarabun">
      {/* Navbar */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#667eea] to-[#764ba2]">
                ระบบติดตามผลการดำเนินงาน
              </h1>
              <p className="text-sm text-slate-500">จปฐ. ปี 2569 และประเด็น 5+1 จังหวัดน่าน</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2">
              <NavButton page="dashboard" icon={Home} label="แดชบอร์ด" />
              <NavButton page="districts" icon={BarChart2} label="รายอำเภอ" />
              <NavButton page="database" icon={DbIcon} label="ฐานข้อมูล" />
              <NavButton page="report" icon={FileText} label="รายงานผล" />
              <button
                onClick={() => loadData(true)}
                title="รีเฟรชข้อมูล"
                className="flex items-center justify-center p-2.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
              >
                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white">
            <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-lg animate-pulse">กำลังดึงข้อมูลจาก Google Sheets...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-white text-center px-4">
            <div className="bg-white/20 p-6 rounded-2xl backdrop-blur-md border border-white/30 max-w-md">
              <h3 className="text-xl font-bold mb-2">ไม่พบข้อมูลการรายงาน</h3>
              <p className="text-white/80 mb-6">
                อาจเกิดจากยังไม่มีการบันทึกข้อมูลใน Google Sheets หรือไฟล์ยังไม่ได้ตั้งค่า "เผยแพร่ไปยังเว็บ"
              </p>
              <button 
                onClick={() => loadData(true)}
                className="bg-white text-purple-600 px-6 py-2 rounded-full font-bold hover:bg-purple-50 transition-colors"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          </div>
        ) : (
          <>
            {activePage === 'dashboard' && (
              <Dashboard 
                records={data} 
                selectedMonth={selectedMonth} 
                selectedDistrict={selectedDistrict}
                onMonthChange={setSelectedMonth}
                onDistrictChange={setSelectedDistrict}
              />
            )}
            {activePage === 'districts' && (
              <DistrictList 
                records={data}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            )}
            {activePage === 'database' && (
              <Database 
                records={data}
                selectedMonth={selectedMonth} 
                selectedDistrict={selectedDistrict}
                onMonthChange={setSelectedMonth}
                onDistrictChange={setSelectedDistrict}
              />
            )}
            {activePage === 'report' && <Report />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/10 text-white/60 py-4 text-center text-sm backdrop-blur-sm">
        <p>© 2025 สำนักงานพัฒนาชุมชนจังหวัดน่าน</p>
      </footer>
    </div>
  );
};

export default App;