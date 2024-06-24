import axios from "axios";
import request from "request-promise"
import { createCustomError } from "../utils/errors/customError.js";

const { SAHCO_HR_SERVER, SAHCO_DOCS_SERVER } = process.env

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
const docsInstance = API(SAHCO_DOCS_SERVER, defaultHeaders)

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

export const updateCertificateStatus = async () => {
    try {
        const { data } = await docsInstance.patch(`/manual/update-status`)
        return data
    } catch (e) {
        throw createCustomError(e?.response?.data?.message, e?.response?.status);
    }
}

export const makeRequest = async (method, endpoint, token, data, query) => {
    try {
        const uri = `${SAHCO_HR_SERVER}/${endpoint}`
        const options = {
            uri,
            method,
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-SAHCOAPI-KEY": token
            },
            json: true // Automatically parses the JSON string in the response
        };
        if (data && Object.keys(data).length > 0) options.body = data
        if (query && Object.keys(query).length > 0) options.qs = query
        const res = await request(options)
          
        return res
    } catch (e) {
        throw createCustomError(e?.response?.data?.message, e?.response?.status);
    }
}