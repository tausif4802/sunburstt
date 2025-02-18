"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import useSWR from "swr";

interface AnalyticsPanelProps {
  fromDate: string;
  toDate: string;
  agentId?: string;
  conversationId?: string;
}

interface ErrorDetail {
  error_code: string;
  error_part: string;
  error_description: string;
}

interface Message {
  id: string;
  timestamp: string;
  content: string;
  error_details: ErrorDetail[];
}

interface Subcategory {
  title: string;
  count: number;
  messages: Message[];
}

interface ErrorCategory {
  title: string;
  count: number;
  subcategories: Record<string, Subcategory>;
}

interface ConversationAnalysis {
  role: 'user' | 'admin';
  content: string;
  created_at: string;
  conversation_piece_id: number;
  error_details: ErrorDetail[];
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
};

// Get main category for error code
const getMainCategory = (errorCode: string): string => {
  if (errorCode.startsWith('G_')) {
    return 'Grammatical Error';
  }
  if (errorCode.startsWith('T_')) {
    return 'Agent Tone Error';
  }
  return 'Other Error';
};

// Get subcategory for error code
const getSubcategory = (errorCode: string): string => {
  const subcategories: Record<string, string> = {
    'G_101': 'Sentence Structure Errors',
    'G_102': 'Subject-Verb Agreement Errors',
    'G_103': 'Pronoun Usage Errors',
    'G_104': 'Punctuation Errors',
    'G_105': 'Regular Spelling Errors',
    'G_106': 'Context-Altering Spelling Errors',
    'G_107': 'Preposition Errors',
    'G_108': 'Capitalization Errors',
    'G_109': 'Tone/Style Errors',
    'G_110': 'Redundancy and Wordiness Errors',
    'G_111': 'Negation Errors',
    'G_112': 'Lack of Consistency Errors',
    'G_113': 'Missing Articles Errors',
    'G_114': 'Misuse of Conjunctions Errors',
    'T_101': 'Negative Tone',
    'T_102': 'Unprofessional Language',
    'T_103': 'Aggressive Language',
    'T_104': 'Dismissive Tone',
    'T_105': 'Sarcastic Tone',
    'T_106': 'Condescending Tone',
    'T_107': 'Impatient Tone',
    'T_108': 'Frustrated Tone',
    'T_109': 'Insensitive Language',
    'T_110': 'Overly Casual Tone'
  };
  return subcategories[errorCode] || 'Other Errors';
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AnalyticsPanel({ 
  fromDate, 
  toDate, 
  agentId,
  conversationId 
}: AnalyticsPanelProps) {
  const [expandedSections, setExpandedSections] = React.useState<string[]>([]);

  const {
    data: analysisData,
    error,
    isLoading
  } = useSWR<ConversationAnalysis[]>(
    conversationId ? `/api/conversation/analysis?conversation_id=${conversationId}` : null,
    fetcher
  );

  const errorCategories = React.useMemo(() => {
    if (!analysisData) return [];

    const categories: Record<string, ErrorCategory> = {};
    
    analysisData.forEach(piece => {
      piece.error_details.forEach(error => {
        const mainCategory = getMainCategory(error.error_code);
        const subcategory = getSubcategory(error.error_code);
        
        // Initialize main category if it doesn't exist
        if (!categories[mainCategory]) {
          categories[mainCategory] = {
            title: mainCategory,
            count: 0,
            subcategories: {}
          };
        }
        
        // Initialize subcategory if it doesn't exist
        if (!categories[mainCategory].subcategories[subcategory]) {
          categories[mainCategory].subcategories[subcategory] = {
            title: subcategory,
            count: 0,
            messages: []
          };
        }
        
        // Increment counts
        categories[mainCategory].count++;
        categories[mainCategory].subcategories[subcategory].count++;
        
        // Add message to subcategory
        categories[mainCategory].subcategories[subcategory].messages.push({
          id: piece.conversation_piece_id.toString(),
          timestamp: formatDate(piece.created_at),
          content: piece.content,
          error_details: [error]
        });
      });
    });
    
    return Object.values(categories).sort((a, b) => b.count - a.count);
  }, [analysisData]);

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  if (error) {
    return (
      <div className="w-full mx-auto bg-white rounded-3xl overflow-hidden shadow-lg max-w-[310px] h-[700px]">
        <div className="p-4">
          <p className="text-red-500">Error loading analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto bg-white rounded-3xl overflow-hidden shadow-lg max-w-[310px] h-[700px]">
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-gray-200 h-8 w-full rounded-md"
              ></div>
            ))
          ) : !conversationId ? (
            <p className="text-gray-500 text-sm">
              Select a conversation to view analysis
            </p>
          ) : errorCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No errors found in this conversation
            </p>
          ) : (
            errorCategories.map((category) => (
              <div key={category.title} className="space-y-2">
                {/* Main category */}
                <button
                  onClick={() => toggleSection(category.title)}
                  className="w-full flex items-center justify-between py-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{category.title}</span>
                    <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-sm">
                      {category.count}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 text-gray-500 transition-transform",
                      expandedSections.includes(category.title)
                        ? "rotate-180"
                        : ""
                    )}
                  />
                </button>

                {/* Subcategories */}
                {expandedSections.includes(category.title) && (
                  <div className="space-y-2 pl-4">
                    {Object.values(category.subcategories)
                      .sort((a, b) => b.count - a.count)
                      .map((subcategory) => (
                        <div key={subcategory.title} className="space-y-2">
                          <button
                            onClick={() => toggleSection(`${category.title}:${subcategory.title}`)}
                            className="w-full flex items-center justify-between py-2 text-left"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900">{subcategory.title}</span>
                              <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded text-sm">
                                {subcategory.count}
                              </span>
                            </div>
                            <ChevronDown
                              className={cn(
                                "h-5 w-5 text-gray-500 transition-transform",
                                expandedSections.includes(`${category.title}:${subcategory.title}`)
                                  ? "rotate-180"
                                  : ""
                              )}
                            />
                          </button>

                          {/* Messages */}
                          {expandedSections.includes(`${category.title}:${subcategory.title}`) && (
                            <div className="space-y-2 pl-2">
                              {subcategory.messages.map((message) => (
                                <div
                                  key={message.id}
                                  className="p-3 rounded-lg bg-teal-700 text-white space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm">
                                      {message.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-sm">{message.content}</p>
                                  {message.error_details.map((error, idx) => (
                                    <p key={idx} className="text-sm text-teal-200 mt-1">
                                      Error: {error.error_description}
                                    </p>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
