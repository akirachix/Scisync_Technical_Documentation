# Frontend Mobile (Flutter)

## 1. Overview

The Auditerra mobile application is a standalone **Flutter** application designed specifically for field agricultural experts in Kenya specializing in soil restoration. Unlike the web-based PWA, this is a native cross-platform application built with Flutter, providing superior performance, offline capabilities, and native device integration.

The application facilitates the connection between experts and farmers, enabling experts to manage their workflow effectively, capture accurate physical data, and generate valuable insights for the farmers they serve. It is designed to operate in remote areas with unreliable internet connectivity, making it an essential tool for field operations in Kenya's rural regions.

**Target Users:** Field Experts (primary)  
**Platforms:** Android and iOS (via Flutter cross-platform compilation)  
**Primary Use Case:** Soil diagnostic data collection in remote areas with unreliable internet  
**Distribution:** Google Play Store and Apple App Store

The core functionalities of the app include:

- View and manage assigned tickets received from the central system.
- Capture soil data and multi-point farm boundaries using advanced GPS mapping.
- Generate AI-powered soil diagnostic reports based on the captured data.
- Operate offline by queuing data locally for later synchronization when connectivity returns.
- Verify farmer identities via handshake codes to prevent fraudulent entries and ensure physical field visits.
- Capture and validate images with magic byte verification to ensure data integrity.

---

## 2. System Architecture

### Mobile Screen Preview

![Mobile Screen](/public/mobile.png)

### 2.1 Tech Stack

The application is built using **Flutter**, a cross-platform framework that allows the app to run seamlessly on both Android and iOS. It utilizes a modern, reactive state management approach with the following core components:

| Category             | Technology               | Purpose                                   |
| -------------------- | ------------------------ | ----------------------------------------- |
| **Framework**        | Flutter (Dart)           | Cross-platform mobile development         |
| **State Management** | `flutter_riverpod`       | Reactive state management                 |
| **Routing**          | `go_router`              | Declarative, path-based navigation        |
| **Networking**       | `dio`                    | HTTP client with interceptor architecture |
| **Data Storage**     | `shared_preferences`     | Key-value data (tokens, user cache)       |
| **Offline Storage**  | `hive`                   | Structured offline data (soil forms)      |
| **Geolocation**      | `geolocator`             | GPS data retrieval                        |
| **Mapping**          | `flutter_map`            | Visual farm boundary mapping              |
| **Security**         | `crypto`                 | HMAC signature verification               |
| **Secure Storage**   | `flutter_secure_storage` | Safe storage for encryption keys          |
| **Image Capture**    | `image_picker`           | Camera and gallery access                 |
| **Connectivity**     | `connectivity_plus`      | Network status monitoring                 |
| **Token Management** | `jwt_decoder`            | JWT token parsing and validation          |

### 2.2 Project Structure

To ensure maintainability and scalability, the codebase is strictly organized by layers, separating concerns between UI, business logic, and data models.

```
lib/
├── config/                 # Constants & Routes
│   ├── constants.dart      # App-wide constants
│   └── routes.dart         # Route definitions
├── models/                 # Data models
│   ├── ticket.dart         # Ticket model
│   ├── soil_form.dart      # Soil diagnostic form model
│   ├── user.dart           # User profile model
│   └── soil_report.dart    # AI-generated report model
├── providers/              # Riverpod State Providers
│   ├── auth_provider.dart  # Authentication state
│   └── connectivity_provider.dart # Network connectivity state
├── screens/                # UI Screens
│   ├── auth/               # Authentication screens
│   │   ├── login_screen.dart
│   │   ├── signup_screen.dart
│   │   └── reset_password_screen.dart
│   ├── expert/             # Expert workflow screens
│   │   ├── home_screen.dart
│   │   ├── tickets_screen.dart
│   │   ├── profile_screen.dart
│   │   └── soil_form_screen.dart
│   └── widgets/            # Reusable UI components
│       ├── bottom_navigation.dart
│       ├── header.dart
│       └── ticket_card.dart
├── services/               # Business Logic & API handling
│   ├── api_service.dart    # Core HTTP client
│   ├── auth_service.dart   # Auth token management
│   ├── ticket_service.dart # Ticket verification logic
│   ├── sync_service.dart   # Offline synchronization
│   └── webhook_validator.dart # Webhook security validation
└── main.dart               # Application entry point
```

### 2.3 Architecture Layers

The application follows a clean architecture pattern with clear separation of concerns:

**UI Layer (Screens):** Login, Home, Tickets, Soil Form, Profile, Reports

