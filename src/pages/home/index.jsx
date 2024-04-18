import "./index.css"
import React, {useEffect, useRef, useState} from "react";
import {
    ClearOutlined,
    DeleteFilled,
    DoubleLeftOutlined,
    DoubleRightOutlined,
    PieChartOutlined,
    PlusOutlined,
    UnorderedListOutlined
} from "@ant-design/icons";
import FullButton from "../../components/FullButton/index.jsx";
import ButtonIcon from "../../components/ButtonIcon/index.jsx";
import {db} from "../../utils/db.js";
import {Drawer, Form, InputNumber, Modal} from "antd";
import CustomButton from "../../components/CustomButton/index.jsx";
import CustomAceEditor from "../../components/CustomAceEditor/index.jsx";
import TextButton from "../../components/TextButton/index.jsx";
import {useLiveQuery} from "dexie-react-hooks";
import OptionListPopover from "../../components/OptionListPopover/index.jsx";
import Dialog from "../../components/Dialog/index.jsx";
import {useMsg} from "../../components/Msg/index.jsx";
import CustomSwitch from "../../components/CustomSwitch/index.jsx";

export default function Home() {
    const [recordDrawerOpen, setRecordDrawerOpen] = useState(true)
    const [residualDrawerOpen, setResidualDrawerOpen] = useState(false)
    const [allContentDrawerOpen, setAllContentDrawerOpen] = useState(false)
    const [showContent, setShowContent] = useState("")
    const [rollInterval, setRollInterval] = useState(null)
    const [rolling, setRolling] = useState(false)
    const [seconds, setSeconds] = useState(5)
    const recordRef = useRef([])
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isSysSetModalOpen, setIsSysSetModalOpen] = useState(false)
    const [addContentValue, setAddContentValue] = useState("")
    const [delIconHoveredIndex, setDelIconHoveredIndex] = useState(null)
    const [delAffirmVisible, setDelAffirmVisible] = useState(false)
    const [delContent, setDelContent] = useState(false)
    const [sysSetFormContent, setSysSetFormContent] = useState({})
    const [sysSetsForm] = Form.useForm();
    const [windowHeight, setWindowHeight] = useState(610)
    const Msg = useMsg()

    let rollRecord = useLiveQuery(() => db.records.toArray())
    let residual = useLiveQuery(() => db.residual.toArray())
    let allContent = useLiveQuery(() => db.contents.toArray())
    let sets = useLiveQuery(() => db.sets.toArray())

    //监听窗口变化
    const onListenerResize = () => {
        const onSetWindowHeight = () => {
            setWindowHeight(window.innerHeight)
        }
        window.addEventListener("resize", onSetWindowHeight)
        return () => {
            window.removeEventListener("resize", onSetWindowHeight)
        }
    }

    useEffect(() => {
        onListenerResize()
        return () => clearInterval(rollInterval)
    }, [])

    //秒数变化
    useEffect(() => {
        let timer
        if (rolling) {
            timer = setInterval(() => {
                if (seconds > 0) {
                    setSeconds(prevSeconds => prevSeconds - 1)
                } else {
                    stopRolling()
                }
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [rolling, seconds])

    //剩余数量变化
    useEffect(() => {
        if (residual?.length > 0) setShowContent(residual[0].content)
    }, [residual])

    //抽取记录变化
    useEffect(() => {
        scrollToBottom()
    }, [rollRecord])

    //系统设置变化
    useEffect(() => {
        if (sets?.length > 0) {
            setSysSetsContent(sets)
        }
    }, [sets])

    const setSysSetsContent = (sets) => {
        let setsContent = {}
        for (let set of sets) {
            setsContent[set.name] = set.content
        }
        setSysSetFormContent(setsContent)
    }

    //取消修改系统设置
    const onCancelSetSysSets = () => {
        setIsSysSetModalOpen(false)
        sysSetsForm.resetFields()
    }

    //使滚动条位于底部
    const scrollToBottom = () => {
        const container = recordRef.current
        container.scrollTop = container.scrollHeight
    }

    //随机抽取指定数量
    const randomDraw = (num = 1) => {
        num = residual.length < num ? residual.length : num
        let luckyDogs = []
        for (let i = 0; i < num; i++) {
            let randIndex = Math.floor(Math.random() * residual.length)
            let randContent = residual[randIndex]
            if (!sysSetFormContent.isRepeat) {
                residual.splice(randIndex, 1)
            }
            luckyDogs.push(randContent)
        }
        if (luckyDogs.length > 0) {
            let record = {round: rollRecord?.length + 1, record: luckyDogs, type: "default"}
            db.records.add(record)
            if (!sysSetFormContent.isRepeat) {
                for (let i = 0; i < luckyDogs.length; i++) {
                    db.residual.where({id: luckyDogs[i].id}).delete()
                }
            }
        }
    }

    //停止抽取
    const startRolling = () => {
        setSeconds(sysSetFormContent.interval ? sysSetFormContent.interval : 5)
        if (!rolling) {
            const interval = setInterval(() => {
                setShowContent(residual[Math.floor(Math.random() * residual.length)].content)
            }, 100) // 每隔100ms随机更新一次结果
            setRollInterval(interval)
            setRolling(true)
        }
    }

    //开始抽取
    const stopRolling = () => {
        if (rolling) {
            randomDraw(sysSetFormContent.amount ? sysSetFormContent.amount : 1)
            Msg.onSucceedMsg("抽取成功,请查看抽取记录")
            clearInterval(rollInterval)
            setRolling(false)
        }
    }

    //添加抽取内容
    const onAddContents = (contents) => {
        const lines = contents.split('\n')
        for (let i = 0; i < lines?.length; i++) {
            if (lines[i].trim() === '') continue
            let newContent = {content: lines[i].trim(), type: "default"}
            db.contents.add(newContent)
            db.residual.add(newContent)
            setAddContentValue("")
            setIsAddModalOpen(false)
        }

    }

    //清空抽取记录
    const onClearRecord = async () => {
        db.records.where({type: "default"}).delete()
        await db.residual.where({type: "default"}).delete()
        db.contents.where({type: "default"}).toArray().then(v => db.residual.bulkPut(v))
    }

    //弹窗验证是否删除
    const onVisibleDelAffirm = (content) => {
        setDelContent(content)
        setAllContentDrawerOpen(false)
        setDelAffirmVisible(true)
    }

    //删除抽取内容
    const onDelContent = () => {
        db.contents.where({id: delContent.id}).delete()
        db.residual.where({id: delContent.id}).delete()
        Msg.onSucceedMsg("删除成功")
    }

    //更新系统设置
    const onUpdateSysSet = (setsForm) => {
        db.sets.put({name: "amount", content: setsForm.amount})
        db.sets.put({name: "interval", content: setsForm.interval})
        db.sets.put({name: "fontSize", content: setsForm.fontSize})
        db.sets.put({name: "isRepeat", content: setsForm.isRepeat})
        setIsSysSetModalOpen(false)
        Msg.onSucceedMsg("设置成功")
    }

    //取整
    const formatInput = (value) => {
        if (value) {
            return String(Math.floor(value))
        }
        return value
    }

    return (<div className="home-container">
        {/*剩余未抽取内容*/}
        <Drawer
            title={`剩余未抽取 (${residual?.length})`}
            placement="right"
            closable={true}
            onClose={() => setResidualDrawerOpen(false)}
            open={residualDrawerOpen}
            key="residual"
            width={280}
            styles={{body: {padding: 5}}}
        >
            <div style={{userSelect: "none", overflowY: 'scroll', height: windowHeight - 70, fontSize: 20}}>
                {residual?.map((item, index) => (<div style={{
                    padding: 10, backgroundColor: index % 2 === 0 ? '#e7e7e7' : '#ffffff',
                }}
                                                      key={item?.id + "-" + index}
                >
                    {item?.content}
                </div>))}
            </div>
        </Drawer>
        {/*全部内容*/}
        <Drawer
            title={`全部内容`}
            placement="right"
            closable={true}
            onClose={() => setAllContentDrawerOpen(false)}
            open={allContentDrawerOpen}
            key="allContent"
            width={280}
            styles={{body: {padding: 5}}}
        >
            <div style={{userSelect: "none", overflowY: 'scroll', height: windowHeight - 70, fontSize: 20}}>
                {allContent?.map((item, index) => (<div
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
                </div>))}
            </div>
        </Drawer>
        {/*确认删除弹窗*/}
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
                    label: '高级设置', onClick: () => setIsSysSetModalOpen(true)
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
        {/*抽取记录抽屉*/}
        <div
            className={`home-drawer-toggle ${recordDrawerOpen ? 'open' : ''}`}
            onClick={() => setRecordDrawerOpen(!recordDrawerOpen)}
        >
            {recordDrawerOpen ? <DoubleLeftOutlined style={{fontSize: 25, color: "#060C21"}}/> :
                <DoubleRightOutlined style={{fontSize: 25, color: "#060C21"}}/>}
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
                <div ref={recordRef} style={{overflowY: 'scroll', height: windowHeight - 90}}>
                    {rollRecord?.map((round, index) => {
                        return (<div key={index} style={{margin: 10, backgroundColor: "#c0c0c0", borderRadius: 5}}>
                            <div style={{fontSize: 12, color: "#8a8a8a"}}>第{index + 1}轮</div>
                            {round?.record?.map((item, subIndex) => (<div
                                key={index + "-" + item?.id + "-" + subIndex}
                                style={{fontSize: 20}}
                            >
                                {item?.content}
                            </div>))}
                        </div>)
                    })}
                </div>
            </div>
        </div>
        {/*主体部分*/}
        <div style={{display: "flex", flexDirection: "column", textAlign: "center", alignItems: "center"}}>
            {residual?.length <= 0 ? <div>
                <img src="/empty.svg" alt=""/>
                <div>空空如也</div>
            </div> : <div onDoubleClick={() => setResidualDrawerOpen(true)}>
                <div style={{color: "#060C21", fontSize: sysSetFormContent.fontSize, fontWeight: 600}}>
                    {showContent}
                </div>
            </div>}
            {residual?.length > 0 && <>
                {rolling ? <FullButton danger onClick={stopRolling}>
                    停 止 {seconds}
                </FullButton> : <>
                    <FullButton onClick={startRolling}>
                        开 始
                    </FullButton>
                </>}
                <div style={{width: 200, display: "flex", justifyContent: "end"}}>
                    <TextButton
                        icon={<PieChartOutlined
                            style={{fontSize: 16, margin: 2}}/>}
                        onClick={() => setResidualDrawerOpen(true)}
                    >
                        剩余({residual?.length})
                    </TextButton>
                </div>
            </>}
            {/*添加内容modal*/}
            <Modal
                title="添加内容"
                open={isAddModalOpen}
                onCancel={() => setIsAddModalOpen(false)}
                footer={() => (<>
                    <CustomButton onClick={() => onAddContents(addContentValue)}>确 定</CustomButton>
                </>)}
                width={400}
            >
                <CustomAceEditor
                    value={addContentValue}
                    placeholder="一行一个内容"
                    onChange={v => setAddContentValue(v)}
                />
            </Modal>
            {/*高级设置modal*/}
            <Modal
                title="高级设置"
                open={isSysSetModalOpen}
                onCancel={onCancelSetSysSets}
                footer={<></>}
                width={400}
            >
                <Form
                    name="setform"
                    onFinish={onUpdateSysSet}
                    initialValues={sysSetFormContent}
                    style={{marginTop: 30}}
                    requiredMark={false}
                    form={sysSetsForm}
                >
                    <Form.Item
                        label="每次抽取数量"
                        name="amount"
                        rules={[{required: true, message: '请输入每次抽取数量'}, {
                            type: 'number',
                            min: 1,
                            max: 100,
                            message: '抽取数量为1到100之间'
                        },]}
                    >
                        <InputNumber formatter={formatInput} parser={(value) => value.replace(/[^\d]/g, '')}/>
                    </Form.Item>
                    <Form.Item
                        label="抽取间隔时间"
                        name="interval"
                        rules={[{required: true, message: '请输入抽取间隔时间'}, {
                            type: 'number',
                            min: 1,
                            max: 60,
                            message: '间隔时间为1秒到60秒'
                        },]}
                    >
                        <InputNumber formatter={formatInput} parser={(value) => value.replace(/[^\d]/g, '')}/>
                    </Form.Item>
                    <Form.Item
                        label="展示字体大小"
                        name="fontSize"
                        rules={[{required: true, message: '请输入展示字体大小'}, {
                            type: 'number',
                            min: 20,
                            max: 200,
                            message: '字体大小为20到200之间'
                        },]}
                    >
                        <InputNumber formatter={formatInput} parser={(value) => value.replace(/[^\d]/g, '')}/>
                    </Form.Item>
                    <Form.Item
                        label="是否可以重复"
                        name="isRepeat"
                        rules={[{required: true, message: '请选择着是否可以重复'},]}
                    >
                        <CustomSwitch/>
                    </Form.Item>
                    <Form.Item style={{display: "flex", justifyContent: "end"}}>
                        <CustomButton htmlType="submit">确 定</CustomButton>
                    </Form.Item>
                </Form>
            </Modal>
        </div>

    </div>)
}