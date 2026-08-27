# Frontend Mobile (Flutter)

## 1. Overview

The Auditerra mobile application is a standalone **Flutter** application designed specifically for field agricultural experts in Kenya specializing in soil restoration. Unlike the web-based PWA, this is a native cross-platform application built with Flutter, providing superior performance, offline capabilities, and native device integration.

The application facilitates the connection between experts and farmers, enabling experts to manage their workflow effectively, capture accurate physical data, and generate valuable insights for the farmers they serve. It is designed to operate in remote areas with unreliable internet connectivity, making it an essential tool for field operations in Kenya's rural regions.

**Target Users:** Field Experts (primary)
**Platforms:** Android and iOS (via Flutter cross-platform compilation)
**Primary Use Case:** Soil diagnostic data collection in remote areas with unreliable internet
**Distribution:** Google Play Store and Apple App Store

The core functionalities of the app include:

- **View and manage assigned tickets** received from the central system.
- **Capture soil data and multi-point farm boundaries** using advanced GPS mapping.
- **Generate AI-powered soil diagnostic reports** based on the captured data.
- **Operate offline** by queuing data locally for later synchronization when connectivity returns.
- **Verify farmer identities** via handshake codes to prevent fraudulent entries and ensure physical field visits.
- **Capture and validate images** with magic byte verification to ensure data integrity.

---

## 2. System Architecture

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

### Mobile Interface Preview

![Preview of logo](/public/mobile.png)

### 2.3 Architecture Layers

The application follows a clean architecture pattern with clear separation of concerns:

**UI Layer (Screens):**

- Login Screen
- Home Screen
- Tickets Screen
- Soil Form Screen
- Profile Screen
- Reports Screen

**State Management (Providers):**

- Auth Provider (authentication state)
- Connectivity Provider (network status)
- Tickets Provider (ticket list and details)
- Forms Provider (soil form state)

**Business Logic (Services):**

- API Service (HTTP client with interceptors)
- Auth Service (login, logout, token management)
- Ticket Service (verification, submission)
- Sync Service (offline synchronization)
- Location Service (GPS and mapping)
- Webhook Validator (security validation)

**Data Layer (Models & Storage):**

- Ticket Model
- Soil Form Model
- User Model
- Soil Report Model
- Hive Storage (offline data)
- Shared Preferences (tokens, cache)
- Secure Storage (encryption keys)

**Platform Integrations:**

- GPS (geolocator)
- Camera (image_picker)
- Network (connectivity_plus)
- Secure Storage (flutter_secure_storage)

---

## 3. Core Architectural Components

### 3.1 Routing Configuration

The application uses `go_router` for navigation. The routing logic is dynamically bound to the user's authentication state. When the user logs in or out, the router automatically redirects them to the appropriate screens, preventing unauthorized access to protected areas.

The router listens to authentication state changes using a `refreshListenable`, which triggers a redirect when the auth state changes. This ensures that a successful login or logout immediately redirects the user to the correct screen, creating a smooth user experience.

**Implementation approach:** The router provider listens to the auth state using Riverpod's `ref.listen`. When the authentication status changes, the `refreshListenable` is updated, triggering a re-evaluation of the redirect logic. If the user is not authenticated and tries to access a protected route, they are redirected to the login screen. Conversely, if an authenticated user tries to access the login or signup screen, they are redirected to the home screen.

```dart
final routerProvider = Provider<GoRouter>((ref) {
  final listenable = ValueNotifier<AuthState>(ref.read(authProvider));
  ref.listen<AuthState>(authProvider, (_, next) {
    listenable.value = next;
  });

  return GoRouter(
    initialLocation: AppRoutes.login,
    refreshListenable: listenable,
    redirect: (context, state) {
      final authState = listenable.value;
      final isLoggedIn = authState.status == AuthStatus.authenticated;

      if (authState.status == AuthStatus.loading) return null;

      final isAuthRoute = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.signup;

      if (!isLoggedIn && !isAuthRoute) return AppRoutes.login;
      if (isLoggedIn && isAuthRoute) return AppRoutes.home;

      return null;
    },
    routes: [
      GoRoute(path: AppRoutes.login, builder: (c, s) => const LoginScreen()),
      GoRoute(path: AppRoutes.home, builder: (c, s) => const HomeScreen()),
      // ... other routes
    ],
  );
});
```

