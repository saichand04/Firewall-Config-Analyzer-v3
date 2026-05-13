import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisIssue } from '../types';
import { useTheme } from '../hooks/useTheme';

const SEVERITY_ORDER: AnalysisIssue['severity'][] = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

const SEVERITY_COLORS: { [key in AnalysisIssue['severity']]: string } = {
  Critical: '#DC2626', // red-600
  High: '#EA580C',     // orange-600
  Medium: '#F59E0B',   // amber-500
  Low: '#3B82F6',     // blue-500
  Informational: '#8B5CF6', // violet-500
};

const IssueChart: React.FC<{ issues: AnalysisIssue[] }> = ({ issues }) => {
  const { theme } = useTheme();

  const dataBySeverity = useMemo(() => {
    const counts: { [key in AnalysisIssue['severity']]: number } = {
      Critical: 0, High: 0, Medium: 0, Low: 0, Informational: 0,
    };
    issues.forEach(issue => {
      counts[issue.severity]++;
    });
    return counts;
  }, [issues]);

  const chartData = useMemo(() => SEVERITY_ORDER
    .map(name => ({ name, value: dataBySeverity[name] }))
    .filter(d => d.value > 0), [dataBySeverity]);

  if (chartData.length === 0) {
    return (
      <div className="bg-card border border-border p-4 rounded-lg shadow-xl h-full flex items-center justify-center">
        <p className="text-muted-foreground">No issues found to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-xl h-full flex flex-col">
      <h3 className="text-lg font-semibold text-card-foreground mb-3 flex-shrink-0">Issues by Severity</h3>
      <div className="flex-grow flex items-center overflow-hidden">
        <div className="w-2/3 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? 'hsl(240 10% 3.9%)' : 'hsl(0 0% 100%)',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={SEVERITY_COLORS[entry.name as AnalysisIssue['severity']]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
        </div>
        <div className="w-1/3 h-full flex flex-col justify-center space-y-2 pl-2">
            {SEVERITY_ORDER.map(severity => {
                const count = dataBySeverity[severity];
                if (count === 0) return null;
                return (
                    <div key={severity} className="flex items-center text-xs">
                        <span className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: SEVERITY_COLORS[severity] }}></span>
                        <span className="text-foreground">{severity} ({count})</span>
                    </div>
                )
            })}
        </div>
      </div>
    </div>
  );
};

export default IssueChart;