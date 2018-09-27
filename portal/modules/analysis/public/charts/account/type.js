/**
 * 账号用户类型
 */

import { userTypeDataMap, USER_TYPES } from '../../consts';

export function getTypeChart() {
    return {
        title: Intl.get('oplate.user.analysis.user.type', '用户类型'),
        url: '/rest/analysis/user/v1/:auth_type/total/type',
        chartType: 'pie',
        option: {
            legend: {
                data: USER_TYPES,
            },
        },
        //数据值转换映射，原始数据中的值会被转换成映射后的值
        nameValueMap: userTypeDataMap,
    };
}
