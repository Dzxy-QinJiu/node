//通知工具类
var notificationUtil = require('./notification');

//taskId 与 通知插件 的对应关系 // taskId : notificationInstance
var NotificationMap = {};
//为了让用户能看到批量推送的完成状态
//又为了让通知处理完成之后，能够自动关闭
//针对一个task，会加一个3秒的延迟，再自动关闭通知
//当一个通知多次推送完成消息的时候，需要进行clearTimeout操作
//这个notyCloseTimeoutMap就是存储taskId与timeout之间的对应关系
var notyCloseTimeoutMap = {};
//批量操作的emitter
var batchPushEmitter = require('../utils/emitters').batchPushEmitter;
//批量操作完成后，自动关闭的延迟时间（ms）
const BATCH_FINISH_AUTOCLOSE_TIMEOUT = 4000;
import {storageUtil} from 'ant-utils';

const session = storageUtil.session;
//批量操作监听器
/**
 * @param data
 *
 * {
 *     running:17                                     //正在运行的任务个数
       taskId:"3722pgujaa36n3kh9a82GbKbId574lObcy0TxPwLGdu_1486362897073_task_grant_period"   //任务id
       tasks:Array[3]                                //做完了的任务列表
       total:20                                      //总的任务个数
       type:"task_grant_period"                      //任务类型
       typeText:"开通周期"                           //任务类型中文描述
       userId:"3722pgujaa36n3kh9a82GbKbId574lObcy0TxPwLGdu" //oplate登陆用户的id，只在这个用户上推送
 * }
 * task对象如下：
 *     taskDefine:"36mvh13nka36b1ipcl43fJtR28xS4AO9GQ0onGPCaSE" //用户id（鹰击、鹰眼）
 *     taskDetail:null                                          //任务附加信息
 *     taskStatus:"success"                                     //任务状态（success成功）
 *
 */
function batchOperateListener(data) {
    //只在用户管理界面，显示批量操作推送
    var path = window.location.pathname;
    //获取到任务id
    var taskId = data.taskId;
    //看批量操作任务在哪个页面进行处理
    //判断当前页面是否是要处理的页面
    var taskParams = getTaskParamByTaskId(taskId);
    //调用页面JS的emitter让业务代码完成后续更新
    batchPushEmitter.emit(`batchtask.${data.type}`, data, taskParams);

    //如果taskId不存在，则不进行处理
    if (!getTaskIdExist(taskId)) {
        return;
    }
    //是否需要弹框处理
    var showPop = taskParams && taskParams.taskConfig && taskParams.taskConfig.showPop;
    if (!showPop) {
        return;
    }
    //当类型为批量操作，一直有弹框，或者是创建安全域创建完成且失败的时候有弹框
    //不同的类型，展示内容不同
    //拼出不同title和content
    handleBatchOperation(data, taskParams);
}

//除了创建安全域的批量操作（如用户，客户），开始任务时渲染notify提示框，如果有错误时，再次更新渲染错误提示内容
function handleBatchOperation(data, taskParams) {
    var content = '';
    var title = '';
    var operate_type = data.typeText;
    var taskId = data.taskId;
    var taskConfig = taskParams.taskConfig;
    let showFailed = _.get(taskConfig, 'showFailed', false);
    content = Intl.get('user.complete.ratio', '完成进度') + `: ${data.total - data.running}/${data.total}`;
    if(showFailed) {
        content += ', ' + Intl.get('batch.success.count', '成功数: {count}', {count: _.get(data, 'succeed')});
        content += ', ' + Intl.get('batch.faild.count', '失败数: {count}', {count: _.get(data, 'failed')});
    }
    title = Intl.get('user.batch.operation', '批量操作');
    if (operate_type) {
        title += `-${operate_type}`;
    }
    updateNotifyContentGeneral(title, content, taskId, data);

}

//只渲染一次提示框中的内容
function updateNotifyContentOnce(title, content, taskId) {
    renderNotify(title, content, taskId);
    var notify = NotificationMap[taskId];
    clearTimeout(notyCloseTimeoutMap[taskId]);
    notyCloseTimeoutMap[taskId] = setTimeout(() => {
        notify.close();
    }, BATCH_FINISH_AUTOCLOSE_TIMEOUT);
}

