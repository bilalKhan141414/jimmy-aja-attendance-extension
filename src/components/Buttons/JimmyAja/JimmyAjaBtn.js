import React from 'react'
import "./JimmyAjaBtn.scss";


export default function JimmyAjaBtn({className, text, ...rest}) {
    return (
        <div className={`extensionInOutControl flex justify-center items-center ${className}`} {...rest}>
            {text}
        </div>
    )
}
