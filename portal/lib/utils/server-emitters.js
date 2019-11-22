/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/12/26.
 */
var EventEmitter = require('events');

//session过期的emitter
exports.sessionExpireEmitter = new EventEmitter();
exports.sessionExpireEmitter.SESSION_EXPIRED = 'session_expired';

//暴露一个emitter，账号退出的时候推送给chrome extension
exports.logoutMsgEmitter = new EventEmitter();
exports.logoutMsgEmitter.LOGOUT_ACCOUNT = 'logout_account';