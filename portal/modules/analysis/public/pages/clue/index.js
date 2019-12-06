/**
 * 线索分析
 */

import { getContextContent } from '../../utils';
import {CLUE_MENUS} from '../../consts';
import analysisPrivilegeConst from 'MOD_DIR/analysis/public/privilege-const';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: CLUE_MENUS.INDEX.name,
    key: CLUE_MENUS.INDEX.key,
    menuIndex: 4,
    privileges: [
        analysisPrivilegeConst.CURTAO_CRM_ANALYSIS_LEAD_ALL,
        analysisPrivilegeConst.CURTAO_CRM_ANALYSIS_LEAD_SELF,
    ],
    pages,
};