//更新两次note中的内容
function updateNotifyContentGeneral(title, content, taskId, data) {
    renderNotify(title, content, taskId);
    var notify = NotificationMap[taskId];
    if (data.running === 0) {
        var errTip = '';
        //获取已经存在的通知节点
        var notify = NotificationMap[taskId];
        //如果存在创建失败的任务列表，将错误提示都展示出来
        if (data.failedTasks && data.failedTasks.length !== 0) {
            data.failedTasks.forEach(function(failedTask) {
                failedTask.taskDetail && failedTask.taskDetail.remark && (errTip += failedTask.taskDetail.remark + '<br/>');
            });
            if(errTip) {
                notificationUtil.updateText(notify, {
                    title: title,
                    content: errTip
                });
            }
        }
        clearTimeout(notyCloseTimeoutMap[taskId]);
        notyCloseTimeoutMap[taskId] = setTimeout(() => {
            notify.close();
        }, BATCH_FINISH_AUTOCLOSE_TIMEOUT);
    }
}

//首次渲染或者更新notify中的内容
function renderNotify(title, content, taskId) {
    //获取已经存在的通知节点
    var notify = NotificationMap[taskId];
    //已经存在的通知只是更新内容
    if (notify) {
        notificationUtil.updateText(notify, {
            title: title,
            content: content
        });
    } else {
        //不存在的通知，创建，并添加到缓存NotificationMap中
        notify = notificationUtil.showNotification({
            title: title,
            content: content,
            closeWith: ['button'],
            callback: {
                onClose: function() {
                    removeTaskIdFromList(taskId);
                    delete NotificationMap[taskId];
                    delete notyCloseTimeoutMap[taskId];
                }
            }
        });
        NotificationMap[taskId] = notify;
    }
}


//批量任务前缀
const TASK_PARAMS_PRE = 'task_params_';
//批量task_id的key
const SESSION_STORAGE_TASKID = 'batch_operation_taskid_list';

//按照taskid保存任务参数
//taskConfig用来配置任务通用配置
/*
 *  //是否需要弹框显示操作进度
 *  showPop : true,
 *  //在哪个界面才进行处理
 *  urlPath : '/users'
 *  //是否需要显示错误
 *  showFailed : true
 *  //错误数点击监听函数
 *  onHandleErrorClick : function() {}
 *  //成功数点击监听函数
 *  onHandleSuccessClick : function() {}
 */
function saveTaskParamByTaskId(taskId, params, taskConfig) {
    var sessionStorageKey = TASK_PARAMS_PRE + taskId;
    var cloneParams = $.extend(true, {}, params);
    taskConfig = taskConfig || {};
    cloneParams.taskConfig = taskConfig;
    var jsonStr = JSON.stringify(cloneParams);
    session.set(sessionStorageKey, jsonStr);
}

//按照taskid获取任务参数
function getTaskParamByTaskId(taskId) {
    var sessionStorageKey = TASK_PARAMS_PRE + taskId;
    var sessionItem = session.get(sessionStorageKey);
    if (!sessionItem) {
        return null;
    }
    try {
        return JSON.parse(sessionItem);
    } catch (e) {
        return null;
    }
}

//检测taskId是否存在(sessionStorage)
function getTaskIdExist(taskId) {
    var taskIdList = session.get(SESSION_STORAGE_TASKID);
    if (!taskIdList) {
        return false;
    }
    try {
        taskIdList = JSON.parse(taskIdList);
    } catch (e) {
        return false;
    }
    return taskIdList.indexOf(taskId) >= 0;
}

//从taskId列表中移除taskId(sessionStorage)
function removeTaskIdFromList(taskId) {
    var taskIdList = session.get(SESSION_STORAGE_TASKID);
    if (!taskIdList) {
        return false;
    }
    try {
        taskIdList = JSON.parse(taskIdList);
    } catch (e) {
        return false;
    }
    taskIdList = _.filter(taskIdList, (id) => id !== taskId);
    var jsonStr = JSON.stringify(taskIdList);
    session.set(SESSION_STORAGE_TASKID, jsonStr);
    return true;
}

//向任务列表中添加taskId(sessionStorage)
function addTaskIdToList(taskId) {
    var taskIdList = session.get(SESSION_STORAGE_TASKID);
    if (!taskIdList) {
        taskIdList = [];
    } else {
        try {
            taskIdList = JSON.parse(taskIdList);
        } finally {
            if (!_.isArray(taskIdList)) {
                taskIdList = [];
            }
        }
    }
    if (taskIdList.indexOf(taskId) < 0) {
        taskIdList.push(taskId);
    }
    var jsonStr = JSON.stringify(taskIdList);
    session.set(SESSION_STORAGE_TASKID, jsonStr);
    return true;
}

//向任务列表中添加taskId
exports.addTaskIdToList = addTaskIdToList;
//批量操作监听器
exports.batchOperateListener = batchOperateListener;
//按照taskid获取任务参数
exports.getTaskParamByTaskId = getTaskParamByTaskId;
//按照taskid保存任务参数
exports.saveTaskParamByTaskId = saveTaskParamByTaskId;
