/**
 * 账号类型统计
 */

import { userTypeDataMap, USER_TYPES } from '../../consts';
import { ifNotSingleApp, argCallbackUnderlineTimeToTime } from '../../utils';

export function getAccountTypeChart(type = 'total', title) {
    return {
        title: title || Intl.get('analysis.account.type.statistics', '账号类型统计'),
        url: `/rest/analysis/user/v1/:auth_type/${type}/type`,
        argCallback: argCallbackUnderlineTimeToTime,
        chartType: 'pie',
        option: {
            legend: {
                data: USER_TYPES,
            },
        },
        //数据值转换映射，原始数据中的值会被转换成映射后的值
        nameValueMap: userTypeDataMap,
        noShowCondition: {
            callback: ifNotSingleApp
        },
    };
}
