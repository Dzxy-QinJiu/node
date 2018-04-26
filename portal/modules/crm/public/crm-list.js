require('./css/index.less');
import {Tag, Modal, message, Button, Icon} from "antd";
import {AntcTable} from "antc";
var RightContent = require('../../../components/privilege/right-content');
var FilterBlock = require('../../../components/filter-block');
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
var Spinner = require("../../../components/spinner");
var CrmRightPanel = require('./views/crm-right-panel');
var ImportCrmTemplate = require('./views/crm-import-template');
var BootstrapButton = require('react-bootstrap').Button;
var BootstrapModal = require('react-bootstrap').Modal;
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
var CrmStore = require("./store/crm-store");
var FilterStore = require("./store/filter-store");
var FilterAction = require("./action/filter-actions");
var CrmAction = require("./action/crm-actions");
var CRMAddForm = require('./views/crm-add-form');
var CrmFilter = require('./views/crm-filter');
var CrmFilterPanel = require('./views/crm-filter-panel');
var CrmBatchChange = require('./views/crm-batch-change');
var CrmRightMergePanel = require('./views/crm-right-merge-panel');
var userData = require("../../../public/sources/user-data");
let OrderAction = require("./action/order-actions");
var batchPushEmitter = require("../../../public/sources/utils/emitters").batchPushEmitter;
// 没有消息的提醒
var NoMoreDataTip = require("../../../components/no_more_data_tip");
var AppUserManage = require("MOD_DIR/app_user_manage/public");
var phoneMsgEmitter = require("PUB_DIR/sources/utils/emitters").phoneMsgEmitter;
import {crmEmitter} from "OPLATE_EMITTER";
import routeList from "MOD_DIR/common/route";
import ajax from "MOD_DIR/common/ajax";
import Trace from "LIB_DIR/trace";
import crmAjax from './ajax/index';
import crmUtil from "./utils/crm-util";
import rightPanelUtil from "CMP_DIR/rightPanel";
const RightPanel = rightPanelUtil.RightPanel;
const extend = require("extend");

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 66 + 56,//表格容器上外边距 + 表头的高度
    BOTTOM_DISTANCE: 30 + 10 * 2,//分页器的高度 + 分页器上下外边距
    SCREEN_WIDTH: 1130,//屏幕宽度小于1130时，右侧操作按钮变成图标
    UPLOAD_MODAL_HEIGHT: 260
};
var rightPanelShow = false;
let UNKNOWN = Intl.get("user.unknown", "未知");
//具备舆情秘书权限
const hasSecretaryAuth = userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);
//其他类型筛选中的选项
const OTHER_FILTER_ITEMS = {
    THIRTY_UNCONTACT: "thirty_uncontact",
    FIFTEEN_UNCONTACT: "fifteen_uncontact",
    SEVEN_UNCONTACT: "seven_uncontact",
    UNDISTRIBUTED: "undistributed",//未分配的客户
    NO_CONTACT_WAY: "no_contact_way",//无联系方式的客户
    LAST_CALL_NO_RECORD: "last_call_no_record",//最后联系但未写跟进记录的客户
    NO_RECORD_OVER_30DAYS: "last_trace",//超30天未写跟进记录的客户
    INTEREST: "interest",//关注的客户
    MULTI_ORDER: "multi_order"//多个订单的客户
};
//标签选项下的特殊标签
const SPECIAL_LABEL = {
    NON_TAGGED_CUSTOMER: Intl.get("crm.tag.unknown", "未打标签的客户"),
    TURN_OUT: Intl.get("crm.qualified.roll.out", "转出"),
    CLUE: Intl.get("crm.sales.clue", "线索")
};
const day = 24 * 60 * 60 * 1000;
const DAY_TIME = {
    THIRTY_DAY: 30 * day,//30天
    FIFTEEN_DAY: 15 * day,//15天
    SEVEN_DAY: 7 * day//7天
};
//默认范围参数
const DEFAULT_RANGE_PARAM = {
    from: "",
    to: "",
    type: "time",
    name: "start_time"
};
//查看是否可以继续添加客户
let member_id = userData.getUserData().user_id;
var Crm = React.createClass({
    getInitialState: function () {
        return {
            callNumber: '', // 座机号
            errMsg: '', // 获取座机号失败的信息
            ...this.getStateData()
        };
    },
    getSelectedCustomer: function (curCustomerList) {
        let selectedCustomer = [];
        if (this.state) {
            if (this.state.selectAllMatched) {//全选时
                selectedCustomer = curCustomerList;
            } else if (this.state.selectedCustomer) {//非全选时
                selectedCustomer = this.state.selectedCustomer;
            }
        }
        return selectedCustomer;
    },
    getStateData: function () {
        var originCustomerList = CrmStore.getCurPageCustomers();
        var list = CrmStore.processForList(originCustomerList);
        var originCustomerListForPagination = CrmStore.getlastCurPageCustomers();
        var listForPagination = CrmStore.processForList(originCustomerListForPagination);
        var _this = this;
        return {
            isLoading: CrmStore.getState().isLoading,//正在获取客户列表
            getErrMsg: CrmStore.getState().getErrMsg,//获取客户列表失败时的提示
            customersSize: CrmStore.getCustomersLength(),
            pageSize: CrmStore.getState().pageSize,
            pageNum: CrmStore.getState().pageNum,
            nextPageNum: CrmStore.getState().nextPageNum,//下次点击的页码
            curPageCustomers: list,//将后端返回的数据转为界面列表所需的数据
            customersBack: listForPagination,//为了便于分页保存的上一次分页成功的数据
            pageNumBack: CrmStore.getState().pageNumBack,//为了便于分页记录上一次分页成功时的页码
            originCustomerList: originCustomerList,//后端返回的客户数据
            rightPanelIsShow: rightPanelShow,
            importAlertShow: false,//是否展示导入结果提示框
            importAlertMessage: "",//导入结果提示框内容
            importAlertType: "",//导入结果提示框类型
            currentId: CrmStore.getState().currentId,
            curCustomer: CrmStore.getState().curCustomer,
            customerId: CrmStore.getState().customerId,
            keyword: $(".search-input").val() || "",
            isAddFlag: _this.state && _this.state.isAddFlag || false,
            batchChangeShow: _this.state && _this.state.batchChangeShow || false,
            selectedCustomer: this.getSelectedCustomer(list),
            sorter: _this.state && _this.state.sorter || {
                field: "start_time",
                order: "descend"
            },
            condition: _this.state && _this.state.condition || {},
            isScrollTop: _this.state && _this.state.isScrollTop || false,
            crmTemplateRightPanelShow: false,// 是否显示导入客户下载模板
            mergePanelIsShow: false,//是否展示合并面板
            mergedCustomer: {}, //合并时要保存的客户
            deleteCusName: '', // 要删除客户的用户名
            rangParams: [DEFAULT_RANGE_PARAM],//时间范围参数
            crmFilterValue: "",
            cursor: true,//向前还是向后翻页
            pageValue: 0,//两次点击时的页数差
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
        };
    },
    setRange: function (obj) {
        if (obj.startTime) {
            this.state.rangParams[0].from = obj.startTime;
        }
        if (obj.endTime) {
            this.state.rangParams[0].to = obj.endTime;
        }
    },
    setStartRange: function (value) {
        this.state.rangParams[0].from = value;
    },
    setEndRange: function (value) {
        this.state.rangParams[0].to = value;
    },
    // 获取拨打电话的座机号
    getUserPhoneNumber() {
        let member_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(member_id).then((result) => {
            if (result.phone_order) {
                this.setState({
                    callNumber: result.phone_order
                });
            }
        }, (errMsg) => {
            this.setState({
                errMsg: errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!")
            });
        });
    },

    componentDidMount: function () {
        //批量更新所属销售
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_SALES, this.batchChangeSalesman);
        //批量转出客户
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_TRANSFER_CUSTOMER, this.batchChangeSalesman);
        //批量更新标签
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_LABELS, this.batchChangeTags);
        //批量添加标签
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_ADD_LABELS, this.batchAddTags);
        //批量移除标签
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_REMOVE_LABELS, this.batchRemoveTags);
        //批量更新行业
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_INDUSTRY, this.batchChangeIndustry);
        //批量更新行政级别
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_LEVEL, this.batchChangeLevel);
        //批量更新地域
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_TERRITORY, this.batchChangeTerritory);
        crmEmitter.on(crmEmitter.IMPORT_CUSTOMER, this.onCustomerImport);
        CrmStore.listen(this.onChange);
        OrderAction.getSysStageList();
        this.getUserPhoneNumber();
        const query = _.clone(this.props.location.query);
        if (query.analysis_filter_field) {
            var filterField = query.analysis_filter_field;
            var filterValue = query.analysis_filter_value;
            filterValue = (filterValue == 'unknown' ? '未知' : filterValue);
            var startTime = parseFloat(query.login_begin_date);
            var endTime = parseFloat(query.login_end_date);
            var currentTime = parseFloat(query.current_date_timestamp);
            var saleStage = query.customerType;
            const filterAppId = query.app_id;
            delete query.analysis_filter_field;
            delete query.analysis_filter_value;
            //设置选中的APP名称
            if (filterAppId.split(',').length > 1) {
                FilterAction.setApp("");
            } else {
                FilterAction.setApp(filterAppId);
            }
            //如果是从新增客户跳转过去
            if (saleStage == 'added') {
                this.setRange({startTime, endTime});
                //如果是趋势图，则只取当前那一天的数据
                if (filterField == 'trend') {
                    startTime = currentTime - 8 * 60 * 60 * 1000;
                    endTime = currentTime + 16 * 60 * 60 * 1000 - 1;
                    this.setRange({startTime, endTime});
                }
            } else {
                //其他三种情况都是累积数据
                startTime = "";
                this.setRange({startTime, endTime});
                if (saleStage !== 'total') {
                    //成交阶段或者执行阶段跳转过来的
                    saleStage = (saleStage == 'dealed') ? "成交阶段" : "执行阶段";
                    FilterAction.setStage(saleStage);
                }
                if (filterField == 'trend') {
                    //趋势图的结束时间为当前选中那一天的结束时间
                    endTime = currentTime + 16 * 60 * 60 * 1000 - 1;
                    this.setEndRange(endTime);
                }
            }
            this.setFilterField({filterField, filterValue});

        } else {
            this.search();
        }
        this.changeTableHeight();
        $(window).on("resize", e => this.changeTableHeight());
        var _this = this;
        //点击客户列表某一行时打开对应的详情
        $(".tbody").on("click", "td.has-filter", function (e) {
            //td中的表示关注的星星元素不能触发打开右侧面板的事件
            if ($(e.target).hasClass("focus-customer")) {
                return;
            }
            Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-tbody"), "打开客户详情");
            var $tr = $(this).closest("tr");
            var id = $tr.find(".record-id").text();
            _this.showRightPanel(id);
        });
        //点击表头时关闭详情区
        $(this.refs.crmList).on("click", "thead .has-filter", function () {
            if (_this.state.rightPanelIsShow) {
                _this.hideRightPanel();
            }
        });
        //如果从url跳转到该页面，并且有add=true，则打开右侧面板
        if (this.props.location.query.add === 'true') {
            this.showAddForm();
        }
    },
    setFilterField: function ({filterField, filterValue}) {
        //展示的团队列表
        if (filterField == 'team') {
            FilterAction.getTeamList((teams) => {
                const team = _.find(teams, item => item.group_name === filterValue);
                const teamId = team && team.group_id || "";
                FilterAction.setTeam(teamId);
                this.search();
            });
        } else {
            //地域
            if (filterField == 'zone') {
                FilterAction.setProvince(filterValue);
            }
            //销售阶段
            if (filterField == 'stage') {
                FilterAction.setStage(filterValue);
            }
            //行业
            if (filterField == 'industry') {
                FilterAction.setIndustry(filterValue);
            }
            //舆情秘书看到的团队成员列表
            if (filterField == 'team_member') {
                FilterAction.setInputCondition({user_name: filterValue});
                this.state.crmFilterValue = filterValue;
            }
            this.search();
        }
    },
    componentDidUpdate: function () {
        if (this.state.isScrollTop) {
            this.scrollTop();
        }
        //若列表有数据且列表数据为全部数据且未显示“没有更多数据了”的提示
        //根据是否有滚动条决定是否显示“没有更多数据了”的提示
        if (this.state.customersSize && this.state.curPageCustomers.length === this.state.customersSize && !this.state.isNoMoreTipShow) {
            //滚动条区域容器
            const scrollWrap = $(".tbody .gm-scroll-view");
            //滚动条区域内容
            const scrollContent = scrollWrap.children();

            //若内容高度大于容器高度，说明已显示滚动条
            if (scrollContent.height() > scrollWrap.height()) {
                //显示“没有更多数据了”的提示
                this.setState({isNoMoreTipShow: true}, () => {
                    //将控制是否显示“没有更多数据了”提示的标识设为假，
                    //以使组件下次更新完成时能再做这个检测
                    this.state.isNoMoreTipShow = false;
                });
            }
        }
    },
    componentWillUnmount: function () {
        clearTimeout(this.batchRenderTimeout);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_SALES, this.batchChangeSalesman);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_TRANSFER_CUSTOMER, this.batchChangeSalesman);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_LABELS, this.batchChangeTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_ADD_LABELS, this.batchAddTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_REMOVE_LABELS, this.batchRemoveTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_INDUSTRY, this.batchChangeIndustry);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_LEVEL, this.batchChangeLevel);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_TERRITORY, this.batchChangeTerritory);
        crmEmitter.removeListener(crmEmitter.IMPORT_CUSTOMER, this.onCustomerImport);
        $(window).off("resize", this.changeTableHeight);
        //将store中的值设置初始值
        CrmAction.setInitialState();
        CrmStore.unlisten(this.onChange);
        this.hideRightPanel();
    },

    onChange: function () {
        var state = this.getStateData();
        this.setState(state, () => {
            //全选状态下，头部的全选按钮没有选中时，手动设置选中
            if (this.state.selectAllMatched && !$(".ant-table-header .ant-table-selection-column .ant-checkbox-input").parent().hasClass("ant-checkbox-checked")) {
                $(".ant-table-header .ant-table-selection-column .ant-checkbox-input").trigger("click");
            }
        });
        $(".total").show();

    },
    //批量操作渲染延迟的timeout
    batchRenderTimeout: null,
    //渲染批量操作
    delayRenderBatchUpdate: function () {
        clearTimeout(this.batchRenderTimeout);
        this.batchRenderTimeout = setTimeout(() => {
            var state = this.getStateData();
            this.setState(state);
        }, 100);
    },
    //批量变更销售人员的处理,调用store进行数据更新
    batchChangeSalesman: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeSalesman({taskInfo, taskParams, curCustomers});
        this.delayRenderBatchUpdate();
    },
    //批量变更标签的处理,调用store进行数据更新
    batchChangeTags: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTags({taskInfo, taskParams, curCustomers}, "change");
        this.delayRenderBatchUpdate();
    },
    //批量添加标签的处理,调用store进行数据更新
    batchAddTags: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTags({taskInfo, taskParams, curCustomers}, "add");
        this.delayRenderBatchUpdate();
    },
    //批量移除标签的处理,调用store进行数据更新
    batchRemoveTags: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTags({taskInfo, taskParams, curCustomers}, "remove");
        this.delayRenderBatchUpdate();
    },
    //批量变更行业的处理,调用store进行数据更新
    batchChangeIndustry: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeIndustry({taskInfo, taskParams, curCustomers});
        this.delayRenderBatchUpdate();
    },
    //批量变更行政级别的处理,调用store进行数据更新
    batchChangeLevel: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeLevel({taskInfo, taskParams, curCustomers});
        this.delayRenderBatchUpdate();
    },
    //批量变更地域的处理,调用store进行数据更新
    batchChangeTerritory: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTerritory({taskInfo, taskParams, curCustomers});
        this.delayRenderBatchUpdate();
    },
    changeTableHeight: function (filterPanelHeight = 0) {
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        tableHeight -= filterPanelHeight;
        this.setState({tableHeight, filterPanelHeight});
    },
    confirmDelete: function (cusId, cusName) {
        Trace.traceEvent($(this.getDOMNode()).find(".cus-op"), "删除客户");
        this.state.currentId = cusId;
        this.state.deleteCusName = cusName;
        this.state.showDeleteConfirm = true;
        this.setState(this.state);
    }
    , hideDeleteModal: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-cancel"), "关闭删除客户的确认模态框");
        this.state.showDeleteConfirm = false;
        this.setState(this.state);
    }
    , deleteCustomer: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "确定删除客户");
        this.hideDeleteModal();
        const ids = [this.state.currentId];
        CrmAction.deleteCustomer(ids);
    }
    , refreshCustomerList: function (customerId) {
        this.state.selectedCustomer = [];
        setTimeout(() => {
            CrmAction.refreshCustomerList(customerId);
        }, 1000);
    }
    , editOne: function (index, name) {
        this.state.rightPanelIShow = true;
    }
    , showRightPanel: function (id) {
        //舆情秘书角色不让看详情
        if (hasSecretaryAuth) {
            return;
        }

        rightPanelShow = true;
        CrmAction.setCurrentCustomer(id);
    }
    , hideRightPanel: function () {
        this.state.rightPanelIsShow = false;
        rightPanelShow = false;
        this.setState(this.state);
        $(".ant-table-row").removeClass("current-row");
    }
    , addOne: function (customer) {
        this.state.isAddFlag = false;
        this.state.isScrollTop = true;
        this.setState(this.state);
    }
    , showAddForm: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".handle-btn-container"), "点击添加客户按钮");
        this.state.isAddFlag = true;
        this.setState(this.state);
    }
    , hideAddForm: function () {
        this.state.isAddFlag = false;
        this.setState(this.state);
    }
    //查询客户
    //reset参数若为true，则重新从第一页获取
    , search: function (reset) {
        const filterStoreCondition = JSON.parse(JSON.stringify(FilterStore.getState().condition));
        const condition = _.extend({}, filterStoreCondition, FilterStore.getState().inputCondition);
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(condition);
        //保存当前查询条件，批量变更的时候会用到
        this.state.condition = condition;

        //当重置标志为true时，重新从第一页加载，并重置客户列表
        if (reset) {
            this.state.customerId = "";
            CrmAction.setCustomerId("");
            //清除客户的选择
            this.clearSelectedCustomer();
            //将分页器默认选中为第一页
            CrmAction.setPageNum(1);
            //清空state上的nextPageNum，避免显示上次的nextPageNum
            CrmAction.setNextPageNum(1);
        }
        //联系方式(电话、邮箱)搜索的处理
        if (condition.phone) {
            condition.contacts = [{phone: [condition.phone]}];
            delete condition.phone;
        }
        if (condition.email) {
            condition.contacts = [{email: [condition.email]}];
            delete condition.email;
        }
        let term_fields = [];//需精确匹配的字段
        //未知行业,未知地域,未知销售阶段（未展示），未知联系方式(未展示)等处理
        let unexist = [];//存放未知行业、未知地域的数组
        if (condition.industry && condition.industry.length) {
            //未知行业的处理
            if (condition.industry.indexOf(UNKNOWN) != -1) {
                unexist.push("industry");
                delete condition.industry;
            } else {//需精确匹配
                term_fields.push("industry");
            }
        }
        var saleStage = '';
        if (condition.sales_opportunities && _.isArray(condition.sales_opportunities) && condition.sales_opportunities.length != 0) {
            saleStage = condition.sales_opportunities[0].sale_stages;
        }
        if (saleStage && saleStage == UNKNOWN) {
            //未知销售阶段的处理
            condition.contain_sales_opportunity = "false";
            delete condition.sales_opportunities;
        }
        //未知地域的处理
        if (condition.province) {
            if (condition.province == UNKNOWN) {
                unexist.push("province");
                delete condition.province;
            } else {//需精确匹配
                term_fields.push("province");
            }
        }
        //阶段标签的处理
        if (condition.customer_label) {
            if (condition.customer_label === crmUtil.CUSTOMER_TAGS.QUALIFIED ||
                condition.customer_label === crmUtil.CUSTOMER_TAGS.TRIAL_QUALIFIED ||
                condition.customer_label === crmUtil.CUSTOMER_TAGS.SIGN_QUALIFIED) {
                //合格标签的筛选
                condition.qualify_label = "1";
                if (condition.customer_label === crmUtil.CUSTOMER_TAGS.QUALIFIED) {//只筛选”合格“时
                    delete condition.customer_label;
                } else {//试用合格、签约合格的筛选时，是试用、签约标签与合格标签的组合筛选
                    //试用、签约的处理(精确匹配)
                    condition.customer_label = condition.customer_label.split(crmUtil.CUSTOMER_TAGS.QUALIFIED)[0];
                    term_fields.push("customer_label");
                }
            } else if (condition.customer_label === crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED) {
                //曾经合格的处理
                condition.qualify_label = "2";
                delete condition.customer_label;
            } else {//信息、意向、试用、签约、流失
                term_fields.push("customer_label");
            }
        } else {//删除上次筛选时的数据
            delete condition.qualify_label;
        }
        //销售角色的处理
        if (condition.member_role) {
            term_fields.push("member_role");
        }
        //标签的处理
        if (_.isArray(condition.labels) && condition.labels.length) {
            //未打标签的客户筛选处理
            if (_.contains(condition.labels, SPECIAL_LABEL.NON_TAGGED_CUSTOMER)) {
                unexist.push("labels");
                delete condition.labels;
            } else {
                //线索、转出不可操作标签的筛选处理
                if (_.contains(condition.labels, SPECIAL_LABEL.CLUE) || _.contains(condition.labels, SPECIAL_LABEL.TURN_OUT)) {
                    condition.immutable_labels = [];
                    //线索标签
                    if (_.contains(condition.labels, SPECIAL_LABEL.CLUE)) {
                        condition.immutable_labels.push(SPECIAL_LABEL.CLUE);
                        //过滤掉线索标签
                        condition.labels = _.filter(condition.labels, label => label !== SPECIAL_LABEL.CLUE);
                    }
                    //转出标签
                    if (_.contains(condition.labels, SPECIAL_LABEL.TURN_OUT)) {
                        condition.immutable_labels.push(SPECIAL_LABEL.TURN_OUT);
                        //过滤掉转出标签
                        condition.labels = _.filter(condition.labels, label => label !== SPECIAL_LABEL.TURN_OUT);
                    }
                    term_fields.push("immutable_labels");//精确匹配
                }
                //剩下普通标签的筛选
                if (condition.labels.length == 0) {
                    delete condition.labels;
                } else {
                    term_fields.push("labels");
                }
            }
        }
        //竞品,精确匹配
        if (condition.competing_products && condition.competing_products.length) {
            term_fields.push("competing_products");
        }
        var queryObj = {
            total_size: this.state.pageSize * this.state.pageValue,
            cursor: this.state.cursor,
            id: this.state.customerId
        };
        //其他筛选
        let dayTime = "";
        //超xxx天未联系客户
        switch (condition.otherSelectedItem) {
            case OTHER_FILTER_ITEMS.THIRTY_UNCONTACT://超30天未联系的客户
                dayTime = DAY_TIME.THIRTY_DAY;
                break;
            case  OTHER_FILTER_ITEMS.FIFTEEN_UNCONTACT://超15天未联系的客户
                dayTime = DAY_TIME.FIFTEEN_DAY;
                break;
            case OTHER_FILTER_ITEMS.SEVEN_UNCONTACT://超7天未联系的客户
                dayTime = DAY_TIME.SEVEN_DAY;
                break;
            case OTHER_FILTER_ITEMS.NO_CONTACT_WAY://无联系方式的客户
                condition.contain_contact = "false";
                break;
            case OTHER_FILTER_ITEMS.LAST_CALL_NO_RECORD://最后联系但未写跟进记录的客户
                condition.call_and_remark = "1";
                break;
            case OTHER_FILTER_ITEMS.NO_RECORD_OVER_30DAYS://超30天未写跟进记录的客户
                condition.last_trace = "0";
                break;
            case OTHER_FILTER_ITEMS.UNDISTRIBUTED://未分配销售的客户
                unexist.push("member_id");
                break;
            case OTHER_FILTER_ITEMS.INTEREST://关注的客户
                condition.interest = "true";
                break;
            case OTHER_FILTER_ITEMS.MULTI_ORDER://多个订单的客户
                this.state.rangParams[0] = {
                    from: 2,
                    name: "sales_opportunity_count",
                    type: "long",
                };
                break;
        }
        //超xx天未联系的客户过滤需传的参数
        if (dayTime) {
            this.state.rangParams[0] = {
                to: moment().valueOf() - dayTime,
                name: "last_contact_time",
                type: "time"
            };
        } else if (condition.otherSelectedItem !== OTHER_FILTER_ITEMS.MULTI_ORDER) {
            //不是超xx天未联系的客户、也不是多个订单客户的过滤时，传默认的设置
            this.state.rangParams[0] = DEFAULT_RANGE_PARAM;
        }
        if (unexist.length > 0) {
            condition.unexist_fields = unexist;
        }
        if (term_fields.length > 0) {//需精确匹配的字段
            condition.term_fields = term_fields;
        }
        delete condition.otherSelectedItem;
        CrmAction.queryCustomer(condition, this.state.rangParams, this.state.pageSize, this.state.sorter, queryObj);
        this.setState({rangeParams: this.state.rangParams});
    },
    //清除客户的选择
    clearSelectedCustomer: function () {
        this.state.selectedCustomer = [];
        this.state.selectAllMatched = false;
        this.setState(this.state);
    },
    onTableChange: function (pagination, filters, sorter) {
        this.setState({
            isScrollTop: true
        });
        let sorterChanged = false;
        let filterChanged = this.state.filterChanged;

        if (!_.isEmpty(sorter) && (sorter.field !== this.state.sorter.field || sorter.order !== this.state.sorter.order)) {
            sorterChanged = true;
        }

        if (!filterChanged && !sorterChanged) return;

        if (filterChanged) this.state.filterChanged = false;

        if (sorterChanged) {
            this.state.sorter = sorter;
        }
        this.setState(this.state, () => {
            this.search(true);
        });
    },
    showCrmTemplateRightPanel: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".handle-btn-container"), "点击导入客户按钮");
        this.setState({
            crmTemplateRightPanelShow: true
        });
    },
    //处理选中行的样式
    handleRowClassName: function (record, index) {
        if ((record.id == this.state.currentId) && rightPanelShow) {
            return "current-row";
        }
        else {
            return "";
        }
    },
    closeCrmTemplatePanel: function () {
        this.setState({
            crmTemplateRightPanelShow: false
        });
    },

    selectAllSearchResult: function () {
        this.state.selectAllMatched = true;
        this.state.selectedCustomer = this.state.curPageCustomers.slice();
        this.setState(this.state);
    },

    clearSelectAllSearchResult: function () {
        this.state.selectedCustomer = [];
        this.state.selectAllMatched = false;
        this.setState(this.state, () => {
            $("th.ant-table-selection-column input").click();
        });
    },

    scrollTop: function () {
        $(this.refs.tableWrap.getDOMNode()).find(".ant-table-scroll div.ant-table-body").scrollTop(0);
        this.setState({isScrollTop: false});
    },
    showMergePanel: function () {
        if (_.isArray(this.state.selectedCustomer) && this.state.selectedCustomer.length > 1) {
            this.setState({mergePanelIsShow: true});
            Trace.traceEvent($(this.getDOMNode()).find(".handle-btn-container"), "点击合并客户按钮");
        }
    },
    hideMergePanel: function () {
        this.setState({mergePanelIsShow: false});
    },
    //合并客户后的处理
    afterMergeCustomer: function (mergeObj) {
        this.setState({selectedCustomer: [], mergePanelIsShow: false});//清空选择的客户
        CrmAction.afterMergeCustomer(mergeObj);
    },
    //渲染操作按钮
    renderHandleBtn: function () {
        let isWebMini = $(window).width() < LAYOUT_CONSTANTS.SCREEN_WIDTH;//浏览器是否缩小到按钮展示改成图标展示
        let btnClass = "block ";
        btnClass += isWebMini ? "handle-btn-mini" : "handle-btn-container";
        if (this.state.selectedCustomer.length) {
            //选择客户后，展示合并和批量变更的按钮
            return (<div>
                <PrivilegeChecker
                    check="CUSTOMER_MERGE_CUSTOMER"
                    className={btnClass}
                    title={isWebMini ? Intl.get("crm.0", "合并客户") : ""}
                    onClick={this.showMergePanel}
                >
                    {isWebMini ? <i className="iconfont icon-merge-btn"/> : Intl.get("crm.0", "合并客户")}
                </PrivilegeChecker>
                <PrivilegeChecker check="CUSTOMER_BATCH_OPERATE">
                    <CrmBatchChange isWebMini={isWebMini}
                                    currentId={this.state.currentId}
                                    hideBatchChange={this.hideBatchChange}
                                    refreshCustomerList={this.refreshCustomerList}
                                    selectedCustomer={this.state.selectedCustomer}
                                    selectAllMatched={this.state.selectAllMatched}
                                    matchedNum={this.state.customersSize}
                                    condition={this.state.condition}
                    />
                </PrivilegeChecker>
            </div>);
        } else {
            return (<div>
                <PrivilegeChecker
                    check="CRM_REPEAT"
                    className={btnClass + " customer-repeat-btn"}
                    title={isWebMini ? Intl.get("crm.1", "客户查重") : ""}
                    onClick={this.props.showRepeatCustomer}
                >
                    {isWebMini ? <i className="iconfont icon-search-repeat"/> : Intl.get("crm.1", "客户查重")}
                </PrivilegeChecker>
                <PrivilegeChecker
                    check="CUSTOMER_ADD"
                    className={btnClass}
                    title={isWebMini ? Intl.get("crm.2", "导入客户") : ""}
                    onClick={this.showCrmTemplateRightPanel}
                >
                    {isWebMini ? <i className="iconfont icon-import-btn"/> : Intl.get("crm.2", "导入客户")}
                </PrivilegeChecker>
                <PrivilegeChecker
                    check="CUSTOMER_ADD"
                    className={btnClass}
                    title={isWebMini ? Intl.get("crm.3", "添加客户") : ""}
                    onClick={this.showAddForm}>
                    {isWebMini ? <Icon type="plus"/> : Intl.get("crm.3", "添加客户")}
                </PrivilegeChecker>
            </div>);
        }
    },
    showNoMoreDataTip: function () {
        return this.state.isNoMoreTipShow;
    },
    onCustomerImport(list) {
        let member_id = userData.getUserData().user_id;
        //导入客户前先校验，是不是超过了本人的客户上限
        CrmAction.getCustomerLimit({member_id:member_id,num: list.length}, (result)=>{
            if (_.isNumber(result)){
                if (result == 0){
                    //可以转入
                    this.setState({
                        isPreviewShow: true,
                        previewList: CrmStore.processForList(list),
                    })
                }else if(result > 0){
                    //不可以转入
                    message.warn(Intl.get("crm.import.over.limit","导入客户后会超过您拥有客户的上限，请您减少{num}个客户后再导入",{num: result}));
                }
            }
        });
    },
    confirmImport(flag, cb) {
        this.setState({isImporting: true});

        const route = _.find(routeList, route => route.handler === "uploadCustomerConfirm");

        const params = {
            flag: flag,
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };

        ajax(arg).then(result => {
            this.setState({isImporting: false});

            if (_.isFunction(cb)) cb();
        }, () => {
            this.setState({isImporting: false});

            message.error(Intl.get("crm.99", "导入客户失败"));
        });
    },
    doImport() {
        this.confirmImport(true, () => {
            this.setState({
                isPreviewShow: false,
            });
            message.success(Intl.get("crm.98", "导入客户成功"));
            //刷新客户列表
            this.search();
        });
    },
    cancelImport() {
        this.setState({
            isPreviewShow: false,
        });

        this.confirmImport(false);
    },
    renderImportModalFooter() {
        const repeatCustomer = _.find(this.state.previewList, item => (item.name_repeat || item.phone_repeat));
        const loading = this.state.isImporting || false;

        return (
            <div>
                {repeatCustomer ? (
                    <span className="import-warning">
                        {Intl.get("crm.210", "存在和系统中重复的客户名或联系方式，已用红色标出，请先在上方预览表格中删除这些记录，然后再导入")}
                    </span>
                ) : null}
                <Button type="ghost" onClick={this.cancelImport}>
                    {Intl.get("common.cancel", "取消")}
                </Button>
                {!repeatCustomer ? (
                    <Button type="primary" onClick={this.doImport} loading={loading}>
                        {Intl.get("common.sure", "确定") + Intl.get("common.import", "导入")}
                    </Button>
                ) : null}
            </div>
        );
    },

    // 自动拨号
    handleClickCallOut(phoneNumber, record) {
        Trace.traceEvent($(this.getDOMNode()).find(".column-contact-way"), "拨打电话");
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get("crm.get.phone.failed", "获取座机号失败!"));
        } else {
            if (this.state.callNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        phoneNum: phoneNumber.replace('-', ''),
                        contact: record.contact,
                        customerDetail: record,//客户基本信息
                    }
                );
                let reqData = {
                    from: this.state.callNumber,
                    to: phoneNumber.replace('-', '')
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code == 0) {
                        message.success(Intl.get("crm.call.phone.success", "拨打成功"));
                    }
                }, (errMsg) => {
                    message.error(errMsg || Intl.get("crm.call.phone.failed", "拨打失败"));
                });
            } else {
                message.error(Intl.get("crm.bind.phone", "请先绑定分机号！"));
            }
        }
    },

    // 联系方式的列表
    getContactList(text, record, index) {
        let phoneArray = text && text.split('\n') || [];
        let className = record.phone_repeat ? "customer-repeat" : "";
        var phoneList = phoneArray.map((item) => {
            if (item) {
                return (
                    <div>
                        <span>{item}</span>
                        {this.state.callNumber ? <i className="iconfont icon-call-out call-out"
                                                    title={Intl.get("crm.click.call.phone", "点击拨打电话")}
                                                    onClick={this.handleClickCallOut.bind(this, item, record)}></i> : null}
                    </div>
                );
            }
        });
        return (
            <div className={className}>
                {phoneList}
            </div>
        );
    },
    ShowCustomerUserListPanel: function (data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });

    },
    closeCustomerUserListPanel: function () {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },
    onPageChange: function (page) {
        Trace.traceEvent($(this.getDOMNode()).find(".antc-table .ant-table-wrapper"), "翻页至第" + page + "页");
        var currPageNum = this.state.pageNumBack;
        var curCustomerList = this.state.customersBack;
        if (page == currPageNum) {
            return;
        } else {
            let selectedCustomer = this.state.selectedCustomer;
            //不是全选时，清空翻页前选择的客户
            if (_.isArray(selectedCustomer) && selectedCustomer.length && !this.state.selectAllMatched) {
                this.state.selectedCustomer = [];
                this.setState({selectedCustomer: []});
            }
            //设置要跳转到的页码数值
            CrmAction.setNextPageNum(page);
            var pageValue = 0, cursor = true, customerId = "";
            if (page > currPageNum) {
                //向后翻页
                pageValue = page - currPageNum;
                customerId = _.last(curCustomerList).id;
            } else {
                //向前翻页
                if (page != "1") {
                    pageValue = currPageNum - page;
                    cursor = false;
                    customerId = _.first(curCustomerList).id;
                }
            }
            this.setState({
                pageValue: pageValue,
                cursor: cursor,
                customerId: customerId,
            }, () => {
                this.search();
            });
        }
    },

    handleFocusCustomer: function (record) {
        //请求数据
        let interestObj = {
            id: record.id,
            type: "customer_interest",
        };
        if (record.interest == "true") {
            interestObj.interest = "false";
        } else {
            interestObj.interest = "true";
        }
        //先更改星星的颜色,再发请求，这样页面不会显的比较卡
        var customerArr = _.find(this.state.curPageCustomers, (customer) => {
            return record.id == customer.id;
        });
        if (customerArr) {
            customerArr.interest = interestObj.interest;
        }

        this.setState(
            {curPageCustomers: this.state.curPageCustomers}
        );
        CrmAction.updateCustomer(interestObj, (errorMsg) => {
            if (errorMsg) {
                //将星星的颜色修改回原来的状态
                if (customerArr) {
                    customerArr.interest = interestObj.interest == 'true' ? 'false' : 'true';
                }
                this.setState(
                    {curPageCustomers: this.state.curPageCustomers}
                );
            }
        });
    },
    //渲染选择客户数的提示
    renderSelectCustomerTips: function () {
        //选择全部选项后，展示：已选择全部xxx项，<a>只选当前项</a>
        if (this.state.selectAllMatched) {
            return (
                <span>
                    {Intl.get("crm.8", "已选择全部{count}项", {count: this.state.customersSize})}
                    <a href="javascript:void(0)"
                       onClick={this.clearSelectAllSearchResult}>{Intl.get("crm.10", "只选当前展示项")}</a>
                </span>);
        } else {//只选择了当前页时，展示：已选当前页xxx项, <a>选择全部xxx项</a>
            return (
                <span>
                    {Intl.get("crm.11", "已选当前页{count}项", {count: this.state.selectedCustomer.length})}
                    {/*在筛选条件下可 全选 ，没有筛选条件时，后端接口不支持选 全选*/}
                    {_.isEmpty(this.state.condition) ? null : (
                        <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>
                            {Intl.get("crm.12", "选择全部{count}项", {count: this.state.customersSize})}
                        </a>)
                    }
                </span>);
        }
    },

    //删除导入预览中的重复客户
    deleteDuplicatImportCustomer(index) {
        const route = _.find(routeList, route => route.handler === "deleteDuplicatImportCustomer");

        const params = {
            index
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };

        ajax(arg).then(result => {
            if (result && result.result === "success") {
                this.state.previewList.splice(index, 1);
                this.setState(this.state);
            } else {
                message.error(Intl.get("crm.delete.duplicate.customer.failed", "删除重复客户失败"));
            }
        }, () => {
            message.error(Intl.get("crm.delete.duplicate.customer.failed", "删除重复客户失败"));
        });
    },

    render: function () {
        var _this = this;
        //只有有批量变更和合并客户的权限时，才展示选择框的处理
        let showSelectionFlag = hasPrivilege("CUSTOMER_MERGE_CUSTOMER") || hasPrivilege("CUSTOMER_BATCH_OPERATE");
        let rowSelection = showSelectionFlag ? {
            type: 'checkbox',
            selectedRowKeys: _.pluck(this.state.selectedCustomer, "id"),
            onSelect: function (record, selected, selectedRows) {
                //如果一开始批量选择了全部，后来又取消了，则去掉选择全部
                if (selectedRows.length !== _this.state.curPageCustomers.length) {
                    _this.state.selectAllMatched = false;
                }
                _this.state.selectedCustomer = selectedRows;
                _this.setState(_this.state);
                Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-selection-column"), "点击选中/取消选中某个客户");
            },
            //对客户列表当前页进行全选或取消全选操作时触发
            onSelectAll: function (selected, selectedRows, changeRows) {
                if (_this.state.selectAllMatched && selectedRows.length === 0) {
                    _this.state.selectAllMatched = false;
                }
                _this.setState({selectedCustomer: selectedRows, selectAllMatched: _this.state.selectAllMatched});
                Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-selection-column"), "点击选中/取消选中全部客户");
            }
        } : null;

        function rowKey(record, index) {
            return record.id;
        }

        const column_width = "90px";
        var columns = [
            {
                title: Intl.get("crm.4", "客户名称"),
                width: '240px',
                dataIndex: 'name',
                className: 'has-filter',
                sorter: true,
                render: function (text, record, index) {
                    var tagsArray = _.isArray(record.labels) ? record.labels : [];
                    //线索、转出标签不可操作的标签，在immutable_labels属性中，和普通标签一起展示
                    if (_.isArray(record.immutable_labels) && record.immutable_labels.length) {
                        tagsArray = record.immutable_labels.concat(tagsArray);
                    }
                    var tags = tagsArray.map(function (tag, index) {
                        return (<Tag key={index}>{tag}</Tag>);
                    });

                    const className = record.name_repeat ? "customer-repeat customer_name" : "customer_name";
                    var interestClassName = "iconfont focus-customer";
                    interestClassName += (record.interest == "true" ? " icon-interested" : " icon-uninterested");
                    var title = (record.interest == "true" ? Intl.get("crm.customer.uninterested", "取消关注") : Intl.get("crm.customer.interested", "添加关注"));
                    return (
                        <span>
                            <div className={className}>
                                <i className={interestClassName} title={title}
                                   onClick={_this.handleFocusCustomer.bind(this, record)}></i>
                                {record.customer_label ? (
                                    <Tag
                                        className={crmUtil.getCrmLabelCls(record.customer_label)}>
                                        {record.customer_label}</Tag>) : null
                                }
                                {record.qualify_label ? (
                                    <Tag className={crmUtil.getCrmLabelCls(record.qualify_label)}>
                                        {record.qualify_label == 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                                            record.qualify_label == 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ""}</Tag>) : null
                                }
                                {text}
                            </div>
                            {tags.length ?
                                <div className="customer-list-tags">
                                    {tags}
                                </div>
                                : null}
                            <span className="hidden record-id">{record.id}</span>
                        </span>
                    );
                }
            },
            {
                title: Intl.get("call.record.contacts", "联系人"),
                width: column_width,
                dataIndex: 'contact',
                className: 'has-filter',
            },
            {
                title: Intl.get("crm.5", "联系方式"),
                width: '130px',
                dataIndex: 'contact_way',
                className: 'column-contact-way  table-data-align-right',
                render: (text, record, index) => {
                    return this.getContactList(text, record, index);
                }
            },

            {
                title: Intl.get("user.apply.detail.order", "订单"),
                width: column_width,
                dataIndex: 'order',
                className: 'has-filter'
            },
            {
                title: Intl.get("crm.6", "负责人"),
                width: column_width,
                dataIndex: 'user_name',
                sorter: true,
                className: 'has-filter'
            },
            {
                title: Intl.get("crm.last.contact", "最后联系"),
                width: hasSecretaryAuth ? '150px' : '240px',
                dataIndex: 'last_contact_time',
                sorter: true,
                className: 'has-filter',
                render: function (text, record, index) {
                    //最后联系时间和跟进记录的合并
                    let time = record.last_contact_time ? record.last_contact_time : "";
                    let last_contact = "";
                    //舆情秘书不展示跟进记录
                    if (!hasSecretaryAuth && record.trace) {
                        last_contact = record.trace;
                    }
                    return (
                        <span>
                            <div className="last-contact-time">{time}</div>
                            <span title={last_contact} className="comments-fix">{last_contact} </span>
                        </span>
                    );
                }
            },
            {
                title: Intl.get("member.create.time", "创建时间"),
                width: "100px",
                dataIndex: 'start_time',
                sorter: true,
                className: 'has-filter table-data-align-right'
            },
            {
                title: Intl.get("common.operate", "操作"),
                width: '60px',
                render: (text, record, index) => {
                    //是否是重复的客户
                    const isRepeat = record.name_repeat || record.phone_repeat;
                    //是否处于导入预览状态
                    const isPreview = this.state.isPreviewShow;
                    //是否在客户列表上可以删除
                    const canDeleteOnCrmList = !isPreview && hasPrivilege("CRM_DELETE_CUSTOMER");
                    //是否在导入预览列表上可以删除
                    const canDeleteOnPreviewList = isPreview && isRepeat;
                    //是否显示删除按钮
                    const isDeleteBtnShow = canDeleteOnCrmList || canDeleteOnPreviewList;

                    return (
                        <span className="cus-op">
                            {isDeleteBtnShow ? (
                                <Button className="order-btn-class" icon="delete"
                                        onClick={isRepeat ? _this.deleteDuplicatImportCustomer.bind(_this, index) : _this.confirmDelete.bind(null, record.id, record.name)}
                                        title={Intl.get("common.delete", "删除")}/>
                            ) : null}
                        </span>
                    );
                }
            }
        ];

        let previewColumns = [];

        if (this.state.isPreviewShow) {
            previewColumns = extend([], columns);
            //导入预览表格中去掉最后联系列
            previewColumns = _.filter(previewColumns, column => column.dataIndex !== "last_contact_time");
            let remarksColumn = _.find(previewColumns, column => column.dataIndex === "remarks");

            if (!remarksColumn) {
                remarksColumn = {
                    dataIndex: "remarks",
                    title: Intl.get("common.remark", "备注"),
                };
                //添加备注列
                previewColumns.splice(-1, 0, remarksColumn);
            }
        }

        //只对域管理员开放删除功能
        if (!userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            columns = _.filter(columns, column => column.title != Intl.get("common.operate", "操作"));
        }
        const tableScrollX = hasSecretaryAuth ? 1000 : 1080;
        //初始加载，客户列表数据还没有取到时，不显示表格
        const shouldTableShow = (this.state.isLoading && !this.state.curPageCustomers.length) ? false : true;
        let selectCustomerLength = this.state.selectedCustomer.length;
        return (<RightContent>
            <div className="crm_content" data-tracename="客户列表">
                <FilterBlock>
                    {selectCustomerLength ? (
                        <div className="crm-list-selected-tip">
                            <span className="iconfont icon-sys-notice"/>
                            {this.renderSelectCustomerTips()}
                        </div>
                    ) : null}
                    <div style={{display: selectCustomerLength ? 'none' : 'block'}}>
                        <CrmFilter
                            ref="crmFilter"
                            search={this.search.bind(this, true)}
                            changeTableHeight={this.changeTableHeight}
                            crmFilterValue={this.state.crmFilterValue}
                        />
                    </div>
                    {this.renderHandleBtn()}
                    <div className="filter-block-line"></div>
                </FilterBlock>
                {this.state.isAddFlag ? (
                    <CRMAddForm
                        hideAddForm={this.hideAddForm}
                        addOne={this.addOne}
                        showRightPanel={this.showRightPanel}
                    />
                ) : null}
                {FilterStore.getState().isPanelShow ? (
                    <div style={{display: selectCustomerLength ? 'none' : 'block'}}>
                        <CrmFilterPanel
                            search={this.search.bind(this, true)}
                            filterPanelHeight={this.state.filterPanelHeight}
                            changeTableHeight={this.changeTableHeight}
                        />
                    </div>
                ) : null}
                <div id="content-block" className="content-block splice-table" ref="crmList"
                     style={{display: shouldTableShow ? "block" : "none"}}>
                    <div className="tbody"
                         ref="tableWrap"
                         style={{height: this.state.tableHeight + "!important"}}
                    >
                        <AntcTable
                            rowSelection={rowSelection}
                            rowKey={rowKey}
                            columns={columns}
                            loading={this.state.isLoading}
                            rowClassName={this.handleRowClassName}
                            dataSource={this.state.curPageCustomers}
                            util={{zoomInSortArea: true}}
                            pagination={{
                                total: this.state.customersSize,
                                showTotal: total => Intl.get("crm.207", "共{count}个客户", {count: total}),
                                pageSize: this.state.pageSize,
                                onChange: this.onPageChange,
                                current: this.state.pageNum
                            }}
                            onChange={this.onTableChange}
                            scroll={{x: tableScrollX, y: this.state.tableHeight}}
                            locale={{
                                emptyText: !this.state.isLoading ? (this.state.getErrMsg ? this.state.getErrMsg : Intl.get("common.no.data", "暂无数据")) : ""
                            }}
                        />
                        <NoMoreDataTip
                            fontSize="12"
                            show={this.showNoMoreDataTip}
                        />
                    </div>
                </div>
                {this.state.isLoading && this.state.nextPageNum == 0 ? (
                    <div className="table-loading-wrap">
                        <Spinner />
                    </div>
                ) : null}
                <ImportCrmTemplate
                    showFlag={this.state.crmTemplateRightPanelShow}
                    refreshCustomerList={this.search.bind(this, true)}
                    closeCrmTemplatePanel={this.closeCrmTemplatePanel}
                />

                {this.state.mergePanelIsShow ? (<CrmRightMergePanel
                    showFlag={this.state.mergePanelIsShow}
                    mergeCustomerList={this.state.selectedCustomer}
                    originCustomerList={this.state.originCustomerList}
                    hideMergePanel={this.hideMergePanel}
                    afterMergeCustomer={this.afterMergeCustomer}
                    refreshCustomerList={this.refreshCustomerList}
                />) : this.state.rightPanelIsShow ? (
                    <CrmRightPanel
                        showFlag={this.state.rightPanelIsShow}
                        currentId={this.state.currentId}
                        hideRightPanel={this.hideRightPanel}
                        refreshCustomerList={this.refreshCustomerList}
                        curCustomer={this.state.curCustomer}
                        ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                        updateCustomerDefContact={CrmAction.updateCustomerDefContact}
                    />
                ) : null}
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={this.state.CustomerInfoOfCurrUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={this.state.CustomerInfoOfCurrUser.name}
                        /> : null
                    }
                </RightPanel>
                <BootstrapModal
                    show={this.state.showDeleteConfirm}
                    onHide={this.hideDeleteModal}
                    container={this}
                    aria-labelledby="contained-modal-title"
                >
                    <BootstrapModal.Header closeButton>
                        <BootstrapModal.Title />
                    </BootstrapModal.Header>
                    <BootstrapModal.Body>
                        <p>
                            {Intl.get("crm.15", "是否删除{cusName}？", {cusName: this.state.deleteCusName})}
                        </p>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <BootstrapButton className="btn-ok" onClick={this.deleteCustomer}><ReactIntl.FormattedMessage
                            id="common.sure" defaultMessage="确定"/></BootstrapButton>
                        <BootstrapButton className="btn-cancel"
                                         onClick={this.hideDeleteModal}><ReactIntl.FormattedMessage id="common.cancel"
                                                                                                    defaultMessage="取消"/></BootstrapButton>
                    </BootstrapModal.Footer>
                </BootstrapModal>
                <Modal
                    visible={this.state.isPreviewShow}
                    width="90%"
                    prefixCls="customer-import-modal ant-modal"
                    title={Intl.get("crm.2", "导入客户") + Intl.get("common.preview", "预览")}
                    footer={this.renderImportModalFooter()}
                    onCancel={this.cancelImport}
                >
                    {this.state.isPreviewShow ? (
                        <AntcTable
                            dataSource={this.state.previewList}
                            columns={previewColumns}
                            rowKey={this.getRowKey}
                            pagination={false}
                            scroll={{x: tableScrollX, y: LAYOUT_CONSTANTS.UPLOAD_MODAL_HEIGHT}}
                        />
                    ) : null}
                </Modal>
            </div>
        </RightContent>);
    }
});

module.exports = Crm;
