# Auditerra Platform

## 1. Introduction and Security

### 1.1 Purpose

This document serves as the definitive technical and operational security reference for the Auditerra platform. Auditerra is a digital coordination platform connecting smallholder farmers in rural Kenya with certified agricultural experts and institutional supervisors. Operating in low-connectivity environments and handling Highly Restricted personal data (names, phone numbers, GPS locations), robust security is paramount to maintain farmer trust, data integrity, and legal compliance under the Kenya Data Protection Act 2019.

### 1.2 Security Architecture Overview

The Auditerra platform adopts a **Defense-in-Depth** strategy, segmented into four distinct security zones. Data flows from the untrusted external environment, through perimeter defenses, into the trusted application zone, and finally to secure data storage.

![Preview of secure System Architecture](/public/secure.png)
| Zone | Components | Security Controls |
| ----------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Untrusted / External Zone** | Feature phones (USSD/SMS), external services (Africa's Talking, SMS Leopard, AWS SES) | TLS 1.3, rate limiting, input sanitization |
| **Edge / Perimeter Zone** | Cloudflare (Firewall, WAF, DDoS), API Gateway | DDoS protection, WAF rules, geo-blocking, IP allowlisting |
| **Trusted Application Zone** | Backends, core modules, USSD session handler, AI integration, webhook validator | JWT authentication, RBAC, input validation, HMAC verification |
| **Data Zone** | PostgreSQL (Neon), Object Storage, Google Secret Manager, Cache/Session Storage | AES-256 encryption at rest, secret rotation, access controls |

### 1.3 Data Classification

Data is classified and handled based on sensitivity per the Kenya Data Protection Act 2019:

| Class                 | Examples                                                      | Handling Rule                                                        |
| --------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Highly Restricted** | Name, Phone, Email, GPS, Password Hashes, MFA OTP, Ticket IDs | AES-256 at rest, TLS 1.3 in transit, no AI prompts, 7-year retention |
| **Internal Use**      | Ticket status, assignment logs, auth events, API metadata     | RBAC enforced, 30 days to 3-year retention                           |
| **Agronomic / Lower** | Soil pH, NPK, crop type, anonymized symptoms                  | Identifiers stripped before leaving zone, 2-year retention           |

---

## 2. Network and Perimeter Security (Edge Zone)

### 2.1 Cloudflare Firewall and WAF

All traffic enters through Cloudflare, which acts as the gatekeeper. The Cloudflare configuration provides multiple layers of protection that work together to secure the application perimeter.

**DDoS Protection:** Cloudflare automatically detects and mitigates volumetric attacks, ensuring the platform remains available even during large-scale denial-of-service attempts. This includes protection against SYN floods, UDP amplification, and HTTP-layer attacks.

**Web Application Firewall (WAF):** The WAF is configured with rules that block SQL injection attempts, Cross-Site Scripting (XSS) payloads, and other OWASP Top 10 vulnerabilities. These rules are continuously updated based on emerging threat intelligence.

**Geo/IP Blocking:** Traffic is restricted to authorized regions (primarily Kenya and trusted partner locations) to reduce the attack surface. Suspicious IP addresses are automatically blocked based on reputation scores.

**TLS Termination:** Cloudflare handles SSL/TLS termination, enforcing **TLS 1.3** for all internal and external communications to prevent Man-in-the-Middle attacks. This ensures that all data in transit is encrypted using the strongest available protocols.

### 2.2 API Gateway

The API Gateway acts as the central hub for request routing and control. It enforces security policies before any request reaches the core backend.

**Request Limits:** Maximum request size is enforced to prevent buffer overflow attacks. Requests exceeding the limit are rejected at the gateway level.

**Rate Limiting:** Per-IP and per-route rate limits are implemented. For example, the Gemini AI endpoint is limited to 100 requests per minute to prevent Denial of Wallet attacks. Public endpoints are limited to 100 requests per 60 seconds.

**Authentication Enforcement:** The gateway validates `x-api-key` and Bearer tokens before any request reaches the core backend. Requests without valid credentials are rejected with a 401 Unauthorized response.

---

## 3. Application Security (Trusted Zone)

### 3.1 Authentication and Session Management

Auditerra employs distinct authentication strategies based on the user interface used.

#### Feature Phone Users (Farmers - USSD)

**Session Logic:** USSD sessions enforce numeric inputs only, preventing injection attacks. Each session has a strict 30-second timeout to free up resources and prevent session hijacking. Phone numbers are normalized to E.164 format before processing to ensure consistency.

**Data Minimization:** No sensitive information is displayed in USSD menus. The interface only shows basic status messages and instructions, never exposing personal data or internal system details.

**Code Example: USSD Session Handler (Backend)**

```python
def handle_ussd_session(session_id, phone_number, input_text):
    # Validate session exists and is active
    session = get_ussd_session(session_id)
    if not session or session.is_expired():
        return respond_with_timeout()

    # Normalize phone number
    normalized_phone = normalize_phone(phone_number)

    # Sanitize input - only allow digits
    sanitized_input = re.sub(r'[^0-9]', '', input_text)

    # Process input based on current menu state
    return process_menu(session, sanitized_input)
```

#### Smartphone Users (Experts and Supervisors - PWA)

**Credentials:** Users authenticate using Email and Password combined with Multi-Factor Authentication (MFA) via SMS or Email. MFA is mandatory for all expert and supervisor accounts.

**Password Storage:** User passwords are strictly hashed using **bcrypt** with a work factor of 12, ensuring they are never stored in plain text. This protects user credentials even if the database is compromised.

**Code Example: Password Hashing (Backend)**

```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

**Session Handling:** Users are automatically logged out after 5 failed attempts to prevent brute-force attacks. This implements a progressive delay that increases with each failed attempt.

**JWT Management:**

- **Algorithm:** Tokens are signed with **RS256** (asymmetric key pair), ensuring they cannot be tampered with. The private key is stored in Google Secret Manager.
- **Expiry:** Access tokens expire after 1 hour, minimizing risk if a device is lost. Refresh tokens are continuously rotated and expire after 7 days.
- **No Sensitive Data:** JWT payloads contain only role-based details (user ID, role), never personal sensitive data.
- **Least Privilege:** Object-level authorization ensures experts can only access their assigned tickets. Supervisors can access all resources.

**Code Example: JWT Generation and Verification (Backend)**

```python
from jose import jwt
import time

def create_access_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": int(time.time()) + 3600  # 1 hour
    }
    return jwt.encode(payload, private_key, algorithm="RS256")

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, public_key, algorithms=["RS256"])
    except jwt.ExpiredSignatureError:
        raise UnauthorizedException("Token expired")
    except jwt.JWTError:
        raise UnauthorizedException("Invalid token")