**State Management (Providers):** Auth Provider, Connectivity Provider, Tickets Provider, Forms Provider

**Business Logic (Services):** API Service, Auth Service, Ticket Service, Sync Service, Location Service, Webhook Validator

**Data Layer (Models & Storage):** Ticket Model, Soil Form Model, User Model, Soil Report Model, Hive Storage, Shared Preferences, Secure Storage

**Platform Integrations:** GPS (geolocator), Camera (image_picker), Network (connectivity_plus), Secure Storage (flutter_secure_storage)

---

## 3. Core Architectural Components

### 3.1 Routing Configuration

The application uses `go_router` for navigation. The routing logic is dynamically bound to the user's authentication state. When the user logs in or out, the router automatically redirects them to the appropriate screens, preventing unauthorized access to protected areas.

The router listens to authentication state changes using a `refreshListenable`, which triggers a redirect when the auth state changes. This ensures that a successful login or logout immediately redirects the user to the correct screen.

```dart
final routerProvider = Provider<GoRouter>((ref) {
  final listenable = ValueNotifier<AuthState>(ref.read(authProvider));
  return GoRouter(
    initialLocation: AppRoutes.login,
    refreshListenable: listenable,
    redirect: (context, state) {
      final isLoggedIn = listenable.value.status == AuthStatus.authenticated;
      final isAuthRoute = state.matchedLocation == AppRoutes.login || state.matchedLocation == AppRoutes.signup;
      if (!isLoggedIn && !isAuthRoute) return AppRoutes.login;
      if (isLoggedIn && isAuthRoute) return AppRoutes.home;
      return null;
    },
  );
});
```

### 3.2 API Service Integration

The API service is the single point of contact for all backend requests. It is configured with **Security Interceptors** to automatically inject authentication tokens and API keys into request headers. It also centralizes error handling, extracting meaningful error messages from API responses.

The interceptor handles three critical functions: injecting the Bearer token, adding the API key for WAF validation, and enforcing HTTPS in production.

```dart
class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConstants.apiBaseUrl,
    connectTimeout: const Duration(seconds: 15),
  ));

  static void init() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await SecureStorage.read('token');
        if (token != null) options.headers['Authorization'] = 'Bearer $token';
        if (!kDebugMode && !options.baseUrl.startsWith('https')) {
          handler.reject(DioException(requestOptions: options, error: 'Insecure connection blocked'));
          return;
        }
        handler.next(options);
      },
      onError: (e, handler) {
        if (e.response?.statusCode == 401) _refreshToken();
        handler.next(DioException(requestOptions: e.requestOptions, error: _extractErrorMessage(e)));
      },
    ));
  }
}
```

**Error extraction:** The `_extractErrorMessage` method handles various error response formats (detail, message, error fields) to display user-friendly error messages.

### 3.3 Auth Service Integration

The authentication service manages the complete authentication lifecycle, including login, logout, token storage, and token validation. Tokens are stored securely using `flutter_secure_storage`, which leverages platform-specific secure storage mechanisms.

```dart
class AuthService {
  static Future<bool> login(String email, String password) async {
    try {
      final response = await ApiService.post('/auth/login', data: {'email': email, 'password': password});
      if (response.statusCode == 200) {
        await SecureStorage.write('token', response.data['access_token']);
        await SharedPreferences.getInstance().then((p) => p.setString('user', jsonEncode(response.data['user'])));
        return true;
      }
      return false;
    } catch (e) { return false; }
  }

  static Future<bool> isAuthenticated() async {
    final token = await SecureStorage.read('token');
    if (token == null) return false;
    try { return DateTime.fromMillisecondsSinceEpoch(JwtDecoder.decode(token)['exp'] * 1000).isAfter(DateTime.now()); }
    catch (e) { return false; }
  }
}
```

### 3.4 Ticket Service Integration

The ticket service manages all ticket-related operations including fetching tickets, verifying handshake codes, and submitting soil forms.

```dart
class TicketService {
  static Future<List<Ticket>> getMyTickets(String staffId) async {
    final response = await ApiService.get('/ticket/staff/$staffId');
    return (response.data as List).map((t) => Ticket.fromJson(t)).toList();
  }

  static Future<void> verifyHandshake(String farmerId, String code) async {
    await ApiService.post('/farmers/$farmerId/verify-handshake', data: {'code': code});
  }
}
```

### 3.5 Sync Service Integration

The sync service manages offline data synchronization. When the expert is offline, soil forms are stored locally in Hive. When connectivity is restored, the service automatically synchronizes pending forms.

