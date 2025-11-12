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

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      authToken = data['token'];
      currentUser = data['user'];

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

  /// Adds $100 demo funds using /api/users/addBalance, then fetches /api/users/me.
  Future<Map<String, dynamic>> addDemoFunds() async {
    if (authToken == null) {
      return {
        'success': false,
        'message': 'You must be logged in to add funds',
      };
    }

    // 1) Add $100
    final addUri = Uri.parse('$apiBaseUrl/api/users/addBalance');
    final addRes = await http.post(
      addUri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );

    if (addRes.statusCode != 200) {
      final data = jsonDecode(addRes.body);
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to add funds',
      };
    }

    // 2) Fetch updated user (with new balance)
    final meUri = Uri.parse('$apiBaseUrl/api/users/me');
    final meRes = await http.post(
      meUri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $authToken',
      },
    );

    if (meRes.statusCode == 200) {
      final data = jsonDecode(meRes.body);
      final user = data['user'] as Map<String, dynamic>;
      currentUser = user;
      final rawBalance = user['balance'];
      final balance = (rawBalance is num) ? rawBalance.toDouble() : 0.0;

      return {
        'success': true,
        'balance': balance,
      };
    }

    // funds were added, but /me failed – still a success, just no exact balance
    return {'success': true};
  }
}
