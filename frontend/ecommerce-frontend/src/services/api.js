import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", //porta do backend
});

export default api;