The sync process follows a FIFO (First-In, First-Out) approach to maintain data integrity. If a network error occurs, the process stops immediately to prevent data corruption. Invalid data (HTTP 422) is marked as synced to prevent infinite retry loops.

```dart
class SyncService {
  static Future<int> syncPendingForms() async {
    final box = await Hive.openBox<OfflineSoilForm>('soil_forms');
    final unsynced = box.values.where((f) => !f.isSynced).toList();
    for (final form in unsynced) {
      try {
        await ApiService.post('/api/logs', data: _buildPayload(form));
        await _markAsSynced(form);
      } on DioException catch (e) {
        if (e.response?.statusCode == 422) { await _markAsSynced(form); } else { break; }
      }
    }
    return syncedCount;
  }
}
```

### 3.6 Connectivity Service Integration

The connectivity service monitors network status and triggers synchronization when connectivity is restored, ensuring seamless background sync without manual intervention.

```dart
class ConnectivityService {
  static void init() {
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) _syncPendingForms();
    });
  }
}
```

### 3.7 Geolocation Service Integration

The geolocation service captures GPS coordinates for farm boundary mapping, with a 500-meter radius constraint to maintain data integrity.

```dart
class LocationService {
  static Future<Position?> getCurrentPosition() async {
    if (!await _checkPermission()) return null;
    return await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
  }
}
```

---

## 4. Security and Integrity Measures

### 4.1 Ticket Verification (Handshake)

Before an expert can submit a soil form, they must physically be at the farm and verify their presence using a **Handshake Code** provided by the farmer. This prevents field agents from marking tasks as complete without actually traveling to the location.

When a farmer reports an issue, the system generates a unique 4-digit code sent via SMS. The expert must enter this code into the app while at the farm location. The backend validates the code against the stored hash and confirms the expert's physical presence.

```dart
class TicketService {
  static Future<void> verifyHandshake(String farmerId, String code) async {
    await ApiService.post('/farmers/$farmerId/verify-handshake', data: {'code': code});
  }
}
```

### 4.2 Image Integrity and Validation

The soil form uploads images. To prevent malicious files or spoofed extensions, the application implements **Magic Byte Verification**, checking the binary header to ensure it is a genuine image.

JPEG files start with `FF D8 FF` and PNG files start with `89 50 4E 47 0D 0A 1A 0A`. If the bytes don't match, the file is rejected.

```dart
class ImageValidator {
  static bool verifyMagicBytes(Uint8List bytes) {
    if (bytes.length < 8) return false;
    final isJpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
    final isPng = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47;
    return isJpeg || isPng;
  }
}
```

### 4.3 Webhook Security

