var React = require('react');
/**
 * 签单情况统计表
 */

import { AntcTable } from 'antc';
import { parseAmount, exportToCsv } from 'LIB_DIR/func';
import { PropTypes } from 'prop-types';
const querystring = require('querystring');

//团队分组列列宽
const TEAM_COLUMN_WIDTH = 380;

class SigningStatistics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            columns: [],
            //表格横向滚动时，滚动区域的宽度
            scrollX: '100%',
        };
    }

    componentWillReceiveProps(nextProps) {
        //从传入的属性中获取数据
        const rawData = nextProps.chartData;
        //数据为空时直接返回
        if (!rawData.length) return;

        const data = this.processData(rawData);
        const columns = this.getColumns(rawData);
        const scrollX = rawData[0].teams.length * TEAM_COLUMN_WIDTH;
        this.setState({data, columns, scrollX});
    }

    //将数据处理成适合表格渲染的格式
    processData(data) {
        const processedData = data.map((monthData, index) => {
            let monthName = '';
            if (monthData.timestamp) {
                monthName = (moment(monthData.timestamp).month() + 1) + Intl.get('common.time.unit.month', '月');
            } else {
                monthName = Intl.get('common.summation', '合计');
            }

            let processedMonthData = {
                month: monthName,
                timestamp: monthData.timestamp,
                teamNames: []
            };

            const teams = this.sortTeams(monthData.teams);
            teams.forEach((team, index) => {
                var parseTeamAmount = parseFloat(team.amount);
                var amount = !isNaN(parseTeamAmount) ? parseTeamAmount.toFixed(2) : '';
                processedMonthData['amount' + index] = parseAmount(amount);
                var parseGrossProfit = parseFloat(team.gross_profit);
                var grossProfit = !isNaN(parseGrossProfit) ? parseGrossProfit.toFixed(2) : '';
                processedMonthData['gross_profit' + index] = parseAmount(grossProfit);
                processedMonthData['gross_profit_margin' + index] = team.gross_profit_margin + '%';
                processedMonthData.teamNames.push(team.name);
            });
    
            return processedMonthData;
        });

        return processedData;
    }

    //获取表格列定义
    getColumns(data) {
        let columns = [{
            title: Intl.get('common.time.unit.the_sweep_month', '月份'),
            fixed: 'left',
            children: [{
                title: '',
                dataIndex: 'month',
                width: 50,
            }]
        }];

        let teams = data[0].teams || [];
        teams = this.sortTeams(teams);
        const teamColumns = teams.map((team, index) => {
            return {
                title: team.name,
                children: [{
                    title: Intl.get('contract.25', '合同额'),
                    dataIndex: 'amount' + index,
                    className: 'number-value clickable',
                    onCellClick: this.handleCellClick.bind(this, index),
                }, {
                    title: Intl.get('contract.27', '合同毛利'),
                    dataIndex: 'gross_profit' + index,
                    className: 'number-value clickable',
                    onCellClick: this.handleCellClick.bind(this, index),
                }, {
                    title: Intl.get('common.gross_profit_rate', '毛利率'),
                    dataIndex: 'gross_profit_margin' + index,
                    className: 'number-value clickable',
                    onCellClick: this.handleCellClick.bind(this, index),
                }]
            };
        });

        columns = columns.concat(teamColumns);

        return columns;
    }

    //按名称将团队排序，将合计放在最后
    sortTeams(teams) {
        let processedTeams = JSON.parse(JSON.stringify(teams));
        const sum = processedTeams.splice(-1);
        processedTeams = _.sortBy(processedTeams, 'name');
        processedTeams = processedTeams.concat(sum);
        return processedTeams;
    }

    handleCellClick(teamIndex, record, event) {
        const time = record.timestamp;
        const teamName = record.teamNames[teamIndex];
        const paramObj = {
            time: time,
            team_name: teamName,
        };

        let targetUrl = '/contract/sell';
        targetUrl += '?' + querystring.stringify(paramObj);

        window.open(targetUrl);
    }

    exportFile() {
        if (!this.state.data.length) return;

        let rows = [], row1 = [], row2 = [];

        this.state.columns.forEach((column, index) => {
            if (index === 0) {
                row1.push(column.title);
            } else {
                row1 = row1.concat(['', column.title, '']);
            }

            row2 = row2.concat( _.map(column.children, 'title') );
        });

        rows.push(row1, row2);
        
        const data = JSON.parse(JSON.stringify(this.state.data));
        data.forEach(rowObj => {
            delete rowObj.timestamp;
            delete rowObj.teamNames;
            rows.push( _.values(rowObj) );
        });

        exportToCsv('qiandan.csv', rows);
    }

    render() {
        return (
            <div>
                <span className='signing-statistics-export-btn' onClick={this.exportFile.bind(this)} style={{visibility: 'hidden'}}>{Intl.get('common.export', '导出')}</span>
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
SigningStatistics.propTypes = {
    chartData: PropTypes.array
};
export default SigningStatistics;

