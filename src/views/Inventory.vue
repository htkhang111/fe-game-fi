<template>
  <div class="inventory-page">
    <div class="stats-summary">
      <span>❤️ HP: {{ playerStore.stats.hp }}/{{ playerStore.stats.maxHp }}</span>
      <span>⚔️ ATK: {{ playerStore.stats.atk }}</span>
    </div>

    <h2>🎒 Túi Đồ ({{ playerStore.inventory.length }} món)</h2>

    <table class="item-table">
      <thead>
        <tr>
          <th>Tên</th>
          <th>Loại</th>
          <th>Hiệu quả</th>
          <th>Số lượng</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in playerStore.inventory" :key="item.id">
          <td>{{ item.icon }} {{ item.name }}</td>
          <td>{{ item.type === 'consumable' ? 'Tiêu hao' : 'Trang bị' }}</td>
          <td>{{ item.description }}</td>
          <td>x{{ item.quantity }}</td>
          <td>
            <button 
              v-if="item.type === 'consumable'" 
              class="btn-use"
              @click="playerStore.useConsumable(item)"
            >
              Dùng
            </button>
            <button 
              v-else 
              class="btn-equip"
              @click="playerStore.equipItem(item)"
            >
              Trang bị
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

// Khi vào trang thì tải dữ liệu ngay
onMounted(() => {
  playerStore.fetchPlayerData();
});
</script>

<style scoped>
/* Giữ nguyên CSS cũ của bạn hoặc dùng lại style.css */
.stats-summary {
  background: #333;
  padding: 10px;
  color: #ffd166;
  margin-bottom: 15px;
  border-radius: 5px;
  font-weight: bold;
  display: flex;
  gap: 20px;
}
/* ... (CSS bảng item như trước) ... */
</style>