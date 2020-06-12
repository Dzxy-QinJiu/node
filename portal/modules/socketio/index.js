// 引人socket.io客户端
var ioClient = require('socket.io-client');
// 记录推送相关的日志
var logger = require('../../../portal/lib/utils/logger');
//推送日志
var pushLogger = logger.getLogger('push');
//批量操作日志
var batchLogger = logger.getLogger('batch');
//cookie解析器
var cookie = require('cookie');
//cookie解码器
var cookieParser = require('cookie-parser');
// //推送消息数据(弹窗消息)
// var notifyChannel = 'com.antfact.ketao.apply.notice';
//登录踢出通道
var offlineChannel = 'com.antfact.oplate.notify.socketio.offline';
//消息数推送频道(消息个数)
//var messageCountChannel = "com.antfact.oplate.message.count.channel";
//用户批量操作的消息
var userBatchChannel = 'com.antfact.oplate.batchtask';
//电话拨号弹屏功能
var phoneEventChannel = 'com.antfact.oplate.phone.agent.event';
//系统消息的推送通道
const systemNoticeChannel = 'com.antfact.ketao.notice';
//待办日程提醒的推送通道
const scheduleNoticeChannel = 'com.antfact.ketao.schedule';
//申请审批未读回复的推送通道
const applyUnreadReplyChannel = 'com.antfact.ketao.apply.comment';
//线索添加或分配后推送频道
const clueUnhandledNum = 'com.antfact.ketao.clue.notice';
//申请审批消息推送
const applyApproveChannel = 'com.antfact.curtao.workflow.notice';
//客户操作的推送通道
const crmOperatorChannel = 'com.curtao.customer.operator.message.notice.channel';
//批量操作处理文件
var userBatch = require('./batch');
var _ = require('lodash');
var auth = require('../../lib/utils/auth');
var sessionExpireEmitter = require('../../../portal/lib/utils/server-emitters').sessionExpireEmitter;
var logoutMsgEmitter = require('../../../portal/lib/utils/server-emitters').logoutMsgEmitter;
let pushDto = require('./push-dto');
var client = null;
//存储用户id对应的socketId、token的对象
var socketStore = {};
var ioServer = null;
const CLUE_MESSAGE_TYPE = {
    MANUL_NEW_DISTRIBUTION: 'manual_new_distribution',//手动分配线索
    RULE_AUTO_DISTRIBUTION: 'rule_auto_distribution',//自动分配线索
    ADD_CUSTOMER_CLUE: 'addCustomerClue',//添加线索
    BASE_EXTRACT_ALLOT: 'base_extract_allot',//推荐线索提取的类型
    POOL_EXTRACT_ALLOT: 'pool_extract_allot',//线索池提取的线索类型
    INVAILID: 'invaild',//线索标为无效
    RELEASR_LEAD_POOL: 'release_lead_pool',// 线索释放到线索池
    LEAD_DELETE: 'lead_delete',// 线索删除
    BEEN_TRACED: 'been_traced',// 待我处理被处理(比如填写了跟进记录或者)
    LEAD_CREATE_CUSTOMER: 'lead_create_customer',//线索转为客户
    LEAD_MERGE_CUSTOMER: 'lead_merge_customer'//线索合并到客户
};
const CLUE_ADD_TYPE = [CLUE_MESSAGE_TYPE.MANUL_NEW_DISTRIBUTION,
    CLUE_MESSAGE_TYPE.RULE_AUTO_DISTRIBUTION,
    CLUE_MESSAGE_TYPE.ADD_CUSTOMER_CLUE,
    CLUE_MESSAGE_TYPE.BASE_EXTRACT_ALLOT,
    CLUE_MESSAGE_TYPE.POOL_EXTRACT_ALLOT,
    CLUE_MESSAGE_TYPE.INVAILID,
    CLUE_MESSAGE_TYPE.RELEASR_LEAD_POOL,
    CLUE_MESSAGE_TYPE.LEAD_DELETE,
    CLUE_MESSAGE_TYPE.BEEN_TRACED,
    CLUE_MESSAGE_TYPE.LEAD_CREATE_CUSTOMER,
    CLUE_MESSAGE_TYPE.LEAD_MERGE_CUSTOMER
];
/*
 * 为socket请求设置sessionId.
 * @param  ioServer  socket.io 的server
 */
