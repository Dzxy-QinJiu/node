const restHandler = require('../../common/rest');
const _ = require('lodash');
const ajax = require('../../common/ajax');
const Promise = require('bluebird');
let BackendIntl = require('../../../../portal/lib/utils/backend_intl');


exports.editAppRoleList = function(req, res, next) {
    const Intl = new BackendIntl(req);
    const addParams = req.body.addParams;
    const delParams = req.body.delParams;
    const addPromise = new Promise((resolve, reject) => {
        req.body = addParams;
        restHandler.addRoleToUsers(req, res, false).on('success', result => {
            resolve(result);
        })
            .on('error', codeMessage => {
                reject(codeMessage);
            });
    });
    const delPromise = new Promise((resolve, reject) => {
        req.body = delParams;
        restHandler.delRoleToUsers(req, res, false).on('success', result => {
            resolve(result);
        })
            .on('error', codeMessage => {
                reject(codeMessage);
            });
    });
    Promise.all([addPromise, delPromise])
        .then(resultList => {
            if (resultList[0] && resultList[1]) {
                res.status(200).json({
                    success: true,
                    errorMsg: ''
                });
            }
            else {
                res.status(500).json({success: false, errorMsg: Intl.get('common.save.failed', '保存失败')});
            }

        })
        .catch(codeMessage => {
            res.status(500).json(codeMessage);
        });
};


