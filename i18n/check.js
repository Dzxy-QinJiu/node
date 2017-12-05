/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/8/31.
 */
require('babel-core/register');
var cn = require("./zh_CN").default;
var ve = require("./es_VE").default;
var en = require("./en_US").default;
var _ = require("underscore");

var count = 0;
function countProperties(obj) {
    var c = 0;
    for (var property in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, property)) {
            c++;
        }
    }
    return c;
}
console.log("西语未翻译的词条");
console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
_.forEach(cn, function (value, key) {
    if (!ve[key]) {
        count++;
        console.log("\"" + key + "\":\"" + value + "\",");
    }
});
console.log("\n");
console.log("英语未翻译的词条");
console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
_.forEach(cn, function (value, key) {
    if (!en[key]) {
        count++;
        console.log("\"" + key + "\":\"" + value + "\",");
    }
});
console.log("cncount=" + countProperties(cn));
console.log("vecount=" + countProperties(ve));
console.log("encount=" + countProperties(en));
