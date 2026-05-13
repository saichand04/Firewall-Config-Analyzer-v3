import React from 'react';
import { ThreatIntelIndicator, AnalysisIssueSeverity } from '../types';
import { ShieldExclamationIcon, GlobeAltIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from './icons/Icons';

interface ThreatIntelViewProps {
  threatIntel: ThreatIntelIndicator[];
}

const getSeverityStyles = (severity: AnalysisIssueSeverity) => {
  switch (severity) {
    case 'Critical': return { 
        border: 'border-l-red-600', 
        badge: 'bg-red-600 text-white', 
        icon: 'bg-red-600/10 text-red-600' 
    };
    case 'High': return { 
        border: 'border-l-orange-600', 
        badge: 'bg-orange-600 text-white', 
        icon: 'bg-orange-600/10 text-orange-600' 
    };
    case 'Medium': return { 
        border: 'border-l-amber-500', 
        badge: 'bg-amber-500 text-white', 
        icon: 'bg-amber-500/10 text-amber-500' 
    };
    case 'Low': return { 
        border: 'border-l-blue-500', 
        badge: 'bg-blue-500 text-white', 
        icon: 'bg-blue-500/10 text-blue-500' 
    };
    default: return { 
        border: 'border-l-violet-500', 
        badge: 'bg-violet-500 text-white', 
        icon: 'bg-violet-500/10 text-violet-500' 
    };
  }
};

const ThreatIntelView: React.FC<ThreatIntelViewProps> = ({ threatIntel }) => {
  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-xl w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <ShieldExclamationIcon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-3xl font-bold text-foreground">Threat Intelligence Feed</h3>
          <p className="text-muted-foreground text-sm font-medium">Real-time enrichment via Google Search grounding.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {threatIntel.length > 0 ? threatIntel.map((item, idx) => {
          const styles = getSeverityStyles(item.threatLevel);
          
          return (
            <div 
              key={idx} 
              className={`bg-card border border-border border-l-4 ${styles.border} rounded-lg p-5 shadow-sm hover:shadow-md transition-all group relative`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${styles.icon}`}>
                    {item.type === 'IP' ? <GlobeAltIcon className="w-5 h-5" /> : <ShieldExclamationIcon className="w-5 h-5" />}
                  </div>
                  <h4 className="text-lg font-bold text-foreground font-mono tracking-tight">{item.indicator}</h4>
                </div>
                <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase tracking-tighter ${styles.badge}`}>
                  {item.threatLevel}
                </span>
              </div>
              
              <p className="text-sm text-foreground/90 font-semibold mb-2">{item.description}</p>
              
              {item.context && (
                <div className="mt-4 flex items-start gap-3 bg-muted/30 p-3 rounded-md border border-border/50">
                  <MagnifyingGlassIcon className="w-4 h-4 flex-shrink-0 text-primary mt-0.5" />
                  <span className="text-xs leading-relaxed text-muted-foreground italic">
                    {item.context}
                  </span>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-24 bg-muted/10 rounded-xl border-2 border-dashed border-border">
            <MagnifyingGlassIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20 animate-pulse" />
            <p className="text-muted-foreground font-medium">Scanning for real-time threat indicators...</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border flex gap-4 items-center">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-amber-500" />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground font-bold">Disclaimer:</strong> Threat intelligence data is cross-referenced with live vulnerability databases. Always verify critical findings against your organization's internal threat feed before taking remediation actions.
        </p>
      </div>
    </div>
  );
};

export default ThreatIntelView;