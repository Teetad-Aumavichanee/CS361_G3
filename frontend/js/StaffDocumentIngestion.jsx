import React, { useState } from 'react';

export default function StaffDocumentIngestion() {
  const [formData, setFormData] = useState({
    title: '',
    receivedDate: new Date().toISOString().split('T')[0],
    recipientName: '',
    senderName: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      <div className="w-full md:w-[65%] lg:w-[67%] min-h-screen bg-[#F4F2EE] flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[620px] aspect-[1/1.414] min-h-[580px] bg-white rounded shadow-sm border border-[#E5E0D8] flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-light tracking-wide text-[#70675D]">Preview à¹€à¸­à¸à¸ªà¸²à¸£</span>
        </div>
      </div>
    </div>
  );
}
