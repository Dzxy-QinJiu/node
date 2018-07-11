'use strict';
const restHandler = require('../common/rest');
const _ = require('lodash');
const moment = require('moment');
import Intl from '../../../public/intl/intl';
const restLogger = require('../../../lib/utils/logger').getLogger('rest');
var restUtil = require('ant-auth-request').restUtil(restLogger);
const Promise = require('bluebird');
import { DATE_FORMAT, SELLS_CONTRACT_EXPORT_COLUMNS, BUY_CONTRACT_COLUMNS, REPAYMENT_COLUMNS, COST_COLUMNS, CONTRACT_STATIC_COLUMNS, CONTRACT_LABEL, VIEW_TYPE, EXPORT_FILE_NAME } from '../consts';
const colNames = _.map(CONTRACT_STATIC_COLUMNS, 'dataIndex');
const countColNames = colNames.slice(1);
const commonUrl = '/rest/analysis/contract/contract/v2/';

//获取回款列表，并根据每条回款记录里的合同id，查询合同相关信息，然后将回款信息和合同信息进行组装
//返回一个兼有回款信息和合同信息的列表
const getRepaymentList = function(req, res, cb) {
    //回款字段前缀
    const repaymentPrefix = 'repayment_';
    //合同字段前缀
    const contractPrefix = 'contract_';
    //排序字段
    let sortField = req.params.sort_field;

    //若按签订时间排序，则需给签订时间字段加上合同前缀，以与回款时间区分
    if (sortField === 'date') {
        sortField = contractPrefix + sortField;
    }

    //若按回款时间排序，则需去掉回款前缀
    if (sortField === (repaymentPrefix + 'date')) {
        sortField = 'date';
    }

    req.params.sort_field = sortField;

    //解析body参数
    const reqData = JSON.parse(req.body.reqData);
    //先去掉type参数，该参数的值目前标识的是视图属性，不能直接用在查询里
    delete reqData.query.type;

    //签订时间查询参数
    const dateRangeParam = _.find(reqData.rang_params, item => item.name === 'date');

    //回款字段值查询参数
    let repayQueryParams = {};
    //获取不带前缀的字段值并存入查询参数，同时在原始参数中删除该字段
    for (let key in reqData.query) {
        if (key.startsWith(repaymentPrefix)) {
            const newKey = key.replace(repaymentPrefix, '');
            repayQueryParams[newKey] = reqData.query[key];
            delete reqData.query[key];
        }
    }

    //回款字段值查询参数中指定查询实际回款
    repayQueryParams.type = 'repay';

    //回款字段范围查询参数
    let repayRangeParams = [];
    //获取不带前缀的范围字段值并存入范围查询参数
    _.each(reqData.rang_params, item => {
        if (item.name.startsWith(repaymentPrefix)) {
            repayRangeParams.push({
                name: item.name.replace(repaymentPrefix, ''),
                from: item.from,
                to: item.to,
            });
        }
    });

    //构造合同查询参数
    const contractReqData = {
        query: reqData.query,
        rang_params: dateRangeParam ? [dateRangeParam] : [],
    };

    //构造回款查询参数
    const repayReqData = {
        query: repayQueryParams,
        rang_params: repayRangeParams,
        parent_query: contractReqData,
    };

    req.body.reqData = JSON.stringify(repayReqData);

    //查询回款
    restHandler.queryRepaymentV2(req, res, false).on('success', repayResult => {
        cb(repayResult);
    }).on('error', codeMessage => {
        cb(codeMessage, 500);
    });
};

exports.getRepaymentList = function(req, res, next) {
    getRepaymentList(req, res, (result, code = 200) => {
        res.status(code).json(result);
    });
};

