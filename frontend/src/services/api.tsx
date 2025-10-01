import axios from 'axios';

const api = axios.create({
    baseURL: "https://ai-food-vision.onrender.com"
});

export default api;