function setSocketSessionid(ioServer) {
    if (ioServer) {
        ioServer.set('authorization', function(data, callback) {
            if (data.headers.cookie) {
                // save parsedSessionId to handshakeData
                data.cookie = cookie.parse(data.headers.cookie);
                data.sessionId = cookieParser.signedCookie(data.cookie['sid'], config.session.secret);
            }
            callback(null, true);
        });
    }
}

//找到对应的socket，将接收到的数据推送到浏览器端
function emitMsgBySocket(user_id, emitUrl, msgData) {
    var startTime = new Date().getTime();
    if (user_id) {
        //找到消息接收者对应的socket，将数据推送到浏览器
        let socketArray = socketStore[user_id] || [];
        if (_.get(socketArray, '[0]')) {
            socketArray.forEach(socketObj => {
                let socket = _.get(ioServer, `sockets.sockets[${socketObj.socketId}]`);
                if (socket) {
                    socket.emit(emitUrl, msgData);
                }
            });
        }
    }
    let endTime = new Date().getTime();
    let timeRange = endTime - startTime;
    pushLogger.debug('处理后端推送数据的时间: startTime===' + startTime + ', endTime====' + endTime + ',timeRange====' + timeRange);
}
// /**
//  * 消息监听器
//  * @param data 消息数据
//  */
// function notifyChannelListener(data) {
//     pushLogger.debug('后端推送的消息数据:' + data);
//     // 将查询结果返给浏览器
//     let messageObj = JSON.parse(data);
//     if (messageObj.consumers && messageObj.consumers.length > 0) {
//         //遍历消息接收者
//         messageObj.consumers.forEach(function(consumer) {
//             //将数据推送到浏览器
//             emitMsgBySocket(consumer && consumer.user_id, 'mes', pushDto.applyMessageToFrontend(messageObj));
//         });
//     }
// }

/*
 *
 * 拨打电话消息监听器
 * */
