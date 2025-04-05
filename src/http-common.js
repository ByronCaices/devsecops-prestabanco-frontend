import axios from "axios";

const prestabancoBackendServer = import.meta.env.VITE_PRESTABANCO_BACKEND_SERVER;
const prestabancoBackendPort = import.meta.env.VITE_PRESTABANCO_BACKEND_PORT;

console.log(prestabancoBackendServer)
console.log(prestabancoBackendPort)

export default axios.create({
    //baseURL: `http://${prestabancoBackendServer}:${prestabancoBackendPort}`,
    baseURL: 'http://34.28.62.239:8090',
    
    headers: {
        'Content-Type': 'application/json'
    }
});