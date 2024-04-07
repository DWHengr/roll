import "./index.css"
import {useEffect, useState} from "react";
import {DoubleRightOutlined, DoubleLeftOutlined} from "@ant-design/icons";

export default function Home() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showContent, setShowContent] = useState("")
    const [rollInterval, setRollInterval] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [seconds, setSeconds] = useState(5);

    let rollData = ["王小二", "二牛", "菲菲"]

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    useEffect(() => {
        if (rollData?.length > 0) {
            setShowContent(rollData[0])
        }
        return () => clearInterval(rollInterval);
    }, [])

    useEffect(() => {
        let timer;
        if (rolling) {
            timer = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(prevSeconds => prevSeconds - 1);
                } else {
                    clearInterval(rollInterval);
                    setRolling(false);
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [rolling, seconds]);

    const startRolling = () => {
        setSeconds(5)
        if (!rolling) {
            const interval = setInterval(() => {
                const randomName = rollData[Math.floor(Math.random() * rollData.length)];
                setShowContent(randomName);
            }, 100); // 每隔100ms随机更新一次结果
            setRollInterval(interval);
            setRolling(true);
        }
    };

    const stopRolling = () => {
        if (rolling) {
            clearInterval(rollInterval);
            setRolling(false);
        }
    };

    return (
        <div className="home-container">
            <div className={`home-drawer-toggle ${drawerOpen ? 'open' : ''}`} onClick={toggleDrawer}>
                {drawerOpen ? <DoubleLeftOutlined style={{fontSize: 25, color: "#060C21"}}/> :
                    <DoubleRightOutlined style={{fontSize: 25, color: "#060C21"}}/>
                }
            </div>
            <div className={`home-drawer ${drawerOpen ? 'open' : ''}`}>
                记录
            </div>
            <div style={{textAlign: "center"}}>
                {
                    rollData?.length <= 0 ?
                        <div>
                            <img src="/empty.svg"/>
                            <div>空空如也</div>
                        </div> :
                        <div>
                            <div style={{height: 80, color: "#060C21", fontSize: 80, fontWeight: 600}}>
                                {showContent}
                            </div>
                        </div>
                }
                <button onClick={startRolling} disabled={rolling}>
                    开始 {seconds}
                </button>
                <button onClick={stopRolling} disabled={!rolling}>
                    停止
                </button>
            </div>

        </div>)
}