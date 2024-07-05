import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";
import { AgentExecutor } from "langchain/agents";
import { StructuredTool } from "langchain/tools";
import OpenAI from "openai";
import { z } from "zod";

import { HumanMessage } from "@langchain/core/messages";
import axios from 'axios';

const OPENAI_API = process.env.OPENAI_API;
const WEATHER_API = process.env.WEATHER_API;
console.log(OPENAI_API);
console.log(WEATHER_API);

async function getWeatherFor({location}) {
  console.log('Looking the weather for ' + location);
  // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API}`
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${WEATHER_API}`
  // const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${WEATHER_API}`
  const response = await axios.get(url);
  console.log('WEATHER RESPONSE');
  console.log(response.data);
  return response.data;
}

function getCurrentWeatherDefinition() {
  return {
    name: "get_current_weather",
    description: "Get the current weather in a given location",
    parameters: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The city state and country, e.g. San Francisco, CA, US",
        },
        unit: { type: "string", enum: ["celsius", "fahrenheit"] },
      },
      required: ["location"],
    },
  };
}

const toolsMap = { 
  get_current_weather: getWeatherFor,
}

class WeatherTool extends StructuredTool {
  schema = z.object({
    location: z.string().describe("The city and state, e.g. San Francisco, CA"),
    unit: z.enum(["celsius", "fahrenheit"]).optional(),
  });

  name = "get_current_weather";

  description = "Get the current weather in a given location";

  constructor() {
    super(...arguments);
  }

  async _call( { location, unit }) {
    const result = getWeatherFor({ location, unit });
    return result;
  }
}

const tools = [new WeatherTool()];

export const ASSISTANT_ID= 'asst_7U6L0k2pUnpIHzZHcsAXOCYj';

const client = new OpenAI();

export async function createAssistant() {
  const assistant = await client.beta.assistants.create({
    model: "gpt-4o",
    instructions:
      "You are a weather bot. Use the provided functions to answer questions.",
    tools: [
      {
        type: "function",
        function: {
          name: "get_current_weather",
          description: "Get the current weather in a given location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "The city and state, e.g., San Francisco, CA",
              },
            },
            required: ["location"],
          },
        },
      }
    ],
  });
  return assistant;
}

export class SimpleFunctionCallingAgent {
  constructor({ assistant, assistantId }) {
    if (assistant) {
      this.agent = assistant;
    } else if (assistantId ) {
      this.agent = new OpenAIAssistantRunnable({ assistantId: ASSISTANT_ID });
    }
  }

  analyse({ main, wind, rain }) {
    if (rain) return "Stay inside, it's raining outside";
    if (main.feels_like >= 25 ) return "Stay inside, it feels too hot outside";
    if (main.humidity >= 80) return "Stay inside, it's way too humid outside";
    if (wind >= 5) return "Stay inside, it's too windy outside";
    
    return "Today is a beatifull day to go outside.";
  }

  async process(agentResp) {
    console.log((agentResp.additional_kwargs ));
    const { name, arguments: functionArguments } = agentResp.additional_kwargs.function_call;
    console.log(name);
    console.log(functionArguments);
    const fn = toolsMap[name];
    const weather = await fn(JSON.parse(functionArguments))
    const analysisResult = this.analyse( weather );
    return analysisResult;
  }

  async startConversation() {
    const thread = await client.beta.threads.create();
    this.thread = thread;
  }

  async run(question) {
    const message = await client.beta.threads.messages.create(
      this.thread.id,
      {
        role: "user",
        content: question
      }
    );

    let run = await client.beta.threads.runs.createAndPoll(
      this.thread.id,
      { 
        assistant_id: this.agent.id,
        instructions: "Please address the user as Jane Doe. The user has a premium account."
      }
    );

    if (run.status === 'completed') {
      const messages = await client.beta.threads.messages.list(
        run.thread_id
      );
      for (const message of messages.data.reverse()) {
        console.log(`${message.role} > ${message.content[0].text.value}`);
      }
    } else {
      console.log(run.status);
    }
    
    // console.log('*******************************');
    // console.log(assistantResponse);
    // return await this.process(assistantResponse);
  }
}
