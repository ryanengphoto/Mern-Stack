// lib/screens/home_screen.dart

import 'package:flutter/material.dart';
import '../services/textbook_service.dart';
import '../services/auth_service.dart';
import 'login_screen.dart';
import 'sell_textbook_screen.dart';
import 'your_listings_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final TextbookService _textbookService = TextbookService();
  final TextEditingController _searchCtrl = TextEditingController();
  final TextEditingController _addressCtrl = TextEditingController();

  List<Textbook> _textbooks = [];
  bool _loading = true;
  String _error = '';

  // Cart: holds textbook IDs
  final Set<String> _cart = {};
  bool _checkingOut = false;

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
      _selectedCategory = 'All';
      _loadTextbooks();
      return;
    }
    await _searchBooksWithQuery(query);
  }

  Future<void> _searchBooksWithQuery(String query) async {
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

  Future<void> _handleAddFunds() async {
    if (AuthService.authToken == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to add demo funds')),
      );
      return;
    }

    final authService = AuthService();
    final res = await authService.addDemoFunds();

    if (res['success'] == true) {
      final balance = res['balance'];
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            balance != null
                ? 'Demo funds added. New balance: \$${balance.toStringAsFixed(2)}'
                : 'Added \$100 demo funds',
          ),
        ),
      );
      setState(() {}); // refresh balance display
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(res['message'] ?? 'Failed to add funds'),
        ),
      );
    }
  }

  void _openCartDialog() {
    if (_cart.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Your cart is empty')),
      );
      return;
    }

    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (dialogContext, setInnerState) {
            final cartBooks =
                _textbooks.where((b) => _cart.contains(b.id)).toList();
            final total =
                cartBooks.fold<double>(0, (sum, b) => sum + b.price);

            return AlertDialog(
              title: const Text('Cart / Checkout'),
              content: SizedBox(
                width: double.maxFinite,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (cartBooks.isEmpty)
                      const Text('Your cart is empty.')
                    else ...[
                      SizedBox(
                        height: 220,
                        child: ListView.builder(
                          itemCount: cartBooks.length,
                          itemBuilder: (context, index) {
                            final book = cartBooks[index];
                            return ListTile(
                              leading: book.images.isNotEmpty
                                  ? ClipRRect(
                                      borderRadius: BorderRadius.circular(8),
                                      child: Image.network(
                                        book.images[0],
                                        width: 40,
                                        height: 40,
                                        fit: BoxFit.cover,
                                        errorBuilder: (_, __, ___) =>
                                            const Icon(Icons
                                                .image_not_supported_outlined),
                                      ),
                                    )
                                  : const Icon(
                                      Icons.menu_book_outlined,
                                    ),
                              title: Text(
                                book.title,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              subtitle: Text(
                                '\$${book.price.toStringAsFixed(2)} • ${book.author}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              trailing: IconButton(
                                tooltip: 'Remove from cart',
                                icon: const Icon(
                                  Icons.remove_circle_outline,
                                  color: Colors.redAccent,
                                ),
                                onPressed: () {
                                  // Update parent state (cart + cards)
                                  setState(() {
                                    _cart.remove(book.id);
                                  });
                                  // Rebuild dialog contents
                                  setInnerState(() {});
                                },
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Text(
                          'Total: \$${total.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    TextField(
                      controller: _addressCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Shipping address',
                        hintText: '123 University Ave, Dorm #123',
                      ),
                      maxLines: 2,
                    ),
                    if (_checkingOut)
                      const Padding(
                        padding: EdgeInsets.only(top: 8.0),
                        child: LinearProgressIndicator(),
                      ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed:
                      _checkingOut ? null : () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                FilledButton(
                  onPressed: (_checkingOut || _cart.isEmpty)
                      ? null
                      : () async => await _handleCheckout(),
                  child: const Text('Checkout'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _handleCheckout() async {
    if (AuthService.authToken == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to checkout')),
      );
      return;
    }

    final address = _addressCtrl.text.trim();
    if (address.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter a shipping address'),
        ),
      );
      return;
    }

    Navigator.of(context).pop(); // close dialog
    setState(() {
      _checkingOut = true;
    });

    try {
      final idsToBuy = List<String>.from(_cart);
      for (final id in idsToBuy) {
        final res =
            await _textbookService.purchaseTextbook(id, address);

        if (res['success'] != true) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                res['message'] ??
                    'Failed to purchase one or more items',
              ),
            ),
          );
          break;
        } else {
          _cart.remove(id);
        }
      }

      await _loadTextbooks();

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Order placed! Shipping to: $address')),
      );

      _addressCtrl.clear();
    } finally {
      if (mounted) {
        setState(() {
          _checkingOut = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    _addressCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final baseBg = const Color(0xFFF0E6D9); // beige-ish

    // compute balance if logged in
    double balance = 0.0;
    if (AuthService.currentUser != null) {
      final raw = AuthService.currentUser!['balance'];
      if (raw is num) {
        balance = raw.toDouble();
      }
    }

    return Scaffold(
      backgroundColor: baseBg,
      appBar: AppBar(
        backgroundColor: const Color(0xFFF5E7D5),
        elevation: 0,
        titleSpacing: 16,
        title: Row(
          children: [
            InkWell(
              onTap: () {
                // "Logo" goes back to home: clear filters & reload
                _searchCtrl.clear();
                setState(() {
                  _selectedCategory = 'All';
                });
                _loadTextbooks();
              },
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Icon(Icons.menu_book_outlined),
                  SizedBox(width: 8),
                  Text(
                    'Papyrus',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: TextField(
                controller: _searchCtrl,
                onSubmitted: (_) => _searchBooks(),
                decoration: InputDecoration(
                  hintText: 'Search for textbooks...',
                  prefixIcon: const Icon(Icons.search),
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 0),
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
          // Show current balance
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Center(
              child: Text(
                '\$${balance.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: Colors.black87,
                ),
              ),
            ),
          ),

          // Add $100 demo funds
          IconButton(
            tooltip: 'Add \$100 demo funds',
            onPressed: _handleAddFunds,
            icon: const Icon(Icons.attach_money),
          ),

          // Cart with badge
          Stack(
            alignment: Alignment.topRight,
            children: [
              IconButton(
                tooltip: 'Cart',
                onPressed: _openCartDialog,
                icon: const Icon(Icons.shopping_cart_outlined),
              ),
              if (_cart.isNotEmpty)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    constraints: const BoxConstraints(
                        minWidth: 16, minHeight: 16),
                    child: Text(
                      _cart.length.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),

          // Your Listings
          TextButton(
            onPressed: () async {
              if (AuthService.authToken == null) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Please sign in to view your listings'),
                  ),
                );
                return;
              }

              final changed = await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const YourListingsScreen(),
                ),
              );

              if (changed == true) {
                _loadTextbooks();
              }
            },
            child: const Text('Your Listings'),
          ),

          // Login button
          TextButton(
            onPressed: () async {
              await Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const LoginScreen(),
                ),
              );
              setState(() {}); // refresh balance and auth state
            },
            child: const Text('Sign In'),
          ),

          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(right: 12.0),
            child: FilledButton(
              onPressed: () async {
                if (AuthService.authToken == null) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content:
                          Text('Please sign in to list a textbook'),
                    ),
                  );
                  return;
                }

                final created = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => const SellTextbookScreen(),
                  ),
                );

                if (created == true) {
                  _loadTextbooks();
                }
              },
              child: const Text('Sell Textbook'),
            ),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Categories row (now functional)
          SizedBox(
            height: 48,
            child: ListView.separated(
              padding:
                  const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final selected = cat == _selectedCategory;
                return ChoiceChip(
                  label: Text(cat),
                  selected: selected,
                  onSelected: (_) async {
                    setState(() {
                      _selectedCategory = cat;
                    });

                    if (cat == 'All') {
                      _searchCtrl.clear();
                      await _loadTextbooks();
                    } else {
                      _searchCtrl.text = cat;
                      await _searchBooksWithQuery(cat);
                    }
                  },
                );
              },
              separatorBuilder: (_, __) =>
                  const SizedBox(width: 8),
              itemCount: _categories.length,
            ),
          ),
          const Padding(
            padding:
                EdgeInsets.symmetric(horizontal: 16.0, vertical: 8),
            child: Text(
              'Find Your Textbooks at Student Prices',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error.isNotEmpty
                    ? Center(child: Text('Error: $_error'))
                    : _textbooks.isEmpty
                        ? const Center(
                            child: Text('No textbooks found.'),
                          )
                        : GridView.builder(
                            padding: const EdgeInsets.all(16),
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              crossAxisSpacing: 16,
                              mainAxisSpacing: 16,
                              childAspectRatio: 0.70,
                            ),
                            itemCount: _textbooks.length,
                            itemBuilder: (context, index) {
                              final book = _textbooks[index];
                              final inCart = _cart.contains(book.id);
                              return _TextbookCard(
                                book: book,
                                inCart: inCart,
                                onToggleCart: () {
                                  setState(() {
                                    if (inCart) {
                                      _cart.remove(book.id);
                                    } else {
                                      _cart.add(book.id);
                                    }
                                  });
                                },
                              );
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
  final bool inCart;
  final VoidCallback onToggleCart;

  const _TextbookCard({
    required this.book,
    required this.inCart,
    required this.onToggleCart,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(16),
      elevation: 2,
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          // TODO: details page if you want
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(16),
                ),
                child: book.images.isNotEmpty
                    ? Image.network(
                        book.images[0],
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder:
                            (context, error, stackTrace) {
                          return Container(
                            color: const Color(0xFFE1D8CA),
                            child: const Center(
                              child: Icon(
                                Icons.image_not_supported_outlined,
                                size: 40,
                              ),
                            ),
                          );
                        },
                      )
                    : Container(
                        color: const Color(0xFFE1D8CA),
                        child: const Center(
                          child: Icon(
                            Icons.image_outlined,
                            size: 40,
                          ),
                        ),
                      ),
              ),
            ),
            // Info + Add to cart
            Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 12.0,
                vertical: 8,
              ),
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
                    book.condition.isNotEmpty
                        ? book.condition[0].toUpperCase() +
                            book.condition.substring(1)
                        : '',
                    style: const TextStyle(fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  SizedBox(
                    width: double.infinity,
                    child: OutlinedButton(
                      onPressed: onToggleCart,
                      child: Text(
                        inCart ? 'Remove from cart' : 'Add to cart',
                      ),
                    ),
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
