import { jwtDecode } from 'jwt-decode';


export const isTokenExpired = (token) => {
    if (!token) return true;

    const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;

    try {
        const decoded = jwtDecode(tokenValue);
        const expirationTime = decoded.exp * 1000; 
        const currentTime = Date.now(); 
        const safetyBuffer = 300000; 
        
        return currentTime > (expirationTime - safetyBuffer); 

    } catch (e) {
        console.error("Error decoding token:", e);
        return true; 
    }
};

//lấy thông tin người dùng từ localStorage
export const getLocalStorageUser = () => {
    try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            return JSON.parse(storedUser);
        }
    } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        localStorage.removeItem('currentUser');
    }
    return null;
};