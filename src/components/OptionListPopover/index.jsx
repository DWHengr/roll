import {Popover} from "antd";
import "./index.css"
import {useState} from "react";

export default function OptionListPopover({children, options, titleContent}) {
    const [open, setOpen] = useState(false);


    const onHide = () => {
        setOpen(false);
    };

    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
    };

    const OptionList = ({options, titleContent}) => {
        return (
            <div className="option-list-container">
                {
                    titleContent ?
                        <div className="option-list-name">
                            {titleContent}
                        </div> : <></>
                }
                {options?.map(option => (
                    <div className="option-list-item">
                        <div
                            onClick={() => {
                                if (option.onClick)
                                    option.onClick();
                                onHide();
                            }}
                        >
                            {option.label}
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div style={{cursor: "pointer"}}>
            <Popover
                color="#c0c0c0"
                content={<OptionList titleContent={titleContent} options={options}/>}
                trigger="click"
                overlayInnerStyle={{padding: 5}}
                open={open}
                onOpenChange={handleOpenChange}
            >
                {children}
            </Popover>
        </div>
    )
}