var CrmActions = require('../action/crm-actions');
var filterStore = require('./filter-store');
var orderStore = require('./order-store');
var crmUtil = require('./../utils/crm-util');
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import { altAsyncUtil } from 'ant-utils';
const {resultHandler} = altAsyncUtil;
import {storageUtil} from 'ant-utils';

function CrmStore() {
    this.setInitialState();
    this.bindActions(CrmActions);

    this.exportPublicMethods({
        getCustomersLength: this.getCustomersLength,
        getCurPageCustomers: this.getCurPageCustomers,
        getlastCurPageCustomers: this.getlastCurPageCustomers,
        processForList: this.processForList,
        batchChangeSalesman: this.batchChangeSalesman,
        batchChangeTags: this.batchChangeTags,
        batchChangeIndustry: this.batchChangeIndustry,
        batchChangeLevel: this.batchChangeLevel,
        batchChangeTerritory: this.batchChangeTerritory,
        batchReleaseCustomer: this.batchReleaseCustomer
    });
}
//设置初始值
CrmStore.prototype.setInitialState = function() {
    //是否展示确认删除的模态框
    this.modalDialogShow = false;
    //客户列表的长度
    this.customersSize = 0;
    //当前客户列表
    this.curCustomers = [];
    //当前选择的客户
    this.selectCustomers = [];
    //一页可显示的客户的个数
    this.pageSize = 20;
    //当前页数
    this.pageNum = 1;
    //加载数据中。。。
    this.isLoading = false;
    //加载错误后的提示
    this.getErrMsg = '';
    //右侧面板是否展示
    this.rightPaneIsShow = false;
    //当前展示的客户的id
    this.currentId = '';
    //当前展示的客户
    this.curCustomer = {};
    //是否展示客户查重界面
    this.isRepeatCustomerShow = false;
    //展示的线索详情的id
    this.clueId = '';
    this.addCommonFilterResult = {
        loading: false,
        errorMsg: ''
    };
    //是否关注我的客户
    this.isConcernCustomer = false;
};

//获取当前用户是否设置了关注客户置顶
function getConcernCustomerTopFlag() {
    //登录后已获取了该用户的配置存入了localstorage中，此处可以直接取
    let personnel_setting = storageUtil.local.get('websiteConfig');
    personnel_setting = personnel_setting ? JSON.parse(personnel_setting) : {};
    return _.get(personnel_setting, oplateConsts.STORE_PERSONNAL_SETTING.CONCERN_CUSTOMER_TOP_FLAG, false);
}

//是否关注我的客户
CrmStore.prototype.setConcernCustomer = function(flag) {
    this.isConcernCustomer = flag;
},

CrmStore.prototype.updateCurrentCustomerRemark = function(submitObj) {
    let customer = _.find(this.curCustomers, (customer) => {
        return customer.id === submitObj.customer_id;
    });
    if(customer) {
        customer.customer_trace = submitObj.remark;
        customer.last_contact_time = submitObj.last_contact_time;
    }
},

//合并后的处理
CrmStore.prototype.afterMergeCustomer = function(mergeObj) {
    if (mergeObj && _.isObject(mergeObj)) {
        //合并后客户的处理
        let mergeCustomer = mergeObj.customer;
        let index = _.findIndex(this.curCustomers, customer => customer.id === mergeCustomer.id);
        this.curCustomers[index] = mergeCustomer;
        //合并后，删除的客户
        let deleteCustomers = _.get(mergeObj,'delete_customers');
        //合并后删除的客户id列表
        let delCustomerIds = _.map(deleteCustomers,'id');
        if (!_.isEmpty(delCustomerIds)) {
            this.curCustomers = _.filter(this.curCustomers, customer => _.indexOf(delCustomerIds,customer.id) === -1);
            this.customersSize -= delCustomerIds.length;//客户的总数去掉删除的客户数
        }
    }
};
//是否展示客户查重界面的设置
CrmStore.prototype.setRepeatCustomerShow = function(flag) {
    this.isRepeatCustomerShow = flag;
};

//是否展示客户查重界面的设置
// CrmStore.prototype.setCustomerId = function(id) {
//     this.customerId = id;
// };

//公开方法，获取当前页展示客户数量
CrmStore.prototype.getCustomersLength = function() {
    return this.getState().customersSize;
};

