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
      </div>
    </div>
  );
}
