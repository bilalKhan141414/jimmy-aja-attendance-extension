
import { constant } from 'lodash';
import React, { useEffect, useState } from 'react'
import constants from '../constants';
import jimmyaja from '../helpers/jimmyaja';
import $ from 'jquery';
import moment from 'moment';
export const ConfigurationContext = React.createContext({});
let validHourInterval = null
function ConfigurationContextProvider({children}) {
    const [state, setState] = useState({
        baseUrl: window.location.origin,
        jimmyAja:{
            isModalOpen:false,
            isCheckedIn:false,
            isCheckedOut:false,
            autoCheckOut:{
                checkOut:false,
                payload:{}
            }
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
                        
                        const payload = {...e.data.payload};
                        if(payload.process.autoCheckOut){
                            delete payload.process;
                            setState(prevState => ({
                                ...prevState,
                                jimmyAja:{
                                    ...prevState.jimmyAja,
                                    autoCheckOut:{
                                        checkOut:true,
                                        ...payload
                                    }
                                }
                            }));
                        }
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
                            setState(prevState => ({
                                ...prevState,
                                jimmyAja:{
                                    ...prevState.jimmyAja,
                                    ...payload
                                }
                            }));
                            console.log("test::e.data", e.data.payload)
                            
                            if(window.location.href.includes("https://jimmyaja.com") && !e.data.opener) {
                                if(!e.data.payload.process.wasNewPage) {
                                    if(e.data.payload.url.includes("https://jimmyaja.com") || !e.data.payload.url){
                                        window.close();
                                    }else{
                                        window.location.href = e.data.payload.url;
                                    }
                                }
                                else {
                                    try {
                                        window.opener && window.opener.postMessage({ type: constants.TODAYS_ATTENDANCE_DONE, opener:true, payload:{...e.data.payload}}, "*");
                                        
                                    } catch (error) {
                                        console.error("JimmyError", error);
                                    }
                                    window.location.hash.includes("#auto_checkout_process") && window.close();
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
                    case constants.COMPLETE_CHECKIN:
                        {
                            console.log("popup::Starting process of COMPLETE_CHECKIN",e.data.payload)
                            jimmyaja.markAttendanceOnJimmyAja(constants.IN, inRequestCallback);
                        }
                        break;
                    case constants.CURRENT_URL_SAVED: 
                        {
                            jimmyaja.markAttendanceOnJimmyAja(e.data.payload.type, outRequestCallback ,true);
                        }
                    break;
                    case constants.AUTO_JIMMYAJA_CHECKOUT_ORDER:
                    {
                        //Autocheckout step 4 step 3 at line #74 next step #161
                        const payload = {...e.data.payload};
                           
                        setState(prevState => ({
                            ...prevState,
                            jimmyAja:{
                                ...prevState.jimmyAja,
                                autoCheckOut:{
                                    checkOut:true,
                                    ...payload
                                }
                            }
                        }));
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
    const handleApplicationBtnClick = (e, appBtnType) =>{
        e.preventDefault();
        e.stopPropagation();
        if(state.jimmyAja.isModalOpen && !e.target.classList.contains("extensionJimmyAjaPopup")){
            return;
        }
        console.log("applicationEvent::", e, e.source);
        switch (appBtnType) {
            case constants.APP_BTN_TYPES.JIMMY:

                //To Do : user denies the request to mark checkout at jimmy aja (Request content script to save user choice)
                // step 5 step 4 is on line #113 next step is on line #57 in Contenct script
                window.postMessage({type:constants.AUTO_CHECKOUT_USER_CHOICE, payload:{
                    userChoice: constants.ENUMS.USER_CHOICE.AUTO_CHECKOUT.DENIED
                }}, "*")
                setState((prevState)=>({
                    ...prevState,
                    jimmyAja:{
                        ...prevState.jimmyAja,
                        isModalOpen:!prevState.jimmyAja.isModalOpen,
                        autoCheckOut:{
                            checkOut:false,
                            payload:{}
                        }
                    }
                }));
                break;
        
            default:
                break;
        }
    }
    const handleInOutClick = (type) => {
        if(type === "OUT")
        {
            window.postMessage({type: constants.MARKING_CHECK_OUT_IN_PROGRESS, payload:{process:{checkout:true}}}, "*")
            return;
        }
        
        window.postMessage({type: constants.MARKING_CHECK_OUT_IN_PROGRESS, payload:{process:{checkin:true}}}, "*")
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