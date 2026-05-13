import React, { useState } from 'react';
import { AnalysisResult, AnalysisIssue } from '../types';
import IssueChart from './IssueChart';
import ConfigDisplay from './ConfigDisplay';
import AccessPoliciesDisplay from './AccessPoliciesDisplay';
import NatRulesDisplay from './NatRulesDisplay';
import InterfacesDisplay from './InterfacesDisplay';
import RuleDependencyView from './RuleDependencyView';
import ComplianceView from './ComplianceView';
import ThreatIntelView from './ThreatIntelView';
import { exportToPdf, exportToExcel } from '../services/exportService';
import { ArrowDownTrayIcon, FunnelIcon, DocumentTextIcon, ShieldCheckIcon, GlobeAltIcon, NetworkPortIcon, SecuritySafeIcon, BeakerIcon, ScaleIcon, ShieldExclamationIcon, Cog6ToothIcon } from './icons/Icons';

interface ResultsDisplayProps {
  result: AnalysisResult;
  configText: string;
  onReset: () => void;
}

const SEVERITY_ORDER: AnalysisIssue['severity'][] = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

const getSeverityStyles = (severity: AnalysisIssue['severity']) => {
  switch (severity) {
    case 'Critical': return 'bg-red-600 text-white';
    case 'High': return 'bg-orange-600 text-white';
    case 'Medium': return 'bg-amber-500 text-white';
    case 'Low': return 'bg-blue-500 text-white';
    default: return 'bg-violet-500 text-white';
  }
};