//公开方法，获取当前页客户列表
CrmStore.prototype.getCurPageCustomers = function() {
    return this.getState().curCustomers;
};

//公开方法，获取前一次正确时获取的数据，为便于翻页
CrmStore.prototype.getlastCurPageCustomers = function() {
    return this.getState().customersBack;
};

//监听Action的queryCustomer方法
CrmStore.prototype.queryCustomer = function(data) {
    if (data.loading) {
        this.isLoading = true;
        this.getErrMsg = '';
    } else if (data.error) {
        this.getErrMsg = data.errorMsg;
        this.isLoading = false;
        this.curCustomers = [];
        this.pageNum = 1;
        this.customersSize = 0;
    } else {
        this.getErrMsg = '';
        this.isLoading = false;
        this.pageSize = data.pageSize;
        data = data && data.result;
        let list = data && data.result;
        //过滤掉空的测试数据
        list = _.filter(list, item => item);
        if (list && _.isArray(list) && list.length) {
            this.customersBack = list;
            this.curCustomers = list;
            this.customersSize = data && data.total || 0;
            //刷新当前右侧面板中打开的客户的数据
            if (this.currentId) {
                this.setCurrentCustomer(this.currentId);
            }
        } else {
            this.curCustomers = [];
            this.pageNum = 1;
            this.customersSize = 0;
        }

    }
};

//监听Action的addCustomer方法
CrmStore.prototype.addCustomer = function(added) {
    this.curCustomers.unshift(added);
    this.customersSize += 1;
};
//释放客户后的处理
CrmStore.prototype.afterReleaseCustomer = function(id) {
    this.deleteCustomer(id);
};
//监听Action的deleteCustomer方法
CrmStore.prototype.deleteCustomer = function(id) {
    //从列表中移除已删除项
    this.curCustomers = _.filter(this.curCustomers, item => id !== item.id);
    //列表下面客户的总数减去已删除的客户数量
    this.customersSize--;
};
//修改基本资料后，更新客户列表
CrmStore.prototype.editBasicSuccess = function(newBasic) {
    if (newBasic && newBasic.id) {
        let updateCustomer = _.find(this.curCustomers, customer => customer.id === newBasic.id);
        if(updateCustomer){
            for (var key in newBasic) {
                if (newBasic[key] || newBasic[key] === '') {
                    updateCustomer[key] = newBasic[key];
                }
                if (key === 'member_role') {//转出客户时，打上”转出“标签
                    if (_.isArray(updateCustomer.immutable_labels)) {
                        if (updateCustomer.immutable_labels.indexOf(Intl.get('crm.qualified.roll.out', '转出')) === -1) {
                            updateCustomer.immutable_labels.push(Intl.get('crm.qualified.roll.out', '转出'));
                        }
                    } else {
                        updateCustomer.immutable_labels = [Intl.get('crm.qualified.roll.out', '转出')];
                    }

                }
            }
        }
    }
};
//修改默认联系人后，更新客户列表中该客户的默认联系人
CrmStore.prototype.updateCustomerDefContact = function(contact) {
    if (contact && contact.customer_id) {
        let updateCustomer = _.find(this.curCustomers, customer => customer.id === contact.customer_id);
        //删除默认联系人
        if(contact.isDelDefaultContact){
            //删掉列表中默认联系人相关的信息
            delete updateCustomer.contact;//删除列表展示时的默认联系人姓名
            delete updateCustomer.contact_way;//删除列表展示时的默认联系人的电话
            delete updateCustomer.contacts;//删除后端返回的联系人列表，只有默认联系人一个
            delete updateCustomer.contact_name;//删除后端返回的默认联系人姓名
            delete updateCustomer.phones;//删除后端返回的默认联系人电话
        }else{
            let updateContact = _.get(updateCustomer, 'contacts[0]', {});
            //单项修改时的更新
            if(contact.property){
                updateContact[contact.property] = contact[contact.property];
            }else{//添加默认联系人时的更新
                updateContact = contact;
            }
            updateCustomer.contacts = [updateContact];
        }
    }
};

