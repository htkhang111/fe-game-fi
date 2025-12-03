<template>
    <div class="char-page">
        <div class="panel stats-panel">
            <div class="panel-header">📊 CHỈ SỐ</div>
            <div class="panel-body">
                <div class="stat-row"><span>Cấp độ</span> <span class="val highlight">{{ playerStore.stats.lv }}</span>
                </div>
                <div class="stat-row"><span>ATK</span> <span class="val">{{ playerStore.stats.atk }}</span></div>
                <div class="stat-row"><span>DEF</span> <span class="val">{{ playerStore.stats.def }}</span></div>
                <div class="stat-row"><span>HP</span> <span class="val">{{ playerStore.stats.hp }}/{{
                        playerStore.stats.maxHp }}</span></div>
                <div class="stat-row"><span>Energy</span> <span class="val">{{ playerStore.stats.energy }}/{{
                        playerStore.stats.maxEnergy }}</span></div>
            </div>
        </div>

        <div class="panel equip-panel">
            <div class="panel-header">🛡️ TRANG BỊ (Bấm để gỡ)</div>
            <div class="panel-body equip-body">
                <div class="char-model">
                    <img src="https://cdn-icons-png.flaticon.com/512/9408/9408175.png" class="char-img" />
                </div>

                <div class="slots-side left">
                    <div class="slot" title="Weapon" @click="unequip(equipment.WEAPON)">
                        <img v-if="equipment.WEAPON" :src="equipment.WEAPON.icon" class="item-img" />
                        <div v-else class="placeholder">⚔️</div>
                    </div>
                    <div class="slot" title="Helm" @click="unequip(equipment.HELM)">
                        <img v-if="equipment.HELM" :src="equipment.HELM.icon" class="item-img" />
                        <div v-else class="placeholder">⛑️</div>
                    </div>
                    <div class="slot" title="Armor" @click="unequip(equipment.ARMOR)">
                        <img v-if="equipment.ARMOR" :src="equipment.ARMOR.icon" class="item-img" />
                        <div v-else class="placeholder">👕</div>
                    </div>
                </div>

                <div class="slots-side right">
                    <div class="slot" title="Necklace" @click="unequip(equipment.NECKLACE)">
                        <img v-if="equipment.NECKLACE" :src="equipment.NECKLACE.icon" class="item-img" />
                        <div v-else class="placeholder">📿</div>
                    </div>
                    <div class="slot" title="Ring" @click="unequip(equipment.RING)">
                        <img v-if="equipment.RING" :src="equipment.RING.icon" class="item-img" />
                        <div v-else class="placeholder">💍</div>
                    </div>
                    <div class="slot" title="Boots" @click="unequip(equipment.BOOTS)">
                        <img v-if="equipment.BOOTS" :src="equipment.BOOTS.icon" class="item-img" />
                        <div v-else class="placeholder">👢</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="panel inv-panel">
            <div class="panel-header">🎒 TÚI ĐỒ NHANH</div>
            <div class="panel-body inv-grid">
                <div v-for="item in playerStore.inventory" :key="item.id" class="mini-slot"
                    @click="playerStore.equipItemApi(item)" :title="item.name">
                    <img :src="item.icon" class="item-img" :class="{ 'equipped': item.equipped }" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { usePlayerStore } from '@/stores/player';
const playerStore = usePlayerStore();
const equipment = computed(() => playerStore.equipment);

// Hàm wrapper để gọi gỡ đồ
const unequip = (item) => {
    if (item) {
        if (confirm(`Gỡ ${item.name} ra khỏi người?`)) {
            playerStore.unequipItemApi(item);
        }
    }
};

onMounted(() => playerStore.fetchPlayerData());
</script>

<style scoped>
.char-page {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    gap: 20px;
    height: 100%;
    color: white;
    padding: 20px;
}

.panel {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    height: 450px;
}

.panel-header {
    padding: 10px;
    background: #333;
    text-align: center;
    font-weight: bold;
}

.panel-body {
    padding: 20px;
    flex: 1;
}

.equip-body {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.slots-side {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.left {
    left: 30px;
}

.right {
    right: 30px;
}

/* Thêm cursor pointer để biết là bấm được */
.slot {
    width: 60px;
    height: 60px;
    background: #111;
    border: 2px solid #444;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s;
}

.slot:hover {
    border-color: #06d6a0;
}

.item-img {
    width: 90%;
    height: 90%;
    object-fit: contain;
}

.placeholder {
    font-size: 2rem;
    opacity: 0.3;
}

.char-img {
    height: 250px;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
}

.stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
}

.val {
    color: #ffd700;
    font-weight: bold;
}

/* Mini Inventory */
.inv-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 5px;
}

.mini-slot {
    width: 50px;
    height: 50px;
    background: #222;
    border: 1px solid #444;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
}

.mini-slot:hover {
    border-color: #06d6a0;
}

.mini-slot img.equipped {
    filter: grayscale(100%);
    opacity: 0.5;
}
</style>