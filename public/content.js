
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
                }, "*")    
                chrome.runtime.sendMessage({ type: "ALREADY_IN" }, BackgroundManager.CheckAlreadyIn)
            }
            break;
            case "ATTANDANCE_MARKED_SUCCESSFULL": {
                console.log("message::ATTANDANCE_MARKED_SUCCESSFULL",e.data)
                BackgroundManager.HandleAttendanceMarkedSuccessfull();
            }
            break;   
            case "MARKING_CHECK_OUT_IN_PROGRESS":
                chrome.runtime.sendMessage({ type: "MARKING_CHECK_OUT_IN_PROGRESS" })
                break;
            case "MARKED_CHECK_OUT":
                BackgroundManager.HandleMarkedCheckOut();
                break;   
            default:
                break;
        }
    }
})


//reading message from background or popup script
chrome.runtime.onMessage.addListener(function (response, sender, senderRequest){
});
// chrome.runtime.onMessage.ad
const BackgroundManager = {
    handleMarkAttendanceRepsone: function(response) {
        window.postMessage({ type: "TODAYS_ATTENDANCE_DONE", payload:{...response.payload}}, "*");
    },
    CheckAlreadyIn : function(response) {
        console.log("content::checkAlreadyIn::", response, response.payload.isCheckedIn);
        if(!response.payload.isCheckedIn){
            console.log("not logged IN")
            window.postMessage({ type: "MARK_ATTENDANCE" }, "*");
        }
        else{
            if(!response.payload.process.checkout)
            {
                BackgroundManager.handleMarkAttendanceRepsone(response);
            }
            else{
                window.postMessage({ type: "COMPLETE_CHECKOUT" }, "*");
            }
        }
    },
    HandleAttendanceMarkedSuccessfull: function() {
        console.log("storing check in ")
        chrome.runtime.sendMessage({ type: "CHECK_IN" }, this.handleMarkAttendanceRepsone)
    },
    HandleMarkedCheckOut: function () {
        chrome.runtime.sendMessage({ type: "CHECK_OUT" }, this.handleMarkAttendanceRepsone)
    }
}



//check is already marked attendance  :- Ctrl + G  Line # 32 

//if not then send command to popup to mark attendance  :- Ctrl + G  Line # 54 

//Wait for marking attendance success acknowledgment :- Ctrl + G  Line # 33 
//on Acknowledgment request background script to save todays attendance

