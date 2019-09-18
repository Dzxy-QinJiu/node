/**
 * 客户经理业绩排名
 */

import { listPanelEmitter, detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
import ajax from 'ant-ajax';
import { Row, Col } from 'antd';
import { AntcTable } from 'antc';

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
            conditionCache = arg.query;
        },
        dataField: 'list',
        option: {
            onRowClick: onRankingRowClick,
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
                width: '10%',
            }, {
                title: Intl.get('common.personal.contribution.score', '个人贡献分数'),
                dataIndex: 'contribution_performance',
                width: '10%',
            }, {
                title: Intl.get('common.collection.of.gross.profit.margin.score', '回款毛利率分数'),
                dataIndex: 'gross_profit_rate_performance',
                width: '10%',
            }, {
                title: Intl.get('common.total.points', '总分'),
                dataIndex: 'performance',
                sorter: sorter.bind(null, 'performance'),
                width: '10%',
            }, {
                title: Intl.get('common.rank', '名次'),
                dataIndex: 'order',
                sorter: sorter.bind(null, 'order'),
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
            width: '10%'
        },
    ];

    ajax.send({
        url: '/rest/analysis/contract/contract/v2/all/performance/order/account_manager/detail',
        query: conditionCache
    }).then(result => {
        const paramObj = {
            content: getPerformanceDetailContent(result),
            onRowClick: showDetail
        };
    
        listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
    });
}

//获取业绩详情内容
function getPerformanceDetailContent(result) {
    _.each(result, (value, key) => {
        value.row_title = '数值';
    });

    const newGrossProfitColumns = [{
        title: '个人新签回款毛利',
        dataIndex: 'new_repayment_gross_profit',
    }];

    const contributionColumns = [{
        title: '个人回款毛利',
        dataIndex: 'repayment_gross_profit',
    }, {
        title: '流失合同金额',
        dataIndex: 'churn_amount',
    }, {
        title: '个人销售费用',
        dataIndex: 'cost',
    }];

    const grossProfitRateColumns = [{
        title: '个人回款',
        dataIndex: 'repayment_amount',
    }, {
        title: '个人回款毛利',
        dataIndex: 'repayment_gross_profit',
    }];

    return (
        <div>
            {getPerformanceDetailTable('新签回款毛利 (占30%)', newGrossProfitColumns, [result.new_gross_profit_performance])}
            {getPerformanceDetailTable('个人贡献(占40%)', contributionColumns, [result.contribution_performance])}
            {getPerformanceDetailTable('回款毛利率(占30%)', grossProfitRateColumns, [result.gross_profit_rate_performance])}
        </div>
    );
}

//获取业绩详情表格
function getPerformanceDetailTable(title, columns, data) {
    columns.unshift({
        title: '',
        dataIndex: 'row_title',
    });

    columns.push({
        title: '最大值',
        dataIndex: 'max',
    });

    return (
        <div style={{width: 600}}>
            <div style={{fontSize: 16, fontWeight: 'bold', paddingTop: 50}}>{title}</div>
            <AntcTable
                columns={columns}
                dataSource={data}
                pagination={false}
                bordered={true}
            />
        </div>
    );
}

function showDetail(record) {
    const type = record.key;
    let query = {};

    _.each(conditionCache, item => {
        query[item.name] = item.value;
    });

    query.type = type;

    ajax.send({
        url: '/rest/analysis/contract/contract/v2/all/performance/metrics/account_manager/detail',
        query
    }).then(result => {
        const title = record.title + Intl.get('common.indicators.for.details', '指标详情');

        const data = _.get(result, '[0]');
        let items = [];

        _.each(data, (value, key) => {
            let name;

            if (key === 'num') {
                name = Intl.get('contract.24', '合同号');
            } else if (key === 'contract_name') {
                name = Intl.get('contract.name', '合同名称');
            } else if (key === 'date') {
                value = moment(value).format(oplateConsts.DATE_FORMAT);

                if (type === 'cost') {
                    name = Intl.get('common.cost.date', '费用日期');
                } else if (_.includes(type, 'repay')) {
                    name = Intl.get('contract.237', '回款日期');
                } else {
                    name = Intl.get('crm.146', '日期');
                }
            } else if (key === 'value') {
                if (type === 'cost') {
                    name = Intl.get('contract.133', '费用');
                } else if (type === 'repayment_amount') {
                    name = Intl.get('contract.28', '回款额');
                } else if (type === 'repayment_gross_profit') {
                    name = Intl.get('contract.29', '回款毛利');
                } else if (type === 'newrepayment_gross_profit') {
                    name = Intl.get('contract.158', '新增回款毛利');
                } else if (type === 'churn_amount') {
                    name = Intl.get('common.loss.contract.amount', '流失合同额');
                } else {
                    name = Intl.get('common.the.numerical', '数值');
                }
            } else {
                name = key;
            }

            items.push({
                name,
                value
            });
        });

        const content = (
            <div style={{fontSize: 14}}>
                {_.map(items, item => (
                    <Row>
                        <Col span={6} style={{textAlign: 'right', fontWeight: 'bold', paddingRight: 8, marginBottom: 10}}>{item.name}: </Col>
                        <Col span={18}>{item.value}</Col>
                    </Row>
                ))}
            </div>
        );

        detailPanelEmitter.emit(detailPanelEmitter.SHOW, {
            title,
            content
        });
    });
}