```

### 3.2 Input Validation and Sanitization

Every entry point (USSD, API, Webhooks) enforces strict validation. The mobile application implements file integrity checks before upload.

**API Input Validation:** All API endpoints use Pydantic schemas for request validation. This ensures that incoming data matches the expected structure and data types before any processing occurs. Invalid requests are rejected with a 422 Unprocessable Entity response.

**File Uploads (Soil Photos):**

- Max 3MB size limit
- Magic byte validation to verify file is a genuine image
- OCR scanning for malware/viruses
- Metadata stripping to prevent phishing or hash leaks
- Executable files, scripts, and archives are rejected

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

**Code Example: API Input Validation (Backend)**

```python
from pydantic import BaseModel, EmailStr, Field

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)

class ReportIssueRequest(BaseModel):
    issue_category: str = Field(..., pattern="^(soil|water|crop|erosion)$")
    description: str = Field(..., max_length=500)
```

### 3.3 Artificial Intelligence (Gemini) Security

To prevent data leakage and prompt injection attacks:

**Data Minimization:** All farmer identity data is stripped before AI prompt construction. Only anonymized soil parameters, observations, and zone IDs are transmitted to the AI service. This ensures that Personally Identifiable Information never leaves the trusted zone.

**Prompt Injection Defense:** AI outputs are constrained to a strict JSON schema. Non-conforming outputs are rejected and logged for manual review. This prevents the AI from generating harmful or unexpected content.

**Rate Limiting:** Hard limit of 100 requests per minute to prevent Denial of Wallet attacks. Excessive usage triggers alerts to the operations team.

**Audit:** Input hashes, output hashes, and supervisor decisions are logged for 3 years to trace liability and enable forensic analysis if needed.

**Code Example: Anonymized AI Prompt Construction (Backend)**

```python
def build_ai_prompt(diagnostic_data: dict) -> dict:
    # Remove all farmer identity data
    anonymized = {
        "soil_ph": diagnostic_data["soil_ph"],
        "nitrogen_ppm": diagnostic_data["nitrogen_ppm"],
        "phosphorous_ppm": diagnostic_data["phosphorous_ppm"],
        "potassium_ppm": diagnostic_data["potassium_ppm"],
        "county": diagnostic_data["county"],  # Aggregated, not PII
        "zone_id": diagnostic_data["zone_id"],  # Non-identifying
        "issue_category": diagnostic_data["issue_category"]
    }
    return anonymized
