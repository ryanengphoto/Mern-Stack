// lib/services/textbook_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';

class Textbook {
  final String id;
  final String title;
  final String? author;
  final String? isbn;
  final num? price;

  Textbook({
    required this.id,
    required this.title,
    this.author,
    this.isbn,
    this.price,
  });

  factory Textbook.fromJson(Map<String, dynamic> json) {
    return Textbook(
      id: json['id'] as String,
      title: json['title'] as String,
      author: json['author'] as String?,
      isbn: json['isbn'] as String?,
      price: json['price'],
    );
  }
}

class TextbookService {
  Future<List<Textbook>> search(String query) async {
    final url = Uri.parse('$apiBaseUrl/api/textbooks/search');

    final resp = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'search': query}),
    );

    if (resp.statusCode != 200) {
      throw Exception('Search failed: ${resp.statusCode}');
    }

    final data = jsonDecode(resp.body);
    final List results = data['results'] as List;
    return results.map((j) => Textbook.fromJson(j)).toList();
  }
}
