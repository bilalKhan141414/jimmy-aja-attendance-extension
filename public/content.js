const storage = chrome.storage.local;
const communicator = chrome.runtime;
function bootstrap () {
    const extensionOrigin = `chrome-extension://${chrome.runtime.id}`;

    if(!location.ancestorOrigins.contains(extensionOrigin)){
        fetch(chrome.runtime.getURL("index.html"))
        .then(response => response.text())
        .then(html => {
            const styleStashHTML = html.replace(/\/static\//g, `${extensionOrigin}/static/`);
            $(styleStashHTML).appendTo("body");
        })
        .catch(console.warn)
    }
}

if(!window.location.href.includes("http://localhost"))
bootstrap();

window.addEventListener("message", function (e) {
    if(e.source != window) return;
    if(e.data.type){
        console.log("content::message::",e.data)
        switch (e.data.type) {
            case "WELCOME_MESSAGE": {
                window.postMessage({
                    type:"WELCOME_MESSAGE_RESPONSE",
                    payload:{
                        message:"Welcome now you can communicate with chrome extension",
                        baseUrl: chrome.runtime.getURL("")
                    }
                }, "*");
                chrome.runtime.sendMessage({ type: "ALREADY_IN" }, BackgroundManager.CheckAlreadyIn)
            }
            break;
            case "ATTANDANCE_MARKED_SUCCESSFULL": {
                console.log("message::ATTANDANCE_MARKED_SUCCESSFULL",e.data)
                BackgroundManager.HandleAttendanceMarkedSuccessfull();
            }
            break;   
            case "MARKING_CHECK_OUT_IN_PROGRESS":
                chrome.runtime.sendMessage({ type: "MARKING_CHECK_OUT_IN_PROGRESS", payload:{...e.data.payload} }, BackgroundManager.CheckAlreadyIn)
                break;
            case "MARKED_CHECK_OUT":
                BackgroundManager.HandleMarkedCheckOut();
                break;   
            case "SAVE_CURRENT_URL":
                BackgroundManager.RequestBgScriptToSaveUrl(e.data.payload);
                break;
            case "START_WAITING_FOR_VALID_HOUR":{   
                BackgroundManager.CheckForValidHour();
            }
            break;
            case "AUTO_CHECKOUT_USER_CHOICE":
            {
                //Step 6 step 5 is on line #162 next step is line #343 in background script
                chrome.runtime.sendMessage({ type: "AUTO_CHECKOUT_USER_CHOICE",  payload:{ ...e.data.payload }}, BackgroundManager.HandleMarkAttendanceRepsone)
            }
            break;
            case "CONFIG.GET":
            {
                console.log("Config.get")
                chrome.runtime.sendMessage({ 
                    type: "CONFIG.GET",  
                    payload:{ ...e.data.payload }
                }, BackgroundManager.HandleConfigResponse)
            }
            break;
            case "CONFIG.SET":
            {
                console.log("CONFIG.SET")
                chrome.runtime.sendMessage({ 
                    type: "CONFIG.SET",  
                    payload:{ ...e.data.payload }
                }, BackgroundManager.HandleConfigResponse)
            }
            break;
            default:
                break;
        }
    }
})

//OnTabFirstLoad
chrome.runtime.sendMessage({ type: "GET_TAB_ID" }, response => {
    console.log('My tabId is', response);
    localStorage.setItem("tabId", response.payload.tabId);
});
//reading message from background or popup script
chrome.runtime.onMessage.addListener(function (response, sender, senderRequest){
    
    console.log("message::----------------", response);
    switch (response.type) {
        case "AUTO_JIMMYAJA_CHECKOUT_ORDER":{
                
            // AutoCheckout Step 3 and Step 2 at line # 180 in background script next step in ConfigurationContext #113
            window.postMessage({
                type:"AUTO_JIMMYAJA_CHECKOUT_ORDER",
                payload:{
                    ...response.payload
                }
            }, "*");
        }
        break;
    
        default:
            break;
    }
    if(response.type && response.type === "ACTIVE_TAB_ID"){
        console.log("Intervals::MessageFromTab onMessageFromBackgroundScript" )
        storage.get(["activeTabId"], function (result){
            if(+response.payload.tabId != +result.activeTabId){
                console.log("Intervals::MessageFromTab", response, response.payload.tabId, result, result && result.activeTabId);
                storage.set({
                    "activeTabId": localStorage.getItem("tabId"), 
                    "prevActiveTab":  result && result.activeTabId
                }, function(){
                    window.postMessage({type:"ON_TAB_FOCUS", payload:{...response.payload}})
                    HelperFunctions.isThisInValidHour() && localStorage.getItem("wasWaitingForValidItem") && BackgroundManager.CheckForValidHour();
                });
            }
        });
    }
    return true;
});



const BackgroundManager = {
    validHourInterval:null,
    checkOutTimeInterval:null,
    HandleMarkAttendanceRepsone: function(response) {
        window.postMessage({ type: "TODAYS_ATTENDANCE_DONE", payload:{...response.payload}}, "*");
    },
    HandleConfigResponse:function(response){
        console.log("response::", response)
        window.postMessage({ type: `${response.type}.SERVER`, payload:{...response.payload}}, "*");
    },
    CheckAlreadyIn : function(response) {
        console.log("content::checkAlreadyIn::", response, response.payload.isCheckedIn);
        if(!response.payload.isCheckedIn && (!response.payload.process || (!response.payload.process.checkout && !response.payload.process.checkin))){
            if(response.payload.userCredentials && response.payload.userCredentials.companyCode){
                console.log("not logged IN")
                window.postMessage({ type: "MARK_ATTENDANCE", payload:{...response.payload}}, "*");
            }
        }
        else{
            if(!response.payload.process || (!response.payload.process.checkout && !response.payload.process.checkin))
            {
                BackgroundManager.HandleMarkAttendanceRepsone(response);
            }
            else {
                response.payload.process && (response.payload.process.checkout) && window.postMessage({ type: "COMPLETE_CHECKOUT" }, "*");
                response.payload.process && (response.payload.process.checkin) && window.postMessage({ type: "COMPLETE_CHECKIN" }, "*");
            }
        }
    },
    WelcomMessageResponse: function(response) {
        if(!response.payload.isCheckedIn && (!response.payload.process || !response.payload.process.checkout)){
            console.log("not logged IN")
            window.postMessage({
                type:"WELCOME_MESSAGE_RESPONSE",
                payload:{
                    ...response.payload,
                    message:"Welcome now you can communicate with chrome extension",
                    baseUrl: chrome.runtime.getURL("")
                }
            }, "*");
        }
    },
    HandleAttendanceMarkedSuccessfull: function() {
        console.log("storing check in ")
        chrome.runtime.sendMessage({ type: "CHECK_IN" }, this.HandleMarkAttendanceRepsone)
    },
    HandleMarkedCheckOut: function () {
        chrome.runtime.sendMessage({ type: "CHECK_OUT" }, this.HandleMarkAttendanceRepsone)
    },
    RequestBgScriptToSaveUrl : function (payload) {
        console.log("content::SAVE_CURRENT_URL",payload)
        chrome.runtime.sendMessage({ type: "SAVE_CURRENT_URL", payload }, function (response) {
            window.postMessage({ type: "CURRENT_URL_SAVED", payload:{...response.payload}}, "*");
        })
    },
    CheckForValidHour : function(){
        // console.log("Intervals::CheckForValidHour")
        var intCount = 0
        this.validHourInterval = setInterval(function() {
            console.log("Intervals::waiting for valid hour",  ++intCount)

            storage.get(["activeTabId"], function(result){
                if(+result.activeTabId !== +localStorage.getItem("tabId")){
                    
                    for (let index = 0; index <= BackgroundManager.validHourInterval; index++) {
                        clearInterval(index);                        
                    }
                    BackgroundManager.validHourInterval = null;

                    console.log("Intervals::clearing Interval ids mismatch----------------------------------------")

                    return;
                }

                if( HelperFunctions.isThisInValidHour() ) return;

                console.log("Intervals::valid hour")

                window.postMessage({ type: "MARK_ATTENDANCE" }, "*");

                for (let index = 0; index <= BackgroundManager.validHourInterval; index++) {
                    clearInterval(index);                        
                }
                BackgroundManager.validHourInterval = null;

                console.log("Intervals::clearing Interval Marking Attendance----------------------------------------")
            });
        }, 10000, intCount)
    },
    CheckForCheckOutTime: function() {
        
    }
}

const HelperFunctions = {
    
    isThisInValidHour: function(){
        console.log("Intervals::current houre",this.getCurrentHour() );
        const userCredentials = localStorage.getItem("userCredentials");
        let startHour = 9;
        if(userCredentials){
            startHour = JSON.parse(JSON.parse(userCredentials)).startHour;
        }

        return (this.getCurrentHour() <= startHour || this.getCurrentHour() >= 23); //current houre is less than 9 and greator than or equals to 11 pm
    },
    getCurrentHour: function(){
        return moment().format("H");
    },
}

//check is already marked attendance  :- Ctrl + G  Line # 32 

//if not then send command to popup to mark attendance  :- Ctrl + G  Line # 54 

//Wait for marking attendance success acknowledgment :- Ctrl + G  Line # 33 
//on Acknowledgment request background script to save todays attendance