//添加跟进记录时，修改客户最新的跟进记录时，更新列表中的最后联系
CrmStore.prototype.updateCustomerLastContact = function(traceObj) {
    if (_.get(traceObj, 'customer_id')) {
        let updateTraceCustomer = _.find(this.curCustomers, customer => customer.id === traceObj.customer_id);
        if (updateTraceCustomer) {
            updateTraceCustomer.last_contact_time = traceObj.time;
            updateTraceCustomer.customer_trace = traceObj.remark;
        }
    }
};

//获取过滤条件中的销售阶段
function getFilterStages() {
    if (filterStore && filterStore.getState().condition) {
        let filterOrderList = filterStore.getState().condition.sales_opportunities;
        if (_.isArray(filterOrderList) && filterOrderList[0]) {
            //通过销售阶段进行筛选时,筛选条件中的内容stage："信息阶段，成交阶段"
            return filterOrderList[0].sale_stages;
        }
    }
    return '';
}
//获取根据销售阶段排序后的订单列表
function getOrderListSortByStage(orderList) {
    if (orderStore) {
        let stageList = orderStore.getState().stageList;
        if (_.isArray(stageList) && stageList.length) {
            orderList = orderList.map(order => {
                //从销售阶段列表中找到order对应的销售阶段
                let salesStage = _.find(stageList, stage => stage.name === order.sale_stages);
                if (salesStage) {
                    order.stage_index = salesStage.index;
                }
                return order;
            });
            //通过销售阶段的index进行倒序排序8、7、6...1
            orderList = orderList.sort((order1, order2) => {
                return order2.stage_index - order1.stage_index;
            });
        }
    }
    return orderList;
}
//对客户字段进行处理，以便在客户列表上显示
CrmStore.prototype.processForList = function(curCustomers) {
    if (!_.isArray(curCustomers)) return [];
    let list = _.clone(curCustomers);
    for (let i = 0, len = list.length; i < len; i++) {
        let curCustomer = list[i] || {};
        //导入时是否是重复的客户
        curCustomer.repeat = curCustomer.name_repeat || curCustomer.phone_repeat;
        curCustomer.dynamic = curCustomer.customer_dynamic_dto ? curCustomer.customer_dynamic_dto.message : '';
        curCustomer.start_time = curCustomer.start_time ? moment(curCustomer.start_time).format(oplateConsts.DATE_FORMAT) : '';
        curCustomer.last_contact_time = curCustomer.last_contact_time ? moment(curCustomer.last_contact_time).format(oplateConsts.DATE_FORMAT) : '';

        let traceArray = curCustomer.customer_traces;
        if (_.isArray(traceArray)) {
            curCustomer.customer_trace = _.get(traceArray, '[0].remark', curCustomer.customer_trace);
        }
        //默认联系人（后端处理后，放入联系人列表中）
        if (_.isArray(curCustomer.contacts) && curCustomer.contacts[0] || _.isArray(curCustomer.phones)) {
            let contact = _.get(curCustomer, 'contacts[0]');
            curCustomer.contact_name = _.get(contact,'name', curCustomer.contact_name);
            curCustomer.contact_way = '';
            let phones = _.get(contact, 'phone', curCustomer.phones);
            _.each(phones, function(phone) {
                if (phone) {
                    curCustomer.contact_way += addHyphenToPhoneNumber(phone) + '\n';
                }
            });
        }
        let cop = curCustomer.sales_opportunities;
        if (_.isArray(cop) && cop[0]) {
            //通过销售阶段进行筛选时,展示筛选条件中销售阶段高的订单
            //没有销售阶段的筛选时，展示订单列表中销售阶段高的订单
            //以上条件判断改到后端处理完后，放到入订单列表中
            curCustomer.sales_stage = cop[0].sale_stages || curCustomer.sales_stage;
        }
    }
    return list;
};

CrmStore.prototype.setLoadingState = function(loadingState) {
    this.isLoading = loadingState;
};

CrmStore.prototype.setCurrentCustomer = function(id) {
    this.currentId = id;
    let curCustomer = _.find(this.curCustomers, customer => customer.id === id);
    if(curCustomer){
        this.curCustomer = curCustomer;
    }
};

//刷新客户列表
CrmStore.prototype.refreshCustomerList = function(data) {
    if (data) {
        _.some(this.curCustomers, (customer, index) => {
            if (customer.id === data.id) {
                this.curCustomers[index] = data;
                return true;
            }
        });
        //如果界面上切换了客户详情，就不需要更新客户详情了
        if (data.id === this.curCustomer.id) {
            this.curCustomer = data;
        }
    }
};

