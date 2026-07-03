import axios from "axios";

const api2 = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api2.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
})

export default api2;