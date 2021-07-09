
const Helpers = {
    getTodayDate: function (withTime = false){
        return withTime ? moment().format("DD-MM-YYYY HH:mm:ss") :  moment().format("DD-MM-YYYY");
    },
    getTime: function (date, formate) {
        return moment(date, "DD-MM-YYYY HH:mm:ss").format(formate);
    },
    isDayOff: function(){
        let todaysDay = moment().isoWeekday();
        return todaysDay == 6 || todaysDay == 7;
    }
}//end Heplers



const BackgroundThreadManager = {

}// end background thread manager





const StateManager = {
    initialState:{
        jimmyAja:{
            isCheckedIn:false,
            inDate:"",
            isCheckedOut:false,
            outDate:"",
            process:{
                checkout:false,
            },
            inTime:{
                hour:"",
                minute:"",
                second:"",
            },
            outTime:{
                hour:"",
                minute:"",
                second:"",
            },
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
                wasNewPage:true,
            },
            payload:{
                url:""
            },
            inTime:{
                get Time(){
                    `${this.hour}:${this.minute}:${this.second}`
                },
                hour:"",
                minute:"",
                second:"",
            },
            outTime:{
                get Time(){
                    `${this.hour}:${this.minute}:${this.second}`
                },
                hour:"",
                minute:"",
                second:"",
            },
        }
    },
    set State (state ) {
        if(state.jimmyAja.isCheckedIn){
            console.log("state::IN if", state);
            state.jimmyAja.inTime.hour = Helpers.getTime(state.jimmyAja.inDate, "HH");
            state.jimmyAja.inTime.minute = Helpers.getTime(state.jimmyAja.inDate, "mm");
            state.jimmyAja.inTime.second = Helpers.getTime(state.jimmyAja.inDate, "ss");
        }
        if(state.jimmyAja.isCheckedOut){
            console.log("state::Out if", state);
            state.jimmyAja.outTime.hour = Helpers.getTime(state.jimmyAja.outDate, "HH");
            state.jimmyAja.outTime.minute = Helpers.getTime(state.jimmyAja.outDate, "mm");
            state.jimmyAja.outTime.second = Helpers.getTime(state.jimmyAja.outDate, "ss");
        }
        
        console.log("state::", state);
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
    get JimmyAjaAlreadyInPayload () {
        return {
            isCheckedIn: (StateManager.sotrageHasData() && StateManager.isJimmyAjaCheckedIN()),
            isCheckedOut: (StateManager.sotrageHasData() && StateManager.isJimmyAjaCheckedOut()),
            process: {...(StateManager.sotrageHasData() ? StateManager.State.jimmyAja.process : {})},
        }
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
        console.log("jimmy aja is jimmy aja checckOut", this.jimmy);
        return isCheckedOut && moment(outDate, "DD-MM-YYYY").format("DD-MM-YYYY") === Helpers.getTodayDate();
    },
}//end State Manager


const RequestManager = {
    handleContentScriptRequest : function (request, sender, senderResponse) {
        switch (request.type) {
            case "GET_TAB_ID":{
                senderResponse({
                    type:request.type,
                    payload : {
                       tabId : sender.tab.id
                    }
                })
            }
            case "ALREADY_IN":
                senderResponse({
                    type:request.type,
                    payload : StateManager.JimmyAjaAlreadyInPayload
                })
                
                break;
            case "CHECK_IN": {
                const state = StateManager.state;
                state.jimmyAja.isCheckedIn =true;
                state.jimmyAja.inDate = Helpers.getTodayDate(true);
                console.log("check in ")
                senderResponse({
                    type:request.type,
                    payload : {
                        isCheckedIn: true,
                        isCheckedOut: state.jimmyAja.isCheckedOut,
                        process: {...state.jimmyAja.process},
                        ...state.jimmyAja.payload
                    }
                });
                state.jimmyAja.process.wasNewPage = true;
                state.jimmyAja.payload.url = "";
                StateManager.State = state;
            }
            break;
            case "CHECK_OUT":{
                const state = StateManager.state;
                state.jimmyAja.isCheckedOut = true;
                state.jimmyAja.outDate = Helpers.getTodayDate(true);
                state.jimmyAja.process.checkout = false;
                    
                senderResponse({
                    type:request.type,
                    payload : {
                        isCheckedOut: true,
                        isCheckedIn: state.jimmyAja.isCheckedIn,
                        process: {...state.jimmyAja.process},
                        ...state.jimmyAja.payload
                    }
                })
                state.jimmyAja.process.wasNewPage = true;
                state.jimmyAja.payload.url = "";
                StateManager.State = state;
            }
            break;
            case "MARKING_CHECK_OUT_IN_PROGRESS":{
                const state = StateManager.state;
                state.jimmyAja.process.checkout= true;
                StateManager.State = state;
                
                senderResponse({
                    type:request.type,
                    payload : {
                        isCheckedOut: false,
                        isCheckedIn: state.jimmyAja.isCheckedIn,
                        process: {...state.jimmyAja.process}
                    }
                })
            }
            break;
            case "SAVE_CURRENT_URL": 
            {
                const state = StateManager.state;
                state.jimmyAja.process.wasNewPage = false;
                state.jimmyAja.payload.url = request.payload.url;
                StateManager.State = state;
                console.log("save_currentUrl::", state);
                senderResponse({
                    type:request.type,
                    payload : {
                        type: request.payload.type
                    }
                })
            }
            break;
            case "SEND_MESSAGE_TO_LAST_ACTIVE_TAB":
            {
                console.log("SEND_MESSAGE_TO_LAST_ACTIVE_TAB",request, request.type+request.payload.prevActiveTabId )
                // senderResponse({})
                chrome.tabs.sendMessage(request.payload.prevActiveTabId, {type:(request.type+request.payload.prevActiveTabId ), payload:{tabId:request.payload.prevActiveTabId}}, function(response) {});
            }
            break;
            default:
                break;
        }
        return true;
    }
}

console.log("Jiimy aja ", localStorage.getItem("state"));

chrome.runtime.onMessage.addListener(RequestManager.handleContentScriptRequest)

async function getCurrentTab() {
    let queryOptions = {  active: false };
     chrome.tabs.query( {  windowId: 160 }, function(tabs){
         console.log("tab::",tabs);

    });
}
chrome.tabs.onActivated.addListener( function(info) {
    var tabId = info.tabId,
    windowId = info.windowId;
    console.log("info::On Active Tab", info);
        
    getCurrentTab();
    chrome.tabs.sendMessage(tabId, {type: "ACTIVE_TAB_ID",payload:{tabId}}, function(response) {
        console.log("payload::On Active Tab",response)
        // chrome.tabs.sendMessage(response.payload.prevActiveTabId, {type:"TAB_MESSAGE" , payload:{tabId:response.payload.prevActiveTabId}}, function(response) {});
    });
});
chrome.tabs.onUpdated.addListener( function(tabId, changeInfo, tab) {
    // var tabId = info.tabId,
    // windowId = info.windowId;
    console.log("info::", tabId, changeInfo, tab)
    // chrome.tabs.sendMessage(tabId, {payload:{tabId}}, function(response) {});
});






