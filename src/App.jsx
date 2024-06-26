import "./App.css";
import ButtonIcon from "./components/ButtonIcon/index.jsx";
import {CloseOutlined, FullscreenExitOutlined, FullscreenOutlined, MinusOutlined} from "@ant-design/icons";
import {appWindow} from '@tauri-apps/api/window'
import Home from "./pages/home/index.jsx";
import {Redirect, Route, Switch} from "react-router-dom";
import {useState} from "react";
import Msg from "./components/Msg/index.jsx";
import {App as AppAntd} from 'antd';

function App() {
    const [isFull, setIsFull] = useState(false)
    const NavigationBar = () => {
        return (<div data-tauri-drag-region className="navigation-bar">
            <div style={{
                display: "flex",
                userSelect: 'none',
                justifyContent: 'center',
                textAlign: 'center',
                alignItems: 'center',
            }}>
                <img style={{height: 30, marginLeft: 10}} src="/roll.svg"/>
                <div style={{marginLeft: 5}}>
                    <div style={{color: "#060C21", fontSize: 18, fontWeight: 600, marginBottom: -10}}>点名册</div>
                    <div style={{color: "#060C21", fontSize: 12, marginBottom: -5}}>Muster Roll</div>
                </div>
            </div>
            <div style={{justifyContent: 'end', display: "flex", alignItems: 'center'}}>
                <ButtonIcon
                    icon={<MinusOutlined style={{fontSize: 25, color: "#060C21"}}/>}
                    onClick={() => {
                        appWindow.minimize()
                    }}
                />
                {isFull ?
                    <ButtonIcon
                        icon={<FullscreenExitOutlined style={{fontSize: 25, color: "#060C21"}}/>}
                        onClick={() => {
                            appWindow.setFullscreen(false)
                            setIsFull(false)
                        }}
                    /> :
                    <ButtonIcon
                        icon={<FullscreenOutlined style={{fontSize: 25, color: "#060C21"}}/>}
                        onClick={() => {
                            appWindow.setFullscreen(true)
                            setIsFull(true)
                        }}
                    />}
                <ButtonIcon
                    icon={<CloseOutlined style={{fontSize: 25, color: "#060C21"}}/>}
                    onClick={() => {
                        appWindow.close()
                    }}
                />
            </div>
        </div>)
    }

    return (
        <AppAntd>
            <Msg>
                <div className="main-container">
                    <NavigationBar/>
                    <div className="content-container">
                        <Switch>
                            <Route exact path="/home" component={Home}></Route>
                            <Redirect path="/" to="/home"/>
                        </Switch>
                    </div>
                </div>
            </Msg>
        </AppAntd>
    );
}

export default App;