//批量变更销售以后，同步列表数据
CrmStore.prototype.batchChangeSalesman = function({taskInfo, taskParams, curCustomers}) {
    //如果参数不合法，不进行更新
    if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
        return;
    }
    //解析taskParams
    var {
        sales_id,
        sales_nick_name,
        sales_team_id,
        sales_team_name,
    } = taskParams;
    //解析tasks
    var {
        tasks
    } = taskInfo;
    //如果tasks为空，不进行更新
    if (!_.isArray(tasks) || !tasks.length) {
        return;
    }
    //检查taskDefine
    tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
    //如果没有要更新的数据
    if (!tasks.length) {
        return;
    }
    var curCustomerListMap = _.keyBy(curCustomers, 'id');
    var targetCustomers = _.map(tasks, 'taskDefine');
    //遍历每一个客户
    _.each(targetCustomers, (customerId) => {
        //如果当前客户是需要更新的客户，才更新
        var customerInfo = curCustomerListMap[customerId];
        if (!customerInfo) {
            return;
        }
        customerInfo.user_id = sales_id;
        customerInfo.user_name = sales_nick_name;
        customerInfo.sales_team = sales_team_name;
        customerInfo.sales_team_id = sales_team_id;
        if (taskInfo.type === 'crm_batch_transfer_customer') {
            //批量转出客户时，打上”转出“标签
            if (_.isArray(customerInfo.immutable_labels)) {
                if (customerInfo.immutable_labels.indexOf(Intl.get('crm.qualified.roll.out', '转出')) === -1) {
                    customerInfo.immutable_labels.push(Intl.get('crm.qualified.roll.out', '转出'));
                }
            } else {
                customerInfo.immutable_labels = [Intl.get('crm.qualified.roll.out', '转出')];
            }
        }
        var sales_opportunities = customerInfo.sales_opportunities || [];
        _.each(sales_opportunities, (sales_opportunity) => {
            sales_opportunity = sales_opportunity || {};
            sales_opportunity.user_id = sales_id;
            sales_opportunity.user_name = sales_nick_name;
        });
    });
};

//批量变更标签以后，同步列表数据
CrmStore.prototype.batchChangeTags = function({taskInfo, taskParams, curCustomers}, type) {
    //如果参数不合法，不进行更新
    if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
        return;
    }
    //解析taskParams
    var {
        tags
    } = taskParams;
    //如果tags不是数组，不进行更新
    if (!_.isArray(tags)) {
        return;
    }
    //解析tasks
    var {
        tasks
    } = taskInfo;
    //如果tasks为空，不进行更新
    if (!_.isArray(tasks) || !tasks.length) {
        return;
    }
    //检查taskDefine
    tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
    //如果没有要更新的数据
    if (!tasks.length) {
        return;
    }
    var curCustomerListMap = _.keyBy(curCustomers, 'id');
    var targetCustomers = _.map(tasks, 'taskDefine');
    //遍历每一个客户
    _.each(targetCustomers, (customerId) => {
        var customerInfo = curCustomerListMap[customerId];
        //如果当前客户是需要更新的客户，才更新
        if (!customerInfo) {
            return;
        }
        if (type === 'change') {
            //更新标签，将新标签列表替换原标签列表
            customerInfo.labels = tags;
        } else if (type === 'add') {
            //添加标签
            if (_.isArray(customerInfo.labels) && customerInfo.labels.length) {
                //原来存在标签列表，则合并去重
                customerInfo.labels = _.uniq(customerInfo.labels.concat(tags));
            } else {
                customerInfo.labels = tags;
            }
        } else if (type === 'remove') {
            //移除标签
            if (_.isArray(customerInfo.labels) && customerInfo.labels.length) {
                //返回存在于labels，不存在于tags中的标签（即：过滤掉tags里的标签）
                customerInfo.labels = _.difference(customerInfo.labels, tags);
            }
        }
    });
};

