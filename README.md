# AI - LangChain & OpenAI (Node.js + TypeScript)

This repository provides utilities for integrations with OpenAI's GPT-3.5 using the OpenAI API and LangChain.

## Project Setup

This project uses the OpenAI API to generate responses based on user input. The project is written in TypeScript and uses Node.js as the runtime.

### Prerequisites

- **Node.js** (>= 18.x recommended)
- **TypeScript**
- **OpenAI API key** (You need a valid API key from OpenAI)

### Clone the repository

Start by cloning this repository to your local machine:

```bash
git clone <repo-url>
cd <repo-folder>
```

## Dependencies

This project relies on the following dependencies:

- **dotenv**: Loads environment variables from a `.env` file.
- **openai**: The OpenAI client for interacting with the GPT-3.5 model.
- **typescript**: TypeScript compiler for transpiling the code from `.ts` to `.js`.
- **@types/node**: Type definitions for Node.js.

## Usage

1.  **Set up the environment variables**:\
    Create a `.env` file in the root of the project and add your OpenAI API key.

    ```bash
    # Copy the following to your .env file
    OPENAI_API_KEY=your-api-key-here
    ```

2.  **Install dependencies**:\
    Run the following command to install the necessary dependencies:

    `npm install`

## Running the Project

### 1\. **Compile TypeScript**:

The project is written in TypeScript. To compile the TypeScript code to JavaScript, run:

`npm run build`

### 2\. **Run the query function**:

After building the TypeScript files, you can execute the compiled JavaScript (functions.js) to run a method. For example:

`node dist/functions.js`

This will execute the query defined in the functions.js file. You can modify the code in functions.ts (before compilation) to call specific methods as needed.

### Example Interaction:

You can pass a question as a command-line argument when running the script:

`node dist/functions.js "What is the main topic of the YouTube video?"`

This will extract relevant text from the video and PDF documents, then query OpenAI to provide an answer based on the context.
