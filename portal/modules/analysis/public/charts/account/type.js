/**
 * 账号类型统计
 */

import { userTypeDataMap, USER_TYPES } from '../../consts';
import { ifNotSingleApp } from '../../utils';

export function getAccountTypeChart(type = 'total', title) {
    return {
        title: title || '账号类型统计',
        url: `/rest/analysis/user/v1/:auth_type/${type}/type`,
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