### 3.2 API Service Integration

The API service is the single point of contact for all backend requests. It is configured with **Security Interceptors** to automatically inject authentication tokens and API keys into request headers, eliminating the need to manually pass these credentials on every request. It also centralizes error handling, extracting meaningful error messages from API responses to display user-friendly error messages.

**How it was integrated:** The API service is initialized at application startup in the `main()` function. The `Dio` client is configured with base options including timeout settings and base URL. Three interceptors are added to handle different aspects of the request lifecycle:

1. **Request Interceptor:** Injects the Bearer token from secure storage into the Authorization header. Also injects the API key for WAF validation and enforces HTTPS in production environments.

2. **Response Interceptor:** Handles token refresh logic when a 401 response is received, automatically retrying the request after obtaining a new token.

3. **Error Interceptor:** Extracts meaningful error messages from API responses, parsing different error formats (detail, message, error fields) to display user-friendly error messages.

```dart
class ApiService {
  static final Dio _dio = Dio(BaseOptions(
    baseUrl: AppConstants.apiBaseUrl,
    connectTimeout: const Duration(seconds: 15),
    receiveTimeout: const Duration(seconds: 15),
  ));

  static const String _apiKey = String.fromEnvironment('API_KEY');

  static void init() {
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(AppConstants.tokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        if (_apiKey.isNotEmpty) {
          options.headers['x-api-key'] = _apiKey;
        }
        if (!kDebugMode && !options.baseUrl.startsWith('https')) {
          handler.reject(DioException(
            requestOptions: options,
            error: 'Insecure connection blocked in production',
          ));
          return;
        }
        handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          // Attempt token refresh
          final refreshSuccess = await _refreshToken();
          if (refreshSuccess) {
            // Retry the original request
            return handler.resolve(await _retryRequest(e.requestOptions));
          }
        }
        handler.next(DioException(
          requestOptions: e.requestOptions,
          response: e.response,
          type: e.type,
          error: _extractErrorMessage(e),
        ));
      },
    ));
  }
}
```

**Error extraction logic:** The `_extractErrorMessage` method handles various error response formats. If the response contains a list of validation errors (array format), it joins them into a single message. If the response contains a `detail`, `message`, or `error` field, it extracts that value. Otherwise, it returns a generic error message.

### 3.3 Auth Service Integration

The authentication service manages the complete authentication lifecycle, including login, logout, token storage, and token validation. Tokens are stored securely using `flutter_secure_storage`, which leverages platform-specific secure storage mechanisms (Keychain on iOS, Keystore on Android).

**How it was integrated:** The auth service is used by the login screen during the authentication flow. When the user submits their credentials, the login method sends a POST request to the `/auth/login` endpoint. On successful authentication, the access token is saved to both secure storage (for API requests) and shared preferences (for quick status checks). User data is also cached locally to avoid redundant API calls for profile information.

The service provides methods to check authentication status by decoding the JWT token and validating its expiration timestamp. Token expiration is checked by comparing the `exp` claim with the current time, ensuring that expired tokens are not used for API requests.

```dart
class AuthService {
  static Future<bool> login(String email, String password) async {
    try {
      final response = await ApiService.post('/auth/login', data: {
        'email': email,
        'password': password,
      });
      if (response.statusCode == 200) {
        final data = response.data;
        await _saveToken(data['access_token']);
        await _saveUser(data['user']);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  static Future<bool> isAuthenticated() async {
    final token = await getToken();
    if (token == null) return false;
    try {
      final decoded = JwtDecoder.decode(token);
      final exp = decoded['exp'];
      if (exp != null) {
        final expiry = DateTime.fromMillisecondsSinceEpoch(exp * 1000);
        return expiry.isAfter(DateTime.now());
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
```

