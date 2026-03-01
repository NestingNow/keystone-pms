import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
    heartbeatIntervalMs: 15000,   // keeps connection alive
  },
});

// Global realtime helper – prevents duplicate channels & auto-reconnect
export const subscribeToTable = (
  table: string,
  callback: () => void,
  filter?: string
) => {
  const channelName = filter ? `realtime-${table}-${filter}` : `realtime-${table}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table, 
        filter: filter || undefined 
      },
      callback
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') console.log(`✅ Realtime ${table} active`);
      if (status === 'CLOSED' || status === 'CHANNEL_ERROR') console.log(`🔄 Realtime ${table} reconnecting...`);
    });

  return () => supabase.removeChannel(channel);
};