```

---

## 4. Data Security (Data Zone)

### 4.1 Database and Secrets

**PostgreSQL (Neon):** The database is encrypted at rest using **AES-256**. Daily automated backups are performed with point-in-time recovery capability. This ensures data can be restored in case of corruption or disaster.

**Google Secret Manager:** All API keys, `.env` variables, and private signing keys are stored in Google Secret Manager. Credentials are injected at runtime, never hardcoded in source code. This prevents credential leakage through source code repositories.

**Secret Rotation:** API keys are rotated every 90 days. JWT signing keys are rotated annually. The rotation process is automated to ensure no downtime.

**Object Storage (Photos):** Private buckets store uploaded images with strict lifecycle rules (30 days retention). Access is via short-lived signed URLs that expire after 5 minutes, preventing unauthorized access to stored images.

**Code Example: Secret Injection (Backend)**

```python
import os
from google.cloud import secretmanager

def get_secret(secret_name: str) -> str:
    client = secretmanager.SecretManagerServiceClient()
    project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
    name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")
```

### 4.2 Offline Cache Security

The PWA uses a Service Worker to sync data for up to 10 days in low-connectivity areas. **Crucially:** Highly Restricted data is never cached locally. The Service Worker only buffers operational data (tickets, diagnostic forms) to prevent unauthorized access if a field device is stolen.

**Cached Data Types:**

- Tickets: Up to 10 days of assignments
- Diagnostic forms: Complete forms awaiting sync
- Location data: GPS coordinates and farm boundaries
- Photos: Compressed field images

**Security Controls:**

- JWT tokens expire after 1 hour
- Cache is cleared on logout
- Data encrypted at rest in IndexedDB
- No Personally Identifiable Information stored locally

**Code Example: Offline Cache Security (PWA)**

```typescript
// Only cache operational data, never PII
const CACHE_DATA_TYPES = {
  tickets: true,
  locations: true,
  diagnostics: true,
  user_profile: false, // Never cache PII
};

async function cacheData(data: any) {
  // Remove any PII before caching
  const sanitized = removePII(data);
  await indexedDB.save(sanitized);
}
```

---

## 5. Webhook and External Integration Security

### 5.1 Webhook Validation

External callbacks (from Africa's Talking and SMS Leopard) are cryptographically verified using HMAC-SHA256. The backend uses constant-time comparison to prevent timing attacks.

**Payload Limit:** Webhook payloads are strictly limited to less than 100KB. Larger payloads are rejected to prevent buffer overflow attacks.

**IP Allowlisting:** Requests claiming to be from vendors must originate from allowlisted IPs or are dropped at the firewall. This prevents spoofing attacks.

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

**Code Example: Webhook Endpoint (Backend)**

```python
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()

@app.post("/webhooks/africastalking")
async def handle_africastalking_webhook(request: Request):
    body = await request.body()
    signature = request.headers.get("X-Signature")

    # Validate webhook authenticity
    if not validate_webhook(
        secret=os.getenv("AFRICASTALKING_WEBHOOK_SECRET"),
        body=body.decode(),
        signature=signature
    ):
        raise HTTPException(status_code=403, detail="Invalid signature")

    # Process webhook
    data = json.loads(body)
    return process_webhook(data)
```

### 5.2 Vendor Security Requirements (Outbound)

**Transport:** TLS 1.3 is mandatory for all outbound calls to Africa's Talking, SMS Leopard, and AWS SES. Connections failing to negotiate TLS 1.3 are terminated.

**Content Restriction:** SMS bodies are limited to 160 characters. No passwords or GPS coordinates are ever sent via SMS, except for time-limited OTPs/Handshake codes. This prevents sensitive data leakage through SMS.

**SMS Security Handshake:**

- Generated using `crypto.randomInt` (4-digit code)
- Stored **bcrypt-hashed** in the database
- Expires in 24 hours and is single-use
- Rate limits: Max 10 SMS per farmer/day; 100 per expert/day

**Code Example: SMS Handshake Generation (Backend)**

```python
import secrets
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_handshake_code() -> str:
    # Generate secure 4-digit code
    return f"{secrets.randbelow(10000):04d}"

