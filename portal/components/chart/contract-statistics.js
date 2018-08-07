/**
 * 合同分析统计表
 */

import { AntcTable } from 'antc';
import { parseAmount } from 'LIB_DIR/func';
import { PropTypes } from 'prop-types';

class ContractStatistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            columns: [],
            //表格横向滚动时，滚动区域的宽度
            scrollX: '100%'
        };
    }
    componentWillReceiveProps(nextProps) {
        //从传入的属性中获取数据
        const rawData = nextProps.chartData;
        //数据为空时直接返回
        if (!rawData.length) return;
        let columns = nextProps.column;
        columns = columns.map(column => {
            column.key = column.dataIndex;
            column.width = '10%';
            if (['amount', 'new', 'renewal', 'runOff'].indexOf(column.dataIndex) > -1) {
                column.className = 'number-value';
                column.render = (text) => {
                    return text ? <span>{parseAmount(text)}</span> : null;
                };
            }
            if (['churnRate', 'yearRate'].indexOf(column.dataIndex) > -1) {
                column.className = 'number-value';
                column.render = (text) => {
                    text = text && text !== '-' ? `${text}%` : text;
                    return text ? <span>{text}</span> : null;
                };
            }
            return column;
        });
        // 全部时间或跨年时不显示年度流失率
        const isAllTime = !nextProps.endTime && !nextProps.startTime;
        const isCrossYear = moment(+nextProps.endTime).get('year') - moment(+nextProps.startTime).get('year') > 0;
        const isShowYearRate = isAllTime || isCrossYear;
        if ( isShowYearRate) {
            columns = _.filter(columns, item => {
                return item.key !== 'yearRate';
            });
        }
        this.setState({
            data: rawData,
            columns: columns
        });
    }
    render() {
        return (
            <div>
                <AntcTable
                    columns={this.state.columns}
                    dataSource={this.state.data}
                    pagination={false}
                    bordered={true}
                    scroll={{ x: this.state.scrollX, y: 400 }}
                />
            </div>
        );
    }
}
ContractStatistics.propTypes = {
    chartData: PropTypes.array,
    column: PropTypes.array,
    endTime: PropTypes.number,
    startTime: PropTypes.number,
};
export default ContractStatistics;
