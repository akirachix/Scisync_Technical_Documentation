# Auditerra Platform - Comprehensive Security Documentation

## 1. Introduction and Security Posture

### 1.1 Purpose

This document serves as the definitive technical and operational security reference for the Auditerra platform. Auditerra is a digital coordination platform connecting smallholder farmers in rural Kenya with certified agricultural experts and institutional supervisors. Operating in low-connectivity environments and handling Highly Restricted personal data (names, phone numbers, GPS locations), robust security is paramount to maintain farmer trust, data integrity, and legal compliance under the Kenya Data Protection Act 2019.

### 1.2 Security Architecture Overview

The Auditerra platform adopts a **Defense-in-Depth** strategy, segmented into four distinct security zones. Data flows from the untrusted external environment, through perimeter defenses, into the trusted application zone, and finally to secure data storage.

1.  **Untrusted / External Zone:** Feature phones (USSD/SMS), external services (Africa's Talking, SMS Leopard, AWS SES).
2.  **Edge / Perimeter Zone:** Cloudflare (Firewall, WAF, DDoS), API Gateway.
3.  **Trusted Application Zone:** Backends, core modules, USSD session handler, AI integration, webhook validator.
4.  **Data Zone:** PostgreSQL (Neon), Object Storage, Google Secret Manager, Cache/Session Storage.

## Visual Diagrams

### Secure System Architecture Diagram

> _Click below to view the end-to-end secure system architecture._

[**View the Figma Architecture Diagram**](https://www.figma.com/design/MTtw9YDPNHSRWsU9wczr7S/SciSync_CyberSecurity_SAD?node-id=0-1&p=f&t=2s5JO3vc3FfJJ5yt-0https://www.figma.com/design/MTtw9YDPNHSRWsU9wczr7S/SciSync_CyberSecurity_SAD?node-id=0-1&p=f&t=2s5JO3vc3FfJJ5yt-0)

---

## 2. Network and Perimeter Security (Edge Zone)

### 2.1 Cloudflare Firewall & WAF

All traffic enters through Cloudflare, which acts as the gatekeeper.

- **DDoS Protection:** Automated mitigation against volumetric attacks.
- **Web Application Firewall (WAF):** Rules configured to block SQL injection, Cross-Site Scripting (XSS), and common OWASP Top 10 vulnerabilities.
- **Geo/IP Blocking:** Restricts traffic to authorized regions and allowlists trusted IP ranges.
- **TLS Termination:** Handles SSL/TLS termination, enforcing **TLS 1.3** for all internal and external communications to prevent Man-in-the-Middle attacks.

### 2.2 API Gateway

The API Gateway acts as the central hub for request routing and control.

- **Request Limits:** Enforces maximum request size to prevent buffer overflow attacks.
- **Rate Limiting:** Implements per-IP and per-route rate limits (e.g., maximum 100 requests/min to Gemini).
- **Authentication Enforcement:** Validates `x-api-key` and Bearer tokens before any request reaches the core backend.

---

## 3. Application Security (Trusted Zone)

### 3.1 Authentication and Session Management

Auditerra employs distinct authentication strategies based on the user interface used.

**Feature Phone Users (Farmers - USSD)**

- **Session Logic:** Numeric inputs only with a strict 30-second session timeout.
- **Normalization:** Phone numbers are normalized before processing.
- **Data Minimization:** No sensitive information is displayed in USSD menus.

**Smartphone Users (Experts & Supervisors - PWA)**

- **Credentials:** Email and Password combined with Multi-Factor Authentication (MFA) via SMS or Email.
- **Password Storage:** User passwords are strictly hashed using **bcrypt** (never stored in plain text).
- **Session Handling:** Users are automatically logged out after 5 failed attempts to prevent brute-force attacks.
- **JWT Management:**
  - **Algorithm:** Tokens are encrypted with **RS256** (asymmetric key pair) ensuring they cannot be tampered with.
  - **Expiry:** Access tokens expire after 1 hour, minimizing risk if a device is lost. Refresh tokens are continuously rotated.
  - **No Sensitive Data:** JWT payloads contain only role-based details, never personal sensitive data.
  - **Least Privilege:** Object-level authorization ensures experts can only access their assigned tickets.

### 3.2 Input Validation and Sanitization

Every entry point (USSD, API, Webhooks) enforces strict validation. The mobile application implements file integrity checks before upload.

**Code Example: Magic Byte Validation for Image Uploads (Mobile)**

```dart
bool _verifyMagicBytes(Uint8List bytes) {
  if (bytes.length < 8) return false;
  // Checks for genuine JPEG header (0xFF 0xD8 0xFF)
  final isJpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
  // Checks for genuine PNG header (0x89 0x50 0x4E 0x47...)
  final isPng = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E &&
                bytes[3] == 0x47 && bytes[4] == 0x0D && bytes[5] == 0x0A &&
                bytes[6] == 0x1A && bytes[7] == 0x0A;
  return isJpeg || isPng;
}
```

- **File Uploads (Soil Photos):** Max 3MB size limit, OCR scanning for malware/viruses, and metadata stripping to prevent phishing or hash leaks.
- **Rejection:** Executable files, scripts, and archives are rejected at the API Gateway.

### 3.3 Artificial Intelligence (Gemini) Security

To prevent data leakage and prompt injection attacks:

- **Data Minimization:** **All farmer identity data is stripped** before AI prompt construction. Only anonymized soil parameters, observations, and zone IDs are transmitted.
- **Prompt Injection Defense:** AI outputs are constrained to a strict JSON schema. Non-conforming outputs are rejected.
- **Rate Limiting:** Hard limit of 100 requests per minute to prevent Denial of Wallet attacks.
- **Audit:** Input hashes, output hashes, and supervisor decisions are logged for 3 years to trace liability.

---

## 4. Data Security (Data Zone)

### 4.1 Data Classification

Data is classified and handled based on sensitivity per the Kenya DPA:

| Class                 | Examples                                                      | Handling Rule                                                        |
| :-------------------- | :------------------------------------------------------------ | :------------------------------------------------------------------- |
| **Highly Restricted** | Name, Phone, Email, GPS, Password Hashes, MFA OTP, Ticket IDs | AES-256 at rest, TLS 1.3 in transit, no AI prompts, 7-year retention |
| **Internal Use**      | Ticket status, assignment logs, auth events, API metadata     | RBAC enforced, 30 days to 3-year retention                           |
| **Agronomic / Lower** | Soil pH, NPK, crop type, anonymized symptoms                  | Identifiers stripped before leaving zone, 2-year retention           |

### 4.2 Database & Secrets

- **PostgreSQL (Neon):** Encrypted at rest using **AES-256**. Daily automated backups with point-in-time recovery.
- **Google Secret Manager:** All API keys, `.env` variables, and private signing keys are stored here.
  - **Runtime Injection:** Credentials are injected at runtime, never hardcoded in source code.
  - **Rotation:** API keys rotated every 90 days; JWT signing keys annually.
- **Object Storage (Photos):** Private buckets with strict lifecycle rules (30 days) and access via short-lived signed URLs.

### 4.3 Offline Cache Security

The PWA uses a Service Worker to sync data for up to 10 days in low-connectivity areas. **Crucially:** Highly Restricted data is never cached locally; only operational data is buffered to prevent unauthorized access if a field device is stolen.

---

## 5. Webhook and External Integration Security

### 5.1 Webhook Validation (Africa's Talking & SMS Leopard)

External callbacks are cryptographically verified using HMAC-SHA256. The backend uses constant-time comparison to prevent timing attacks.

**Code Example: HMAC-SHA256 Webhook Validation (Backend)**

```dart
import 'dart:convert';
import 'package:crypto/crypto.dart';

class WebhookValidator {
  static bool validate({
    required String secret,
    required String body,
    required String? signature,
  }) {
    if (signature == null || signature.isEmpty) return false;
    final expected = 'sha256=${_hmacSha256(secret, body)}';
    return _secureCompare(signature, expected);
  }

  static String _hmacSha256(String key, String message) {
    final hmac = Hmac(sha256, utf8.encode(key));
    final digest = hmac.convert(utf8.encode(message));
    return digest.toString();
  }

  // Constant-time comparison to prevent timing attacks
  static bool _secureCompare(String a, String b) {
    if (a.length != b.length) return false;
    var result = 0;
    for (var i = 0; i < a.length; i++) {
      result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }
    return result == 0;
  }

  // Validates payload size (reject if > 100KB per security spec)
  static bool validateSize(String body) {
    return body.length <= 100 * 1024;
  }

  // Full security gate for incoming webhooks
  static bool gate({
    required String secret,
    required String body,
    required String? signature,
  }) {
    if (!validateSize(body)) return false;
    return validate(secret: secret, body: body, signature: signature);
  }
}
```

- **Payload Limit:** Webhook payloads are strictly limited to less than 100KB.
- **IP Allowlisting:** Requests claiming to be from vendors must originate from allowlisted IPs or are dropped at the firewall.

### 5.2 Vendor Security Requirements (Outbound)

- **Transport:** TLS 1.3 is mandatory for all outbound calls to Africa's Talking, SMS Leopard, and AWS SES.
- **Content Restriction:** SMS bodies are limited to 160 characters. No passwords or GPS coordinates are ever sent via SMS, except for time-limited OTPs/Handshake codes.
- **SMS Security Handshake:**
  - Generated using `crypto.randomInt` (6-digit code).
  - Stored **bcrypt-hashed** in the database.
  - Expires in 24 hours and is single-use.
  - Rate limits: Max 10 SMS per farmer/day; 100 per expert/day.

---

## 6. Physical Security and Device Management

Since field experts operate off-premises using personal devices, the following controls apply:

- **PWA Architecture:** Uses 1-hour JWT expiry to reduce the window of misuse if a device is lost.
- **No Local PII:** No Highly Restricted identity data is cached locally on the PWA. The Service Worker only buffers operational data for synchronization.
- **Screen Lock:** Development laptops and field devices must be password-protected and screen-locked when unattended.

---

## 7. Incident Response and Logging

### 7.1 Audit Logging

Comprehensive logging is implemented to ensure accountability and traceability. The mobile and backend services standardize logging:

**Code Example: Enforcing HTTPS and API Key Header Injection (Mobile API Service)**

```dart
// Security: Enforce HTTPS in production
if (!kDebugMode && !options.baseUrl.startsWith('https')) {
  handler.reject(DioException(
    requestOptions: options,
    error: 'Insecure connection blocked in production',
  ));
  return;
}
// Inject Authentication Token
if (token != null) options.headers['Authorization'] = 'Bearer $token';
// Inject API Key for WAF validation
if (_apiKey.isNotEmpty) options.headers['x-api-key'] = _apiKey;
```

- **Auth & Access Logs:** Stored for 1 year.
- **Data Change Logs:** Stored for 7 years (provides legal evidence of historical data changes).
- **AI Audit Logs:** Stored for 3 years.
- **File Operation Logs:** Stored for 2 years.
- **API Request Logs:** Stored for 30 days.
- **Error Logs:** Stored for 1 year.

_All logs are stored in PostgreSQL and protected against modification._

### 7.2 Incident Response Procedure

1. **Detection:** Alerts sent to the operations channel upon unusual API traffic, webhook validation failures, or failed auth attempts.
2. **Triage:** The Security Lead categorizes incidents (P1 to P4) based on severity (P1 = total outage/breach).
3. **Containment:** Revocation of API keys, isolation of systems, or blocking of vendor IPs immediately.
4. **Notification:** The DPO notifies the ODPC within **72 hours** and affected data subjects if the risk is high.
5. **Post-Incident Review:** A root cause analysis is performed within 14 days, and the Risk Register is updated.

---

## 8. Risk Management and Vendor Oversight

### 8.1 Vendor Tiering

Vendors are tiered based on risk and criticality:

- **Critical (Africa's Talking, PostgreSQL, Cloudflare):** Full onboarding checklist, DPA, annual reassessment.
- **Standard (SMS Leopard, AWS SES):** Pre-onboarding checklist, bi-annual review.
- **Low Risk (Google Cloud Gemini):** Confirmation of no model training, sub-processor list.

### 8.2 Monthly Monitoring

- **Cost & Volume:** Daily SMS/email spend monitored to detect toll fraud or anomalies.
- **Vendor Status:** Continuous review of vendor status pages.
- **DPA Updates:** Quarterly verification that terms have not changed.

---

## 9. Conclusion

TAuditerra ensures the confidentiality, integrity, and availability of its user data while remaining fully compliant with the Kenya Data Protection Act 2019.
