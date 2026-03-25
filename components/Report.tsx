import React from 'react';
import { ClipboardList, FileText, ExternalLink } from 'lucide-react';
import { JPTH_FORM_URL, ISSUE_FORM_URL } from '../constants';

const Report: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">รายงานผลการดำเนินงาน</h2>
        <p className="text-blue-100">กรุณาเลือกแบบฟอร์มที่ต้องการรายงาน ข้อมูลจะถูกบันทึกเข้าสู่ระบบโดยอัตโนมัติ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 flex flex-col items-center text-center group">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <ClipboardList size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">แบบฟอร์มรายงาน จปฐ.</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            สำหรับเจ้าหน้าที่บันทึกข้อมูลผลการจัดเก็บข้อมูล จปฐ. ประจำเดือน
          </p>
          <a 
            href={JPTH_FORM_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
          >
            เปิดแบบฟอร์ม <ExternalLink size={18} />
          </a>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl hover:-translate-y-2 transition-transform duration-300 border border-slate-100 flex flex-col items-center text-center group">
          <div className="w-20 h-20 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <FileText size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">แบบฟอร์มรายงาน 5+1</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">
            สำหรับรายงานผลการดำเนินงานตามประเด็นการพัฒนาจังหวัดน่าน (5+1)
          </p>
          <a 
            href={ISSUE_FORM_URL} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
          >
            เปิดแบบฟอร์ม <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur rounded-xl p-6 shadow-lg border-l-4 border-indigo-500 mt-8">
        <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
          <span className="text-xl">📌</span> คำแนะนำการใช้งาน
        </h4>
        <ul className="space-y-2 text-slate-600 text-sm md:text-base ml-2">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
            คลิกที่ปุ่ม "เปิดแบบฟอร์ม" เพื่อไปยัง Google Forms ที่กำหนด
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
            กรอกข้อมูลให้ครบถ้วนและถูกต้องตามความเป็นจริง
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
            ข้อมูลจะถูกอัปเดตเข้าสู่ฐานข้อมูลกลางโดยอัตโนมัติภายใน 24 ชั่วโมง
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
            ควรรายงานภายใน<span className="text-red-600 font-bold">วันที่ 15 ของทุกเดือน</span> เพื่อให้ผลการประเมินอยู่ในเกณฑ์ "ตรงเวลา" (ระดับ A หรือ B)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Report;