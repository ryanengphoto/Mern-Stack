// lib/screens/login_screen.dart

import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final AuthService _authService = AuthService();

  final TextEditingController _emailCtrl = TextEditingController();
  final TextEditingController _passwordCtrl = TextEditingController();
  final TextEditingController _nameCtrl = TextEditingController();

  bool _loading = false;
  String _error = '';
  bool _isSignup = false;

  Future<void> _handleSubmit() async {
    setState(() {
      _loading = true;
      _error = '';
    });

    Map<String, dynamic> res;
    if (_isSignup) {
      res = await _authService.register(
        email: _emailCtrl.text.trim(),
        password: _passwordCtrl.text,
        name: _nameCtrl.text.trim().isEmpty ? null : _nameCtrl.text.trim(),
      );
    } else {
      res = await _authService.login(
        _emailCtrl.text.trim(),
        _passwordCtrl.text,
      );
    }

    setState(() => _loading = false);

    if (res['success'] == true) {
      Navigator.pop(context, res); // go back to home
    } else {
      setState(() {
        _error = res['message'] ?? (_isSignup ? 'Registration failed' : 'Login failed');
      });
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    _nameCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final title = _isSignup ? 'Create Account' : 'Sign In';
    final action = _isSignup ? 'Create Account' : 'Sign In';

    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Toggle
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ChoiceChip(
                  label: const Text('Sign In'),
                  selected: !_isSignup,
                  onSelected: (v) => setState(() => _isSignup = false),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: const Text('Create Account'),
                  selected: _isSignup,
                  onSelected: (v) => setState(() => _isSignup = true),
                ),
              ],
            ),
            const SizedBox(height: 16),

            if (_error.isNotEmpty)
              Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: Text(_error, style: const TextStyle(color: Colors.red)),
              ),

            if (_isSignup)
              TextField(
                controller: _nameCtrl,
                decoration: const InputDecoration(labelText: 'Name (optional)'),
              ),

            const SizedBox(height: 12),
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _passwordCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Password'),
            ),

            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: _loading ? null : _handleSubmit,
                child: _loading
                    ? const SizedBox(
                        height: 18, width: 18, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(action),
              ),
            ),

            const SizedBox(height: 12),
            TextButton(
              onPressed: () => setState(() => _isSignup = !_isSignup),
              child: Text(_isSignup
                  ? 'Already have an account? Sign In'
                  : 'New here? Create an account'),
            ),
          ],
        ),
      ),
    );
  }
}
