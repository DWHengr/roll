import "./index.css"
import {useEffect, useRef, useState} from "react";
import {ClearOutlined, CloseOutlined, DoubleLeftOutlined, DoubleRightOutlined} from "@ant-design/icons";
import FullButton from "../../components/FullButton/index.jsx";
import ButtonIcon from "../../components/ButtonIcon/index.jsx";
import {appWindow} from "@tauri-apps/api/window";

export default function Home() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showContent, setShowContent] = useState("")
    const [rollInterval, setRollInterval] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [seconds, setSeconds] = useState(5);
    const [rollRecord, setRollRecord] = useState([]);
    const recordRef = useRef(null);
    const [rollData, setRollData] = useState(["王小二", "二牛", "菲菲"])
    const scrollToBottom = () => {
        const container = recordRef.current;
        container.scrollTop = container.scrollHeight;
    };

    const randomDraw = (num = 1) => {
        let luckyDogs = []
        for (let i = 0; i < num; i++) {
            let randIndex = Math.floor(Math.random() * rollData.length)
            let randContent = rollData[randIndex]
            // rollData.splice(randIndex, 1)
            luckyDogs.push(randContent)
        }
        if (luckyDogs.length > 0) {
            rollRecord.push(luckyDogs)
        }
        setRollData(rollData)
        return luckyDogs
    }

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    useEffect(() => {
        scrollToBottom();
        if (rollData?.length > 0) {
            setShowContent(rollData[0])
        }
        return () => clearInterval(rollInterval);
    }, [])

    useEffect(() => {
        scrollToBottom();
        let timer;
        if (rolling) {
            timer = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(prevSeconds => prevSeconds - 1);
                } else {
                    stopRolling()
                }
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [rolling, seconds]);

    const startRolling = () => {
        setSeconds(5)
        if (!rolling) {
            const interval = setInterval(() => {
                setShowContent(rollData[Math.floor(Math.random() * rollData.length)]);
            }, 100); // 每隔100ms随机更新一次结果
            setRollInterval(interval);
            setRolling(true);
        }
    };

    const stopRolling = () => {
        if (rolling) {
            randomDraw(2);
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
                <div style={{textAlign: "center"}}>
                    <div style={{
                        backgroundColor: "#8a8a8a",
                        display: "flex",
                        padding: 10,
                        justifyContent: "center",
                        position: "relative"
                    }}>
                        <div style={{fontWeight: 600}}>抽取记录</div>
                        <div style={{position: "absolute", right: 10}}>
                            <ButtonIcon
                                icon={<ClearOutlined style={{fontSize: 18, color: "#060C21"}}/>}
                                onClick={() => {
                                }}
                            />
                        </div>
                    </div>
                    <div ref={recordRef} style={{overflowY: 'scroll', height: 520}}>
                        {
                            rollRecord?.map((round, index) => {
                                return (
                                    <div key={index} style={{margin: 10, backgroundColor: "#c7c7c7", borderRadius: 5}}>
                                        <div style={{fontSize: 12, color: "#8a8a8a"}}>第{index + 1}轮</div>
                                        {round.map((item, subIndex) => (
                                            <div key={subIndex}>{item} </div>
                                        ))}
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
            <div style={{display: "flex", flexDirection: "column", textAlign: "center", alignItems: "center"}}>
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
                {rollData?.length > 0 &&
                    (rolling ?
                        <FullButton danger onClick={stopRolling}>
                            停 止 {seconds}
                        </FullButton> :
                        <FullButton onClick={startRolling}>
                            开 始
                        </FullButton>)
                }
            </div>

        </div>)
}