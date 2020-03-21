/**
 * 报告列表
 */

import { AntcAnalysis } from 'antc';
import { teamTreeEmitter, dateSelectorEmitter } from 'PUB_DIR/sources/utils/emitters';
import userData from 'PUB_DIR/sources/user-data';
import { showReportPanel, showNumberDetail } from './utils';
import { VIEW_TYPE } from './consts';
import ReportDetail from './report-detail';

class ReportList extends React.Component {
    //获取查询条件
    getConditions = () => {
        return [
            {
                name: 'team_ids',
                value: '',
            },
            {
                name: 'member_ids',
                value: '',
            },
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
            {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: 'team_ids',
                    exclusive: 'member_ids',
                }],
            },
            {
                emitter: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_MEMBER,
                callbackArgs: [{
                    name: 'member_ids',
                    exclusive: 'team_ids',
                }],
            }
        ];
    };

    //获取图表列表
    getCharts = () => {
        let chart = {
            title: '销售经理日报',
            layout: {sm: 24},
            height: 'auto',
            cardContainer: {
                props: {
                    isShowExportBtnWhenMouseEnter: false
                },
            },
            url: '/rest/customer/v3/dailyreport/report',
            dataField: 'daily_reports',
            processData: data => {
                _.each(data, item => {
                    _.each(item.item_values, obj => {
                        const { name, value, value_str } = obj;

                        item[name] = value_str || value;
                    });
                });

                return data;
            },
        };

        const { isCommonSales } = userData.getUserData();

        if (isCommonSales) {
            _.extend(chart, {
                chartType: 'custom',
                customChartRender: data => {
                    const currentReport = _.first(data) || {};

                    return <ReportDetail currentReport={currentReport} />;
                }
            });
        } else {
            _.extend(chart, {
                chartType: 'table',
                processOption: (option, chart) => {
                    const firstDataItem = _.first(chart.data);
    
                    if (firstDataItem) {
                        const { nickname, item_values } = firstDataItem;
                        const { columns } = option;
    
                        if (nickname) {
                            columns.push({
                                title: '销售',
                                dataIndex: 'nickname',
                                width: 80,
                            });
                        }
    
                        _.each(firstDataItem.item_values, obj => {
                            const { name } = obj;
    
                            let column = {
                                title: name,
                                dataIndex: name,
                                width: 130,
                                align: 'right',
                                render: (value, record) => {
                                    return <span onClick={showNumberDetail.bind(this, record, name)}>{value}</span>;
                                }
                            };
    
                            if (name === '其他') {
                                column.isSetCsvValueBlank = true;
                                column.align = 'left';
                                column.render = value => value;
                            }
    
                            columns.push(column);
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
                    ],
                    onRowClick: (record, index, event) => {
                        if (record.nickname) {
                            showReportPanel({
                                currentView: VIEW_TYPE.REPORT_FORM,
                                currentReport: record,
                                isPreview: true
                            });
                        } else {
                            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, record.sales_team_id);
                        }
                    }
                },
            });
        }

        return [chart];
    };

    render() {
        return (
            <div className="report-list">
                <AntcAnalysis
                    charts={this.getCharts()}
                    conditions={this.getConditions()}
                    emitterConfigList={this.getEmitters()}
                    isGetDataOnMount={true}
                    forceUpdate={true}
                    isUseScrollBar={true}
                    style={{marginRight: 0}}
                />
            </div>
        );
    }
}

export default ReportList;
