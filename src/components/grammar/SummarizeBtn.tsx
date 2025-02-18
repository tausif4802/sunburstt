'use client';

import { AlignLeft, X } from 'lucide-react';
import { useState } from 'react';

const SummaryPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-[#105D5C] py-3 px-6 rounded-full flex items-center justify-between w-40 text-white fixed right-12 top-[88%] z-50"
      >
        <AlignLeft />
        <p>Summarize</p>
      </button>

      {/* Popup Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          {/* Popup Content */}
          <div className="bg-white rounded-2xl w-full max-w-xl mx-4 p-6 relative animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-base text-[#2C2C2C] font-semibold">
                  Summary
                </h2>
                <div className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-xs text-gray-500">
                  !
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Metrics List */}
              <ol className="list-decimal pl-4 text-sm font-medium text-[#000000] space-y-1">
                <li>
                  Sales Overview: Total revenue this month is $45,000, a 12%
                  increase from last month. Top-performing product: "Wireless
                  Headphones."
                </li>
                <li>
                  User Engagement: Daily active users: 1,500 (up by 8%). New
                  sign-ups: 230. Average session duration: 5 minutes.
                </li>
                <li>
                  Tasks: 5 tasks pending review, 2 overdue. Team productivity is
                  at 85%.
                </li>
                <li>
                  Notifications: 3 system alerts—server maintenance scheduled
                  for Jan 5, and two low-priority updates.
                </li>
              </ol>

              {/* Key Insights */}
              <div className="space-y-3">
                <h3 className="font-semibold">Key Insights:</h3>
                <ul className="list-disc pl-4 space-y-2 text-sm font-medium text-[#000000]">
                  <li>
                    Revenue growth and user engagement metrics indicate positive
                    trends.
                  </li>
                  <li>
                    Focus needed on overdue tasks to maintain team efficiency.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryPopup;
