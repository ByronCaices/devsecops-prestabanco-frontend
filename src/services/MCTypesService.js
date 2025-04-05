import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/mc-types/getAll')
}

export default {getAll};