import React, { useState, useEffect, useRef, useCallback } from 'react';

export function DocumentPreviewModal({ document: doc, isOpen, onClose }) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(99);
  const [pdfDoc, setPdfDoc] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && doc) {
      setZoom(100);
      setCurrentPage(1);
      setTotalPages(doc.totalPages || 99);
    }
  }, [isOpen, doc]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && currentPage < totalPages) setCurrentPage(p => p + 1);
      else if (e.key === 'ArrowLeft' && currentPage > 1) setCurrentPage(p => p - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentPage, totalPages, onClose]);

  if (!isOpen || !doc) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(p => p - 1); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(p => p + 1); };

  const handleDownload = (e) => {
    e.stopPropagation();
    alert(`à¸à¸³à¸¥à¸±à¸‡à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹€à¸­à¸à¸ªà¸²à¸£: ${doc.title}`);
  };

  return (
    <div
      id="preview-modal-overlay"
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/80 backdrop-blur-xs font-['Prompt',sans-serif] select-none"
      onClick={onClose}
    >
      <div
        className="w-full flex items-start justify-between p-6 sm:p-8 shrink-0"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="max-w-2xl text-white space-y-1.5 pr-4" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-base sm:text-lg md:text-xl font-normal leading-snug tracking-tight text-white/95">
            {doc.title || 'à¹„à¸¡à¹ˆà¸¡à¸µà¸Šà¸·à¹ˆà¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡'}
          </h2>
          <p className="text-xs sm:text-sm text-white/80 font-light">
            à¹„à¸”à¹‰à¸£à¸±à¸š {doc.receivedDate || '-'}
          </p>
          <p className="text-xs sm:text-sm text-white/80 font-light">
            à¸ˆà¸²à¸ {doc.sender || doc.senderName || '-'}
          </p>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="text-white/80 hover:text-white transition p-2 text-2xl sm:text-3xl leading-none cursor-pointer"
        >
          âœ•
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-0 cursor-pointer" onClick={onClose}>
        <div
          className="w-full max-w-[580px] aspect-[1/1.414] max-h-[75vh] bg-white rounded shadow-2xl border border-white/20 relative flex items-center justify-center overflow-auto transition-transform duration-200 cursor-default"
          style={{ transform: `scale(${zoom / 100})` }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xl sm:text-2xl font-light tracking-wide text-[#70675D]">
            Preview à¹€à¸­à¸à¸ªà¸²à¸£
          </span>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div
        className="w-full flex items-center justify-between px-6 sm:px-12 py-4 text-xs sm:text-sm text-white/90 shrink-0 select-none cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
            className="hover:text-white px-2 py-1 rounded hover:bg-white/10 transition cursor-pointer disabled:opacity-30"
          >
            -
          </button>
          <span className="font-light min-w-[45px] text-center">{zoom}%</span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
            className="hover:text-white px-2 py-1 rounded hover:bg-white/10 transition cursor-pointer disabled:opacity-30"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-2">
          {totalPages > 1 && (
            <button
              type="button"
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition disabled:opacity-30 cursor-pointer"
            >
              â—€
            </button>
          )}
          <span className="font-light tracking-wide">
            à¸«à¸™à¹‰à¸² {currentPage} à¸ˆà¸²à¸ {totalPages}
          </span>
          {totalPages > 1 && (
            <button
              type="button"
              onClick={handleNextPage}
              disabled={currentPage >= totalPages}
              className="hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10 transition disabled:opacity-30 cursor-pointer"
            >
              â–¶
            </button>
          )}
        </div>

        <div>
          <button
            type="button"
            onClick={handleDownload}
            className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition cursor-pointer"
            title="à¸”à¸²à¸§à¸™à¹Œà¹‚à¸«à¸¥à¸”à¹€à¸­à¸à¸ªà¸²à¸£"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LecturerDocumentView({
  lecturerName = 'à¸­à¸²à¸ˆà¸²à¸£à¸¢à¹Œ XXXX',
  facultyName = 'à¸„à¸“à¸°: yyy'
}) {
  return null;
}
