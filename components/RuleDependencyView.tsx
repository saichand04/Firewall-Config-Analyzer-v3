import React from 'react';
import { RuleDependency } from '../types';
import { BeakerIcon, ExclamationTriangleIcon, InformationCircleIcon } from './icons/Icons';

interface RuleDependencyViewProps {
  dependencies: RuleDependency[];
}

const RuleDependencyView: React.FC<RuleDependencyViewProps> = ({ dependencies }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Shadowed': return 'text-red-500 bg-red-500/10';
      case 'Redundant': return 'text-amber-500 bg-amber-500/10';
      case 'Overlapping': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-violet-500 bg-violet-500/10';
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-xl w-full">
      <div className="flex items-center gap-3 mb-6">
        <BeakerIcon className="w-8 h-8 text-primary" />
        <div>
          <h3 className="text-2xl font-bold text-foreground">Rule Dependency Analysis</h3>
          <p className="text-muted-foreground text-sm">Identifying redundant or unreachable policy configurations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dependencies.length > 0 ? dependencies.map((dep, idx) => (
          <div key={idx} className="bg-secondary/20 border border-border p-4 rounded-lg flex flex-col justify-between hover:border-primary/40 transition-colors">
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${getTypeColor(dep.type)}`}>
                  {dep.type}
                </span>
                <InformationCircleIcon className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">Rule ID: <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{dep.ruleId}</code></p>
              <p className="text-sm text-muted-foreground">{dep.explanation}</p>
            </div>
            {dep.relatedRuleId && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Impacted By</p>
                <code className="text-xs text-primary">{dep.relatedRuleId}</code>
              </div>
            )}
          </div>
        )) : (
          <div className="col-span-full text-center py-16">
            <BeakerIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
            <p className="text-muted-foreground font-medium">No rule dependencies or shadow relationships found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RuleDependencyView;
