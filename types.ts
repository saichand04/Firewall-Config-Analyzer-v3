// types.ts

export type AnalysisIssueSeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export interface AnalysisIssue {
  issue: string;
  severity: AnalysisIssueSeverity;
  ruleId: string;
  policyId?: number;
  recommendation: string;
  violatedStandard: string;
}

export interface AccessPolicy {
  id: number;
  source: string;
  sourceZone: string;
  sourceInterface: string;
  destination: string;
  destinationZone: string;
  destinationInterface: string;
  service: string;
  action: 'permit' | 'deny' | string;
  description: string;
  isRisky?: boolean;
}

export interface GroupedAccessPolicy {
    groupName: string;
    description: string;
    policies: AccessPolicy[];
}

export interface NatRule {
    id: number;
    sourceInterface: string;
    destinationInterface: string;
    originalSource: string;
    translatedSource: string;
    originalDestination: string;
    translatedDestination: string;
    service: string;
    description: string;
}

export interface InterfaceInfo {
    id: number;
    name: string;
    ipAddress: string;
    subnetMask: string;
    securityLevel: string;
    zone: string;
    vlan: string;
    description: string;
}

export interface RuleDependency {
  ruleId: string;
  type: 'Shadowed' | 'Redundant' | 'Orphaned' | 'Overlapping';
  explanation: string;
  relatedRuleId?: string;
}

export interface ComplianceControl {
  framework: 'NIST' | 'PCI-DSS' | 'HIPAA' | 'CIS' | 'HITRUST';
  controlId: string;
  status: 'Compliant' | 'Non-Compliant' | 'Partial';
  description: string;
  finding?: string;
}

export interface ThreatIntelIndicator {
  indicator: string;
  type: 'IP' | 'Port' | 'Protocol';
  threatLevel: AnalysisIssueSeverity;
  description: string;
  context?: string;
}

export interface AnalysisSummary {
  complianceScore: number;
  totalRules: number;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  firewallModel: string;
  firmwareVersion: string;
  hostname: string;
  serialNumber: string;
  oem: string;
}

export interface AnalysisResult {
  summary: AnalysisSummary;
  issues: AnalysisIssue[];
  accessPolicies: AccessPolicy[];
  groupedAccessPolicies: GroupedAccessPolicy[];
  natRules: NatRule[];
  interfaces: InterfaceInfo[];
  dependencies: RuleDependency[];
  compliance: ComplianceControl[];
  threatIntel: ThreatIntelIndicator[];
}