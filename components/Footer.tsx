import React from 'react';
import { COLORS } from '../constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: COLORS.PRIMARY }}>
              <span className="text-white font-bold">FP</span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: COLORS.PRIMARY }}>ফ্রেশ প্যাভিলিয়ন</h2>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            চট্টগ্রাম বিশ্ববিদ্যালয় ক্যাম্পাসের প্রথম শিক্ষার্থী-চালিত অর্গানিক শপ। আমরা সরবরাহ করি খাঁটি ও ভেজালমুক্ত পণ্য।
          </p>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4">ক্যাম্পাস ডেলিভারি পয়েন্ট</h3>
          <ul className="text-gray-500 text-sm space-y-2">
            <li>জিরো পয়েন্ট (Zero Point)</li>
            <li>শাটল স্টেশন (Shuttle Station)</li>
            <li>ওয়ান স্টপ (One Stop)</li>
            <li>সকল আবাসিক হলসমূহ</li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-gray-800 mb-4">যোগাযোগ</h3>
          <ul className="text-gray-500 text-sm space-y-2">
            <li className="flex items-center gap-2">
               <span className="font-bold text-green-700">ফোন:</span> ০১৬৩০১৪৫৩০৫
            </li>
            <li className="flex items-center gap-2">
               <span className="font-bold text-blue-500">ফেসবুক:</span> fb.com/FreshPavilion
            </li>
            <li className="mt-4 italic">"বিক্রিত পণ্য ফেরত নেওয়া হয়"</li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t text-center text-gray-400 text-xs">
        © ২০২৫ ফ্রেশ প্যাভিলিয়ন | চট্টগ্রাম বিশ্ববিদ্যালয়
      </div>
    </footer>
  );
};
