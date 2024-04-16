import React, {createContext, useContext} from "react";
import {CheckCircleTwoTone, CloseCircleTwoTone} from "@ant-design/icons";
import {App} from "antd";

const MsgContext = createContext();

export function useMsg() {
    const context = useContext(MsgContext);
    return context;
}

export default function Msg(props) {
    const {message} = App.useApp();
    const onErrorMsg = (msg) => {
        message.open({
            type: 'success',
            content: msg,
            duration: 1.2,
            icon: <CloseCircleTwoTone twoToneColor="#394773FF" style={{fontSize: 20}}/>
        })
    }

    const onSucceedMsg = (msg) => {
        message.open({
            type: 'success',
            content: msg,
            duration: 1.2,
            icon: <CheckCircleTwoTone twoToneColor="#394773FF" style={{fontSize: 20}}/>
        })
    }
    return (
        <MsgContext.Provider value={{onErrorMsg, onSucceedMsg}}>
            <div>{props.children}</div>
        </MsgContext.Provider>
    );
}
