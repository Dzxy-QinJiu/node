/**
 * 电话量统计
 */

import { LEAVE_TYPES } from '../consts';

export const callVolumeChart = {
    title: Intl.get('common.telephone.statistics', '电话量统计'),
    chartType: 'table',
    url: '/rest/analysis/callrecord/v1/callrecord/statistics/call_record/view',
    argCallback: arg => {
        if (arg.query.member_id) {
            arg.query.member_ids = arg.query.member_id;
            arg.query.statistics_type = 'user';
            delete arg.query.member_id;
        }
    },
    dataField: 'result',
    option: {
        columns: [{
            title: Intl.get('common.assessment.index', '考核指标'),
            dataIndex: 'assessment_index',
            sorter: (a, b) => a.assessment_index - b.assessment_index,
            render: numberRender,
            align: 'right',
            width: 100,
        },
        {
            title: `${Intl.get('sales.home.average.duration', '日均时长')}(${Intl.get('user.time.second', '秒')})`,
            dataIndex: 'average_time',
            render: numberRender,
            align: 'right',
            width: 100,
        },
        {
            title: Intl.get('sales.home.average.connected', '日均接通数'),
            dataIndex: 'average_num',
            render: numberRender,
            align: 'right',
            width: 90,
        },
        {
            title: `${Intl.get('sales.home.total.duration', '总时长')}(${Intl.get('user.time.second', '秒')})`,
            dataIndex: 'total_time',
            align: 'right',
            width: 90,
        },
        {
            title: Intl.get('sales.home.total.connected', '总接通数'),
            dataIndex: 'total_callout_success',
            align: 'right',
            width: 80,
        },
        {
            title: Intl.get('weekly.report.attendance.remarks', '出勤备注'),
            dataIndex: 'total_callout_success',
            width: 150,
            render: (text, record, index) => {
                if (record.leave_info_list) {
                    return _.map(record.leave_info_list, remarks => {
                        const leaveTime = moment(remarks.leave_time).format(oplateConsts.DATE_FORMAT);
                        const leaveDetail = remarks.leave_detail;
                        const leaveDays = remarks.leave_days;
                        const leaveType = _.find(LEAVE_TYPES, typeItem => typeItem.value === leaveDetail);
                        let leaveDetailLabel = '';

                        if (leaveType) {
                            leaveDetailLabel = leaveType.label;
                        }

                        return (
                            <div className="remarks-item">
                                {leaveTime}{leaveDetailLabel}{Intl.get('weekly.report.n.days', '{n}天', {n: leaveDays})}
                            </div>
                        );
                    });
                } else {
                    return null;
                }
            }
        }]
    },
};

function numberRender(value) {
    if (!_.isNumber(value)) value = 0;

    return <span>{value.toFixed()}</span>;
}
