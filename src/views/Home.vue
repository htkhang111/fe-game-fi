<template>
  <div class="main-content-wrapper pt-16 px-6" style="padding-left: 200px;">
    
    <section class="text-center relative p-12 rounded-lg bg-bg-card overflow-hidden">
      <div class="absolute inset-0 bg-repeat bg-center opacity-10"
        style="background-image: radial-gradient(circle at center, rgba(30, 255, 180, 0.2) 0%, transparent 70%); animation: spinGlow 12s linear infinite;">
      </div>

      <div class="relative z-10">
        <h1 class="text-4xl font-bold text-primary mb-4">🚀 Hành trình GameFi</h1>
        <p class="text-xl text-text-muted min-h-[28px] mb-6">
          {{ typingLine }}<span class="opacity-70 animate-pulse">|</span>
        </p>

        <div class="max-w-6xl mx-auto">
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            
            <router-link :to="{ name: 'Inventory' }" class="card-link group">
              <span class="text-4xl mb-3">🎒</span> 
              <h3 class="text-xl font-semibold">Kho đồ</h3>
              <p class="text-text-dim">Quản lý trang bị và vật phẩm.</p>
            </router-link>

            <div class="card-link group cursor-not-allowed opacity-50">
              <span class="text-4xl mb-3">⚔️</span>
              <h3 class="text-xl font-semibold">Phiêu lưu</h3>
              <p class="text-text-dim">Đang phát triển...</p>
            </div>

            <div class="card-link group cursor-not-allowed opacity-50">
               <span class="text-4xl mb-3">🏪</span>
              <h3 class="text-xl font-semibold">Cửa hàng</h3>
              <p class="text-text-dim">Đang phát triển...</p>
            </div>

            <div class="card-link group cursor-not-allowed opacity-50">
               <span class="text-4xl mb-3">👤</span>
              <h3 class="text-xl font-semibold">Hồ sơ</h3>
              <p class="text-text-dim">Đang phát triển...</p>
            </div>

            </div>
        </div>
      </div>
    </section>
    
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// ĐÃ XÓA DÒNG IMPORT CHATSTORE GÂY LỖI
// import chatStore from "@/store/chatStore"; 

const lines = [
  "Khởi đầu chuyến phiêu lưu vĩ đại trong thế giới EchoMMO...",
  "Chiến đấu, thu thập và chinh phục những vùng đất bí ẩn...",
  "Vinh quang chỉ dành cho những chiến binh dũng cảm!",
];
const typingLine = ref("");
let lineIndex = 0;
let charIndex = 0;
let timeoutId = null;

const typeEffect = () => {
  if (charIndex < lines[lineIndex].length) {
    typingLine.value += lines[lineIndex].charAt(charIndex);
    charIndex++;
    timeoutId = setTimeout(typeEffect, 50);
  } else {
    timeoutId = setTimeout(eraseEffect, 2000);
  }
};

const eraseEffect = () => {
  if (charIndex > 0) {
    typingLine.value = lines[lineIndex].substring(0, charIndex - 1);
    charIndex--;
    timeoutId = setTimeout(eraseEffect, 30);
  } else {
    lineIndex = (lineIndex + 1) % lines.length;
    timeoutId = setTimeout(typeEffect, 500);
  }
};

onMounted(() => {
  typeEffect();
});

onUnmounted(() => {
  clearTimeout(timeoutId);
});
</script>

<style scoped>
@keyframes spinGlow {
  0% { transform: rotate(0deg) scale(1); }
  100% { transform: rotate(360deg) scale(1.05); }
}

/* CSS Card đơn giản hóa (không dùng @apply của Tailwind để tránh lỗi nếu chưa cài xong) */
.card-link {
  background-color: #2b2b2b; /* bg-bg-card */
  padding: 1.5rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease-in-out;
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.card-link:hover {
  background-color: #333;
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.text-primary { color: #10b981; } /* Màu xanh lá */
.text-text-muted { color: #9ca3af; }
.text-text-dim { color: #6b7280; font-size: 0.875rem; }
</style>