/**
 * 合同分析
 */

import { getContextContent } from '../../utils';
import {CONTRACT_MENUS} from '../../consts';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

//分析页面
const pages = getContextContent(req);

module.exports = {
    title: CONTRACT_MENUS.INDEX.name,
    key: CONTRACT_MENUS.INDEX.key,
    menuIndex: 1,
    privileges: [
        'OPLATE_CONTRACT_ANALYSIS',
    ],
    pages,
};

