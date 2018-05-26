/**
 * 容器组件
 */
require('./index.less');
import { Radio} from 'antd';
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
import { exportToCsv } from "LIB_DIR/func";

class CardContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dateRange: this.props.dateRange,
            radioValue: this.props.radioValue,
            exportData: this.props.exportData, // 导出数据
            csvFileName: this.props.csvFileName, // csv文件名
            isShowExportFlag: false // 是否显示导出的按钮， 默认不显示
        };
        this.onDateRangeChange = this.onDateRangeChange.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    componentWillReceiveProps(nextProps){
        if (this.state.dateRange != nextProps.dateRange) {
            this.setState({
                dateRange: nextProps.dateRange
            });
        }
    }
    onDateRangeChange(event) {
        this.setState({
            dateRange: event.target.value
        });
        this.props.onDateRangeChange(event.target.value);
    }
    handleMouseEnter() {
        this.setState({
            isShowExportFlag: true
        });
    }
    handleMouseLeave() {
        this.setState({
            isShowExportFlag: false
        });
    }
    exportFile() {
        exportToCsv(this.state.csvFileName, this.props.exportData);
    }
    render() {
        let radioValue = this.props.radioValue;
        return (
            <div className="box-container">
                <div className="box-title" onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>
                    <span className="title-name">{this.props.title}</span>
                    <div className="additional-content">
                        {radioValue.length ? (
                            <span className="type-switch">
                                <RadioGroup value={this.props.dateRange} onChange={this.onDateRangeChange}>
                                    {radioValue.map( (radioItem) => {
                                        return <RadioButton value={radioItem.value} key={radioItem.value}>{radioItem.name}</RadioButton>;
                                    } )}
                                </RadioGroup>
                            </span>
                        ) : null}
                        {
                            this.props.exportData && this.state.isShowExportFlag ? (
                                <span className="export-file" onClick={this.exportFile.bind(this)}>
                                    <i className="iconfont icon-export">{Intl.get("common.export", "导出")}</i>
                                </span>
                            ) : null
                        }
                    </div>
                </div>
                {this.props.children}
            </div>
        );
    }
}

CardContainer.defaultProps = {
    title: '', // 标题
    dateRange: '',
    radioValue: [], // 切换的按钮的值
    onDateRangeChange: function(){}, //时间范围改变的回调函数
    exportData: '' , // 导出的数据
    csvFileName: '' // 导出csv文件名
};

export default CardContainer;