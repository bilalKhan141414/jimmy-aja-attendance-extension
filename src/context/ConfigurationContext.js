
import { constant } from 'lodash';
import React, { useEffect, useState } from 'react'
import constants from '../constants';
import jimmyaja from '../helpers/jimmyaja';
export const ConfigurationContext = React.createContext({});

function ConfigurationContextProvider({children}) {
    const [state, setState] = useState({
        baseUrl: window.location.origin,
        jimmyAja:{
            isModalOpen:false,
            isCheckedIn:false,
            isCheckedOut:false,
        }
    })

    useEffect(()=>{
        window.postMessage({type:constants.WELCOME_MESSAGE}, "*")
        window.addEventListener("message", function(e){
            if(e.source != window) return;
            if(e.data.type){
                console.log("popup::", e.data);
                switch (e.data.type) {
                    case constants.WELCOME_MESSAGE_RESPONSE:
                        setState(prevState => ({
                            ...prevState,
                            baseUrl:e.data.payload.baseUrl.substr(0, e.data.payload.baseUrl.lastIndexOf("/"))
                        }));
                        break;
                    case constants.MARK_ATTENDANCE:
                        console.log("e.data::", e.data);
                        if( jimmyaja.isThisValidHour() ) {
                            checkForValidHour();
                            return;
                        }

                        jimmyaja.markAttendanceOnJimmyAja(()=>{
                            console.log("requesting for atttendance marked sucess full")
                            window.postMessage({type: constants.ATTANDANCE_MARKED_SUCCESSFULL }, "*")
                        });
                        break;
                    case constants.TODAYS_ATTENDANCE_DONE:
                            console.log("popup::requesting for atttendance marked sucess full",e.data.payload)
                            setState(prevState => ({
                                ...prevState,
                                jimmyAja:{
                                    ...prevState.jimmyAja,
                                    ...e.data.payload
                                }
                            }));
                        break;
                        
                    case constants.COMPLETE_CHECKOUT:
                        console.log("popup::Starting process of COMPLETE_CHECKOUT",e.data.payload)
                        jimmyaja.markAttendanceOnJimmyAja(constants.OUT, ()=>{
                            window.postMessage({type: constants.MARKED_CHECK_OUT }, "*")
                        });
                    break;
                    default:
                        break;
                }
            }
        })//end event listener
    },[]);
    const checkForValidHour = () => {
        const validHourInterval = setInterval(()=>{
            console.log("waiting for valid hour")
            if( jimmyaja.isThisValidHour() ) return;
            console.log("valid hour")
            jimmyaja.markAttendanceOnJimmyAja("IN", ()=>{
                window.postMessage({type: constants.ATTANDANCE_MARKED_SUCCESSFULL }, "*")
            });
            clearInterval(validHourInterval);
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
        jimmyaja.markAttendanceOnJimmyAja(type,()=>{
            window.postMessage({type: constants.MARKED_CHECK_OUT }, "*")
        });
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