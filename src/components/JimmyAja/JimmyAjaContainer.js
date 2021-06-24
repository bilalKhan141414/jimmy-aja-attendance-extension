import React from 'react'
import JimmyAjaBtn from '../Buttons/JimmyAja/JimmyAjaBtn'

export default function JimmyAjaContainer({isCheckedIn, isCheckedOut, handleInOutClick}) {
    return (
        <>
            <JimmyAjaBtn 
                className={`extensionIn ${isCheckedIn && "extensionActive"}`}
                text="IN"
                onClick={(e) => handleInOutClick("IN")}
            />
            <JimmyAjaBtn 
                className={`extensionOut ${isCheckedOut && "extensionActive"}`}
                text="OUT"
                onClick={(e) => handleInOutClick("OUT")}
            />
        </>
    )
}
