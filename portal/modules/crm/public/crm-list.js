require('./scss/index.scss');
import {Table, Button, Tag, Alert, Icon, Modal, message,Pagination} from "antd";
import SalesClueAddForm from "./views/sales-clue-add-form";
var RightContent = require('../../../components/privilege/right-content');
var FilterBlock = require('../../../components/filter-block');
var TableUtil = require("../../../components/antd-table-pagination");
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
var Spinner = require("../../../components/spinner");
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
var CrmRightPanel = require('./views/crm-right-panel');
var ImportCrmTemplate = require('./views/crm-import-template');
var BootstrapButton = require('react-bootstrap').Button;
var BootstrapModal = require('react-bootstrap').Modal;
var crmUtil = require("./utils/crm-util");
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
var batchChangeActions = require("./action/batch-change-actions");
let OrderAction = require("./action/order-actions");
var batchPushEmitter = require("../../../public/sources/utils/emitters").batchPushEmitter;
// 没有消息的提醒
var NoMoreDataTip = require("../../../components/no_more_data_tip");
import {crmEmitter} from "OPLATE_EMITTER";
import routeList from "MOD_DIR/common/route";
import ajax from "MOD_DIR/common/ajax";
import Trace from "LIB_DIR/trace";
import crmAjax from './ajax/index';
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 150,
    BOTTOM_DISTANCE: 40,
    SCREEN_WIDTH: 1130//屏幕宽度小于1130时，右侧操作按钮变成图标
};
var rightPanelShow = false;
let UNKNOWN = Intl.get("user.unknown", "未知");

