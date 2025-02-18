import { ConversationsClient } from "@/components/chat/ConversationsClient";

interface PageProps {
  searchParams: {
    conversation_ids?: string;
    from_date?: string;
    to_date?: string;
    agent_id?: string;
    source?: string;
    data_point?: string;
  }
}

export default function ConversationsPage({ searchParams }: PageProps) {
  // Default date range for direct access
  const defaultFromDate = "2023-06-29";
  const defaultToDate = "2023-07-29";
  
  const initialParams = {
    fromDate: searchParams.from_date || defaultFromDate,
    toDate: searchParams.to_date || defaultToDate,
    agentId: searchParams.agent_id,
    conversationIds: searchParams.conversation_ids?.split(','),
    source: searchParams.source,
    dataPoint: searchParams.data_point
  };

  return <ConversationsClient initialParams={initialParams} />;
}
