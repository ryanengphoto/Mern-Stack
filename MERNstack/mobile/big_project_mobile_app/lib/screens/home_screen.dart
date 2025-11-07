// lib/screens/home_screen.dart
import 'package:flutter/material.dart';
import '../services/textbook_service.dart';

class HomeScreen extends StatefulWidget {
  final String token;
  final Map<String, dynamic>? user;

  const HomeScreen({super.key, required this.token, this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _service = TextbookService();
  final _searchCtrl = TextEditingController();
  bool _isLoading = false;
  List<Textbook> _results = [];
  String? _error;

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _doSearch() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final res = await _service.search(_searchCtrl.text.trim());
      setState(() => _results = res);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final userName = widget.user?['name'] ?? 'Student';

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Row(
          children: [
            const Icon(Icons.menu_book_rounded),
            const SizedBox(width: 8),
            const Text('Papyrus'),
            const SizedBox(width: 16),
            Expanded(
              child: SizedBox(
                height: 40,
                child: TextField(
                  controller: _searchCtrl,
                  onSubmitted: (_) => _doSearch(),
                  decoration: InputDecoration(
                    hintText: 'Search for textbooks...',
                    filled: true,
                    contentPadding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    suffixIcon: IconButton(
                      icon: const Icon(Icons.search),
                      onPressed: _doSearch,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(999),
                      borderSide: BorderSide.none,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined),
            onPressed: () {},
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: Center(
              child: Text(
                'Hi, $userName',
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Text(
              'Find Your Textbooks at Student Prices',
              style: Theme.of(context)
                  .textTheme
                  .titleLarge
                  ?.copyWith(fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            const Text(
              'Buy and sell college textbooks directly with other students. '
              'Save money and help the environment.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            if (_isLoading) const LinearProgressIndicator(),
            const SizedBox(height: 8),
            if (_error != null)
              Text(
                _error!,
                style: const TextStyle(color: Colors.red),
              ),
            const SizedBox(height: 8),
            Expanded(
              child: _results.isEmpty && !_isLoading
                  ? const Center(
                      child: Text('No textbooks found matching your search.'),
                    )
                  : ListView.builder(
                      itemCount: _results.length,
                      itemBuilder: (ctx, i) {
                        final b = _results[i];
                        return Card(
                          child: ListTile(
                            title: Text(b.title),
                            subtitle: Text(
                              [
                                if (b.author != null && b.author!.isNotEmpty)
                                  b.author,
                                if (b.isbn != null && b.isbn!.isNotEmpty)
                                  'ISBN: ${b.isbn}',
                              ].whereType<String>().join(' • '),
                            ),
                            trailing: b.price != null
                                ? Text('\$${b.price}')
                                : null,
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
