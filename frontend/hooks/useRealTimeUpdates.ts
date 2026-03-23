"use client";

import { useEffect, useState, useCallback } from "react";

interface RealTimeUpdateData {
  type: 'new_analysis' | 'stats_update';
  data: any;
}

export function useRealTimeUpdates() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const triggerUpdate = useCallback((type: 'new_analysis' | 'stats_update', data: any) => {
    setLastUpdate(new Date());
    
    // Dispatch custom event for components to listen to
    const event = new CustomEvent('realtime-update', {
      detail: { type, data }
    });
    window.dispatchEvent(event);
  }, []);

  // Simulate real-time updates with polling (fallback)
  useEffect(() => {
    const interval = setInterval(() => {
      // Check for new data periodically
      triggerUpdate('stats_update', { timestamp: Date.now() });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [triggerUpdate]);

  return {
    isConnected,
    lastUpdate,
    triggerUpdate
  };
}