The app receives webhooks (e.g., from Africa's Talking for SMS notifications). To validate that requests come from trusted sources, it uses **HMAC-SHA256** signatures with constant-time comparison to prevent timing attacks.

```dart
class WebhookValidator {
  static bool validate({required String secret, required String body, required String? signature}) {
    if (signature == null) return false;
    final expected = 'sha256=${Hmac(sha256, utf8.encode(secret)).convert(utf8.encode(body))}';
    return _secureCompare(signature, expected);
  }
  static bool _secureCompare(String a, String b) {
    if (a.length != b.length) return false;
    var result = 0;
    for (var i = 0; i < a.length; i++) result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    return result == 0;
  }
}
```

### 4.4 Secure Storage

Sensitive data such as encryption keys and authentication tokens are stored in `flutter_secure_storage`, which uses the platform's secure storage mechanisms (Keychain on iOS, Keystore on Android). This ensures data is encrypted at rest and inaccessible to other applications.

```dart
class SecureStorage {
  static final FlutterSecureStorage _storage = const FlutterSecureStorage();
  static Future<void> write(String key, String value) async => await _storage.write(key: key, value: value);
  static Future<String?> read(String key) async => await _storage.read(key: key);
}
```

---

## 5. Advanced User Features

### 5.1 GPS Farm Boundary Mapping

The application allows experts to walk the perimeter of a farm and capture multiple GPS points, verifying the actual size and location for accurate soil analysis.

The expert starts the mapping feature at the farm location, capturing the anchor point. As the expert walks the perimeter, the app continuously captures GPS points and calculates the distance from the anchor. A 500-meter radius constraint ensures the expert stays within the intended farm area.

```dart
class FarmBoundaryService {
  static const double _maxBoundaryDistanceMeters = 500.0;
  static Future<List<LatLng>> captureBoundaryPoints({
    required Function(int) onPointCaptured,
    required Function(String) onError,
  }) async {
    // Implementation captures GPS points while validating distance from anchor
  }
}
```

### 5.2 Offline Capability

Given that field experts often work in rural areas with poor or non-existent internet connectivity, the app is designed to work offline using **Hive** to queue unsent soil forms locally.

When the expert submits a soil form offline, the data is saved to a Hive box with a `isSynced` flag set to false. The sync service periodically checks for unsynced forms and attempts to upload them. The sync system is **FIFO (First-In, First-Out)**. If a network error occurs, it stops immediately to prevent older data from being overwritten.

```dart
class SyncService {
  static Future<int> syncPendingForms() async {
    final box = await Hive.openBox<OfflineSoilForm>('soil_forms');
    final unsynced = box.values.where((f) => !f.isSynced).toList();
    for (final form in unsynced) {
      try {
        await ApiService.post('/api/logs', data: _buildPayload(form));
        await _markAsSynced(form);
      } on DioException catch (e) {
        if (e.response?.statusCode == 422) { await _markAsSynced(form); } else { break; }
      }
    }
    return syncedCount;
  }
}
```

### 5.3 Connectivity Monitoring

The app monitors network connectivity and triggers automatic synchronization when the device comes online, ensuring offline data is uploaded without manual intervention.

```dart
class ConnectivityService {
  static void init() {
    Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) _syncPendingForms();
    });
  }
}
```

---

## 6. User Interface and Navigation

### 6.1 Expert Dashboard

The dashboard is designed to be a high-level command center. It dynamically filters out already completed or inactive tickets to show only the most urgent tasks that require the expert's immediate attention. The dashboard displays pending and dispatched tickets that have not yet been submitted by the expert.

### 6.2 Ticket Cards

The ticket cards are stateful and dynamically load farmer details via an API call. This asynchronous loading allows the UI to be populated with the most current farmer information without requiring a full page refresh or blocking the main thread.

### 6.3 Bottom Navigation

The bottom navigation bar provides quick access to the main sections of the app: Home, Tickets, Forms, and Profile. The active tab is highlighted, and navigation between screens is handled by the router.

---

## 7. Installation and Configuration

### 7.1 Prerequisites

| Tool           | Version | Purpose                      |
| -------------- | ------- | ---------------------------- |
| Flutter SDK    | 3.16+   | Cross-platform framework     |
| Dart SDK       | 3.2+    | Programming language         |
| Android Studio | Latest  | Android development          |
| Xcode          | Latest  | iOS development (macOS only) |
| Git            | Latest  | Version control              |

### 7.2 Setup Instructions

1. Clone the repository:

```bash
git clone https://github.com/your-org/auditerra.git
cd auditerra/mobile
```

2. Install dependencies:

```bash
flutter pub get
```

3. Configure environment variables using `--dart-define` flags:

```bash
flutter run --dart-define=API_BASE_URL=https://api.auditerra.ke --dart-define=API_KEY=your_secure_waf_api_key
```

4. Run the app:

```bash
flutter run
```

5. Build for production:

```bash
flutter build apk --release  # Android
flutter build ios --release  # iOS (requires macOS)
```

### 7.3 Environment Variables

| Variable       | Purpose                    |
| -------------- | -------------------------- |
| `API_BASE_URL` | Backend API URL            |
| `API_KEY`      | API key for WAF validation |

---

## 8. Troubleshooting

### Common Issues and Solutions

| Issue                            | Cause                                | Solution                                      |
| -------------------------------- | ------------------------------------ | --------------------------------------------- |
| **App not loading offline**      | Hive storage not initialized         | Initialize Hive in main.dart                  |
| **Geolocation not working**      | Permission denied                    | Check device location permissions             |
| **Handshake verification fails** | Invalid code entered                 | Ensure correct 4-digit code; check expiration |
| **Images not uploading**         | Magic byte verification fails        | Ensure file is valid JPEG/PNG                 |
| **Sync not triggering**          | Connectivity service not initialized | Ensure ConnectivityService.init() is called   |
| **Build fails**                  | Missing dependencies                 | Run `flutter pub get` and `flutter clean`     |

---

## 9. Conclusion

The Auditerra mobile application is a robust, security-focused, and offline-capable Flutter application tailored for the specific needs of the Kenyan agricultural sector. By leveraging GPS verification, Magic Byte image scans, and HMAC webhook validation, it significantly mitigates data fraud while ensuring smooth field operations. The architecture supports reliable data collection even in the most remote conditions.

The offline-first approach ensures that field experts can continue working without internet connectivity, storing data locally in Hive and synchronizing automatically when connectivity is restored. Security measures including handshake verification, magic byte image validation, and HMAC-SHA256 webhook validation prevent fraudulent entries and ensure data integrity.
