import React from 'react';
import { AnalysisResult } from '../types';
import { ChartBarIcon, ExclamationTriangleIcon, ShieldCheckIcon, DocumentTextIcon } from './icons/Icons';

interface SummaryMetricsProps {
    summary: AnalysisResult['summary'];
}

const SummaryCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const SummaryMetrics: React.FC<SummaryMetricsProps> = ({ summary }) => {
    const scoreColor = summary.complianceScore > 85 ? 'text-green-400' : summary.complianceScore > 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl flex items-center">
                 <div className="p-3 rounded-full mr-4 bg-blue-900/50">
                     <ShieldCheckIcon className="w-8 h-8 text-blue-400" />
                 </div>
                <div>
                    <p className="text-sm text-gray-400">Compliance Score</p>
                    <p className={`text-2xl font-bold ${scoreColor}`}>{summary.complianceScore}%</p>
                </div>
            </div>
            <SummaryCard 
                title="Total Rules Analyzed" 
                value={summary.totalRules} 
                icon={<DocumentTextIcon className="w-8 h-8 text-indigo-300"/>}
                color="bg-indigo-900/50"
            />
             <SummaryCard 
                title="Total Issues Found" 
                value={summary.totalIssues} 
                icon={<ExclamationTriangleIcon className="w-8 h-8 text-yellow-300"/>}
                color="bg-yellow-900/50"
            />
            <SummaryCard 
                title="Critical & High Issues" 
                value={summary.criticalIssues + summary.highIssues} 
                icon={<ChartBarIcon className="w-8 h-8 text-red-300"/>}
                color="bg-red-900/50"
            />
        </div>
    );
};

export default SummaryMetrics;