const IssueCard: React.FC<{ issue: AnalysisIssue }> = ({ issue }) => (
  <div className="bg-card border border-border p-5 rounded-lg">
    <div className="flex justify-between items-start">
      <h4 className="text-lg text-card-foreground pr-4">{issue.issue}</h4>
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityStyles(issue.severity)} flex-shrink-0`}>{issue.severity}</span>
    </div>
    <div className="mt-4 space-y-3 text-sm">
      <p><strong className="text-muted-foreground">Rule/ID:</strong> <code className="bg-gray-800 text-gray-200 px-2 py-1 rounded">{issue.ruleId}</code></p>
      <p><strong className="text-muted-foreground">Recommendation:</strong> <span className="text-foreground/90">{issue.recommendation}</span></p>
      <p><strong className="text-muted-foreground">Standard:</strong> <a href={`https://www.google.com/search?q=${encodeURIComponent(issue.violatedStandard)}`} target="_blank" rel="noopener noreferrer" className="text-primary/90 hover:underline">{issue.violatedStandard}</a></p>
    </div>
  </div>
);

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result, configText, onReset }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'interfaces' | 'policies' | 'nat' | 'dependencies' | 'compliance' | 'threat' | 'config'>('report');
  const [severityFilter, setSeverityFilter] = useState<AnalysisIssue['severity'][]>(SEVERITY_ORDER);
  const [enabledModules, setEnabledModules] = useState({
    dependencies: true,
    compliance: true,
    threat: true
  });
  const [showSettings, setShowSettings] = useState(false);

  const filteredIssues = result.issues
    .filter(issue => severityFilter.includes(issue.severity))
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));
  
  const toggleFilter = (severity: AnalysisIssue['severity']) => {
    setSeverityFilter(prev => prev.includes(severity) ? prev.filter(s => s !== severity) : [...prev, severity]);
  };

  const TABS = [
    { id: 'report', label: 'Analysis Report', icon: DocumentTextIcon, enabled: true },
    { id: 'interfaces', label: 'Interfaces & Zones', icon: NetworkPortIcon, enabled: true },
    { id: 'policies', label: 'Access Policies', icon: SecuritySafeIcon, enabled: true },
    { id: 'nat', label: 'NAT Rules', icon: GlobeAltIcon, enabled: true },
    { id: 'dependencies', label: 'Dependencies', icon: BeakerIcon, enabled: enabledModules.dependencies },
    { id: 'compliance', label: 'Compliance', icon: ScaleIcon, enabled: enabledModules.compliance },
    { id: 'threat', label: 'Threat Intel', icon: ShieldExclamationIcon, enabled: enabledModules.threat },
    { id: 'config', label: 'Configuration View', icon: null, enabled: true },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Analysis Complete</h2>
          <p className="text-muted-foreground mt-1">AI-driven audit of your network security posture.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSettings(!showSettings)} className="p-2 bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground transition-colors" title="Settings"><Cog6ToothIcon className="w-5 h-5"/></button>
          <button onClick={() => exportToPdf(result)} className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /> PDF</button>
          <button onClick={() => exportToExcel(result)} className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /> Excel</button>
          <button onClick={onReset} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 rounded-md text-primary-foreground font-semibold transition-colors">New Scan</button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-secondary/50 p-4 rounded-lg border border-border flex flex-wrap gap-6 items-center animate-fade-in">
          <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Module Toggles:</span>
          {Object.entries(enabledModules).map(([key, val]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer text-sm font-medium">
              <input type="checkbox" checked={val} onChange={() => setEnabledModules(prev => ({...prev, [key]: !val}))} className="w-4 h-4 accent-primary" />
              {key.charAt(0).toUpperCase() + key.slice(1)} View
            </label>
          ))}
        </div>
      )}

      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar">
          {TABS.filter(t => t.enabled).map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-1 border-b-2 font-medium text-base flex items-center gap-2 flex-shrink-0 transition-all ${activeTab === tab.id ? 'border-primary text-primary scale-105' : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              {tab.icon && <tab.icon className="w-5 h-5"/>}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="min-h-[60vh]">
        {activeTab === 'report' && (
          <div className="space-y-8 animate-fade-in w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1"><IssueChart issues={result.issues} /></div>
              <div className="lg:col-span-1 bg-card border border-border p-4 rounded-lg shadow-xl flex flex-col">
                 <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center"><ShieldCheckIcon className="w-6 h-6 mr-3 text-primary"/>System Fingerprint</h3>
                 <div className="space-y-1 text-sm flex-grow">
                   <table className="w-full">
                     <tbody>
                        <tr className="border-b border-border/50"><td className="py-1.5 text-muted-foreground">Hostname</td><td className="py-1.5 font-semibold text-foreground text-right">{result.summary.hostname || 'N/A'}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-1.5 text-muted-foreground">OEM</td><td className="py-1.5 font-semibold text-foreground text-right">{result.summary.oem || 'N/A'}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-1.5 text-muted-foreground">Model</td><td className="py-1.5 font-semibold text-foreground text-right">{result.summary.firewallModel || 'N/A'}</td></tr>
                        <tr className="border-b border-border/50"><td className="py-1.5 text-muted-foreground">Firmware</td><td className="py-1.5 font-semibold text-foreground text-right">{result.summary.firmwareVersion || 'N/A'}</td></tr>
                        <tr><td className="pt-1.5 text-muted-foreground">Serial</td><td className="pt-1.5 font-semibold text-foreground text-right">{result.summary.serialNumber || 'N/A'}</td></tr>
                     </tbody>
                   </table>
                 </div>
              </div>
              <div className="lg:col-span-1 bg-card border border-border p-4 rounded-lg shadow-xl flex flex-col">
                <h3 className="text-lg font-semibold text-card-foreground mb-3 flex items-center"><DocumentTextIcon className="w-6 h-6 mr-3 text-indigo-400"/>Executive Summary</h3>
                <ul className="list-disc list-inside text-foreground/90 space-y-1.5 text-sm flex-grow">
                  <li>Compliance rating: <strong className={result.summary.complianceScore > 70 ? 'text-green-500' : 'text-amber-500'}>{result.summary.complianceScore}%</strong></li>
                  <li>Critical vulnerabilities detected: <strong>{result.summary.criticalIssues}</strong></li>
                  <li>Overly permissive rules flagged: <strong>{result.accessPolicies.filter(p => p.isRisky).length}</strong></li>
                </ul>
              </div>
            </div>
            <div>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <h3 className="text-2xl font-bold text-foreground">Detailed Issues ({filteredIssues.length})</h3>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                  <FunnelIcon className="w-5 h-5 text-muted-foreground flex-shrink-0"/>
                  {SEVERITY_ORDER.map(s => <button key={s} onClick={() => toggleFilter(s)} className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all whitespace-nowrap ${severityFilter.includes(s) ? `${getSeverityStyles(s)} border-transparent` : 'bg-card text-muted-foreground border-border hover:bg-accent'}`}>{s}</button>)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{filteredIssues.length > 0 ? filteredIssues.map((issue, i) => <IssueCard key={i} issue={issue} />) : <div className="col-span-2 text-center py-12 bg-card border border-border rounded-lg"><p className="text-muted-foreground">No active threats match current filters.</p></div>}</div>
            </div>
          </div>
        )}
        {activeTab === 'interfaces' && <div className="animate-fade-in w-full"><InterfacesDisplay interfaces={result.interfaces} /></div>}
        {activeTab === 'policies' && <div className="animate-fade-in w-full"><AccessPoliciesDisplay policies={result.accessPolicies} groupedPolicies={result.groupedAccessPolicies} issues={result.issues} /></div>}
        {activeTab === 'nat' && <div className="animate-fade-in w-full"><NatRulesDisplay rules={result.natRules} /></div>}
        {activeTab === 'dependencies' && <div className="animate-fade-in w-full"><RuleDependencyView dependencies={result.dependencies} /></div>}
        {activeTab === 'compliance' && <div className="animate-fade-in w-full"><ComplianceView compliance={result.compliance} /></div>}
        {activeTab === 'threat' && <div className="animate-fade-in w-full"><ThreatIntelView threatIntel={result.threatIntel} /></div>}
        {activeTab === 'config' && <div className="animate-fade-in h-[70vh] relative w-full"><ConfigDisplay configText={configText} issues={result.issues} /></div>}
      </div>
      <style>{`.animate-fade-in { animation: fade-in 0.4s ease-out forwards; } @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } } .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default ResultsDisplay;
