import React, { useState } from 'react';
import JimmyAja from './../../../assets/images/jimmyaja.ico';
import LeftArrow from './../../../assets/svgs/left-arrow.svg';
import RightArrow from './../../../assets/svgs/right-arrow.svg';
import "./LoginControlsPopup.scss";
import ApplicationBtn from './../../Buttons/Application/ApplicationBtn';
import ImageLoader from './../../Image/ImageLoader';
import constants from './../../../constants';


export default function LoginControlsPopup({
    handleApplicationBtnClick
}) {
    const [isPopupCollapsed, setIsPopupCollapsed] = useState(false)
    const onClosePopupClick = (e) => {
        setIsPopupCollapsed(!isPopupCollapsed)
    }
    return (
        <div className={`loginControlsPopup themeFontFamily ${isPopupCollapsed && "close"}`} >
            <div className="loginControls">
                <ApplicationBtn
                    appLogoUrl={JimmyAja}
                    onClick={(e)=>handleApplicationBtnClick(e, constants.APP_BTN_TYPES.JIMMY)}
                />
            </div>
            <div className={`visibilityButton `} next=".leftArrowCloseBtn" prev=".rightArrowCloseBtn">
                <ImageLoader 
                    src={RightArrow}
                    className={`visibilityBtnArrow rightArrowCloseBtn ${!isPopupCollapsed && "hide"}`}
                    alt="right-arrow.svg"
                    onClick={onClosePopupClick} 
                />
                <ImageLoader 
                    src={LeftArrow}
                    className={`visibilityBtnArrow leftArrowCloseBtn  ${isPopupCollapsed && "hide"}`}
                    alt="left-arrow.svg" 
                    onClick={onClosePopupClick} 
                />
            </div>
        </div>
    )
}
