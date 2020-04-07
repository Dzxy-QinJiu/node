var _ = require('lodash');
//用户审批列表转换（旧版数据）
exports.toRestObject = function(item) {
    return {
        ...item,
        topic: item.topic,
        presenter: item.producer ? item.producer.nick_name : '',
        time: item.produce_date,
        approval_time: item.consume_date || '',
        id: item.id,
        order_id: _.get(item, 'message.order_id', ''),
        customer_id: _.get(item, 'message.customer_id', ''),
        customer_name: _.get(item, 'message.customer_name', ''),
        isConsumed: (item.approval_state !== 'false') + '',
        approval_state: transferApprovalStateToNumber(item.approval_state)
    };
};
//用户审批列表转换（新版数据）todo 待完善一些字段
exports.toRestObjectNewUserApply = function(item) {
    return {
        ...item,
        topic: _.get(item, 'topic', ''),
        presenter: _.get(item, 'applicant.nick_name', ''),
        time: _.get(item, 'time', ''),
        approval_time: _.get(item, 'consume_date', ''),
        id: _.get(item, 'id'),
        order_id: _.get(item, 'order_id', ''),
        customer_id: _.get(item, 'detail.customer_id', ''),
        customer_name: _.get(item, 'detail.customer_name', ''),
        isConsumed: (item.status !== 'ongoing') + '',
        approval_state: getStatusNum(_.get(item, 'status')),
        message_type: _.get(item, 'workflow_type'),
        producer: _.get(item, 'applicant'),
        message: {
            sales_team_name: '',
            user_name: _.get(item, 'detail.user_name') || _.chain(item).get('detail.user_grants_apply').map('user_name').uniq(),
            remark: _.get(item, 'remark'),
            type: _.get(item, 'detail.user_apply_type'),
            products: JSON.stringify(_.get(item, 'detail.user_grants_apply', [])),
            sales_name: '',
            nick_name: _.get(item, 'detail.nickname') || _.chain(item).get('detail.user_grants_apply').map('nickname').uniq(),
            producer_team: '',
            tag: _.get(item, 'user_type'),
            customer_name: _.get(item, 'detail.customer_name'),
            customer_id: _.get(item, 'detail.customer_id'),
            order_id: _.get(item, 'order_id')
        },
        approval_person: _.chain(item).get('approve_details').last().get('nick_name').value(),
        produce_date: _.get(item,'create_time'),
        replyLists: _.get(item,'approve_details')
    };
};


//未读回复的数据
exports.unreadReplyToFrontend = function(unreadReply) {
    return {
        member_id: unreadReply.member_id,//谁的未读回复
        create_time: unreadReply.create_time,//回复时间
        id: unreadReply.id,//回复的id
        apply_id: unreadReply.apply_id//有未读回复的申请id
    };
};
//工作流未读回复数据
exports.unreadWorkFlowReplyToFrontend = function(unreadReply) {
    return {
        member_id: unreadReply.member_id,//谁的未读回复
        create_time: unreadReply.create_time,//回复时间
        id: unreadReply.id,//回复的id
        apply_id: unreadReply.apply_id,//有未读回复的申请id
        type: unreadReply.type,//申请的类型
    };
};

//将approvalState转换成数字(旧版的申请审批)
function transferApprovalStateToNumber(approval_state) {
    //审批状态
    var result_approval_state = '';
    switch (approval_state) {
        //全部和未审批都是0
        case 'all':
        case 'false':
            result_approval_state = '0';
            break;
        //通过是1
        case 'pass':
            result_approval_state = '1';
            break;
        //驳回是2
        case 'reject':
            result_approval_state = '2';
            break;
        // 撤销是3
        case 'cancel':
            result_approval_state = '3';
            break;
    }
    return result_approval_state;
}

//更改状态为数字(新版的申请审批)
function getStatusNum(state) {
    let statusNum = '';
    switch (state) {
        case 'ongoing':
            statusNum = '0';
            break;
        case 'pass':
            statusNum = '1';
            break;
        case 'reject':
            statusNum = '2';
            break;
        case 'cancel':
            statusNum = '3';
            break;
    }
    return statusNum;
}
/**
 * 增加特殊属性，用于在列表中展示数据，详情中不需要这些数据
 * @param detail  新数据对象
 * @param preData  原始数据
 */
