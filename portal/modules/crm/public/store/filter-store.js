var FilterActions = require('../action/filter-actions');
import { altAsyncUtil } from 'ant-utils';
const { resultHandler } = altAsyncUtil;
import {
    OTHER_FILTER_ITEMS, STAGE_OPTIONS, UNKNOWN,
    COMMON_OTHER_ITEM, SPECIAL_LABEL
} from 'PUB_DIR/sources/utils/consts';
import { administrativeLevels, CUSTOMER_TAGS } from '../utils/crm-util';
//合格标签的筛选
const qualifiedTagList = [{
    name: CUSTOMER_TAGS.QUALIFIED, value: '1'
}, {
    name: CUSTOMER_TAGS.HISTORY_QUALIFIED, value: '2'
}, {
    name: CUSTOMER_TAGS.NEVER_QUALIFIED, value: '3'
}];
function FilterStore() {
    this.appList = [];
    this.teamList = [];
    this.userList = [];//负责人（联合跟进人）列表
    this.stageList = [];
    this.systemTagList = []; //系统标签
    this.tagList = [];
    this.stageTagList = [];//阶段标签
    this.competitorList = [];//竞品列表
    this.industryList = [];//行业列表
    this.provinceList = [];//地域列表
    this.salesRoleList = [];
    this.inputCondition = {};
    this.setInitialCondition();
    this.isPanelShow = false;
    this.createTimeFilterCondition = {};//根据创建时间筛选
    this.lastContactTimeFilterCondition = {};//根据最后跟进时间筛选
    this.bindActions(FilterActions);
}
FilterStore.prototype.setInitialCondition = function() {
    this.condition = {
        sales_team_id: '',
        nickname: '',//负责人
        second_nickname: '',//联合跟进人
        industry: '',
        province: '',
        immutable_labels: [''], //系统标签
        labels: [''],//标签的筛选
        customer_label: '',//阶段标签
        qualify_label: '',//合格标签（合格、曾经合格）
        member_role: '',//销售角色的筛选
        competing_products: [''],//竞品的筛选
        sales_opportunities: [{
            sale_stages: ''
        }],
        source_classify: '',//集客方式的筛选
        administrative_level: '',//行政级别
        otherSelectedItem: '',//其他类型的筛选
    };
    this.commonFilterList = {
        data: [],
        loading: false,
        errorMsg: ''
    };
};
//获取地域列表
FilterStore.prototype.getFilterProvinces = function(list) {
    this.provinceList = list;
};

//获取行业列表
FilterStore.prototype.getIndustries = function(list) {
    this.industryList = list;
};

FilterStore.prototype.getAppList = function(list) {
    this.appList = list;
};

FilterStore.prototype.getTeamList = function(result) {
    this.teamTreeList = result.teamTreeList;
    this.teamList = result.teamList;
};

FilterStore.prototype.getUserList = function(list) {
    this.userList = _.get(list, '[0]') ? list : [];
};

FilterStore.prototype.getStageList = function(list) {
    this.stageList = list;
};

FilterStore.prototype.getStageTagList = function(data) {
    let stageTagList = [];
    if (!data.errorMsg && _.isArray(data.list)) {
        let list = _.map(data.list, tag => {
            return { name: tag, show_name: tag };
        });
        stageTagList = stageTagList.concat(list);
    }
    this.stageTagList = stageTagList;
};

FilterStore.prototype.getSalesRoleList = function(data) {
    let salesRoleList = [];
    if (!data.errorMsg && _.isArray(data.list)) {
        let list = _.map(data.list, role => {
            return { name: role, show_name: role };
        });
        salesRoleList = salesRoleList.concat(list);
    }
    this.salesRoleList = salesRoleList;
};

FilterStore.prototype.getTagList = function(list) {
    this.tagList = list;
};

FilterStore.prototype.getCompetitorList = function(list) {
    this.competitorList = list;
};

//获取系统标签列表
FilterStore.prototype.getSystemTagList = function(list) {
    this.systemTagList = list;
};

FilterStore.prototype.setInputCondition = function(searchObj) {
    if (_.has(searchObj, 'contact_name')) {
        //联系人的搜索
        this.inputCondition = { contacts: [{ name: searchObj.contact_name }] };
    } else {
        this.inputCondition = searchObj;
    }
};

FilterStore.prototype.showPanel = function() {
    this.isPanelShow = true;
};

FilterStore.prototype.hidePanel = function() {
    this.isPanelShow = false;
};

FilterStore.prototype.setCondition = function(conditionObj) {
    this.condition = $.extend({}, this.condition, conditionObj);
};

FilterStore.prototype.setCreateTimeFilter = function(conditionObj) {
    this.createTimeFilterCondition = conditionObj;
};
FilterStore.prototype.setLastContactTimeFilter = function(conditionObj) {
    this.lastContactTimeFilterCondition = conditionObj;
};

