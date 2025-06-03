# Plantae - React Plant Identification App

Plantae is a modern web application that uses Google's Gemini 2.0 Flash model to provide plant identification, health analysis, and plant care advice through a chatbot interface.

## Features

- **Plant Identification**: Upload an image to identify plant species with detailed information
- **Plant Health Analysis**: Detect plant health issues with solutions for common problems
- **Plant Chatbot**: Ask questions about plants, gardening, and care tips
- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop devices

## Technologies Used

- React with TypeScript
- Vite
- Tailwind CSS
- Framer Motion for animations
- Google Gemini 2.0 Flash API
- React Router for navigation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Google Gemini API key (get yours at https://ai.google.dev/)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/plantae.git
   ```

2. Navigate to the project directory:
   ```
   cd plantae
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Create a `.env` file in the root directory with your API keys:
   ```
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

5. Start the development server:
   ```
   npm run dev
   ```

6. Open your browser and visit `http://localhost:5173`

## Project Structure

- `/src` - Source code
  - `/components` - Reusable UI components
  - `/pages` - Main application pages
  - `/lib` - Utility functions, API clients
  - `/contexts` - React context providers
  - `/assets` - Static assets like images

## API Usage

This application uses the Google Gemini 2.0 Flash API for plant identification, analysis, and the chatbot. You'll need to obtain an API key from Google's AI Studio (https://ai.google.dev/).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Google for providing the Gemini API
- Icons from React Icons "# Plantae - Plant Identification and Health Analysis App" 
