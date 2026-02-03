import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true, // Eğer backend'de allowCredentials(true) varsa
});

export default api;
