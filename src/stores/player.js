// src/stores/player.js
import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const usePlayerStore = defineStore('player', () => {
  // Stats giữ nguyên...
  const stats = reactive({
    lv: 5, exp: 1250, hp: 500, maxHp: 500,
    energy: 80, maxEnergy: 100, atk: 45, def: 20, spd: 15
  });

  // Equipment: Lưu tên file ảnh
  const equipment = reactive({
    weapon: { id: 1, name: 'Kiếm Gỗ', type: 'equipment', slot: 'weapon', icon: 'sword_1.png', stats: { atk: 5 } },
    // Lưu ý: Nếu ô nào trống thì để null
    armor: null,
    gloves: null,
    necklace: null,
    ring: null,
    boots: null,
    mount: null
  });

  // Inventory: Lưu tên file ảnh
  const inventory = reactive([
    // Nhớ đảm bảo bro đã có các file ảnh này trong thư mục assets/img/items/
    { id: 2, name: 'Áo Vải', type: 'equipment', slot: 'armor', icon: 'armor_1.png', stats: { def: 3 } },
    { id: 3, name: 'Găng Len', type: 'equipment', slot: 'gloves', icon: 'gloves_1.png', stats: { def: 1 } },
    { id: 4, name: 'Bình Máu', type: 'consumable', icon: 'potion_hp.png', effect: 'Heal' },
  ]);

  // ... Giữ nguyên logic equipItem/unequipItem như cũ ...
  // (Chỉ cần copy lại logic cũ vào đây nếu file này bị mất, logic không đổi)
  const equipItem = (item) => {
    if (item.type !== 'equipment') return;
    const slot = item.slot;
    if (equipment[slot]) {
      inventory.push(equipment[slot]);
    }
    equipment[slot] = item;
    const index = inventory.findIndex(i => i.id === item.id);
    if (index > -1) inventory.splice(index, 1);
  };

  const unequipItem = (slot) => {
    if (!equipment[slot]) return;
    inventory.push(equipment[slot]);
    equipment[slot] = null;
  };

  return { stats, equipment, inventory, equipItem, unequipItem };
});