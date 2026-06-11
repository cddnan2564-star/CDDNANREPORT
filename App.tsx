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
              <p className="text-sm text-slate-500">การบริหารการจัดเก็บ จปฐ. ปี 2569 และ การขับเคลื่อน CDD AI</p>
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-white my-4 px-4 sm:px-6">
            <div className="bg-white text-slate-800 p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/20 max-w-2xl w-full text-left">
              <div className="flex items-center gap-3 mb-4 text-amber-500 border-b border-slate-100 pb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-2xl font-bold">ไม่พบข้อมูลหรือเชื่อมต่อระบบล้มเหลว</h3>
              </div>
              
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                ระบบพยายามดึงข้อมูลดิบจากสเปรดชีต Google Sheets แล้ว แต่ประมวลผลข้อมูลไม่ได้ โปรดดูรายละเอียดวิเคราะห์ปัญหาแบบเจาะลึกได้ในกล่องวินิจฉัยพอร์ทัลสดด้านล่างนี้:
              </p>

              <div className="space-y-4 mb-6">
                {/* JPTH Diagnostics */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 text-sm">1. ระบบรายงาน จปฐ. ปี 2569</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      (window as any).sheetDiagnostics?.JPTH?.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                      (window as any).sheetDiagnostics?.JPTH?.status === 'not_public_html' ? 'bg-amber-100 text-amber-800' :
                      (window as any).sheetDiagnostics?.JPTH?.status === 'headers_mismatch' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      { (window as any).sheetDiagnostics?.JPTH?.status === 'success' ? 'ดึงข้อมูลสำเร็จ' :
                        (window as any).sheetDiagnostics?.JPTH?.status === 'not_public_html' ? 'ไฟล์ไม่เป็นสาธารณะ' :
                        (window as any).sheetDiagnostics?.JPTH?.status === 'headers_mismatch' ? 'หัวตารางแรกสะกดไม่ตรง' :
                        (window as any).sheetDiagnostics?.JPTH?.status === 'empty_data' ? 'ไม่มีข้อมูลในไฟล์' :
                        'ขัดข้อง/ไม่มีบริการ'
                      }
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap bg-white p-2.5 rounded border border-slate-100 max-h-[140px] overflow-y-auto">
                    {(window as any).sheetDiagnostics?.JPTH?.details || 'ไม่ได้ตรวจสอบหรือกำลังเชื่อมต่อ'}
                  </p>
                  {(window as any).sheetDiagnostics?.JPTH?.proxyUsed && (
                    <p className="text-[10px] text-slate-400 mt-1">แหล่งดึง: {(window as any).sheetDiagnostics.JPTH.proxyUsed}</p>
                  )}
                </div>

                {/* CDD AI Diagnostics */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-700 text-sm">2. ระบบขับเคลื่อน CDD AI</span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      (window as any).sheetDiagnostics?.CDDAI?.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                      (window as any).sheetDiagnostics?.CDDAI?.status === 'not_public_html' ? 'bg-amber-100 text-amber-800' :
                      (window as any).sheetDiagnostics?.CDDAI?.status === 'headers_mismatch' ? 'bg-rose-100 text-rose-800' :
                      'bg-slate-200 text-slate-800'
                    }`}>
                      { (window as any).sheetDiagnostics?.CDDAI?.status === 'success' ? 'ดึงข้อมูลสำเร็จ' :
                        (window as any).sheetDiagnostics?.CDDAI?.status === 'not_public_html' ? 'ไฟล์ไม่เป็นสาธารณะ' :
                        (window as any).sheetDiagnostics?.CDDAI?.status === 'headers_mismatch' ? 'หัวตารางแรกสะกดไม่ตรง' :
                        (window as any).sheetDiagnostics?.CDDAI?.status === 'empty_data' ? 'ไม่มีข้อมูลในไฟล์' :
                        'ขัดข้อง/ไม่มีบริการ'
                      }
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap bg-white p-2.5 rounded border border-slate-100 max-h-[140px] overflow-y-auto">
                    {(window as any).sheetDiagnostics?.CDDAI?.details || 'ไม่ได้ตรวจสอบหรือกำลังเชื่อมต่อ'}
                  </p>
                  {(window as any).sheetDiagnostics?.CDDAI?.proxyUsed && (
                    <p className="text-[10px] text-slate-400 mt-1">แหล่งดึง: {(window as any).sheetDiagnostics.CDDAI.proxyUsed}</p>
                  )}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6 text-xs text-blue-900 space-y-2">
                <p className="font-bold text-sm text-blue-900">💡 คำถาม: จะตั้งค่าแก้ไขข้อมูลในสเปรดชีตอย่างไรให้ถูกต้อง?</p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700">
                  <li>เปิดไฟล์ Google Sheets ของข้อมูล</li>
                  <li>คลิกปุ่ม <b>แชร์ (Share)</b> ขวาบนสุด เลือกหน้าตั้งค่า และปรับเป็น <b>"ทุกคนที่มีลิงก์มีสิทธิ์อ่าน" (Anyone with the link can view)</b></li>
                  <li>ไปที่แถบเมนูหลักของ Google Sheets คลิก <b>ไฟล์ (File)</b> &gt; <b>แชร์ (Share)</b> &gt; <b>เผยแพร่ไปยังเว็บ (Publish to web)</b></li>
                  <li>เลือกแผ่นงานชี้คำตอบแบบฟอร์ม (Form Responses 1) แล้วระบุชนิดส่งออกเป็น <b>"ค่าที่คั่นด้วยจุลภาค (.csv)"</b> แล้วกดปุ่มเผยแพร่ <b>(Publish)</b></li>
                  <li>แก้ไขคำสะกดหัวตารางคอลัมน์ในแถวแรกสุด (Row 1) ให้มีคำว่า <b className="text-purple-700">"ประทับเวลา"</b> (เก็บเวลาส่งฟอร์ม) <b className="text-purple-700">"อำเภอ"</b> (คัดกรองอำเภอ) และ <b className="text-purple-700">"เดือน"</b> (เพื่อส่งเดือนรายงาน) สะกดให้สมบูรณ์</li>
                </ol>
              </div>

              <div className="flex gap-3 justify-end border-t border-slate-100 pt-4">
                <button 
                  onClick={() => loadData(true)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:brightness-105 active:scale-95 transition-all text-sm"
                >
                  🔄 บังคับล้างแคช & ลองเชื่อมต่อใหม่อีกครั้ง
                </button>
              </div>
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