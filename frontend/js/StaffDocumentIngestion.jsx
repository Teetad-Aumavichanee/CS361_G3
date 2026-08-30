import React, { useState, useRef } from 'react';

export default function StaffDocumentIngestion() {
  const [formData, setFormData] = useState({
    title: '',
    receivedDate: new Date().toISOString().split('T')[0],
    recipientName: '',
    senderName: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [isPreviewActive, setIsPreviewActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setIsPreviewActive(true);
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
      setIsPreviewActive(true);
    }
  };

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
              <label className="block text-sm text-[#70675D] mb-2 font-normal">à¹„à¸Ÿà¸¥à¹Œà¹€à¸­à¸à¸ªà¸²à¸£*</label>
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
                  title="à¸„à¸¥à¸´à¸à¸«à¸£à¸·à¸­à¸¥à¸²à¸à¹„à¸Ÿà¸¥à¹Œà¸¡à¸²à¸§à¸²à¸‡ (.pdf, .png, .jpg)"
                >
                  <span className="text-3xl text-[#9E9689] group-hover:text-[#6B6257] font-light transition">+</span>
                </div>

                {selectedFile && (
                  <div className="w-24 h-32 rounded-xl border border-[#E5E0D8] bg-white flex flex-col items-center justify-between p-2.5 shadow-sm shrink-0 transition">
                    <span className="text-[11px] text-[#70675D] font-normal text-center truncate w-full pt-1" title={selectedFile.name}>
                      {selectedFile.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPreviewActive(true)}
                      className="w-full border border-[#C8C1B6] hover:border-[#8C8176] hover:bg-[#F5F2EC] rounded-md py-1 px-1 text-center transition cursor-pointer"
                    >
                      <span className="text-[11px] text-[#554E45] font-light">à¸”à¸¹à¹€à¸­à¸à¸ªà¸²à¸£</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-auto">
          <button
            type="button"
            className="w-full py-3.5 px-4 rounded-xl font-normal text-sm bg-[#EFECE6] text-[#A39B90] cursor-not-allowed"
          >
            à¸šà¸±à¸™à¸—à¸¶à¸à¹€à¸­à¸à¸ªà¸²à¸£
          </button>
        </div>
      </div>

      <div className="w-full md:w-[65%] lg:w-[67%] min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-auto">
        <div className="w-full max-w-[620px] aspect-[1/1.414] min-h-[580px] bg-white rounded shadow-sm border border-[#E5E0D8] flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-light tracking-wide text-[#70675D]">Preview à¹€à¸­à¸à¸ªà¸²à¸£</span>
        </div>
      </div>
    </div>
  );
}
