const GlobalConstants = {
    USER_CHOICE:{
        AUTO_CHECKOUT:{
            DENIED:0,
            ALLOWED:1,
        }
    }
}


const Helpers = {
    get CurrentHour () {
        return +moment().format("HH");
    },
    get CurrentDate (){ 
        return moment().format("DD-MM-YYYY"); 
    },
    get CurrentDateWithTime (){ 
        return moment().format("DD-MM-YYYY HH:mm:ss"); 
    },
    get IsDayOff (){   
        let todaysDay = moment().isoWeekday();
        return todaysDay == 6 || todaysDay == 7;
    },
    getTodayDate: function (withTime = false) {
        return withTime ? moment().format("DD-MM-YYYY HH:mm:ss") :  moment().format("DD-MM-YYYY");
    },
    getTime: function (date, formate) {
        return moment(date, "DD-MM-YYYY HH:mm:ss").format(formate);
    },
}//end Heplers

const StateManager = {
    initialState:{
        jimmyAja:{
            isCheckedIn:false,
            inDate:"",
            isCheckedOut:false,
            outDate:"",
            process:{
                checkout:false,
                wasNewPage:true,
                autoCheckOut:{
                    inProgress:false,
                    userChoice:null,
                },
            },
            inTime:{
                hour:"",
                minute:"",
                second:"",
                get FullTime(){
                    `${this.hour}:${this.minute}:${this.second}`
                },
            },
            outTime:{
                hour:"",
                minute:"",
                second:"",
                get FullTime(){
                    `${this.hour}:${this.minute}:${this.second}`
                },
            },
            
        }
    },
    state:{
        jimmyAja:{
            isCheckedIn:false,
            inDate:"",
            isCheckedOut:false,
            outDate:"",
            process:{
                checkout:false,
                wasNewPage:true,
                autoCheckOut:{
                    inProgress:false,
                    userChoice:null,
                },
            },
            payload:{
                url:""
            },
            inTime:{
                hour:"",
                minute:"",
                second:"",
                get FullTime(){
                    `${this.hour}:${this.minute}:${this.second}`
                },
            },
            outTime:{
                hour:"",
                minute:"",
                second:"",
                get FullTime(){
                    `${this.hour}:${this.minute}:${this.second}`
                },
            },
            userCredentials:{

            }
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

        return state ? JSON.parse(state) : {...this.state};
    },
    get jimmy() {
        return this.State.jimmyAja
    },
    get HasUserCheckedInToday () {
        const isCheckedIn = this.jimmy.isCheckedIn;
        const inDate = this.jimmy.inDate;
        return isCheckedIn && 
        moment(inDate, "DD-MM-YYYY").format("DD-MM-YYYY") === Helpers.CurrentDate 
    },
    
    get HasUserCheckedOutToday () {
        const isCheckedOut = this.jimmy.isCheckedOut;
        const outDate = this.jimmy.outDate;
        return isCheckedOut && 
        moment(outDate, "DD-MM-YYYY").format("DD-MM-YYYY") === Helpers.CurrentDate 
    },
    get JimmyAjaAlreadyInPayload () {
        return {
            isCheckedIn: (StateManager.sotrageHasData() && StateManager.isJimmyAjaCheckedIN()) || Helpers.IsDayOff,
            isCheckedOut: (StateManager.sotrageHasData() && StateManager.isJimmyAjaCheckedOut()) || Helpers.IsDayOff,
            process: {...(StateManager.sotrageHasData() ? StateManager.State.jimmyAja.process : {})},
        }
    },
    get IsJimmyAjaCheckOutTime () {
        const jimmyAja = this.State.jimmyAja;
        const checkOutHour = +jimmyAja.inTime.hour;
        const currentHour = Helpers.CurrentHour;
        const diff = checkOutHour - currentHour;
        console.log("ThreadAutoJimmyAjaCheckOut::currentHoure::", currentHour, "checkOutHour", checkOutHour);
        return diff >= 8;
    },
    get IsAutoCheckOutInProgress () {
       return this.jimmy.process.autoCheckOut;
    },
    get HasUserDeniedAutoCheckOut () {
        return (this.jimmy.process.autoCheckOut && (!!this.jimmy.process.userChoice));
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
    setAutoCheckOutProcess: function (state) {
        const State = this.State;
        State.jimmyAja.process.autoCheckOut.inProgress = state;
        this.State = State;
    },
    setAutoCheckOutProcessUserChoice: function (choice) {
        const State = this.State;
        State.jimmyAja.process.autoCheckOut.userChoice = choice;
        State.jimmyAja.process.autoCheckOut.inProgress = false;
        this.State = State;
    },
}//end State Manager

const BackgroundThreadManager = {
    threadIds : {
        checkIn : null,
        checkout : null,
    },
    ThreadAutoJimmyAjaCheckOut: function () {
        // AutoCheckout Step 2 and Step 1 at line #380 next step In content script Line #74

        this.threadIds.checkout = setInterval(function() {
            console.log("ThreadAutoJimmyAjaCheckOut::",StateManager.IsJimmyAjaCheckOutTime)
            if(StateManager.IsJimmyAjaCheckOutTime){
                // Order conent script to mark check out

                StateManager.setAutoCheckOutProcess(true);
                const activeTabId = localStorage.getItem("activeTab");

                console.log("ThreadAutoJimmyAjaCheckOut::activeTabId",activeTabId)

                activeTabId && chrome.tabs.sendMessage(
                    +activeTabId, 
                    {
                        type:"AUTO_JIMMYAJA_CHECKOUT_ORDER", 
                        payload:{
                            inTime: StateManager.jimmy.inTime.FullTime,
                            test:"test"
                        }
                    }
                );
                // terminate current thread
                BackgroundThreadManager.TerminateAutoJimmyAjaCheckOutThread();
                
            }
            // Continue waiting...
  
        }, 10000);
        // }, 60000 * 30); // for production
    },
    TerminateAutoJimmyAjaCheckOutThread: function () {
        if(this.threadIds.checkout){
            clearInterval(this.threadIds.checkout);
        }
    },
}// end background thread manager

const RequestManager = {
    handleContentScriptRequest : function (request, sender, senderResponse) {
        switch (request.type) {
            case "GET_TAB_ID":{
                            
                localStorage.setItem("activeTab", sender.tab.id); 
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
                const state = StateManager.State;
                state.jimmyAja.isCheckedIn = true;
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
                BackgroundThreadManager.ThreadAutoJimmyAjaCheckOut();
            }
            break;
            case "CHECK_OUT":{
                const state = StateManager.State;
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

                BackgroundThreadManager.TerminateAutoJimmyAjaCheckOutThread();
            }
            break;
            case "MARKING_CHECK_OUT_IN_PROGRESS":{
                const state = StateManager.State;
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
                const state = StateManager.State;
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
                this.sendOrderToContentScript(
                    request.payload.prevActiveTabId, 
                    {
                        type:(request.type + request.payload.prevActiveTabId), 
                        payload:{
                            tabId:request.payload.prevActiveTabId
                        }
                    }
                );
            }
            break;
            case "AUTO_CHECKOUT_USER_CHOICE":
            {
                //final step 
                StateManager.setAutoCheckOutProcessUserChoice(request.payload.userChoice);
            }
            break;
            case "CONFIG.GET":
            { 
                senderResponse({
                    type:request.type+".SERVER",
                    payload : {...StateManager.State.userCredentials}
                })
            }
            break;
            default:
                break;
        }
        return true;
    },
    sendOrderToContentScript: function (tabId, payload, callback = function(response) {}){
        chrome.tabs.sendMessage(tabId, payload, callback);
    },
}

console.log("Jiimy aja ", localStorage.getItem("state"));

chrome.runtime.onMessage.addListener(RequestManager.handleContentScriptRequest)

chrome.tabs.onActivated.addListener( function(info) {
    var tabId = info.tabId,
    windowId = info.windowId;
    console.log("info::On Active Tab", info);

    localStorage.setItem("activeTab", tabId); 

    chrome.tabs.sendMessage(tabId, {
        type: "ACTIVE_TAB_ID",
        payload:{
            tabId, 
            process:{
                autoCheckout: StateManager.IsAutoCheckOutInProgress,
            },
            inTime: StateManager.jimmy.inTime.FullTime,
            test:"test"
        }
    });
});

// AutoCheckout Step 1
//Auto Checkout Process Starts From Here
StateManager.HasUserCheckedInToday &&
!StateManager.HasUserCheckedOutToday &&
BackgroundThreadManager.ThreadAutoJimmyAjaCheckOut();





