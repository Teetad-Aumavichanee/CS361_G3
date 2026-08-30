import React, { useState, useEffect } from 'react';

export function DocumentPreviewModal({ document: doc, isOpen, onClose }) {
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
        <div
          className="max-w-2xl text-white space-y-1.5 pr-4"
          onClick={(e) => e.stopPropagation()}
        >
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
    </div>
  );
}

export default function LecturerDocumentView({
  lecturerName = 'à¸­à¸²à¸ˆà¸²à¸£à¸¢à¹Œ XXXX',
  facultyName = 'à¸„à¸“à¸°: yyy'
}) {
  return null;
}
