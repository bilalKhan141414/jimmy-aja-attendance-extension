
import { constant } from 'lodash';
import React, { useEffect, useState } from 'react'
import constants from '../constants';
import jimmyaja from '../helpers/jimmyaja';
import $ from 'jquery';
export const ConfigurationContext = React.createContext({});
let validHourInterval = null
function ConfigurationContextProvider({children}) {
    const [state, setState] = useState({
        baseUrl: window.location.origin,
        jimmyAja:{
            isModalOpen:false,
            isCheckedIn:false,
            isCheckedOut:false,
        }
    })
    useEffect(() => {
        console.log("stateChanged::",state);
        return () => {
            
        }
    }, [state])
    useEffect(()=>{
        window.postMessage({type:constants.WELCOME_MESSAGE}, "*")
        window.addEventListener("message", function(e){
            if(e.source != window && !e.data.opener) return;
            if(e.data.type){
                console.log("popup::", e.data );
                switch (e.data.type) {
                    case constants.ON_TAB_FOCUS:{
                        // jimmyaja.isThisInValidHour() && localStorage.getItem("wasWaitingForValidItem") && checkForValidHour();
                        console.log("wasWaitingForValidItem::",jimmyaja.isThisInValidHour() && localStorage.getItem("wasWaitingForValidItem"));
                    }
                        break;
                    case constants.WELCOME_MESSAGE_RESPONSE:
                        {
                            setState(prevState => ({
                                ...prevState,
                                baseUrl:e.data.payload.baseUrl.substr(0, e.data.payload.baseUrl.lastIndexOf("/"))
                            }));
                        }
                        break;
                    case constants.MARK_ATTENDANCE:
                        {
                            console.log("e.data::", e.data);
                            if( jimmyaja.isThisInValidHour() ) {
                                localStorage.setItem("wasWaitingForValidItem", "true")
                                // checkForValidHour();
                                window.postMessage({type:constants.START_WAITING_FOR_VALID_HOUR}, "*" );
                                return;
                            }
    
                            jimmyaja.markAttendanceOnJimmyAja(constants.IN, inRequestCallback);
                        }
                        break;
                    case constants.TODAYS_ATTENDANCE_DONE:
                        {
                            removeValidHourWaitingFromLocalStorage();
                            const payload = {...e.data.payload};
                            delete payload.process;
                            console.log("popup::TODAYS_ATTENDANCE_DONE",payload)
                            setState(prevState => ({
                                ...prevState,
                                jimmyAja:{
                                    ...prevState.jimmyAja,
                                    ...payload
                                }
                            }));
                            if(window.location.href.includes("https://jimmyaja.com") && !e.data.opener) {
                                if(!e.data.payload.process.wasNewPage) {
                                    window.location.href = e.data.payload.url;
                                }
                                else {
                                    window.opener && window.opener.postMessage({ type: constants.TODAYS_ATTENDANCE_DONE, opener:true, payload:{...e.data.payload}}, "*");
                                    window.close();
                                }
                            }
                        }
                        break;
                    case constants.COMPLETE_CHECKOUT:
                        {
                            console.log("popup::Starting process of COMPLETE_CHECKOUT",e.data.payload)
                            jimmyaja.markAttendanceOnJimmyAja(constants.OUT, outRequestCallback);
                        }
                        break;
                    case constants.SAVE_CURRENT_URL: 
                        {
                            jimmyaja.markAttendanceOnJimmyAja(e.data.payload.type, outRequestCallback ,true);
                        }
                    break;
                    default:
                        break;
                }
            }
        })//end event listener
        
        // !jimmyaja.isThisInValidHour() && localStorage.getItem("wasWaitingForValidItem") && checkForValidHour();
        $(window).on("blur", function() {
            console.log("tab::hidden",document.hidden)
            if (validHourInterval)
                clearInterval(validHourInterval);
        });
        if(document.hidden){
            console.log("tab::hidden")
        }
    },[]);
    useEffect(() => {
        console.log("tab::hidden",document.hidden)
    }, [document.hidden])
    const removeValidHourWaitingFromLocalStorage = () => {
        localStorage.getItem("wasWaitingForValidItem") && localStorage.removeItem("wasWaitingForValidItem");
    }
    const checkForValidHour = () => {
        validHourInterval = setInterval(()=>{
            // chrome.storage.local.get(["activeTabId"], function(result){
                console.log("waiting for valid hour")
                // if(+result.activeTabId != +localStorage.getItem("tabId")){
                //     clearInterval(validHourInterval);
                // }
                if( jimmyaja.isThisInValidHour() ) return;
                console.log("valid hour")
                removeValidHourWaitingFromLocalStorage();
                jimmyaja.markAttendanceOnJimmyAja(constants.IN, inRequestCallback);
                clearInterval(validHourInterval);
            // });
        }, 60000)
    }
    const handleApplicationBtnClick = (e, appBtnType) =>{
        e.preventDefault();
        e.stopPropagation();
        if(state.jimmyAja.isModalOpen && !e.target.classList.contains("extensionJimmyAjaPopup")){
            return;
        }
        console.log("applicationEvent::", e, e.source);
        switch (appBtnType) {
            case constants.APP_BTN_TYPES.JIMMY:
                setState((prevState)=>({
                    ...prevState,
                    jimmyAja:{
                        ...prevState.jimmyAja,
                        isModalOpen:!prevState.jimmyAja.isModalOpen
                    }
                }))
                break;
        
            default:
                break;
        }
    }
    const handleInOutClick = (type) => {
        if(type === "OUT")
        {
            window.postMessage({type: constants.MARKING_CHECK_OUT_IN_PROGRESS}, "*")
        }
        // jimmyaja.markAttendanceOnJimmyAja(type, outRequestCallback);
    }
    const inRequestCallback = () => {
        console.log("requesting for atttendance marked sucess full")
        window.postMessage({type: constants.ATTANDANCE_MARKED_SUCCESSFULL }, "*")
    }
    const outRequestCallback = () => {
        window.postMessage({type: constants.MARKED_CHECK_OUT }, "*")
    }
    return (
        <ConfigurationContext.Provider
            value={{...state, handleApplicationBtnClick, handleInOutClick}}
        >
            {children}
        </ConfigurationContext.Provider>
    )
}

export default ConfigurationContextProvider;