//导出数据
exports.exportData = function(req, res, next) {
    let fileName;
    const reqData = JSON.parse(req.body.reqData);
    const type = reqData.query.type;

    function exportContract(columns, fileName) {
        restHandler.queryContract(req, res, false).on('success', result => {
            doExport(type, columns, result, fileName);
        }).on('error', codeMessage => {
            res.status(500).json(codeMessage);
        });
    }

    if (type === VIEW_TYPE.SELL) {
        fileName = EXPORT_FILE_NAME.SELL;

        exportContract(SELLS_CONTRACT_EXPORT_COLUMNS, fileName);
    } else if (type === VIEW_TYPE.BUY) {
        fileName = EXPORT_FILE_NAME.BUY;

        exportContract(BUY_CONTRACT_COLUMNS, fileName);

    } else if (type === VIEW_TYPE.REPAYMENT) {
        fileName = EXPORT_FILE_NAME.REPAYMENT;

        getRepaymentList(req, res, (result, code) => {
            if (code === 500) {
                res.status(code).json(result, fileName);
            } else {
                doExport(type, REPAYMENT_COLUMNS, result, fileName);
            }
        });
    } else if (type === VIEW_TYPE.COST) {
        fileName = EXPORT_FILE_NAME.COST;

        //解析body参数
        const reqData = JSON.parse(req.body.reqData);
        //去掉type参数，该参数的值标识的是视图属性，不能直接用在查询里
        delete reqData.query.type;
        req.body.reqData = JSON.stringify(reqData);

        restHandler.queryCost(req, res, false).on('success', result => {
            doExport(type, COST_COLUMNS, result, fileName);
        }).on('error', codeMessage => {
            res.status(500).json(codeMessage);
        });
    } else {
        res.status(500).json('unknown export type');
    }

    //执行导出
    function doExport(type, columns, data, fileName) {
        const columnTitles = _.map(columns, 'title');

        const list = _.isArray(data.list) ? data.list : [];

        const rows = list.map(item => {
            const values = columns.map(column => {
                let value = item[column.dataIndex];
                if (!value && isNaN(value)) value = '';

                if (value && ['date', 'start_time', 'end_time', 'repayment_date'].indexOf(column.dataIndex) > -1) {
                    value = moment(value).format(DATE_FORMAT);
                }

                if (column.dataIndex === 'repayment_is_first') {
                    value = value === 'true' ? Intl.get('user.yes', '是') : Intl.get('user.no', '否');
                }

                //签约类型（新签/续约）
                if (column.dataIndex === 'label') {
                    const label = _.find(CONTRACT_LABEL, item => item.value === value);
                    value = label ? label.name : '';
                }

                //所属客户
                if (column.dataIndex === 'customers') {
                    if (!_.isArray(value)) {
                        value = '';
                    } else {
                        value = _.map(value, 'customer_name').join('，');
                    }
                }

                return value;
            });

            if (type === VIEW_TYPE.SELL) {
                const products = item.products;
                if (products && products.length) {
                    products.forEach(product => {
                        const productName = product.name;
                        if (productName) {
                            const productValue = `${Intl.get('common.app.count', '数量')}:${product.count || ''} ${Intl.get('item.23', '总价')}:${product.total_price || ''}`;
                            const nameIndex = columnTitles.indexOf(productName);
                            //如果该应用列不存在
                            if (nameIndex === -1) {
                                //在表头中添加该列
                                columnTitles.push(productName);
                                const valueIndex = columnTitles.length - 1;
                                //在表体中添加该列
                                values[valueIndex] = productValue;
                            } else {
                                //如果该列已存在，则只在表体中添加该列即可
                                values[nameIndex] = productValue;
                            }
                        }
                    });
                }
            }

            return values.join();
        });

        const head = columnTitles.join();
        let csvArr = [];
        csvArr.push(head);
        csvArr = csvArr.concat(rows);
        let csv = csvArr.join('\n');
        //防止中文乱码
        csv = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
        res.setHeader('Content-disposition', 'attachement; filename=' + fileName + '.csv');
        res.setHeader('Content-Type', 'application/csv');
        res.send(csv);
    }
};

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

    Promise.all(promiseList).then( (results) => {
        let processData = handleData(results);
        res.status(200).json(processData);
    }).catch( (errorMsg) => {
        res.status(500).json(errorMsg || Intl.get('contract.174', '获取合同分析失败'));
    } );
};


function handleData(results) {
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
                countObj[firstColName] = Intl.get('contract.25', '合同额');
            } else if (result.key === 'rowTwo') {
                countObj[firstColName] = Intl.get('contract.109', '毛利');
            } else if (result.key === 'rowThree') {
                countObj[firstColName] = Intl.get('contract.169', '客户数');
            } else if (result.key === 'rowFour') {
                countObj[firstColName] = Intl.get('contract.170', '客单价');
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
