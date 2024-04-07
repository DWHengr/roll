import "./App.css";
import ButtonIcon from "../components/ButtonIcon/index.jsx";
import {CloseOutlined, MinusOutlined, UserOutlined} from "@ant-design/icons";
import {appWindow} from '@tauri-apps/api/window'

function App() {

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
        <div className="main-container">
            <NavigationBar/>
        </div>
    );
}

export default App;
