import React from 'react'
import { ConfigurationContext } from '../../context/ConfigurationContext'

export default function ImageLoader({src, className, ...rest}) {
    return (
        <ConfigurationContext.Consumer>
          {
            ({baseUrl}) => (
                    <img 
                        src={baseUrl+src} 
                        className={`w-10 ${className}`} 
                        {...rest}
                    />
            )
        }
        </ConfigurationContext.Consumer>
    )
}
