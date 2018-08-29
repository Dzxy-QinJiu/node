/**
 * 自适应文本区域组件
 *
 * 使用方法与antd的Input组件相同
 * 只是注意不要再传type属性，因为这个属性已内置
 */

var React = require('react');
import { Input } from 'antd';
const { TextArea } = Input;
const autosize = require('autosize');

class AutosizeTextarea extends React.Component {
    componentDidMount() {
        autosize($(ReactDOM.findDOMNode(this)).find('textarea'));
    }

    render() {
        return <TextArea {...this.props} />;
    }
}

module.exports = AutosizeTextarea;

