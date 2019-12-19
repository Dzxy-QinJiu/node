/**
 * 用户留存统计
 */

import { ifNotSingleApp, isSales, argCallbackUnderlineTimeToTime } from '../../utils';

export function getRemainAccountChart(paramObj = {}) {
    const title = paramObj.title || Intl.get('oplate.user.analysis.9', '用户留存');
    //统计区间
    const interval = paramObj.interval || 'day';
    //显示范围，比实际的范围小2，因为要去掉当前和次日(或周、月)
    const range = paramObj.range || 5;

    let currentIntervalTitle = Intl.get('oplate.user.analysis.23', '当天');
    let nextIntervalTitle = Intl.get('oplate.user.analysis.24', '次日');
    let getNIntervalTitle = count => Intl.get('oplate.user.analysis.25', '{count}天后', {count});

    if (interval === 'week') {
        currentIntervalTitle = '当周';
        nextIntervalTitle = '次周';
        getNIntervalTitle = count => count + '周后';
    } else if (interval === 'month') {
        currentIntervalTitle = '当月';
        nextIntervalTitle = '次月';
        getNIntervalTitle = count => count + '个月后';
    }

    return {
        title,
        url: '/rest/analysis/user/v3/:data_type/retention/add_user',
        conditions: [{
            name: 'interval_important',
            value: interval
        }],
        argCallback: arg => {
            argCallbackUnderlineTimeToTime(arg);

            const intervalImportant = _.get(arg, 'query.interval_important');

            if (intervalImportant) {
                //用图表自身条件中的interval替换公共条件中的interval
                _.set(arg, 'query.interval', intervalImportant);

                delete arg.query.interval_important;
            }
        },
        chartType: 'table',
        option: {
            columns: (() => {
                let columns = [
                    {
                        title: Intl.get('common.login.time', '时间'),
                        dataIndex: 'timestamp',
                        width: 100,
                        align: 'left',
                        render: text => {
                            text = moment(text).format(oplateConsts.DATE_FORMAT);
                            return <b>{text}</b>;
                        },
                    }, {
                        title: Intl.get('oplate.user.analysis.32', '新增数'),
                        dataIndex: 'count',
                        width: 60,
                    }, {
                        title: currentIntervalTitle,
                        dataIndex: interval + '0',
                        width: 60,
                        align: 'right',
                        render: text => {
                            text = isNaN(text) ? '0' : text;
                            return <span>{text}</span>;
                        },
                    }, {
                        title: nextIntervalTitle,
                        dataIndex: interval + '1',
                        width: 60,
                        align: 'right',
                        render: (text, record) => {
                            if (moment().diff(record.timestamp, interval) < 1) {
                                text = '';
                            } else {
                                text = isNaN(text) ? '0' : text;
                            }
                            return <span>{text}</span>;
                        },
                    },
                ];

                _.each(_.range(range), num => {
                    const index = num + 2;

                    columns.push({
                        title: getNIntervalTitle(index),
                        dataIndex: interval + index,
                        width: 90,
                        align: 'right',
                        render: (text, record) => {
                            if (moment().diff(record.timestamp, interval) < index) {
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
        processData: data => {
            _.each(data, dataItem => {
                const actives = dataItem.actives;

                _.each(actives, activeItem => {
                    const diffDay = moment(activeItem.timestamp).diff(moment(dataItem.timestamp).startOf(interval), interval);
                    dataItem[interval + diffDay] = activeItem.active;
                });
            });

            return data;
        },
        noShowCondition: {
            callback: conditions => {
                return isSales() || ifNotSingleApp(conditions);
            }
        },
    };
}
