import React, { useState, useMemo, useRef } from 'react';
import { InterfaceInfo } from '../types';
import { exportInterfacesToPdf, exportInterfacesToExcel } from '../services/exportService';
import { ArrowDownTrayIcon } from './icons/Icons';

interface InterfacesDisplayProps {
  interfaces: InterfaceInfo[];
}

const InterfacesDisplay: React.FC<InterfacesDisplayProps> = ({ interfaces }) => {
  const [filter, setFilter] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof InterfaceInfo | null>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const initialWidths: Record<string, number> = {
    id: 80,
    name: 240,
    ipAddress: 180,
    subnetMask: 180,
    securityLevel: 140,
    zone: 180,
    vlan: 100,
    description: 380
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

  const filteredAndSortedInterfaces = useMemo(() => {
    let filtered = [...(interfaces || [])];
    if(filter) {
        filtered = filtered.filter(p => Object.values(p).some(val => String(val).toLowerCase().includes(filter.toLowerCase())));
    }
    if (sortColumn) {
      filtered.sort((a, b) => {
        const valA = a[sortColumn]; const valB = b[sortColumn];
        if (typeof valA === 'number' && typeof valB === 'number') return sortDirection === 'asc' ? valA - valB : valB - valA;
        return sortDirection === 'asc' ? String(valA).localeCompare(String(valB)) : String(valB).localeCompare(String(valA));
      });
    }
    return filtered;
  }, [interfaces, filter, sortColumn, sortDirection]);

  const headers: { key: keyof InterfaceInfo, label: string }[] = [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'NAME' },
      { key: 'ipAddress', label: 'IP ADDRESS' },
      { key: 'subnetMask', label: 'SUBNET MASK' },
      { key: 'securityLevel', label: 'SECURITY LVL' },
      { key: 'zone', label: 'ZONE' },
      { key: 'vlan', label: 'VLAN' },
      { key: 'description', label: 'DESCRIPTION' },
  ];

  return (
    <div className="w-full bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border bg-card">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="text-3xl font-bold text-foreground font-header tracking-tight">Interfaces & Zones ({interfaces.length})</h3>
            <div className="flex items-center gap-4 flex-wrap justify-end">
                <input
                  type="text"
                  placeholder="Filter interfaces..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-4 py-2 w-64 bg-background border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
                <button onClick={() => exportInterfacesToPdf(filteredAndSortedInterfaces)} className="flex items-center gap-2 px-4 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-bold transition-all border border-border shadow-sm"><ArrowDownTrayIcon className="w-4 h-4" /> PDF</button>
                <button onClick={() => exportInterfacesToExcel(filteredAndSortedInterfaces)} className="flex items-center gap-2 px-4 py-2 text-xs bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-bold transition-all border border-border shadow-sm"><ArrowDownTrayIcon className="w-4 h-4" /> Excel</button>
            </div>
          </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse table-fixed min-w-[1300px]">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {headers.map(({ key, label }) => (
                <th 
                  key={key} 
                  style={{ width: widths[key] }}
                  className="relative px-6 py-4 font-black text-muted-foreground uppercase text-[10px] tracking-widest select-none bg-muted/10"
                >
                  <div 
                    className={`flex items-center gap-2 cursor-pointer hover:text-foreground transition-colors ${key === 'id' || key === 'securityLevel' || key === 'vlan' ? 'justify-center' : ''}`}
                    onClick={() => {
                        setSortColumn(key);
                        setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                    }}
                  >
                    {label}
                    {sortColumn === key && <span className="text-primary text-[8px]">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                  </div>
                  <div 
                    onMouseDown={(e) => onMouseDown(key as string, e)}
                    className="absolute right-0 top-0 h-full w-px cursor-col-resize hover:bg-primary/50 transition-colors bg-border/40"
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredAndSortedInterfaces.map((iface) => (
              <tr key={iface.id} className="bg-background hover:bg-accent/5 transition-colors group">
                <td className="px-6 py-5 text-muted-foreground font-bold text-center border-r border-border/10" style={{ width: widths.id }}>{iface.id}</td>
                <td className="px-6 py-5 font-bold text-foreground text-sm tracking-tight" style={{ width: widths.name }}>{iface.name}</td>
                <td className="px-6 py-5 font-mono text-[11px] text-foreground/80" style={{ width: widths.ipAddress }}>{iface.ipAddress}</td>
                <td className="px-6 py-5 font-mono text-[11px] text-foreground/80" style={{ width: widths.subnetMask }}>{iface.subnetMask}</td>
                <td className="px-6 py-5 text-center border-x border-border/10" style={{ width: widths.securityLevel }}>
                  <span className="text-foreground/90 font-medium text-sm">{iface.securityLevel}</span>
                </td>
                <td className="px-6 py-5 text-foreground font-bold italic text-sm" style={{ width: widths.zone }}>{iface.zone}</td>
                <td className="px-6 py-5 text-center text-muted-foreground/80 text-sm border-x border-border/10" style={{ width: widths.vlan }}>{iface.vlan}</td>
                <td className="px-6 py-5 text-muted-foreground text-xs leading-relaxed truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all" style={{ width: widths.description }}>
                  {iface.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredAndSortedInterfaces.length === 0 && (
          <div className="py-24 text-center bg-muted/5">
              <p className="text-muted-foreground italic font-medium">No interface modules detected in current scan.</p>
          </div>
      )}
    </div>
  );
};

export default InterfacesDisplay;