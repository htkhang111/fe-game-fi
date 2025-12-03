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
                    <img src="https://cdn-icons-png.flaticon.com/512/9408/9408175.png" alt="Character"
                        class="char-img" />
                </div>
            </div>
        </div>

        <div class="panel inv-panel">
            <div class="panel-header">🎒 TÚI ĐỒ</div>
            <div class="panel-body inv-grid">
            </div>
        </div>
    </div>
</template>

<script setup>
import { usePlayerStore } from '@/stores/player';
const playerStore = usePlayerStore();
</script>

<style scoped>
/* CSS giữ nguyên từ file cũ của bạn */
.char-page {
    display: grid;
    grid-template-columns: 300px 1fr 300px;
    gap: 20px;
    height: 100%;
    color: white;
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

.char-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 10px rgba(0, 0, 0, 0.5));
}

.char-model {
    width: 150px;
    height: 250px;
    margin: 0 auto;
}
</style>