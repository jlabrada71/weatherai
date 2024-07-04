import { AgentExecutor } from "langchain/agents";
import { StructuredTool } from "langchain/tools";
import { OpenAIAssistantRunnable } from "langchain/experimental/openai_assistant";
import { z } from "zod";

const ASSISTANT_ID= 'asst_7U6L0k2pUnpIHzZHcsAXOCYj';

function getCurrentWeather(location, _unit = "fahrenheit") {
  if (location.toLowerCase().includes("tokyo")) {
    return JSON.stringify({ location, temperature: "10", unit: "celsius" });
  } else if (location.toLowerCase().includes("san francisco")) {
    return JSON.stringify({ location, temperature: "72", unit: "fahrenheit" });
  } else {
    return JSON.stringify({ location, temperature: "22", unit: "celsius" });
  }
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
    const result = getCurrentWeather(location, unit);
    return result;
  }
}
const tools = [new WeatherTool()];

async function createAssistant() {
  const agent = await OpenAIAssistantRunnable.createAssistant({
    model: "gpt-3.5-turbo-1106",
    instructions:
      "You are a weather bot. Use the provided functions to answer questions.",
    name: "Weather Assistant",
    tools,
    asAgent: true,
  });
  return agent;
}

async function getAssistant(assistantId) {
  return  new OpenAIAssistantRunnable({ assistantId });
}

const agent = await getAssistant(ASSISTANT_ID);

const agentExecutor = AgentExecutor.fromAgentAndTools({
  agent,
  tools,
});

const assistantResponse = await agentExecutor.invoke({
  content: "What's the weather in Tokyo and San Francisco?",
});
console.log(assistantResponse);

// const assistantResponse = await assistant.getAssistant();