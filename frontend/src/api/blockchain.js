import axios from 'axios';
const server = 'http://localhost:8080/api'

axios.defaults.withCredentials = true;

export async function registerAccount(payload){
    const response = await axios.post(`${server}/account/register`, payload)

    const { status, data } = response;

    if( status !== 201 ){
        throw response;
    }

    return response;
}

export async function Login(payload){
    const response = await axios.post(`${server}/account/login`, payload)

    const { status, data } = response;

    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function Logout(){
    const response = await axios.delete(`${server}/account/logout`)

    const { status, data } = response;

    if( status !== 204  ){
        throw response;
    }

    return response;
}

export async function getProfile(){
    const response = await axios.get(`${server}/account/profile`)

    const { status, data } = response;

    
    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function getWalletBalance(){
    const response = await axios.get(`${server}/account/balance`)

    const { status, data } = response;

    
    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function depositAmount(payload){
    const response = await axios.post(`${server}/account/cashin`, payload)

    const { status, data } = response;

    if( status !== 201 ){
        throw response;
    }

    return response;
}

export async function getWalletTransactions(){
    const response = await axios.get(`${server}/account/wallettransactions`)

    const { status, data } = response;

    
    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function isLoggedIn(){
    const response = await axios.get(`${server}/account/login`)

    const { status, data } = response;

    
    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function getAvailableCampaigns(){
    const response = await axios.get(`${server}/account/getavailablecampaigns`)

    const { status, data } = response;

    
    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function getCampaignDetails(payload){
    const response = await axios.get(`${server}/account/getcampaigndetails/${payload}`);

    const { status, data } = response;

    
    if( status !== 200  ){
        throw response;
    }

    return response;
}

export async function investAmount(payload){
    const response = await axios.post(`${server}/account/invest`, payload)

    const { status, data } = response;

    if( status !== 201 ){
        throw response;
    }

    return response;
}