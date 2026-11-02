import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export async function getMe() {
  const { data } = await api.get("/user/me");
  return data;
}