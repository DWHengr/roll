import "./index.css";
import {useState, useEffect} from "react";
import BorderButton from "../CustomButton/index.jsx";

function Dialog({visible, onVisible, tip, onOk}) {
    const [showModal, setShowModal] = useState(visible);

    const showModalHandler = () => {
        setShowModal(true);
        onVisible(true);
    };

    const hideModalHandler = () => {
        setShowModal(false);
        onVisible(false);
    };

    useEffect(() => {
        setShowModal(visible);
    }, [visible]);

    function handleOnOk() {
        if (typeof onOk === "function") {
            onOk();
            setShowModal(false);
            onVisible(false);
        }
    }

    return (<div className="modal-box">
        {showModal ? (<div className="modal">
            <div className="dialog-modal-content">
                <h2 style={{marginBottom: 20}}>{tip}</h2>
                <div style={{display: "flex"}}>
                    <BorderButton
                        style={{marginRight: "10px"}}
                        onClick={handleOnOk}
                    >
                        确定
                    </BorderButton>
                    <BorderButton
                        onClick={hideModalHandler}
                    >
                        取消
                    </BorderButton>
                </div>
            </div>
            <div className="dialog-modal-overlay" onClick={hideModalHandler}></div>
        </div>) : null}
    </div>);
}

export default Dialog;
