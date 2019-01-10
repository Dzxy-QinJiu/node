/**
 * 图表导出入口
 */

//引入同目录下以.js结尾的并且不包含index的文件
const req = require.context('.', false, /^((?!index).)*\.js$/);

let charts = [];

//将通过require.context引入的文件的内容放入内容数组
req.keys().forEach(key => {
    charts.push(req(key));
});

let chartsObj = {};

_.each(charts, chart => {
    _.extend(chartsObj, chart);
});

export default chartsObj;
