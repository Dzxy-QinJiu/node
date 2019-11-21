/**
 * 销售生产力分析
 */

import { getContextContent, isCommonSales } from '../../utils';
import {SALES_PRODUCTIVITY_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: SALES_PRODUCTIVITY_MENUS.INDEX.name,
    key: SALES_PRODUCTIVITY_MENUS.INDEX.key,
    menuIndex: 6,
    privileges: [
        analysisPrivilegeConst.CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_MANAGER,
        analysisPrivilegeConst.CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_USER,
    ],
    isShowCallback: () => {
        //普通销售不能看到该菜单
        return !isCommonSales();
    },
    pages,
};

