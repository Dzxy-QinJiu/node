/**
 * 客户经理业绩排名
 */

import { listPanelEmitter, detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
import ajax from 'ant-ajax';
import { Row, Col } from 'antd';

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
        dataField: 'list',
        option: {
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

function handleNumberClick(conditions, type, record) {
    conditions = _.filter(conditions, item => _.includes(['interval', 'start_time', 'end_time'], item.name));

    conditions.push({
        name: 'type',
        value: type
    }, {
        name: 'member_ids',
        value: record.member_id
    });

    conditionCache = conditions;

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

    const paramObj = {
        listType: 'customer',
        url: '/rest/analysis/contract/contract/v2/all/performance/order/account_manager/detail',
        dataField: null,
        conditions,
        columns,
        onRowClick: showDetail
    };

    listPanelEmitter.emit(listPanelEmitter.SHOW, paramObj);
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
