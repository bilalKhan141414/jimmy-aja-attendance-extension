import moment from 'moment';

export default {
    get userCredentials() {
        const userCredentials = localStorage.getItem("userCredentials");
        if(userCredentials){
            const parsedCreds = JSON.parse(userCredentials);
            return {
                ...parsedCreds,
                startHoure: moment(parsedCreds.startTime, "HH:MM:SS").format("HH"),
                isValid:true
            };
        }
        return {
            isValid:false
        }
    }

}