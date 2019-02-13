/**
 * 年经常性收入情况
 */

import { argCallbackTeamId, isSelectedAllTeamMember, isAdminOrOpStaff } from '../../utils';

export function getContractArrChart() {
    return {
        title: '年经常性收入情况',
        chartType: 'line',
        option: {
            grid: {
                left: 100,
            },
        },
        url: '/rest/analysis/contract/contract/:data_type/income',
        argCallback: (arg) => {
            const query = arg.query;

            if (query) {
                delete query.app_id;
            }

            argCallbackTeamId(arg);
        },
        noShowCondition: {
            callback: () => {
                //在当前登录用户不是管理员或运营人员或当前选择的不是全部团队或销售时，不显示此图
                return !isAdminOrOpStaff() || !isSelectedAllTeamMember();
            }
        },
    };
}
