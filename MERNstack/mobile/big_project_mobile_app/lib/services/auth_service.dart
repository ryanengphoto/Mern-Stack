// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';

class AuthService {
  /// Logs in a user using the backend /api/auth/login endpoint.
  /// Returns:
  /// {
  ///   'success': bool,
  ///   'token': String?,   // when success
  ///   'user': Map?        // when success
  ///   'message': String?  // when error
  /// }
  Future<Map<String, dynamic>> login(String email, String password) async {
    final uri = Uri.parse('$apiBaseUrl/api/auth/login');

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      return {
        'success': true,
        'token': data['token'],
        'user': data['user'],
      };
    } else {
      final data = jsonDecode(res.body);
      return {
        'success': false,
        'message': data['error'] ?? 'Login failed',
      };
    }
  }
}
