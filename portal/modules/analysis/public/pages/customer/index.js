/**
 * 客户分析
 */

import { getContextContent } from '../../utils';
import {CUSTOMER_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: CUSTOMER_MENUS.INDEX.name,
    key: CUSTOMER_MENUS.INDEX.key,
    menuIndex: 3,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_SELF,
        analysisPrivilegeConst.CURTAO_CRM_CUSTOMER_ANALYSIS_ALL,
    ],
    pages,
};

