import "./index.css"

export default function CustomButton({children, onClick}) {
    return (
        <>
            <button className="custom-button" onClick={() => onClick()}>
                {children}
            </button>
        </>
    )
}
