
export const NIST_CIS_REFERENCES = {
    "NIST AC-11": "Session Timeout: Enforce a 15-minute inactivity timeout for user sessions.",
    "NIST AC-3": "Access Enforcement: Enforce approved authorizations for logical access to information and system resources.",
    "NIST CM-7": "Least Functionality: Configure the information system to provide only essential capabilities.",
    "CIS 1.1": "Firewall Configuration: Ensure firewall rules are properly configured to restrict traffic.",
    "CIS 2.3": "Secure Configurations: Disable unnecessary services and ports (e.g., Telnet, HTTP management on WAN).",
    "CIS 4.1": "Privileged Access Management: Use multi-factor authentication for all administrative access.",
};

export const SAMPLE_CONFIG = `
! Cisco ASA Firewall Configuration
! Last updated: 2023-10-26
interface GigabitEthernet0/0
 nameif outside
 security-level 0
 ip address 203.0.113.1 255.255.255.0
!
interface GigabitEthernet0/1
 nameif inside
 security-level 100
 ip address 192.168.1.1 255.255.255.0
!
! Problem: Web management enabled on the outside interface
http server enable
http 0.0.0.0 0.0.0.0 outside
!
! Problem: Telnet is enabled, which is insecure
telnet 192.168.1.0 255.255.255.0 inside
!
access-list inside_access_in extended permit ip any any
access-list outside_access_in extended permit tcp any host 203.0.113.10 eq 80
access-list outside_access_in extended permit tcp any host 203.0.113.10 eq 443
! Problem: Unused rule (hit count is zero)
access-list unused_rule extended permit icmp any any (hitcnt=0) 
! Problem: Shadowed rule. The 'any any' rule above makes this redundant.
access-list inside_access_in extended permit tcp host 192.168.1.5 host 10.0.0.20 eq 22
!
! Problem: No session timeout configured for admin user
username admin password mysecretpassword privilege 15
aaa authentication ssh console LOCAL
!
end
`;
