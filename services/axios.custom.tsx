import axios from "axios";

const api = axios.create({
  baseURL: "https://kiemtienthuong.com", // Thay bằng URL API của bạn
  timeout: 10000, // Thời gian timeout (10 giây)
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho request
api.interceptors.request.use(
  (config) => {
    // Thêm token hoặc các header khác nếu cần
    const token = "your-auth-token"; // Thay bằng cách lấy token thực tế
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi chung (ví dụ: 401, 500)
    if (error.response && error.response.status === 401) {
      // Xử lý khi token hết hạn, ví dụ: đăng xuất hoặc làm mới token
      console.log("Unauthorized, logging out...");
    }
    return Promise.reject(error);
  }
);

export default api;
