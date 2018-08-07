const restHandler = require('../../common/rest');
const _ = require('lodash');
const ajax = require('../../common/ajax');
const Promise = require('bluebird');

exports.getAppRoleList = function(req, res, next) {
    restHandler.getAppRoles(req, res, false).on('success', data => {
        let promises = [];
        let roleList = data;
        if (_.get(data, 'length')) {
            promises = roleList.map(x => {
                return new Promise((resolve, reject) => {
                    req.query.role_id = x.role_id;
                    restHandler.getRoleUsers(req, res, false).on('success', result => {
                        resolve(result);
                    })
                        .on('error', codeMessage => {
                            reject(codeMessage);
                        });
                });                
            });
        }
        Promise.all(promises)
            .then(resultList => {
                roleList = roleList.map((x, index) => {
                    x.userList = resultList[index].data || [];
                    return x;
                });
                res.status(200).json(data);
            })
            .catch(codeMessage => {
                res.status(500).json(codeMessage);
            });
       
    }).on('error', codeMessage => {
        res.status(500).json(codeMessage);
    });
};


