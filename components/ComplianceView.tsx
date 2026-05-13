import React, { useState, useMemo } from 'react';
import { ComplianceControl } from '../types';
import { ScaleIcon, CheckCircleIcon, XCircleIcon, ExclamationCircleIcon, FunnelIcon } from './icons/Icons';

interface ComplianceViewProps {
  compliance: ComplianceControl[];
}

const FRAMEWORKS: ComplianceControl['framework'][] = ['NIST', 'CIS', 'PCI-DSS', 'HIPAA', 'HITRUST'];

const ComplianceView: React.FC<ComplianceViewProps> = ({ compliance }) => {
  const [selectedFrameworks, setSelectedFrameworks] = useState<ComplianceControl['framework'][]>(FRAMEWORKS);

  const toggleFramework = (fw: ComplianceControl['framework']) => {
    setSelectedFrameworks(prev => 
      prev.includes(fw) ? prev.filter(f => f !== fw) : [...prev, fw]
    );
  };

  const filteredCompliance = useMemo(() => {
    return compliance.filter(c => selectedFrameworks.includes(c.framework));
  }, [compliance, selectedFrameworks]);

  const activeFrameworksInResult = useMemo(() => {
    return Array.from(new Set(filteredCompliance.map(c => c.framework)));
  }, [filteredCompliance]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant': return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'Non-Compliant': return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default: return <ExclamationCircleIcon className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-xl w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <ScaleIcon className="w-8 h-8 text-primary" />
          <div>
            <h3 className="text-2xl font-bold text-foreground">Compliance Center</h3>
            <p className="text-muted-foreground text-sm">Cross-framework mapping to regulatory standards.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 mr-2 text-muted-foreground">
            <FunnelIcon className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Filter Frameworks:</span>
          </div>
          {FRAMEWORKS.map(fw => (
            <button
              key={fw}
              onClick={() => toggleFramework(fw)}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-all ${
                selectedFrameworks.includes(fw)
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'bg-transparent border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {fw}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {activeFrameworksInResult.length > 0 ? activeFrameworksInResult.map(fw => (
          <div key={fw} className="border border-border rounded-xl overflow-hidden bg-secondary/10">
            <div className="bg-muted px-4 py-2 font-bold text-sm tracking-widest uppercase text-muted-foreground border-b border-border flex justify-between items-center">
              <span>{fw} Framework</span>
              <span className="text-[10px] bg-background px-2 py-0.5 rounded border border-border">
                {compliance.filter(c => c.framework === fw).length} Controls
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {filteredCompliance.filter(c => c.framework === fw).map((control, idx) => (
                <div key={idx} className="p-4 flex flex-col md:flex-row gap-4 md:items-start hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0 pt-1">
                    {getStatusIcon(control.status)}
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-bold text-foreground">{control.controlId}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        control.status === 'Compliant' ? 'bg-green-500/20 text-green-500' : 
                        control.status === 'Non-Compliant' ? 'bg-red-500/20 text-red-500' : 
                        'bg-amber-500/20 text-amber-500'
                      }`}>
                        {control.status}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 font-medium">{control.description}</p>
                    {control.finding && (
                      <div className="mt-2 text-xs bg-card border border-border p-2 rounded italic text-muted-foreground">
                        <strong className="text-foreground not-italic mr-1">Finding:</strong> {control.finding}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed border-border">
            <ScaleIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">Select one or more frameworks to view compliance mapping.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceView;
