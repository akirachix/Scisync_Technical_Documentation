# Auditerra Mobile Application

## 1. Overview

The Auditerra mobile application is designed for field agricultural experts in Kenya specializing in soil restoration. It facilitates the connection between experts and farmers, enabling experts to manage their workflow effectively, capture accurate physical data, and generate valuable insights for the farmers they serve.

The core functionalities of the app include:

- **View and manage assigned tickets** received from the central system.
- **Capture soil data and multi-point farm boundaries** using advanced GPS mapping.
- **Generate AI-powered soil diagnostic reports** based on the captured data.
- **Operate offline** by queuing data locally for later synchronization when connectivity returns.
- **Verify farmer identities** via handshake codes to prevent fraudulent entries and ensure physical field visits.

This document provides a comprehensive look at the architecture, internal code structure, security mechanisms, and user-facing functionalities of the system.

---

## 2. System Architecture

### 2.1 Tech Stack

The application is built using **Flutter**, a cross-platform framework, which allows the app to run seamlessly on both Android and iOS. It utilizes a modern, reactive state management approach with the following core components:

- **State Management:** `flutter_riverpod` is used for reactive state management, ensuring that the UI always reflects the latest backend data.
- **Routing:** `go_router` handles declarative, path-based navigation, making it easy to manage complex navigation flows and deep linking.
- **Networking:** `dio` is the chosen HTTP client, configured with a robust interceptor architecture to handle authentication and error parsing cleanly.
- **Data Storage:** `shared_preferences` handles simple key-value data such as authentication tokens and user profile cache, while `hive` is utilized for structured offline data storage (soil forms).
- **Geolocation & Mapping:** `geolocator` and `flutter_map` are integrated for precise GPS data retrieval and visual farm boundary mapping.
- **Security:** `crypto` facilitates HMAC signature verification for webhooks, and `flutter_secure_storage` is used to safely store sensitive encryption keys.
- **Dependencies:** `image_picker`, `connectivity_plus`, and `jwt_decoder` round out the other essential functionalities.

### 2.2 Project Structure

To ensure maintainability and scalability, the codebase is strictly organized by layers, separating concerns between UI, business logic, and data models.

```text
lib/
├── config/                 # Constants & Routes
│   ├── constants.dart
│   └── routes.dart
├── models/                 # Data models
│   ├── ticket.dart
│   ├── soil_form.dart
│   ├── user.dart
│   └── soil_report.dart
├── providers/              # Riverpod State Providers
│   ├── auth_provider.dart
│   └── connectivity_provider.dart
├── screens/                # UI Screens
│   ├── auth/               # Login, Signup, Reset Password
│   ├── expert/             # Home, Tickets, Profile, Soil Form
│   └── widgets/            # Bottom Navigation, Header
├── services/               # Business Logic & API handling
│   ├── api_service.dart    # Core HTTP client
│   ├── auth_service.dart   # Auth token management
│   └── ticket_service.dart # Ticket verification logic
└── main.dart               # Application entry point
```

---

## 3. Core Architectural Components

### 3.1 Routing Configuration (`app.dart` & `config/routes.dart`)

The application uses `go_router` for navigation. The routing logic is not static; it is dynamically bound to the user's authentication state. When the user logs in or out, the router automatically redirects them to the appropriate screens, preventing unauthorized access to protected areas.

```dart
final routerProvider = Provider<GoRouter>((ref) {
  // Listens to the auth state changes
  final listenable = ValueNotifier<AuthState>(ref.read(authProvider));
  ref.listen<AuthState>(authProvider, (_, next) {
    listenable.value = next;
  });

  return GoRouter(
    initialLocation: AppRoutes.login,
    refreshListenable: listenable, // Triggers redirect when auth state changes
    redirect: (context, state) {
      // Routing logic to prevent unauthorized access
      final authState = listenable.value;
      final isLoggedIn = authState.status == AuthStatus.authenticated;
      final isInitialOrLoading = authState.status == AuthStatus.initial ||
          authState.status == AuthStatus.loading;

      // If the app is loading, don't redirect yet.
      if (isInitialOrLoading) return null;

      final isAuthRoute = state.matchedLocation == AppRoutes.login ||
          state.matchedLocation == AppRoutes.signup;

      // If not logged in, force them to the login page.
      if (!isLoggedIn && !isAuthRoute) return AppRoutes.login;

      // If logged in, prevent them from going back to login/signup.
      if (isLoggedIn && isAuthRoute) return AppRoutes.home;

      return null;
    },
    routes: [
      GoRoute(path: AppRoutes.login, builder: (c, s) => const LoginScreen()),
      GoRoute(path: AppRoutes.tickets, builder: (c, s) => const TicketsScreen()),
      // ... other routes
    ],
  );
});
```

