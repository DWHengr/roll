import "./index.css"
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";

export default function CustomAceEditor({onChange, placeholder}) {
    return (
        <>
            <AceEditor
                fontSize={18}
                theme="monokai"
                placeholder={placeholder}
                style={{height: 200, width: "auto"}}
                onChange={v => onChange(v)}
            />
        </>
    )
}