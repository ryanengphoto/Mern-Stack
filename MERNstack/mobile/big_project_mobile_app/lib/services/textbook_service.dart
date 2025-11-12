// lib/services/textbook_service.dart

import 'dart:convert';
import 'package:http/http.dart' as http;
import '../api_config.dart';
import 'auth_service.dart';

class Textbook {
  final String id;
  final String title;
  final String author;
  final double price;
  final String condition;
  final List<String> images;
  final String? buyer; // null if unsold

  Textbook({
    required this.id,
    required this.title,
    required this.author,
    required this.price,
    required this.condition,
    required this.images,
    this.buyer,
  });

  factory Textbook.fromJson(Map<String, dynamic> json) {
    final rawImages = json['images'];
    List<String> images = [];
    if (rawImages is List) {
      images = rawImages.map((e) => e.toString()).toList();
    } else if (rawImages is String) {
      images = [rawImages];
    }

    return Textbook(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      author: (json['author'] ?? 'Unknown Author').toString(),
      price: (json['price'] ?? 0).toDouble(),
      condition: (json['condition'] ?? 'used').toString(),
      images: images,
      buyer: json['buyer']?.toString(),
    );
  }
}

class TextbookService {
  /// Get all textbooks, then filter out those that already have a buyer.
  Future<List<Textbook>> getAllTextbooks() async {
    final uri = Uri.parse('$apiBaseUrl/api/textbooks/all');

    final res = await http.post(
      uri,
      headers: {'Content-Type': 'application/json'},
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final list = data['textbooks'] as List<dynamic>;
      final allBooks = list.map((e) => Textbook.fromJson(e)).toList();

      // Hide purchased books on the mobile side
      return allBooks
          .where((b) => b.buyer == null || b.buyer!.isEmpty)
          .toList();
    } else {
      throw Exception('Failed to load textbooks (code ${res.statusCode})');
    }
  }

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
      final allBooks = list.map((e) => Textbook.fromJson(e)).toList();

      // Same filter: hide purchased
      return allBooks
          .where((b) => b.buyer == null || b.buyer!.isEmpty)
          .toList();
    } else {
      throw Exception('Failed to search textbooks (code ${res.statusCode})');
    }
  }

  /// Use existing /api/textbooks/purchase route (no backend change).
  Future<Map<String, dynamic>> purchaseTextbook(
    String id,
    String shippingAddress,
  ) async {
    if (AuthService.authToken == null) {
      return {'success': false, 'message': 'You must be logged in to buy'};
    }

    final uri = Uri.parse('$apiBaseUrl/api/textbooks/purchase');

    final res = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AuthService.authToken}',
      },
      // Backend only uses "id"; shippingAddress is extra and safely ignored.
      body: jsonEncode({'id': id, 'shippingAddress': shippingAddress}),
    );

    if (res.statusCode == 200) {
      return {'success': true};
    } else {
      final data = jsonDecode(res.body);
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to purchase',
      };
    }
  }

  /// Create a new textbook listing for the signed-in user.
  /// Matches backend /api/textbooks/add:
  /// { title, author, isbn, price, condition, description, images }
  Future<Map<String, dynamic>> addTextbook({
    required String title,
    required String author,
    required String isbn,
    required double price,
    required String condition,
    required String description,
    required String imageUrl,
  }) async {
    if (AuthService.authToken == null) {
      return {'success': false, 'message': 'You must be logged in to sell'};
    }

    final uri = Uri.parse('$apiBaseUrl/api/textbooks/add');

    final body = {
      'title': title,
      'author': author,
      'isbn': isbn,
      'price': price,
      'condition': condition,
      'description': description,
      // backend expects array of image URLs
      'images': imageUrl.trim().isEmpty ? [] : [imageUrl.trim()],
    };

    final res = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AuthService.authToken}',
      },
      body: jsonEncode(body),
    );

    if (res.statusCode == 201) {
      final data = jsonDecode(res.body);
      return {
        'success': true,
        'textbook': data,
      };
    } else {
      final data = jsonDecode(res.body);
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to create textbook',
      };
    }
  }
}
