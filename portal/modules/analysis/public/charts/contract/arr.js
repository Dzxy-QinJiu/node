/**
 * 年经常性收入情况
 */

import { argCallbackTeamId } from '../../utils';

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
    };
}
