/**
 * 报告列表
 */

import { AntcAnalysis } from 'antc';
import { dateSelectorEmitter } from 'PUB_DIR/sources/utils/emitters';

class ReportList extends React.Component {
    //获取查询条件
    getConditions = () => {
        return [
            {
                name: 'start_time',
                value: moment().startOf('day').valueOf(),
            },
            {
                name: 'end_time',
                value: moment().valueOf(),
            },
        ];
    };

    //获取事件触发器
    getEmitters = () => {
        return [
            {
                emitter: dateSelectorEmitter,
                event: dateSelectorEmitter.SELECT_DATE,
                callbackArgs: [{
                    name: 'start_time',
                }, {
                    name: 'end_time',
                }],
            },
        ];
    };

    //获取图表列表
    getCharts = () => {
        return [
            {
                chartType: 'table',
                layout: {sm: 24},
                height: 'auto',
                url: '/rest/customer/v3/dailyreport/report',
                dataField: 'daily_reports',
                processData: data => {
                    _.each(data, item => {
                        _.each(item.item_values, obj => {
                            const { name, value } = obj;

                            item[name] = value;
                        });
                    });

                    return data;
                },
                processOption: (option, chart) => {
                    const firstDataItem = _.first(chart.data);
                    if (firstDataItem) {
                        _.each(firstDataItem.item_values, obj => {
                            const { name } = obj;

                            option.columns.push({
                                title: name,
                                dataIndex: name,
                            });
                        });
                    }
                },
                option: {
                    columns: [
                        {
                            title: '团队',
                            dataIndex: 'sales_team',
                            width: 80,
                        },
                        {
                            title: '销售',
                            dataIndex: 'nickname',
                            width: 80,
                        },
                    ],
                },
            },
        ];
    };

    render() {
        return (
            <div>
                <AntcAnalysis
                    charts={this.getCharts()}
                    conditions={this.getConditions()}
                    emitterConfigList={this.getEmitters()}
                    isGetDataOnMount={true}
                    forceUpdate={true}
                    isUseScrollBar={true}
                />
            </div>
        );
    }
}

export default ReportList;
