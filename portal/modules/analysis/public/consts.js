/**
 * 公共常量
 */

import {hasPrivilege} from 'CMP_DIR/privilege/checker';

//权限类型
export const authType = hasPrivilege('CUSTOMER_ANALYSIS_MANAGER') ? 'manager' : 'common';
//数据类型
export const dataType = hasPrivilege('GET_TEAM_LIST_ALL') ? 'all' : 'self';

//初始时间
export const initialTime = {
    range: 'week',
    start: moment().startOf('isoWeek').valueOf(),
    //结束时间设为当天的结束时间，以便后端对某些数据做缓存
    end: moment().endOf('day').valueOf(),
};

const intlUnknown = Intl.get('user.unknown', '未知');

//从 unknown 到 未知 的对应关系对象
export const unknownObj = {name: intlUnknown, key: 'unknown'};

//从 unknown 到 未知 的映射
export const unknownDataMap = {unknown: intlUnknown};

//用户类型
export const USER_TYPES = [
    {name: Intl.get('common.official', '签约'), key: 'formal', dataName: '正式用户'},
    {name: Intl.get('common.trial', '试用'), key: 'trial', dataName: '试用用户'},
    {name: Intl.get('user.type.presented', '赠送'), key: 'special'},
    {name: Intl.get('user.type.train', '培训'), key: 'training'},
    {name: Intl.get('user.type.employee', '员工'), key: 'internal'},
    unknownObj,
];

//客户阶段
export const CUSTOMER_STAGE = {
    message: '信息',
    intention: '意向',
    trial: '试用',
    signed: '签约',
    qualified: '合格',
    unknown: '未知'
};

let userTypeDataObj = {};

_.each(USER_TYPES, userType => {
    const mapKey = userType.dataName || userType.key;
    userTypeDataObj[mapKey] = userType.name;
});

//用户类型名到中文的映射
export const userTypeDataMap = userTypeDataObj;

//带标题的用户类型名数组
export const USER_TYPES_WITH_TITLE = [{
    name: Intl.get('oplate.user.analysis.user.type', '用户类型'),
    key: 'name'
}]
    .concat(USER_TYPES)
    .concat([{
        name: Intl.get('operation.report.total.num', '总数'),
        key: 'total'
    }]);

//一周7天的中文名
export const WEEKDAY = [
    Intl.get('user.time.sunday', '周日'),
    Intl.get('user.time.monday', '周一'),
    Intl.get('user.time.tuesday', '周二'),
    Intl.get('user.time.wednesday', '周三'),
    Intl.get('user.time.thursday', '周四'),
    Intl.get('user.time.friday', '周五'),
    Intl.get('user.time.saturday', '周六')
];

//localstorage中存储选中的应用ID的键
export const STORED_APP_ID_KEY = 'analysis_account_active_app_id';

//历史最高客户id字段
export const CUSTOMER_IDS_FIELD = 'highest_customer_ids';

//延期帐号统计页标题
export const DEFERRED_ACCOUNT_ANALYSIS_TITLE = '延期帐号分析';

// 账号分析菜单
export const ACCOUNT_MENUS = {
    INDEX: {
        name: '账号分析',
        key: 'account'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'account_overall'
    },
    DELAYED: {
        name: DEFERRED_ACCOUNT_ANALYSIS_TITLE,
        key: 'delayed'
    },
    EXPIRED: {
        name: '过期账号分析',
        key: 'expired'
    },
    NEW_ADD: {
        name: '新增账号分析',
        key: 'new_add'
    },
    NEW_ADD_EXPIRE: {
        name: '新增过期账号分析',
        key: 'new_add_expire'
    }
};

// 通话分析菜单
export const CALL_MENUS = {
    INDEX: {
        name: '通话分析',
        key: 'call'
    },
    NUMBER_DURATION: {
        name: '数量与时长统计',
        key: 'number_duration'
    },
    OTHER: {
        name: '其他分析',
        key: 'call_other'
    }
};

// 销售机会分析菜单
export const CHANCE_MENUS = {
    INDEX: {
        name: '销售机会分析',
        key: 'chance'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'chance_overall'
    }
};

// 线索分析菜单
export const CLUE_MENUS = {
    INDEX: {
        name: '线索分析',
        key: 'clue'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'clue_overall'
    }
};

// 合同分析菜单
export const CONTRACT_MENUS = {
    INDEX: {
        name: '合同分析',
        key: 'contract'
    },
    CONTRACT: {
        name: '新增合同分析',
        key: 'new_contract'
    },
    COST: {
        name: '费用分析',
        key: 'cost'
    },
    REPAY: {
        name: '回款分析',
        key: 'repay'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'contract_overall'
    }
};

// 客户分析菜单
export const CUSTOMER_MENUS = {
    INDEX: {
        name: '客户分析',
        key: 'customer'
    },
    ACTIVE: {
        name: '客户活跃度分析',
        key: 'active'
    },
    NEW_ADD: {
        name: '新开客户分析',
        key: 'customer_new_add'
    },
    OTHER: {
        name: '其他',
        key: 'customer_other'
    },
    SIGNED: {
        name: '签约客户分析',
        key: 'signed'
    },
    STAGE: {
        name: '阶段变更分析',
        key: 'stage'
    },
    TRIAL_QUALIFIED: {
        name: '试用合格客户分析',
        key: 'trial-qualified'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'customer_overall'
    }
};

// 订单分析菜单
export const ORDER_MENUS = {
    INDEX: {
        name: '订单分析',
        key: 'order'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'order_overall'
    }
};

// 销售生产力分析菜单
export const SALES_PRODUCTIVITY_MENUS = {
    INDEX: {
        name: Intl.get('common.sales.productivity.analysis', '销售生产力分析'),
        key: 'sales_productivity'
    },
    OVERALL: {
        name: Intl.get('common.overall.analysis', '总体分析'),
        key: 'sales_productivity_overall'
    }
};

// 开通营收中心后，才能展示的菜单
export const OPEN_CASH_SHOW_MENUS_KEY = [
    CONTRACT_MENUS.INDEX.key,// 合同分析
    CHANCE_MENUS.INDEX.key,// 销售机会分析
];
