import "./index.css"

export default function FullButton({children, onClick, danger}) {
    return (
        <div
            className={`full-button-container ${danger ? 'danger' : ''}`}
            onClick={() => {
                if (onClick) onClick()
            }}
        >
            <div
                style={{fontSize: 20}}
            >
                {children}
            </div>
        </div>
    )
}