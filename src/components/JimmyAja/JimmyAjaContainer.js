import React from 'react'
import JimmyAjaBtn from '../Buttons/JimmyAja/JimmyAjaBtn'

export default function JimmyAjaContainer({isCheckedIn, isCheckedOut, handleInOutClick, autoCheckOut}) {
    return (
        <>
            {
                autoCheckOut && autoCheckOut.checkOut && 
                <p>
                    Do you want to checkout it's been 8 hours since you marked IN ?
                </p>
            }
            <div className=" flex items-center justify-center">
                <JimmyAjaBtn 
                    className={`extensionIn ${isCheckedIn && "extensionActive"}`}
                    text={autoCheckOut.inTime ? `IN (${autoCheckOut.inTime})`: "IN"}
                    onClick={(e) => handleInOutClick("IN")}
                />
                <JimmyAjaBtn 
                    className={`extensionOut ${isCheckedOut && "extensionActive"}`}
                    text="OUT"
                    onClick={(e) => handleInOutClick("OUT")}
                />
            </div>
        </>
    )
}