_Note:_ The `refreshListenable` ensures that a successful login or logout immediately triggers a navigation redirect, creating a smooth user experience.

### 3.2 API Service (`services/api_service.dart`)

This is the single point of contact for all backend requests. It is configured with **Security Interceptors** to automatically inject authentication tokens and API keys into the headers, saving the developer from having to manually pass these on every request. It also centralizes error handling.

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
        // 1. Inject Auth Token
        final prefs = await SharedPreferences.getInstance();
        final token = prefs.getString(AppConstants.tokenKey);
        if (token != null) options.headers['Authorization'] = 'Bearer $token';

        // 2. Inject API Key for WAF validation
        if (_apiKey.isNotEmpty) options.headers['x-api-key'] = _apiKey;

        // 3. Security: Enforce HTTPS in production
        if (!kDebugMode && !options.baseUrl.startsWith('https')) {
          handler.reject(DioException(
            requestOptions: options,
            error: 'Insecure connection blocked in production',
          ));
          return;
        }
        handler.next(options);
      },
      onError: (DioException e, handler) {
        // Robust error handling to extract meaningful messages
        // so the user sees a friendly error instead of raw exception codes.
        handler.next(DioException(
          requestOptions: e.requestOptions,
          response: e.response,
          type: e.type,
          error: _extractErrorMessage(e),
        ));
      },
    ));
  }
  // ...
}
```

_Explanation:_ By intercepting requests, the app guarantees that no request is sent out without the appropriate security credentials, and by intercepting errors, it ensures that API failures are communicated in a user-friendly way.

---

## 4. Security and Integrity Measures

The application incorporates multiple layers of security to protect backend data and prevent fraudulent usage by field agents.

### 4.1 Ticket Verification (Handshake)

Before an expert can submit a soil form for a ticket, they must physically be at the farm and verify their presence using a **Handshake Code** provided by the farmer. This prevents field agents from marking tasks as complete without actually traveling to the location.

**File:** `services/ticket_service.dart`

```dart
class TicketService {
  static Future<void> verifyHandshake(String farmerId, String code) async {
    await ApiService.post(
      '/farmers/$farmerId/verify-handshake?code=${Uri.encodeComponent(code)}',
      body: {},
    );
  }
  // ... verification logic to unlock the form
}
```

_Explanation:_ This mechanism effectively stops "ghost" submissions where an expert marks a ticket as done without physically visiting the farm. The dynamic one-time code ensures the expert and farmer are physically together before data can be submitted.

### 4.2 Image Integrity & Validation

The soil form uploads images. To prevent malicious files or spoofed extensions from being uploaded, the application implements **Magic Byte Verification**. This checks the actual binary header of the file to ensure it is a genuine image.

**File:** `screens/expert/soil_form_screen.dart`

```dart
bool _verifyMagicBytes(Uint8List bytes) {
  if (bytes.length < 8) return false;
  final isJpeg = bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF;
  final isPng = bytes[0] == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E &&
                bytes[3] == 0x47 && bytes[4] == 0x0D && bytes[5] == 0x0A &&
                bytes[6] == 0x1A && bytes[7] == 0x0A;
  return isJpeg || isPng;
}
```

_Explanation:_ This ensures the physical evidence (soil photo) is valid and cannot be easily falsified by simply renaming a text file to `.jpg`.

### 4.3 Webhook Security (`services/webhook_validator.dart`)

The app is designed to receive webhooks (e.g., from Africa's Talking for SMS notifications). To validate that these requests are actually coming from trusted sources, it uses **HMAC-SHA256** signatures.

```dart
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

  // Constant-time comparison to prevent timing attacks
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

_Explanation:_ The `_secureCompare` method ensures that the signature comparison is performed in constant time. This prevents attackers from exploiting timing differences in standard string comparison to guess the correct signature over many attempts.

