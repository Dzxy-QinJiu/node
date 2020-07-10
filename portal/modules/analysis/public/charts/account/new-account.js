/**
 * 新开账号数统计
 */

const APP_COLUMN_WIDTH = 240;

export function getNewAccountChart(paramObj = {}) {
    return {
        title: Intl.get('user.analysis.new.account.title', '新开账号数统计'),
        url: '/rest/analysis/user/v3/:data_type/apply/user',
        conditions: [{
            name: 'interval',
            value: 'week'
        }],
        noShowCondition: {
            app_id: '!all',
        },
        cardContainer: {
            selectors: [{
                options: [
                    {name: Intl.get('common.time.unit.day', '天'), value: 'day'},
                    {name: Intl.get('common.time.unit.week', '周'), value: 'week'},
                    {name: Intl.get('common.time.unit.month', '月'), value: 'month'},
                    {name: Intl.get('common.time.unit.quarter', '季度'), value: 'quarter'},
                    {name: Intl.get('common.time.unit.year', '年'), value: 'year'}
                ],
                activeOption: 'week',
                conditionName: 'interval',
            }],
        },
        chartType: 'table',
        height: 'auto',
        layout: {sm: 24},
        processChart: processChart.bind(this, paramObj),
        processCsvData: chart => {
            let rows = [], row1 = [], row2 = [];
            const columns = chart.option.columns;
            const dataSource = chart.option.dataSource;

            columns.forEach((column, index) => {
                if (index === 0) {
                    row1.push(column.title);
                } else {
                    row1 = row1.concat(['', column.title, '']);
                }

                row2 = row2.concat( _.map(column.children, 'title') );
            });

            rows.push(row1, row2);

            dataSource.forEach(rowObj => {
                rows.push( _.values(rowObj) );
            });

            return rows;
        }
    };
}


function processData(data) {
    const processedData = data.map((appsData, index) => {

        let processedAppsData = {
            sales_team: _.get(appsData, 'sales_team'),
            appNames: []
        };
        const apps = _.get(appsData, 'apps');
        apps.forEach((app, index) => {
            processedAppsData['new_count' + index] = _.get(app, 'new_count', 0);
            processedAppsData['active_count' + index] = _.get(app, 'active_count', 0);
            processedAppsData['active_percent' + index] = `${_.get(app, 'active_percent', 0)}%`;
            processedAppsData.appNames.push(_.get(app, 'app_name', ''));
        });

        return processedAppsData;
    });

    return processedData;
}

//处理图表
function processChart(paramObj, props) {
    let option = props.option = {};
    const data = props.data;

    if (!data.length) {
        option.columns = [];
        return;
    }

    let columns = [{
        title: Intl.get('user.user.team', '团队'),
        fixed: 'left',
        width: 110,
        children: [{
            title: '',
            dataIndex: 'sales_team',
            width: 110,
        }]
    }];

    let apps = _.get(data, '[0].apps', []);

    const appsColumns = apps.map((app, index) => {
        return {
            title: _.get(app, 'app_name'),
            children: [{
                title: Intl.get('weekly.report.open.account', '开通数'),
                align: 'right',
                dataIndex: 'new_count' + index,
                render: value => <div style={{textAlign: 'right'}}>{value}</div>
            }, {
                title: Intl.get('user.analysis.account.active.count', '有效登录数'),
                align: 'right',
                dataIndex: 'active_count' + index,
                render: value => <div style={{textAlign: 'right'}}>{value}</div>
            }, {
                title: Intl.get('user.analysis.account.active.percent', '登录率'),
                align: 'right',
                dataIndex: 'active_percent' + index,
                render: value => <div style={{textAlign: 'right'}}>{value}</div>
            }]
        };
    });

    columns = columns.concat(appsColumns);

    const scrollX = apps.length * APP_COLUMN_WIDTH;

    option.columns = columns;
    option.dataSource = processData(data);
    option.scroll = {x: scrollX};
}
