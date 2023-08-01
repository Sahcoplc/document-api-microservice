import axios from "axios";

const { SAHCO_HR_SERVER, FLIGHT_SCHEDULE, RAPIDAPI_HOST, RAPIDAPI_KEY, SAHCO_FLIGHT_SERVER } = process.env

const API = (baseURL, headers) => {
    
    const instance = axios.create({ baseURL, headers });
    
    instance.interceptors.request.use((request) => request);

    instance.interceptors.response.use((response) => response)

    return instance
}

const defaultHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}

const instance = API(SAHCO_HR_SERVER, defaultHeaders)

export const getEmployee = async (apiKey) => {

    try {
        const { data } = await instance.get(`/auth/profile`, {
            headers: {
                "X-SAHCOAPI-KEY": apiKey
            }
        })
        
        return data
    } catch (e) {
        throw createCustomError(e?.response?.data?.message, e?.response?.status);
    }
}

export const getPermission = async (id, apiKey) => {
    
    try {
        const { data } = await instance.get(`/access/${id}`, {
            headers: {
                "X-SAHCOAPI-KEY": apiKey
            }
        })
        
        return data
    } catch (e) {
        throw createCustomError(e?.response?.data?.message, e?.response?.status);
    }
}
