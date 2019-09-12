/**
 * 销售生产力分析
 */

import { getContextContent, isAdminOrOpStaff } from '../../utils';
import {SALES_PRODUCTIVITY_MENUS} from '../../consts';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: SALES_PRODUCTIVITY_MENUS.INDEX.name,
    key: SALES_PRODUCTIVITY_MENUS.INDEX.key,
    menuIndex: 6,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    isShowCallback: () => {
        //只对管理员或运营人员显示该菜单
        return isAdminOrOpStaff();
    },
    pages,
};

