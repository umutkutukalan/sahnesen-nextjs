import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Eğer backend'de allowCredentials(true) varsa
});

export default api;
