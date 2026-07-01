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

To start the assistant, run the following command in your terminal:

```bash
npm start
```

Once the assistant is running, you can interact with it directly in the CLI. Here’s what you can do:

1. **Type your prompt**: The assistant will respond with a proposed README content based on your input.
   
   For example:
   ```plaintext
   you> Generate a README for a project that manages tasks.
   ```

2. **Review the proposal**: After processing your input, the assistant will display the proposed content.

3. **Saving the proposal**: If you are satisfied with the proposed README, the assistant will ask you to confirm saving it:
   ```plaintext
   Save proposed README to "README.md"? (yes/no)
   ```

   Type `yes` to save the content to the specified path or `no` to discard it.

4. **Exiting the assistant**: Type `exit` or `quit` if you want to terminate the session.

This interactive dialogue makes it easy to generate README files tailored to your project's needs.

## Testing

To run the tests, use:

```bash
npm test
```

The testing framework used is [Vitest](https://vitest.dev/), which enables rapid testing of the assistant's functionality.
