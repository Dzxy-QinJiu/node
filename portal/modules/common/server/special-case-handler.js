/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/4/9.
 */
'use strict';
const _ = require('lodash');
const moment = require('moment');
//后端国际化
let BackendIntl = require('../../../lib/utils/backend_intl');
const restLogger = require('../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const Promise = require('bluebird');
const commonUrl = '/rest/analysis/contract/contract/v2/';

exports.getContractStaticAnalysisData = function(req, res){
    let urlList = [commonUrl + 'amount/statistics', // 合同额
        commonUrl + 'grossprofit/statistics', // 毛利
        commonUrl + 'cuscount/statistics', // 客户数
        commonUrl + 'unitprice/statistics' // 客单价
    ];
    let promiseList = [];
    _.map(urlList, (url) => {
        return promiseList.push(handleContractPromise(req, res, req.query, url));
    });

    let backendIntl = new BackendIntl(req);
    Promise.all(promiseList).then( (results) => {
        let processData = handleData(results, backendIntl);
        res.status(200).json(processData);
    }).catch( (errorMsg) => {
        res.status(500).json(errorMsg || backendIntl.get('contract.174', '获取合同分析失败'));
    } );
};


function handleData(results, backendIntl) {
    const CONTRACT_STATIC_COLUMNS = [
        {
            title: backendIntl.get('common.type', '类型'),
            dataIndex: 'name',
        }, {
            title: backendIntl.get('sales.home.total.compute', '总计'),
            dataIndex: 'amount',
        }, {
            title: backendIntl.get('sales.home.new.add', '新增'),
            dataIndex: 'new',
        }, {
            title: backendIntl.get('contract.163', '续约'),
            dataIndex: 'renewal',
        },{
            title: backendIntl.get('contract.171', '流失'),
            dataIndex: 'runOff',
        }, {
            title: backendIntl.get('contract.172', '流失率'),
            dataIndex: 'churnRate',
        }, {
            title: backendIntl.get('contract.173', '年度流失率'),
            dataIndex: 'yearRate',
        }
    ];
    const colNames = _.map(CONTRACT_STATIC_COLUMNS, 'dataIndex');
    const countColNames = colNames.slice(1);
    let processData = [];
    if (_.isArray(results) && results.length) {
        _.each( results, (result) => {
            let countObj = {};
            let firstColName = colNames[0];
            let count = _.map(result.value, 'value');
            _.each( count, (item, index) => {
                const colName = countColNames[index];
                countObj[colName] = item;
            } );
            if (result.key === 'rowOne') {
                countObj[firstColName] = backendIntl.get('contract.25', '合同额');
            } else if (result.key === 'rowTwo') {
                countObj[firstColName] = backendIntl.get('contract.109', '毛利');
            } else if (result.key === 'rowThree') {
                countObj[firstColName] = backendIntl.get('contract.169', '客户数');
            } else if (result.key === 'rowFour') {
                countObj[firstColName] = backendIntl.get('contract.170', '客单价');
                countObj.churnRate = '-';
                countObj.yearRate = '-';
            }
            processData.push(countObj);
        } );
    }
    return processData;
}

function handleContractPromise(req, res, obj, url){
    return new Promise( (resolve, reject) => {
        return restUtil.authRest.get({
            url: url,
            req: req,
            res: res
        }, obj , {
            success: (eventEmitter, data) => {
                resolve(data);
            },
            error: (eventEmitter , errorDesc) => {
                reject(errorDesc.message);
            }
        });
    } );
}
