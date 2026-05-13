import { AnalysisResult, AccessPolicy, GroupedAccessPolicy, NatRule, InterfaceInfo } from '../types';

declare global {
  interface Window {
    jspdf: any;
    XLSX: any;
  }
}

const getJsPdf = () => {
    if (window.jspdf && window.jspdf.jsPDF) { return new window.jspdf.jsPDF(); }
    throw new Error("jsPDF library not found.");
}

const fitToColumn = (data: any[]) => {
    if (data.length === 0) return [];
    const widths: number[] = [];
    const keys = Object.keys(data[0]);
    for (let i = 0; i < keys.length; i++) {
        widths[i] = Math.max(
            keys[i].length,
            ...data.map(row => (row[keys[i]] ? String(row[keys[i]]).length : 0))
        );
    }
    return widths.map(w => ({ wch: w + 2 }));
};

export const exportToPdf = (result: AnalysisResult) => {
  const doc = getJsPdf();
  doc.setFontSize(18);
  doc.text('Firewall Configuration Analysis Report', 14, 22);
  doc.autoTable({
    startY: 30,
    body: [
        [`Compliance Score: ${result.summary.complianceScore}%`, `Total Issues: ${result.summary.totalIssues}`],
        [`Critical/High Issues: ${result.summary.criticalIssues + result.summary.highIssues}`, `Firewall Model: ${result.summary.firewallModel || 'N/A'}`],
        [`Hostname: ${result.summary.hostname || 'N/A'}`, `Serial Number: ${result.summary.serialNumber || 'N/A'}`],
    ],
    theme: 'plain'
  });
  doc.autoTable({
    startY: doc.autoTable.previous.finalY + 5,
    head: [['Severity', 'Issue', 'Recommendation', 'Standard']],
    body: result.issues.map(i => [i.severity, i.issue, i.recommendation, i.violatedStandard]),
    headStyles: { fillColor: [22, 160, 133] },
  });
  doc.save('firewall_analysis_report.pdf');
};

export const exportToExcel = (result: AnalysisResult) => {
  const issuesData = result.issues.map(i => ({ Severity: i.severity, Issue: i.issue, Recommendation: i.recommendation, 'Violated Standard': i.violatedStandard, 'Rule ID': i.ruleId }));
  const summaryData = [{'Compliance Score (%)': result.summary.complianceScore, 'Total Issues': result.summary.totalIssues, 'Critical/High Issues': result.summary.criticalIssues + result.summary.highIssues, 'Hostname': result.summary.hostname, 'Serial Number': result.summary.serialNumber }];
  const issuesWorksheet = window.XLSX.utils.json_to_sheet(issuesData);
  const summaryWorksheet = window.XLSX.utils.json_to_sheet(summaryData);
  issuesWorksheet['!cols'] = fitToColumn(issuesData);
  summaryWorksheet['!cols'] = fitToColumn(summaryData);
  const workbook = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Summary');
  window.XLSX.utils.book_append_sheet(workbook, issuesWorksheet, 'Detailed Issues');
  window.XLSX.writeFile(workbook, 'firewall_analysis_report.xlsx');
};

