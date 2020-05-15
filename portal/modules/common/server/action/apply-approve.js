/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/10.
 */
var ApplyApproveService = require('../service/apply-approve');
var _ = require('lodash');
const multiparty = require('multiparty');
const fs = require('fs');
exports.getNextCandidate = function(req, res) {
    ApplyApproveService.getNextCandidate(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addNewCandidate = function(req, res) {
    ApplyApproveService.addNewCandidate(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addUserApplyNewCandidate = function(req, res) {
    ApplyApproveService.addUserApplyNewCandidate(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.getApplyListApprovedByMe = function(req, res) {
    ApplyApproveService.getApplyListApprovedByMe(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getApplyTaskNode = function(req, res) {
    ApplyApproveService.getApplyTaskNode(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
// exports.getApplyDetailById = function(req, res) {
//     ApplyApproveService.getApplyDetailById(req, res).on('success', function(data) {
//         res.status(200).json(data);
//     }).on('error', function(codeMessage) {
//         res.status(500).json(codeMessage && codeMessage.message);
//     });
// };
exports.addBusinessWhileApply = function(req, res) {
    ApplyApproveService.addBusinessWhileApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveBusinessWhileApplyPassOrReject = function(req, res) {
    ApplyApproveService.approveBusinessWhileApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.updateBusinessWhileCustomerTime = function(req, res) {
    ApplyApproveService.updateBusinessWhileCustomerTime(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.checkDomainExist = (req, res) => {
    ApplyApproveService.checkDomainExist(req, res).on('success', (data) => {
        res.status(200).json(data);
    }).on('error', (err) => {
        res.status(500).json(err && err.message);
    });
};
exports.addSalesOpportunityApply = function(req, res) {
    ApplyApproveService.addSalesOpportunityApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addBusinessApply = function(req, res) {
    ApplyApproveService.addBusinessApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.updateVisitCustomerTime = function(req, res) {
    ApplyApproveService.updateVisitCustomerTime(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addLeaveApply = function(req, res) {
    ApplyApproveService.addLeaveApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.addDataServiceApply = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        let fileItem = _.get(files, 'files[0]');
        let formData = {}, newTmpPath = '';
        if (fileItem) {
            let tmpPath = fileItem.path;
            newTmpPath = tmpPath;
            // 获取生成的文件名称
            var tempName = _.last(_.split(tmpPath, '\\'));
            // 获取文件名
            var filename = fileItem.originalFilename;
            newTmpPath = _.replace(newTmpPath, tempName, filename);
            fs.renameSync(tmpPath, newTmpPath);
            // 文件不为空的处理
            formData['files'] = [fs.createReadStream(newTmpPath)];
            addDataServiceApply(req, res, fields, formData);
            //把文件删除
            fs.unlinkSync(newTmpPath);
        }
    });
};
exports.addReportSendApply = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        let receiveFiles = files['files'];
        let formData = {},newTmpPath = '';
        if (receiveFiles) {
            //可以是上传一个也可以是上传多个
            for (var i = 0; i < receiveFiles.length; i++){
                var fileItem = receiveFiles[i];
                let tmpPath = fileItem.path;
                newTmpPath = tmpPath;
                // 获取生成的文件名称
                var tempName = _.last(_.split(tmpPath, '\\'));
                // 获取文件名
                var filename = fileItem.originalFilename;
                newTmpPath = _.replace(newTmpPath, tempName, filename);
                fs.renameSync(tmpPath, newTmpPath);
                // 文件不为空的处理
                if (formData['files']){
                    formData['files'].push(fs.createReadStream(newTmpPath));
                }else {
                    formData['files'] = [fs.createReadStream(newTmpPath)];
                }
                if (i === receiveFiles.length - 1){
                    addReportSendApplyData(req, res, fields, formData);
                }
                //把文件删除
                fs.unlinkSync(newTmpPath);

            }
        }else {
            addReportSendApplyData(req, res, fields, formData);
        }
    });

};
function getFieldValues(fields,formData) {
    _.forEach(fields, (value, key) => {
        formData[key] = _.get(value, '[0]');
    });
}
function addReportSendApplyData(req, res, fields, formData) {
    try {
        //获取不同字段上的参数值
        getFieldValues(fields,formData);
        //调用上传请求服务
        ApplyApproveService.addReportSendApply(req, res, formData).on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    } catch (e) {
        console.log(JSON.stringify(e));
    }
}
function addDataServiceApply(req, res, fields, formData) {
    try {
        //获取不同字段上的参数值
        getFieldValues(fields,formData);
        //调用上传请求服务
        ApplyApproveService.addDataServiceApply(req, res, formData).on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    } catch (e) {
        console.log(JSON.stringify(e));
    }
}

exports.approveReportSendApplyPassOrReject = function(req, res) {
    ApplyApproveService.approveReportSendApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveDocumentWriteApplyPassOrReject = function(req, res) {
    ApplyApproveService.approveDocumentWriteApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveDataServiceApply = function(req, res) {
    ApplyApproveService.approveDataServiceApply(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};


exports.uploadReportSend = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        // 获取上传文件的临时路径
        let tmpPath = files['reportsend'][0].path;
        let newTmpPath = tmpPath;
        // 获取生成的文件名称
        var tempName = _.last(_.split(tmpPath, '\\'));
        // 获取文件名
        var filename = files['reportsend'][0].originalFilename;
        newTmpPath = _.replace(newTmpPath, tempName, filename);
        //将文件路径重命名，避免多个人上传同一个文件的时候会发生rename错误的情况
        fs.rename(tmpPath, newTmpPath, (err) => {
            if (err) {
                res.json(false);
            } else {
                var idArr = [];
                _.forEach(fields, (item) => {
                    idArr = _.concat(idArr, item);
                });
                // 文件不为空的处理
                let formData = {
                    docs: [fs.createReadStream(newTmpPath)]
                };
                //调用上传请求服务
                ApplyApproveService.uploadReportSend(req, res, formData, idArr.join('')).on('success', function(data) {
                    if (_.get(data,'[0].file_size','')){
                        _.forEach(data,item => item.size = item.file_size);
                    }
                    res.json(data);
                }).on('error', function(err) {
                    res.status(500).json(err.message);
                });
            }
            //把文件删除
            fs.unlinkSync(newTmpPath);
        });


    });
};
exports.downLoadReportSend = function(req, res) {
    ApplyApproveService.downLoadReportSend(req, res).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.downLoadDataServiceFile = function(req, res) {
    ApplyApproveService.downLoadDataServiceFile(req, res).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.deleteReportSend = function(req, res) {
    ApplyApproveService.deleteReportSend(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveBusinessApplyPassOrReject = function(req, res) {
    ApplyApproveService.approveBusinessApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveLeaveApplyPassOrReject = function(req, res) {
    ApplyApproveService.approveLeaveApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.approveSalesOpportunityApplyPassOrReject = function(req, res) {
    ApplyApproveService.approveSalesOpportunityApplyPassOrReject(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.clearAllUnread = function(req, res) {
    ApplyApproveService.clearAllUnread(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

