/**
 * 自适应文本区域组件
 *
 * 使用方法与antd的Input组件相同
 * 只是注意不要再传type属性，因为这个属性已内置
 */

import { Input } from "antd";
const { TextArea } = Input;
const autosize = require("autosize");

const AutosizeTextarea = React.createClass({
    componentDidMount: function() {
        autosize($(this.getDOMNode()).find("textarea"));
    },
    render: function() {
        return <TextArea {...this.props} />;
    }
});

module.exports = AutosizeTextarea;
