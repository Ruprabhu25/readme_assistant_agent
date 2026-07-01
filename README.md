# Telcor AI Assistant

## Overview

Telcor AI Assistant is a CLI agent built with the Vercel AI SDK. It provides an interactive environment to assist users in generating and managing README files for projects.

## Features

- **Interactive Command Line Interface**: Engage in a conversation with the assistant to generate README content.
- **Environment Configuration**: Load environment settings from a `.env` file, ensuring necessary API keys are provided. The primary expected variable is `OPENAI_API_KEY`.
- **File Management**: Proposals for README content can be confirmed and saved directly to specified paths.
- **Workspace Context Usage**: The assistant can inspect files in the workspace, providing tailored responses and suggestions based on the project's actual structure and content.

## Project Structure

```
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
│   └── workspace.test.ts
├── .env.example
├── .gitignore
├── notes.md
├── package-lock.json
├── package.json
├── project.md
├── sea-config.json
├── tsconfig.json
└── vitest.config.ts
```

### Directory Explanations

- `scripts/`: Contains scripts for building the project and creating executable binaries.
- `src/`: Source code for the assistant, divided into various tools and main application files.
- `tests/`: Unit tests for the assistant's functionality, organized similarly to the source code for easy maintenance.

## Installation

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd telcor_ai_assistant
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Setup your environment by copying the example file and adding your OpenAI API key:
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY to the .env file
   ```

## Usage

To start the assistant, run the following command:

```bash
npm start
```

You can type your prompts directly in the CLI. The assistant will propose README content based on your inputs. After generating a proposal, you can choose to save it.

## Testing

To run the tests, use:

```bash
npm test
```

The testing framework used is [Vitest](https://vitest.dev/), which enables rapid testing of the assistant's functionality.
