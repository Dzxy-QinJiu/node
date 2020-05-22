/**
 * 将ant-design的select组件进行了包装，在检测到option文字变化的时候，重新计算select的宽度，
 * 解决select宽度过小，而显示不全的问题
 *
 * 使用方法
 *
var React = require('react');
 *  var SelectFullWidth = require("../../../components/select-fullwidth");
 *  var Option = require("antd").Select.Option;
 *
 *  <SelectFullWidth {...otherProps} minWidth={120} maxWidth={500}>
 *      <Option value="1">应用1</Option>
 *      <Option value="2">应用2</Option>
 *      <Option value="3">应用3</Option>
 *  </SelectFullWidth>
 *
 *  其中otherProps使用方法参考antd的Select组件，例如：onChange,optionFilterProp,showSearch等
 *
 *  minWidth用来指定select的最小宽度，非必传属性，默认值是120
 *  maxWidth用来指定select的最大宽度，非必传属性，默认值是500
 */
var React = require('react');
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
var measureText = require('../../public/sources/utils/measure-text');
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
class SelectFullWidth extends React.Component {
    static defaultProps = {
        minWidth: 120,
        maxWidth: 500,
        onLayout: function() {}
    };

    state = {
        width: this.props.minWidth,
        textList: []
    };

    computeWidth = () => {
        var textList = this.state.textList;
        //获取外层节点
        var wrapDom = ReactDOM.findDOMNode(this);
        //获取渲染出来的展示的文字节点
        var $renderedDom = $(wrapDom).find('.ant-select-selection__rendered');
        //获取字体大小css样式
        var fontSizeText = $renderedDom.css('font-size');
        //获取字体大小数字
        var fontSize = parseInt(fontSizeText);
        if(isNaN(fontSize)) {
            fontSize = 12;
        }
        var max = 0;
        for(var i = 0, len = textList.length; i < len; i++) {
            var width = measureText.measureTextWidth(textList[i] , fontSize);
            if(width > max) {
                max = width;
            }
        }
        max += 50;
        if(max < this.props.minWidth) {
            max = this.props.minWidth;
        } else if(max > this.props.maxWidth) {
            max = this.props.maxWidth;
        }
        this.setState({
            width: max
        }, () => {
            this.props.onLayout({
                width: width
            });
        });
    };

    componentDidMount() {
        var textList = React.Children.map(this.props.children, (ele , idx) => {
            return ele.props.children;
        });
        this.state.textList = textList;
        this.computeWidth();
    }

    componentWillReceiveProps(nextProps) {
        var textList = React.Children.map(nextProps.children, (ele , idx) => {
            return ele.props.children;
        });
        if( textList && textList.toString() !== this.state.textList.toString()) {
            this.state.textList = textList;
            this.computeWidth();
        }
    }

    render() {
        var {style, children, ...props} = this.props;
        if(!style) {
            style = {};
        }
        style.width = this.state.width;
        return (
            <AntcSelect
                {...props}
                dropdownMatchSelectWidth={false}
                filterOption={(input, option) => ignoreCase(input, option)}
            >
                {children}
            </AntcSelect>
        );
    }
}

module.exports = SelectFullWidth;
