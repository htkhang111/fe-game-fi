<template>
    <div class="char-page">

        <div class="panel stats-panel">
            <div class="panel-header">📊 CHỈ SỐ</div>
            <div class="panel-body">
                <div class="stat-row">
                    <span>Cấp độ</span> <span class="val highlight">{{ playerStore.stats.lv }}</span>
                </div>
                <div class="stat-row">
                    <span>ATK</span> <span class="val">{{ playerStore.stats.atk }}</span>
                </div>
            </div>
        </div>

        <div class="panel equip-panel">
            <div class="panel-header">🛡️ TRANG BỊ</div>
            <div class="panel-body equip-body">

                <div class="char-model">
                    <img src="@/assets/img/c-Samurai.png" alt="Character" class="char-img" />
                </div>

                <div class="slots-side left">
                    <div class="slot" @click="unequip('weapon')" :class="{ has: equipment.weapon }">
                        <img v-if="equipment.weapon" :src="getImgPath(equipment.weapon.icon)" class="item-img" />
                        <div v-else class="placeholder-icon">⚔️</div>
                    </div>

                    <div class="slot" @click="unequip('armor')" :class="{ has: equipment.armor }">
                        <img v-if="equipment.armor" :src="getImgPath(equipment.armor.icon)" class="item-img" />
                        <div v-else class="placeholder-icon">👕</div>
                    </div>

                    <div class="slot" @click="unequip('gloves')" :class="{ has: equipment.gloves }">
                        <img v-if="equipment.gloves" :src="getImgPath(equipment.gloves.icon)" class="item-img" />
                        <div v-else class="placeholder-icon">🧤</div>
                    </div>
                </div>

                <div class="slots-side right">
                    <div class="slot" @click="unequip('necklace')" :class="{ has: equipment.necklace }">
                        <img v-if="equipment.necklace" :src="getImgPath(equipment.necklace.icon)" class="item-img" />
                        <div v-else class="placeholder-icon">📿</div>
                    </div>
                    <div class="slot" @click="unequip('ring')" :class="{ has: equipment.ring }">
                        <img v-if="equipment.ring" :src="getImgPath(equipment.ring.icon)" class="item-img" />
                        <div v-else class="placeholder-icon">💍</div>
                    </div>
                    <div class="slot" @click="unequip('boots')" :class="{ has: equipment.boots }">
                        <img v-if="equipment.boots" :src="getImgPath(equipment.boots.icon)" class="item-img" />
                        <div v-else class="placeholder-icon">👢</div>
                    </div>
                </div>

            </div>
        </div>

        <div class="panel inv-panel">
            <div class="panel-header">🎒 TÚI ĐỒ</div>
            <div class="panel-body inv-grid">
                <div v-for="item in invItems" :key="item.id" class="inv-slot" @click="equip(item)">
                    <img :src="getImgPath(item.icon)" class="item-img" />

                    <span class="item-lv" v-if="item.level">+{{ item.level }}</span>
                </div>

                <div v-for="n in (20 - invItems.length)" :key="'empty' + n" class="inv-slot empty"></div>
            </div>
        </div>

    </div>
</template>

<script setup>
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();
const equipment = computed(() => playerStore.equipment);
const invItems = computed(() => playerStore.inventory.filter(i => i.type === 'equipment'));

const equip = (item) => playerStore.equipItem(item);
const unequip = (slot) => playerStore.unequipItem(slot);

/**
 * HÀM QUAN TRỌNG: Lấy đường dẫn ảnh động trong Vite
 * @param {string} imgName - Tên file ảnh (vd: 'sword_1.png')
 */
const getImgPath = (imgName) => {
    try {
        // Trỏ đúng vào thư mục bro vừa tạo ở bước 1
        return new URL(`../assets/img/items/${imgName}`, import.meta.url).href;
    } catch (error) {
        console.error('Không tìm thấy ảnh:', imgName);
        return ''; // Hoặc trả về ảnh lỗi mặc định
    }
};
</script>

<style scoped>
/* --- CSS CẬP NHẬT ĐỂ HIỂN THỊ ẢNH ĐẸP --- */

/* Ảnh nhân vật ở giữa */
.char-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    /* Giữ tỉ lệ ảnh không bị méo */
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
}

/* Slot chứa item */
.slot,
.inv-slot {
    /* Giữ nguyên kích thước cũ */
    width: 54px;
    height: 54px;
    background: #1a1a1a;
    border: 1px solid #444;
    position: relative;
    overflow: hidden;
    /* Cắt ảnh thừa */
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Ảnh item bên trong slot */
.item-img {
    width: 90%;
    /* Nhỏ hơn ô một chút cho đẹp */
    height: 90%;
    object-fit: contain;
    transition: transform 0.2s;
}

/* Hiệu ứng hover làm ảnh nổi lên */
.slot:hover .item-img,
.inv-slot:hover .item-img {
    transform: scale(1.1);
}

/* Icon placeholder mờ mờ khi không có đồ */
.placeholder-icon {
    font-size: 24px;
    opacity: 0.2;
    filter: grayscale(100%);
}

/* --- CÁC CSS CŨ (LAYOUT) GIỮ NGUYÊN --- */
.char-page {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    gap: 20px;
    height: 100%;
}

.panel {
    background: #1e1e1e;
    border: 1px solid #333;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.panel-header {
    padding: 12px;
    text-align: center;
    font-weight: bold;
    background: rgba(0, 0, 0, 0.3);
    border-bottom: 1px solid #333;
}

.panel-body {
    padding: 20px;
    flex: 1;
    overflow-y: auto;
}

.stat-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    color: #aaa;
}

.stats-panel {
    border-color: #00b4d8;
}

.stats-panel .panel-header {
    color: #00b4d8;
}

.equip-panel {
    border-color: #ef476f;
}

.equip-panel .panel-header {
    color: #ef476f;
}

.inv-panel {
    border-color: #ffd166;
}

.inv-panel .panel-header {
    color: #ffd166;
}

.equip-body {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.char-model {
    width: 150px;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.slots-side {
    position: absolute;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.left {
    left: 20px;
}

.right {
    right: 20px;
}

.inv-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.inv-slot.empty {
    border-style: dashed;
    opacity: 0.3;
}
</style>