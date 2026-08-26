import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle, CheckCircle, Search, Link as LinkIcon, Info, ShieldCheck } from 'lucide-react';
import { EntityExplainPanel } from '../intelligence/EntityExplainPanel';

export type ReplayState = 'IDLE' | 'PLAYING' | 'PAUSED' | 'COMPLETED' | 'ERROR';

interface ReplayEvent {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description: string;
  tool?: string;
  evidenceIds?: string[];
  campaignId?: string;
  status: "SUCCESS" | "WARNING" | "ERROR" | "INFO";
}

interface InvestigationReplayProps {
  events: ReplayEvent[];
  campaignData?: any; // the specific campaign details
  entityData?: any; // Data for explainability panel
}

const EVENT_TIMINGS: Record<string, number> = {
  "START": 500,
  "TOOL_CALL": 900,
  "EVIDENCE_FOUND": 900,
  "CORRELATION": 1000,
  "RISK_CALCULATION": 1000,
  "CAMPAIGN_DETECTED": 1200,
  "FINAL_VERDICT": 500
};

export function InvestigationReplay({ events, campaignData, entityData }: InvestigationReplayProps) {
  const [replayState, setReplayState] = useState<ReplayState>('PLAYING');
  const [visibleEvents, setVisibleEvents] = useState<ReplayEvent[]>([]);
  const currentIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getEventDelay = (eventType: string) => EVENT_TIMINGS[eventType] || 1000;

  const playNext = () => {
    if (currentIndexRef.current >= events.length) {
      setReplayState('COMPLETED');
      return;
    }

    const currentEvent = events[currentIndexRef.current];
    setVisibleEvents(prev => [...prev, currentEvent]);
    
    currentIndexRef.current++;

    if (currentIndexRef.current < events.length) {
      const delay = getEventDelay(currentEvent.type);
      timerRef.current = setTimeout(playNext, delay);
    } else {
      timerRef.current = setTimeout(() => {
        setReplayState('COMPLETED');
      }, getEventDelay(currentEvent.type));
    }
  };

  useEffect(() => {
    if (replayState === 'PLAYING') {
      // Start or resume
      const currentEvent = events[Math.max(0, currentIndexRef.current - 1)];
      const delay = currentEvent ? getEventDelay(currentEvent.type) : 500;
      timerRef.current = setTimeout(playNext, currentIndexRef.current === 0 ? 0 : delay);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [replayState]);

  const handlePause = () => setReplayState('PAUSED');
  const handleResume = () => setReplayState('PLAYING');
  
  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisibleEvents([...events]);
    currentIndexRef.current = events.length;
    setReplayState('COMPLETED');
  };

  const handleReplay = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisibleEvents([]);
    currentIndexRef.current = 0;
    setReplayState('PLAYING');
  };

  const getIcon = (type: string, status: string) => {
    if (type === 'CAMPAIGN_DETECTED') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (type === 'EVIDENCE_FOUND' || type === 'TOOL_CALL') return <Search className="w-5 h-5 text-blue-400" />;
    if (type === 'RISK_CALCULATION') return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    if (type === 'CORRELATION') return <LinkIcon className="w-5 h-5 text-purple-400" />;
    if (status === 'SUCCESS') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (status === 'WARNING') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    if (status === 'ERROR') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Info className="w-5 h-5 text-slate-400" />;
  };

  const getStatusColor = (status: string) => {
    if (status === 'SUCCESS') return 'border-l-green-500';
    if (status === 'WARNING') return 'border-l-amber-500';
    if (status === 'ERROR') return 'border-l-red-500';
    return 'border-l-blue-500';
  };

  return (
    <div className="space-y-6">
      
      {/* Replay Controls */}
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <div className="flex items-center gap-4">
          {replayState === 'PLAYING' ? (
            <Button variant="outline" size="sm" onClick={handlePause} className="bg-slate-800 border-slate-700 text-white">
              <Pause className="w-4 h-4 mr-2" /> Pause
            </Button>
          ) : replayState === 'PAUSED' ? (
            <Button variant="outline" size="sm" onClick={handleResume} className="bg-blue-600/20 border-blue-500/50 text-blue-400 hover:bg-blue-600/30">
              <Play className="w-4 h-4 mr-2" /> Resume
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleReplay} className="bg-slate-800 border-slate-700 text-white">
              <RotateCcw className="w-4 h-4 mr-2" /> Replay Again
            </Button>
          )}
          
          <Badge variant="outline" className="bg-slate-950 text-slate-400 border-slate-800">
            {replayState}
          </Badge>
        </div>
        
        {replayState !== 'COMPLETED' && (
          <Button variant="ghost" size="sm" onClick={handleSkip} className="text-slate-400 hover:text-white">
            Skip to Result <SkipForward className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-6 space-y-4 before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
        <AnimatePresence>
          {visibleEvents.map((event, index) => {
            const isCampaign = event.type === 'CAMPAIGN_DETECTED';
            const isVerdict = event.type === 'FINAL_VERDICT';
            
            if (isCampaign) {
              return (
                <motion.div 
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="relative z-10 py-6"
                >
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-red-900/50 text-red-400 px-6 py-2 rounded-full border border-red-500/30 font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(239,68,68,0.2)] flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      CAMPAIGN FOUND
                    </div>
                  </div>
                  
                  {campaignData && (
                    <Card className="bg-slate-900 border-red-900/50 shadow-2xl mx-auto max-w-2xl transform hover:scale-[1.02] transition-transform">
                      <CardHeader className="border-b border-slate-800 pb-4">
                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-2xl font-black text-white">{campaignData.campaignId}</CardTitle>
                              {campaignData.status === 'CONFIRMED' && (
                                <Badge className="bg-emerald-600 font-bold border-0 flex items-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                  <ShieldCheck className="w-4 h-4 mr-1" /> ANALYST CONFIRMED
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-400 mt-1">{campaignData.name}</p>
                            
                            {campaignData.status === 'CONFIRMED' && (
                              <p className="text-xs text-emerald-400 mt-2 font-medium">
                                ✓ This campaign has been independently validated through analyst feedback.
                              </p>
                            )}
                          </div>
                          <Badge className="bg-red-600 font-bold text-lg px-3 py-1 self-start">CRITICAL</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-white">{campaignData.confidence}%</div>
                            <div className="text-xs text-slate-500 uppercase">Confidence</div>
                          </div>
                          <div className="text-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-white">{campaignData.linkedInvestigationIds?.length || 17}</div>
                            <div className="text-xs text-slate-500 uppercase">Related Jobs</div>
                          </div>
                          <div className="text-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-white">{campaignData.linkedRecruiterProfileIds?.length || 4}</div>
                            <div className="text-xs text-slate-500 uppercase">Recruiters</div>
                          </div>
                          <div className="text-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                            <div className="text-2xl font-bold text-white">{campaignData.sharedDomains?.length || 3}</div>
                            <div className="text-xs text-slate-500 uppercase">Domains</div>
                          </div>
                        </div>
                        
                        {/* Phase 9F Explainability automatically triggered */}
                        {entityData && (
                          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                            <EntityExplainPanel entityType={entityData.type} entityValue={entityData.value} />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              );
            }
            
            if (isVerdict) {
               return (
                  <motion.div 
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 pt-8"
                  >
                     <Card className={`bg-slate-900 mx-auto max-w-2xl border-2 ${event.status === 'ERROR' ? 'border-red-900/50' : event.status === 'WARNING' ? 'border-amber-900/50' : 'border-green-900/50'}`}>
                        <CardContent className="p-8 text-center flex flex-col items-center">
                           <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{event.title}</h2>
                           {event.status === 'WARNING' && event.title.includes('INCONCLUSIVE') ? (
                              <div className="text-2xl font-bold text-amber-400 mb-2">INCONCLUSIVE</div>
                           ) : (
                              <div className={`text-4xl font-black mb-2 ${event.status === 'ERROR' ? 'text-red-500' : 'text-green-500'}`}>
                                 {event.description.split('->')[1] || event.description}
                              </div>
                           )}
                           <p className="text-slate-400 max-w-md mx-auto mt-4">{
                              event.status === 'WARNING' && event.title.includes('INCONCLUSIVE') 
                                 ? event.description
                                 : event.description.split('->')[0]
                           }</p>
                           
                           {!events.some(e => e.type === 'CAMPAIGN_DETECTED') && event.status !== 'WARNING' && (
                              <div className="mt-8 p-4 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-400">
                                 <strong className="text-slate-300 block mb-1">NO COORDINATED CAMPAIGN DETECTED</strong>
                                 The investigation did not meet the deterministic campaign correlation criteria. Evidence was still evaluated independently.
                              </div>
                           )}
                        </CardContent>
                     </Card>
                  </motion.div>
               );
            }

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative z-10 flex items-start gap-4 mb-4 group"
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 border-2 ${getStatusColor(event.status).replace('border-l-', 'border-')} shadow-lg shrink-0 mt-1`}>
                  {getIcon(event.type, event.status)}
                </div>
                
                <Card className={`flex-1 bg-slate-900/80 border-slate-800 shadow-sm border-l-4 ${getStatusColor(event.status)} transition-colors group-hover:bg-slate-900`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-slate-200">{event.title}</h3>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit', fractionalSecondDigits: 3})}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 whitespace-pre-line">{event.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
