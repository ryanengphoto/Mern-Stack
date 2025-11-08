// lib/services/textbook_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';

class Textbook {
  final String id;
  final String title;
  final String author;
  final double price;
  final String condition;

  Textbook({
    required this.id,
    required this.title,
    required this.author,
    required this.price,
    required this.condition,
  });

  factory Textbook.fromJson(Map<String, dynamic> json) {
    return Textbook(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      author: (json['author'] ?? 'Unknown Author').toString(),
      price: (json['price'] ?? 0).toDouble(),
      condition: (json['condition'] ?? 'used').toString(),
    );
  }
}

class TextbookService {
  /// Gets all textbooks from /api/textbooks/all (no auth needed).
  Future<List<Textbook>> getAllTextbooks() async {
    final uri = Uri.parse('$apiBaseUrl/api/textbooks/all');

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final list = data['textbooks'] as List<dynamic>;
      return list.map((e) => Textbook.fromJson(e)).toList();
    } else {
      throw Exception('Failed to load textbooks (code ${res.statusCode})');
    }
  }

  /// Searches textbooks using /api/textbooks/search with {search: query}.
  Future<List<Textbook>> searchTextbooks(String query) async {
    final uri = Uri.parse('$apiBaseUrl/api/textbooks/search');

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'search': query}),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final list = data['results'] as List<dynamic>;
      return list.map((e) => Textbook.fromJson(e)).toList();
    } else {
      throw Exception('Failed to search textbooks (code ${res.statusCode})');
    }
  }
}