function phoneEventChannelListener(data) {
    pushLogger.debug('后端推送的拨打电话的数据:' + JSON.stringify(data));
    // 将查询结果返给浏览器
    var phonemsgObj = JSON.parse(data) || {};
    //将数据推送到浏览器
    emitMsgBySocket(phonemsgObj && phonemsgObj.user_id, 'phonemsg', pushDto.phoneMsgToFrontend(phonemsgObj));
}
/*
*
* 处理线索后消息监听器*/
function clueUnhandledNumListener(data) {
    pushLogger.debug('后端推送的待我处理线索的数据:' + JSON.stringify(data));
    //将查询结果返给浏览器
    var cluemsgObj = JSON.parse(data) || {};
    //将数据推送到浏览器
    if(cluemsgObj.type === 'apply_upgrade'){
        _.each(cluemsgObj.user_ids, user_id => {
            emitMsgBySocket(user_id, 'apply_upgrade', pushDto.applyTryMsgToFrontend(cluemsgObj));
        });
    }else if (cluemsgObj.type === 'apply_upgrade_complete') {
        //升级完成
        _.each(cluemsgObj.user_ids, user_id => {
            emitMsgBySocket(user_id, 'apply_upgrade_complete', pushDto.applyTryMsgToFrontend(cluemsgObj));
        });
    }else if (_.indexOf(CLUE_ADD_TYPE,cluemsgObj.type) > -1){
        _.each(cluemsgObj.user_ids, user_id => {
            emitMsgBySocket(user_id, 'cluemsg', pushDto.clueMsgToFrontend(cluemsgObj));
        });
    }
}
/*处理申请审批消息监听器*/
function applyApproveNumListener(data) {
    pushLogger.debug('后端推送的申请审批的数据:' + JSON.stringify(data));
    //将查询结果返给浏览器
    //数字的增减和展示弹框现在是一个channel，但是弹框的是加了一个"type":"notice"
    var applyApprovesgObj = data || {};
    //展示弹框的
    if(_.get(applyApprovesgObj,'type') === 'notice'){
        //某人的申请审批通过后，给申请人发消息
        if (applyApprovesgObj.applicant_id) {
            //将数据推送到浏览器
            emitMsgBySocket(applyApprovesgObj.applicant_id, 'applyApprovedFinishmsg', pushDto.applyApproveMsgToFrontend(applyApprovesgObj, applyApprovesgObj.applicant_id));
        }
        //给抄送的人发消息consumers是抄送人
        if (_.isArray(applyApprovesgObj.consumers) && _.get(applyApprovesgObj,'consumers[0]')) {
            //遍历消息接收者
            applyApprovesgObj.consumers.forEach(function(consumer) {
                //将数据推送到浏览器
                emitMsgBySocket(consumer, 'applyApprovedFinishmsg', pushDto.applyApproveMsgToFrontend(applyApprovesgObj, consumer));
            });
        }
    }else{
        //带consumers的是加一，带last_consumers的是减一
        //求出这两个集合的交集
        var commonArr = _.intersection(_.get(applyApprovesgObj,'consumers',[]), _.get(applyApprovesgObj,'last_consumers',[]));
        //带consumers的是加一
        if (_.isArray(applyApprovesgObj.consumers) && _.get(applyApprovesgObj,'consumers[0]')) {
            //遍历消息接收者
            applyApprovesgObj.consumers.forEach(function(consumer) {
                //将数据推送到浏览器
                //如果是将销售的拜访结果推送给邮件抄送人
                if(applyApprovesgObj.type && applyApprovesgObj.type === 'customer_visit' ){//这里的处理不会影响待审批数量，因为有新的审批的时候，applyApprovesgObj没有type属性，只有在将销售的拜访结果推送给邮件抄送人的时候，才有这个字段为customer_visit
                    console.log(applyApprovesgObj);
                    emitMsgBySocket(consumer, 'applyVisitCustomerMsg', pushDto.applyVisitCustomerMsgToFrontend(applyApprovesgObj, consumer));
                }else{
                    if (!_.includes(commonArr, consumer)){
                        emitMsgBySocket(consumer, 'applyApprovemsg', pushDto.applyApproveMsgToFrontend(applyApprovesgObj, consumer));
                    }
                }
            });
        }
        //一个人审批后，推送给其他待审批人(last_consumers)的消息,其他待审批人的待审批数量要减一
        if (_.isArray(applyApprovesgObj.last_consumers) && _.get(applyApprovesgObj,'last_consumers[0]')) {
            //遍历消息接收者
            applyApprovesgObj.last_consumers.forEach(function(consumer) {
                //将数据推送到浏览器
                if(!_.includes(commonArr, consumer)){
                    emitMsgBySocket(consumer, 'applyApprovedByOthermsg', pushDto.applyApproveMsgToFrontend(applyApprovesgObj, consumer));
                }
            });
        }
    }



}

/*
 *
 * 日程管理提醒的消息监听器*/
function scheduleAlertListener(data) {
    pushLogger.debug('日程管理的消息推送：' + JSON.stringify(data));
    // 将查询结果返给浏览器
    let scheduleAlertObj = data || {};
    //将数据推送到浏览器
    emitMsgBySocket(scheduleAlertObj && scheduleAlertObj.member_id, 'scheduleAlertMsg', pushDto.scheduleMsgToFrontend(scheduleAlertObj));
}

/*
 *
 * 操作客户提醒的消息监听器*/
function crmOperatorListener(data) {
    // pushLogger.debug('后端推送的操作客户的数据：' + JSON.stringify(data));
    // 将查询结果返给浏览器
    let crmOperatorAlertObj = JSON.parse(data) || {};
    //将数据推送到浏览器
    emitMsgBySocket(crmOperatorAlertObj && crmOperatorAlertObj.member_id, 'crm_operator_alert_msg', pushDto.crmOperatorMsgToFrontend(crmOperatorAlertObj));
}

