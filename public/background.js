
const Helpers = {
    getTodayDate: function (withTime = false){
        return withTime ? moment().format("DD-MM-YYYY HH:mm:ss") :  moment().format("DD-MM-YYYY");
    },
    isDayOff: function(){
        let todaysDay = moment().isoWeekday();
        return todaysDay == 6 || todaysDay == 7;
    }
}//end Heplers

const StateManager = {
    initialState:{
        jimmyAja:{
            isCheckedIn:false,
            inDate:"",
            isCheckedOut:false,
            outDate:"",
        }
    },
    state:{
        jimmyAja:{
            isCheckedIn:false,
            inDate:Helpers.getTodayDate(),
            isCheckedOut:false,
            outDate:Helpers.getTodayDate(),
            process:{
                checkout:false,
            }
        }
    },
    set State (state) {
        localStorage.setItem("state", JSON.stringify(state));
        this.state = state;
    },
    get State(){
        const state = localStorage.getItem("state");
        return state && JSON.parse(state);
    },
    get jimmy() {
        return this.State.jimmyAja
    },
    reset:function(appName){
        if(!this.state.hasOwnProperty(appName)){
            console.error("Failed to reset state:: Reason: No such Application Name found")
            return;
        }
        this.state[appName] = this.initialState[appName];
    },
    
    sotrageHasData:function () {
        return localStorage.getItem("state") != null
    },

    isJimmyAjaCheckedIN: function () {
        const isCheckedIn = this.jimmy.isCheckedIn;
        const inDate = this.jimmy.inDate;
        console.log("jimmy aja is jimmy aja checkedIN::", moment(inDate, "DD-MM-YYYY").format("DD-MM-YYYY"),moment(inDate).format("DD-MM-YYYY") === moment(Helpers.getTodayDate()).format("DD-MM-YYYY"));
        return isCheckedIn && moment(inDate, "DD-MM-YYYY").format("DD-MM-YYYY") === Helpers.getTodayDate();
    },

    isJimmyAjaCheckedOut: function () {
        const isCheckedOut = this.jimmy.isCheckedOut;
        const outDate = this.jimmy.outDate;
        console.log("jimmy aja is jimmy aja checkedIN", this.jimmy);
        return isCheckedOut && moment(outDate).format("DD-MM-YYYY") === Helpers.getTodayDate();
    }
}//end State Manager


const RequestManager = {
    handleContentScriptRequest : function (request, sender, senderResponse) {
        switch (request.type) {
            case "ALREADY_IN":
                senderResponse({
                    type:request.type,
                    payload : {
                        isCheckedIn: (StateManager.sotrageHasData() && StateManager.isJimmyAjaCheckedIN()),
                        isCheckedOut: (StateManager.sotrageHasData() && StateManager.isJimmyAjaCheckedOut()),
                        process: {...StateManager.State.jimmyAja.process}
                    }
                })
                
                break;
                case "CHECK_IN": {
                    const state = StateManager.State;
                    state.jimmyAja.isCheckedIn =true;
                    state.jimmyAja.inDate = Helpers.getTodayDate(true);
                    StateManager.State = state;
                    console.log("check in ")
                    senderResponse({
                        type:request.type,
                        payload : {
                            isCheckedIn: true,
                            isCheckedOut: state.jimmyAja.isCheckedOut,
                            process: {...state.jimmyAja.process}
                        }
                    })
                }
                break;
                case "CHECK_OUT":{
                    const state = StateManager.State;
                    state.jimmyAja.isCheckedOut = false;
                    state.jimmyAja.outDate = Helpers.getTodayDate(true);
                    StateManager.State = state;
                        
                    senderResponse({
                        type:request.type,
                        payload : {
                            isCheckedOut: true,
                            isCheckedIn: state.jimmyAja.isCheckedIn
                        }
                    })
                }
                break;
                case "MARKING_CHECK_OUT_IN_PROGRESS":{
                    const state = StateManager.State;
                    state.jimmyAja.process.checkout= true;
                    StateManager.State = state;
                }
                break;
            default:
                break;
        }
    }
}

console.log("Jiimy aja ", localStorage.getItem("state"));

chrome.runtime.onMessage.addListener(RequestManager.handleContentScriptRequest)

