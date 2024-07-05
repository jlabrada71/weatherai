import { SimpleFunctionCallingAgent, createAssistant, ASSISTANT_ID } from "./weather-agent-beta.js";

const assistant = await createAssistant();
const agent = new SimpleFunctionCallingAgent({ assistant });
await agent.startConversation();
const result = await agent.run('What is the weather in New York?');
console.log(result);
const result2 = await agent.run('What is the weather in Rio de Sortavala, Russia?');
console.log(result2);


