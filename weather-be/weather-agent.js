import { ChatOpenAI } from "@langchain/openai";
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

export class SimpleFunctionCallingAgent {
  constructor() {
    this.modelForFunctionCalling = new ChatOpenAI({
      model: "gpt-4",
      temperature: 0,
    });
  }

  analyse({ main, wind, rain }) {
    if (rain) return "Stay inside, it's raining outside";
    if (main.feels_like >= 25 ) return "Stay inside, it feels to hot outside";
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

  async run(question) {
    const agentResp = await this.modelForFunctionCalling.invoke(
      [new HumanMessage(question)],
      {
        functions: [ getCurrentWeatherDefinition()],
        // You can set the `function_call` arg to force the model to use a function
        function_call: {
          name: "get_current_weather",
        },
      }
    );
    return await this.process(agentResp);
  }
}
