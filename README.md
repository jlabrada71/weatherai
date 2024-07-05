How to test it
cd weather-ui
npm install
npm run dev

cd ..
cd weather-be
export  WEATHER_API=2a43984f1a57f15729b477e0527d8007 
export OPENAI_API_KEY=<your open ai key>
npm install
node server

Open a browser http://localhost:3000

