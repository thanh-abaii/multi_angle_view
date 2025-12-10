# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-12-10

### 🎉 Initial Release

**NanoBanana Studio** officially launches version 1.0! This release brings a complete overhaul of the UI and introduces advanced camera control features powered by the Gemini 2.5 Flash Image model.

### 🚀 New Features

- **Split-Screen Layout**: Implemented a responsive 2-column layout (1/3 Control, 2/3 Results) optimized for desktop creative workflows.
- **Download All**: Added a batch download button to save all generated assets simultaneously with intelligent delay handling.
- **Expanded Camera Angles**:
  - Added *High Angle View* (replaces Top-Down).
  - Added *Low Angle View* (replaces Bottom-Up).
  - Added *Zoom In*, *Zoom Out*, and *Fisheye* lens effects.
- **Smart Regenerate**: Users can now regenerate specific failed or unsatisfactory angles without re-running the entire batch.
- **Detailed Error Reporting**: The UI now parses and displays specific API error messages (e.g., safety blocks, quota limits) directly on the affected grid card.

### 🎨 UI/UX Improvements

- **"Studio Pro" Theme**: 
  - Switched to a deep obsidian/midnight blue color palette (`bg-[#0B0F19]`).
  - Added decorative background glow effects.
  - Implemented glassmorphism (backdrop blur) on panels and overlays.
- **Interactive Upload Zone**: Redesigned the upload area with a technical "scanline" animation and "Drop Zone" aesthetic.
- **Card Design**: 
  - Removed bulky card footers in favor of hover-based overlays.
  - Added floating labels for cleaner visual presentation.
  - Improved loading states with specific "Rendering" indicators.

### 🔧 Technical

- Upgraded to React 19.
- Implemented `Promise.all` parallel requests for faster batch generation.
- Added custom CSS animations for gradients and scanning effects.
