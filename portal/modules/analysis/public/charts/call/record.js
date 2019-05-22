/**
 * 通话记录统计
 */

import Store from '../../store';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';

export function getCallRecordChart() {
    return {
        title: '通话记录统计',
        chartType: 'table',
        layout: {sm: 24},
        height: 'auto',
        url: [
            '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
            '/rest/base/v1/group/team/available/statistic'
        ],
        argCallback: arg => {
            let query = arg.query;

            if (query) {
                query.filter_phone = false,
                query.filter_invalid_phone = true,
                query.device_type = 'all';
            }
        },
        processData: data => {
            let callInfoList = _.get(data, '[0].result');
            const teamInfoList = _.get(data, '[1]');

            if (_.isArray(callInfoList) && _.isArray(teamInfoList)) {
                _.each(callInfoList, callInfo => {
                    const teamName = _.get(callInfo, 'name');

                    if (teamName) {
                        const corrTeamInfo = _.find(teamInfoList, teamInfo => teamInfo.team_name = teamName);
                        const availableUserNum = _.get(corrTeamInfo, 'available.user');

                        if (availableUserNum) {
                            callInfo.per_capita_duration = (callInfo.total_time / availableUserNum).toFixed();
                            callInfo.per_capita_number = (callInfo.total_callout_success / availableUserNum).toFixed();
                        }
                    }
                });

                return callInfoList;
            } else {
                return [];
            }
        },
        option: {
            columns: getColumns()
        }
    };
}

function getColumns() {
    let col_width = 95, num_col_width = 80, col_lg_width = 120;

    let columns = [{
        title: '销售团队',
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
                    {TimeUtil.getFormatTime(text)}
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
        sorter: function(a, b) {
            return a.callout_rate - b.callout_rate;
        },
        className: 'has-filter'
    }];

    // 如果是蚁坊的用户，展示有效通话时长和有效接通数
    const isOrganizationEefung = true;
    if ( isOrganizationEefung ){
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

    //如果选中的是列表中展示的是团队名称时，才展示人均通话时长和通话数
    if (Store.teamMemberFilterType === 'team') {
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
                        {TimeUtil.getFormatTime(text)}
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
        },);
    }

    return columns;
}
