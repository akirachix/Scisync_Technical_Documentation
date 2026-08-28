# Auditerra Security Documentation

## 1. Introduction and Security Posture

### 1.1 Purpose

This document serves as the definitive technical and operational security reference for the Auditerra platform. Auditerra is a digital coordination platform connecting smallholder farmers in rural Kenya with certified agricultural experts and institutional supervisors. Operating in low-connectivity environments and handling Highly Restricted personal data (names, phone numbers, GPS locations), robust security is paramount to maintain farmer trust, data integrity, and legal compliance under the Kenya Data Protection Act 2019.

### 1.2 Security Architecture Overview

![Secure architecture](/public/secure.png)

The Auditerra platform adopts a **Defense-in-Depth** strategy, segmented into four distinct security zones. Data flows from the untrusted external environment, through perimeter defenses, into the trusted application zone, and finally to secure data storage.

| Zone                          | Components                                                                            | Security Controls                                             |
| ----------------------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| **Untrusted / External Zone** | Feature phones (USSD/SMS), external services (Africa's Talking, SMS Leopard, AWS SES) | TLS 1.3, rate limiting, input sanitization                    |
| **Edge / Perimeter Zone**     | Cloudflare (Firewall, WAF, DDoS), API Gateway                                         | DDoS protection, WAF rules, geo-blocking, IP allowlisting     |
| **Trusted Application Zone**  | Backends, core modules, USSD session handler, AI integration, webhook validator       | JWT authentication, RBAC, input validation, HMAC verification |
| **Data Zone**                 | PostgreSQL (Neon), Object Storage, Google Secret Manager, Cache/Session Storage       | AES-256 encryption at rest, secret rotation, access controls  |

### 1.3 Data Classification

Data is classified and handled based on sensitivity per the Kenya Data Protection Act 2019:

| Class                 | Examples                                                      | Handling Rule                                                        |
| --------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Highly Restricted** | Name, Phone, Email, GPS, Password Hashes, MFA OTP, Ticket IDs | AES-256 at rest, TLS 1.3 in transit, no AI prompts, 7-year retention |
| **Medium Risk**       | Ticket status, assignment logs, auth events, API metadata     | RBAC enforced, 30 days to 3-year retention                           |
| **Low Risk**          | Soil pH, NPK, crop type, anonymized symptoms                  | Identifiers stripped before leaving zone, 2-year retention           |

---

## 2. Network and Perimeter Security (Edge Zone)

### 2.1 Cloudflare Firewall and WAF

All traffic enters through Cloudflare, which acts as the gatekeeper. Cloudflare provides DDoS protection, a Web Application Firewall (WAF) that blocks SQL injection and XSS attempts, geo-blocking to restrict traffic to authorized regions, and TLS 1.3 termination to encrypt all data in transit.

**Cloudflare WAF Rule Configuration:**

The following WAF rules block common attack patterns at the edge. SQL injection attempts are detected by scanning for SQL keywords. XSS attempts are blocked by detecting script tags and JavaScript URI schemes.

```yaml
- action: block
  expression: any(http.request.body.raw, "contains", "SELECT") or any(http.request.body.raw, "contains", "UNION")
- action: block
  expression: any(http.request.body.raw, "contains", "<script>") or any(http.request.body.raw, "contains", "javascript:")
```

---

### 2.2 API Gateway

The API Gateway enforces request size limits, rate limiting per IP and per route, and authentication validation before requests reach the core backend.

**Rate Limiting Middleware:**

The rate limiter tracks requests per IP address using Redis. If a client exceeds 100 requests within 60 seconds, subsequent requests are rejected with a 429 status code.

```python
async def rate_limit_middleware(request: Request, call_next):
    key = f"rate_limit:ip:{request.client.host}"
    count = redis_client.incr(key)
    if count == 1: redis_client.expire(key, 60)
    if count > 100: raise HTTPException(status_code=429)
    return await call_next(request)
```

**API Key Validation:**

API keys are validated on every request using FastAPI's Security dependency. Requests without a valid key receive a 401 Unauthorized response.

```python
async def validate_api_key(api_key: str = Security(APIKeyHeader(name="x-api-key"))):
    if api_key != settings.API_KEY: raise HTTPException(status_code=401)
```

---

## 3. Application Security (Trusted Zone)

### 3.1 Authentication and Session Management

Auditerra employs distinct authentication strategies based on the user interface used.

**Feature Phone Users (Farmers - USSD):** USSD sessions enforce numeric inputs only with a strict 30-second timeout. Phone numbers are normalized to E.164 format before processing. No sensitive information is displayed in USSD menus.

**USSD Session Handler:**

The handler validates the session, normalizes the phone number, sanitizes input to allow only digits, and processes the menu selection.

```python
def handle_ussd_session(session_id, phone, input_text):
    session = get_ussd_session(session_id)
    if not session or session.is_expired(): return respond_with_timeout()
    return process_menu(session, re.sub(r'[^0-9]', '', input_text))
```

**Smartphone Users (Experts and Supervisors - PWA):** Users authenticate using Email and Password combined with Multi-Factor Authentication (MFA). Passwords are hashed using bcrypt with a work factor of 12. JWT tokens are signed with RS256, expire after 1 hour, and contain only role-based details.

**Password Hashing:**

Bcrypt provides strong password protection with a configurable work factor. The hash function salts and hashes the password, while verify compares a plain-text password against its stored hash.

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str: return pwd_context.hash(password)
def verify_password(plain: str, hashed: str) -> bool: return pwd_context.verify(plain, hashed)
```

**JWT Generation:**

JWTs are signed with RS256 using a private key. Each token contains the user ID, role, and a 1-hour expiration timestamp.

```python
def create_access_token(user_id: str, role: str) -> str:
    return jwt.encode({"sub": user_id, "role": role, "exp": int(time.time()) + 3600}, private_key, algorithm="RS256")
```

---

### 3.2 Input Validation and Sanitization

Every entry point enforces strict validation. All API endpoints use Pydantic schemas for request validation. File uploads are validated with magic byte verification, limited to 3MB, and scanned for malware.

**API Input Validation:**

Pydantic schemas enforce type safety and validation rules. The email field ensures valid email format, password requires minimum length, and issue_category is restricted to allowed values.

```python
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
class ReportIssueRequest(BaseModel):
    issue_category: str = Field(..., pattern="^(soil|water|crop|erosion)$")
    description: str = Field(..., max_length=500)
```

**Magic Byte Validation for Image Uploads:**

The function checks the first few bytes of the file against known JPEG and PNG signatures, rejecting files that don't match valid image formats.

```dart
bool _verifyMagicBytes(Uint8List bytes) {
  if (bytes.length < 8) return false;
  final isJpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
  final isPng = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
  return isJpeg || isPng;
}
```

---

### 3.3 Artificial Intelligence (Gemini) Security

All farmer identity data is stripped before AI prompt construction. Only anonymized soil parameters, observations, and zone IDs are transmitted. AI outputs are constrained to a strict JSON schema. Non-conforming outputs are rejected. Hard limit of 100 requests per minute prevents Denial of Wallet attacks. Input hashes, output hashes, and supervisor decisions are logged for 3 years.

**Anonymized AI Prompt Construction:**

The function extracts only non-identifying diagnostic data, removing all farmer PII before the request leaves the trusted zone.

```python
def build_anonymized_prompt(data: dict) -> dict:
    return {k: data[k] for k in ["soil_ph", "nitrogen_ppm", "phosphorous_ppm", "potassium_ppm", "county", "zone_id", "issue_category"]}
```

---

## 4. Data Security (Data Zone)

### 4.1 Database and Secrets

The database is encrypted at rest using AES-256. Daily automated backups are performed with point-in-time recovery. All API keys, .env variables, and private signing keys are stored in Google Secret Manager and injected at runtime. API keys are rotated every 90 days. JWT signing keys are rotated annually.

**Secret Injection:**

The function retrieves secrets from Google Secret Manager at runtime, preventing hardcoded credentials in the codebase.

```python
def get_secret(secret_name: str) -> str:
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{os.getenv('GOOGLE_CLOUD_PROJECT')}/secrets/{secret_name}/versions/latest"
    return client.access_secret_version(request={"name": name}).payload.data.decode("UTF-8")
```

### 4.2 Offline Cache Security

The PWA uses a Service Worker to sync data for up to 10 days. Highly Restricted data is never cached locally. Only operational data is buffered. JWT tokens expire after 1 hour. Cache is cleared on logout. Data is encrypted at rest in IndexedDB.

**Offline Cache Security:**

Only non-sensitive operational data is cached. PII is stripped before storage, and the user profile is never cached locally.

```typescript
const CACHE_DATA_TYPES = {
  tickets: true,
  locations: true,
  diagnostics: true,
  user_profile: false,
};
async function cacheData(data: any) {
  await indexedDB.save(removePII(data));
}
```

---

## 5. Webhook and External Integration Security

### 5.1 Webhook Validation

External callbacks are cryptographically verified using HMAC-SHA256 with constant-time comparison. Webhook payloads are strictly limited to 100KB. Requests must originate from allowlisted IPs.

**HMAC-SHA256 Webhook Validation:**

The validator computes the HMAC-SHA256 signature of the request body using a shared secret and compares it against the provided signature using constant-time comparison to prevent timing attacks.

```dart
class WebhookValidator {
  static bool validate({required String secret, required String body, required String? signature}) {
    if (signature == null) return false;
    return _secureCompare(signature, 'sha256=${Hmac(sha256, utf8.encode(secret)).convert(utf8.encode(body))}');
  }
  static bool _secureCompare(String a, String b) {
    if (a.length != b.length) return false;
    var result = 0;
    for (var i = 0; i < a.length; i++) result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    return result == 0;
  }
}
```

**Webhook Endpoint:**

The endpoint validates the webhook signature and rejects invalid requests with a 403 status code.

```python
@app.post("/webhooks/africastalking")
async def handle_webhook(request: Request):
    body = await request.body()
    if not validate_webhook(secret=os.getenv("WEBHOOK_SECRET"), body=body.decode(), signature=request.headers.get("X-Signature")):
        raise HTTPException(status_code=403)
    return process_webhook(json.loads(body))
```

### 5.2 Vendor Security Requirements (Outbound)

TLS 1.3 is mandatory for all outbound calls. SMS bodies are limited to 160 characters. No passwords or GPS coordinates are ever sent via SMS, except for time-limited OTPs. Handshake codes are generated using crypto.randomInt, stored bcrypt-hashed, expire in 24 hours, and are single-use.

**SMS Handshake Generation:**

Handshake codes are generated as 4-digit random numbers, hashed with bcrypt before storage, and verified against the stored hash.

```python
def generate_handshake_code() -> str: return f"{secrets.randbelow(10000):04d}"
def hash_handshake_code(code: str) -> str: return pwd_context.hash(code)
def verify_handshake_code(code: str, hashed: str) -> bool: return pwd_context.verify(code, hashed)
```

---

## 6. Physical Security and Device Management

PWA uses 1-hour JWT expiry to reduce the window of misuse if a device is lost. No Highly Restricted identity data is cached locally. Service Worker only buffers operational data. Lost or stolen devices must be reported immediately. The operations team can revoke tokens for the affected user.

---

## 7. Incident Response and Logging

### 7.1 Audit Logging

Comprehensive logging ensures accountability and traceability. All logs are stored in PostgreSQL and protected against modification. Auth and access logs are stored for 1 year. Data change logs are stored for 7 years. AI audit logs are stored for 3 years. API request logs are stored for 30 days.

**Audit Logging:**

The function creates an audit log entry with actor, event type, resource details, and timestamp, then commits it to the database.

```python
def log_audit_event(actor_id: str, event_type: str, resource_type: str, resource_id: str, details: dict):
    db.add(AuditLog(actor_id=actor_id, event_type=event_type, resource_type=resource_type, resource_id=resource_id, details=details, timestamp=datetime.utcnow()))
    db.commit()
```

**Enforcing HTTPS (Mobile):**

The mobile client rejects any connection attempts that do not use HTTPS in production, preventing man-in-the-middle attacks.

```dart
if (!kDebugMode && !options.baseUrl.startsWith('https')) {
  handler.reject(DioException(requestOptions: options, error: 'Insecure connection blocked'));
  return;
}
```

### 7.2 Incident Response Procedure

Alerts are sent upon unusual API traffic, webhook validation failures, or failed auth attempts. The Security Lead categorizes incidents (P1 to P4). API keys are revoked, systems isolated, or vendor IPs blocked immediately. The Data Protection Officer notifies the ODPC within 72 hours. Root cause analysis is performed within 14 days.

---

## 8. Risk Management and Vendor Oversight

Critical vendors (Africa's Talking, PostgreSQL, Cloudflare) undergo full onboarding checklists, DPA signing, and annual reassessment. Standard vendors (SMS Leopard, AWS SES) require pre-onboarding checklists and bi-annual review. Daily SMS/email spend is monitored to detect toll fraud. Vendor status pages are continuously reviewed. DPA terms are verified quarterly.

---

## 9. Conclusion

Auditerra ensures the confidentiality, integrity, and availability of its user data while remaining fully compliant with the Kenya Data Protection Act 2019. The defense-in-depth approach, combined with robust authentication, encryption, and monitoring, provides comprehensive protection against both external and internal threats.

[See our Policy Documents and Third Party Management](https://docs.google.com/document/d/1C9C3jIJir9kYyHSOL50QNPmdkmQ5vTcsOUD-JX2UhYY/edit?tab=t.0)
