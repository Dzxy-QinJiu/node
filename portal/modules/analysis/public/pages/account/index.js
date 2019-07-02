/**
 * 账号分析
 */

import { getContextContent } from '../../utils';
import {ACCOUNT_MENUS} from '../../consts';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: ACCOUNT_MENUS.INDEX.name,
    key: ACCOUNT_MENUS.INDEX.key,
    menuIndex: 5,
    privileges: [
        'USER_ANALYSIS_COMMON',
        'USER_ANALYSIS_MANAGER',
    ],
    pages,
};

