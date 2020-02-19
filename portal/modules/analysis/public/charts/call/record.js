/**
 * 通话记录统计
 */

import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import { Checkbox, Popover } from 'antd';
const { isAdminRole, isManagerOrOpRole } = require('PUB_DIR/sources/utils/common-method-util');

export function getCallRecordChart(paramObj = {}) {
    let title = Intl.get('analysis.call.record.statistics', '通话记录统计');

    const isAdmin = isAdminRole();
    const isManagerOrOp = isManagerOrOpRole();

    if ((isAdmin || isManagerOrOp) && !paramObj.Store.isShowEffectiveTimeAndCount) {
        const onClickTip = function() {
            if (!isAdmin) return;

            window.open('https://caller.curtao.com/manage/rules');
        };

        const tip = <span style={{fontSize: 13, cursor: 'pointer'}} onClick={onClickTip}>{Intl.get('analysis.how.filter.114', '如何过滤114等?')}</span>;

        title = (
            <span>
                {title}

                (

                {isAdmin ? tip : (
                    <Popover
                        content={Intl.get('analysis.contact.admin.set.call.center.rule', '请联系管理员，到呼叫中心设置规则')}
                        trigger="click"
                    >
                        {tip}
                    </Popover>
                )}

                )
            </span>
        );
    }

    return {
        title,
        layout: {sm: 24},
        height: 'auto',
        chartType: 'table',
        url: [
            '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
            '/rest/base/v1/group/team/available/statistic'
        ],
        ajaxInstanceFlag: 'getCallRecordStatistics',
        processData: (data, chart, analysisInstance, chartIndex) => {
            _.set(chart, 'cardContainer.props.refreshData', refreshData.bind(null, analysisInstance, chartIndex));

            let callInfoList = _.get(data, '[0].result');
            const teamInfoList = _.get(data, '[1]');

            if (_.isArray(callInfoList) && _.isArray(teamInfoList)) {
                const sumRowName = Intl.get('common.summation', '合计');

                //合计列
                let sumRow = _.get(data, '[0].total');

                if (sumRow) {
                    sumRow.name = sumRowName;
                    callInfoList.push(sumRow);
                }

                _.each(callInfoList, callInfo => {
                    const teamName = _.get(callInfo, 'name');

                    if (teamName) {
                        let availableUserNum;

                        if (teamName === sumRowName) {
                            availableUserNum = _.sumBy(teamInfoList, 'available.user');
                        } else {
                            const corrTeamInfo = _.find(teamInfoList, teamInfo => teamInfo.team_name === teamName);
                            availableUserNum = _.get(corrTeamInfo, 'available.user', 1);
                        }

                        if (availableUserNum) {
                            callInfo.per_capita_duration = _.toInteger(callInfo.total_time / availableUserNum);
                            callInfo.per_capita_number = _.toInteger(callInfo.total_callout_success / availableUserNum);
                        }
                    }

                    //日均接通数转换为整数
                    callInfo.average_num = _.toInteger(callInfo.average_num);
                    //日均时长转换为整数
                    callInfo.average_time = _.toInteger(callInfo.average_time);
                });

                return callInfoList;
            } else {
                return [];
            }
        },
        processOption: option => {
            option.columns = getColumns();
        },
        cardContainer: {
            props: {
                isShowRefreshButton: true,
            },
        },
    };

    function getColumns() {
        //是否显示的是团队数据
        let isShowTeamData = paramObj.Store.teamMemberFilterType === 'team';

        //只有一个团队时不显示的是团队数据
        if (paramObj.Store.teamList.list.length === 1) {
            isShowTeamData = false;
        }

        let col_width = 95, num_col_width = 80, col_lg_width = 120;

        let columns = [{
            title: isShowTeamData ? Intl.get('user.sales.team', '销售团队') : Intl.get('sales.home.sales', '销售'),
            width: col_width,
            dataIndex: 'name',
        }, {
            title: Intl.get('sales.home.total.duration', '总时长'),
            width: col_width,
            dataIndex: 'total_time',
            sorter: function(a, b) {
                return a.total_time - b.total_time;
            },
            className: 'has-filter',
            render: function(text, record, index){
                return (
                    <span>
                        {TimeUtil.getFormatTime(text)}
                    </span>
                );
            }
        }, {
            title: Intl.get('sales.home.total.connected', '总接通数'),
            width: col_width,
            dataIndex: 'total_callout_success',
            sorter: function(a, b) {
                return a.total_callout_success - b.total_callout_success;
            },
            className: 'has-filter'
        }, {
            title: Intl.get('sales.home.average.duration', '日均时长'),
            width: col_width,
            dataIndex: 'average_time',
            sorter: function(a, b) {
                return a.average_time - b.average_time;
            },
            className: 'has-filter',
            render: function(text, record, index){
                return (
                    <span>
                        {_.isNumber(text) ? TimeUtil.getFormatTime(text) : null}
                    </span>
                );
            }
        }, {
            title: Intl.get('sales.home.average.connected', '日均接通数'),
            width: col_lg_width,
            dataIndex: 'average_num',
            sorter: function(a, b) {
                return a.average_num - b.average_num;
            },
            className: 'has-filter'
        }, {
            title: Intl.get('sales.home.phone.callin', '呼入次数'),
            width: col_width,
            dataIndex: 'total_callin',
            sorter: function(a, b) {
                return a.total_callin - b.total_callin;
            },
            className: 'has-filter'
        }, {
            title: Intl.get('sales.home.phone.callin.success', '成功呼入'),
            width: col_width,
            dataIndex: 'total_callin_success',
            sorter: function(a, b) {
                return a.total_callin_success - b.total_callin_success;
            },
            className: 'has-filter'
        }, {
            title: Intl.get('sales.home.phone.callin.rate', '呼入接通率'),
            width: col_lg_width,
            dataIndex: 'callin_rate',
            showAsPercent: true,
            sorter: function(a, b) {
                return a.callin_rate - b.callin_rate;
            },
            className: 'has-filter'
        }, {
            title: Intl.get('sales.home.phone.callout', '呼出次数'),
            width: col_width,
            dataIndex: 'total_callout',
            sorter: function(a, b) {
                return a.total_callout - b.total_callout;
            },
            className: 'has-filter'
        }, {
            title: Intl.get('sales.home.phone.callout.rate', '呼出接通率'),
            width: col_lg_width,
            dataIndex: 'callout_rate',
            showAsPercent: true,
            sorter: function(a, b) {
                return a.callout_rate - b.callout_rate;
            },
            className: 'has-filter'
        }];

        // 如果需要展示有效通话时长和有效接通数
        if ( paramObj.Store.isShowEffectiveTimeAndCount ){
            columns.push({
                title: Intl.get('sales.home.phone.effective.connected', '有效接通数'),
                width: col_lg_width,
                dataIndex: 'total_effective',
                sorter: function(a, b) {
                    return a.total_effective - b.total_effective;
                },
                className: 'has-filter'
            },{
                title: Intl.get('sales.home.phone.effective.time', '有效通话时长'),
                width: col_lg_width,
                align: 'right',
                dataIndex: 'total_effective_time',
                sorter: function(a, b) {
                    return a.total_effective_time - b.total_effective_time;
                },
                className: 'has-filter',
                render: function(text, record, index){
                    return text === '-' ? text : (
                        <span>
                            {TimeUtil.getFormatTime(text)}
                        </span>
                    );
                }
            });
        }

        //如果显示的是团队数据，才展示人均通话时长和通话数
        if (isShowTeamData) {
            columns.splice(3, 0, {
                title: Intl.get('call.record.average.call.duration', '人均时长'),
                width: col_width,
                align: 'right',
                dataIndex: 'per_capita_duration',
                sorter: function(a, b) {
                    return a.per_capita_duration - b.per_capita_duration;
                },
                render: function(text, record, index){
                    return (
                        <span>
                            {_.isNumber(text) ? TimeUtil.getFormatTime(text) : null}
                        </span>
                    );
                }
            }, {
                title: Intl.get('call.record.average.connected', '人均接通数'),
                width: col_lg_width,
                align: 'right',
                dataIndex: 'per_capita_number',
                sorter: function(a, b) {
                    return a.per_capita_number - b.per_capita_number;
                },
            });
        }

        return columns;
    }

    function refreshData(analysisInstance, chartIndex) {
        analysisInstance.getData(chartIndex);
    }
}
