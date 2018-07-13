// var fs = require('fs');
// var statSync = fs.statSync;
// var fspath = require('path');
// var re = new RegExp('\\.json$');
//
// function requireJson(dir) {
//     fs.readdirSync(dir)
//         .forEach(function(path) {
//             path = fspath.join(dir, path);
//             if (statSync(path).isDirectory()) {
//                 requireJson(path);
//             } else if (path.match(re)) {
//                 console.log('require("' + path + '");');
//             }
//         });
// }
//
// requireJson('D:\\workplace\\curtao\\ketao-webapp\\node_modules\\echarts\\map\\json');
require('echarts/map/json/china-cities.json');
require('echarts/map/json/china-contour.json');
require('echarts/map/json/china.json');
require('echarts/map/json/province/anhui.json');
require('echarts/map/json/province/aomen.json');
require('echarts/map/json/province/beijing.json');
require('echarts/map/json/province/chongqing.json');
require('echarts/map/json/province/fujian.json');
require('echarts/map/json/province/gansu.json');
require('echarts/map/json/province/guangdong.json');
require('echarts/map/json/province/guangxi.json');
require('echarts/map/json/province/guizhou.json');
require('echarts/map/json/province/hainan.json');
require('echarts/map/json/province/hebei.json');
require('echarts/map/json/province/heilongjiang.json');
require('echarts/map/json/province/henan.json');
require('echarts/map/json/province/hubei.json');
require('echarts/map/json/province/hunan.json');
require('echarts/map/json/province/jiangsu.json');
require('echarts/map/json/province/jiangxi.json');
require('echarts/map/json/province/jilin.json');
require('echarts/map/json/province/liaoning.json');
require('echarts/map/json/province/neimenggu.json');
require('echarts/map/json/province/ningxia.json');
require('echarts/map/json/province/qinghai.json');
require('echarts/map/json/province/shandong.json');
require('echarts/map/json/province/shanghai.json');
require('echarts/map/json/province/shanxi.json');
require('echarts/map/json/province/shanxi1.json');
require('echarts/map/json/province/sichuan.json');
require('echarts/map/json/province/taiwan.json');
require('echarts/map/json/province/tianjin.json');
require('echarts/map/json/province/xianggang.json');
require('echarts/map/json/province/xinjiang.json');
require('echarts/map/json/province/xizang.json');
require('echarts/map/json/province/yunnan.json');
require('echarts/map/json/province/zhejiang.json');
require('echarts/map/json/world.json');
