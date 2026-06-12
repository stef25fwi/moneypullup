class ImportedFeature {
  final String name;
  final String legacyPath;
  final String flutterTarget;
  final bool ported;

  const ImportedFeature({
    required this.name,
    required this.legacyPath,
    required this.flutterTarget,
    this.ported = false,
  });
}
