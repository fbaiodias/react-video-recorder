import React from 'react'
import CameraIcon from '../assets/icn_camera.svg'

const PrimaryButton = ({
    onClick,
}) => {
    const r = 85
    const circumference = 2 * Math.PI * r
    const offset = 0

    return (
        <div role="button" onClick={onClick} style={{
            position: 'absolute',
            width: '100px',
            top: '45px',
            transform: 'translate(-50 %, -20 %) scale(1)'
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
                <circle
                    cx="100"
                    cy="100"
                    r="100"
                    fill="#000000"
                    opacity="1.0"
                />
                <circle
                    style={{
                        strokeDasharray: 534.07075,
                        transition: 'all 1s',
                        opacity: 0.2
                    }}
                    cx="100"
                    cy="100"
                    r={r}
                    stroke="#ffffff"
                    strokeWidth="8"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.3"
                />
                <circle
                    style={{ opacity: 0}}
                    cx="100"
                    cy="100"
                    r={r}
                    stroke="#ffffff"
                    strokeWidth="8"
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="none"
                />
                <circle
                    style={{ 
                        transition:'all 0.3s',
                        opacity: 0.4,
                        fill: '#ffffff',
                        transform: 'scale(1)',
                        transformOrigin:'center'
                    }}
                    cx="100"
                    cy="100"
                    r="70"
                    fill="#ffffff"
                />
                <rect
                    style={{opacity:0}}
                    x={65}
                    y={65}
                    width={70}
                    height={70}
                    rx="10"
                    fill="#ffffff"
                />
                <CameraIcon
                    width={80}
                    height={80}
                    x={60}
                    y={60}
                    fill="#ffffff"
                />
            </svg>
        </div>
    )
}

export default PrimaryButton