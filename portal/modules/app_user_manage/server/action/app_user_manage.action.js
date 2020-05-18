var AppUserService = require('../service/app-user-manage.service');
var extend = require('extend');
var CryptoJS = require('crypto-js');
const _ = require('lodash');
var appUserDetailDto = require('../dto/apps');
const multiparty = require('multiparty');
const fs = require('fs');
const path = require('path');
let BackendIntl = require('../../../../lib/utils/backend_intl');

/**
 * 获取应用用户列表
 */
exports.getAppUserList = function(req, res) {
    var queryObj = extend(true, {}, req.query);
    for (var key in queryObj) {
        if (typeof queryObj[key] === 'string' && key.indexOf('id') < 0) {
            queryObj[key] = _.trim(queryObj[key].toLowerCase());
        }
    }
    AppUserService.getUsers(req, res, queryObj).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取近期登录用户列表
exports.getRecentLoginUsers = function(req, res) {
    AppUserService.getRecentLoginUsers(req, res, req.query).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * 添加应用用户
 */
exports.addAppUser = function(req, res) {
    AppUserService.addUser(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * 根据用户名获取用户信息
 */
exports.getUserByName = function(req, res) {
    AppUserService.getUserByName(req, res, req.params.name).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//检查用户是否存在
exports.checkUserExist = function(req, res) {
    AppUserService.checkUserExist(req, res, req.params.field, req.params.value).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

/**
 * 修改应用用户
 */
exports.editAppUser = function(req, res) {
    var obj = req.body;
    AppUserService.editAppUser(req, res, obj).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取用户详情
exports.getUserDetail = function(req, res) {
    var user_id = req.params.id;
    AppUserService.getUserDetail(req, res, user_id).on('success', function(data) {
        res.json(appUserDetailDto.toFrontUserDetail(data));
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * 停用用户的所有应用
 */
exports.disableAllApps = function(req, res) {
    var user_id = req.body.user_id;
    AppUserService.disableAllApps(req, res, user_id).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
/**
 * 批量操作
 */
exports.batchUpdate = function(req, res) {

    var field = req.body.field;
    var data = req.body.data;
    var application_ids = req.body.application_ids;

    AppUserService.batchUpdate(req, res, field, data, application_ids).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });

};
/**
 * 获取客户对应的用户
 */
exports.getCustomerUsers = function(req, res) {
    AppUserService.getCustomerUsers(req, res, req.query).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });

};

//获取用户申请列表
exports.getApplyList = function(req, res) {
    AppUserService.getApplyList(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.getMyApplyLists = function(req, res) {
    AppUserService.getMyApplyLists(req, res).on('success', function(result) {
        res.status(200).json(result);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.getApplyListStartSelf = function(req, res) {
    AppUserService.getApplyListStartSelf(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};




// //获取未读回复列表
// exports.getUnreadReplyList = function(req, res) {
//     AppUserService.getUnreadReplyList(req, res).on('success', function(data) {
//         res.status(200).json(data);
//     }).on('error', function(codeMessage) {
//         res.status(500).json(codeMessage && codeMessage.message);
//     });
// };
//获取工作流的未读回复列表
exports.getWorkFlowUnreadReplyList = function(req, res) {
    AppUserService.getWorkFlowUnreadReplyList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
function handleNodata(data) {
    if (!data){
        data = {
            list: [],
            total: 0
        };
    }
    return data;
}
exports.getApplyListWillApprovedByMe = function(req, res) {
    AppUserService.getApplyListWillApprovedByMe(req, res).on('success', function(data) {
        data = handleNodata(data);
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//获取申请详情
exports.getApplyDetail = function(req, res) {
    //获取申请单详情
    AppUserService.getApplyDetail(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
exports.cancelApplyApprove = function(req, res) {
    AppUserService.cancelApplyApprove(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};
//提交审批
exports.submitApply = function(req, res) {
    var password = req.body.password || '';
    if (password) {
        var bytes = CryptoJS.AES.decrypt(password, 'apply_change_password');
        password = bytes.toString(CryptoJS.enc.Utf8);
    }
    if (req.body.passwordObvious){
        password = req.body.passwordObvious;
    }
    req.body.password = password;
    if (req.body.delay_time) {
        req.body.delay = req.body.delay_time || '';
        delete req.body.delay_time;
    }
    //发请求进行审批
    AppUserService.submitApply(req, res).on('success', function(data) {
        if (data === true) {
            res.json(data);
        } else {
            res.status(500).json('审批失败');
        }
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message || '审批失败');
    });
};
//为用户添加应用
exports.addApp = function(req, res) {
    //发请求，添加应用
    AppUserService.addApp(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//为用户修改应用
exports.editApp = function(req, res) {
    //发请求，修改应用
    AppUserService.editApp(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//申请用户
exports.applyNewgrant = function(req, res) {
    AppUserService.applyNewgrant(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//批量用户延期
exports.batchDelayUser = function(req, res) {
    AppUserService.batchDelayUser(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//修改用户单个应用详情
exports.editAppDetail = function(req, res) {
    AppUserService.editAppDetail(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//申请修改密码和其他
exports.applyChangePasswordAndOther = function(req, res) {
    AppUserService.applyChangePasswordAndOther(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取申请单的回复列表
exports.getApplyComments = function(req, res) {

    AppUserService.getApplyComments(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//添加回复
exports.addApplyComments = function(req, res) {
    //添加一条回复
    AppUserService.addApplyComments(req, res).on('success', function(replyData) {
        if (_.isObject(replyData)) {
            //创建回复数据，直接添加到store的回复数组后面
            let replyTime = replyData.comment_time ? replyData.comment_time : moment().valueOf();
            let replyItem = {
                user_id: replyData.user_id || '',
                user_name: replyData.user_name || '',
                comment: replyData.comment || '',
                comment_time: replyTime,
                nick_name: replyData.nick_name || ''
            };
            res.status(200).json(replyItem);
        }else{
            res.status(200).json({});
        }
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取团队列表
exports.getteamlists = function(req, res) {
    AppUserService.getteamlists(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 撤销申请
exports.cancelApplyApprove = function(req, res) {
    AppUserService.cancelApplyApprove(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

exports.checkUserName = function(req, res) {
    AppUserService.checkUserName(req, res, req.query).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 添加一个用户时，提示用户名信息
exports.addOneUserSuggestName = function(req, res) {
    AppUserService.addOneUserSuggestName(req, res, req.query).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

// 获取安全域信息列表
exports.getRealmList = function(req, res) {
    AppUserService.getRealmList(req, res).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

function templateFile(req, res, example) {
    let backendIntl = new BackendIntl(req);
    let content = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(example)]);
    res.setHeader('Content-disposition', `attachement; filename=${encodeURI(backendIntl.get('user.import.user.template', '用户模板'))}.csv`);
    res.setHeader('Content-Type', 'application/csv');
    res.write(content);
    res.end();
}

// 导入用户模板文件
exports.getUserTemplate = (req, res) => {
    const backendIntl = new BackendIntl(req);
    const filename = backendIntl.get('user.import.user.template', '用户模板');
    const filePath = path.resolve(__dirname, '../tpl/user_tpl.xls');
    res.download(filePath, filename + '.xls');

};
//下载数据导出申请模板文件
exports.getDataServiceTemplate = function(req, res) {
    var filePath = path.resolve(__dirname, '../tpl/data_service_tpl.xlsx');
    let backendIntl = new BackendIntl(req);
    let filename = backendIntl.get('apply.approved.data.service.template', '数据导出申请表-申请时间-xxx部门-联系人') + '.xlsx';
    res.download(filePath, filename);
};

// 上传用户
exports.uploadUser = (req, res) => {
    var form = new multiparty.Form();

    //开始处理上传请求
    form.parse(req, (err, fields, files) => {
        // 获取上传文件的临时路径
        let tmpPath = files['users'][0].path;
        // 文件内容为空的处理
        let file_size = files['users'][0].size;
        if(file_size === 0) {
            res.json(false);
            return;
        }
        // 文件不为空的处理
        let formData = {
            file: [fs.createReadStream(tmpPath)]
        };

        //调用上传请求服务
        AppUserService.uploadUser(req, res, formData)
            .on('success', (data) => {
                res.json(data);
            })
            .on('error', (err) => {
                res.json(err && err.message);
            });
        // 删除临时文件
        fs.unlinkSync(tmpPath);
    });
};

// 确认上传用户
exports.confirmUploadUser = (req, res) => {
    AppUserService.confirmUploadUser(req, res)
        .on('success', (data) => {
            res.status(200).json(data);
        })
        .on('error', (err) => {
            res.status(500).json(err && err.message);
        });
};