function addPropertiesNewApply(detail, preData) {
    if (detail && preData) {
        //审批单内容
        var serverResult = preData || {};
        detail.id = _.get(serverResult,'id');
        detail.isConsumed = serverResult.status !== 'ongoing';
        detail.order_id = serverResult.order_id;//todo 应该是没有用的一个字段，页面上没有使用
        detail.presenter = _.get(serverResult,'applicant.nick_name');
        detail.time = serverResult.create_time;
        detail.topic = _.get(serverResult,'detail.user_apply_name');
    }
    return detail;
}

//用户审批详情转换（新版的用户申请）
exports.toDetailRestObjectNewUserApply = function(detail, APPLY_TYPES){
    var userType = _.get(detail,'detail.user_apply_type');
    var obj = {
        type: userType,
        sales_name: _.get(detail,'detail.customer_sales_name'),
        customer_name: _.get(detail,'detail.customer_name'),
        customer_id: _.get(detail,'detail.customer_id'),
        presenter_id: _.get(detail,'applicant.user_id'),
        apps: _.get(detail,'detail.user_grants_apply',[]),
        sales_team_name: _.get(detail,'detail.customer_sales_team'),
        comment: _.get(detail,'remarks',''),
        approval_comment: _.get(detail,'approval_comment',''),
        approval_state: getStatusNum(_.get(detail,'status')),
        approval_person: _.chain(detail).get('approve_details').last().get('nick_name').value(),//审批人
        time: _.get(detail,'create_time'),//申请时间
        approval_time: _.chain(detail).get('approve_details').last().get('comment_time').value(),//审批时间
        last_contact_time: _.get(detail,'last_call_back_time',''),//最后联系时间
        // id: _.get(detail,'id'),
        // isConsumed: '',
        presenter: _.get(detail,'applicant.nick_name'),//
        // topic: _.get(detail,'detail.user_apply_name'),
        // last_contact_time: '',
        immutable_labels: _.get(detail,'detail.immutable'),
        customer_label: _.get(detail,'detail.customer_label'),
    };
    //各种类型特殊的属性
    if(userType === APPLY_TYPES.DISABLE_MULTI_APP){//禁用（多应用）
        obj.status = _.get(obj, ['apps','0','status']);
    }else if(userType === APPLY_TYPES.DELAY_MULTI_APP){ //延期（多应用）
        let apps = _.get(obj,'apps');
        if (_.get(apps, '0.delay_time')) {
            obj.delayTime = apps[0].delay_time;
        }
        // 到期时间
        if (_.get(apps, '0.end_date')) {
            obj.end_date = _.get(apps, '0.end_date', '');
        }
        //延期时间
        if (_.get(apps, '0.delay_time') && _.get(apps, '0.delay_time') !== '-1') {
            obj.delayTime = _.get(apps, '0.delay_time', '');
        }
    }else if(_.includes([APPLY_TYPES.APPLY_PWD_CHANGE, APPLY_TYPES.APPLY_GRANT_OTHER_CHANGE],userType)){//修改密码及其他申请
        //修改密码申请和其他申请的user_id,user_name,nick_name
        //用户名
        obj.user_names = _.chain(detail).get('detail.user_grants_apply').map('user_name').uniq();
        //用户id
        obj.user_ids = _.chain(detail).get('detail.user_grants_apply').map('user_id').uniq();
    }else {
        if(_.includes([APPLY_TYPES.EXIST_APPLY_TRIAL, APPLY_TYPES.EXIST_APPLY_FORMAL],userType)){//已有用户申请新应用
            obj.user_names = _.chain(detail).get('detail.user_grants_apply').map('user_name').uniq();
            //用户id
            obj.user_ids = _.chain(detail).get('detail.user_grants_apply').map('user_id').uniq();
            obj.nick_names = _.chain(detail).get('detail.user_grants_apply').map('nickname').uniq();
            //应用的列表要进行去重，因为已有用户在申请应用授权的时候所传参数和之前的不一样，例如之前3个账号申请2个应用，apps数字就直传2个应用就可以了，现在改版后的新数据apps要用笛卡尔积进行计算，就是3*2个数据
            //为了和现有界面保持一致，需要对apps中的数据进行去重
            var apps = [],user_grants_apply = _.get(detail,'detail.user_grants_apply',[]);
            if(_.get(user_grants_apply,'[0]')){
                apps = _.unionBy(user_grants_apply, 'client_id');
            }
            obj.apps = apps;
        }else if(_.includes([APPLY_TYPES.APPLY_USER_OFFICIAL, APPLY_TYPES.APPLY_USER_TRIAL],userType)){//新申请用户,在未申请之前是没有user_idd ,审批通过后在detail字段下
            if(_.get(detail,'detail.user_names[0]','')){
                obj.user_names = _.get(detail,'detail.user_names','');//审批过后，如果有用户名在user_names中，比如有多个用户名的时候，都在这个数组中
            }else if(_.get(detail,'detail.user_name','')){
                obj.user_names = [_.get(detail,'detail.user_name','')];//在审批之前，用户名在user_name中
            }else{
                obj.user_names = [];
            }

            //用户id
            obj.user_ids = _.get(detail,'detail.user_ids[0]',) ? _.get(detail,'detail.user_ids') : [];
            obj.nick_names = _.get(detail,'detail.nickname',) ? [_.get(detail,'detail.nickname')] : [];
        }
        //账号类型
        obj.account_type = userType === 'apply_user_official' || userType === 'apply_app_official' ? '1' : '0';
        if (userType === 'apply_user' || userType === 'apply_app') {
            obj.tag = _.get(detail, 'tag', '');
        }
    }
    //把应用中角色的字段apply_roles改成roles字段
    _.forEach(obj.apps,item => {
        item.roles = _.map(item.apply_roles,'role_id');
        item.rolesNames = _.map(item.apply_roles,'role_name');
        item.permissions = _.map(item.apply_permissions,'permission_id');
        item.permissionsNames = _.map(item.apply_permissions,'permission_name');
    });





    //增加一些特殊属性
    obj = addPropertiesNewApply(obj, detail);
    return obj;
};

