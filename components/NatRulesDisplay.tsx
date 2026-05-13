import React, { useState, useMemo, useRef } from 'react';
import { NatRule } from '../types';
import { exportNatRulesToPdf, exportNatRulesToExcel } from '../services/exportService';
import { ArrowDownTrayIcon, GlobeAltIcon } from './icons/Icons';

interface NatRulesDisplayProps {
  rules: NatRule[];
}

const NatRulesDisplay: React.FC<NatRulesDisplayProps> = ({ rules }) => {
  const [filter, setFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof NatRule | null>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Resizable Logic
  const initialWidths: Record<string, number> = {
    id: 60,
    sourceInterface: 130,
    destinationInterface: 130,
    originalSource: 150,
    translatedSource: 150,
    originalDestination: 150,
    translatedDestination: 150,
    service: 100,
    description: 200
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
    setWidths(prev => ({ ...prev, [col]: Math.max(60, startWidth + delta) }));
  };

  const onMouseUp = () => {
    resizerRef.current = null;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'default';
  };

  const filteredAndSortedRules = useMemo(() => {
    let filtered = rules;
    if(filter) {
        filtered = filtered.filter(p => Object.values(p).some(val => String(val).toLowerCase().includes(filter.toLowerCase())));
    }
    if (sortColumn) {
      filtered.sort((a, b) => {
        const valA = a[sortColumn]; const valB = b[sortColumn];
        if (typeof valA === 'number' && typeof valB === 'number') return sortDirection === 'asc' ? valA - valB : valB - valA;
        if (String(valA) < String(valB)) return sortDirection === 'asc' ? -1 : 1;
        if (String(valA) > String(valB)) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [rules, filter, sortColumn, sortDirection]);

  const headers: { key: keyof NatRule, label: string }[] = [
      { key: 'id', label: 'ID' },
      { key: 'sourceInterface', label: 'Src Iface' },
      { key: 'destinationInterface', label: 'Dst Iface' },
      { key: 'originalSource', label: 'Orig Src' },
      { key: 'translatedSource', label: 'Trans Src' },
      { key: 'originalDestination', label: 'Orig Dst' },
      { key: 'translatedDestination', label: 'Trans Dst' },
      { key: 'service', label: 'Service' },
      { key: 'description', label: 'Notes' },
  ];

  return (
    <div className="bg-card border border-border p-6 rounded-lg shadow-xl w-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <GlobeAltIcon className="w-8 h-8 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">NAT Rules</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap justify-end">
            <input
              type="text"
              placeholder="Filter rules..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 w-48 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button onClick={() => exportNatRulesToPdf(filteredAndSortedRules)} className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /> PDF</button>
            <button onClick={() => exportNatRulesToExcel(filteredAndSortedRules)} className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /> Excel</button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-sm text-left border-collapse min-w-[1100px]">
          <thead className="bg-muted/80 sticky top-0 z-10">
            <tr>
              {headers.map(({ key, label }) => (
                <th 
                  key={key} 
                  style={{ width: widths[key] }}
                  className="relative px-4 py-3 font-bold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border select-none"
                >
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:text-foreground"
                    onClick={() => setSortColumn(key as any)}
                  >
                    {label}
                  </div>
                  <div 
                    onMouseDown={(e) => onMouseDown(key as string, e)}
                    className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50 transition-colors z-20"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {filteredAndSortedRules.map((rule) => (
              <tr key={rule.id} className="bg-card hover:bg-accent/30 transition-colors">
                <td className="px-4 py-3" style={{ width: widths.id }}>{rule.id}</td>
                <td className="px-4 py-3" style={{ width: widths.sourceInterface }}>{rule.sourceInterface}</td>
                <td className="px-4 py-3" style={{ width: widths.destinationInterface }}>{rule.destinationInterface}</td>
                <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap" style={{ width: widths.originalSource }}>{rule.originalSource}</td>
                <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap" style={{ width: widths.translatedSource }}>{rule.translatedSource}</td>
                <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap" style={{ width: widths.originalDestination }}>{rule.originalDestination}</td>
                <td className="px-4 py-3 font-mono text-[11px] whitespace-nowrap" style={{ width: widths.translatedDestination }}>{rule.translatedDestination}</td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ width: widths.service }}>{rule.service}</td>
                <td className="px-4 py-3 text-muted-foreground italic truncate" style={{ width: widths.description }}>{rule.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NatRulesDisplay;
