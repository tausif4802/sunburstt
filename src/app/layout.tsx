'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/SideBar';
import { Navbar as TopNav } from '@/components/TopNav';
import { Analytics } from '@vercel/analytics/react';
import SummarizeBtn from '@/components/grammar/SummarizeBtn';
import { useState } from 'react';

// export const metadata: Metadata = {
//   title: 'Starburst',
//   description: 'Starburst Analytics',
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#F4F4F4] dark:bg-black">
        <div className="p-6 flex flex-row gap-4 h-screen bg-transparent">
          <div
            className={`transition-all duration-300 ${
              isMinimized ? 'w-[5%]' : 'w-[17%]'
            }`}
          >
            <Sidebar onMinimizeChange={setIsMinimized} />
          </div>
          <div
            className={`transition-all  duration-300 ${
              isMinimized ? 'w-[95%]' : 'w-[83%]'
            } flex flex-col`}
          >
            <div className="sticky top-6 z-50 ">
              <TopNav user={{ name: 'John Doe' }} />
            </div>
            <div className="flex-1 overflow-auto">
              <SummarizeBtn />
              <main className="flex-1 bg-background px-2 py-6">{children}</main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
