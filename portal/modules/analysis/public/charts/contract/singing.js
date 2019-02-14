/**
 * 签单情况统计表
 */

import { argCallbackTeamIdsToTeamId } from '../../utils';
import { num as antUtilNum } from 'ant-utils';
const parseAmount = antUtilNum.parseAmount;
const querystring = require('querystring');
const TEAM_COLUMN_WIDTH = 380;

export function getSingingChart() {
    return {
        title: Intl.get('contract.166', '签单情况统计表') + '(' + Intl.get('contract.160', '单位') + ': ' + Intl.get('contract.155', '元') + ')',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/contract/contract/team/amount',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }

            argCallbackTeamIdsToTeamId(arg);
        },
        chartType: 'table',
        processOption: processOption,
    };
}

function processData(data) {
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

        const teams = sortTeams(monthData.teams);
        teams.forEach((team, index) => {
            processedMonthData['amount' + index] = parseAmount( team.amount.toFixed(2) );
            processedMonthData['gross_profit' + index] = parseAmount( team.gross_profit.toFixed(2) );
            processedMonthData['gross_profit_margin' + index] = team.gross_profit_margin + '%';
            processedMonthData.teamNames.push(team.name);
        });

        return processedMonthData;
    });

    return processedData;
}

//处理表格选项
function processOption(option, props) {
    const data = props.data;

    if (!data.length) {
        option.columns = [];
        return;
    }

    let columns = [{
        title: Intl.get('common.time.unit.the_sweep_month', '月份'),
        fixed: 'left',
        children: [{
            title: '',
            dataIndex: 'month',
            width: 50,
        }]
    }];

    let teams = _.get(data, '[0].teams', []);
    teams = sortTeams(teams);
    const teamColumns = teams.map((team, index) => {
        return {
            title: team.name,
            children: [{
                title: Intl.get('contract.25', '合同额'),
                dataIndex: 'amount' + index,
                className: 'number-value clickable',
                onCellClick: handleCellClick.bind(this, index),
            }, {
                title: Intl.get('contract.27', '合同毛利'),
                dataIndex: 'gross_profit' + index,
                className: 'number-value clickable',
                onCellClick: handleCellClick.bind(this, index),
            }, {
                title: Intl.get('common.gross_profit_rate', '毛利率'),
                dataIndex: 'gross_profit_margin' + index,
                className: 'number-value clickable',
                onCellClick: handleCellClick.bind(this, index),
            }]
        };
    });

    columns = columns.concat(teamColumns);

    const scrollX = teams.length * TEAM_COLUMN_WIDTH;

    option.columns = columns;
    option.dataSource = processData(data);
    option.scroll = {x: scrollX};
}

//按名称将团队排序，将合计放在最后
function sortTeams(teams) {
    let processedTeams = JSON.parse(JSON.stringify(teams));
    const sum = processedTeams.splice(-1);
    processedTeams = _.sortBy(processedTeams, 'name');
    processedTeams = processedTeams.concat(sum);
    return processedTeams;
}

function handleCellClick(teamIndex, record, event) {
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
