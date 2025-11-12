// lib/screens/sell_textbook_screen.dart

import 'package:flutter/material.dart';
import '../services/textbook_service.dart';
import '../services/auth_service.dart';

class SellTextbookScreen extends StatefulWidget {
  const SellTextbookScreen({super.key});

  @override
  State<SellTextbookScreen> createState() => _SellTextbookScreenState();
}

class _SellTextbookScreenState extends State<SellTextbookScreen> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _titleCtrl = TextEditingController();
  final TextEditingController _authorCtrl = TextEditingController();
  final TextEditingController _isbnCtrl = TextEditingController();
  final TextEditingController _priceCtrl = TextEditingController();
  final TextEditingController _descriptionCtrl = TextEditingController();
  final TextEditingController _imageUrlCtrl = TextEditingController();

  final TextbookService _textbookService = TextbookService();

  String _condition = 'used'; // default
  bool _submitting = false;
  String _error = '';

  @override
  void dispose() {
    _titleCtrl.dispose();
    _authorCtrl.dispose();
    _isbnCtrl.dispose();
    _priceCtrl.dispose();
    _descriptionCtrl.dispose();
    _imageUrlCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (AuthService.authToken == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please sign in to sell a textbook')),
      );
      return;
    }

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _submitting = true;
      _error = '';
    });

    final price = double.tryParse(_priceCtrl.text.trim()) ?? 0.0;

    final res = await _textbookService.addTextbook(
      title: _titleCtrl.text.trim(),
      author: _authorCtrl.text.trim(),
      isbn: _isbnCtrl.text.trim(),
      price: price,
      condition: _condition,
      description: _descriptionCtrl.text.trim(),
      imageUrl: _imageUrlCtrl.text.trim(),
    );

    setState(() {
      _submitting = false;
    });

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Textbook listed successfully')),
      );
      Navigator.pop(context, true); // tell previous screen to refresh
    } else {
      setState(() {
        _error = res['message'] ?? 'Failed to list textbook';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sell a Textbook')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              if (_error.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12.0),
                  child: Text(
                    _error,
                    style: const TextStyle(color: Colors.red),
                  ),
                ),
              TextFormField(
                controller: _titleCtrl,
                decoration: const InputDecoration(
                  labelText: 'Title *',
                ),
                validator: (value) =>
                    (value == null || value.trim().isEmpty)
                        ? 'Title is required'
                        : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _authorCtrl,
                decoration: const InputDecoration(
                  labelText: 'Author',
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _isbnCtrl,
                decoration: const InputDecoration(
                  labelText: 'ISBN',
                ),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _priceCtrl,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Price (USD) *',
                ),
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Price is required';
                  }
                  final parsed = double.tryParse(value.trim());
                  if (parsed == null || parsed <= 0) {
                    return 'Enter a valid price > 0';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _condition,
                decoration: const InputDecoration(
                  labelText: 'Condition',
                ),
                items: const [
                  DropdownMenuItem(
                    value: 'new',
                    child: Text('New'),
                  ),
                  DropdownMenuItem(
                    value: 'like new',
                    child: Text('Like new'),
                  ),
                  DropdownMenuItem(
                    value: 'used',
                    child: Text('Used'),
                  ),
                  DropdownMenuItem(
                    value: 'very used',
                    child: Text('Very used'),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _condition = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionCtrl,
                decoration: const InputDecoration(
                  labelText: 'Description',
                ),
                maxLines: 3,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _imageUrlCtrl,
                decoration: const InputDecoration(
                  labelText: 'Image URL (Google image link)',
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _submitting ? null : _handleSubmit,
                  child: _submitting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('List Textbook'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
