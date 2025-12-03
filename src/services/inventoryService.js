import axios from 'axios';

// Giả sử bạn chạy json-server ở port 3000
const API_URL = 'http://localhost:3000/inventory';

export default {
  // Lấy toàn bộ túi đồ
  async getInventory() {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Lỗi load inventory:", error);
      return [];
    }
  },

  // Cập nhật item (ví dụ sau khi dùng potion, giảm số lượng)
  async updateItem(item) {
    try {
      // Với json-server, dùng PUT hoặc PATCH theo ID
      await axios.put(`${API_URL}/${item.id}`, item);
    } catch (error) {
      console.error("Lỗi update item:", error);
    }
  },

  // Xóa item (nếu dùng hết)
  async deleteItem(itemId) {
    try {
      await axios.delete(`${API_URL}/${itemId}`);
    } catch (error) {
      console.error("Lỗi xóa item:", error);
    }
  }
};