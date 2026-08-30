import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function StaffDocumentIngestion() {
  const [formData, setFormData] = useState({
    title: '',
    receivedDate: new Date().toISOString().split('T')[0],
    recipientName: '',
    senderName: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);

  const [isPdf, setIsPdf] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [pdfDoc, setPdfDoc] = useState(null);
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

  const renderPdfPage = useCallback(async (pageNumber, doc) => {
    if (!doc || !canvasRef.current) return;
    try {
      const page = await doc.getPage(pageNumber);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      const baseScale = 1.35;
      const viewport = page.getViewport({ scale: baseScale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
    } catch (err) {
      console.error(err);
    }
  }, []);

  const processFiles = (newFiles) => {
    if (!newFiles || newFiles.length === 0) return;

    const fileList = Array.from(newFiles);
    let hasInvalid = false;

    const processedList = fileList.map((file, idx) => {
      const ext = file.name.split('.').pop().toLowerCase();
      const isValid = allowedExtensions.includes(ext);
      if (!isValid) hasInvalid = true;

      return {
        id: `${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 9)}`,
        file: file,
        name: file.name,
        ext: ext,
        url: isValid ? URL.createObjectURL(file) : null,
        isUnsupported: !isValid
      };
    });

    setUploadedFiles(prev => [...prev, ...processedList]);

    if (hasInvalid) {
      showToast('error', 'Error à¸šà¸±à¸™à¸—à¸¶à¸à¹„à¸¡à¹ˆà¸ªà¸³à¹€à¸£à¹‡à¸ˆ', 'à¸à¸£à¸­à¸à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¹„à¸¡à¹ˆà¸„à¸£à¸š/à¹„à¸Ÿà¸¥à¹Œà¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡');
    }

    const firstValid = processedList.find(f => !f.isUnsupported);
    if (firstValid) {
      loadDocumentPreview(firstValid);
    }
  };

  const loadDocumentPreview = async (item) => {
    if (!item || item.isUnsupported) return;

    setActiveFileId(item.id);
    setIsPreviewActive(true);
    setCurrentPage(1);

    if (item.ext === 'pdf') {
      setIsPdf(true);
      setIsImage(false);
      try {
        if (window.pdfjsLib) {
          const arrayBuffer = await item.file.arrayBuffer();
          const doc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          renderPdfPage(1, doc);
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
  };

  useEffect(() => {
    if (isPdf && pdfDoc && isPreviewActive) {
      renderPdfPage(currentPage, pdfDoc);
    }
  }, [isPdf, pdfDoc, currentPage, isPreviewActive, renderPdfPage]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveFile = (idToRemove, e) => {
    e.stopPropagation();
    setUploadedFiles(prev => {
      const filtered = prev.filter(f => f.id !== idToRemove);
      if (activeFileId === idToRemove) {
        const nextValid = filtered.find(f => !f.isUnsupported);
        if (nextValid) {
          loadDocumentPreview(nextValid);
        } else {
          setIsPreviewActive(false);
          setActiveFileId(null);
          setPdfDoc(null);
        }
      }
      return filtered;
    });
  };

  const hasAnyUnsupported = uploadedFiles.some(f => f.isUnsupported);
  const isFormValid =
    formData.title.trim() !== '' &&
    formData.receivedDate.trim() !== '' &&
    formData.recipientName.trim() !== '' &&
    formData.senderName.trim() !== '' &&
    uploadedFiles.length > 0 &&
    !hasAnyUnsupported;

  const activeFile = uploadedFiles.find(f => f.id === activeFileId);

  return (
    <div className="min-h-screen w-full bg-[#FAF8F5] flex flex-col md:flex-row font-['Prompt',sans-serif] text-[#3D3730]">
      <div className="w-full md:w-[35%] lg:w-[33%] min-h-screen bg-[#FAF8F5] p-6 sm:p-10 flex flex-col justify-between border-r border-[#EFECE6] shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-normal text-[#4A433B] mb-8">à¹€à¸ˆà¹‰à¸²à¸«à¸™à¹‰à¸²à¸—à¸µà¹ˆ</h1>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-[#70675D] mb-2 font-normal">à¸£à¸²à¸¢à¸¥à¸°à¹€à¸­à¸µà¸¢à¸”à¹€à¸­à¸à¸ªà¸²à¸£*</label>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="à¸Šà¸·à¹ˆà¸­à¹€à¸£à¸·à¹ˆà¸­à¸‡/à¹€à¸¥à¸‚à¸—à¸µà¹ˆà¹€à¸­à¸à¸ªà¸²à¸£*"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />
                <input
                  type="date"
                  placeholder="à¸§à¸±à¸™à¸—à¸µà¹ˆà¸£à¸±à¸š*"
                  value={formData.receivedDate}
                  onChange={e => handleInputChange('receivedDate', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />
                <input
                  type="text"
                  placeholder="à¸­à¸²à¸ˆà¸²à¸£à¸¢à¹Œà¸œà¸¹à¹‰à¸£à¸±à¸š*"
                  value={formData.recipientName}
                  onChange={e => handleInputChange('recipientName', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />
                <input
                  type="text"
                  placeholder="à¸œà¸¹à¹‰à¸ªà¹ˆà¸‡/à¸«à¸™à¹ˆà¸§à¸¢à¸‡à¸²à¸™*"
                  value={formData.senderName}
                  onChange={e => handleInputChange('senderName', e.target.value)}
                  className="w-full bg-[#F1EDE6] text-[#3D3730] placeholder-[#9E9689] px-4 py-3 rounded-xl border border-transparent focus:border-[#C8C1B6] focus:bg-[#EBE6DE] focus:outline-none transition text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm text-[#70675D] font-normal">à¹„à¸Ÿà¸¥à¹Œà¹€à¸­à¸à¸ªà¸²à¸£*</label>
                {uploadedFiles.length > 0 && <span className="text-xs text-[#70675D]">({uploadedFiles.length} à¹„à¸Ÿà¸¥à¹Œ)</span>}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg,*"
                multiple
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="w-24 h-32 rounded-xl border border-[#D5CEC4] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-[#8C8176] hover:bg-[#FAF8F5] transition group shrink-0"
                >
                  <span className="text-3xl text-[#9E9689] group-hover:text-[#6B6257] font-light transition">+</span>
                  <span className="text-[10px] text-[#9E9689] mt-1">à¹€à¸žà¸´à¹ˆà¸¡à¹„à¸Ÿà¸¥à¹Œ</span>
                </div>

                {uploadedFiles.map((item) => {
                  const isActive = activeFileId === item.id;
                  return (
                    <div
                      key={item.id}
                      className={`w-24 h-32 rounded-xl border bg-white flex flex-col items-center justify-between p-2.5 shadow-sm shrink-0 transition relative ${
                        isActive ? 'border-[#8C8176] ring-1 ring-[#8C8176]' : 'border-[#E5E0D8]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleRemoveFile(item.id, e)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#E08A8A] hover:bg-[#C97272] text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow transition cursor-pointer"
                      >
                        âœ•
                      </button>
                      <span className="text-[11px] text-[#70675D] font-normal text-center truncate w-full pt-1" title={item.name}>
                        {item.name}
                      </span>
                      {item.isUnsupported ? (
                        <div className="w-full border border-[#E08A8A] bg-[#FFF5F5] rounded-md py-1 px-1 text-center">
                          <span className="text-[10px] text-[#D9534F] font-light block leading-tight">à¹€à¸­à¸à¸ªà¸²à¸£à¹„à¸¡à¹ˆà¸–à¸¹à¸à¸•à¹‰à¸­à¸‡</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => loadDocumentPreview(item)}
                          className={`w-full border rounded-md py-1 px-1 text-center transition cursor-pointer ${
                            isActive ? 'bg-[#8C8176] text-white border-[#8C8176]' : 'border-[#C8C1B6] hover:border-[#8C8176] hover:bg-[#F5F2EC] text-[#554E45]'
                          }`}
                        >
                          <span className="text-[11px] font-light">{isActive ? 'à¸à¸³à¸¥à¸±à¸‡à¸”à¸¹' : 'à¸”à¸¹à¹€à¸­à¸à¸ªà¸²à¸£'}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <button
            type="button"
            disabled={!isFormValid}
            className={`w-full py-3.5 px-4 rounded-xl font-normal text-sm transition ${
              isFormValid ? 'bg-[#8C8176] text-white shadow-sm cursor-pointer' : 'bg-[#EFECE6] text-[#A39B90] cursor-not-allowed'
            }`}
          >
            à¸šà¸±à¸™à¸—à¸¶à¸à¹€à¸­à¸à¸ªà¸²à¸£
          </button>
        </div>
      </div>

      <div className="w-full md:w-[65%] lg:w-[67%] min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[620px] aspect-[1/1.414] min-h-[580px] bg-white rounded shadow-sm border border-[#E5E0D8] flex items-center justify-center">
          {isPreviewActive && activeFile && !activeFile.isUnsupported ? (
            <div className="w-full h-full flex items-center justify-center p-2">
              {isPdf ? (
                <canvas ref={canvasRef} className="max-w-full max-h-full object-contain shadow-xs bg-white" />
              ) : isImage && activeFile.url ? (
                <img src={activeFile.url} alt="Preview" className="max-w-full max-h-full object-contain shadow-xs" />
              ) : null}
            </div>
          ) : (
            <span className="text-2xl sm:text-3xl font-light tracking-wide text-[#70675D]">Preview à¹€à¸­à¸à¸ªà¸²à¸£</span>
          )}
        </div>
      </div>
    </div>
  );
}
