import axios from "axios";

const api = axios.create({
  baseURL: "https://collabnest-m2h3.onrender.com/api",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login"; // redirect
    }
    return Promise.reject(error);
  }
);

export default api;
