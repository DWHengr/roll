import "./index.css"
import React, {useEffect, useRef, useState} from "react";
import {
    ClearOutlined, DeleteFilled,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    PieChartOutlined,
    PlusOutlined, UnorderedListOutlined
} from "@ant-design/icons";
import FullButton from "../../components/FullButton/index.jsx";
import ButtonIcon from "../../components/ButtonIcon/index.jsx";
import {db} from "../../utils/db.js";
import {Drawer, Modal} from "antd";
import CustomButton from "../../components/CustomButton/index.jsx";
import CustomAceEditor from "../../components/CustomAceEditor/index.jsx";
import TextButton from "../../components/TextButton/index.jsx";
import {useLiveQuery} from "dexie-react-hooks";
import OptionListPopover from "../../components/OptionListPopover/index.jsx";
import Dialog from "../../components/Dialog/index.jsx";

export default function Home() {
    const [recordDrawerOpen, setRecordDrawerOpen] = useState(false);
    const [residualDrawerOpen, setResidualDrawerOpen] = useState(false);
    const [allContentDrawerOpen, setAllContentDrawerOpen] = useState(false);
    const [showContent, setShowContent] = useState("")
    const [rollInterval, setRollInterval] = useState(null);
    const [rolling, setRolling] = useState(false);
    const [seconds, setSeconds] = useState(5);
    const recordRef = useRef([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [addContentValue, setAddContentValue] = useState("")
    const [delIconHoveredIndex, setDelIconHoveredIndex] = useState(null);
    const [delAffirmVisible, setDelAffirmVisible] = useState(false)
    const [delContent, setDelContent] = useState(false)

    let rollRecord = useLiveQuery(() => db.records.toArray())
    let residual = useLiveQuery(() => db.residual.toArray())
    let allContent = useLiveQuery(() => db.contents.toArray())

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
        setRecordDrawerOpen(!recordDrawerOpen);
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

    const onVisibleDelAffirm = (content) => {
        setDelContent(content)
        setAllContentDrawerOpen(false)
        setDelAffirmVisible(true)
    }

    const onDelContent = () => {
        db.contents.where({id: delContent.id}).delete()
        db.residual.where({id: delContent.id}).delete()
    }

    return (
        <div className="home-container">
            {/*剩余未抽取内容*/}
            <Drawer
                title={`剩余未抽取 (${residual?.length})`}
                placement="right"
                closable={true}
                onClose={() => setResidualDrawerOpen(false)}
                open={residualDrawerOpen}
                key="right"
                width={280}
                bodyStyle={{padding: 5}}
            >
                <div style={{userSelect: "none", overflowY: 'scroll', height: 540, fontSize: 20}}>
                    {residual?.map((item, index) => (
                        <div style={{
                            padding: 10,
                            backgroundColor: index % 2 === 0 ? '#e7e7e7' : '#ffffff',
                        }}
                             key={item?.id + "-" + index}
                        >
                            {item?.content}
                        </div>))
                    }
                </div>
            </Drawer>
            {/*全部内容*/}
            <Drawer
                title={`全部内容`}
                placement="right"
                closable={true}
                onClose={() => setAllContentDrawerOpen(false)}
                open={allContentDrawerOpen}
                key="right"
                width={280}
                bodyStyle={{padding: 5}}
            >
                <div style={{userSelect: "none", overflowY: 'scroll', height: 540, fontSize: 20}}>
                    {allContent?.map((item, index) => (
                        <div
                            key={item?.id + "-" + index}
                            onMouseEnter={() => setDelIconHoveredIndex(index)}
                            onMouseLeave={() => setDelIconHoveredIndex(null)}
                            className="home-drawer-content-item"
                        >
                            <div>
                                {item?.content}
                            </div>
                            <div
                                style={{cursor: "pointer"}}
                                onClick={() => onVisibleDelAffirm(item)}
                            >
                                {delIconHoveredIndex === index && <DeleteFilled style={{color: "#ff696b"}}/>}
                            </div>
                        </div>))
                    }
                </div>
            </Drawer>
            <Dialog
                tip={`确认删除? ${delContent?.content}`}
                visible={delAffirmVisible}
                onVisible={(visible) => setDelAffirmVisible(visible)}
                onOk={onDelContent}
            />
            <div style={{position: "absolute", right: 10, top: 5}}>
                <TextButton
                    icon={<PlusOutlined style={{fontSize: 16, margin: 2}}/>}
                    onClick={() => setIsAddModalOpen(!isAddModalOpen)}
                >
                    添加
                </TextButton>
                <OptionListPopover
                    options={[{
                        label: '全部内容', onClick: () => setAllContentDrawerOpen(true)
                    }, {
                        label: '高级设置', onClick: () => {
                        }
                    }]}
                >
                    <div
                        className="text-button-container"
                    >
                        <UnorderedListOutlined style={{fontSize: 16, margin: 2}}/>
                        <div style={{marginLeft: 1}}>更多</div>
                    </div>
                </OptionListPopover>
            </div>
            <div className={`home-drawer-toggle ${recordDrawerOpen ? 'open' : ''}`} onClick={toggleDrawer}>
                {recordDrawerOpen ? <DoubleLeftOutlined style={{fontSize: 25, color: "#060C21"}}/> :
                    <DoubleRightOutlined style={{fontSize: 25, color: "#060C21"}}/>
                }
            </div>
            <div className={`home-drawer ${recordDrawerOpen ? 'open' : ''}`}>
                <div style={{textAlign: "center"}}>
                    <div style={{
                        backgroundColor: "#c0c0c0",
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
                                    <div key={index} style={{margin: 10, backgroundColor: "#c0c0c0", borderRadius: 5}}>
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
                            <img src="/empty.svg" alt=""/>
                            <div>空空如也</div>
                        </div> :
                        <div>
                            <div style={{height: 80, color: "#060C21", fontSize: 80, fontWeight: 600}}>
                                {showContent}
                            </div>
                        </div>
                }
                {residual?.length > 0 &&
                    <>
                        {
                            rolling ?
                                <FullButton danger onClick={stopRolling}>
                                    停 止 {seconds}
                                </FullButton> :
                                <>
                                    <FullButton onClick={startRolling}>
                                        开 始
                                    </FullButton>
                                </>
                        }
                        <div style={{width: 200, display: "flex", justifyContent: "end"}}>
                            <TextButton
                                icon={<PieChartOutlined
                                    style={{fontSize: 16, margin: 2}}/>}
                                onClick={() => setResidualDrawerOpen(true)}
                            >
                                剩余({residual?.length})
                            </TextButton>
                        </div>
                    </>
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