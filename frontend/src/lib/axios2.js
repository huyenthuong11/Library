import axios from "axios";

const api2 = axios.create({
    baseURL: "http://127.0.0.1:5000",
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