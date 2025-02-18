'use client';
import * as React from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Settings2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  user?: {
    name: string;
    image?: string;
  };
}

// Map route segments to display names
const routeNameMap: Record<string, string> = {
  'auto-qa': 'Auto QA',
  'manual-reviews': 'Manual Reviews',
  overview: 'Overview',
  disputes: 'Disputes',
  conversations: 'Conversations',
  insight: 'Insight',
  'error-overview': 'Error Overview',
  'agent-overview': 'Agent Overview',
  'grammatical-errors': 'Grammatical & Spelling Errors',
  'agent-tone': 'Agent Tone Analysis',
};

export function Navbar({ user, className, ...props }: NavbarProps) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const pathname = usePathname();

  // Generate breadcrumb items from the current path
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join('/')}`;
      const isLast = index === segments.length - 1;
      const displayName = routeNameMap[segment] || segment;

      if (isLast) {
        return (
          <BreadcrumbItem key={path}>
            <BreadcrumbPage className="font-medium text-foreground">
              {displayName}
            </BreadcrumbPage>
          </BreadcrumbItem>
        );
      }

      return (
        <BreadcrumbItem key={path}>
          <BreadcrumbLink
            href={path}
            className="text-muted-foreground transition-colors hover:text-primary"
          >
            {displayName}
          </BreadcrumbLink>
        </BreadcrumbItem>
      );
    });

    return breadcrumbs;
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div
      className={cn(
        'flex h-16 items-center justify-between bg-card border-border dark:bg-card-dark dark:border-border-dark border px-4 rounded-[36px]',
        className
      )}
      {...props}
    >
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList className="flex items-center space-x-1">
          {generateBreadcrumbs().map((breadcrumb, index) => (
            <React.Fragment key={index}>
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
              {breadcrumb}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative dark:text-gray-500 dark:border-gray-500 ">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground dark:text-gray-500" />
          <Input
            type="search"
            placeholder="Search"
            className="w-[200px] pl-8 md:w-[200px] rounded-full border-[#DADADA] border dark:border-[#232323]"
          />
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center space-x-2 ">
          <span className="text-sm lg:text-xs dark:text-gray-500">
            Dark Mode
          </span>
          <Switch
            checked={isDarkMode}
            onCheckedChange={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="bg-[#F4F4F4] border-[#DADADA] dark:border-[#232323] "
          />
        </div>

        {/* User Menu */}
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-accent"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} alt={user.name} />
                  <AvatarFallback className="dark:text-gray-500">
                    {user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="dark:text-gray-500">{user.name}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground dark:text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-white dark:bg-[#1C1C1C] rounded-2xl border border-[#DADADA] dark:border-[#232323] mt-2 shadow-lg"
            >
              <DropdownMenuLabel className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#DADADA] dark:bg-[#232323]" />
              <div className="px-1 py-1">
                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm hover:bg-[#F4F4F4] dark:hover:bg-[#232323] cursor-pointer">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm hover:bg-[#F4F4F4] dark:hover:bg-[#232323] cursor-pointer">
                  Settings
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-[#DADADA] dark:bg-[#232323]" />
              <div className="px-1 py-1">
                <DropdownMenuItem className="rounded-lg px-2 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-[#F4F4F4] dark:hover:bg-[#232323] cursor-pointer">
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
