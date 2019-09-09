/**
 * 客户经理业绩排名
 */

import { listPanelEmitter, detailPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
import ajax from 'ant-ajax';

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
        processData: (data, chart, analysisInstance) => {
            const conditions = _.cloneDeep(analysisInstance.state.conditions);

            chart.option = {
                columns: [{
                    title: Intl.get('user.user.team', '团队'),
                    dataIndex: 'sales_team',
                    width: '10%',
                }, {
                    title: Intl.get('sales.home.sales', '销售'),
                    dataIndex: 'member_name',
                    width: '10%',
                }, {
                    title: '新签回款毛利分数',
                    dataIndex: 'new_gross_profit_performance',
                    render: clickableCellRender.bind(null, conditions, 'new_gross_profit_performance'),
                    width: '10%',
                }, {
                    title: '个人贡献分数',
                    dataIndex: 'contribution_performance',
                    render: clickableCellRender.bind(null, conditions, 'contribution_performance'),
                    width: '10%',
                }, {
                    title: '回款毛利率分数',
                    dataIndex: 'gross_profit_rate_performance',
                    render: clickableCellRender.bind(null, conditions, 'gross_profit_rate_performance'),
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
            };

            return data;
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

function clickableCellRender(conditions, type, value, record) {
    return (
        <span
            style={{cursor: 'pointer'}}
            onClick={handleNumberClick.bind(null, conditions, type, record)}
        >
            {value}
        </span>
    );
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

    const columns = [
        {
            title: '指标',
            dataIndex: 'title',
            width: '10%'
        },
        {
            title: '数值',
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

function showDetail(detail) {
    ajax.send({
        url: '/rest/customer/v2/customer/industries'
    }).then(result => {
        detailPanelEmitter.emit(detailPanelEmitter.SHOW, {
            title,
            content
        });
    });
}
