import "./index.css"
import {useEffect, useRef, useState} from "react";
import {ClearOutlined, DoubleLeftOutlined, DoubleRightOutlined, PlusOutlined} from "@ant-design/icons";
import FullButton from "../../components/FullButton/index.jsx";
import ButtonIcon from "../../components/ButtonIcon/index.jsx";
import {db} from "../../utils/db.js";
import {Modal} from "antd";
import CustomButton from "../../components/CustomButton/index.jsx";
import CustomAceEditor from "../../components/CustomAceEditor/index.jsx";
import TextButton from "../../components/TextButton/index.jsx";
import {useLiveQuery} from "dexie-react-hooks";

export default function Home() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showContent, setShowContent] = useState("")
    const [rollInterval, setRollInterval] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [seconds, setSeconds] = useState(5);
    let rollRecord = useLiveQuery(() => db.records.toArray())
    const recordRef = useRef([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [addContentValue, setAddContentValue] = useState("")
    let residual = useLiveQuery(() => db.residual.toArray())

    useEffect(() => {
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

    useEffect(() => {
        if (residual?.length > 0)
            setShowContent(residual[0].content)
    }, [residual])

    const scrollToBottom = () => {
        const container = recordRef.current;
        container.scrollTop = container.scrollHeight;
    };
    const randomDraw = (num = 1) => {
        num = residual.length < num ? residual.length : num
        let luckyDogs = []
        for (let i = 0; i < num; i++) {
            let randIndex = Math.floor(Math.random() * residual.length)
            let randContent = residual[randIndex]
            residual.splice(randIndex, 1)
            luckyDogs.push(randContent)
        }
        if (luckyDogs.length > 0) {
            let record = {round: rollRecord?.length + 1, record: luckyDogs, type: "default"}
            db.records.add(record)
            for (let i = 0; i < luckyDogs.length; i++) {
                db.residual.where({id: luckyDogs[i].id}).delete();
            }
        }
    }

    const toggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    const startRolling = () => {
        setSeconds(5)
        if (!rolling) {
            const interval = setInterval(() => {
                setShowContent(residual[Math.floor(Math.random() * residual.length)].content);
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

    const onAddContents = (contents) => {
        const lines = contents.split('\n');
        for (let i = 0; i < lines?.length; i++) {
            if (lines[i].trim() === '')
                continue
            let newContent = {content: lines[i].trim(), type: "default"}
            db.contents.add(newContent)
            db.residual.add(newContent)
            setAddContentValue("")
            setIsAddModalOpen(false)
        }

    }

    const onClearRecord = async () => {
        db.records.where({type: "default"}).delete()
        await db.residual.where({type: "default"}).delete()
        db.contents.where({type: "default"}).toArray().then(v => db.residual.bulkPut(v))
    }

    return (
        <div className="home-container">
            <div style={{position: "absolute", right: 10, top: 5}}>
                <TextButton
                    icon={<PlusOutlined style={{fontSize: 16}}/>}
                    onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                >
                    添加
                </TextButton>
            </div>
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
                                onClick={onClearRecord}
                            />
                        </div>
                    </div>
                    <div ref={recordRef} style={{overflowY: 'scroll', height: 520}}>
                        {
                            rollRecord?.map((round, index) => {
                                return (
                                    <div key={index} style={{margin: 10, backgroundColor: "#c7c7c7", borderRadius: 5}}>
                                        <div style={{fontSize: 12, color: "#8a8a8a"}}>第{index + 1}轮</div>
                                        {round?.record?.map((item, subIndex) => (
                                            <div key={index + "-" + item?.id + "-" + subIndex}>{item?.content} </div>
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
                    residual?.length <= 0 ?
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
                {residual?.length > 0 &&
                    (rolling ?
                        <FullButton danger onClick={stopRolling}>
                            停 止 {seconds}
                        </FullButton> :
                        <FullButton onClick={startRolling}>
                            开 始
                        </FullButton>)
                }

                <Modal
                    title="添加内容"
                    open={isAddModalOpen}
                    onCancel={() => setIsAddModalOpen(false)}
                    keyboard={false}
                    maskClosable={false}
                    footer={() => (
                        <>
                            <CustomButton onClick={() => onAddContents(addContentValue)}>确 定</CustomButton>
                        </>
                    )}
                    width={400}
                >
                    <CustomAceEditor
                        value={addContentValue}
                        placeholder="一行一个内容"
                        onChange={v => setAddContentValue(v)}
                    />
                </Modal>
            </div>

        </div>)
}