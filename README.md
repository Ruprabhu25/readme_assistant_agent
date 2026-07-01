# telcor_ai_assistant

## Description
README Assistant CLI agent built with the Vercel AI SDK.

## Installation
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd telcor_ai_assistant
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment variables**:
   Create a `.env` file based on the provided `.env.example`. This file will hold your OpenAI API key and any other necessary environment variables:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and add your OpenAI API key:
   ```plaintext
   OPENAI_API_KEY=your_api_key_here
   ```
4. **Run the CLI tool**:
   Execute the CLI tool with the following command:
   ```bash
   npm start
   ```
   Additional command-line flags can be used to configure the behavior of the assistant (e.g., `--model=<id>`, `--api-key-file=<path>`, `--api-key-env=<VAR>`).

## Usage
Run the CLI using:
```bash
npm start
```
This will execute the command defined in the `src/cli.ts` file.

## Features
- **Documentation Assistance**: Offers tailored help for drafting and improving documentation across various modes (e.g., README, API docs).
- **Model Selection**: Select from different OpenAI models using command-line flags.
- **API Key Management**: Load and manage API keys from environment variables or files.
- **Interactive CLI**: Engage with the assistant interactively in a console environment.
- **Diff Visualization**: Provides visual comparisons of text changes with unified diff style representation.
- **History Management**: Stores and retrieves interaction history for continuity in conversations.
- **Custom Debugging**: Supports configurable logging for debugging purposes.
- **Path Management**: Ensures safe handling of file paths, preventing unauthorized access beyond designated workspace boundaries.

## Directory Structure
```
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release-macos.yml
├── scripts/
│   ├── build-bin.mjs
│   └── make-exe.mjs
├── src/
│   ├── tools/
│   │   ├── findExistingReadme.ts
│   │   ├── index.ts
│   │   ├── inspectPackageJson.ts
│   │   ├── listFiles.ts
│   │   ├── readFile.ts
│   │   ├── saveReadme.ts
│   │   ├── searchFiles.ts
│   │   └── summarizeFile.ts
│   ├── agent.ts
│   ├── cli.ts
│   ├── config.ts
│   ├── debug.ts
│   ├── diff.ts
│   ├── docModes.ts
│   ├── history.ts
│   ├── ui.ts
│   └── workspace.ts
├── tests/
│   ├── tools/
│   │   ├── findExistingReadme.test.ts
│   │   ├── helpers.ts
│   │   ├── index.test.ts
│   │   ├── inspectPackageJson.test.ts
│   │   ├── listFiles.test.ts
│   │   ├── readFile.test.ts
│   │   ├── saveReadme.test.ts
│   │   ├── searchFiles.test.ts
│   │   └── summarizeFile.test.ts
│   ├── agent.test.ts
│   ├── config.test.ts
│   ├── debug.test.ts
│   ├── diff.test.ts
│   ├── docModes.test.ts
│   ├── fixtures.ts
│   ├── history.test.ts
│   ├── ui.test.ts
│   └── workspace.test.ts
├── .env.example
├── .gitignore
├── biome.json
├── debug.log
├── enhancements.md
├── package-lock.json
├── package.json
├── project.md
├── QUICKSTART.md
├── README.md
├── sea-config.json
├── tsconfig.json
└── vitest.config.ts
```