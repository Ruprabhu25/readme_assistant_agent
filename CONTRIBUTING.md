# Contributor Guide

## Getting Started

To contribute to the `telcor_ai_assistant` project, please follow these steps:

### 1. Fork the Repository
   - Click the "Fork" button at the top right of the repository page to create a copy of the project under your GitHub account.

### 2. Clone Your Fork
   - Clone your forked repository to your local machine:
     ```bash
     git clone <your-fork-url>
     cd telcor_ai_assistant
     ```

### 3. Set Up Development Environment
   - Install project dependencies using npm:
     ```bash
     npm install
     ```
   - Make sure to configure your environment variables:
     ```bash
     cp .env.example .env
     ```
   - Update the `.env` file with any necessary API keys or configurations.

### 4. Build the Project
   - If you intend to build the project, use the provided scripts:
     ```bash
     npm run build  # Compiles the TypeScript
     npm run build:bin  # Builds the command-line binary
     ```

### 5. Run Tests
   - Ensure all tests pass before submitting a pull request:
     ```bash
     npm test
     ```
   - To run tests in watch mode, use:
     ```bash
     npm run test:watch
     ```

## Code Style and Formatting

- We use ESLint for linting and Biome for formatting. To check the code:
  ```bash
  npm run lint
  ```
- To automatically fix linting issues, you can run:
  ```bash
  npm run lint:fix
  ```

## Contributing Changes

### 1. Create a Branch
   - Before making changes, create a new branch to work on:
     ```bash
     git checkout -b feature/your-feature-name
     ```

### 2. Make Your Changes
   - Implement your features or bug fixes.

### 3. Commit Your Changes
   - Use descriptive commit messages:
     ```bash
     git add .
     git commit -m "Add feature: description of feature"
     ```

### 4. Push Your Changes
   - Push your changes to your fork:
     ```bash
     git push origin feature/your-feature-name
     ```

### 5. Create a Pull Request
   - Go to the original repository where you want to submit your pull request and create a new pull request from your branch. Be sure to describe your changes clearly and why they are necessary.

## Additional Resources
- For further information, check the [Project Documentation](./README.md) for an overview of features and the directory structure.
- Refer to the [OpenAI API documentation](https://beta.openai.com/docs/) for more context on API integrations.

Thank you for contributing to the `telcor_ai_assistant` project! Your efforts are appreciated.
