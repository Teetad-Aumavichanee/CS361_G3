import React from 'react';

export default function StaffDocumentIngestion() {
  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] flex flex-col md:flex-row font-['Prompt',sans-serif] text-[#3D3730]">
      {/* Left Panel: Ingestion Form Area */}
      <div className="w-full md:w-[35%] lg:w-[33%] min-h-screen bg-[#FAF8F5] p-6 sm:p-10 flex flex-col justify-between border-r border-[#EFECE6] shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#4A433B] mb-8">à¹€à¸ˆà¹‰à¸²à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆ</h1>
        </div>
      </div>

      {/* Right Panel: Document Canvas Area */}
      <div className="w-full md:w-[65%] lg:w-[67%] min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[620px] aspect-[1/1.414] min-h-[580px] bg-white rounded shadow-sm border border-[#E5E0D8] flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-light tracking-wide text-[#70675D]">Preview à¹€à¸­à¸à¸ªà¸²à¸£</span>
        </div>
      </div>
    </div>
  );
}