/**
 * 登录踢出消息监听器
 * @param data 踢出消息
 * TODO 登录接口改为auth2后，就不再推送登录踢出的消息了，之后业务端修改后推过来的数据由于没有token导致无法使用此方式进行处理，待有解决方案后再处理
 */
function offlineChannelListener(data) {
    pushLogger.debug('后端推送的登录踢出的数据:' + JSON.stringify(data));
    // 将查询结果返给浏览器
    var userObj = data || {};
    if (userObj.user_id) {
        //找到该登录用户对应的socket，将数据推送到浏览器
        var socketArray = socketStore[userObj.user_id] || [];
        if (socketArray.length > 0) {
            //找到最后一个登录用户的socketId和token
            var lastLoginSocketObj = _.find(socketArray, function(socketObj) {
                return socketObj.token === userObj.token;
            });
            //找到存储中最后一个登录的socket
            var lastLoginSocket = lastLoginSocketObj ? ioServer && ioServer.sockets.sockets[lastLoginSocketObj.socketId] : null;
            var lastLoginSessionId = '';//最后一个登录的socket对应的sessionId
            if (lastLoginSocket) {
                lastLoginSessionId = lastLoginSocket.request && lastLoginSocket.request.sessionId;
            }
            //将最后一个登录用户的socketId和token,放到数组newSocketArray中
            var newSocketArray = lastLoginSocketObj ? [lastLoginSocketObj] : [];
            //找到除最后一个登录的外的其他sesssion下的socket推送踢出消息后清除存储中对应的socket
            socketArray.forEach(function(socketObj) {
                if (socketObj.token !== userObj.token) {
                    //找到不是最后一个登录的socket
                    var socket = ioServer && ioServer.sockets.sockets[socketObj.socketId];
                    if (socket) {
                        //不是最后一个登录的socket对应的sessionId
                        var sessionId = socket.request && socket.request.sessionId;
                        if (sessionId === lastLoginSessionId) {
                            //如果是最后一个登录用户所在session下不同tab页的该用户可不被踢出(因为该tab页上的token已在session中刷新)
                            socketObj.token = userObj.token;
                            //刷新token后存入newSocketArray
                            newSocketArray.push(socketObj);
                        } else {
                            //推出消息后，设置socket对应的session失效
                            socket.emit('offline', pushDto.offlineMsgToFrontend(userObj));
                            getSessionFromStore(socket, function(err, session) {
                                if (!err && session) {
                                    session.destroy();
                                }
                            });
                        }
                    }
                }
            });
            //将只剩最后登录用户对应的socket数组存到内存中
            socketStore[userObj.user_id] = newSocketArray;
        }
    }
}

/**
 * 系统消息监听器
 * @param data 系统消息
 */
function systemNoticeListener(notice) {
    // pushLogger.debug('后端推送的系统消息数据:' + JSON.stringify(notice));
    //将数据推送到浏览器
    emitMsgBySocket(notice && notice.member_id, 'system_notice', pushDto.systemMsgToFrontend(notice));
}

/**
 * 申请审批有新未读回复的监听器
 * @param unreadList 未读回复列表，数据格式如下
 * [{
 *    member_id: '3722pgujaa35ioj7klp0TgYZCfUy59xaXD0ieh6cvf4',
 *    push_type: 0,//即刻新回复（推送的数据）中push_type字段值为：0
 *    update_time: null,
 *    create_time: 1521170377334,
 *    apply_id: '59ec6aed-04da-4050-b464-68eeab695d68',
 *    id: '59ec6aed-04da-4050-b464-68eeab695d68_3722pgujaa35ioj7klp0TgYZCfUy59xaXD0ieh6cvf4',
 *    realm_id: '36mvh13nka',
 *    status: 0
 * }]
 */
