
import React from 'react';
import { COLORS } from '../constants';

interface FooterProps {
  siteName: string;
  supportPhone: string;
}

export const Footer: React.FC<FooterProps> = ({ siteName, supportPhone }) => {
  return (
    <footer className="bg-white border-t py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center"><span className="text-white font-black">FP</span></div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{siteName}</h2>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed font-medium">চট্টগ্রাম বিশ্ববিদ্যালয় ক্যাম্পাসের প্রথম শিক্ষার্থী-চালিত অর্গানিক শপ। আমরা সরবরাহ করি খাঁটি ও ভেজালমুক্ত পণ্য।</p>
        </div>

        <div>
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">ডেলিভারি পয়েন্ট</h3>
          <ul className="text-gray-500 text-sm space-y-3 font-bold">
            <li>জিরো পয়েন্ট (Zero Point)</li>
            <li>শাটল স্টেশন (Shuttle Station)</li>
            <li>ওয়ান স্টপ (One Stop)</li>
            <li>সকল আবাসিক হলসমূহ</li>
          </ul>
        </div>

        <div>
          <h3 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">যোগাযোগ</h3>
          <ul className="text-gray-500 text-sm space-y-3 font-bold">
            <li className="flex items-center gap-2"><span className="text-green-600 font-black">ফোন:</span> {supportPhone}</li>
            <li className="flex items-center gap-2"><span className="text-blue-500 font-black">ফেসবুক:</span> fb.com/FreshPavilion</li>
            <li className="mt-6 italic text-slate-400">"বিক্রিত পণ্য ফেরত নেওয়া হয়"</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">© ২০২৫ {siteName} | চবি ক্যাম্পাস</div>
    </footer>
  );
};