def hash_handshake_code(code: str) -> str:
    # Hash for storage
    return pwd_context.hash(code)

def verify_handshake_code(code: str, hashed_code: str) -> bool:
    # Verify against hash
    return pwd_context.verify(code, hashed_code)
```

---

## 6. Physical Security and Device Management

Since field experts operate off-premises using personal devices, the following controls apply:

**PWA Architecture:** Uses 1-hour JWT expiry to reduce the window of misuse if a device is lost. This limits the exposure window to a maximum of 60 minutes.

**No Local PII:** No Highly Restricted identity data is cached locally on the PWA. The Service Worker only buffers operational data for synchronization. This prevents data exposure if a device is stolen.

**Screen Lock:** Development laptops and field devices must be password-protected and screen-locked when unattended. This is enforced through organizational policy and regular compliance checks.

**Device Reporting:** Lost or stolen devices must be reported immediately. The operations team can revoke tokens for the affected user to prevent unauthorized access.

---

## 7. Incident Response and Logging

### 7.1 Audit Logging

Comprehensive logging is implemented to ensure accountability and traceability. All logs are stored in PostgreSQL and protected against modification.

**Log Categories and Retention:**

| Log Type             | Retention | Purpose                                         |
| -------------------- | --------- | ----------------------------------------------- |
| Auth and Access Logs | 1 year    | Track authentication events and access patterns |
| Data Change Logs     | 7 years   | Legal evidence of historical data changes       |
| AI Audit Logs        | 3 years   | Trace AI decision liability                     |
| File Operation Logs  | 2 years   | Track file uploads and access                   |
| API Request Logs     | 30 days   | Performance and troubleshooting                 |
| Error Logs           | 1 year    | Debugging and quality assurance                 |

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

**Code Example: Audit Logging (Backend)**

```python
def log_audit_event(actor_id: str, event_type: str, resource_type: str, resource_id: str, details: dict):
    audit_log = AuditLog(
        actor_id=actor_id,
        event_type=event_type,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        timestamp=datetime.utcnow()
    )
    db.add(audit_log)
    db.commit()
```

### 7.2 Incident Response Procedure

**1. Detection:** Alerts are sent to the operations channel upon unusual API traffic, webhook validation failures, or failed auth attempts. Automated monitoring systems continuously scan for anomalies.

**2. Triage:** The Security Lead categorizes incidents (P1 to P4) based on severity:

- **P1:** Total outage or data breach
- **P2:** Partial outage or major vulnerability
- **P3:** Minor issue or potential vulnerability
- **P4:** Informational or non-urgent

**3. Containment:** API keys are revoked, systems are isolated, or vendor IPs are blocked immediately to prevent further damage.

**4. Notification:** The Data Protection Officer notifies the Office of the Data Protection Commissioner within **72 hours** and affected data subjects if the risk is high.

**5. Post-Incident Review:** A root cause analysis is performed within 14 days, and the Risk Register is updated with lessons learned.

---

## 8. Risk Management and Vendor Oversight

### 8.1 Vendor Tiering

Vendors are tiered based on risk and criticality:

| Tier         | Vendors                                  | Oversight                                             |
| ------------ | ---------------------------------------- | ----------------------------------------------------- |
| **Critical** | Africa's Talking, PostgreSQL, Cloudflare | Full onboarding checklist, DPA, annual reassessment   |
| **Standard** | SMS Leopard, AWS SES                     | Pre-onboarding checklist, bi-annual review            |
| **Low Risk** | Google Cloud Gemini                      | Confirmation of no model training, sub-processor list |

### 8.2 Monthly Monitoring

**Cost and Volume:** Daily SMS/email spend is monitored to detect toll fraud or anomalies. Unusual spikes trigger alerts for investigation.

**Vendor Status:** Continuous review of vendor status pages for outages or security incidents.

**DPA Updates:** Quarterly verification that terms have not changed. Any changes are reviewed by the DPO.

---

## 9. Conclusion

Auditerra ensures the confidentiality, integrity, and availability of its user data while remaining fully compliant with the Kenya Data Protection Act 2019. The defense-in-depth approach, combined with robust authentication, encryption, and monitoring, provides comprehensive protection against both external and internal threats.

---

## 10. Next Steps

- [Backend API](/ai/overview) — Explore the endpoints
