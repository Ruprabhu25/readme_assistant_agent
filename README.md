# Telcor AI Assistant

## Overview

The **Telcor AI Assistant** is a Command Line Interface (CLI) tool built with the **Vercel AI SDK**. This utility assists users in understanding a local project workspace and helps in drafting or improving documentation for it. The application is designed to point out how to build simple yet effective AI-powered tools, focusing on structure and usability.

## Description

This project aims to provide a README Assistant agent that interacts with users to generate essential documentation for their projects. It can inspect files within a specified workspace and use the context to craft information-rich markdown documents.

The assistant can respond to various user prompts, such as:

- What does this project do?
- Generate a README for this workspace.
- What setup instructions should this README include?

## Features

- File inspection capabilities to gather context.
- Interactive chat interface for generating and improving documentation.
- Designed with extensibility in mind to accommodate multiple markdown files.

## Getting Started

### Prerequisites

To run this project, ensure you have the following installed:

- Node.js
- npm (Node package manager)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd telcor_ai_assistant
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

### Running the Application

You can run the application in development mode using:

```bash
npm run dev
```

For production, build the project first:

```bash
npm run build
```

Then start the application:

```bash
npm start
```

### Running Tests

To execute tests, run:

```bash
npm test
```

For watch mode, use:

```bash
npm run test:watch
```

## Directory Structure

```
.
├── src/                  # Source files
│   ├── agent.ts         
│   ├── cli.ts           
│   ├── config.ts        
│   └── tools/           # Utility functions
├── tests/               # Test files
├── .env                 # Environment variables
├── package.json         # Project metadata
└── README.md            # This document
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Built with the Vercel AI SDK - a powerful toolkit for creating AI applications and agents.