//批量变更行业以后，同步列表数据
CrmStore.prototype.batchChangeIndustry = function({taskInfo, taskParams, curCustomers}) {
    //如果参数不合法，不进行更新
    if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
        return;
    }
    //解析taskParams
    var {
        industry
    } = taskParams;
    //解析tasks
    var {
        tasks
    } = taskInfo;
    //如果tasks为空，不进行更新
    if (!_.isArray(tasks) || !tasks.length) {
        return;
    }
    //检查taskDefine
    tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
    //如果没有要更新的数据
    if (!tasks.length) {
        return;
    }
    var curCustomerListMap = _.keyBy(curCustomers, 'id');
    var targetCustomers = _.map(tasks, 'taskDefine');
    //遍历每一个客户
    _.each(targetCustomers, (customerId) => {
        var customerInfo = curCustomerListMap[customerId];
        //如果当前客户是需要更新的客户，才更新
        if (!customerInfo) {
            return;
        }
        customerInfo.industry = industry;
    });
};
//批量变更行政级别以后，同步列表数据
CrmStore.prototype.batchChangeLevel = function({taskInfo, taskParams, curCustomers}) {
    //如果参数不合法，不进行更新
    if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
        return;
    }
    //解析taskParams
    var {
        administrative_level
    } = taskParams;
    //解析tasks
    var {
        tasks
    } = taskInfo;
    //如果tasks为空，不进行更新
    if (!_.isArray(tasks) || !tasks.length) {
        return;
    }
    //检查taskDefine
    tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
    //如果没有要更新的数据
    if (!tasks.length) {
        return;
    }
    var curCustomerListMap = _.keyBy(curCustomers, 'id');
    var targetCustomers = _.map(tasks, 'taskDefine');
    //遍历每一个客户
    _.each(targetCustomers, (customerId) => {
        var customerInfo = curCustomerListMap[customerId];
        //如果当前客户是需要更新的客户，才更新
        if (!customerInfo) {
            return;
        }
        customerInfo.administrative_level = administrative_level;
    });
};
//批量释放客户以后，同步列表数据
CrmStore.prototype.batchReleaseCustomer = function({taskInfo, taskParams}) {
    //如果参数不合法，不进行更新
    if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
        return;
    }
    //解析tasks
    let {
        tasks
    } = taskInfo;
    //如果tasks为空，不进行更新
    if (!_.isArray(tasks) || !tasks.length) {
        return;
    }
    //检查taskDefine
    tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
    //如果没有要更新的数据
    if (!tasks.length) {
        return;
    }
    let targetCustomers = _.map(tasks, 'taskDefine');
    //过滤掉释放的客户
    this.curCustomers = _.filter(this.curCustomers, item => !_.includes(targetCustomers, item.id));
    this.customersSize -= _.get(targetCustomers, 'length');
};
//批量变更地域以后，同步列表数据
CrmStore.prototype.batchChangeTerritory = function({taskInfo, taskParams, curCustomers}) {
    //如果参数不合法，不进行更新
    if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
        return;
    }
    //解析taskParams
    var {
        province,
        city,
        county,
        province_code,
        city_code,
        county_code
    } = taskParams;
    //解析tasks
    var {
        tasks
    } = taskInfo;
    //如果tasks为空，不进行更新
    if (!_.isArray(tasks) || !tasks.length) {
        return;
    }
    //检查taskDefine
    tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
    //如果没有要更新的数据
    if (!tasks.length) {
        return;
    }
    var curCustomerListMap = _.keyBy(curCustomers, 'id');
    var targetCustomers = _.map(tasks, 'taskDefine');
    //遍历每一个客户
    _.each(targetCustomers, (customerId) => {
        var customerInfo = curCustomerListMap[customerId];
        //如果当前客户是需要更新的客户，才更新
        if (!customerInfo) {
            return;
        }
        customerInfo.province = province;
        customerInfo.city = city;
        customerInfo.county = county;
        customerInfo.province_code = province_code;
        customerInfo.city_code = city_code;
        customerInfo.county_code = county_code;
    });
};
CrmStore.prototype.setPageNum = function(pageNum) {
    this.pageNum = pageNum;
};

CrmStore.prototype.showClueDetail = function(clueId) {
    this.clueId = clueId;
};

CrmStore.prototype.setCurCustomers = function(curCustomers) {
    this.curCustomers = curCustomers;
};
CrmStore.prototype.addCommonFilter = resultHandler('addCommonFilterResult');

module.exports = alt.createStore(CrmStore, 'CrmStore');
