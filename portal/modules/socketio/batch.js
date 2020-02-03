var _ = require('lodash');
//后端国际化
let BackendIntl = require('../../../portal/lib/utils/backend_intl');
// 记录推送相关的日志
var logger = require('../../../portal/lib/utils/logger');
//推送日志
var pushLogger = logger.getLogger('push');

//批量操作对应关系
function getOperateTextMap(lang){
    let backendIntl = new BackendIntl(lang);
    return {
        //用户管理-批量操作
        task_pwd_change: backendIntl.get('common.edit.password','修改密码'),//修改密码
        task_customer_change: backendIntl.get('common.belong.customer','所属客户'),//所属客户
        task_user_create: backendIntl.get('user.add.user','创建用户'),//创建用户
        task_grant_type: backendIntl.get('user.batch.open.type','开通类型'),//开通类型
        task_grant_status: backendIntl.get('common.app.status','开通状态'),//开通状态
        task_grant_period: backendIntl.get('user.open.cycle','开通周期'),//开通周期
        task_grant_delay: backendIntl.get('user.batch.delay','批量延期'),//批量延期
        task_grant_update: backendIntl.get('user.batch.app.open','开通产品'),//开通产品
        task_grant_roles: backendIntl.get('user.batch.auth.set','权限设置'),//权限设置
        //客户管理-批量操作
        crm_batch_change_sales: backendIntl.get('crm.103', '变更负责人'),//变更负责人
        crm_batch_assert_user: backendIntl.get('crm.batch.second.user', '变更联合跟进人'),//变更联合跟进人
        crm_batch_transfer_customer: backendIntl.get('crm.customer.transfer', '转出客户'),//转出客户
        crm_batch_change_labels: backendIntl.get('crm.206','更新标签'),//变更标签
        crm_batch_add_labels: backendIntl.get('crm.205','添加标签'),//添加标签
        crm_batch_remove_labels: backendIntl.get('crm.204','移除标签'),//移除标签,
        crm_batch_change_industry: backendIntl.get('crm.20','变更行业'),//变更行业
        crm_batch_change_address: backendIntl.get('crm.21','变更地域'),//变更地域
        crm_batch_change_level: backendIntl.get('crm.administrative.level.change', '变更行政级别'),//变更行政级别
        crm_batch_release_pool: backendIntl.get('crm.customer.release.customer', '释放客户'),//释放客户
        clue_user: backendIntl.get('clue.batch.change.trace.man', '变更跟进人'), //批量变更线索的跟进人,
        lead_batch_release: backendIntl.get('clue.customer.batch.release','批量释放'), //线索批量释放
        lead_extract: backendIntl.get('clue.pool.batch.extract.clue', '批量提取'), //线索池批量提取
        ent_clue: backendIntl.get('clue.pool.batch.extract.clue', '批量提取'),//批量提取推荐线索
    };
}

//批量处理推送相关    
//缓存socketStore和ioServer,为了拆分代码
function Batch() {
    this.socketStore = null;
    this.ioServer = null;
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
//初始化
Batch.prototype.initParams = function(socketStore,ioServer) {
    this.socketStore = socketStore;
    this.ioServer = ioServer;
};
//批量处理监听器
Batch.prototype.listener = function(data) {
    pushLogger.info('收到的批量推送结果为:' + JSON.stringify(data));
    var {taskId,...props} = data;
    var strParts = taskId.split(/_/g);
    var userId = strParts[0];
    var type = strParts.slice(2).join('_');
    var clients = this.socketStore && this.socketStore[userId] || [];
    if(clients.length) {
        clients.forEach((socketObj) => {
            var socket = this.ioServer &&
                            this.ioServer.sockets &&
                                this.ioServer.sockets.sockets &&
                                    this.ioServer.sockets.sockets[socketObj.socketId];
            if(socket) {
                //  从session中获取用户的userId及token
                getSessionFromStore(socket, function(err, session) {
                    let lang = 'zh_CN';
                    if (!err && session && session.lang) {
                        lang = session.lang;
                    }
                    //判断是否是已知批量操作类型
                    var typeText = getOperateTextMap(lang)[type];
                    //如果不是已知的类型，就不推送到前端
                    if(!typeText) {
                        return;
                    }
                    //推送消息到前端
                    var messageObj;
                    var tasks = data.tasks;
                    if(!_.isArray(tasks)) {
                        tasks = [];
                    }
                    //创建失败的任务列表
                    var failedTasks = _.filter(tasks, (task) => task.taskStatus === 'failed');
                    //成功后的任务列表
                    tasks = _.filter(tasks , (task) => task.taskStatus === 'success');
                    //当全部执行完的时候，推送详细内容
                    messageObj = {
                        userId: userId,
                        type: type,
                        typeText: typeText,
                        taskId: taskId,
                        total: data.total,
                        running: data.running,
                        tasks: tasks,
                        failed: data.failed,
                        succeed: data.succeed,
                        failedTasks: failedTasks
                    };
                    socket.emit('batchOperate' , messageObj);
                });

            }
        });
    }
};

//导出单例的batch
module.exports = new Batch();