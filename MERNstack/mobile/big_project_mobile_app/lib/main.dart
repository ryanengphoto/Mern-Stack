// lib/main.dart

import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const PapyrusApp());
}

class PapyrusApp extends StatelessWidget {
  const PapyrusApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Papyrus',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme:
            ColorScheme.fromSeed(seedColor: const Color(0xFFd2b48c)),
        useMaterial3: true,
        fontFamily: 'Roboto',
      ),
      home: const HomeScreen(),
      routes: {
        '/login': (_) => const LoginScreen(),
      },
    );
  }
}
