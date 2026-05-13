import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const accessPolicyItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.INTEGER, description: "Absolute unique sequential ID starting from 1." },
        source: { type: Type.STRING },
        sourceZone: { type: Type.STRING },
        sourceInterface: { type: Type.STRING },
        destination: { type: Type.STRING },
        destinationZone: { type: Type.STRING },
        destinationInterface: { type: Type.STRING },
        service: { type: Type.STRING },
        action: { type: Type.STRING },
        description: { type: Type.STRING },
        isRisky: { type: Type.BOOLEAN },
    },
    required: ["id", "source", "sourceZone", "sourceInterface", "destination", "destinationZone", "destinationInterface", "service", "action", "description", "isRisky"]
};

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.OBJECT,
      properties: {
        complianceScore: { type: Type.NUMBER },
        totalRules: { type: Type.INTEGER },
        totalIssues: { type: Type.INTEGER },
        criticalIssues: { type: Type.INTEGER },
        highIssues: { type: Type.INTEGER },
        firewallModel: { type: Type.STRING },
        firmwareVersion: { type: Type.STRING },
        hostname: { type: Type.STRING },
        serialNumber: { type: Type.STRING },
        oem: { type: Type.STRING },
      },
      required: ["complianceScore", "totalRules", "totalIssues", "criticalIssues", "highIssues", "firewallModel", "firmwareVersion", "hostname", "serialNumber", "oem"]
    },
    issues: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          issue: { type: Type.STRING },
          severity: { type: Type.STRING },
          ruleId: { type: Type.STRING, description: "The EXACT configuration line snippet." },
          policyId: { type: Type.INTEGER, description: "MATCH THIS to the unique 'id' of the Access Policy. DO NOT guess." },
          recommendation: { type: Type.STRING },
          violatedStandard: { type: Type.STRING },
        },
        required: ["issue", "severity", "ruleId", "recommendation", "violatedStandard"]
      }
    },
    accessPolicies: { type: Type.ARRAY, items: accessPolicyItemSchema },
    groupedAccessPolicies: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                groupName: { type: Type.STRING },
                description: { type: Type.STRING },
                policies: { type: Type.ARRAY, items: accessPolicyItemSchema }
            },
            required: ["groupName", "description", "policies"]
        }
    },
    natRules: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.INTEGER },
                sourceInterface: { type: Type.STRING },
                destinationInterface: { type: Type.STRING },
                originalSource: { type: Type.STRING },
                translatedSource: { type: Type.STRING },
                originalDestination: { type: Type.STRING },
                translatedDestination: { type: Type.STRING },
                service: { type: Type.STRING },
                description: { type: Type.STRING },
            },
            required: ["id", "sourceInterface", "destinationInterface", "originalSource", "translatedSource", "originalDestination", "translatedDestination", "service", "description"]
        }
    },
    interfaces: {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.INTEGER },
                name: { type: Type.STRING, description: "Physical hardware name only (e.g., GigabitEthernet1/1). DO NOT use the zone name here." },
                ipAddress: { type: Type.STRING, description: "IP Address or 'N/A' if unassigned." },
                subnetMask: { type: Type.STRING, description: "Subnet Mask or 'N/A'." },
                securityLevel: { type: Type.STRING, description: "0-100 or 'N/A'." },
                zone: { type: Type.STRING, description: "The logical 'nameif' value (e.g., outside, inside). DO NOT put hardware name here." },
                vlan: { type: Type.STRING },
                description: { type: Type.STRING }
            },
            required: ["id", "name", "ipAddress", "subnetMask", "securityLevel", "zone", "vlan", "description"]
        }
    },
    dependencies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          ruleId: { type: Type.STRING },
          type: { type: Type.STRING },
          explanation: { type: Type.STRING },
          relatedRuleId: { type: Type.STRING }
        },
        required: ["ruleId", "type", "explanation"]
      }
    },
    compliance: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          framework: { type: Type.STRING },
          controlId: { type: Type.STRING },
          status: { type: Type.STRING },
          description: { type: Type.STRING },
          finding: { type: Type.STRING }
        },
        required: ["framework", "controlId", "status", "description"]
      }
    },
    threatIntel: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          indicator: { type: Type.STRING },
          type: { type: Type.STRING },
          threatLevel: { type: Type.STRING },
          description: { type: Type.STRING },
          context: { type: Type.STRING }
        },
        required: ["indicator", "type", "threatLevel", "description"]
      }
    }
  },
  required: ["summary", "issues", "accessPolicies", "groupedAccessPolicies", "natRules", "interfaces", "dependencies", "compliance", "threatIntel"]
};

export const analyzeConfig = async (configText: string): Promise<AnalysisResult> => {
  const systemInstruction = `Act as an Elite Firewall Forensic Auditor. Accuracy is your primary metric.

STRICT PARSING PROTOCOLS:
1. FULL HARDWARE INVENTORY: You must parse EVERY interface line in the configuration. If an interface is present in the config, it MUST appear in the 'interfaces' array, even if it has no IP, no zone, or no description. DO NOT skip any hardware.
2. CORRECT FIELD MAPPING: 
   - 'name' = Physical hardware (e.g., 'GigabitEthernet1/1').
   - 'zone' = Logical name (the 'nameif' parameter, e.g., 'outside').
   - NEVER swap these.
3. ABSOLUTE ACCESS POLICY LIST: Every single 'access-list' line MUST be a separate object in the 'accessPolicies' array. Assign them unique sequential IDs.
4. TARGETED AUDITING: Do not flag every rule as risky. Only flag rules that violate security best practices (any-any, insecure protocols, shadowed rules). 
5. LINKING ISSUES: If an issue is found with a specific access-list rule, you MUST set 'policyId' to the EXACT ID you assigned that rule in the 'accessPolicies' array.
6. THREAT SEARCH: Use Google Search to find model-specific CVEs for the firewall hardware identified.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Exhaustively parse this configuration. I need 100% of interfaces (even unconfigured ones) and 100% of policies accurately mapped:\n\n${configText}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 32768 }
      },
    });

    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Forensic Analysis Error:", error);
    throw new Error("Audit engine failed to parse the complete configuration inventory.");
  }
};