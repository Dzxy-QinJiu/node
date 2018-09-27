/**
 * 试用合格客户分析
 */

module.exports = {
    title: '试用合格客户分析',
    menuIndex: 8,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    charts: getCharts()
};

function getCharts() {
    //统计列
    const statisticsColumns = [{
        dataIndex: 'last_month',
        title: '上月',
        width: '10%',
        render: trialQualifiedNumRender.bind(this, 'last_month_customer_ids'),
    }, {
        dataIndex: 'this_month',
        title: '本月',
        width: '10%',
        render: trialQualifiedNumRender.bind(this, 'this_month_customer_ids'),
    }, {
        dataIndex: 'this_month_new',
        title: '本月新增',
        width: '10%',
        render: trialQualifiedNumRender.bind(this, 'this_month_new_customer_ids'),
    }, {
        dataIndex: 'this_month_lose',
        title: '本月流失',
        width: '10%',
        render: trialQualifiedNumRender.bind(this, 'this_month_lose_customer_ids'),
    }, {
        dataIndex: 'this_month_back',
        title: '本月回流',
        width: '10%',
        render: trialQualifiedNumRender.bind(this, 'this_month_back_customer_ids'),
    }, {
        dataIndex: 'this_month_add',
        title: '本月比上月净增',
        width: '15%',
    }, {
        dataIndex: 'highest',
        title: '历史最高',
        width: '10%',
    }, {
        dataIndex: 'this_month_add_highest',
        title: '本月比历史最高净增',
        width: '20%',
    }];

    //表格列
    let columns = _.cloneDeep(statisticsColumns);
    columns.unshift({
        title: '团队',
        width: '10%',
        dataIndex: 'team_name',
    });

    return [{
        title: '试用合格客户数统计',
        url: '/rest/analysis/customer/v2/statistic/:data_type/customer/qualify',
        argCallback: (arg) => {
            let query = arg.query;

            if (query && query.starttime && query.endtime) {
                query.start_time = query.starttime;
                query.end_time = query.endtime;
                delete query.starttime;
                delete query.endtime;
            }
        },
        layout: {sm: 24},
        processData: data => {
            data = data.list || [];
            _.each(data, dataItem => {
                _.each(statisticsColumns, column => {
                    const key = column.dataIndex;
                    const customerIds = _.get(dataItem, [key, 'customer_ids']);

                    if (customerIds) {
                        dataItem[key + '_customer_ids'] = customerIds.join(',');
                    }

                    dataItem[key] = dataItem[key].total;
                });
            });

            return data;
        },
        chartType: 'table',
        height: 'auto',
        option: {
            columns,
        },
        processOption: (option, chartProps) => {
            //从返回数据里获取一下销售昵称
            const nickName = _.get(chartProps, 'data[0].nick_name');

            //若存在销售昵称，说明返回的是销售列表
            if (nickName) {
                //找到名称列
                let nameColumn = _.find(option.columns, column => column.dataIndex === 'team_name');

                if (nameColumn) {
                    //将名称列的数据索引改为指向昵称字段
                    nameColumn.dataIndex = 'nick_name';
                    //将名称列的标题改为销售
                    nameColumn.title = '销售';
                }
            }
        },
    }];
}

function handleTrialQualifiedNumClick(customerIds) {
    history.push({
        from: 'sales_home',
        trialQualifiedCustomerIds: customerIds
    }, '/crm', {});
}

function trialQualifiedNumRender(customerIdsField, text, record) {
    const customerIds = record[customerIdsField];

    if (customerIds) {
        return (
            <span onClick={handleTrialQualifiedNumClick.bind(this, customerIds)} style={{cursor: 'pointer'}}>
                {text}
            </span>
        );
    } else {
        return (
            <span>
                {text}
            </span>
        );
    }
}
