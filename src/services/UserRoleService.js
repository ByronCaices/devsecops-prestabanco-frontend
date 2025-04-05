import httpClient from "../http-common";

const getAll = () => {
    return httpClient.get('/user-role/getAll')
}

export default {getAll};