function applyUnreadReplyListener(unreadList) {
    // 回复消息的推送，根据审批状态不同，推送的给不同的人
    // 待审批的，是推送给申请人和下一个节点的审批人
    // 已通过、已驳回、已撤销，是推送给申请人
    pushLogger.debug('后端推送的申请审批未读回复数据:' + JSON.stringify(unreadList));
    if (_.get(unreadList, '[0]')) {
        _.each(unreadList, unreadReply => {
            if (unreadReply.member_id) {
                emitMsgBySocket(unreadReply.member_id, 'apply_unread_reply', pushDto.unreadReplyToFrontend(unreadReply));
            }
        });
    }
}

/*
 * 建立到后端的连接。
 * @ioServer socketIO服务
 */
function createBackendClient() {
    let pushServerUrl = global.config.pushServerAddress;
    pushLogger.info('与后台建立连接的服务地址：' + pushServerUrl);
    //创建socket.io的客户端
    client = ioClient(pushServerUrl, {
        transports: ['websocket']
    });
    //监听 connect
    client.on('connect', function() {
        pushLogger.info(client.id + '==== 已与后台建立连接');
    });
    //创建接收消息的通道
    // client.on(notifyChannel, notifyChannelListener);
    //创建登录踢出的通道
    // client.on(offlineChannel, offlineChannelListener);
    //创建用户批量操作的通道
    client.on(userBatchChannel, userBatch.listener.bind(userBatch));
    //创建电话拨号通道
    client.on(phoneEventChannel, phoneEventChannelListener);
    //创建系统消息的通道
    client.on(systemNoticeChannel, systemNoticeListener);
    //创建日程管理提醒的通道
    client.on(scheduleNoticeChannel, scheduleAlertListener);
    //创建申请审批未读回复的通道
    client.on(applyUnreadReplyChannel, applyUnreadReplyListener);
    //创建线索未处理数量变化通道
    client.on(clueUnhandledNum, clueUnhandledNumListener);
    //创建申请审批数量变化通道
    client.on(applyApproveChannel, applyApproveNumListener);
    //创建客户操作提醒的通道
    client.on(crmOperatorChannel, crmOperatorListener);
    client.on('pong', (timeout) => {
        pushLogger.info(client.id + '==== pong=======' + timeout);
    });
    client.on('ping', () => {
        pushLogger.info(client.id + '==== ping');
    });
    client.on('connect_timeout', (timeout) => {
        pushLogger.info(client.id + '==== connect_timeout=======' + timeout);
    });
    client.on('error', (error) => {
        pushLogger.info(client.id + '==== error=======' + JSON.stringify(error));
    });
    client.on('connect_error', (error) => {
        pushLogger.info(client.id + '==== connect_error=======' + JSON.stringify(error));
    });
    //监听 disconnect
    client.on('disconnect', function(reason) {
        pushLogger.info(client.id + '==== 断开后台连接');
        pushLogger.info(_.isString(reason) ? reason : JSON.stringify(reason));
        // the disconnection was initiated by the server, you need to reconnect manually
        if(reason === 'io server disconnect'){
            //重新创建连接
            createBackendClient();
        }
        // else the socket will automatically try to reconnect
    });
    //监听重连失败
    client.on('reconnect_error', function() {
        pushLogger.info(client.id + '==== 重新建立连接失败');
        //创建连接失败后，手动断开连接！
        client.disconnect();
        //重新创建连接
        createBackendClient();
    });
}

/*
 *从store中获取session。
 * @socket  浏览器端的连接
 * @fn   获取session后的处理方法,fn(error,session){},error标示错误，session为请求正确时返回的session数据
 */
