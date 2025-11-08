// lib/screens/home_screen.dart

import 'package:flutter/material.dart';
import '../services/textbook_service.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextbookService _textbookService = TextbookService();
  final TextEditingController _searchCtrl = TextEditingController();

  List<Textbook> _textbooks = [];
  bool _loading = true;
  String _error = '';
  String _selectedCategory = 'All';

  final List<String> _categories = const [
    'All',
    'Math',
    'Science',
    'Computer Science',
    'Engineering',
    'Business',
    'Literature',
  ];

  @override
  void initState() {
    super.initState();
    _loadTextbooks();
  }

  Future<void> _loadTextbooks() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final books = await _textbookService.getAllTextbooks();
      setState(() {
        _textbooks = books;
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

  Future<void> _searchBooks() async {
    final query = _searchCtrl.text.trim();
    if (query.isEmpty) {
      _loadTextbooks();
      return;
    }

    setState(() {
      _loading = true;
      _error = '';
    });

    try {
      final results = await _textbookService.searchTextbooks(query);
      setState(() {
        _textbooks = results;
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

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseBg = const Color(0xFFF0E6D9); // beige background

    return Scaffold(
      backgroundColor: baseBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF5E7D5),
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            const Icon(Icons.menu_book_outlined),
            const SizedBox(width: 8),
            const Text(
              'Papyrus',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 16),
            // Search box
            Expanded(
              child: TextField(
                controller: _searchCtrl,
                onSubmitted: (_) => _searchBooks(),
                decoration: InputDecoration(
                  hintText: 'Search for textbooks...',
                  prefixIcon: const Icon(Icons.search),
                  contentPadding: const EdgeInsets.symmetric(vertical: 0),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(24),
                    borderSide: BorderSide.none,
                  ),
                  filled: true,
                  fillColor: Colors.white,
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Cart',
            onPressed: () {
              // TODO: Cart screen
            },
            icon: const Icon(Icons.shopping_cart_outlined),
          ),
          TextButton(
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const LoginScreen()),
              );
              // After return you could refresh state if needed.
            },
            child: const Text('Sign In'),
          ),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: FilledButton(
              onPressed: () {
                // TODO: navigate to Sell Textbook flow
              },
              child: const Text('Sell Textbook'),
            ),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Categories row
          SizedBox(
            height: 48,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final selected = cat == _selectedCategory;
                return ChoiceChip(
                  label: Text(cat),
                  selected: selected,
                  onSelected: (_) {
                    setState(() {
                      _selectedCategory = cat;
                    });
                    // Right now this is just visual; you can hook
                    // this up to category-based filtering later.
                  },
                );
              },
              separatorBuilder: (_, __) => const SizedBox(width: 8),
              itemCount: _categories.length,
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
            child: Text(
              'Find Your Textbooks at Student Prices',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text('Error: $_error'))
                    : _textbooks.isEmpty
                        ? const Center(child: Text('No textbooks found.'))
                        : GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              childAspectRatio: 0.65,
                            ),
                            itemCount: _textbooks.length,
                            itemBuilder: (context, index) {
                              final book = _textbooks[index];
                              return _TextbookCard(book: book);
                            },
                          ),
          ),
        ],
      ),
    );
  }
}

class _TextbookCard extends StatelessWidget {
  final Textbook book;

  const _TextbookCard({required this.book});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          // TODO: Navigate to book details page
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image placeholder
            Expanded(
              child: Container(
                decoration: const BoxDecoration(
                  color: Color(0xFFE1D8CA),
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(16),
                  ),
                ),
                child: const Center(
                  child: Icon(Icons.image_outlined, size: 40),
                ),
              ),
            ),
            Padding(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    book.title,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    book.author,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    '\$${book.price.toStringAsFixed(2)}',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    book.condition[0].toUpperCase() +
                        book.condition.substring(1),
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
