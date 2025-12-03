<template>
  <div class="inventory-page">
    <h2>🎒 Túi Đồ ({{ playerStore.inventory.length }})</h2>

    <div class="item-grid">
      <div v-for="item in playerStore.inventory" :key="item.id" class="item-card"
        :class="{ 'equipped': item.equipped }">
        <div class="item-icon">
          <img :src="item.icon" alt="icon" />
        </div>
        <div class="item-info">
          <h4>{{ item.name }}</h4>
          <p class="stats-text">
            <span v-if="item.bonusAtk > 0">⚔️+{{ item.bonusAtk }} </span>
            <span v-if="item.bonusDef > 0">🛡️+{{ item.bonusDef }} </span>
            <span v-if="item.bonusHp > 0">❤️+{{ item.bonusHp }} </span>
          </p>
        </div>
        <div class="item-action">
          <button v-if="!item.equipped" @click="playerStore.equipItemApi(item)" class="btn-equip">Trang bị</button>
          <span v-else class="text-equipped">Đang mặc</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { usePlayerStore } from '@/stores/player';
const playerStore = usePlayerStore();

onMounted(() => playerStore.fetchPlayerData());
</script>

<style scoped>
.inventory-page {
  color: white;
  padding: 20px;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.item-card {
  background: #222;
  border: 1px solid #444;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.item-card.equipped {
  border-color: #ffd700;
  box-shadow: 0 0 10px #ffd70055;
}

.item-icon img {
  width: 50px;
  height: 50px;
}

.btn-equip {
  background: #06d6a0;
  border: none;
  padding: 5px 15px;
  border-radius: 4px;
  cursor: pointer;
  color: #000;
  font-weight: bold;
  margin-top: 5px;
}

.text-equipped {
  color: #ffd700;
  font-size: 0.9rem;
  font-weight: bold;
  margin-top: 8px;
}
</style>