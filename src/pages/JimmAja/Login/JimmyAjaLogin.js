import React, { useEffect, useState } from 'react'
import contants from './../../../constants';
import JimmyAjaLogo from './../../../assets/images/jimmy_logo.png';
import ImageLoader from '../../../components/Image/ImageLoader';
import './JimmyAjaLogin.scss';
import constants from './../../../constants';

export default function JimmyAjaLogin() {
    const [openCard, setOpenCard] = useState(false)
    const [loginCredentials, setLoginCredentials] = useState({
        companyCode:"",
        email:"",
        password:"",
        startTime:"",
    })
    const [operationProcess, setOperationProcess] = useState({
        isSaving:false,
        isSaved:false,
    })
    const [areLoginDetailsSaved, setAreLoginDetailsSaved] = useState(false)
    useEffect(() => {
        window.postMessage({type:contants.CONFIG.GET}, "*")
        
        window.addEventListener("message", function (e) {
            if(e.source != window) return;
            if(e.data.type){
                 switch (e.data.type) {
                    case constants.CONFIG.GET_SERVER:
                        if(e.data.payload.companyCode){
                            localStorage.setItem("userCredentials", JSON.stringify({...e.data.payload}))
                            setLoginCredentials({...e.data.payload});
                        }else{
                            setAreLoginDetailsSaved(true);
                            setTimeout(()=>{setOpenCard(true)}, 2000)
                        }
                        break;
                    case constants.CONFIG.SET_SERVER:{
                        setOpenCard(false);
                        setTimeout(()=>{
                            setAreLoginDetailsSaved(false);
                            window.postMessage({ type: "MARK_ATTENDANCE", payload:{}}, "*");
                        }, 1000)
                        setOperationProcess(prevState => ({
                            ...prevState,
                            isSaved:true
                        }))
                    }
                    break;
                    default:
                        break;
                 }
            }
        });
    }, [])
    const handleCloseLoginPopup = (e) => {
        console.log("Jimy::openCard::",openCard, e && e.target);
        if(e){
            if(!e.target.classList.contains("cardOverLay")){
                return;
            }
        }
        if(openCard){
            setOpenCard(false);
            setTimeout(()=>{
                setAreLoginDetailsSaved(false);
            }, 1000)
        }
        else{
            console.log("Jimy::elseClosing--------------------------------------------")
            setAreLoginDetailsSaved(false);
        }
    }
    const handleChange = ({target:{name, value}}) => {
        setLoginCredentials(prevState => ({
            ...prevState,
            [name]:value
        }))
    }
    const handleSaveCredentials = () => {

        setOperationProcess(prevState => ({
            ...prevState,
            isSaving:true
        }))
        window.postMessage({
            type:constants.CONFIG.SET, 
            payload:{
                ...loginCredentials,
                startTime: !!loginCredentials.startTime || "9:00:00"
            }
        }, "*")
    }
    const getLoadingMessage = () => {
        if(operationProcess.isSaving){
            return "Please wait saving details...";
        }
        if(operationProcess.isSaving && operationProcess.isSaved) {
            return "Thank you"
        }
        return "Click me when you're done";
    }
    function validateEmail(email) 
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email);
    }
    return (
        
            areLoginDetailsSaved && 
            <div className="cardOverLay" onClick={handleCloseLoginPopup}>
                <div className={`card ${openCard && "active"}`}>
                    <div className="leftSection">
                        <div className="formWraper">
                            <div className="logoContainer">
                                <ImageLoader 
                                    src={JimmyAjaLogo}
                                />
                            </div>
                            <div className="wrap-line">
                                <div className={`brise-input ${loginCredentials.companyCode && "valid"}`}>
                                    <input 
                                        type="text"
                                        value={loginCredentials.companyCode} 
                                        name="companyCode" 
                                        onChange={handleChange}
                                    />
                                    <label>Company Code</label> 
                                    <span className="line"></span>
                                </div>
                                <div className={`brise-input ${loginCredentials.email && "valid"}`}>
                                    <input 
                                        type="text"
                                        value={loginCredentials.email} 
                                        name="email" 
                                        onChange={handleChange}
                                    />
                                    <label>Email</label> 
                                    <span className="line"></span>
                                </div>
                                <div className={`brise-input ${loginCredentials.password && "valid"}`}>
                                    <input 
                                        type="text"
                                        value={loginCredentials.password} 
                                        name="password" 
                                        onChange={handleChange}
                                    />
                                    <label>Password</label>
                                    <span className="line"></span>
                                </div>
                                <div className={`brise-input ${loginCredentials.startTime && "valid"}`}>
                                    <input 
                                        type="text"
                                        value={loginCredentials.startTime} 
                                        name="startTime" 
                                        onChange={handleChange}
                                    />
                                    <label>Start Time (optional)</label>
                                    <span className="line"></span>
                                </div>
                            </div>

                        </div>
                        <div className="leftSectionInfo">
                            <h3 className="infoHeading snellFontFaimly">Welcome to Jimmy</h3>
                            <div className="logoContainer">
                                <ImageLoader 
                                    src={JimmyAjaLogo}
                                />
                            </div>
                            {
                                !openCard && 
                                <p>Loading...</p>
                            }
                            <p className="copyright">
                            Developed by Bilal khan Powered By Ahsan wani's Team.
                            </p>
                        </div>
                    </div>
                    <div className="rightSection">
                        <div className="contentContainer">
                            
                            <button 
                            onClick={handleSaveCredentials}
                            disabled={!(!!loginCredentials.companyCode && !!loginCredentials.email && !!loginCredentials.password && validateEmail(loginCredentials.email))}
                            >
                                {getLoadingMessage()}
                            </button>
                            <p>
                            Enter login details of jimmy aja. <br/>These login details will be used by our extension for future automatic logins to the jimmy aja portal to mark attendance.
                            </p>
                            <p>
                                9:00 AM will be considered<br/> as <b>default start time</b> if not provided
                            </p>
                            <p className="copyright">
                            Copyrights &copy; 2021 All Rights Resevered
                            </p>
                        </div>
                    </div>
                </div>
            </div>
    )
}
