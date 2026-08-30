import React, { useState } from 'react';

export default function LecturerDocumentView({
  lecturerName = 'à¸­à¸²à¸ˆà¸²à¸£à¸¢à¹Œ XXXX',
  facultyName = 'à¸„à¸“à¸°: yyy',
  onPreviewClick = (doc) => console.log('Preview document:', doc),
  onDownloadClick = (doc) => console.log('Download document:', doc)
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
  const [isLoading] = useState(false);

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

          {isLoading ? (
            <div className="space-y-3 w-full animate-pulse">
              {[1, 2, 3].map((item) => (
                <div key={item} className="w-full grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border border-[#EFECE6] bg-[#FAF8F5]/40">
                  <div className="col-span-12 md:col-span-4 pr-4"><div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-4/5"></div></div>
                  <div className="hidden md:block md:col-span-3 pr-4"><div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-3/4"></div></div>
                  <div className="hidden md:block md:col-span-2 pr-4"><div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-2/3"></div></div>
                  <div className="hidden md:block md:col-span-2 pr-4"><div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-2/3"></div></div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="w-full flex-1 min-h-[320px] flex items-center justify-center text-center">
              <p className="text-lg sm:text-xl font-light text-[#9E9689] select-none">
                à¹„à¸¡à¹ˆà¸¡à¸µà¹€à¸­à¸à¸ªà¸²à¸£à¹€à¸‚à¹‰à¸²à¸ªà¸¹à¹ˆà¸£à¸°à¸šà¸šà¸‚à¸­à¸‡à¸—à¹ˆà¸²à¸™
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 w-full">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="w-full grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border border-[#EFECE6] bg-white hover:bg-[#FAF8F5] transition duration-150 group"
                >
                  <div className="col-span-12 md:col-span-4 pl-3 pr-4">
                    <span className="text-xs sm:text-sm text-[#3D3730] font-normal leading-relaxed break-words line-clamp-3 md:line-clamp-none">
                      {doc.title}
                    </span>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-xs sm:text-sm text-[#70675D] font-light mt-2 md:mt-0 pl-3 md:pl-0">
                    <span className="md:hidden text-[#9E9689] block text-[11px]">à¸§à¸±à¸™à¸—à¸µà¹ˆ: </span>
                    {doc.receivedDate}
                  </div>
                  <div className="col-span-6 md:col-span-2 text-xs sm:text-sm text-[#70675D] font-light mt-2 md:mt-0">
                    <span className="md:hidden text-[#9E9689] block text-[11px]">à¸œà¸¹à¹‰à¸£à¸±à¸š: </span>
                    {doc.recipient}
                  </div>
                  <div className="col-span-6 md:col-span-2 text-xs sm:text-sm text-[#70675D] font-light mt-2 md:mt-0 pl-3 md:pl-0">
                    <span className="md:hidden text-[#9E9689] block text-[11px]">à¸œà¸¹à¹‰à¸ªà¹ˆà¸‡: </span>
                    {doc.sender}
                  </div>
                  <div className="col-span-6 md:col-span-1 flex items-center justify-end gap-3 pr-2 mt-2 md:mt-0">
                    <button
                      type="button"
                      onClick={() => onPreviewClick(doc)}
                      className="text-[#70675D] hover:text-[#3D3730] hover:bg-[#EFECE6] p-1.5 rounded-lg transition cursor-pointer"
                      title="à¸”à¸¹à¸•à¸±à¸§à¸­à¸¢à¹ˆà¸²à¸‡à¹€à¸­à¸à¸ªà¸²à¸£"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadClick(doc)}
                      className="text-[#70675D] hover:text-[#3D3730] hover:bg-[#EFECE6] p-1.5 rounded-lg transition cursor-pointer"
                      title="à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹€à¸­à¸à¸ªà¸²à¸£"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
