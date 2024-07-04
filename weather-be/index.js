import { ChatOpenAI } from "@langchain/openai";
import { DynamicStructuredTool } from "@langchain/core/tools";
import axios from 'axios';

const llm = new ChatOpenAI({
  model: "gpt-3.5-turbo-0125",
  temperature: 0,
  apiKey: OPENAI_API 
});

import { z } from "zod";

/**
 * Note that the descriptions here are crucial, as they will be passed along
 * to the model along with the class name.
 */
const weatherSchema = z.object({
  lon: z.number().describe("The longitude of the location for the forecast."),
  lat: z.number().describe("The lattitude of the location for the forecast."),
});

const weatherTool = new DynamicStructuredTool({
  name: "weather",
  description: "Gets the weather from a given location.",
  schema: weatherSchema,
  func: async ({ lon, lat }) => {
    return getWeatherFor({ lon, lat });

    // // Functions must return strings
    // if (operation === "add") {
    //   return `${number1 + number2}`;
    // } else if (operation === "subtract") {
    //   return `${number1 - number2}`;
    // } else if (operation === "multiply") {
    //   return `${number1 * number2}`;
    // } else if (operation === "divide") {
    //   return `${number1 / number2}`;
    // } else {
    //   throw new Error("Invalid operation.");
    // }
  },
});


async function getWeatherFor({lat, lon}) {
  // const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API}`
  const url = `https://api.openweathermap.org/data/2.5/weather?q=Florianopolis,br&units=metric&appid=${WEATHER_API}`
  // const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${WEATHER_API}`
  const response = await axios.get(url)
  return response.data;
}

const llmWithTools = llm.bindTools([weatherTool]);
const res = await llmWithTools.invoke("Whats the weather for  27.26 South, 48.30 West");

console.log('*******************************************************')
console.log('TOOL CALL')
console.log(res.tool_calls);
console.log(res);
console.log('*******************************************************')
console.log('WEATHER INFORMATION')
console.log(await getWeatherFor({ lon: -48.3, lat: -27.26 }))