//延期、禁用（多应用）
exports.toDetailMultiAppRestObject = function(obj, APPLY_TYPES) {
    //审批单内容
    var serverResult = obj || {};
    //申请单详情
    var detail = serverResult.message || {};
    //转换之后的数据
    var result = {};
    //申请类型， 延期、禁用（多应用）
    result.type = detail.type || '';
    //销售名称
    result.sales_name = detail.sales_name || '';
    //销售团队名称
    result.sales_team_name = detail.sales_team_name || '';
    //客户名
    result.customer_name = detail.customer_name || '';
    //客户id
    result.customer_id = detail.customer_ids || '';

    let apps = [];
    if (detail.apply_param) {
        apps = detail.apply_param && (JSON.parse(detail.apply_param) || []);
        //应用
        result.apps = apps.map(app => ({
            ...app,
            app_id: app.client_id,
            app_name: app.client_name
        }));
        //延期（多应用）
        if (detail.type === APPLY_TYPES.DELAY_MULTI_APP) {
            if (_.get(apps, '0.delay_time')) {
                result.delayTime = apps[0].delay_time;
            }
            // 到期时间
            if (_.get(apps, '0.end_date')) {
                result.end_date = _.get(apps, '0.end_date', '');
            }
            //延期时间
            if (_.get(apps, '0.delay_time') && _.get(apps, '0.delay_time') !== '-1') {
                result.delayTime = _.get(apps, '0.delay_time', '');
            }
        } else if (detail.type === APPLY_TYPES.DISABLE_MULTI_APP) {//禁用（多应用）
            result.status = _.get(apps, '0.status');
        }
    }
    //申请时候的备注
    result.comment = detail.remark || '';
    // 申请人id
    result.presenter_id = serverResult.producer.user_id;
    //审批备注
    result.approval_comment = serverResult.approval_comment || '';
    //审批状态
    result.approval_state = 'approval_state' in serverResult ? transferApprovalStateToNumber(serverResult.approval_state) : '';
    //审批人
    result.approval_person = serverResult.approval_person || '';
    //审批时间
    result.approval_time = serverResult.consume_date || '';
    //增加特殊属性
    result = addProperties(result, obj);
    return result;
};
//销售申请修改密码(其他类型)详情转换
exports.toDetailChangePwdOtherRestObject = function(obj) {
    //审批单内容
    var serverResult = obj || {};
    //申请单详情
    var detail = serverResult.message || {};
    //转换之后的数据
    var result = {};
    //申请类型 apply_user_official
    result.type = detail.type || '';
    //销售名称
    result.sales_name = detail.sales_name || '';
    //销售团队名称
    result.sales_team_name = detail.sales_team_name || '';
    // 申请人id
    result.presenter_id = serverResult.producer.user_id;


    //客户数据
    transformCustomerInfo(detail, result);
    //用户名
    var user_names = [];
    try {
        user_names = detail.user_name.split(/、/g);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    var user_ids = [];
    try {
        user_ids = JSON.parse(detail.user_ids);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    //用户名
    result.user_names = user_names;
    //用户id
    result.user_ids = user_ids;
    //申请时候的备注
    result.comment = detail.remark || '';
    //审批备注
    result.approval_comment = serverResult.approval_comment || '';
    //审批状态
    result.approval_state = 'approval_state' in serverResult ? transferApprovalStateToNumber(serverResult.approval_state) : '';
    //审批人
    result.approval_person = serverResult.approval_person || '';
    //申请时间
    result.time = serverResult.produce_date || '';
    //审批时间
    result.approval_time = serverResult.consume_date || '';
    //增加特殊属性
    result = addProperties(result, obj);



    //其他类型申请的应用数据
    if (detail.type === 'apply_sth_else') {
        result.apps = detail.app_list ? JSON.parse(detail.app_list) : [];
    }

    return result;
};
//用户审批详情转换
exports.toDetailRestObject = function(obj) {
    //审批单内容
    var serverResult = obj || {};
    //申请单详情
    var detail = serverResult.message || {};
    //转换之后的数据
    var result = {};
    //申请类型 apply_user_official
    result.type = detail.type || '';
    //销售名称
    result.sales_name = detail.sales_name || '';
    //客户名称
    result.customer_name = detail.customer_name || '';
    //客户id
    result.customer_id = detail.customer_id || '';
    // 申请人id
    result.presenter_id = serverResult.producer.user_id;

    // //用户id
    // result.user_ids=JSON.parse(detail.user_ids);


    //用户名
    if (detail.type === 'apply_app_official' || detail.type === 'apply_app_trial') {
        var user_names = [];
        var user_ids = [];
        try {
            user_names = JSON.parse(detail.user_names);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(e));
        }
        try {
            user_ids = JSON.parse(detail.user_ids);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(e));
        }
        result.user_names = user_names;
        result.user_ids = user_ids;
    } else {

        result.user_names = [detail.user_name || ''];
        //新增用户审批通过后增加id字段
        if (detail.type === 'apply_user_trial' || detail.type === 'apply_user_official' || detail.type === 'apply_app') {//apply_app之后也没有了
            var user_ids = [];
            try {
                user_ids = JSON.parse(detail.user_ids);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(e));
            }
            result.user_ids = user_ids;
            try {
                result.user_names = JSON.parse(detail.user_names);
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(e));
            }

        }
    }


    // 昵称
    if (detail.type === 'apply_app_official' || detail.type === 'apply_app_trial') {
        var nick_names = [];
        try {
            nick_names = JSON.parse(detail.nick_name);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.log(JSON.stringify(e));
        }
        result.nick_names = nick_names;
    } else {
        result.nick_names = [detail.nick_name || ''];
    }

    //应用列表
    var products = [];
    try {
        products = JSON.parse(detail.products);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    result.apps = products;
    //账号类型
    result.account_type = detail.type === 'apply_user_official' || detail.type === 'apply_app_official' ? '1' : '0';
    if (detail.type === 'apply_user' || detail.type === 'apply_app') {
        result.tag = _.get(detail, 'tag', '');
    }
    //销售团队名称
    result.sales_team_name = detail.sales_team_name || '';
    //申请时候的备注
    result.comment = detail.remark || '';
    //审批备注
    result.approval_comment = serverResult.approval_comment || '';
    //审批状态
    result.approval_state = 'approval_state' in serverResult ? transferApprovalStateToNumber(serverResult.approval_state) : '';
    //审批人
    result.approval_person = serverResult.approval_person || '';
    //申请时间
    result.time = serverResult.produce_date || '';
    //审批时间
    result.approval_time = serverResult.consume_date || '';
    //增加特殊属性
    result = addProperties(result, obj);
    return result;
};

