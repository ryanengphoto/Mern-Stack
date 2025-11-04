// lib/services/auth_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';

class AuthService {
  Future<(String, Map<String, dynamic>)> login(
      String email, String password) async {
    final url = Uri.parse('$apiBaseUrl/api/auth/login');

    final resp = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (resp.statusCode != 200) {
      final body = jsonDecode(resp.body);
      throw Exception(body['error'] ?? 'Failed to login');
    }

    final data = jsonDecode(resp.body);
    final token = data['token'] as String;
    final user = data['user'] as Map<String, dynamic>;
    return (token, user);
  }

  Future<void> register(
      {required String name,
      required String email,
      required String password,
      String? phone}) async {
    final url = Uri.parse('$apiBaseUrl/api/auth/register');

    final resp = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'email': email,
        'password': password,
        'phone': phone,
      }),
    );

    if (resp.statusCode != 201) {
      final body = jsonDecode(resp.body);
      throw Exception(body['error'] ?? 'Failed to register');
    }
    // On success the backend sends a message to check email.
  }
}
