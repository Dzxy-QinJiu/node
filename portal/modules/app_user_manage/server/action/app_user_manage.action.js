var AppUserService = require('../service/app-user-manage.service');
var extend = require('extend');
var CryptoJS = require('crypto-js');
/**
 * 获取应用用户列表
 */
exports.getAppUserList = function(req, res) {
    var queryObj = extend(true, {}, req.query);
    for (var key in queryObj) {
        if (typeof queryObj[key] === 'string' && key.indexOf('id') < 0) {
            queryObj[key] = queryObj[key].trim().toLowerCase();
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
        res.json(data);
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
    AppUserService.getApplyList(req, res, req.query).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取未读回复列表
exports.getUnreadReplyList = function(req, res) {
    AppUserService.getUnreadReplyList(req, res).on('success', function(data) {
        res.status(200).json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取申请详情
exports.getApplyDetail = function(req, res, next) {
    //申请单id
    var apply_id = req.params.apply_id;
    if (apply_id === 'unread') {
        next();
        return;
    }
    //获取申请单详情
    AppUserService.getApplyDetail(req, res, apply_id).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//提交审批
exports.submitApply = function(req, res) {

    var message_id = req.params.apply_id;
    var approval_state = req.body.approval;
    var approval_comment = req.body.comment;

    var user_name = req.body.user_name || '';
    var nick_name = req.body.nick_name || '';
    var products = req.body.products;
    var delay = req.body.delay_time || '';
    var notice_url = req.body.notice_url || '';
    var password = req.body.password || '';
    if (password) {
        var bytes = CryptoJS.AES.decrypt(password, 'apply_change_password');
        password = bytes.toString(CryptoJS.enc.Utf8);
    }
    //申请类型
    var type = req.body.type || '';

    var requestObj = {
        type: type,
        message_id: message_id,
        approval_state: approval_state,
        approval_comment: approval_comment,
        user_name: user_name,
        nick_name: nick_name,
        products: products,
        notice_url: notice_url,
        password: password
    };

    if (req.body.delay_time) {
        requestObj.delay = req.body.delay_time || '';
    }
    if (req.body.end_date) {
        requestObj.end_date = req.body.end_date || '';
    }

    //发请求进行审批
    AppUserService.submitApply(req, res, requestObj).on('success', function(data) {
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
exports.applyUser = function(req, res) {
    const requestObj = JSON.parse(req.body.reqData);
    AppUserService.applyUser(req, res, requestObj).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//申请用户延期
exports.applyDelayUser = function(req, res) {
    AppUserService.applyDelayUser(req, res, req.body).on('success', function(data) {
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

//申请修改密码
exports.applyChangePassword = function(req, res) {
    AppUserService.applyChangePassword(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//申请修改其他类型
exports.applyChangeOther = function(req, res) {
    AppUserService.applyChangeOther(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//申请修改开通状态
exports.applyChangeStatus = function(req, res) {
    AppUserService.applyChangeStatus(req, res, req.body).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//获取申请单的回复列表
exports.getReplyList = function(req, res) {
    //申请单id
    var apply_id = req.params.apply_id;
    AppUserService.getReplyList(req, res, apply_id).on('success', function(data) {
        res.json(data);
    }).on('error', function(codeMessage) {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

//添加回复
exports.addReply = function(req, res) {
    //申请单id
    var apply_id = req.body.apply_id;
    //回复内容
    var comment = req.body.comment;
    //详情url
    var notice_url = req.body.notice_url;
    //提交给后台的数据
    var submitObj = {apply_id, comment, notice_url};
    //添加一条回复
    AppUserService.addReply(req, res, submitObj).on('success', function(data) {
        res.json(data);
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
exports.saleBackoutApply = function(req, res) {
    AppUserService.saleBackoutApply(req, res, req.body).on('success', function(data) {
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