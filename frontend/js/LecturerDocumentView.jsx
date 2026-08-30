import React from 'react';

export default function LecturerDocumentView({
  lecturerName = 'à¸­à¸²à¸ˆà¸²à¸£à¸¢à¹Œ XXXX',
  facultyName = 'à¸„à¸“à¸°: yyy'
}) {
  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] p-6 sm:p-10 lg:p-14 font-['Prompt',sans-serif] text-[#3D3730]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-normal text-[#4A433B] tracking-tight mb-1">
            {lecturerName}
          </h1>
          <p className="text-xs sm:text-sm text-[#70675D] font-light">
            {facultyName}
          </p>
        </div>

        {/* Central White Table Card Container */}
        <div className="w-full bg-white rounded-2xl shadow-xs border border-[#E8E4DC] p-5 sm:p-8 min-h-[480px] flex flex-col justify-start">
          {/* Table Column Headers */}
          <div className="w-full grid grid-cols-12 pb-3 mb-3 border-b border-[#EFECE6] text-xs sm:text-sm text-[#70675D] font-normal select-none">
            <div className="col-span-12 md:col-span-4 pl-3">à¸Šà¸·à¹ˆà¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡</div>
            <div className="hidden md:block md:col-span-3 text-left">à¸§à¸±à¸™à¸—à¸µà¹ˆà¹„à¸”à¹‰à¸£à¸±à¸š</div>
            <div className="hidden md:block md:col-span-2 text-left">à¸œà¸¹à¹‰à¸£à¸±à¸š</div>
            <div className="hidden md:block md:col-span-2 text-left">à¸œà¸¹à¹‰à¸ªà¹ˆà¸‡</div>
            <div className="col-span-12 md:col-span-1 text-right pr-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