### 3.4 Ticket Service Integration

The ticket service manages all ticket-related operations including fetching tickets, verifying handshake codes, and submitting soil forms. It integrates with both the API service for online operations and the sync service for offline operations.

**How it was integrated:** The ticket service is consumed by the home screen and ticket detail screens. When the expert loads the home screen, `getMyTickets` fetches the list of assigned tickets from the backend. Pending and dispatched tickets are filtered to show only active assignments.

For handshake verification, the service calls the backend endpoint that validates the 4-digit code. Successful verification unlocks the soil form for the ticket. If the verification fails, the user is prompted to try again.

```dart
class TicketService {
  static Future<List<Ticket>> getMyTickets(String staffId) async {
    final response = await ApiService.get('/ticket/staff/$staffId');
    return (response.data as List).map((t) => Ticket.fromJson(t)).toList();
  }

  static Future<void> verifyHandshake(String farmerId, String code) async {
    await ApiService.post(
      '/farmers/$farmerId/verify-handshake',
      data: {'code': code},
    );
  }
}
```

### 3.5 Sync Service Integration

The sync service manages offline data synchronization. When the expert is offline, soil forms are stored locally in Hive. When connectivity is restored, the service automatically synchronizes pending forms with the backend.

**How it was integrated:** The sync service is initialized in the `main()` function and runs continuously in the background. It listens to connectivity events using the `connectivity_plus` package. When the device comes online, it triggers synchronization of all unsynced forms.

The sync process follows a FIFO (First-In, First-Out) approach to maintain data integrity. If a network error occurs during synchronization, the process stops immediately to prevent older data from being overwritten by newer data. Invalid data (HTTP 422) is marked as synced to prevent infinite retry loops.

```dart
class SyncService {
  static Future<int> syncPendingForms() async {
    final box = await Hive.openBox<OfflineSoilForm>('soil_forms');
    final unsynced = box.values.where((form) => !form.isSynced).toList();
    int syncedCount = 0;

    for (final form in unsynced) {
      try {
        await ApiService.post('/api/logs', data: _buildPayload(form));
        await _markAsSynced(form);
        syncedCount++;
      } on DioException catch (e) {
        if (e.response?.statusCode == 422) {
          await _markAsSynced(form);
        } else {
          break; // Stop on network errors
        }
      }
    }
    return syncedCount;
  }
}
```

### 3.6 Connectivity Service Integration

The connectivity service monitors network status and triggers synchronization when connectivity is restored. It integrates with `connectivity_plus` to detect changes in network connectivity and provides a stream that other services can listen to.

**How it was integrated:** The connectivity service is initialized in the `main()` function. It listens to `onConnectivityChanged` events and updates a stream that other parts of the application can subscribe to. When the device comes online, it automatically triggers the sync service to synchronize pending forms.

```dart
class ConnectivityService {
  static final Connectivity _connectivity = Connectivity();
  static final StreamController<bool> _connectivityController =
      StreamController<bool>.broadcast();

  static Future<void> init() async {
    final result = await _connectivity.checkConnectivity();
    _isOnline = result != ConnectivityResult.none;

    _connectivity.onConnectivityChanged.listen((result) {
      final isOnline = result != ConnectivityResult.none;
      if (isOnline != _isOnline) {
        _isOnline = isOnline;
        _connectivityController.add(_isOnline);
        if (isOnline) {
          _syncPendingForms(); // Trigger sync when connectivity is restored
        }
      }
    });
  }
}
```

### 3.7 Geolocation Service Integration

The geolocation service captures GPS coordinates for farm boundary mapping. It integrates with the `geolocator` package to access device GPS hardware and provides methods for capturing single points or continuous boundary mapping.

**How it was integrated:** The geolocation service is used in the soil form screen. When the expert starts mapping a farm boundary, the service captures a starting anchor point. As the expert walks the perimeter, the service captures additional points, calculating the distance from the anchor to ensure the expert stays within a 500-meter radius.

