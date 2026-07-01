# Telcor AI Assistant

`telcor_ai_assistant` is a README Assistant CLI agent built with the Vercel AI SDK. It helps users generate and manage README files within their project workspace.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Configuration](#configuration)

## Installation

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

## Usage

Run the CLI tool with the following command:

```bash
npm run start
```

You can pass additional arguments for debugging and history:

- `--debug <path>`: Saves debug information to a specified file.
- `--history <path>`: Saves chat history to a specified file.

The prompt will allow you to generate and propose changes to README files. Accept or reject changes interactively.

## Features

- GPT-4 powered interactive assistant for README generation.
- Diff view of proposed changes to track modifications.
- Chat history feature to persist conversations.
- Debug logging for troubleshooting.

## Directory Structure

```plaintext
.
├── .github/
│   └── workflows/
│       └── ci.yml
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
│   ├── history.ts
│   ├── ui.ts
│   └── workspace.ts
├── tests/
│   ├── tools/
│   │   ├── findExistingReadme.test.ts
│   │   ├── helpers.ts
│   │   ├── inspectPackageJson.test.ts
│   │   ├── listFiles.test.ts
│   │   ├── readFile.test.ts
│   │   ├── saveReadme.test.ts
│   │   ├── searchFiles.test.ts
│   │   └── summarizeFile.test.ts
│   ├── agent.test.ts
│   ├── fixtures.ts
│   ├── ui.test.ts
│   └── workspace.test.ts
├── .env.example
├── .gitignore
├── biome.json
├── debug.log
├── enhancements.md
├── history.json
├── package-lock.json
├── package.json
├── project.md
├── sea-config.json
├── tsconfig.json
└── vitest.config.ts
```

## Configuration

Ensure the following environment variable is set in your `.env` file:

- `OPENAI_API_KEY`: Your OpenAI API key for accessing the AI models.