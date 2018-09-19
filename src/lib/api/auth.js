import axios from 'axios';

const apiUrl = 'http://localhost:3001';

export const register = ({
    username,
    password
}) => axios.post(apiUrl + '/api/v1.0/auth/register', {
    username,
    password
});

export const login = ({username, password}) => axios.post(apiUrl + '/api/v1.0/auth/login', {
    username, password
});
// export const checkLoginStatus = () => axios.get('/api/v1.0/auth/check');
// export const logout = () => axios.post('/api/v1.0/auth/logout');