function getSessionFromStore(socket, fn) {
    var sessionStore = config.sessionStore;
    var sessionId = socket.request && socket.request.sessionId;
    if (sessionStore) {
        sessionStore.get(sessionId, fn);
    }
}
//启动socketio
module.exports.startSocketio = function(nodeServer) {
    // 创建socket.io服务器
    ioServer = require('socket.io')(nodeServer);
    //为批量操作推送设置参数
    userBatch.initParams(socketStore, ioServer);
    //为socket请求设置sessionId.
    setSocketSessionid(ioServer);
    // 和浏览器建立连接后触发
    ioServer.on('connection', function(socket) {
        //  从session中获取用户的userId及token
        getSessionFromStore(socket, function(err, session) {
            if (!err && session && session.user) {
                //获取内存中该用户的userId对应的socket、token数据
                var socketArray = socketStore[session.user.userid] || [];
                socketArray.push({
                    socketId: socket.id,
                    token: session._USER_TOKEN_.access_token,
                    sessionId: (socket.request.sessionId || '')
                });
                //将当前用户应用的socket、token保存到内存中
                socketStore[session.user.userid] = socketArray;
                pushLogger.debug('用户信息 %s', JSON.stringify(session.user));
                // 推送最新升级版本的时间到浏览器端，以便于界面判断是否有新版本升级提示用户刷新界面
                socket.emit('curUpgradeTime', global.config.timeStamp);
            } else {
                var sid = socket.request && socket.request.sessionId;
                if (err) {
                    pushLogger.error('获取id为 %s 的session报错 %s', sid, JSON.stringify(err));
                } else {
                    if (session) {
                        pushLogger.error('session: %s', JSON.stringify(session));
                    }
                    pushLogger.error('sessionId %s 已退出', sid);
                }
            }
        });
        // 和浏览器断开连接后触发
        socket.on('disconnect', function() {
            //获取到socket的sessionId
            var sessionId = socket.request.sessionId;
            pushLogger.info('sessionID: ' + sessionId + ' 与浏览器断开连接');
            //遍历socketStore
            _.some(socketStore, function(userArray, userId) {
                //遍历userArray
                return _.some(userArray, function(obj, idx) {
                    //如果userArray中存在当前socket，删除
                    if (obj.sessionId === sessionId) {
                        userArray.splice(idx, 1);
                        //删除之后，如果数组为空，则在socketStore中移除
                        if (userArray.length === 0) {
                            delete socketStore[userId];
                        }
                        return true;
                    }
                });
            });
        });
    }
    );
    //创建与后台的连接
    createBackendClient();
    //添加session过期的监听
    sessionExpireEmitter.on(sessionExpireEmitter.SESSION_EXPIRED, sessionExpired);
    logoutMsgEmitter.on(logoutMsgEmitter.LOGOUT_ACCOUNT,logoutAccount);//账号退出登录后发送事件给extension
    logoutMsgEmitter.on(logoutMsgEmitter.KICKOFF_ACCOUNT,kickOffAccount);//账号被踢出后发送事件

};
function kickOffAccount(errMsg) {
    socketEmitter(errMsg,'kickOffAccount','踢出账号');
}
/*
* 退出账号前发送事件*/
function logoutAccount(logoutObj) {
    socketEmitter(logoutObj,'logoutAccount','退出账号');
}
/*发送事件到前端*/
function socketEmitter(Obj, emitterChannel,loggerType) {
    let user = Obj && Obj.user;
    let sessionId = Obj && Obj.sessionId;
    if (user && sessionId) {
        pushLogger.debug((user && user.nickname) + loggerType);
        var userId = user ? user.userid : '';
        if (userId) {
            //找到消息接收者对应的socket，将数据推送到浏览器
            var socketArray = socketStore[userId] || [];
            if (socketArray.length > 0) {
                socketArray.forEach(function(socketObj) {
                    if (socketObj.sessionId === sessionId) {
                        //找到相同sessionId的socket
                        var socket = ioServer && ioServer.sockets.sockets[socketObj.socketId];
                        if (socket) {
                            //推送session过期消息
                            if(emitterChannel === 'kickOffAccount'){
                                socket.emit(emitterChannel, Obj.data);
                            }else{
                                socket.emit(emitterChannel, user);
                            }

                        }
                    }
                });
            }
        }
    }
}

/**
 *session过期后，推送过期消息到界面
 */
function sessionExpired(expiredObj) {
    socketEmitter(expiredObj,'sessionExpired','session过期');
}

