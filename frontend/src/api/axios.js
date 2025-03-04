import axios from "axios";
import { apiUrl } from "../data/contentOption"

const BASE_URL = apiUrl.API_BASE_URL_DEV;

export default axios.create({
    baseURL: BASE_URL
});