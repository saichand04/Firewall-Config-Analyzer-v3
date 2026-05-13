import React, { useState, useMemo, useRef } from 'react';
import { AccessPolicy, GroupedAccessPolicy, AnalysisIssue } from '../types';
import { exportPoliciesToPdf, exportPoliciesToExcel, exportGroupedPoliciesToPdf, exportGroupedPoliciesToExcel } from '../services/exportService';
import { ExclamationCircleIcon, ArrowDownTrayIcon, RectangleGroupIcon, SecuritySafeIcon, ChevronDownIcon } from './icons/Icons';

interface AccessPoliciesDisplayProps {
  policies: AccessPolicy[];
  groupedPolicies: GroupedAccessPolicy[];
  issues: AnalysisIssue[];
}

const getSeverityStyles = (severity: AnalysisIssue['severity']) => {
  switch (severity) {
    case 'Critical': return 'bg-red-600 text-white';
    case 'High': return 'bg-orange-600 text-white';
    case 'Medium': return 'bg-amber-500 text-white';
    case 'Low': return 'bg-blue-500 text-white';
    default: return 'bg-violet-500 text-white';
  }
};

const PolicyIssueDetail: React.FC<{ issues: AnalysisIssue[] }> = ({ issues }) => (
    <div className="p-4 bg-muted/5 border-t border-border/40">
        {issues.map((issue, index) => (
            <div key={index} className="bg-white dark:bg-zinc-900 border-l-[3px] border-red-500 p-5 rounded-sm shadow-sm mb-3 last:mb-0 flex justify-between items-start gap-6 animate-fade-in">
                <div className="flex-grow space-y-2">
                    <h4 className="font-bold text-foreground text-sm leading-snug">{issue.issue}</h4>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        <span className="font-bold text-foreground/70">Recommendation:</span> {issue.recommendation}
                    </p>
                </div>
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-tight ${getSeverityStyles(issue.severity)}`}>
                    {issue.severity}
                </span>
            </div>
        ))}
    </div>
);

const AccessPoliciesDisplay: React.FC<AccessPoliciesDisplayProps> = ({ policies, groupedPolicies, issues }) => {
  const [view, setView] = useState<'list' | 'group'>('list');
  const [filter, setFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof AccessPolicy | null>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showRiskyOnly, setShowRiskyOnly] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const initialWidths: Record<string, number> = {
    id: 110,
    source: 140,
    sourceZone: 110,
    sourceInterface: 140,
    destination: 140,
    destinationZone: 110,
    destinationInterface: 140,
    service: 100,
    action: 100,
    description: 300
  };
  const [widths, setWidths] = useState(initialWidths);
  const resizerRef = useRef<{ col: string; startX: number; startWidth: number } | null>(null);

  const onMouseDown = (col: string, e: React.MouseEvent) => {
    resizerRef.current = { col, startX: e.pageX, startWidth: widths[col] };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!resizerRef.current) return;
    const { col, startX, startWidth } = resizerRef.current;
    const delta = e.pageX - startX;
    setWidths(prev => ({ ...prev, [col]: Math.max(80, startWidth + delta) }));
  };

  const onMouseUp = () => {
    resizerRef.current = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'default';
  };

  // REVISED: STRICT correlation via policyId ONLY. No string guessing.
  const issuesByPolicyId = useMemo(() => {
    const map = new Map<number, AnalysisIssue[]>();
    policies.forEach(policy => {
      const policyIssues = issues.filter(issue => issue.policyId === policy.id);
      if (policyIssues.length > 0) map.set(policy.id, policyIssues);
    });
    return map;
  }, [issues, policies]);

  const toggleRowExpansion = (policyId: number) => {
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(policyId)) newSet.delete(policyId);
        else newSet.add(policyId);
        return newSet;
    });
  };

  const filteredAndSortedPolicies = useMemo(() => {
    let filtered = (policies || []).filter(p => !showRiskyOnly || issuesByPolicyId.has(p.id));
    if(filter) filtered = filtered.filter(p => Object.values(p).some(val => String(val).toLowerCase().includes(filter.toLowerCase())));
    if (sortColumn) {
      filtered.sort((a, b) => {
        const valA = a[sortColumn]; const valB = b[sortColumn];
        if (typeof valA === 'number' && typeof valB === 'number') return sortDirection === 'asc' ? valA - valB : valB - valA;
        return sortDirection === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    }
    return filtered;
  }, [policies, filter, sortColumn, sortDirection, showRiskyOnly, issuesByPolicyId]);

  const headers: { key: keyof AccessPolicy, label: string }[] = [
    { key: 'id', label: 'ID' }, 
    { key: 'source', label: 'Source' }, 
    { key: 'sourceZone', label: 'Src Zone' },
    { key: 'sourceInterface', label: 'Src Interface' },
    { key: 'destination', label: 'Destination' }, 
    { key: 'destinationZone', label: 'Dst Zone' },
    { key: 'destinationInterface', label: 'Dst Interface' },
    { key: 'service', label: 'Service' }, 
    { key: 'action', label: 'Action' }, 
    { key: 'description', label: 'Description' }
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-xl w-full">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
        <div className="flex items-center gap-4 flex-shrink-0">
            <h3 className="text-3xl font-bold text-foreground">Access Policies</h3>
            <div className="flex items-center bg-muted rounded-full p-1 border border-border">
                <button onClick={() => setView('list')} className={`px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition-all ${view === 'list' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent'}`}><SecuritySafeIcon className="w-4 h-4"/> List View</button>
                <button onClick={() => setView('group')} className={`px-4 py-1.5 text-xs font-bold rounded-full flex items-center gap-2 transition-all ${view === 'group' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent'}`}><RectangleGroupIcon className="w-4 h-4"/> Group View</button>
            </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-start w-full md:w-auto md:justify-end">
            {view === 'list' && (
                <>
                <input type="text" placeholder="Filter policies..." value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-1.5 w-48 bg-background border border-input rounded-md text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                <label className="flex items-center cursor-pointer group">
                    <span className="mr-2 text-sm text-foreground">Show Risky Only</span>
                    <div className="relative">
                        <input type="checkbox" className="sr-only" checked={showRiskyOnly} onChange={() => setShowRiskyOnly(!showRiskyOnly)} />
                        <div className={`block w-10 h-6 rounded-full transition-colors ${showRiskyOnly ? 'bg-primary' : 'bg-muted'}`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showRiskyOnly ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                </label>
                </>
            )}
            <button onClick={() => view === 'list' ? exportPoliciesToPdf(filteredAndSortedPolicies) : exportGroupedPoliciesToPdf(groupedPolicies)} className="flex items-center gap-2 px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors"><ArrowDownTrayIcon className="w-3 h-3" /> PDF</button>
            <button onClick={() => view === 'list' ? exportPoliciesToExcel(filteredAndSortedPolicies) : exportGroupedPoliciesToExcel(groupedPolicies)} className="flex items-center gap-2 px-3 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors"><ArrowDownTrayIcon className="w-3 h-3" /> Excel</button>
        </div>
      </div>
      
      {view === 'list' && (
        <div className="w-full overflow-x-auto rounded-md border border-border bg-white dark:bg-black/20">
          <table className="w-full text-sm text-left border-collapse" style={{ tableLayout: 'fixed', minWidth: '1350px' }}>
            <thead className="bg-muted/40 sticky top-0 z-10 border-b border-border">
              <tr>
                {headers.map(({ key, label }) => (
                  <th 
                    key={key} 
                    style={{ width: widths[key], minWidth: widths[key] }}
                    className={`relative px-4 py-3 font-black text-muted-foreground uppercase text-[10px] tracking-widest select-none ${key === 'id' || key === 'service' ? 'text-center' : ''}`}
                  >
                    <div className={`flex items-center gap-2 cursor-pointer hover:text-foreground ${key === 'id' || key === 'service' ? 'justify-center' : 'justify-start'}`} onClick={() => { setSortColumn(key); setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc'); }}>
                      {label}
                      {sortColumn === key && <span className="text-primary">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                    </div>
                    <div onMouseDown={(e) => onMouseDown(key as string, e)} className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-20 bg-border/20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredAndSortedPolicies.map((policy) => {
                const associatedIssues = issuesByPolicyId.get(policy.id) || [];
                const isRisky = associatedIssues.length > 0;
                const isExpanded = expandedRows.has(policy.id);
                return (
                  <React.Fragment key={policy.id}>
                    <tr onClick={() => isRisky && toggleRowExpansion(policy.id)} className={`group hover:bg-accent/40 transition-colors ${isRisky ? 'cursor-pointer' : ''} ${isExpanded ? 'bg-accent/20' : ''}`}>
                      <td className="px-4 py-3" style={{ width: widths.id }}>
                        <div className="flex items-center w-full justify-between">
                          <div className="flex items-center gap-2">
                            {isRisky && <ChevronDownIcon className={`w-3.5 h-3.5 text-muted-foreground/60 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                            {isRisky && <ExclamationCircleIcon className="w-4 h-4 text-amber-500" />}
                          </div>
                          <span className="font-bold text-foreground text-sm">{policy.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] truncate whitespace-nowrap" style={{ width: widths.source }}>{policy.source}</td>
                      <td className="px-4 py-3 truncate whitespace-nowrap text-foreground/80" style={{ width: widths.sourceZone }}>{policy.sourceZone}</td>
                      <td className="px-4 py-3 truncate whitespace-nowrap leading-tight text-foreground/80" style={{ width: widths.sourceInterface }}>{policy.sourceInterface}</td>
                      <td className="px-4 py-3 font-mono text-[11px] truncate whitespace-nowrap" style={{ width: widths.destination }}>{policy.destination}</td>
                      <td className="px-4 py-3 truncate whitespace-nowrap text-foreground/80" style={{ width: widths.destinationZone }}>{policy.destinationZone}</td>
                      <td className="px-4 py-3 truncate whitespace-nowrap leading-tight text-foreground/80" style={{ width: widths.destinationInterface }}>{policy.destinationInterface}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-primary/70 text-xs text-center" style={{ width: widths.service }}>{policy.service}</td>
                      <td className="px-4 py-3" style={{ width: widths.action }}>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${policy.action.toLowerCase().includes('permit') ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>{policy.action}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground italic truncate text-xs" style={{ width: widths.description }}>{policy.description}</td>
                    </tr>
                    {isExpanded && isRisky && (
                      <tr className="border-b border-border/20"><td colSpan={headers.length} className="p-0"><PolicyIssueDetail issues={associatedIssues} /></td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {view === 'group' && (
        <div className="space-y-4 animate-fade-in">
          {(groupedPolicies || []).map((group, index) => (
            <div key={index} className="bg-white dark:bg-zinc-900 border border-border/40 rounded-sm shadow-sm overflow-hidden">
               <details open={openGroups[group.groupName] !== false} onToggle={(e) => setOpenGroups(prev => ({...prev, [group.groupName]: (e.target as HTMLDetailsElement).open}))} className="group">
                  <summary className="px-6 py-4 text-xl font-bold text-foreground cursor-pointer flex items-center justify-between hover:bg-muted/5 transition-colors list-none">
                    <div className="flex items-center gap-3">
                      <ChevronDownIcon className={`w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform`} />
                      <span>{group.groupName} <span className="text-muted-foreground font-normal text-xs ml-2">({group.policies.length} policies)</span></span>
                    </div>
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-sm text-muted-foreground mb-4 leading-normal whitespace-normal w-full">{group.description}</p>
                    <div className="overflow-x-auto border border-border/20 rounded-sm">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/20 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/10">
                          <tr>
                            <th className="px-4 py-2 w-20 text-center">ID</th>
                            <th className="px-4 py-2">Path Details</th>
                            <th className="px-4 py-2 text-center">Service</th>
                            <th className="px-4 py-2">Action</th>
                            <th className="px-4 py-2">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/5">
                          {group.policies.map(policy => {
                              const associatedIssues = issuesByPolicyId.get(policy.id) || [];
                              const isRisky = associatedIssues.length > 0;
                              const isExpanded = expandedRows.has(policy.id);
                              return (<React.Fragment key={policy.id}>
                                  <tr onClick={() => isRisky && toggleRowExpansion(policy.id)} className={`hover:bg-accent/10 transition-colors ${isRisky ? 'cursor-pointer' : ''}`}>
                                      <td className="px-4 py-2">
                                        <div className="flex items-center w-full justify-between">
                                          <div className="flex items-center gap-1">
                                            {isRisky && <ChevronDownIcon className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />}
                                            {isRisky && <ExclamationCircleIcon className="w-3 h-3 text-amber-500" />}
                                          </div>
                                          <span className="font-bold text-foreground text-xs">{policy.id}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2">
                                          <div className="font-sans text-[10px] leading-tight space-y-0.5">
                                            <div><span className="text-muted-foreground font-bold mr-1">Src:</span> {policy.source} <span className="text-muted-foreground/50 italic ml-1">({policy.sourceZone}/{policy.sourceInterface})</span></div>
                                            <div><span className="text-muted-foreground font-bold mr-1">Dst:</span> {policy.destination} <span className="text-muted-foreground/50 italic ml-1">({policy.destinationZone}/{policy.destinationInterface})</span></div>
                                          </div>
                                      </td>
                                      <td className="px-4 py-2 font-bold text-[10px] uppercase text-primary/80 text-center">{policy.service}</td>
                                      <td className="px-4 py-2">
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${policy.action.toLowerCase().includes('permit') ? 'text-emerald-600 bg-emerald-500/10 border border-emerald-500/10' : 'text-red-600 bg-red-600/10 border border-red-600/10'}`}>{policy.action}</span>
                                      </td>
                                      <td className="px-4 py-2 text-muted-foreground italic text-[10px] leading-tight max-w-[200px]">{policy.description}</td>
                                  </tr>
                                  {isExpanded && isRisky && (
                                      <tr><td colSpan={5} className="p-0 border-t border-border/10"><PolicyIssueDetail issues={associatedIssues} /></td></tr>
                                  )}
                              </React.Fragment>
                          )})}
                        </tbody>
                      </table>
                    </div>
                  </div>
               </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AccessPoliciesDisplay;