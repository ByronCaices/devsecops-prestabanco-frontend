import httpClient from "../http-common";

const simulate = data => {
    return httpClient.post('/simulate', data);
}

const getasda = () => {
    return httpClient.get('/api/v1/employees/');
}

const create = data => {
    return httpClient.post("/api/v1/employees/", data);
}

const get = id => {
    return httpClient.get(`/api/v1/employees/${id}`);
}

const update = data => {
    return httpClient.put('/api/v1/employees/', data);
}

const remove = id => {
    return httpClient.delete(`/api/v1/employees/${id}`);
}
export default { getasda, create, get, update, remove, simulate };