// Access Policies (List View)
export const exportPoliciesToPdf = (policies: AccessPolicy[]) => {
  const doc = getJsPdf();
  doc.text('Access Policies Report', 14, 22);
  const head = [['ID', 'Source', 'Src Zone', 'Src Iface', 'Destination', 'Dst Zone', 'Dst Iface', 'Service', 'Action', 'Description']];
  const body = policies.map(p => [
      p.id, 
      p.source, p.sourceZone, p.sourceInterface,
      p.destination, p.destinationZone, p.destinationInterface,
      p.service, p.action, p.description
  ]);
  doc.autoTable({ startY: 30, head, body, headStyles: { fillColor: [41, 128, 185] } });
  doc.save('access_policies_report.pdf');
};
export const exportPoliciesToExcel = (policies: AccessPolicy[]) => {
    const data = policies.map(p => ({ 
        ID: p.id, 
        Source: p.source, 
        'Source Zone': p.sourceZone,
        'Source Interface': p.sourceInterface,
        Destination: p.destination, 
        'Destination Zone': p.destinationZone,
        'Destination Interface': p.destinationInterface,
        Service: p.service, 
        Action: p.action, 
        Description: p.description, 
        IsRisky: p.isRisky ? 'Yes' : 'No' 
    }));
    const worksheet = window.XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = fitToColumn(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Access Policies');
    window.XLSX.writeFile(workbook, 'access_policies_report.xlsx');
};

// Access Policies (Grouped View)
export const exportGroupedPoliciesToPdf = (groupedPolicies: GroupedAccessPolicy[]) => {
    const doc = getJsPdf();
    doc.text('Grouped Access Policies Report', 14, 22);
    let startY = 30;
    groupedPolicies.forEach(group => {
        doc.setFontSize(14);
        doc.text(group.groupName, 14, startY);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(group.description, 14, startY + 5);
        doc.setTextColor(0);
        doc.autoTable({
            startY: startY + 10,
            head: [['ID', 'Source', 'Src Zone', 'Destination', 'Dst Zone', 'Service', 'Action']],
            body: group.policies.map(p => [p.id, p.source, p.sourceZone, p.destination, p.destinationZone, p.service, p.action]),
            headStyles: { fillColor: [41, 128, 185] },
        });
        startY = doc.autoTable.previous.finalY + 15;
    });
    doc.save('grouped_access_policies_report.pdf');
};
export const exportGroupedPoliciesToExcel = (groupedPolicies: GroupedAccessPolicy[]) => {
    const data = groupedPolicies.flatMap(g => g.policies.map(p => ({ 
        Group: g.groupName, 
        ID: p.id, 
        Source: p.source, 
        'Source Zone': p.sourceZone,
        'Source Interface': p.sourceInterface,
        Destination: p.destination, 
        'Destination Zone': p.destinationZone,
        'Destination Interface': p.destinationInterface,
        Service: p.service, 
        Action: p.action, 
        Description: p.description, 
        IsRisky: p.isRisky ? 'Yes' : 'No' 
    })));
    const worksheet = window.XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = fitToColumn(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Grouped Access Policies');
    window.XLSX.writeFile(workbook, 'grouped_access_policies_report.xlsx');
};

// NAT Rules
export const exportNatRulesToPdf = (rules: NatRule[]) => {
    const doc = getJsPdf();
    doc.text('NAT Rules Report', 14, 22);
    doc.autoTable({
        startY: 30,
        head: [['ID', 'Original Src', 'Translated Src', 'Original Dst', 'Translated Dst', 'Service']],
        body: rules.map(r => [r.id, r.originalSource, r.translatedSource, r.originalDestination, r.translatedDestination, r.service]),
        headStyles: { fillColor: [243, 156, 18] }
    });
    doc.save('nat_rules_report.pdf');
};
export const exportNatRulesToExcel = (rules: NatRule[]) => {
    const data = rules.map(r => ({ ID: r.id, 'Source Interface': r.sourceInterface, 'Dest Interface': r.destinationInterface, 'Original Source': r.originalSource, 'Translated Source': r.translatedSource, 'Original Dest': r.originalDestination, 'Translated Dest': r.translatedDestination, Service: r.service, Description: r.description }));
    const worksheet = window.XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = fitToColumn(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'NAT Rules');
    window.XLSX.writeFile(workbook, 'nat_rules_report.xlsx');
};

// Interfaces and Zones
export const exportInterfacesToPdf = (interfaces: InterfaceInfo[]) => {
    const doc = getJsPdf();
    doc.text('Interfaces and Zones Report', 14, 22);
    doc.autoTable({
        startY: 30,
        head: [['ID', 'Name', 'IP Address', 'Zone', 'VLAN', 'Description']],
        body: interfaces.map(i => [i.id, i.name, `${i.ipAddress}/${i.subnetMask}`, i.zone, i.vlan, i.description]),
        headStyles: { fillColor: [39, 174, 96] }
    });
    doc.save('interfaces_report.pdf');
};
export const exportInterfacesToExcel = (interfaces: InterfaceInfo[]) => {
    const data = interfaces.map(i => ({ ID: i.id, Name: i.name, 'IP Address': i.ipAddress, 'Subnet Mask': i.subnetMask, 'Security Level': i.securityLevel, Zone: i.zone, VLAN: i.vlan, Description: i.description }));
    const worksheet = window.XLSX.utils.json_to_sheet(data);
    worksheet['!cols'] = fitToColumn(data);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Interfaces and Zones');
    window.XLSX.writeFile(workbook, 'interfaces_report.xlsx');
};