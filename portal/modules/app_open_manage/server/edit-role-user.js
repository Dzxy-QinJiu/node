/**
 * @argument addParams {
 * }
 * @argument delParams 
 */

const restHandler = require('../../common/rest');
const _ = require('lodash');
const ajax = require('../../common/ajax');
const Promise = require('bluebird');
let BackendIntl = require('../../../../portal/lib/utils/backend_intl');

exports.editRoleToUsers = function(req, res, next) {
    const Intl = new BackendIntl(req);
    const body = JSON.parse(req.body.reqData);
    const addParams = body.addParams;
    const delParams = body.delParams;
    let addPromise = Promise.resolve({success: true});
    if (addParams) {
        addPromise = new Promise((resolve, reject) => {
            req.body.reqData = JSON.stringify(addParams);
            restHandler.addRoleToUsers(req, res, false).on('success', result => {
                resolve(result);
            })
                .on('error', codeMessage => {
                    reject(codeMessage);
                });
        });
    }
    let delPromise = Promise.resolve({success: true});
    if (delParams) {        
        delPromise = new Promise((resolve, reject) => {
            req.body.reqData = JSON.stringify(delParams);
            restHandler.delRoleToUsers(req, res, false).on('success', result => {
                resolve(result);
            })
                .on('error', codeMessage => {
                    reject(codeMessage);
                });
        });
    }    
    Promise.all([addPromise, delPromise])
        .then(resultList => {
            if (resultList[0] && resultList[1]) {
                res.status(200).json({
                    success: true,
                    errorMsg: ''
                });
            }
            else {
                res.status(500).json({ success: false, errorMsg: Intl.get('common.save.failed', '保存失败') });
            }
        })
        .catch(codeMessage => {
            res.status(500).json(codeMessage);
        });
};