---

## 5. Advanced User Features

### 5.1 GPS Farm Boundary Mapping

The application goes beyond simple location pinning. It utilizes `geolocator` to allow experts to walk the perimeter of a farm and capture multiple GPS points. This is critical to verify the actual size and location of the farm for accurate soil analysis.

**File:** `screens/expert/soil_form_screen.dart`

```dart
void _startMapping() {
  setState(() { _isMapping = true; _boundaryPoints.clear(); });
}

Future<void> _capturePoint() async {
  final pos = await LocationService.getCurrentPosition();
  if (pos == null || !mounted) return;

  // Distance calculation (Haversine) to ensure the expert stays within the farm bounds
  final distFromAnchor = _distanceMeters(
      _anchorLat!, _anchorLng!, pos.latitude, pos.longitude);

  if (distFromAnchor > _maxBoundaryDistanceMeters) {
    ScaffoldMessenger.of(context).showSnackBar(...); // Prevent outliers
    return;
  }
  // ... Add point to list
}
```

_Explanation:_ The `_maxBoundaryDistanceMeters = 500` constraint ensures that an expert does not capture points that are vastly outside the intended farm area, maintaining data integrity. It physically forces the agent to stay within a 500-meter radius of their starting point.

### 5.2 Offline Capability

Given that field experts often work in rural areas with poor or non-existent internet connectivity, the app is designed to work offline. It uses **Hive** to queue unsent soil forms locally on the device.

**File:** `models/soil_form.dart` & `services/sync_service.dart`

```dart
class OfflineSoilForm {
  // ... fields
  bool isSynced;
  // ...
}

class SyncService {
  static Future<int> syncPendingForms() async {
    final unsynced = DatabaseService.getUnsyncedForms();
    // ...
    for (final form in unsynced) {
      try {
        await ApiService.post('/api/logs', body: payload);
        if (form.id != null) await DatabaseService.markAsSynced(form.id!);
      } on DioException {
        break; // Stop syncing on network errors to preserve data order
      }
    }
  }
}
```

_Explanation:_ The system is **FIFO (First-In, First-Out)**. If a network error occurs during the sync process, it stops the sync operation immediately to prevent older data from being overwritten by newer data, ensuring data integrity when the connection is eventually restored.

---

## 6. User Interface & Navigation

### 6.1 Expert Dashboard (`screens/expert/home_screen.dart`)

The dashboard is designed to be a high-level command center. It dynamically filters out already completed or inactive tickets to show only the most urgent tasks that require the expert's immediate attention.

```dart
final tickets = await TicketService.getMyTickets(staffId);
final submittedIds = await TicketService.getSubmittedTicketIds();

final active = tickets.where((t) {
  final s = t.status.toLowerCase();
  return (s == 'pending' || s == 'dispatched') &&
      !submittedIds.contains(t.ticketId);
}).toList();
```

### 6.2 Dynamic Ticket Cards (`widgets/ticket_card.dart`)

The ticket cards are stateful and dynamically load farmer details (Name, Phone, Location) via an API call. This asynchronous loading allows the UI to be populated with the most current farmer information without requiring a full page refresh or blocking the main thread.

```dart
FutureBuilder<Map<String, dynamic>?>(
  future: _profileFuture,
  builder: (context, snapshot) {
    final farmer = snapshot.data;
    // ... Render UI based on farmer data
  },
)
```

---

## 7. Installation & Configuration

1.  **Clone the repository.**
2.  **Add API Keys:** Set environment variables to secure sensitive data:
    ```bash
    --dart-define=API_BASE_URL=https://your-api-url.com \
    --dart-define=API_KEY=your_secure_waf_api_key
    ```
    _Note:_ `API_KEY` is sourced from `String.fromEnvironment('API_KEY')` in `api_service.dart`.
3.  **Run the app:** `flutter run`.

---

## 8. Conclusion

The Auditerra application is a robust, security-focused, and offline-capable tool tailored for the specific needs of the Kenyan agricultural sector. By leveraging GPS verification, Magic Byte image scans, and HMAC webhook validation, it significantly mitigates data fraud while ensuring smooth field operations. The architecture supports reliable data collection even in the most remote conditions.
