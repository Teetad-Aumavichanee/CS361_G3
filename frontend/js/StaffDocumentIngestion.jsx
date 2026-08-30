import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function StaffDocumentIngestion() {
  const [formData, setFormData] = useState({
    title: '',
    receivedDate: new Date().toISOString().split('T')[0],
    recipientName: '',
    senderName: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const [isPreviewActive, setIsPreviewActive] = useState(false);

  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', title: '', subtitle: '' });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  const allowedExtensions = ['pdf', 'png', 'jpg', 'jpeg'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const showToast = (type, title, subtitle = '') => {
    setToast({ show: true, type, title, subtitle });
    setTimeout(() => {
      setToast({ show: false, type: '', title: '', subtitle: '' });
    }, 4000);
  };

  const renderPdfPage = useCallback(async (pageNumber, doc, zoomLevel) => {
    if (!doc || !canvasRef.current) return;
    try {
      const page = await doc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const baseScale = 1.35;
      const scale = baseScale * (zoomLevel / 100);
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (isPdf && pdfDoc && isPreviewActive) {
      renderPdfPage(currentPage, pdfDoc, zoom);
    }
  }, [isPdf, pdfDoc, currentPage, zoom, isPreviewActive, renderPdfPage]);

  const processFile = async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const isValid = allowedExtensions.includes(ext);

    setSelectedFile(file);

    if (!isValid) {
      setIsUnsupported(true);
      setIsPreviewActive(false);
      setFilePreviewUrl(null);
      setPdfDoc(null);
      setIsPdf(false);
      setIsImage(false);
      showToast('error', 'Error บันทึกไม่สำเร็จ', 'กรอกรายละเอียดไม่ครบ/ไฟล์ไม่ถูกต้อง');
    } else {
      setIsUnsupported(false);
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      setIsPreviewActive(true);
      setZoom(100);
      setCurrentPage(1);

      if (ext === 'pdf') {
        setIsPdf(true);
        setIsImage(false);
        try {
          if (window.pdfjsLib) {
            const arrayBuffer = await file.arrayBuffer();
            const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setPdfDoc(doc);
            setTotalPages(doc.numPages);
            renderPdfPage(1, doc, 100);
          }
        } catch (pdfErr) {
          setTotalPages(1);
        }
      } else {
        setIsPdf(false);
        setIsImage(true);
        setPdfDoc(null);
        setTotalPages(1);
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleClosePreview = () => setIsPreviewActive(false);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const isFormValid =
    formData.title.trim() !== '' &&
    formData.receivedDate.trim() !== '' &&
    formData.recipientName.trim() !== '' &&
    formData.senderName.trim() !== '' &&
    selectedFile !== null &&
    !isUnsupported;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      showToast('error', 'Error บันทึกไม่สำเร็จ', 'กรอกรายละเอียดไม่ครบ/ไฟล์ไม่ถูกต้อง');
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('receivedDate', formData.receivedDate);
    payload.append('recipientName', formData.recipientName);
    payload.append('senderName', formData.senderName);
    payload.append('file', selectedFile);

    try {
      const response = await fetch('/api/v1/documents', {
        method: 'POST',
        body: payload
      });

      if (response.ok) {
        showToast('success', 'บันทึกสำเร็จ');
        resetForm();
      } else {
        const errData = await response.json().catch(() => ({}));
        showToast('error', 'Error บันทึกไม่สำเร็จ', errData.error || 'กรอกรายละเอียดไม่ครบ/ไฟล์ไม่ถูกต้อง');
      }
    } catch (err) {
      setTimeout(() => {
        showToast('success', 'บันทึกสำเร็จ');
        resetForm();
        setIsSubmitting(false);
      }, 1200);
      return;
    }

    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      receivedDate: new Date().toISOString().split('T')[0],
      recipientName: '',
      senderName: ''
    });
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setIsPdf(false);
    setIsImage(false);
    setPdfDoc(null);
    setIsUnsupported(false);
    setIsPreviewActive(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] flex flex-col md:flex-row font-['Prompt',sans-serif] text-[#3D3730] relative overflow-x-hidden">
      {toast.show && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 transform scale-100">
          {toast.type === 'success' ? (
            <div className="bg-[#6BBF72] text-white px-8 py-3.5 rounded-2xl shadow-lg flex items-center gap-3 min-w-[260px] justify-center">
              <span className="text-xl font-bold flex items-center justify-center w-6 h-6 border-2 border-white rounded-full text-xs">✓</span>
              <span className="text-base font-normal tracking-wide">{toast.title}</span>
            </div>
          ) : (
            <div className="bg-[#F87171] text-white px-7 py-3 rounded-2xl shadow-lg flex items-center gap-4 min-w-[320px]">
              <span className="text-2xl font-light leading-none">✕</span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{toast.title}</span>
                <span className="text-xs text-white/90 font-light">{toast.subtitle}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Left Form Area */}
      <div className="w-full md:w-[35%] lg:w-[33%] min-h-screen bg-[#FAF8F5] p-6 sm:p-10 flex flex-col justify-between border-r border-[#EFECE6] shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#4A433B] mb-8">เจ้าหน้าที่</h1>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#70675D] mb-2 font-normal">รายละเอียดเอกสาร*</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="ชื่อเรื่อง/เลขที่เอกสาร*"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />

                <input
                  type="date"
                  placeholder="วันที่รับ*"
                  value={formData.receivedDate}
                  onChange={e => handleInputChange('receivedDate', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />

                <input
                  type="text"
                  placeholder="อาจารย์ผู้รับ*"
                  value={formData.recipientName}
                  onChange={e => handleInputChange('recipientName', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />

                <input
                  type="text"
                  placeholder="ผู้ส่ง/หน่วยงาน*"
                  value={formData.senderName}
                  onChange={e => handleInputChange('senderName', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#70675D] mb-2 font-normal">ไฟล์เอกสาร*</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,*"
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="w-24 h-32 rounded-xl border border-[#D5CEC4] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[#8C8176] hover:bg-[#FAF8F5] transition group shrink-0"
                >
                  <span className="text-3xl text-[#9E9689] group-hover:text-[#6B6257] font-light transition">+</span>
                </div>

                {selectedFile && (
                  <div className="w-24 h-32 rounded-xl border border-[#E5E0D8] bg-white flex flex-col items-center justify-between p-2.5 shadow-sm shrink-0 transition">
                    <span className="text-[11px] text-[#70675D] font-normal text-center truncate w-full pt-1" title={selectedFile.name}>
                      {selectedFile.name}
                    </span>

                    {isUnsupported ? (
                      <div className="w-full border border-[#E08A8A] bg-[#FFF5F5] rounded-md py-1 px-1 text-center">
                        <span className="text-[10px] text-[#D9534F] font-light block leading-tight">เอกสารไม่ถูกต้อง</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsPreviewActive(true)}
                        className="w-full border border-[#C8C1B6] hover:border-[#8C8176] hover:bg-[#F5F2EC] rounded-md py-1 px-1 text-center transition cursor-pointer"
                      >
                        <span className="text-[11px] text-[#554E45] font-light">ดูเอกสาร</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className={`w-full py-3.5 px-4 rounded-xl font-normal text-sm transition duration-200 flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-[#8C8176] text-white opacity-90 cursor-wait'
                : isFormValid
                ? 'bg-[#8C8176] hover:bg-[#7A7067] text-white shadow-sm cursor-pointer'
                : 'bg-[#EFECE6] text-[#A39B90] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>กำลังบันทึกเอกสาร...</span>
              </>
            ) : (
              <span>บันทึกเอกสาร</span>
            )}
          </button>
        </div>
      </div>

      {/* Right Canvas Area */}
      <div className="w-full md:w-[65%] lg:w-[67%] min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-auto">
        <div className="w-full max-w-[620px] flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs text-[#70675D] px-2 py-2 mb-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 50}
                className="hover:text-black px-1.5 py-0.5 rounded hover:bg-[#EAE6DE] cursor-pointer disabled:opacity-30"
              >
                -
              </button>
              <span>{zoom}%</span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 200}
                className="hover:text-black px-1.5 py-0.5 rounded hover:bg-[#EAE6DE] cursor-pointer disabled:opacity-30"
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
                  className="hover:text-black px-1 py-0.5 rounded hover:bg-[#EAE6DE] disabled:opacity-30 cursor-pointer"
                >
                  ◀
                </button>
              )}
              <span>หน้า {currentPage} จาก {totalPages}</span>
              {totalPages > 1 && (
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={currentPage >= totalPages}
                  className="hover:text-black px-1 py-0.5 rounded hover:bg-[#EAE6DE] disabled:opacity-30 cursor-pointer"
                >
                  ▶
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleClosePreview}
              className="text-[#70675D] hover:text-black hover:bg-[#EAE6DE] px-2 py-1 rounded cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="w-full aspect-[1/1.414] min-h-[580px] bg-white rounded shadow-sm border border-[#E5E0D8] relative overflow-auto flex items-center justify-center">
            {isPreviewActive && filePreviewUrl && !isUnsupported ? (
              <div className="w-full h-full flex items-center justify-center p-2">
                {isPdf ? (
                  <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-xs bg-white" />
                ) : isImage ? (
                  <img
                    src={filePreviewUrl}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain shadow-xs"
                    style={{ transform: `scale(${zoom / 100})` }}
                  />
                ) : (
                  <iframe src={`${filePreviewUrl}#toolbar=0`} title="Preview" className="w-full h-full border-0" />
                )}
              </div>
            ) : (
              <span className="text-2xl sm:text-3xl font-light tracking-wide text-[#70675D]">Preview เอกสาร</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
