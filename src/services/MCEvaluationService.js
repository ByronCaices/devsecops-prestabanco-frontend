import httpClient from "../http-common";

const updateStatus = (id,status) => {
    return httpClient.put(`/mc-application/updateStatus/${id}`, status);
}

const getAllStatuses = () => {
    return httpClient.get('/mc-application/status/getAll/');
}

const getAllApplications = () => {
    return httpClient.get('/mc-application/getAll/');
}

export default { updateStatus, getAllStatuses, getAllApplications};