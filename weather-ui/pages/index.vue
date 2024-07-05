
import ChatMessage from '~/components/ChatMessage.vue';
<template>
  <div class="flex flex-col p-10 gap-10 bg-slate-100">
    <div>
      <ChatMessage v-for="message in messages" :message="message.text" :local="message.local" :key="message.id"></ChatMessage>
    </div>
    
    <div class="flex bg-slate-200 p-5 gap-5">
      <textarea
        placeholder="Your question"
        v-model="question"
        class="textarea textarea-bordered textarea-lg w-full max-w-3xl">
      </textarea>
      <button class="btn" @click="sendRequest">
        <svg xmlns="http://www.w3.org/2000/svg" 
          class="h-6 w-6"
          stroke="currentColor"
          viewBox="0 0 512 512">
          <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg>
        Send
      </button>
    </div>
  </div>
</template>
<script setup>
import axios from 'axios';

const messages = ref([
  { id: 1, message: "Hi!! I'm the weather bot.  ", local: false},
  { id: 2, message: 'Could you tell me where you are? (City, Country)', local: false }

]);

const question = ref('')

async function sendRequest() {
  try {
    axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
    const newQuestion =  {id: messages.value.length, message: question.value, local: true }
    console.log(newQuestion);
    messages.value.push( newQuestion );
    const response = await axios.post('http://localhost:4000/chat-bot', {
      question: question.value
    })
    const newResponse = { id: messages.value.length, message: response.data.message, local: false };
    console.log(newResponse);
    messages.value.push(newResponse);
  } catch(e) {
    console.log(e);
  }
}

</script>