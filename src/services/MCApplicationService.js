import httpClient from "../http-common";

const create = data => {
    return httpClient.post('/mc-application', data);   
}

const getAllByClient = id => {
    return httpClient.get(`/mc-application/getAllbyClient/${id}`);
}

const getById = id => {
    return httpClient.get(`/mc-application/getById/${id}`);
}

export default { create, getAllByClient, getById};