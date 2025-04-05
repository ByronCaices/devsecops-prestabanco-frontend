import httpClient from "../http-common";

const login = data => {
    return httpClient.post('/user/login',data)
}

const register = data => {
    return httpClient.post('/user/register',data)
}

const getNameById = id => {
    return httpClient.get(`/user/getNameById/${id}`)
}

export default {login,register,getNameById};