```dart
class LocationService {
  static Future<Position?> getCurrentPosition() async {
    final hasPermission = await _checkPermission();
    if (!hasPermission) return null;
    try {
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
    } catch (e) {
      return null;
    }
  }

  static Future<List<LatLng>> captureBoundary({
    required Function(int) onPointCaptured,
    required Function(String) onError,
  }) async {
    // Implementation captures points with 500m radius validation
  }
}
```

---

## 4. Security and Integrity Measures

The application incorporates multiple layers of security to protect backend data and prevent fraudulent usage by field agents.

### 4.1 Ticket Verification (Handshake)

Before an expert can submit a soil form for a ticket, they must physically be at the farm and verify their presence using a **Handshake Code** provided by the farmer. This prevents field agents from marking tasks as complete without actually traveling to the location.

**How it works:** When a farmer reports an issue, the system generates a unique 4-digit code that is sent to the farmer via SMS. The expert must enter this code into the app while at the farm location. The backend validates the code against the stored hash and confirms the expert's physical presence. This mechanism effectively stops "ghost" submissions where an expert marks a ticket as done without physically visiting the farm.

```dart
class TicketService {
  static Future<void> verifyHandshake(String farmerId, String code) async {
    await ApiService.post(
      '/farmers/$farmerId/verify-handshake',
      data: {'code': code},
    );
  }
}
```

### 4.2 Image Integrity and Validation

The soil form uploads images. To prevent malicious files or spoofed extensions from being uploaded, the application implements **Magic Byte Verification**. This checks the actual binary header of the file to ensure it is a genuine image.

**How it works:** When an image is selected, the app reads the file bytes and checks the first few bytes against known image signatures. JPEG files start with `FF D8 FF`, and PNG files start with `89 50 4E 47 0D 0A 1A 0A`. If the bytes don't match these signatures, the file is rejected. This ensures the physical evidence (soil photo) is valid and cannot be easily falsified by simply renaming a text file to `.jpg`.

```dart
class ImageValidator {
  static bool verifyMagicBytes(Uint8List bytes) {
    if (bytes.length < 8) return false;
    final isJpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
    final isPng = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E &&
                  bytes[3] == 0x47 && bytes[4] == 0x0D && bytes[5] == 0x0A &&
                  bytes[6] == 0x1A && bytes[7] == 0x0A;
    return isJpeg || isPng;
  }
}
```

### 4.3 Webhook Security

