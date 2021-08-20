import moment from 'moment';

export default {
    get userCredentials() {
        const userCredentials = localStorage.getItem("userCredentials");
        if(userCredentials){
            const parsedCreds = JSON.parse(userCredentials);
            return {
                ...parsedCreds,
                isValid:true
            };
        }
        return {
            isValid:false
        }
    }

}