import 'package:flutter/material.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const PapyrusApp());
}

class PapyrusApp extends StatefulWidget {
  const PapyrusApp({super.key});

  @override
  State<PapyrusApp> createState() => _PapyrusAppState();
}

class _PapyrusAppState extends State<PapyrusApp> {
  String? _token;
  Map<String, dynamic>? _user;

  void _onLoginSuccess(String token, Map<String, dynamic> user) {
    setState(() {
      _token = token;
      _user = user;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Papyrus',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF8B2E3D),
        ).copyWith(
          surface: const Color(0xFFF5EFD8),
        ),
        scaffoldBackgroundColor: const Color(0xFFF5EFD8),
      ),

      home: _token == null
          ? LoginScreen(onLoginSuccess: _onLoginSuccess)
          : HomeScreen(token: _token!, user: _user),
    );
  }
}
