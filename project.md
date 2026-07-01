# Engineering Onsite: README Assistant Agent

## Overview

Today, you’ll build a small AI-powered application using the **Vercel AI SDK**.

Your goal is to create a **README Assistant**: an agent that helps a user understand a local project/workspace and draft or improve documentation for it.

The project is intentionally scoped. We are not looking for a production-grade coding agent. We care about seeing how you build a useful, working product, how you structure your code, and how you explain your decisions.

The Vercel AI SDK is a TypeScript toolkit for building AI applications and agents. It supports text generation, streaming responses, structured outputs, and tool calling across model providers. ([AI SDK][1])

## Schedule

We’ll discuss the project around **10:00am**.

You’ll have the day to build.

By **5:00pm**, you should have a local application running and be ready to demo it.

## Project

Build a local web app that helps a user generate or improve a README for a workspace.

The app should let a user chat with an AI assistant. The assistant should be able to inspect files in a provided workspace and use that context to answer questions or produce documentation.

Example user prompts:

```txt
What does this project do?
```

```txt
Generate a README for this workspace.
```

```txt
What setup instructions should this README include?
```

```txt
Improve the existing README and explain what you changed.
```

```txt
What files are most important for understanding this project?
```

## Requirements

By the end of the day, your app should:

1. Run locally with clear setup instructions.
2. Use the **Vercel AI SDK** for model interaction.
3. Provide a simple chat-style interface.
4. Operate on a local sample workspace.
5. Implement at least **two tools** that the assistant can use.

Suggested tools:

```txt
listFiles
readFile
searchFiles
summarizeFile
inspectPackageJson
findExistingReadme
```

The AI SDK supports tool calling through functions such as `generateText` and `streamText`; tools can include descriptions, input schemas, and async execute functions. ([AI SDK][2])

6. The assistant should use file context from the workspace when answering.
7. The assistant should be able to generate a README draft or suggest README improvements.
8. Show enough information in the UI that a user can understand what happened. For example:

   * which files were read
   * which tools were called
   * what context was used
   * what README sections were generated

## What You Do Not Need to Build

You do **not** need to build:

* authentication
* deployment
* multi-user support
* a production-grade agent runtime
* a full coding assistant
* arbitrary shell command execution
* complex sandboxing
* vector search
* perfect AI output quality

Focus on a small, useful, working product.

## Suggested User Flow

One possible flow:

1. User opens the app.
2. User sees a chat box.
3. User asks: “Generate a README for this project.”
4. The assistant lists files in the workspace.
5. The assistant reads relevant files.
6. The assistant produces a README draft.
7. The UI shows which files were used.
8. User can copy the README or optionally save it.

You are welcome to design a different flow if you think it is better.

## Stretch Goals

Once the base app works, add one or more features that make the product more useful.

Possible stretch features:

* File tree sidebar
* Existing README analysis
* README completeness checklist
* “Regenerate this section” button
* Markdown preview
* Save generated README to disk
* Diff view before saving changes
* Project type detection
* Setup command detection from `package.json`
* Test or lint command detection
* Support multiple documentation modes:

  * beginner-friendly README
  * API docs
  * contributor guide
  * quickstart
* Persistent chat history
* Display tool calls in a timeline
* Better error handling for missing files or invalid paths
* Basic tests for your filesystem tools

We prefer a small number of polished, working features over many incomplete ones.

## Technical Notes

You may use any model provider supported by the AI SDK.

You may use any app framework, but we recommend keeping it simple. A Next.js app is a reasonable choice, but not required.

You may use AI coding assistants or code generation tools. That is allowed. You are responsible for understanding, explaining, and debugging the code you submit.

Please avoid destructive file operations unless you implement a clear preview or confirmation step.

## Deliverables

By 5:00pm, please have:

1. A running local app.
2. A README with setup instructions.
3. A short explanation of what you built.
4. Notes on any known limitations.
5. A demo flow you can walk through.
6. Code you are prepared to explain.

## Demo Expectations

In the demo, we’ll ask you to:

1. Start the app locally.
2. Show the main user flow.
3. Ask the assistant to inspect the workspace.
4. Generate or improve a README.
5. Explain how your tools work.
6. Walk through the code structure.
7. Discuss what you would improve with more time.

## What We’re Looking For

We’ll evaluate the project across several dimensions:

### Product thinking

Did you build something useful and understandable?

### Execution

Does the app run? Does the main flow work?

### AI SDK usage

Did you use the SDK thoughtfully, especially around prompts, tools, and model interaction?

### Code quality

Is the code organized, readable, and reasonably maintainable?

### User experience

Can a user understand what the assistant is doing?

### Error handling

Does the app handle common failure cases gracefully?

### Communication

Can you explain your implementation, tradeoffs, and next steps?

## Final Note

The goal is not to build the most complex agent possible.

The goal is to build a focused, working assistant that uses AI and workspace context to help a user create better documentation.

[1]: https://ai-sdk.dev/docs/introduction?utm_source=chatgpt.com "AI SDK by Vercel"
[2]: https://ai-sdk.dev/docs/foundations/tools?utm_source=chatgpt.com "Foundations: Tools"