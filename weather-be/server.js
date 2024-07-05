import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { SimpleFunctionCallingAgent } from "./weather-agent.js";

const agent = new SimpleFunctionCallingAgent();
const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = 4000

app.post('/chat-bot', async (req, res) => {
  const body = req.body;
  console.log(body);

  const result = await agent.run(body.question);
  res.send({
    message: result,
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})