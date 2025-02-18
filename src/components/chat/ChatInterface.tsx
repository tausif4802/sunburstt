"use client";

import { Search } from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import useSWR from "swr";
import { LoadingSpinner } from "./LoadingSpinner";

interface ChatInterfaceProps {
  fromDate: string;
  toDate: string;
  agentId?: string;
  activeConversation?: string;
  source?: string;     // Which analysis user came from
  dataPoint?: string;  // What specific point was clicked
  onConversationSelect: (id: string) => void;
}

interface Conversation {
  id: string;
  name: string;
  message: string;
  timestamp: string;
  avatarUrl: string;
  isLastMessageFromAgent: boolean;
  email: string;
}

interface ErrorDetail {
  error_code: string;
  error_part: string;
  error_description: string;
}

interface Message {
  id: number;
  content: string;
  timestamp: string;
  isUser: boolean;
  isAgent: boolean;
  created_at: string;
  role: 'user' | 'admin';
  error_details?: ErrorDetail[];
}

interface ConversationHead {
  role: 'user' | 'admin';
  last_message: string;
  last_time: string;
  user_name: string;
  user_email: string;
  is_last_message_owner_agent: boolean;
}

interface ConversationHeadResponse extends Array<{ [key: string]: ConversationHead }> {}

interface ConversationMessage {
  role: 'user' | 'admin';
  content: string;
  created_at: string;
}

interface ConversationAnalysis {
  role: 'user' | 'admin';
  content: string;
  created_at: string;
  conversation_piece_id: number;
  error_details: Array<{
    error_code: string;
    error_part: string;
    error_description: string;
  }>;
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

const transformConversations = (data: ConversationHeadResponse): Conversation[] => {
  return data
    .flatMap((item) =>
      Object.entries(item).map(([id, data]) => ({
        id,
        name: data.user_name,
        message: data.last_message,
        timestamp: formatDate(data.last_time),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          data.user_name
        )}`,
        isLastMessageFromAgent: data.is_last_message_owner_agent,
        email: data.user_email,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function ChatInterface({ 
  fromDate, 
  toDate, 
  agentId,
  activeConversation,
  source,
  dataPoint,
  onConversationSelect
}: ChatInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const {
    data: conversationHeads,
    error: headsError,
    isLoading: headsLoading,
  } = useSWR<ConversationHeadResponse>(
    `http://api.avaflow.net/conversation/head?from_date=${fromDate}&to_date=${toDate}${agentId ? `&agent_id=${agentId}` : ''}`,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onError: (err) => {
        console.error("Error fetching conversations:", err);
      },
      dedupingInterval: 2000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  const {
    data: conversationDetails,
    error: detailsError,
    isLoading: detailsLoading
  } = useSWR<ConversationMessage[]>(
    activeConversation !== undefined ? `http://api.avaflow.net/conversation?conversation_id=${activeConversation}` : null,
    fetcher
  );

  const {
    data: conversationAnalysis,
    error: analysisError
  } = useSWR<ConversationAnalysis[]>(
    activeConversation !== undefined ? `/api/conversation/analysis?conversation_id=${activeConversation}` : null,
    fetcher
  );

  useEffect(() => {
    if (conversationHeads) {
      const transformed = transformConversations(conversationHeads);
      const filtered = transformed.filter((conv) =>
        conv.name.toLowerCase().includes((searchQuery || "").toLowerCase())
      );
      setConversations(filtered);
    }
  }, [conversationHeads, searchQuery]);

  useEffect(() => {
    if (conversationDetails && conversationAnalysis) {
      const transformedMessages = conversationDetails.map((msg, index) => {
        // Find corresponding analysis for this message
        const analysis = conversationAnalysis.find(
          a => a.content === msg.content && a.role === msg.role
        );

        return {
          id: index,
          content: msg.content,
          timestamp: formatDate(msg.created_at),
          isUser: msg.role === 'user',
          isAgent: msg.role === 'admin',
          created_at: msg.created_at,
          role: msg.role,
          error_details: analysis?.error_details as ErrorDetail[] | undefined
        };
      });
      setMessages(transformedMessages);
    }
  }, [conversationDetails, conversationAnalysis]);

  if (headsError || detailsError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          Error loading conversations. Please try again later.
        </div>
      </div>
    );
  }

  if (headsLoading || !conversationHeads) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full flex items-start justify-start">
      <div className="flex w-full max-w-[1200px] bg-white h-[700] rounded-[32px] shadow-lg overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[380px] border-r border-gray-100 flex flex-col">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search"
                className="pl-10 bg-gray-50 border-none rounded-full h-11"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex items-start space-x-4 p-4 cursor-pointer transition-colors ${
                  activeConversation !== undefined && activeConversation === conversation.id
                    ? "bg-[#105d5c]"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  onConversationSelect(conversation.id);
                }}
              >
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage
                    src={conversation.avatarUrl}
                    alt={conversation.name}
                    className="rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg">
                    {conversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <p
                      className={`font-medium truncate ${
                        activeConversation !== undefined && activeConversation === conversation.id
                          ? "text-white"
                          : "text-gray-900"
                      }`}
                    >
                      {conversation.name}
                    </p>
                    <span
                      className={`text-sm whitespace-nowrap ${
                        activeConversation !== undefined && activeConversation === conversation.id
                          ? "text-white/70"
                          : "text-gray-500"
                      }`}
                    >
                      {conversation.timestamp}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate mt-1 ${
                      activeConversation !== undefined && activeConversation === conversation.id
                        ? "text-white/70"
                        : "text-gray-500"
                    }`}
                  >
                    {conversation.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right chat area */}
        <div className="flex-1 p-4">
          <div className="h-full bg-[#f4f4f4] rounded-[24px] overflow-hidden">
            <div className="h-full overflow-y-auto p-6">
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex flex-col gap-1.5 ${
                      message.isUser ? "items-start" : "items-end"
                    }`}
                  >
                    <div
                      className={`
                        relative px-4 py-3
                        ${
                          message.error_details && message.error_details.length > 0
                            ? "bg-yellow-100 text-gray-900"
                            : message.isUser
                              ? "bg-[#c4e99f] text-gray-900"
                              : "bg-[#2c2c2c] text-white"
                        }
                        ${
                          message.isUser
                            ? "rounded-tl-2xl rounded-tr-2xl rounded-br-2xl rounded-bl-md"
                            : "rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md"
                        }
                        max-w-[85%]
                      `}
                    >
                      <div className="relative">
                        <p className="text-[15px] leading-relaxed">
                          {message.content}
                        </p>
                        {message.error_details && message.error_details.length > 0 && (
                          <div className="mt-2 text-xs text-gray-600">
                            {message.error_details.map((error, idx) => (
                              <p key={idx} className="mt-1">
                                Error: {error.error_description}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`
                        text-sm text-gray-500
                        ${message.isUser ? "pl-2" : "pr-2"}
                      `}
                    >
                      {message.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
