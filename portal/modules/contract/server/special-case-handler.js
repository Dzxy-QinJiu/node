const restHandler = require("../common/rest");
const _ = require("underscore");
const moment = require("moment");
import Intl from "../../../public/intl/intl";
import { DATE_FORMAT, CONTRACT_COLUMNS, REPAYMENT_COLUMNS, COST_COLUMNS } from "../consts";

//获取回款列表，并根据每条回款记录里的合同id，查询合同相关信息，然后将回款信息和合同信息进行组装
//返回一个兼有回款信息和合同信息的列表
const getRepaymentList = function (req, res, cb) {
    //回款字段前缀
    const repayPrefix = "repayment_";
    //在url参数中去掉为合并合同和回款数据而添加的字段前缀，还原字段原本状态
    req.params.sort_field = req.params.sort_field.replace(repayPrefix, "");
    //解析body参数
    const reqData = JSON.parse(req.body.reqData);
    //先去掉type参数，该参数的值目前标识的是视图属性，不能直接用在查询里
    delete reqData.query.type;

    //签订时间查询参数
    const dateRangeParam = _.find(reqData.rang_params, item => item.name === "date");

    //回款字段值查询参数
    let repayQueryParams = {};
    //获取不带前缀的字段值并存入查询参数，同时在原始参数中删除该字段
    for (let key in reqData.query) {
        if (key.startsWith(repayPrefix)) {
            const newKey = key.replace(repayPrefix, "");
            repayQueryParams[newKey] = reqData.query[key];
            delete reqData.query[key];
        }
    }

    //回款字段范围查询参数
    let repayRangeParams = [];
    //获取不带前缀的范围字段值并存入范围查询参数
    _.each(reqData.rang_params, item => {
        if (item.name.startsWith(repayPrefix)) {
            repayRangeParams.push({
                name: item.name.replace(repayPrefix, ""),
                from: item.from,
                to: item.to,
            });
        }
    });

    //如果需要按合同相关字段查询
    if (!_.isEmpty(reqData.query) || dateRangeParam) {
        //构造合同查询参数
        const contractReqData = {
            query: reqData.query,
            rang_params: dateRangeParam? [dateRangeParam] : [],
        };
        //指定合同类型，否则按合同号查询时，有的关键字会导致报错
        contractReqData.query.type = "sell";
        req.body.reqData = JSON.stringify(contractReqData);
        //查询合同
        restHandler.queryContract(req, res, false).on("success", contractResult => {
            //合同列表
            let contractList = contractResult.list || [];
            //拼接列表
            let joinedList = [];
    
            //如果合同列表有值，进行组合数据的操作
            if (_.isArray(contractList) && contractList.length) {
                _.each(contractList, contract => {
                    //克隆当前合同下的回款列表，用于后续处理
                    let repayments = JSON.parse(JSON.stringify(contract.repayments));

                    //按回款字段值过滤
                    for (let key in repayQueryParams) {
                        repayments = _.filter(repayments, repay => repay[key] === repayQueryParams[key]);
                    }

                    //按回款字段范围过滤
                    _.each(repayRangeParams, item => {
                        //起止点同时存在时
                        if (item.from && item.to) {
                            if (item.from === item.to) {
                                repayments = _.filter(repayments, repay => repay[item.name] === item.from);
                            } else {
                                repayments = _.filter(repayments, repay => repay[item.name] > item.from && repay[item.name] < item.to);
                            }
                        } else if (item.from) {
                            repayments = _.filter(repayments, repay => repay[item.name] > item.from);
                        } else if (item.to) {
                            repayments = _.filter(repayments, repay => repay[item.name] < item.to);
                        }
                    });

                    if (_.isArray(repayments) && repayments.length) {
                        _.each(repayments, repay => {
                            //将回款记录对象的键值加上前缀，避免跟合同对象中的键值重复
                            const procRepay = {};
                            for (let k in repay) {
                                procRepay["repayment_" + k] = repay[k];
                            }
    
                            //将回款记录对象与对应的合同对象进行组合
                            const joinedItem = _.extend({}, contract, procRepay);
                            joinedList.push(joinedItem);
                        });
                    }
                });

                contractResult.list = joinedList;
                contractResult.total = joinedList.length;
                cb(contractResult);
            } else {
                cb(contractResult);
            }
        }).on("error", codeMessage => {
            cb(codeMessage, 500);
        });
    //若未指定合同相关查询条件，则先查询回款
    } else {
        const repayReqData = {
            query: repayQueryParams,
            rang_params: repayRangeParams,
        };
        req.body.reqData = JSON.stringify(repayReqData);
        //查询回款
        restHandler.queryRepayment(req, res, false).on("success", repayResult => {
            //回款列表
            let repayList = repayResult.list || [];
    
            //如果回款列表有值，进行查询合同和组合数据的操作
            if (_.isArray(repayList) && repayList.length) {
                //获取用于查询的合同ids
                const contractIds = _.chain(repayList).pluck("contract_id").uniq().join(",");
                req.body.reqData = JSON.stringify({query: {id: contractIds}});
                //将url query参数置空
                req.query = {};
    
                //查询合同
                restHandler.queryContract(req, res, false).on("success", contractResult => {
                    //得到合同列表
                    const contractList = contractResult.list || [];
    
                    //如果合同列表有值，将其与回款列表进行组装
                    if (_.isArray(contractList) && contractList.length) {
                        //新的组合列表
                        repayResult.list = _.map(repayList, repay => {
                            //根据回款记录里的合同id，在合同列表里查找对应的合同
                            const contract = _.find(contractList, contractItem => repay.contract_id === contractItem.id);
                            //将回款记录对象的键值加上前缀，避免跟合同对象中的键值重复
                            const procRepay = {};
                            for (let k in repay) {
                                procRepay["repayment_" + k] = repay[k];
                            }
    
                            //将回款记录对象与对应的合同对象进行组合
                            return _.extend({}, contract, procRepay);
                        });
    
                        cb(repayResult);
                    } else {
                        cb(repayResult);
                    }
                }).on("error", codeMessage => {
                    cb(codeMessage, 500);
                });
            } else {
                cb(repayResult);
            }
        }).on("error", codeMessage => {
            cb(codeMessage, 500);
        });
    }
};

