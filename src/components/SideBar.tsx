'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  Grid,
  Eye,
  Zap,
  BarChart2,
  GitBranch,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';
import logo from '@/../public/logo.svg';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  items?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Overview',
    href: '/overview',
    icon: Grid,
  },
  {
    title: 'Manual Reviews',
    href: '/manual-reviews',
    icon: Eye,
  },
  {
    title: 'Auto QA',
    href: '/auto-qa',
    icon: Zap,
    items: [
      {
        title: 'Error Overview',
        href: '/auto-qa/error-overview',
      },
      {
        title: 'Agent Overview',
        href: '/auto-qa/agent-overview',
      },
      {
        title: 'Insight',
        href: '/auto-qa/insight',
        items: [
          {
            title: 'Grammatical & Spelling Errors',
            href: '/auto-qa/insight/grammatical-errors',
          },
          {
            title: 'Agent Tone Analysis',
            href: '/auto-qa/insight/agent-tone',
          },
        ],
      },
    ],
  },
  {
    title: 'Disputes',
    href: '/disputes',
    icon: GitBranch,
  },
  {
    title: 'Conversations',
    href: '/conversations',
    icon: MessageSquare,
  },
];

export function Sidebar({
  onMinimizeChange,
}: {
  onMinimizeChange?: (isMinimized: boolean) => void;
}) {
  const pathname = usePathname();
  const [isMinimized, setIsMinimized] = React.useState(false);

  const handleMinimizeToggle = () => {
    const newState = !isMinimized;
    setIsMinimized(newState);
    onMinimizeChange?.(newState);
  };

  return (
    <div>
      <div
        className={`min-h-[80vh] flex flex-col bg-card border-border dark:bg-card-dark dark:border-border-dark border rounded-[32px] py-4 transition-all duration-300 ${
          isMinimized ? 'w-20' : ''
        }`}
      >
        <div
          className={`${
            isMinimized
              ? 'flex flex-col items-center gap-4'
              : 'h-14 flex justify-between items-center px-4'
          }`}
        >
          <Link
            href="/"
            className={`flex items-center gap-2 font-semibold ${
              isMinimized ? 'justify-center' : ''
            }`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full text-white">
              <Image
                src={logo}
                alt="logo"
                height={150}
                width={150}
                quality={100}
              />
            </div>
            {!isMinimized && (
              <p className="text-[#105D5C] text-lg">Logoipsum</p>
            )}
          </Link>
          <button
            onClick={handleMinimizeToggle}
            className="p-2 rounded-[4px] hover:bg-[#bababa] bg-[#F4F4F4] dark:bg-gray-800 dark:text-[#F4F4F4] hover:text-[#F4F4F4] text-[#6E6E6E] duration-300 transition-all"
          >
            {isMinimized ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
        <div className={`my-4 ${isMinimized ? 'px-2' : 'px-4'}`}>
          <div className="h-[1px] bg-gray-200 dark:bg-gray-700" />
        </div>
        <div className="flex-1 overflow-auto py-2">
          <div className={`px-4 py-2 ${isMinimized ? 'hidden' : ''}`}>
            <p className="text-xs font-medium text-[#8E8E93]">DASHBOARD</p>
          </div>
          <nav
            className={`grid gap-4 ${
              isMinimized ? 'px-0' : 'px-4'
            } text-[#2C2C2C] dark:text-[#eaeaeab9] font-medium`}
          >
            {navigation.map((item, index) => (
              <NavItem
                key={index}
                item={item}
                pathname={pathname}
                isMinimized={isMinimized}
                onExpand={handleMinimizeToggle}
              />
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavItem({
  item,
  pathname,
  isMinimized,
  onExpand,
}: {
  item: NavItem;
  pathname: string;
  isMinimized: boolean;
  onExpand: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(pathname.includes(item.href));
  const Icon = item.icon;

  const handleClick = (e: React.MouseEvent) => {
    if (isMinimized && item.items) {
      e.preventDefault();
      onExpand();
    } else if (item.items) {
      setIsOpen(!isOpen);
    }
  };

  // Common styles for hover and active states
  const commonHoverStyles = `
    hover:text-white hover:bg-[#17918f] dark:hover:bg-[#C4E99F] dark:hover:text-white
    transition-all duration-300
  `;

  const commonActiveStyles = `
    text-white dark:hover:text-dark bg-[#105D5C]
  `;

  if (item.items) {
    return (
      <div>
        <button
          onClick={handleClick}
          className={`flex w-full items-center gap-2 text-base ${
            isMinimized ? 'justify-center px-0' : 'justify-start px-2'
          } py-2 
            ${pathname.startsWith(item.href) ? commonActiveStyles : ''}
            rounded-full
            text-muted-foreground
            ${
              !isMinimized &&
              'cursor-default hover:bg-transparent hover:text-inherit'
            }`}
        >
          {Icon && <Icon className="h-4 w-4" />}
          {!isMinimized && (
            <>
              <span>{item.title}</span>
              <ChevronDown
                className={`h-4 w-4 ml-auto transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </>
          )}
        </button>
        {isOpen && !isMinimized && (
          <div className="ms-4 border-l border-gray-400 mt-2">
            <div className="space-y-1">
              {item.items.map((subItem, index) => (
                <NavItem
                  key={index}
                  item={subItem}
                  pathname={pathname}
                  isMinimized={isMinimized}
                  onExpand={onExpand}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-2 w-full ${
        isMinimized ? 'justify-center px-0' : 'px-6'
      } py-2
      ${pathname === item.href ? commonActiveStyles : 'text-muted-foreground'} 
      ${commonHoverStyles}
      rounded-full
    `}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {!isMinimized && <span>{item.title}</span>}
    </Link>
  );
}
