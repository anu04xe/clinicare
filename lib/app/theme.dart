import 'package:flutter/material.dart';

abstract final class AppTheme {
  static const _background = Color(0xFFF4F5F6);
  static const _surface = Colors.white;
  static const _textPrimary = Color(0xFF111827);
  static const _accent = Color(0xFF0F766E);

  static ThemeData light() {
    const textTheme = TextTheme(
      headlineLarge: TextStyle(
        fontSize: 28,
        height: 1.2,
        fontWeight: FontWeight.w600,
        color: _textPrimary,
      ),
      headlineMedium: TextStyle(
        fontSize: 22,
        height: 1.3,
        fontWeight: FontWeight.w600,
        color: _textPrimary,
      ),
      bodyLarge: TextStyle(
        fontSize: 16,
        height: 1.4,
        fontWeight: FontWeight.w500,
        color: _textPrimary,
      ),
      bodyMedium: TextStyle(
        fontSize: 14,
        height: 1.4,
        color: _textPrimary,
      ),
      bodySmall: TextStyle(
        fontSize: 12,
        height: 1.4,
        color: Color(0xFF4B5563),
      ),
    );

    final colorScheme = const ColorScheme.light(
      surface: _surface,
      onSurface: _textPrimary,
      primary: _accent,
      onPrimary: Colors.white,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      scaffoldBackgroundColor: _background,
      visualDensity: VisualDensity.compact,
      materialTapTargetSize: MaterialTapTargetSize.padded,
      textTheme: textTheme,
      appBarTheme: const AppBarTheme(
        centerTitle: false,
        elevation: 0,
        backgroundColor: _surface,
        foregroundColor: _textPrimary,
      ),
      cardTheme: CardThemeData(
        color: _surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Color(0xFFE5E7EB)),
        ),
        margin: EdgeInsets.zero,
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: Color(0xFFD1D5DB)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: _accent, width: 1.5),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      ),
      listTileTheme: const ListTileThemeData(
        shape: RoundedRectangleBorder(
          side: BorderSide(color: Color(0xFFE5E7EB)),
          borderRadius: BorderRadius.all(Radius.circular(8)),
        ),
      ),
      fontFamilyFallback: const ['Inter', 'Roboto', 'Arial'],
    );
  }
}