//将查询条件转换为前端展示用的格式
const getFilterItemFromConditionItem = function(item) {
    let filterLevelArray = administrativeLevels;
    const stageArray = this.stageList.concat(STAGE_OPTIONS);
    let filters = [];
    let plainFilters = [];
    //将处理好的筛选项组装成FilterList所需的格式
    const handleAddItem = nameObj => {
        let filterItem = null;
        plainFilters.push(nameObj);
        filterItem = {
            ...nameObj,
            data: [{
                ...nameObj,
                selected: true
            }]
        };
        const sameGroupItem = filters.find(x => x.groupId === filterItem.groupId);
        //将已存在的高级筛选合并成commonData的结构
        if (sameGroupItem) {
            sameGroupItem.data.push({
                ...nameObj,
                selected: true
            });
        }
        else {
            filters.push(filterItem);
        }
    };
    //处理筛选项的value，处理成前端的格式
    const handleValue = (value, key) => {
        if (['term_fields'].includes(key)) {
            return;
        }
        let item = null;
        const nameObj = {
            groupId: key,
            groupName: key,//todo
            value: value,
            name: value
        };
        //处理value（实际的筛选项值）
        nameObj.value = value;
        if (_.get(value, 'sale_stages')) {
            nameObj.value = value.sale_stages;
            nameObj.name = value.sale_stages;
        }
        //处理name（展示的筛选项文字）
        switch (key) {
            case 'term_fields':
                break;
            case 'sales_team_id':
                item = this.teamList.find(x => x.group_id === value);
                if (item) {
                    nameObj.name = item.group_name;
                }
                //todo 销售部无法处理
                break;
            case 'contain_sales_opportunity'://订单阶段value由name表示
                item = stageArray.find(x => x.name === value);
                if (item) {
                    nameObj.name = item.show_name;
                }
                if (value === 'false') {
                    nameObj.name = UNKNOWN;
                    nameObj.value = UNKNOWN;
                }
                nameObj.groupId = 'sales_opportunities';
                break;
            case 'sales_opportunities':
                item = stageArray.find(x => x.name === value);
                if (item) {
                    nameObj.name = item.show_name;
                }
                break;
            case 'administrative_level':
                item = filterLevelArray.find(x => x.id === value);
                if (item) {
                    nameObj.name = item.level;
                }
                break;
            case 'immutable_labels' :
                item = this.systemTagList.find(x => x.name === value);
                if (item) {
                    nameObj.name = item.show_name;
                }
                break;
            case 'labels':
                item = this.tagList.find(x => x.name === value);
                if (item) {
                    nameObj.name = item.show_name;
                }
                if (nameObj.name === Intl.get('crm.tag.unknown', '未打标签的客户')) {
                    nameObj.selectOnly = true;
                }
                break;
            case 'competing_products':
                item = this.competitorList.find(x => x.name === value);
                if (item) {
                    nameObj.name = item.show_name;
                }
                break;
            case 'qualify_label':
                item = qualifiedTagList.find(x => x.value === value);
                if (item) {
                    nameObj.name = item.name;
                }
                break;
            case 'contain_contact':
                nameObj.name = Intl.get('crm.no.contact.way', '无联系方式客户');
                nameObj.value = 'no_contact_way';
                nameObj.groupId = COMMON_OTHER_ITEM;
                nameObj.groupName = Intl.get('crm.186', '其他');
                break;
            case 'call_and_remark':
                nameObj.name = Intl.get('crm.call.no.remark', '最后联系但未写跟进记录');
                nameObj.value = 'last_call_no_record';
                nameObj.groupId = COMMON_OTHER_ITEM;
                nameObj.groupName = Intl.get('crm.186', '其他');
                break;
            case 'last_trace':
                nameObj.name = Intl.get('crm.call.no.remark.over30', '超30天未写跟进记录');
                nameObj.value = 'last_trace';
                nameObj.groupId = COMMON_OTHER_ITEM;
                nameObj.groupName = Intl.get('crm.186', '其他');
                break;
            case 'interest_member_ids':
                nameObj.name = Intl.get('crm.my.concerned.customer', '我关注的客户');
                nameObj.value = 'my_interest';
                nameObj.groupId = COMMON_OTHER_ITEM;
                nameObj.groupName = Intl.get('crm.186', '其他');
                break;
            case 'unexist_fields':
                switch (value) {
                    case 'industry':
                        nameObj.name = UNKNOWN;
                        nameObj.value = UNKNOWN;
                        nameObj.groupId = 'industry';
                        break;
                    case 'province':
                        nameObj.groupId = 'province';
                        nameObj.name = UNKNOWN;
                        nameObj.value = UNKNOWN;
                        break;
                    case 'qualify_label':
                        nameObj.groupId = 'qualify_label';
                        nameObj.name = CUSTOMER_TAGS.NEVER_QUALIFIED;
                        nameObj.value = '3';
                        break;
                    case 'labels':
                        nameObj.groupId = 'labels';
                        nameObj.name = Intl.get('crm.tag.unknown', '未打标签的客户');
                        nameObj.value = SPECIAL_LABEL.NON_TAGGED_CUSTOMER;
                        break;
                    case 'member_id':
                        nameObj.groupId = 'member_id';
                        nameObj.name = Intl.get('crm.213', '未分配客户');
                        nameObj.value = OTHER_FILTER_ITEMS.UNDISTRIBUTED;
                        break;
                    default:
                        break;
                }
                break;
            case 'exist_fields':
                switch (value) {
                    case 'interest_member_ids':
                        nameObj.name = Intl.get('crm.concerned.customer', '被关注的客户');
                        nameObj.value = 'interest_member_ids';
                        nameObj.groupId = COMMON_OTHER_ITEM;
                        nameObj.groupName = Intl.get('crm.186', '其他');
                        break;

                    default:
                        break;
                }
                break;
            case 'availability':
                nameObj.groupId = COMMON_OTHER_ITEM;
                nameObj.name = Intl.get('crm.available.customer', '有效客户');
                nameObj.value = 'availability';
                break;
        }
        handleAddItem(nameObj);
    };

    if (_.get(item, 'query_condition')) {
        if (_.get(item.query_condition, 'query')) {
            _.each(item.query_condition.query, (value, key) => {
                if (value) {
                    let valueList = [];
                    if (value.length) {
                        valueList = value;
                    }
                    if (typeof value === 'string') {
                        //拼接字符串（数组value）
                        if (value.includes(',')) {
                            valueList = value.split(',');
                        }
                        //单个字符串
                        else {
                            handleValue(value, key);
                        }
                    }
                    //数组value
                    if (Array.isArray(valueList) && valueList.length > 0) {
                        valueList.forEach(x => {
                            handleValue(x, key);
                        });
                    }
                }
            });
        }
        //日期范围通过interval判断
        if (_.get(item.query_condition, 'rang_params.length')) {
            item.query_condition.rang_params.forEach(rangeItem => {
                const nameObj = {
                    groupId: COMMON_OTHER_ITEM,
                    groupName: Intl.get('crm.186', '其他'),
                    value: '',
                    name: rangeItem.name
                };
                switch (rangeItem.name) {
                    case 'last_contact_time':
                        switch (rangeItem.interval) {
                            case 30:
                                nameObj.name = Intl.get('crm.over.day.without.contact', '超{day}天未联系', { day: 30 });
                                nameObj.value = OTHER_FILTER_ITEMS.THIRTY_UNCONTACT;
                                //超30天未联系的客户
                                break;
                            case 15:
                                nameObj.name = Intl.get('crm.over.day.without.contact', '超{day}天未联系', { day: 15 });
                                nameObj.value = OTHER_FILTER_ITEMS.FIFTEEN_UNCONTACT;
                                //超15天未联系的客户
                                break;
                            case 7:
                                nameObj.name = Intl.get('crm.over.day.without.contact', '超{day}天未联系', { day: 7 });
                                nameObj.value = OTHER_FILTER_ITEMS.SEVEN_UNCONTACT;
                                //超7天未联系的客户
                                break;
                        }
                        break;
                    case 'last_login_time':
                        switch (rangeItem.interval) {
                            case 30:
                                nameObj.name = Intl.get('crm.recent.month.active', '近一个月的活跃客户');
                                nameObj.value = 'month_login';
                                //超30天未联系的客户
                                break;
                            case 7:
                                nameObj.name = Intl.get('crm.recent.week.active', '近一周的活跃客户');
                                nameObj.value = 'seven_login';
                                //超7天未联系的客户
                                break;
                        }
                        break;
                    case 'sales_opportunity_count':
                        nameObj.name = Intl.get('crm.order.more.customer', '多个订单的客户');
                        nameObj.value = OTHER_FILTER_ITEMS.MULTI_ORDER;
                        break;
                    //开始时间跳过处理
                    case 'start_time':
                        return false;
                    default:
                        break;
                }
                handleAddItem(nameObj);
            });
        }
    }

    return {
        name: item.name,
        value: item.name,
        data: filters,
        plainFilterList: plainFilters,
        id: item.id
    };
};

FilterStore.prototype.getCommonFilterList = resultHandler('commonFilterList', function({ data, paramsObj }) {
    if (_.get(data, 'list.length') > 0) {
        this.commonFilterList.data = data.list.map(condition => getFilterItemFromConditionItem.call(this, condition));
        console.log(this.commonFilterList.data);
    }
});

module.exports = alt.createStore(FilterStore, 'FilterStore');
