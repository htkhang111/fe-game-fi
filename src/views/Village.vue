<template>
  <div class="village-page">
    <div class="village-header">
      <h1>🏡 Làng Tân Thủ</h1>
      <p>Nơi bình yên để nghỉ ngơi và nâng cấp.</p>
    </div>

    <div class="village-menu">

      <div class="building inn">
        <h3>🛏️ Nhà Trọ</h3>
        <p>Hồi phục toàn bộ HP và Năng lượng.</p>
        <div class="stats-preview">
          HP: {{ playerStore.stats.hp }}/{{ playerStore.stats.maxHp }} |
          ⚡: {{ playerStore.stats.energy }}/{{ playerStore.stats.maxEnergy }}
        </div>
        <button class="btn-rest" @click="handleRest" :disabled="loading">
          {{ loading ? 'Đang ngủ...' : '💤 Ngủ một giấc (Server)' }}
        </button>
      </div>

      <div class="building shop opacity-50">
        <h3>🏪 Cửa Hàng (Đang xây)</h3>
      </div>
    </div>

    <div class="leave-village">
      <button class="btn-adventure" @click="$router.push('/adventure')">
        🌲 Ra khỏi làng
      </button>
    </div>

    <div v-if="message" class="toast">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();
const message = ref('');
const loading = ref(false);

const handleRest = async () => {
  loading.value = true;

  // GỌI API JAVA
  const success = await playerStore.restAtInn();

  loading.value = false;
  if (success) {
    message.value = "Bạn đã hồi phục hoàn toàn!";
  } else {
    message.value = "Có lỗi xảy ra, không thể nghỉ ngơi.";
  }
  setTimeout(() => message.value = '', 3000);
};

// Load lại data mới nhất khi về làng
onMounted(() => {
  playerStore.fetchPlayerData();
});
</script>

<style scoped>
.village-page {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  color: #eee;
  text-align: center;
}

.village-menu {
  display: grid;
  gap: 20px;
  margin: 30px 0;
}

.building {
  background: #333;
  padding: 20px;
  border-radius: 10px;
  border: 2px solid #444;
}

.inn {
  border-color: #118ab2;
}

.btn-rest {
  background: #118ab2;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
}

.btn-rest:disabled {
  background: #555;
  cursor: wait;
}

.btn-adventure {
  background: #06d6a0;
  color: #000;
  font-weight: bold;
  padding: 15px 40px;
  font-size: 18px;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  box-shadow: 0 0 15px #06d6a0aa;
  animation: pulse 2s infinite;
}

.stats-preview {
  margin: 10px 0;
  color: #aaa;
}

.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #06d6a0;
  color: #000;
  padding: 10px 20px;
  border-radius: 20px;
  font-weight: bold;
  animation: fadeIn 0.5s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}
</style>