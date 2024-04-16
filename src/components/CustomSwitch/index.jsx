import "./index.css"
import {Switch} from "antd";

export default function CustomSwitch({value, onChange, checked}) {
    return (
        <div
            className="custom-switch"
        >
            <Switch
                checkedChildren="是"
                unCheckedChildren="否"
                value={value}
                onChange={onChange}
                checked={checked}
            />
        </div>
    )
}