
import React from 'react';
import { COLORS } from '../constants';

interface FooterProps {
  siteName: string;
  supportPhone: string;
  logo: string | null;
}

export const Footer: React.FC<FooterProps> = ({ siteName, supportPhone, logo }) => {
  return (
    <footer className="bg-white border-t py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
              {logo ? (
                <img src={logo} className="w-full h-full object-cover" alt={siteName} />
              ) : (
                <div className="w-full h-full bg-green-600 flex items-center justify-center"><span className="text-white font-black">FP</span></div>
              )}
            </div>
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
            <li className="flex items-center gap-2">
              <span className="text-blue-600 font-black">ফেসবুক:</span> 
              <a href="https://www.facebook.com/profile.php?id=61561186125593" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Fresh Pavilion
              </a>
            </li>
            <li className="mt-6 italic text-slate-400">"বিক্রিত পণ্য ফেরত নেওয়া হয় না"</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-gray-400 text-[11px] font-bold tracking-normal uppercase">
        © ২০২৫ {siteName} | চবি ক্যাম্পাস | Developed by: 
        <a href="https://facebook.com/itsmdalamin" target="_blank" rel="noopener noreferrer" className="ml-1 text-green-600 hover:underline">Md Al Amin</a>
      </div>
    </footer>
  );
};
