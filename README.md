# telcor_ai_assistant

## Description
A README Assistant CLI agent built with the Vercel AI SDK. This tool helps users understand a local project workspace and draft or improve its documentation.

## Features
- CLI-based interaction for documentation assistance.
- Ability to parse command-line arguments for flexible usage.
- Supports API key management.
- Logs and debug options for enhanced user experience.

## Installation
To set up the project, create a `.env` file in the root directory based on the provided `.env.example` file. This file should contain your API keys and configurations required to connect with the AI models.

## Setup
To set up the project, you need to create a `.env` file in the root directory based on the provided `.env.example` file. This file should contain your API keys and configurations required to connect with the AI models. For example, it should look like this:
```
OPENAI_API_KEY=your_api_key_here
```

## Cloning the Repository
To clone this repository, use the following command:
```bash
git clone git@github.com:Ruprabhu25/readme_assistant_agent.git
```
This will create a local copy of the project on your machine, allowing you to make changes and run it as needed.

## Usage
Run the CLI tool with the following command:
```bash
npm run start
```

You can also specify different configurations via command-line arguments, such as:
- `--model=<id>`: Specify the model you want to use.
- `--api-key-file=<path>`: Path to the file containing your API key.
- `--api-key-env=<VAR>`: Set an environment variable for the API key.

## Testing
To run all tests, use the command:
```bash
npm run test
```
To run tests in watch mode, which automatically reruns tests when files change, use:
```bash
npm run test:watch
```
For coverage reports, to view the test coverage, you can run:
```bash
npm run coverage
```

## Project Structure
Here's an overview of the project's directory layout:
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
├── CONTRIBUTING.md
├── debug.log
├── enhancements.md
├── package-lock.json
├── package.json
├── project.md
├── QUICKSTART.md
├── sea-config.json
├── tsconfig.json
└── vitest.config.ts
```