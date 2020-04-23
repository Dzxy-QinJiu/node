/**
 * 试用合格客户地域、行业分析
 */

export function getCustomerTrialQualifiedDistributionChart(title, field) {
    return {
        title,
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
        url: '/rest/analysis/customer/v2/:data_type/accounts/login/qualify/statistic',
        conditions: [{
            name: 'customer_label',
            value: '试用',
        }, {
            name: 'distribution_statistics_type',
            value: field
        }],
        argCallback: arg => {
            //该接口定义的 statistics_type 参数和用于区分是按团队还是成员返回的公共参数重名了，导致在切换团队或成员后其值会被公共参数值覆盖
            //所以需要在参数处理回调函数这里处理一下，将被覆盖的值还原
            arg.query.statistics_type = arg.query.distribution_statistics_type;
            delete arg.query.distribution_statistics_type;
        },
        dataField: 'result',
        processOption: (option, chartProps) => {
            let dataSource = [];

            _.each(chartProps.data, dataItem => {
                let name = dataItem.team_name;

                //如果存在昵称，说明返回的是成员的数据，名称列需要显示销售昵称
                if (dataItem.nick_name) {
                    name = dataItem.nick_name;
                }

                //区域或行业数据
                const staList = dataItem.sta_list;

                if (staList && staList.length) {
                    _.each(staList, (staItem, index) => {
                        staItem.name = name;

                        dataSource.push(staItem);
                    });
                } else {
                    dataSource.push({
                        name,
                        open_trial: 0,
                        valid_login: 0,
                        trial_qualify: 0,
                    });
                }
            });

            let columns = [{
                title: '名称',
                dataIndex: 'name',
                isSetCsvValueBlank: true,
            }, {
                title: field === 'province' ? '区域' : '行业',
                dataIndex: 'sta_type',
                isSetCsvValueBlank: true
            }, {
                title: '已开通试用客户数',
                align: 'right',
                dataIndex: 'open_trial'
            }, {
                title: '有效登录客户数',
                align: 'right',
                dataIndex: 'valid_login'
            }, {
                title: '试用合格客户数',
                align: 'right',
                dataIndex: 'trial_qualify'
            }];

            option.columns = columns;
            option.dataSource = dataSource;
        },
    };
}
