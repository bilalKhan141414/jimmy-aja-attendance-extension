import React from 'react';
import "./OperationsPopup.scss";
import constants from '../../../constants';

export default function OperationsPopup({
    isCustomHeader = false,
    isModalOpen,
    closeModal,
    header,
    body,
    footer
}) {
    return (
        <div className={`extensionJimmyAjaPopup ${!isModalOpen && "hide"} flex w-full h-full fixed top-0 left-0 justify-center items-center themeFontFamily`} onClick={(e)=> closeModal(e, constants.APP_BTN_TYPES.JIMMY)}>
            <div className="extensionCustomModal inline-block bg-white shadow" style={isModalOpen ? {display:"block"} : {}}>
                <div className="extensionModalHeader">
                    {
                        isCustomHeader ? 
                        header
                        :
                        <h1 className="m-0 p-0">{header}</h1>
                    }
                </div>
                <div className="extensionModalBody">
                   {body}
                </div>
                <div className="extensionModalFooter">
                    {footer}
                </div>
            </div>
            
        </div>
    )
}
