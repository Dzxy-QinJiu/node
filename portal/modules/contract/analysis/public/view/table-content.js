var PropTypes = require('prop-types');
var React = require('react');
import {Alert, Spin} from 'antd';

class TableContent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.tableDataResult.errorMsg) {
            return (
                <div className="alert-timer table-content-alert">
                    <Alert message={this.props.tableDataResult.errorMsg} type="error" showIcon/>
                </div>
            );
        } else if (this.props.tableDataResult.loading) {
            return (
                <Spin size="large" style={{width: '100%', textAligh: 'center'}}/>
            );
        } else if (this.props.tableDataResult.data && this.props.tableDataResult.data.length === 0) {
            return (
                <div className="alert-timer  table-content-alert">
                    <Alert message={Intl.get('contract.noData', '您选择的字段下暂无数据')} type="info" showIcon/>
                </div>
            );
        } else if (!this.props.tableDataResult.data) {
            return (
                <div className="alert-timer  table-content-alert">
                    <Alert message={Intl.get('contract.chooseField', '请拖动字段到相应统计区域')} type="info" showIcon/>
                </div>
            );
        }
        return (
            <div className="table-content-container clearfix" style={this.props.style}>
                <div className="value-list-wrapper">
                    <ul className="value-list-container">
                        {this.props.valueList.length ? this.props.valueList.map((item, index) => (
                            <li key={index}>{item.calcType.text}: {item.text}</li>
                        )) : null}
                    </ul>
                </div>
                <table className="analysis-table">
                    {
                        this.props.tableDataResult.data && this.props.tableDataResult.data.length > 0 ? this.props.tableDataResult.data.map((list, dataIndex) => (
                            <tr key={dataIndex} className="clearfix">
                                {
                                    list.map((item, itemIndex) => (
                                        <td key={itemIndex}>{item}</td>
                                    ))
                                }
                            </tr>
                        )) : null
                    }
                </table>
            </div>
        );
    }
}
TableContent.propTypes = {
    tableDataResult: PropTypes.object,
    valueList: PropTypes.array,
    style: PropTypes.object
};
export default TableContent;