exports.getRepaymentList = function (req, res, next) {
    getRepaymentList(req, res, (result, code = 200) => {
        res.status(code).json(result);
    });
};

//导出数据
exports.exportData = function (req, res, next) {
    const reqData = JSON.parse(req.body.reqData);
    const type = reqData.query.type;
    if (type === "repayment") {
        getRepaymentList(req, res, (result, code) => {
            if (code === 500) {
                res.status(code).json(result);
            } else {
                doExport(type, REPAYMENT_COLUMNS, result);
            }
        });
    } else if (type === "cost") {
        //解析body参数
        const reqData = JSON.parse(req.body.reqData);
        //去掉type参数，该参数的值标识的是视图属性，不能直接用在查询里
        delete reqData.query.type;
        req.body.reqData = JSON.stringify(reqData);

        restHandler.queryCost(req, res, false).on("success", result => {
            doExport(type, COST_COLUMNS, result);
        }).on("error", codeMessage => {
            res.status(500).json(codeMessage);
        });
    } else {
        restHandler.queryContract(req, res, false).on("success", result => {
            doExport(type, CONTRACT_COLUMNS, result);
        }).on("error", codeMessage => {
            res.status(500).json(codeMessage);
        });
    }

    //执行导出
    function doExport(type, columns, result) {
        const columnTitles = _.pluck(columns, "title");
        let fileName = "repayment";
        const isContract = ["sell", "buy"].indexOf(type) > -1;

        if (isContract) {
            fileName = "contract";
            columnTitles.push(Intl.get("common.app", "应用"));
        }

        if (type === "cost") {
            fileName = "cost";
        }

        const head = columnTitles.join();
        let csvArr = [];
        csvArr.push(head);
        const list = _.isArray(result.list)? result.list : [];
        const rows = list.map(item => {
            const values = columns.map(column => {
                let value = item[column.dataIndex];
                if (!value && isNaN(value)) value = "";

                if (value && ["date", "start_time", "end_time", "repayment_date"].indexOf(column.dataIndex) > -1) {
                    value = moment(value).format(DATE_FORMAT);
                }

                if (column.dataIndex === "repayment_is_first") {
                    value = value === "true"? Intl.get("user.yes", "是") : Intl.get("user.no", "否");
                }

                return value;
            });

            if (isContract) {
                const products = item.products;
                if (products && products.length) {
                    const productValues = products.map(product => {
                        if (!product.name) return "";
                        return `${Intl.get("common.app.name", "应用名称")}:${product.name} ${Intl.get("item.21", "版本号")}:${product.version || ""} ${Intl.get("common.app.count", "数量")}:${product.num || ""} ${Intl.get("item.23", "总价")}:${product.total_price || ""}`;
                    });
                    values.push(productValues.join("; "));
                }
            }

            return values.join();
        });
        csvArr = csvArr.concat(rows);
        let csv = csvArr.join("\n");
        //防止中文乱码
        csv = Buffer.concat([new Buffer("\xEF\xBB\xBF", "binary"), new Buffer(csv)]);
        res.setHeader("Content-disposition", "attachement; filename=" + fileName + ".csv");
        res.setHeader("Content-Type", "application/csv");
        res.send(csv);
    }
};

