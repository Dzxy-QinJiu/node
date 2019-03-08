/**
 * 处理下载合同模板文件
 */

'use strict';

var path = require('path');

// 导出销售合同模板文件
exports.getSaleContractTemplate = function(req, res){
    var filePath = path.resolve(__dirname, '../../tpl/sell-contract.xls');
    res.download(filePath);
};

// 导出采购合同模板文件
exports.getPurchaseContractTemplate = function(req, res){
    var filePath = path.resolve(__dirname, '../../tpl/buy-contract.xls');
    res.download(filePath);
};
