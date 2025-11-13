// lib/screens/your_listings_screen.dart

import 'package:flutter/material.dart';
import '../services/textbook_service.dart';
import '../services/auth_service.dart';
import 'sell_textbook_screen.dart';
import 'login_screen.dart';

class YourListingsScreen extends StatefulWidget {
  const YourListingsScreen({super.key});

  @override
  State<YourListingsScreen> createState() => _YourListingsScreenState();
}

class _YourListingsScreenState extends State<YourListingsScreen> {
  final TextbookService _textbookService = TextbookService();
  List<Textbook> _myBooks = [];
  bool _loading = true;
  String _error = '';

  @override
  void initState() {
    super.initState();
    _loadMyBooks();
  }

  Future<void> _loadMyBooks() async {
    if (AuthService.authToken == null) {
      setState(() {
        _loading = false;
        _error = 'You must be signed in to view your listings.';
      });
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final books = await _textbookService.getMyTextbooks();
      setState(() {
        _myBooks = books;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _deleteBook(Textbook book) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Listing'),
        content: Text('Are you sure you want to delete "${book.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    final res = await _textbookService.deleteTextbook(book.id);
    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Listing deleted')),
      );
      _loadMyBooks();
      Navigator.pop(context, true); // tell caller something changed
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res['message'] ?? 'Failed to delete listing')),
      );
    }
  }

  Future<void> _editBook(Textbook book) async {
    final changed = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SellTextbookScreen(existingBook: book),
      ),
    );

    if (changed == true) {
      _loadMyBooks();
      Navigator.pop(context, true); // notify previous screen
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = AuthService.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Listings'),
        actions: [
          if (AuthService.authToken == null)
            TextButton(
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
                _loadMyBooks();
              },
              child: const Text('Sign In'),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error.isNotEmpty
              ? Center(child: Text(_error))
              : _myBooks.isEmpty
                  ? Center(
                      child: Text(
                        user == null
                            ? 'Sign in to see your textbook listings.'
                            : 'You haven\'t listed any textbooks yet.',
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _myBooks.length,
                      itemBuilder: (context, index) {
                        final book = _myBooks[index];
                        return Card(
                          margin: const EdgeInsets.only(bottom: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: ListTile(
                            leading: book.images.isNotEmpty
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(8),
                                    child: Image.network(
                                      book.images[0],
                                      width: 50,
                                      height: 50,
                                      fit: BoxFit.cover,
                                      errorBuilder: (_, __, ___) =>
                                          const Icon(Icons.image_not_supported),
                                    ),
                                  )
                                : const Icon(Icons.menu_book_outlined),
                            title: Text(book.title),
                            subtitle: Text(
                                '${book.author} • \$${book.price.toStringAsFixed(2)} • ${book.condition}'),
                            trailing: Wrap(
                              spacing: 8,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.edit),
                                  tooltip: 'Edit',
                                  onPressed: () => _editBook(book),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete_outline),
                                  tooltip: 'Delete',
                                  onPressed: () => _deleteBook(book),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
