import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface WebsiteStatus {
  status: 'open' | 'closed';
  reason?: string;
  description?: string;
  reopen_date?: string;
}

export function useWebsiteStatus() {
  const [websiteStatus, setWebsiteStatus] = useState<WebsiteStatus>({ status: 'open' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWebsiteStatus();

    // Poll for changes every 30 seconds
    const interval = setInterval(fetchWebsiteStatus, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchWebsiteStatus = async () => {
    try {
      // Use type assertion to bypass TypeScript issues
      const { data, error } = await (supabase as any)
        .from('website_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data && !error) {
        setWebsiteStatus({
          status: data.status,
          reason: data.reason,
          description: data.description,
          reopen_date: data.reopen_date,
        });
      }
    } catch (error) {
      console.error('Error fetching website status:', error);
    } finally {
      setLoading(false);
    }
  };

  return { websiteStatus, loading };
}