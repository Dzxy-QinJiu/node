/**
 * 销售机会分析
 */

import { getContextContent } from '../../utils';
import {CHANCE_MENUS} from '../../consts';
import {isOpenCash} from 'PUB_DIR/sources/utils/common-method-util';
import analysisPrivilegeConst from '../../privilege-const';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: CHANCE_MENUS.INDEX.name,
    key: CHANCE_MENUS.INDEX.key,
    menuIndex: 3,
    privileges: [
        analysisPrivilegeConst.CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_USER,
        analysisPrivilegeConst.CRM_CUSTOMER_ANALYSIS_SALES_OPPORTUNITY_MANAGER,
    ],
    isShowCallback: () => {
        //开通营收中心时才显示该菜单
        return isOpenCash();
    },
    pages,
};

