import React from "react";
import "./index.css"

export default function ButtonIcon({icon, onClick}) {
    return (
        <div
            className="button-icon-container"
            onClick={() => {
                if (onClick) onClick();
            }}
        >
            {icon}
        </div>
    )
}