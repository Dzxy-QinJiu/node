/**
 * 通话相关图表
 */

import { getContextContent } from '../../utils';

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

const charts = getContextContent(req);
let chartsObj = {};

_.each(charts, chart => {
    _.extend(chartsObj, chart);
});

export default chartsObj;
