import { defineStore } from 'pinia';

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [] // Danh sách tin nhắn rỗng
  }),
  actions: {
    sendMessage(msg) {
      console.log("Gửi tin nhắn giả:", msg);
    }
  }
});

// Export mặc định để tương thích với cách import của bạn
export default useChatStore;