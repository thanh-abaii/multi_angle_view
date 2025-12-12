# NanoBanana Studio

NanoBanana Studio is a high-performance web application that leverages Google's **Gemini 2.5 Flash Image** model to transform single static images into comprehensive multi-angle cinematic showcases. Designed for creative professionals, it generates consistent character or object views from various camera perspectives instantly.

![NanoBanana Studio Screenshot](image.jpg)

## ✨ Features

- **Multi-Angle Generation**: Upload one source image and automatically generate 8 distinct perspectives:
  - Front View
  - Left Side Profile
  - High Angle (Top-down)
  - Low Angle (Bottom-up)
  - Isometric View
  - Extreme Close-up (Zoom In)
  - Wide Angle (Zoom Out)
  - Fisheye Lens
- **Premium Studio UI**: A "Midnight/Obsidian" dark theme featuring glassmorphism, smooth CSS transitions, and high-quality interaction animations.
- **Split-Screen Dashboard**: Optimized 1/3 - 2/3 layout for efficient workflow on widescreen displays.
- **Smart Error Handling**: Displays specific API feedback directly on failed grid items with individual retry capabilities.
- **Batch Actions**: "Download All" functionality to save every generated angle with a single click.
- **Privacy First**: Client-side processing where possible; API keys are handled securely via environment variables.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS (with custom animations and backdrop filters)
- **AI Model**: Google Gemini 2.5 Flash Image (`gemini-2.5-flash-image`)
- **SDK**: `@google/genai`
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

You need a valid API Key from Google AI Studio with access to the `gemini-2.5-flash-image` model.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nanobanana-studio.git
   cd nanobanana-studio
   ```

2. **Set up Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   API_KEY=your_google_ai_studio_api_key_here
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run Development Server**
   ```bash
   npm start
   ```

## 🎮 Usage

1. **Upload**: Drag and drop your subject image into the "Control Center" drop zone on the left.
2. **Generate**: Click the "Generate Angles" button. The app will process requests in parallel.
3. **Review**: Watch as images appear in the grid on the right. Hover over any image to see details.
4. **Refine**: If an angle isn't perfect, click the "Regenerate" button on that specific card.
5. **Export**: Click "Download All" to save the entire set, or download individual images via the card overlay.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.