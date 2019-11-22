/**
 * 销售机会分析
 */

import { getContextContent } from '../../utils';
import {CHANCE_MENUS} from '../../consts';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: CHANCE_MENUS.INDEX.name,
    key: CHANCE_MENUS.INDEX.key,
    menuIndex: 3,
    privileges: [
        'CURTAO_CRM_LEAD_QUERY_SELF',
        'CURTAO_CRM_LEAD_QUERY_ALL',
    ],
    pages,
};