//延期，修改应用状态，修改密码，渲染“所属客户”
//如果只有一个客户，这里才返回数据，多个客户的情况，node端不返回前端数据（没有customer_name和customer_id）
//早期的数据只有customer_name（只显示名字）
//后期的数据有customer_id（有customer_id时，能点击查看详情）
//这个代码提前出来，就不用重复写了
function transformCustomerInfo(detail, result) {
    //客户数据
    if (_.isString(detail.customer_name) && detail.customer_name && detail.customer_name.indexOf('、') < 0) {
        result.customer_name = detail.customer_name;
        if (_.isString(detail.customer_ids) && detail.customer_ids && detail.customer_ids.indexOf('、') < 0) {
            result.customer_id = detail.customer_ids;
        }
    }
}

//用户延期审批详情转换
exports.toDetailDelayRestObject = function(obj) {
    //审批单内容
    var serverResult = obj || {};
    //申请单详情
    var detail = serverResult.message || {};
    //转换之后的数据
    var result = {};
    //申请类型 apply_user_official
    result.type = detail.type || '';
    //销售名称
    result.sales_name = detail.sales_name || '';
    //销售团队名称
    result.sales_team_name = detail.sales_team_name || '';
    // 申请人id
    result.presenter_id = serverResult.producer.user_id;
    //客户数据
    transformCustomerInfo(detail, result);
    //用户名
    var user_names = [];
    try {
        user_names = JSON.parse(detail.user_names);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    var user_ids = [];
    try {
        user_ids = JSON.parse(detail.user_ids);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    //用户名
    result.user_names = user_names;
    //用户id
    result.user_ids = user_ids;
    //申请时候的备注
    result.comment = detail.remark || '';
    //应用名
    result.app_name = detail.application_name || '';
    //审批备注
    result.approval_comment = serverResult.approval_comment || '';
    //审批状态
    result.approval_state = 'approval_state' in serverResult ? transferApprovalStateToNumber(serverResult.approval_state) : '';
    //审批人
    result.approval_person = serverResult.approval_person || '';
    //申请时间
    result.time = serverResult.produce_date || '';
    //审批时间
    result.approval_time = serverResult.consume_date || '';
    //延期时间
    if (detail.end_date) {
        // 到期时间
        result.end_date = detail.end_date || '';
    }
    if (detail.delay_time && detail.delay_time !== '-1') {
        result.delayTime = detail.delay_time || '';
    }
    //增加特殊属性
    result = addProperties(result, obj);
    return result;
};


//销售申请修改应用状态详情转换
exports.toDetailStatusRestObject = function(obj) {
    //审批单内容
    var serverResult = obj || {};
    //申请单详情
    var detail = serverResult.message || {};
    //转换之后的数据
    var result = {};
    //申请类型 apply_user_official
    result.type = detail.type || '';
    //销售名称
    result.sales_name = detail.sales_name || '';
    //销售团队名称
    result.sales_team_name = detail.sales_team_name || '';
    // 申请人id
    result.presenter_id = serverResult.producer.user_id;
    //客户数据
    transformCustomerInfo(detail, result);
    //用户名
    var user_names = [];
    // 昵称
    try {
        user_names = detail.user_name.split(/、/g);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    var user_ids = [];
    try {
        user_ids = JSON.parse(detail.user_ids);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(e));
    }
    //账号状态
    result.status = detail.status;
    //用户名
    result.user_names = user_names;
    //用户id
    result.user_ids = user_ids;
    //申请时候的备注
    result.comment = detail.remark || '';
    //todo 应用名（新数据没处理这个字段）
    result.app_name = detail.application_name || '';
    //审批备注
    result.approval_comment = serverResult.approval_comment || '';
    //审批状态
    result.approval_state = 'approval_state' in serverResult ? transferApprovalStateToNumber(serverResult.approval_state) : '';
    //审批人
    result.approval_person = serverResult.approval_person || '';
    //申请时间
    result.time = serverResult.produce_date || '';
    //审批时间
    result.approval_time = serverResult.consume_date || '';
    //增加特殊属性
    result = addProperties(result, obj);
    return result;
};



/**
 * 增加特殊属性，用于在列表中展示数据，详情中不需要这些数据
 * @param detail  新数据对象
 * @param preData  原始数据
 */
function addProperties(detail, preData) {
    if (detail && preData) {
        //审批单内容
        var serverResult = preData || {};
        //申请单详情
        var message = serverResult.message || {};
        detail.id = serverResult.id;
        detail.isConsumed = serverResult.is_consumed;
        detail.order_id = message.order_id;
        detail.presenter = serverResult.producer.nick_name;
        detail.time = serverResult.produce_date;
        detail.topic = serverResult.topic;
    }
    return detail;
}


//角色实体
exports.Role = function(obj, with_permission_ids) {
    this.role_id = obj.role_id || '';
    this.role_name = obj.role_name || '';
    if (with_permission_ids) {
        this.permission_ids = _.isArray(obj.permission_ids) ? obj.permission_ids : [];
    }
};
//权限实体
exports.Privilege = function(obj) {
    this.permission_id = obj.permission_id || '';
    this.permission_define = obj.permission_define || '';
    this.permission_name = obj.permission_name || '';
};
