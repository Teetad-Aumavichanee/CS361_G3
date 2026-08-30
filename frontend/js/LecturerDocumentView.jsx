import React, { useState, useEffect } from 'react';

export default function LecturerDocumentView({
  lecturerName = 'อาจารย์ XXXX',
  facultyName = 'คณะ: yyy',
  onPreviewClick = (doc) => console.log('Preview document clicked:', doc),
  onDownloadClick = (doc) => console.log('Download document clicked:', doc)
}) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock initial data matching Figma Image 3
  const mockDocuments = [
    {
      id: 'doc-001',
      title: 'file 1',
      receivedDate: '28 ส.ค. 2026 23:59 น.',
      recipient: 'อ.XXX',
      sender: 'อ.YYY',
      fileUrl: '/uploads/file1.pdf'
    },
    {
      id: 'doc-002',
      title: 'ขอเชิญประชุมคณะกรรมการบริหารหลักสูตร วิทยาการคอมพิวเตอร์',
      receivedDate: '1 ก.ย. 2026 01:00 น.',
      recipient: 'อ.XXX',
      sender: 'อ.YYY',
      fileUrl: '/uploads/meeting_cs.pdf'
    },
    {
      id: 'doc-003',
      title: "Newton's first law expresses the principle of inertia: the natural behavior of a body is to move in a straight line at constant speed. A body's motion preserves the status quo, but external forces can perturb this.",
      receivedDate: '30 ก.พ. 2077 10:00 น.',
      recipient: 'อ. Ap P. Le',
      sender: 'อ. Issac Newton',
      fileUrl: '/uploads/newton_law.pdf'
    },
    {
      id: 'doc-004',
      title: 'อาจารย์ครับ',
      receivedDate: '1 ม.ค. 2028 22:00 น.',
      recipient: 'อ. สมชาย ใจดี',
      sender: 'นายสมหญิง ใจงาม',
      fileUrl: '/uploads/letter.pdf'
    }
  ];

  // Helper function to format ISO date string to Thai localized display
  const formatThaiDate = (dateStr) => {
    if (!dateStr) return '';
    if (dateStr.includes('น.') || dateStr.includes('ส.ค.') || dateStr.includes('ก.ย.')) {
      return dateStr;
    }
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const thaiMonths = [
        'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
        'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
      ];
      const day = date.getDate();
      const month = thaiMonths[date.getMonth()];
      const year = date.getFullYear() + 543;
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day} ${month} ${year} ${hours}:${minutes} น.`;
    } catch {
      return dateStr;
    }
  };

  // Fetch documents on mount
  useEffect(() => {
    let isMounted = true;

    async function fetchDocuments() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/v1/documents');
        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          const list = Array.isArray(data) ? data : data.documents || [];
          setDocuments(list);
        }
      } catch (err) {
        console.warn('Backend API unreachable. Using realistic mock documents fallback.', err);
        if (isMounted) {
          setDocuments(mockDocuments);
        }
      } finally {
        if (isMounted) {
          setTimeout(() => setIsLoading(false), 600);
        }
      }
    }

    fetchDocuments();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] p-6 sm:p-10 lg:p-14 font-['Prompt',sans-serif] text-[#3D3730]">
      <div className="max-w-6xl mx-auto">
        {/* Top Header Section */}
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
            <div className="col-span-12 md:col-span-4 pl-3">ชื่อเรื่อง</div>
            <div className="hidden md:block md:col-span-3 text-left">วันที่ได้รับ</div>
            <div className="hidden md:block md:col-span-2 text-left">ผู้รับ</div>
            <div className="hidden md:block md:col-span-2 text-left">ผู้ส่ง</div>
            <div className="col-span-12 md:col-span-1 text-right pr-2"></div>
          </div>

          {/* Body: 3 States (Loading Skeleton, Empty State, Populated List) */}
          {isLoading ? (
            /* Loading State (Skeleton Shimmer matching Image 2) */
            <div className="space-y-3 w-full animate-pulse">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="w-full grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border border-[#EFECE6] bg-[#FAF8F5]/40"
                >
                  <div className="col-span-12 md:col-span-4 pr-4">
                    <div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-4/5"></div>
                  </div>
                  <div className="hidden md:block md:col-span-3 pr-4">
                    <div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-3/4"></div>
                  </div>
                  <div className="hidden md:block md:col-span-2 pr-4">
                    <div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-2/3"></div>
                  </div>
                  <div className="hidden md:block md:col-span-2 pr-4">
                    <div className="h-4 sm:h-5 bg-[#D5CEC4]/70 rounded-full w-2/3"></div>
                  </div>
                  <div className="hidden md:flex md:col-span-1 justify-end gap-2 pr-2">
                    <div className="w-5 h-5 rounded-full bg-[#D5CEC4]/50"></div>
                    <div className="w-5 h-5 rounded-full bg-[#D5CEC4]/50"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            /* Empty State (Matching Image 1) */
            <div className="w-full flex-1 min-h-[320px] flex items-center justify-center text-center">
              <p className="text-lg sm:text-xl font-light text-[#9E9689] select-none">
                ไม่มีเอกสารเข้าสู่ระบบของท่าน
              </p>
            </div>
          ) : (
            /* Populated Table List (Matching Image 3) */
            <div className="space-y-2.5 w-full">
              {documents.map((doc) => (
                <div
                  key={doc.id || doc._id || doc.title}
                  className="w-full grid grid-cols-12 items-center p-3 sm:p-4 rounded-xl border border-[#EFECE6] bg-white hover:bg-[#FAF8F5] transition duration-150 group"
                >
                  {/* Title Column */}
                  <div className="col-span-12 md:col-span-4 pl-3 pr-4">
                    <span className="text-xs sm:text-sm text-[#3D3730] font-normal leading-relaxed break-words line-clamp-3 md:line-clamp-none">
                      {doc.title || doc.documentName || 'ไม่มีชื่อเรื่อง'}
                    </span>
                  </div>

                  {/* Received Date Column */}
                  <div className="col-span-6 md:col-span-3 text-xs sm:text-sm text-[#70675D] font-light mt-2 md:mt-0 pl-3 md:pl-0">
                    <span className="md:hidden text-[#9E9689] block text-[11px]">วันที่: </span>
                    {formatThaiDate(doc.receivedDate || doc.date || doc.createdAt)}
                  </div>

                  {/* Recipient Column */}
                  <div className="col-span-6 md:col-span-2 text-xs sm:text-sm text-[#70675D] font-light mt-2 md:mt-0">
                    <span className="md:hidden text-[#9E9689] block text-[11px]">ผู้รับ: </span>
                    {doc.recipient || doc.recipientName || 'อ.XXX'}
                  </div>

                  {/* Sender Column */}
                  <div className="col-span-6 md:col-span-2 text-xs sm:text-sm text-[#70675D] font-light mt-2 md:mt-0 pl-3 md:pl-0">
                    <span className="md:hidden text-[#9E9689] block text-[11px]">ผู้ส่ง: </span>
                    {doc.sender || doc.senderName || 'อ.YYY'}
                  </div>

                  {/* Action Icons Column */}
                  <div className="col-span-6 md:col-span-1 flex items-center justify-end gap-3 pr-2 mt-2 md:mt-0">
                    {/* Preview Button (👁️) */}
                    <button
                      type="button"
                      onClick={() => onPreviewClick(doc)}
                      className="text-[#70675D] hover:text-[#3D3730] hover:bg-[#EFECE6] p-1.5 rounded-lg transition cursor-pointer"
                      title="ดูตัวอย่างเอกสาร"
                      aria-label="ดูตัวอย่างเอกสาร"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </button>

                    {/* Download Button (📥) */}
                    <button
                      type="button"
                      onClick={() => onDownloadClick(doc)}
                      className="text-[#70675D] hover:text-[#3D3730] hover:bg-[#EFECE6] p-1.5 rounded-lg transition cursor-pointer"
                      title="ดาวน์โหลดเอกสาร"
                      aria-label="ดาวน์โหลดเอกสาร"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
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
