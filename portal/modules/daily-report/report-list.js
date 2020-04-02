/**
 * 报告列表
 */

import { AntcAnalysis } from 'antc';
import { teamTreeEmitter, dateSelectorEmitter } from 'PUB_DIR/sources/utils/emitters';
import userData from 'PUB_DIR/sources/user-data';
import { showReportPanel, processReportListData, numberRender } from './utils';
import { VIEW_TYPE, REPORT_LIST_DATA_FIELD } from './consts';
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
            title: Intl.get('analysis.sales.manager.daily.report', '销售经理日报'),
            layout: {sm: 24},
            height: 'auto',
            cardContainer: {
                props: {
                    isShowExportBtnWhenMouseEnter: false
                },
            },
            url: '/rest/customer/v3/dailyreport/report',
            processData: processReportListData
        };

        const { isCommonSales } = userData.getUserData();

        if (isCommonSales) {
            _.extend(chart, {
                chartType: 'custom',
                noExportCsv: true,
                customChartRender: data => {
                    const reportDetail = _.first(data) || {};

                    return <ReportDetail reportDetail={reportDetail} />;
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
                                title: Intl.get('sales.home.sales', '销售'),
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
                                render: numberRender.bind(null, name)
                            };
    
                            if (name === Intl.get('user.login.analysis.customer.other', '其他')) {
                                if (nickname) {
                                    column.isSetCsvValueBlank = true;
                                    column.align = 'left';
                                    delete column.render;

                                    columns.push(column);
                                }
                            } else {
                                columns.push(column);
                            }
                        });
                    }
                },
                option: {
                    columns: [
                        {
                            title: Intl.get('user.user.team', '团队'),
                            dataIndex: 'sales_team',
                            width: 80,
                        },
                    ],
                    onRowClick: (record, index, e) => {
                        if (record.nickname) {
                            Trace.traceEvent(e, '点击表格行，查看报告详情');

                            showReportPanel({
                                currentView: VIEW_TYPE.REPORT_DETAIL,
                                reportDetail: record,
                                isPreviewReport: true
                            });
                        } else {
                            Trace.traceEvent(e, '点击表格行，查看下级团队报告列表');

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
            <div className="daily-report daily-report-list" data-tracename="销售日报列表">
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
