/**
 * 用户留存统计
 */

import { ifNotSingleApp, isSales } from '../../utils';

export function getRemainAccountChart(type = 'total', title) {
    return {
        title: title || Intl.get('oplate.user.analysis.9', '用户留存'),
        url: '/rest/analysis/user/v1/retention',
        chartType: 'table',
        option: {
            columns: (() => {
                let columns = [
                    {
                        title: Intl.get('common.login.time', '时间'),
                        dataIndex: 'timestamp',
                        width: '10%',
                        align: 'left',
                        render: text => {
                            text = moment(text).format(oplateConsts.DATE_MONTH_DAY_FORMAT);
                            return <b>{text}</b>;
                        },
                    }, {
                        title: Intl.get('oplate.user.analysis.32', '新增数'),
                        dataIndex: 'count',
                        width: '10%',
                    }, {
                        title: Intl.get('oplate.user.analysis.23', '当天'),
                        dataIndex: 'day0',
                        width: '10%',
                        align: 'right',
                        render: text => {
                            text = isNaN(text) ? '0' : text;
                            return <span>{text}</span>;
                        },
                    }, {
                        title: Intl.get('oplate.user.analysis.24', '次日'),
                        dataIndex: 'day1',
                        width: '10%',
                        align: 'right',
                        render: (text, record) => {
                            if (moment().diff(record.timestamp, 'day') < 1) {
                                text = '';
                            } else {
                                text = isNaN(text) ? '0' : text;
                            }
                            return <span>{text}</span>;
                        },
                    },
                ];

                _.each(_.range(5), num => {
                    const index = num + 2;

                    columns.push({
                        title: Intl.get('oplate.user.analysis.25', '{count}天后', {count: index}),
                        dataIndex: 'day' + index,
                        width: '10%',
                        align: 'right',
                        render: (text, record) => {
                            if (moment().diff(record.timestamp, 'day') < index) {
                                text = '';
                            } else {
                                text = isNaN(text) ? '0' : text;
                            }
                            return <span>{text}</span>;
                        },
                    });
                });

                return columns;
            })(),
        },
        customOption: {
            fieldName: 'actives',
            needExtractColumns: true,
            callback: dataItem => {
                const actives = dataItem.actives;

                _.each(actives, activeItem => {
                    const diffDay = moment(activeItem.timestamp).diff(dataItem.timestamp, 'day');
                    dataItem['day' + diffDay] = activeItem.active;
                });
            },
        },
        noShowCondition: {
            callback: conditions => {
                return isSales() || ifNotSingleApp(conditions);
            }
        },
    };
}
