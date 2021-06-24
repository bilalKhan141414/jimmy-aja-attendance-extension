import React from 'react'
import ImageLoader from '../../Image/ImageLoader'
import "./ApplicationBtn.scss";

export default function ApplicationBtn({ appLogoUrl , className, ...rest }) {
    return (
        <div className={`applicationButton ${className}`} {...rest}>
            <ImageLoader 
                src={appLogoUrl}
                alt="AppButtonLogo"
            />
        </div>
    )
}
