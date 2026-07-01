# Quickstart Guide

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd telcor_ai_assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example and set your OpenAI API key:
   ```bash
   cp .env.example .env
   ```
   Add your OpenAI API key to the `.env` file:
   ```plaintext
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the CLI tool:
   ```bash
   npm run start
   ```