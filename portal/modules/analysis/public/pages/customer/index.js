/**
 * 客户分析
 */

import { getContextContent } from '../../utils';
import {CUSTOMER_MENUS} from '../../consts';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: CUSTOMER_MENUS.INDEX.name,
    key: CUSTOMER_MENUS.INDEX.key,
    menuIndex: 3,
    privileges: [
        'CUSTOMER_ANALYSIS_COMMON',
        'CUSTOMER_ANALYSIS_MANAGER',
    ],
    pages,
};

