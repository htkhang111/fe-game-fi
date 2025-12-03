import { createRouter, createWebHistory } from "vue-router";

import Home from "@/views/Home.vue";
import Inventory from "@/views/Inventory.vue";
import Combat from "@/views/Combat.vue";
import Village from "@/views/Village.vue";
import Explore from "@/views/Explore.vue";
import Character from "@/views/Character.vue"; // <--- Import file mới

const routes = [
    // ... (giữ nguyên các route cũ)
    { path: "/", name: "Home", component: Home },
    { path: "/inventory", name: "Inventory", component: Inventory },
    { path: "/village", name: "Village", component: Village },
    { path: "/adventure", name: "Adventure", component: Explore },
    { path: "/combat", name: "Combat", component: Combat },

    // Route mới cho Trang Nhân Vật
    {
        path: "/character",
        name: "Character",
        component: Character
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: "active",
});

export default router;