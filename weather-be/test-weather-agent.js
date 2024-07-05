import { SimpleFunctionCallingAgent } from "./weather-agent.js";

const agent = new SimpleFunctionCallingAgent();
const result = await agent.run('What is the weather in New York?');
console.log(result);
const result2 = await agent.run('What is the weather in Rio de Sortavala, Russia?');
console.log(result2);


