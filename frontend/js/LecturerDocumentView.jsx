import React, { useState } from 'react';

export default function LecturerDocumentView({
  lecturerName = 'à¸­à¸²à¸ˆà¸²à¸£à¸¢à¹Œ XXXX',
  facultyName = 'à¸„à¸“à¸°: yyy'
}) {
  const [documents] = useState([
    {
      id: 'doc-001',
      title: 'file 1',
      receivedDate: '28 à¸ª.à¸„. 2026 23:59 à¸™.',
      recipient: 'à¸­.XXX',
      sender: 'à¸­.YYY'
    },
    {
      id: 'doc-002',
      title: 'à¸‚à¸­à¹€à¸Šà¸´à¸à¸›à¸£à¸°à¸Šà¸¸à¸¡à¸„à¸“à¸°à¸à¸£à¸£à¸¡à¸à¸²à¸£à¸šà¸£à¸´à¸«à¸²à¸£à¸«à¸¥à¸±à¸à¸ªà¸¹à¸•à¸£ à¸§à¸´à¸—à¸¢à¸²à¸à¸²à¸£à¸„à¸­à¸¡à¸žà¸´à¸§à¹€à¸•à¸­à¸£à¹Œ',
      receivedDate: '1 à¸.à¸¢. 2026 01:00 à¸™.',
      recipient: 'à¸­.XXX',
      sender: 'à¸­.YYY'
    }
  ]);

  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr;
  };

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

        <div className="w-full bg-white rounded-2xl shadow-xs border border-[#E8E4DC] p-5 sm:p-8 min-h-[480px] flex flex-col justify-start">
          <div className="w-full grid grid-cols-12 pb-3 mb-3 border-b border-[#EFECE6] text-xs sm:text-sm text-[#70675D] font-normal select-none">
            <div className="col-span-12 md:col-span-4 pl-3">à¸Šà¸·à¹ˆà¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡</div>
            <div className="hidden md:block md:col-span-3 text-left">à¸§à¸±à¸™à¸—à¸µà¹ˆà¹„à¸”à¹‰à¸£à¸±à¸š</div>
            <div className="hidden md:block md:col-span-2 text-left">à¸œà¸¹à¹‰à¸£à¸±à¸š</div>
            <div className="hidden md:block md:col-span-2 text-left">à¸œà¸¹à¹‰à¸ªà¹ˆà¸‡</div>
            <div className="col-span-12 md:col-span-1 text-right pr-2"></div>
          </div>

          <div className="space-y-2.5 w-full">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="w-full grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border border-[#EFECE6] bg-white hover:bg-[#FAF8F5] transition duration-150"
              >
                <div className="col-span-12 md:col-span-4 pl-3 pr-4">
                  <span className="text-xs sm:text-sm text-[#3D3730] font-normal leading-relaxed break-words">
                    {doc.title}
                  </span>
                </div>
                <div className="col-span-6 md:col-span-3 text-xs sm:text-sm text-[#70675D] font-light pl-3 md:pl-0">
                  {formatThaiDate(doc.receivedDate)}
                </div>
                <div className="col-span-6 md:col-span-2 text-xs sm:text-sm text-[#70675D] font-light">
                  {doc.recipient}
                </div>
                <div className="col-span-6 md:col-span-2 text-xs sm:text-sm text-[#70675D] font-light pl-3 md:pl-0">
                  {doc.sender}
                </div>
                <div className="col-span-6 md:col-span-1 flex items-center justify-end gap-3 pr-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
