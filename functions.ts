import 'dotenv/config';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { evaluate } from 'mathjs';

dotenv.config();

export const openai = new OpenAI();

// Type for function arguments
interface CalculateArgs {
  expression: string;
}

// Type for function response
interface FunctionResponse {
  result: any;
}

// Type for the OpenAI response
interface OpenAIResponse {
  choices: Array<{
    finish_reason:
      | 'stop'
      | 'function_call'
      | 'length'
      | 'tool_calls'
      | 'content_filter';
    message: {
      content: string | null;
      function_call?: {
        name: string;
        arguments: string;
      } | null;
    };
  }>;
}

const QUESTION = process.argv[2] || 'hi';

const messages: Array<
  | { role: 'user'; content: string }
  | {
      role: 'assistant';
      content?: string;
      function_call?: { name: string; arguments: string };
    }
  | { role: 'function'; name: string; content: string }
> = [
  {
    role: 'user',
    content: QUESTION,
  },
];

const functions: Record<
  string,
  (args: Record<string, any>) => Promise<FunctionResponse>
> = {
  calculate: async ({ expression }) => {
    try {
      const result = evaluate(expression);
      return { result };
    } catch (error) {
      throw new Error('Invalid expression');
    }
  },

  // Add more functions here as needed
};

const getCompletion = async (
  messages: Array<{
    role: string;
    content?: string;
    function_call?: { name: string; arguments: string };
  }>
): Promise<OpenAIResponse> => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-0613',
    messages: messages as any,
    functions: [
      {
        name: 'calculate',
        description: 'Run a math expression',
        parameters: {
          type: 'object',
          properties: {
            expression: {
              type: 'string',
              description:
                'The math expression to evaluate like "2 * 3 + (21 / 2) ^ 2"',
            },
          },
          required: ['expression'],
        },
      },
    ],
    temperature: 0,
  });

  return response;
};

let response: OpenAIResponse;
while (true) {
  response = await getCompletion(messages);

  const choice = response.choices[0];

  if (choice.finish_reason === 'stop') {
    console.log(choice.message.content);
    break;
  } else if (choice.finish_reason === 'function_call') {
    const fnName = choice.message.function_call?.name;
    const args = choice.message.function_call?.arguments;

    if (fnName && args) {
      const functionToCall = functions[fnName];
      const params: CalculateArgs = JSON.parse(args);

      const result = await functionToCall(params);

      messages.push({
        role: 'assistant',
        content: '',
        function_call: {
          name: fnName,
          arguments: args,
        },
      });

      messages.push({
        role: 'function',
        name: fnName,
        content: JSON.stringify({ result: result.result }),
      });
    }
  }
}
