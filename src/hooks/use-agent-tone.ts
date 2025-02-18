import { useState, useEffect } from 'react';
import { ToneCode, ToneMap, getToneMap, getToneName, isPositiveTone, isNegativeTone } from '@/lib/utils';

interface ToneAnalysisResponse {
  [key: ToneCode]: {
    value: number;
    conversation_id_list: string[];
  };
}

interface ToneAnalysisData {
  [key: string]: number;
}

interface ToneAnalysisResult {
  [key: string]: {
    value: number;
    conversation_id_list: string[];
  };
}

interface ConversationMap {
  [key: string]: string[];
}

interface ToneAnalysisParams {
  isPositive: boolean;
  fromDate: string;
  toDate: string;
  agentId?: string;
}

export function useToneAnalysis({ isPositive, fromDate, toDate, agentId }: ToneAnalysisParams) {
  const [data, setData] = useState<ToneAnalysisData>({});
  const [conversationIds, setConversationIds] = useState<ConversationMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('is_positive', String(isPositive));
        queryParams.append('from_date', fromDate);
        queryParams.append('to_date', toDate);
        if (agentId) queryParams.append('agent_id', agentId);
        
        const [toneMap, response] = await Promise.all([
          getToneMap(),
          fetch(`/api/tone/analysis?${queryParams.toString()}`)
        ]);

        if (!response.ok) throw new Error('Failed to fetch tone analysis');
        const responseData: ToneAnalysisResult = await response.json();

        // Transform the data to use readable tone names
        const transformedData: ToneAnalysisData = {};
        const transformedConversationIds: ConversationMap = {};
        
        Object.entries(responseData).forEach(([code, data]) => {
          if (isPositiveTone(code as ToneCode) === isPositive) {
            const toneName = getToneName(code as ToneCode, toneMap);
            transformedData[toneName] = data.value;
            transformedConversationIds[toneName] = data.conversation_id_list;
          }
        });

        setData(transformedData);
        setConversationIds(transformedConversationIds);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isPositive, fromDate, toDate, agentId]);

  return { data, conversationIds, isLoading, error };
}

interface CustomerToneResponse {
  [customerId: string]: {
    data: {
      Positive: number;
      Negative: number;
      Neutral: number;
    };
    conversation_id_list: string[];
  };
}

interface CustomerToneData {
  id: string;
  positive: number;
  negative: number;
  neutral: number;
  conversationIds: string[];
}

interface MultiCustomerToneParams {
  fromDate: string;
  toDate: string;
  agentId?: string;
}

export function useMultiCustomerTone({ fromDate, toDate, agentId }: MultiCustomerToneParams) {
  const [data, setData] = useState<CustomerToneData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('from_date', fromDate);
        queryParams.append('to_date', toDate);
        if (agentId) queryParams.append('agent_id', agentId);
        
        const url = `/api/tone/multi/customer?${queryParams.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch multi-customer data');
        const responseData: CustomerToneResponse[] = await response.json();

        // Transform the data to match our component needs
        const transformedData: CustomerToneData[] = responseData.map(item => {
          const [customerId, data] = Object.entries(item)[0];
          return {
            id: customerId,
            positive: data.data.Positive,
            negative: data.data.Negative,
            neutral: data.data.Neutral,
            conversationIds: data.conversation_id_list
          };
        });

        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, agentId]);

  return { data, isLoading, error };
}

interface AlertResponse {
  [agentId: string]: {
    value: number;
    conversation_id_list: string[];
  };
}

interface AlertData {
  [agentId: string]: {
    value: number;
    conversationIds: string[];
  };
}

interface AgentAlertsParams {
  fromDate: string;
  toDate: string;
  agentId?: string;
}

export function useAgentAlerts({ fromDate, toDate, agentId }: AgentAlertsParams) {
  const [alertData, setAlertData] = useState<AlertData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('from_date', fromDate);
        queryParams.append('to_date', toDate);
        if (agentId) queryParams.append('agent_id', agentId);
        
        const url = `/api/tone/agent/alert?${queryParams.toString()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch alerts');
        const responseData: AlertResponse = await response.json();

        // Transform the data to include conversation IDs
        const transformedData: AlertData = {};
        Object.entries(responseData).forEach(([agentId, data]) => {
          transformedData[agentId] = {
            value: data.value,
            conversationIds: data.conversation_id_list
          };
        });

        setAlertData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlerts();
  }, [fromDate, toDate, agentId]);

  return { alertData, isLoading, error };
}

interface AgentToneResponse {
  [agentId: string]: {
    data: {
      [key: ToneCode]: number;
      overall_score: number;
    };
    conversation_id_list: string[];
  };
}

export interface AgentToneData {
  id: string;
  overallScore: number;
  tones: {
    [key: string]: number;
  };
  conversationIds: string[];
}

interface AgentToneParams {
  fromDate: string;
  toDate: string;
  agentId?: string;
}

export function useAgentTone({ fromDate, toDate, agentId }: AgentToneParams) {
  const [data, setData] = useState<AgentToneData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('from_date', fromDate);
        queryParams.append('to_date', toDate);
        if (agentId) queryParams.append('agent_id', agentId);
        
        const [toneMap, response] = await Promise.all([
          getToneMap(),
          fetch(`/api/tone/agent${queryParams.toString() ? `?${queryParams.toString()}` : ''}`)
        ]);

        if (!response.ok) {
          throw new Error('Failed to fetch agent tone data');
        }
        const responseData: AgentToneResponse[] = await response.json();
        
        // Transform the data to use readable tone names
        const transformedData: AgentToneData[] = responseData.map(item => {
          const [agentId, agentData] = Object.entries(item)[0];
          const tones: { [key: string]: number } = {};
          
          Object.entries(agentData.data).forEach(([code, value]) => {
            if (code !== 'overall_score') {
              tones[getToneName(code as ToneCode, toneMap)] = value;
            }
          });

          return {
            id: agentId,
            overallScore: agentData.data.overall_score,
            tones,
            conversationIds: agentData.conversation_id_list
          };
        });

        setData(transformedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fromDate, toDate, agentId]);

  return { data, isLoading, error };
}
