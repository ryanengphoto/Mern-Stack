// lib/services/auth_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';

class AuthService {
  // Simple global store for demo purposes
  static String? authToken;
  static Map<String, dynamic>? currentUser;

  /// Logs in using /api/auth/login and stores token + user.
  Future<Map<String, dynamic>> login(String email, String password) async {
    final uri = Uri.parse('$apiBaseUrl/api/auth/login');

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = _safeJson(res.body);
    if (res.statusCode == 200) {
      authToken = data['token'];
      currentUser = data['user'];
      return {'success': true, 'token': data['token'], 'user': data['user']};
    } else {
      return {'success': false, 'message': data['error'] ?? 'Login failed'};
    }
  }

  /// Adds $100 demo funds using /api/users/addBalance, then fetches /api/users/me.
  Future<Map<String, dynamic>> addDemoFunds() async {
    if (authToken == null) {
      return {'success': false, 'message': 'You must be logged in to add funds'};
    }

    final addUri = Uri.parse('$apiBaseUrl/api/users/addBalance');
    final addRes = await http.post(
      addUri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );

    if (addRes.statusCode != 200) {
      final data = _safeJson(addRes.body);
      return {'success': false, 'message': data['error'] ?? 'Failed to add funds'};
    }

    final meUri = Uri.parse('$apiBaseUrl/api/users/me');
    final meRes = await http.post(
      meUri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );

    if (meRes.statusCode == 200) {
      final data = _safeJson(meRes.body);
      final user = (data['user'] as Map<String, dynamic>? ?? {});
      currentUser = user;
      final rawBalance = user['balance'];
      final balance = (rawBalance is num) ? rawBalance.toDouble() : 0.0;
      return {'success': true, 'balance': balance};
    }
    return {'success': true};
  }

  /// Registers a new user and stores token + user.
  /// Adjust the endpoint path if your backend uses '/api/auth/signup' instead.
  Future<Map<String, dynamic>> register({
    required String email,
    required String password,
    String? name,
  }) async {
    final uri = Uri.parse('$apiBaseUrl/api/auth/register'); // change to /signup if needed

    final body = {
      'email': email,
      'password': password,
      if (name != null && name.trim().isNotEmpty) 'name': name.trim(),
    };

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );

    final data = _safeJson(res.body);
    if (res.statusCode == 201 || res.statusCode == 200) {
      authToken = data['token'];
      currentUser = data['user'];
      return {'success': true, 'token': data['token'], 'user': data['user']};
    } else {
      return {'success': false, 'message': data['error'] ?? 'Registration failed'};
    }
  }

  Map<String, dynamic> _safeJson(String body) {
    try {
      final v = jsonDecode(body);
      return (v is Map<String, dynamic>) ? v : <String, dynamic>{};
    } catch (_) {
      return <String, dynamic>{};
    }
  }
}
