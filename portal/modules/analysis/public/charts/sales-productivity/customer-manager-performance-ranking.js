/**
 * 客户经理业绩排名
 */

import { listPanelEmitter, detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
import ajax from 'ant-ajax';
import { num as antUtilNum } from 'ant-utils';
import { AntcTable } from 'antc';
import { dataType } from '../../consts';
const userData = require('PUB_DIR/sources/user-data');

let conditionCache = {};

export function getCustomerManagerPerformanceRankingChart() {
    return {
        title: Intl.get('common.customer.manager.performance.ranking', '客户经理业绩排名'),
        chartType: 'table',
        layout: { sm: 24 },
        height: 'auto',
        url: '/rest/analysis/contract/contract/v2/performance/order/account_manager',
        conditions: [{
            name: 'page_size',
            value: 1000,
        }],
        argCallback: arg => {
            //当前用户所在团队
            const userTeamId = userData.getUserData().team_id;
            //如果当前用户有所属团队，且未选择要查询的团队，默认查询其所属团队的数据
            if (userTeamId && !arg.query.team_ids) {
                arg.query.team_ids = userTeamId;
            }
            conditionCache = arg.query;
        },
        dataField: 'list',
        option: {
            onRowClick: onRankingRowClick,
            rowClassName: () => 'clickable',
            columns: [{
                title: Intl.get('user.user.team', '团队'),
                dataIndex: 'sales_team',
                width: '10%',
            }, {
                title: Intl.get('sales.home.sales', '销售'),
                dataIndex: 'member_name',
                width: '10%',
            }, {
                title: Intl.get('common.gross.margin.score.of.newly.signed.refund', '新签回款毛利分数'),
                dataIndex: 'new_gross_profit_performance',
                align: 'right',
                width: '10%',
            }, {
                title: Intl.get('common.personal.contribution.score', '个人贡献分数'),
                dataIndex: 'contribution_performance',
                align: 'right',
                width: '10%',
            }, {
                title: Intl.get('common.collection.of.gross.profit.margin.score', '回款毛利率分数'),
                dataIndex: 'gross_profit_rate_performance',
                align: 'right',
                width: '10%',
            }, {
                title: Intl.get('common.total.points', '总分'),
                dataIndex: 'performance',
                sorter: sorter.bind(null, 'performance'),
                align: 'right',
                width: '10%',
            }, {
                title: Intl.get('common.rank', '名次'),
                dataIndex: 'order',
                sorter: sorter.bind(null, 'order'),
                align: 'right',
                width: '10%',
            }],
        },
        processOption: option => {
            const uniqTeams = _.uniqBy(option.dataSource, 'sales_team');

            //只有一个团队时
            if (uniqTeams.length === 1) {
                const teamColumnIndex = _.findIndex(option.columns, column => column.dataIndex === 'sales_team');

                if (teamColumnIndex !== -1) {
                    //去掉团队列
                    option.columns.splice(teamColumnIndex, 1);
                }
            }
        },
    };

    function sorter(f, a, b) {
        return a[f] - b[f];
    }
}

//排名表格行点击处理事件
function onRankingRowClick(record) {
    conditionCache.member_ids = record.member_id;

    const columns = [
        {
            title: Intl.get('clue.customer.score.indicator', '指标'),
            dataIndex: 'title',
            width: '10%'
        },
        {
            title: Intl.get('common.the.numerical', '数值'),
            dataIndex: 'value',
            align: 'right',
            width: '10%'
        },
    ];

    ajax.send({
        url: `/rest/analysis/contract/contract/v2/${dataType}/performance/order/account_manager/detail`,
        query: conditionCache
    }).then(result => {
        const paramObj = {
            title: record.sales_team + record.member_name + Intl.get('common.the.performance.of.subsidiary', '业绩明细'),
            content: getPerformanceDetailContent(result),
        };
    
        listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
    });
}

//获取业绩详情内容
function getPerformanceDetailContent(result) {
    _.each(result, (value, key) => {
        value.row_title = Intl.get('common.the.numerical', '数值');
    });

    const newGrossProfitColumns = [{
        title: Intl.get('common.personal.newly.signed.gross.profit', '个人新签回款毛利') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'new_repayment_gross_profit',
        align: 'right',
    }, {
        title: Intl.get('common.maximum.gross.margin.of.newly.signed.payment', '新签回款毛利最大值') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'max',
        align: 'right',
    }];

    const contributionColumns = [{
        title: Intl.get('common.personal.collection.gross.profit', '个人回款毛利') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'repayment_gross_profit',
        align: 'right',
    }, {
        title: Intl.get('common.lost.contract.amount', '流失合同金额') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'churn_amount',
        align: 'right',
    }, {
        title: Intl.get('common.personal.sales.expenses', '个人销售费用') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'cost',
        align: 'right',
    }, {
        title: Intl.get('common.maximum.personal.contribution', '个人贡献最大值') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'max',
        align: 'right',
    }];

    const grossProfitRateColumns = [{
        title: Intl.get('common.personal.collection', '个人回款') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'repayment_amount',
        align: 'right',
    }, {
        title: Intl.get('common.personal.collection.gross.profit', '个人回款毛利') + '（' + Intl.get('contract.155', '元') + '）',
        dataIndex: 'repayment_gross_profit',
        align: 'right',
    }, {
        title: Intl.get('common.the.maximum.gross.profit.rate', '回款毛利率最大值') + '（%）',
        dataIndex: 'max',
        align: 'right',
    }];

    return (
        <div style={{width: 740, margin: '0 auto'}}>
            {getPerformanceDetailTable(Intl.get('common.gross.profit.of.newly.signed.payment.30.percent', '新签回款毛利(占30%)'), newGrossProfitColumns, [result.new_gross_profit_performance])}
            {getPerformanceDetailTable(Intl.get('common.personal.contribution.40.percent', '个人贡献(占40%)'), contributionColumns, [result.contribution_performance])}
            {getPerformanceDetailTable(Intl.get('common.gross.profit.rate.30.percent', '回款毛利率(占30%)'), grossProfitRateColumns, [result.gross_profit_rate_performance])}
        </div>
    );
}

//获取业绩详情表格
function getPerformanceDetailTable(title, columns, data) {
    _.each(columns, column => {
        if (column.dataIndex !== 'max') {
            column.className = 'clickable';
            column.render = metricsValueRender.bind(column);
        }
    });

    columns.unshift({
        title: '',
        dataIndex: 'row_title',
    });

    return (
        <div>
            <div style={{fontSize: 16, fontWeight: 'bold', paddingTop: 50, paddingBottom: 10}}>{title}</div>
            <AntcTable
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered={true}
            />
        </div>
    );
}

function metricsValueRender(value) {
    return (
        <span
            onClick={showMetricsDetail.bind(null, this.dataIndex, this.title)}
        >
            {value}
        </span>
    );
}

function amountValueRender(value) {
    return (
        <span>
            {antUtilNum.formatAmount(value)}
        </span>
    );
}

function dateValueRender(value) {
    return (
        <span>
            {moment(value).format(oplateConsts.DATE_FORMAT)}
        </span>
    );
}

function showMetricsDetail(metricsKey, metricsTitle) {
    let query = _.clone(conditionCache);

    query.type = metricsKey;

    ajax.send({
        url: `/rest/analysis/contract/contract/v2/${dataType}/performance/metrics/account_manager/detail`,
        query
    }).then(result => {
        //去掉指标标题中的单位，该标题显示在指标详情中时不需要单位
        metricsTitle = metricsTitle.replace(/（.*）/, '');
        const title = metricsTitle + Intl.get('common.details', '详情');

        let tableTitle;
        let columns;

        if (metricsKey === 'cost') {
            tableTitle = Intl.get('common.personal.sales.expenses.ten.thousand.yuan', '个人销售费用（单位万元）');

            columns = [{
                dataIndex: 'date',
                title: Intl.get('common.login.time', '时间'),
                align: 'left',
                render: dateValueRender
            }, {
                dataIndex: 'cost',
                title: Intl.get('contract.133', '费用'),
                align: 'right',
                render: amountValueRender
            }, {
                dataIndex: 'type',
                title: Intl.get('contract.135', '费用类型'),
            }];
        } else {
            tableTitle = Intl.get('common.contract.details.ten.thousand.yuan', '合同详情（单位万元）');

            columns = [{
                dataIndex: 'num',
                title: Intl.get('contract.24', '合同号'),
            }, {
                dataIndex: 'customer_name',
                title: Intl.get('crm.41', '客户名'),
            }, {
                dataIndex: 'start_time',
                title: Intl.get('contract.120', '开始时间'),
                align: 'left',
                render: dateValueRender
            }, {
                dataIndex: 'end_time',
                title: Intl.get('contract.105', '结束时间'),
                align: 'left',
                render: dateValueRender
            }, {
                dataIndex: 'contract_amount',
                title: Intl.get('contract.25', '合同额'),
                align: 'right',
                render: amountValueRender
            }, {
                dataIndex: 'gross_profit',
                title: Intl.get('contract.27', '合同毛利'),
                align: 'right',
                render: amountValueRender
            }, {
                dataIndex: 'total_amount',
                title: Intl.get('contract.28', '回款额'),
                align: 'right',
                render: amountValueRender
            }, {
                dataIndex: 'total_gross_profit',
                title: Intl.get('contract.29', '回款毛利'),
                align: 'right',
                render: amountValueRender
            }, {
                dataIndex: 'label',
                title: Intl.get('contract.164', '签约类型'),
                render: value => <span>{value === 'new' ? Intl.get('crm.contract.new.sign', '新签') : Intl.get('common.to.renew', '续签')}</span>
            }];
        }

        const content = (
            <div style={{margin: '0 24px'}}>
                <div style={{fontSize: 14, fontWeight: 'bold', marginBottom: 10}}>{tableTitle}</div>

                <AntcTable
                    columns={columns}
                    dataSource={result}
                    pagination={false}
                    bordered={true}
                />
            </div>
        );

        detailPanelEmitter.emit(detailPanelEmitter.SHOW, {
            title,
            content,
            width: 1200
        });
    });
}
