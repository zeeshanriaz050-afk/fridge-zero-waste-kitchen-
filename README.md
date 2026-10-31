# Fridge-to-Plate 🥗🤖

A full-stack zero-waste kitchen assistant designed to help you minimize food waste, cut grocery expenses, and cook delicious meals using ingredients you already have at home. Powered by **React, Vite, Node.js, and Gemini 3.8 Flash Vision**.

---

## ✨ Key Features

*   **📷 Fridge & Receipt Vision Scan:** Snap a picture of your fridge, pantry, or grocery receipt to instantly catalog available ingredients using advanced AI vision.
*   **🎙️ Voice Dictation:** Hands-free ingredient logging and navigation while you cook.
*   **🍳 Smart Pantry Substitutions:** Get intelligent, real-time alternative ingredient suggestions if you're missing a key item for a recipe.
*   **👐 Interactive Hands-Free Cooking Mode:** Step-by-step audio-guided cooking instructions so you don't have to touch your screen with messy hands.
*   **📊 Impact Tracking:** Monitor your household carbon footprint reductions, waste savings, and monthly grocery budget metrics over time.

---

## 🛠️ Tech Stack

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS / Modern CSS
*   **Backend:** Node.js, Express, TypeScript, Bun
*   **AI Integration:** Google Gemini API (`gemini-3.8-flash-vision` for multimodal scanning and recipe generation)

---

## 🚀 Getting Started

### Prerequisites

*   [Bun](https://bun.sh/) or [Node.js](https://nodejs.org/) installed on your machine.
*   A Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/zeeshanriaz050-afk/fridge-zero-waste-kitchen-.git](https://github.com/zeeshanriaz050-afk/fridge-zero-waste-kitchen-.git)
   cd fridge-zero-waste-kitchen-
Install dependencies:

Bash
bun install
# or using npm
npm install
Configure environment variables:
Duplicate .env.example and rename it to .env, then add your Gemini API key:

Code snippet
GEMINI_API_KEY=your_api_key_here
Run the development server:

Bash
bun run dev
# or using npm
npm run dev
