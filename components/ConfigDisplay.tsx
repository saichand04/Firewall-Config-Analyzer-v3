import React, { useState, useMemo } from 'react';
import { AnalysisIssue } from '../types';

interface ConfigDisplayProps {
  configText: string;
  issues: AnalysisIssue[];
}

const getSeverityColor = (severity: AnalysisIssue['severity'] | null) => {
    switch (severity) {
      case 'Critical': return 'bg-red-600/10 border-l-4 border-red-600';
      case 'High': return 'bg-orange-600/10 border-l-4 border-orange-600';
      case 'Medium': return 'bg-amber-500/10 border-l-4 border-amber-500';
      case 'Low': return 'bg-blue-500/10 border-l-4 border-blue-500';
      case 'Informational': return 'bg-violet-500/10 border-l-4 border-violet-500';
      default: return 'border-l-4 border-transparent';
    }
};

const highlightText = (line: string, filter: string) => {
    if (!filter) return line;
    const parts = line.split(new RegExp(`(${filter})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === filter.toLowerCase() ? (
                    <span key={i} className="bg-primary/30 rounded-sm">{part}</span>
                ) : (
                    part
                )
            )}
        </>
    );
};


const ConfigDisplay: React.FC<ConfigDisplayProps> = ({ configText, issues }) => {
  const [showOnlyRisky, setShowOnlyRisky] = useState(false);
  const [filterText, setFilterText] = useState('');
  const lines = useMemo(() => configText.split('\n'), [configText]);

  const lineMetadata = useMemo(() => {
    const riskyIndexes = new Set<number>();
    const severities = new Map<number, AnalysisIssue['severity']>();
    const severityOrder: AnalysisIssue['severity'][] = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

    issues.forEach(issue => {
      if (issue.ruleId && issue.ruleId !== 'N/A') {
        const searchStr = issue.ruleId;
        lines.forEach((line, index) => {
          if (line.includes(searchStr)) {
            riskyIndexes.add(index);
            const currentSeverity = severities.get(index);
            if (!currentSeverity || severityOrder.indexOf(issue.severity) < severityOrder.indexOf(currentSeverity)) {
              severities.set(index, issue.severity);
            }
          }
        });
      }
    });
    return { riskyIndexes, severities };
  }, [issues, lines]);

  const displayedLines = useMemo(() => {
    return lines
      .map((line, index) => ({ line, index }))
      .filter(({ line, index }) => {
          const riskyMatch = !showOnlyRisky || lineMetadata.riskyIndexes.has(index);
          const filterMatch = !filterText || line.toLowerCase().includes(filterText.toLowerCase());
          return riskyMatch && filterMatch;
      });
  }, [lines, showOnlyRisky, filterText, lineMetadata.riskyIndexes]);

  return (
    <div className="bg-muted/30 rounded-lg shadow-inner overflow-auto h-full flex flex-col border border-border w-full">
      <div className="flex justify-between items-center bg-card px-4 py-2 text-xs text-muted-foreground font-mono sticky top-0 z-10 border-b border-border">
        <span>Configuration File</span>
        <div className="flex items-center gap-4">
            <input
                type="text"
                placeholder="Filter content..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="px-2 py-1 text-xs bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <label className="flex items-center cursor-pointer">
              <span className="mr-2 text-xs text-foreground">Show risky configurations only</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={showOnlyRisky} onChange={() => setShowOnlyRisky(!showOnlyRisky)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${showOnlyRisky ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showOnlyRisky ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
        </div>
      </div>
      <pre className="text-sm text-foreground font-mono flex-grow">
        <code>
          {displayedLines.map(({ line, index }) => {
            const lineNumber = index + 1;
            const severity = lineMetadata.severities.get(index) || null;
            return (
              <div key={lineNumber} className={`flex transition-colors duration-150 hover:bg-primary/10 ${getSeverityColor(severity)}`}>
                <span className="w-12 text-right px-4 text-muted-foreground select-none sticky left-0 bg-card">{lineNumber}</span>
                <span className="flex-1 pr-4 whitespace-pre-wrap">{highlightText(line || ' ', filterText)}</span>
              </div>
            );
          })}
        </code>
      </pre>
    </div>
  );
};

export default ConfigDisplay;