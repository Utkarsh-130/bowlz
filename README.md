
🥗 Boulz
Boulz is your all-in-one health assistant app – a calorie tracker, food calorie finder, and custom salad maker built with React Native using Expo and powered by the OpenRouter API. Whether you're trying to lose weight, bulk up, or just eat healthier, Boulz has your back.

🔥 Features
✅ Calorie Tracker – Log your meals and monitor daily calorie intake.

🔍 Calorie Finder – Instantly get calorie info of any food item using OpenRouter’s AI.

🥗 Salad Maker – Get personalized salad recipes based on your dietary preferences and available ingredients.

🌐 Powered by OpenRouter for smart AI-assisted features.

📱 Cross-platform app built with React Native and Expo.

📸 Screenshots
Coming soon...

🚀 Getting Started
Prerequisites
Node.js >= 14

Expo CLI

An OpenRouter API key

Installation
bash
Copy
Edit

cd boulz
npm install
Running the App
bash
Copy
Edit
npx expo start
Scan the QR code in the Expo Go app on your phone or run it on an emulator.

🔑 Configuration
Create a .env file in the root directory with your OpenRouter key:

env
Copy
Edit
OPENROUTER_API_KEY=your_openrouter_api_key_here
You can get your API key from openrouter.ai.

🧠 How it Works
Calorie Finder: Uses natural language queries to OpenRouter API to estimate calories of foods.

Salad Maker: Suggests salads based on input ingredients and dietary goals using LLM responses.

Tracker: Stores food logs locally (or integrate with a backend if needed).

🛠 Tech Stack
React Native with Expo

OpenRouter API (LLM-based)

AsyncStorage (for local data persistence)

Optionally extensible to Firebase or any backend

✨ Roadmap
 Add user authentication

 Integrate barcode scanner for packaged food

 Nutrition insights and tips

 Dark mode

 Export logs to PDF or CSV

🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you'd like to change.

📄 License
MIT License

💡 Inspiration
Built to help people make smarter food choices — eat clean, feel good, live better 💚

