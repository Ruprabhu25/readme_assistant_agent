# Telcor AI Assistant

`telcor_ai_assistant` is a README Assistant CLI agent built with the Vercel AI SDK. It helps users generate and manage README files within their project workspace.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Configuration](#configuration)

## Installation

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd telcor_ai_assistant
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Create a `.env` File:**
   - Duplicate the example configuration by running:
     ```bash
     cp .env.example .env
     ```
   - Set your OpenAI API key in the `.env` file:
     ```plaintext
     OPENAI_API_KEY=your_api_key_here
     ```

4. **Available Scripts:** After setup, you can run the following commands:
   - **Start the CLI Tool:**
     ```bash
     npm run start
     ```
   - **Run in Development Mode:**
     ```bash
     npm run dev
     ```
   - **Run Tests:**
     ```bash
     npm run test
     ```
   - **Lint the Code:**
     ```bash
     npm run lint
     ```

## Usage

Run the CLI tool with the following command:

```bash
npm run start
```

You can pass additional arguments for debugging and history:

- `--debug <path>`: Saves debug information to a specified file.
- `--history <path>`: Saves chat history to a specified file.
- `--model=<id>`: Overrides the model to use (default: `gpt-4o-mini`, or `OPENAI_MODEL` if set).
- `--api-key-file=<path>`: Reads the OpenAI API key from a file instead of an environment variable.
- `--api-key-env=<VAR>`: Reads the OpenAI API key from the named environment variable instead of `OPENAI_API_KEY`.

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