<template>
  <div class="chat"  :class="[responseStyle]">
  <div class="chat-image avatar">
    <div class="w-10 rounded-full">
      <img
        alt="Tailwind CSS chat bubble component"
        src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg" />
    </div>
  </div>
  <div class="chat-bubble">{{props.message}}</div>
</div>
</template>
<script setup>
const props = defineProps({
  message: {
    type: String
  },
  local: {
    type: Boolean
  }
})

const responseStyle = computed(() => props.local ? "chat-end" : "chat-start" );

</script>