The app is designed to receive webhooks (e.g., from Africa's Talking for SMS notifications). To validate that these requests are actually coming from trusted sources, it uses **HMAC-SHA256** signatures with constant-time comparison to prevent timing attacks.

**How it works:** When the server receives a webhook request, it computes the HMAC-SHA256 signature of the request body using a shared secret. It compares this computed signature with the signature provided in the request header. The comparison uses a constant-time algorithm to prevent timing attacks. This ensures that webhook requests are only processed if they originate from a trusted source.

```dart
class WebhookValidator {
  static bool validate({required String secret, required String body, required String? signature}) {
    if (signature == null || signature.isEmpty) return false;
    final expected = 'sha256=${_hmacSha256(secret, body)}';
    return _secureCompare(signature, expected);
  }

  static bool _secureCompare(String a, String b) {
    if (a.length != b.length) return false;
    var result = 0;
    for (var i = 0; i < a.length; i++) {
      result |= a.codeUnitAt(i) ^ b.codeUnitAt(i);
    }
    return result == 0;
  }
}
```

### 4.4 Secure Storage

Sensitive data such as encryption keys and authentication tokens are stored in `flutter_secure_storage`, which uses the platform's secure storage mechanisms (Keychain on iOS, Keystore on Android). This provides an additional layer of security beyond standard shared preferences.

**How it works:** `flutter_secure_storage` leverages the platform's secure storage APIs. On Android, it uses the Android Keystore system. On iOS, it uses the Keychain. This ensures that sensitive data is encrypted at rest and cannot be accessed by other applications or through file system inspection.

```dart
class SecureStorage {
  static final FlutterSecureStorage _storage = const FlutterSecureStorage();

  static Future<void> write(String key, String value) async {
    await _storage.write(key: key, value: value);
  }

  static Future<String?> read(String key) async {
    return await _storage.read(key: key);
  }
}
```

---

## 5. Advanced User Features

### 5.1 GPS Farm Boundary Mapping

The application goes beyond simple location pinning. It allows experts to walk the perimeter of a farm and capture multiple GPS points. This is critical to verify the actual size and location of the farm for accurate soil analysis.

**How it works:** The expert starts the mapping feature at the farm location. The app captures the starting anchor point. As the expert walks the perimeter, the app continuously captures GPS points and calculates the distance from the anchor. A constraint ensures the expert stays within a 500-meter radius of the starting point, maintaining data integrity. This physically forces the agent to stay within the intended farm area and prevents outlier data points.

```dart
class FarmBoundaryService {
  static const double _maxBoundaryDistanceMeters = 500.0;

  static Future<List<LatLng>> captureBoundaryPoints({
    required Function(int) onPointCaptured,
    required Function(String) onError,
  }) async {
    // Implementation captures GPS points while validating distance from anchor
    // Each point is validated to ensure it stays within 500m of the starting point
  }
}
```

### 5.2 Offline Capability

Given that field experts often work in rural areas with poor or non-existent internet connectivity, the app is designed to work offline. It uses **Hive** to queue unsent soil forms locally on the device.

**How it works:** When the expert submits a soil form offline, the data is saved to a Hive box with a `isSynced` flag set to false. The sync service periodically checks for unsynced forms and attempts to upload them. The sync system is **FIFO (First-In, First-Out)**. If a network error occurs during the sync process, it stops immediately to prevent older data from being overwritten by newer data. Invalid data (HTTP 422) is marked as synced to prevent infinite retry loops.

```dart
class SyncService {
  static Future<int> syncPendingForms() async {
    final box = await Hive.openBox<OfflineSoilForm>('soil_forms');
    final unsynced = box.values.where((form) => !form.isSynced).toList();

    for (final form in unsynced) {
      try {
        await ApiService.post('/api/logs', data: _buildPayload(form));
        await _markAsSynced(form);
      } on DioException catch (e) {
        if (e.response?.statusCode == 422) {
          await _markAsSynced(form);
        } else {
          break; // Stop on network errors
        }
      }
    }
    return syncedCount;
  }
}
```

### 5.3 Connectivity Monitoring

The app monitors network connectivity and triggers automatic synchronization when the device comes online. This ensures that offline data is uploaded as soon as connectivity is restored without requiring manual intervention from the user.

**How it works:** The connectivity service listens to `onConnectivityChanged` events. When the device comes online (connectivity changes from none to cellular or WiFi), it automatically triggers the sync service to synchronize pending forms. This seamless background sync ensures that field experts don't need to remember to manually sync their data when connectivity is restored.

```dart
class ConnectivityService {
  static Future<void> init() async {
    _connectivity.onConnectivityChanged.listen((result) {
      final isOnline = result != ConnectivityResult.none;
      if (isOnline) {
        _syncPendingForms(); // Trigger sync when connectivity is restored
      }
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

1.  **Clone the repository:**

```bash
git clone https://github.com/your-org/auditerra.git
cd auditerra/mobile
```

2.  **Install dependencies:**

```bash
flutter pub get
```

3.  **Configure environment variables:**

Create a `.env` file or use `--dart-define` flags:

```bash
flutter run --dart-define=API_BASE_URL=https://api.auditerra.ke \
             --dart-define=API_KEY=your_secure_waf_api_key
```

4.  **Run the app:**

```bash
flutter run
```

5.  **Build for production:**

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

---

## 10. Next Steps

- [Security](/security/overview): Explore how we implemented security
