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
  final String? buyer;
  final String? sellerId;
  final String? sellerName;

  Textbook({
    required this.id,
    required this.title,
    required this.author,
    required this.price,
    required this.condition,
    required this.images,
    this.buyer,
    this.sellerId,
    this.sellerName,
  });

  factory Textbook.fromJson(Map<String, dynamic> json) {
    // images may be array or string
    final rawImages = json['images'];
    List<String> images = [];
    if (rawImages is List) {
      images = rawImages.map((e) => e.toString()).toList();
    } else if (rawImages is String) {
      images = [rawImages];
    }

    // price might be int or double
    double price = 0;
    final rawPrice = json['price'];
    if (rawPrice is num) {
      price = rawPrice.toDouble();
    } else if (rawPrice is String) {
      price = double.tryParse(rawPrice) ?? 0;
    }

    // seller populated from backend: seller: { _id, name, email, phone }
    String? sellerId;
    String? sellerName;
    final seller = json['seller'];
    if (seller is Map<String, dynamic>) {
      sellerId = seller['_id']?.toString();
      sellerName = seller['name']?.toString();
    }

    return Textbook(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      author: (json['author'] ?? 'Unknown Author').toString(),
      price: price,
      condition: (json['condition'] ?? 'used').toString(),
      images: images,
      buyer: json['buyer']?.toString(),
      sellerId: sellerId,
      sellerName: sellerName,
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
      final list = (data['textbooks'] as List<dynamic>);
      final allBooks =
          list.map((e) => Textbook.fromJson(e as Map<String, dynamic>)).toList();

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
      final list = (data['results'] as List<dynamic>);
      final allBooks =
          list.map((e) => Textbook.fromJson(e as Map<String, dynamic>)).toList();

      return allBooks
          .where((b) => b.buyer == null || b.buyer!.isEmpty)
          .toList();
    } else {
      throw Exception('Failed to search textbooks (code ${res.statusCode})');
    }
  }

  /// Books for the currently logged in user (as seller).
  Future<List<Textbook>> getMyTextbooks() async {
    if (AuthService.currentUser == null) {
      throw Exception('Not signed in');
    }
    final user = AuthService.currentUser!;
    final userId =
        (user['_id'] ?? user['id'] ?? '').toString(); // be flexible about key

    final all = await getAllTextbooks();
    return all.where((b) => b.sellerId == userId).toList();
  }

  /// Use existing /api/textbooks/purchase route.
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
      body: jsonEncode({'id': id, 'shippingAddress': shippingAddress}),
    );

    if (res.statusCode == 200) {
      return {'success': true};
    } else {
      final data = _safeJson(res.body);
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to purchase',
      };
    }
  }

  /// Create a new textbook listing for the signed-in user.
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

    final data = _safeJson(res.body);

    if (res.statusCode == 201) {
      return {
        'success': true,
        'textbook': data['textbook'] ?? data,
      };
    } else {
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to create textbook',
      };
    }
  }

  /// Update an existing textbook listing owned by the current user.
  Future<Map<String, dynamic>> updateTextbook({
    required String id,
    required String title,
    required String author,
    required String isbn,
    required double price,
    required String condition,
    required String description,
    required String imageUrl,
  }) async {
    if (AuthService.authToken == null) {
      return {'success': false, 'message': 'You must be logged in to edit'};
    }

    final uri = Uri.parse('$apiBaseUrl/api/textbooks/update');

    final body = {
      'id': id,
      'title': title,
      'author': author,
      'isbn': isbn,
      'price': price,
      'condition': condition,
      'description': description,
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

    final data = _safeJson(res.body);

    if (res.statusCode == 200) {
      return {
        'success': true,
        'textbook': data['textbook'] ?? data,
      };
    } else {
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to update textbook',
      };
    }
  }

  /// Delete an existing textbook listing owned by the current user.
  Future<Map<String, dynamic>> deleteTextbook(String id) async {
    if (AuthService.authToken == null) {
      return {'success': false, 'message': 'You must be logged in to delete'};
    }

    final uri = Uri.parse('$apiBaseUrl/api/textbooks/delete');

    final res = await http.post(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${AuthService.authToken}',
      },
      body: jsonEncode({'id': id}),
    );

    final data = _safeJson(res.body);

    if (res.statusCode == 200) {
      return {'success': true};
    } else {
      return {
        'success': false,
        'message': data['error'] ?? 'Failed to delete textbook',
      };
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