var Crm = React.createClass({
    getInitialState: function () {
        return {
            callNumber: '', // 座机号
            errMsg: '', // 获取座机号失败的信息
            ...this.getStateData()
        }
    },
    getStateData: function () {
        var originCustomerList = CrmStore.getCurPageCustomers();
        var list = CrmStore.processForList(originCustomerList);
        var _this = this;
        return {
            isLoading: CrmStore.getLoadingState(),
            customersSize: CrmStore.getCustomersLength(),
            pageSize: CrmStore.getState().pageSize,
            pageNum: CrmStore.getState().pageNum,
            curPageCustomers: list,//将后端返回的数据转为界面列表所需的数据
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
            selectedCustomer: _this.state && _this.state.selectedCustomer || [],
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
            rangParams: [{//时间范围参数
                from: "",
                to: "",
                type: "time",
                name: "start_time"
            }],
            crmFilterValue: "",
            cursor: true,//向前还是向后翻页
            pageValue: 0,//两次点击时的页数差
            clueAddFormShow: false//是否展示销售线索的添加面板
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
        })
    },

    componentDidMount: function () {
        //批量更新所属销售
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_SALES, this.batchChangeSalesman);
        //批量更新标签
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_LABELS, this.batchChangeTags);
        //批量添加标签
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_ADD_LABELS, this.batchAddTags);
        //批量移除标签
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_REMOVE_LABELS, this.batchRemoveTags);
        //批量更新行业
        batchPushEmitter.on(batchPushEmitter.CRM_BATCH_CHANGE_INDUSTRY, this.batchChangeIndustry);
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
                    this.setRange({startTime, endTime})
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
        $(window).on("resize", this.changeTableHeight);
        var _this = this;
        //点击客户列表某一行时打开对应的详情
        $(".custom-tbody").on("click", "td.has-filter", function (e) {
            //td中的表示关注的星星元素不能触发打开右侧面板的事件
            if ($(e.target).hasClass("focus-customer")) {
                return;
            }
            Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-tbody"), "打开客户详情");
            var $tr = $(this).closest("tr");
            //延迟设置当前选中行背景色，防止出现列表初次加载后接着点击某一行，有时背景色设置不生效的问题
            setTimeout(() => {
                $tr.addClass("current-row").siblings().removeClass("current-row");
            });
            var id = $tr.find(".record-id").text();
            _this.showRightPanel(id);
        });
        //点击表头时关闭详情区
        $(this.refs.crmList).on("click", "thead .has-filter", function () {
            if (_this.state.rightPanelIsShow) {
                _this.hideRightPanel();
            }
        });
        //绑定点击事件以支持点击表头进行排序
        TableUtil.zoomInSortArea(this.refs.crmList, condition => {
            //执行查询的时候需要翻到第一页
            this.state.filterChanged = true;
            //表头搜索时设置筛选条件
            FilterAction.setInputCondition(condition);
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
            const scrollWrap = $(".custom-tbody .gm-scroll-view");
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
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_LABELS, this.batchChangeTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_ADD_LABELS, this.batchAddTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_REMOVE_LABELS, this.batchRemoveTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_INDUSTRY, this.batchChangeIndustry);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_TERRITORY, this.batchChangeTerritory);
        crmEmitter.removeListener(crmEmitter.IMPORT_CUSTOMER, this.onCustomerImport);
        $(window).off("resize", this.changeTableHeight);
        CrmStore.unlisten(this.onChange);
        this.hideRightPanel();
    },

    onChange: function () {
        var state = this.getStateData();
        this.setState(state);
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
    //批量变更地域的处理,调用store进行数据更新
    batchChangeTerritory: function (taskInfo, taskParams) {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTerritory({taskInfo, taskParams, curCustomers});
        this.delayRenderBatchUpdate();
    },
    changeTableHeight: function (filterPanelHeight = 0) {
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;

        tableHeight -= filterPanelHeight;

        var selectAllAlertHeight = $(".content-block .ant-alert").outerHeight(true);
        if (selectAllAlertHeight) tableHeight -= selectAllAlertHeight;

        this.setState({tableHeight, filterPanelHeight});
    },
    confirmDelete: function (cusId, cusName) {
        Trace.traceEvent($(this.getDOMNode()).find(".cus-op"), "点击删除某个客户按钮");
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
        Trace.traceEvent($(this.getDOMNode()).find(".modal-footer .btn-ok"), "点击确定删除某个客户");
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
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
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
    },
    showClueAddForm: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".handle-btn-container"), "点击添加销售线索按钮");
        this.state.clueAddFormShow = true;
        this.setState(this.state);
    },
    hideClueAddForm: function () {
        this.state.clueAddFormShow = false;
        this.setState(this.state);
    }
    , showBatchChange: function () {
        if (this.state.selectedCustomer.length === 0) return;
        this.state.batchChangeShow = true;
        this.setState(this.state);
        Trace.traceEvent($(this.getDOMNode()).find(".handle-btn-container"), "点击批量操作按钮");
    }
    , hideBatchChange: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".op-buttons .btn-primary-sure"), "关闭批量变更面板");
        this.state.batchChangeShow = false;
        this.setState(this.state);
        //调用批量变更的action进行数据重置
        batchChangeActions.resetState();
    }
    //查询客户
    //reset参数若为true，则重新从第一页获取
    , search: function (reset) {
        const filterStoreCondition = JSON.parse(JSON.stringify(FilterStore.getState().condition));
        const condition = _.extend({}, filterStoreCondition, FilterStore.getState().inputCondition);
        //去除查询条件中值为空的项
        crmUtil.removeEmptyItem(condition);
        //保存当前查询条件，批量变更的时候会用到
        this.state.condition = condition;

        //当重置标志为true时，重新从第一页加载，并重置客户列表
        if (reset) {
            this.state.customerId = "";
            CrmAction.setCustomerId("");
            //清除客户的选择
            this.clearSelectedCustomer();
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
        //未知行业,未知地域,未知销售阶段（未展示），未知联系方式(未展示)等处理
        let unexist = [];//存放未知行业、未知地域的数组
        if (condition.industry && condition.industry.indexOf(UNKNOWN) != -1) {
            //未知行业的处理
            unexist.push("industry");
            let industryArray = condition.industry.split(",");
            industryArray = _.filter(industryArray, item => item != UNKNOWN);
            if (industryArray.length > 0) {
                condition.industry = industryArray.join(',');
            } else {
                //只选了未知行业
                delete condition.industry;
            }
        }
        var saleStage = '';
        if (condition.sales_opportunities && _.isArray(condition.sales_opportunities) && condition.sales_opportunities.length != 0) {
            saleStage = condition.sales_opportunities[0].sale_stages;
        }
        if (saleStage && saleStage.indexOf(UNKNOWN) != -1) {
            //未知销售阶段的处理
            condition.contain_sales_opportunity = "false";
            let stageArray = saleStage.split(",");
            stageArray = _.filter(stageArray, item => item != UNKNOWN);
            if (stageArray.length > 0) {
                condition.sales_opportunities[0].sale_stages = stageArray.join(',');
            } else {
                //只选了未知销售阶段
                delete condition.sales_opportunities;
            }
        }
        //未知地域的处理
        if (condition.province && condition.province == UNKNOWN) {
            unexist.push("province");
            delete condition.province;
        }
        //未打标签的处理
        if (_.isArray(condition.labels) && condition.labels.indexOf(Intl.get("crm.tag.unknown", "未打标签的客户")) != -1) {
            unexist.push("labels");
            delete condition.labels;
        }
        //线索客户的筛选
        if (condition.clue) {
            //未分配的线索客户
            if (condition.clue.indexOf(Intl.get("user.undistributed", "未分配销售跟进")) != -1) {
                condition.unexist_feilds = ["member_id"];
            }
            if (condition.clue.indexOf(Intl.get("user.distributed", "已分配销售跟进")) != -1) {
                //已分配的线索客户
                condition.exist_feilds = ["member_id"];
            }
            delete condition.clue;
        }
        //未知联系方式
        if (condition.contact && condition.contact == UNKNOWN) {
            condition.contain_contact = "false";
            delete condition.contact;
        }
        if (unexist.length > 0) {
            condition.unexist = unexist.join(",");
        }
        var queryObj = {
            total_size: this.state.pageSize * this.state.pageValue,
            cursor: this.state.cursor,
            id: this.state.customerId
        };
        CrmAction.queryCustomer(condition, this.state.rangParams, this.state.pageSize, this.state.sorter, queryObj);
    },
    //清除客户的选择
    clearSelectedCustomer: function () {
        this.state.selectedCustomer = [];
        this.state.selectAllMatched = false;
        this.setState(this.state);
    },
    onTableChange: function (pagination, filters, sorter) {
        let sorterChanged = false;
        let filterChanged = this.state.filterChanged

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
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
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
        return (<div>
            <PrivilegeChecker
                check="CUSTOMER_MERGE_CUSTOMER"
                className={btnClass + (this.state.selectedCustomer.length > 1 ? "" : " gray")}
                title={isWebMini ? Intl.get("crm.0", "合并客户") : ""}
                onClick={this.showMergePanel}
            >
                {isWebMini ? <i className="iconfont icon-merge-btn"/> : Intl.get("crm.0", "合并客户")}
            </PrivilegeChecker>
            <PrivilegeChecker
                check="CUSTOMER_BATCH_OPERATE"
                className={btnClass + (this.state.selectedCustomer.length ? "" : " gray")}
                title={isWebMini ? Intl.get("user.batch.change", "批量变更") : ""}
                onClick={this.showBatchChange}
            >
                {isWebMini ? <i className="iconfont icon-piliangcaozuo"/> : Intl.get("user.batch.change", "批量变更")}
            </PrivilegeChecker>
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
            <PrivilegeChecker
                check="CUSTOMER_ADD_CLUE"
                className={btnClass}
                title={isWebMini ? Intl.get("crm.sales.clue.add", "添加销售线索") : ""}
                onClick={this.showClueAddForm}>
                {isWebMini ? <Icon type="plus"/> : Intl.get("crm.sales.clue.add", "添加销售线索")}
            </PrivilegeChecker>
        </div>);
    },
    showNoMoreDataTip: function () {
        return this.state.isNoMoreTipShow;
    },
    onCustomerImport(list) {
        this.setState({
            isPreviewShow: true,
            previewList: CrmStore.processForList(list),
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
                        {Intl.get("crm.210", "存在和系统中重复的客户名或联系方式，已用红色标出，请处理后重新导入")}
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
    handleClickCallOut(phoneNumber) {
        Trace.traceEvent($(this.getDOMNode()).find(".column-contact-way"), "拨打电话");
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!"));
        } else {
            if (this.state.callNumber) {
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
                        <i className="iconfont icon-call-out call-out"
                           title={Intl.get("crm.click.call.phone", "点击拨打电话")}
                           onClick={this.handleClickCallOut.bind(this, item)}></i>
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

    onPageChange: function (page) {
        var currPageNum = this.state.pageNum;
        var curCustomerList = this.state.curPageCustomers;
        if (page == currPageNum) {
            return;
        } else {
            CrmAction.setPageNum(page);
            var cursor = "";
            if (page > currPageNum) {
                //向后翻页
                this.setState({
                    pageValue: page - currPageNum,
                    cursor: true,
                    customerId: _.last(curCustomerList).id,
                }, ()=> {
                    this.search();
                });
            } else {
                //向前翻页
                this.setState({
                    pageValue: currPageNum - page,
                    cursor: false,
                    customerId: _.first(curCustomerList).id,
                }, ()=> {
                    this.search();
                });
            }
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
        var customerArr = _.find(this.state.curPageCustomers, (customer)=> {
            return record.id == customer.id;
        });
        if (customerArr) {
            customerArr.interest = interestObj.interest;
        }
        ;
        this.setState(
            {curPageCustomers: this.state.curPageCustomers}
        );
        CrmAction.updateCustomer(interestObj, (errorMsg)=> {
            if (errorMsg) {
                //将星星的颜色修改回原来的状态
                if (customerArr) {
                    customerArr.interest = interestObj.interest == 'true' ? 'false' : 'true';
                }
                ;
                this.setState(
                    {curPageCustomers: this.state.curPageCustomers}
                );
            }
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
                _this.setState(_this.state, () => {
                    _this.changeTableHeight();
                });
                Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-selection-column"), "点击选中/取消选中某个客户");
            },
            //对客户列表当前页进行全选或取消全选操作时触发
            onSelectAll: function (selected, selectedRows, changeRows) {
                _this.state.selectedCustomer = selectedRows;
                _this.setState(_this.state, () => {
                    _this.changeTableHeight();
                });
                Trace.traceEvent($(_this.getDOMNode()).find(".ant-table-selection-column"), "点击选中/取消选中全部客户");
            }
        } : null;

        function rowKey(record, index) {
            return record.id;
        };

        var columns = [
            {
                title: Intl.get("crm.4", "客户名称"),
                width: '210px',
                dataIndex: 'name',
                className: 'has-filter',
                sorter: true,
                render: function (text, record, index) {
                    var tagsArray = record.labels ? record.labels : [];
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
                width: '130px',
                dataIndex: 'contact',
                className: 'has-filter'
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
                width: '130px',
                dataIndex: 'order',
                className: 'has-filter'
            },
            {
                title: Intl.get("crm.6", "负责人"),
                width: '130px',
                dataIndex: 'user_name',
                sorter: true,
                className: 'has-filter'
            },
            {
                title: Intl.get("member.create.time", "创建时间"),
                width: '130px',
                dataIndex: 'start_time',
                sorter: true,
                className: 'has-filter table-data-align-right'
            },
            {
                title: Intl.get("crm.7", "最后联系时间"),
                width: '130px',
                dataIndex: 'last_contact_time',
                sorter: true,
                className: 'has-filter table-data-align-right'
            },
            {
                title: Intl.get("crm.211", "跟进内容"),
                dataIndex: 'trace',
                sorter: true,
                className: 'has-filter',
                render: function (text, record, index) {
                    if (!text) text = "";
                    var truncatedRemarks = text.substr(0, 40);
                    return (
                        <span title={text}>
                            {truncatedRemarks}
                            {text.length > truncatedRemarks.length ? " ......" : null}
                        </span>
                    );
                }
            },
            {
                title: Intl.get("common.operate", "操作"),
                width: '60px',
                render: function (text, record, index) {
                    return (
                        <span className="cus-op">
                            {hasPrivilege("CRM_DELETE_CUSTOMER") ? (
                                <Button className="order-btn-class icon-delete iconfont"
                                        onClick={_this.confirmDelete.bind(null, record.id, record.name)}
                                        title={Intl.get("common.delete", "删除")}/>
                            ) : null}
                        </span>
                    );
                }
            }
        ];

        //只对域管理员开放删除功能
        if (!userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            columns = _.filter(columns, column => column.title != Intl.get("common.operate", "操作"));
        }

        //舆情秘书角色不显示备注列
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            columns = _.filter(columns, column => column.title != Intl.get("crm.211", "跟进内容"));
        }

        const customersSize = Intl.get("crm.8", "已选择全部{count}项", {count: _this.state.customersSize});
        const selectedCustomer = Intl.get("crm.11", "已选当前页{count}项", {count: _this.state.selectedCustomer.length});
        const allCustomers = Intl.get("crm.12", "选择全部{count}项", {count: _this.state.customersSize});
        const total = Intl.get("crm.207", "共{count}个客户", {count: _this.state.customersSize});
        const selectAllInfo = this.state.selectAllMatched ? (
            <span>
                {customersSize}
                <a href="javascript:void(0)"
                   onClick={this.clearSelectAllSearchResult}>{Intl.get("crm.10", "只选当前展示项")}</a>
            </span>
        ) : (
            <span>
                {selectedCustomer}
                <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>{allCustomers}</a>
            </span>
        );

        //初始加载，客户列表数据还没有取到时，不显示表格
        const shouldTableShow = (this.state.isLoading && !this.state.curPageCustomers.length) ? false : true;
        return (<RightContent>
            <div className="crm_content" data-tracename="客户列表">
                <FilterBlock>
                    <CrmFilter
                        ref="crmFilter"
                        search={this.search.bind(this, true)}
                        changeTableHeight={this.changeTableHeight}
                        crmFilterValue={this.state.crmFilterValue}
                    />
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
                {this.state.clueAddFormShow ? (
                    <SalesClueAddForm
                        hideAddForm={this.hideClueAddForm}
                        addOne={this.addOne}
                        showRightPanel={this.showRightPanel}
                    />
                ) : null}
                {FilterStore.getState().isPanelShow ? (
                    <CrmFilterPanel
                        search={this.search.bind(this, true)}
                        filterPanelHeight={this.state.filterPanelHeight}
                        changeTableHeight={this.changeTableHeight}
                    />
                ) : null}
                <div id="content-block" className="content-block splice-table" ref="crmList"
                     style={{display: shouldTableShow ? "block" : "none"}}>
                    {this.state.selectedCustomer.length ? (
                        <Alert message={selectAllInfo} type="info" showIcon/>
                    ) : null}
                    <div className="custom-thead">
                        <Table
                            rowSelection={rowSelection}
                            rowKey={rowKey}
                            columns={columns}
                            dataSource={this.state.curPageCustomers}
                            pagination={false}
                            onChange={this.onTableChange}
                        />
                    </div>
                    <div className="custom-tbody" ref="tableWrap" style={{height: this.state.tableHeight}}>
                        <GeminiScrollBar>
                            <Table
                                rowSelection={rowSelection}
                                rowKey={rowKey}
                                columns={columns}
                                dataSource={this.state.curPageCustomers}
                                pagination={false}
                            />
                            <NoMoreDataTip
                                fontSize="12"
                                show={this.showNoMoreDataTip}
                            />
                        </GeminiScrollBar>
                    </div>
                </div>
                {(this.state.customersSize / this.state.pageSize > 1) ? <Pagination
                    total={this.state.customersSize}
                    showSizeChanger={false}
                    pageSize={this.state.pageSize}
                    current={this.state.pageNum}
                    onChange={this.onPageChange}

                /> : null}
                <div className="total">{total}</div>
                {this.state.isLoading ? (
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
                        callNumber={this.state.callNumber}
                        getCallNumberError={this.state.errMsg}
                    />
                ) : null}
                {this.state.batchChangeShow ? (
                    <CrmBatchChange
                        currentId={this.state.currentId}
                        hideBatchChange={this.hideBatchChange}
                        refreshCustomerList={this.refreshCustomerList}
                        selectedCustomer={this.state.selectedCustomer}
                        selectAllMatched={this.state.selectAllMatched}
                        matchedNum={this.state.customersSize}
                        condition={this.state.condition}
                    />
                ) : null}
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
                        <Table
                            dataSource={this.state.previewList}
                            columns={columns}
                            rowKey={this.getRowKey}
                            pagination={false}
                        />
                    ) : null}
                </Modal>
            </div>
        </RightContent>)
    }
});

module.exports = Crm;