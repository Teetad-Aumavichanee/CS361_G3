import React, { useState, useEffect, useRef, useCallback } from 'react';

export function DocumentPreviewModal({ document: doc, isOpen, onClose }) {
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (isOpen && doc) {
      if (doc.fileUrl) {
        if (doc.fileUrl.endsWith('.pdf')) {
          setIsPdf(true);
          setIsImage(false);
          if (window.pdfjsLib) {
            window.pdfjsLib.getDocument(doc.fileUrl).promise.then(pdf => setPdfDoc(pdf));
          }
        } else {
          setIsPdf(false);
          setIsImage(true);
        }
      } else {
        setIsPdf(false);
        setIsImage(false);
      }
    }
  }, [isOpen, doc]);

  if (!isOpen || !doc) return null;

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

      {/* A4 Paper Preview Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto min-h-0 cursor-pointer" onClick={onClose}>
        <div
          className="w-full max-w-[580px] aspect-[1/1.414] max-h-[75vh] bg-white rounded shadow-2xl border border-white/20 relative flex items-center justify-center overflow-auto cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          {isPdf && pdfDoc ? (
            <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
          ) : isImage && doc.fileUrl ? (
            <img src={doc.fileUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-xl sm:text-2xl font-light tracking-wide text-[#70675D]">
              Preview à¹€à¸­à¸à¸ªà¸²à¸£
            </span>
          )}
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
