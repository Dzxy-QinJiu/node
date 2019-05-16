var React = require('react');
require('./css/index.less');
import { Tag, Modal, message, Button, Icon } from 'antd';
import { AntcTable } from 'antc';
var RightContent = require('../../../components/privilege/right-content');
var FilterBlock = require('../../../components/filter-block');
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
var Spinner = require('../../../components/spinner');
import ImportCrmTemplate from 'CMP_DIR/import_step';
var BootstrapButton = require('react-bootstrap').Button;
var BootstrapModal = require('react-bootstrap').Modal;
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
var CrmStore = require('./store/crm-store');
var FilterStore = require('./store/filter-store');
var FilterAction = require('./action/filter-actions');
var CrmAction = require('./action/crm-actions');
var CRMAddForm = require('./views/crm-add-form');
var CrmFilter = require('./views/crm-filter');
var CrmFilterPanel = require('./views/crm-filter-panel');
var CrmBatchChange = require('./views/crm-batch-change');
var CrmRightMergePanel = require('./views/crm-right-merge-panel');
let OrderAction = require('./action/order-actions');
var batchPushEmitter = require('../../../public/sources/utils/emitters').batchPushEmitter;
var AppUserManage = require('MOD_DIR/app_user_manage/public');
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import { crmEmitter } from 'OPLATE_EMITTER';
import routeList from 'MOD_DIR/common/route';
import ajax from 'MOD_DIR/common/ajax';
import Trace from 'LIB_DIR/trace';
import crmUtil from './utils/crm-util';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
const extend = require('extend');
import { FilterInput } from 'CMP_DIR/filter';
var classNames = require('classnames');
import ClueRightPanel from 'MOD_DIR/clue_customer/public/views/clue-right-detail';
import queryString from 'query-string';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import PhoneCallout from 'CMP_DIR/phone-callout';
import CrmOverviewActions from './action/basic-overview-actions';
var userData = require('PUB_DIR/sources/user-data');
const userInfo = userData.getUserData();
const COMMON_OTHER_ITEM = 'otherSelectedItem';
import {OTHER_FILTER_ITEMS, DAY_TIME} from 'PUB_DIR/sources/utils/consts';
import {getStartTime, getEndTime} from 'PUB_DIR/sources/utils/time-format-util';
import ShearContent from 'CMP_DIR/shear-content';
import {setWebsiteConfig} from 'LIB_DIR/utils/websiteConfig';
import {REG_CRM_FILES_TYPE_RULES} from 'PUB_DIR/sources/utils/consts';
//从客户分析点击图表跳转过来时的参数和销售阶段名的映射
const tabSaleStageMap = {
    tried: '试用阶段',
    projected: '立项报价阶段',
    negotiated: '谈判阶段',
    dealed: '成交阶段',
    executed: '执行阶段'
};

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 66 + 56,//表格容器上外边距 + 表头的高度
    BOTTOM_DISTANCE: 30 + 10 * 2,//分页器的高度 + 分页器上下外边距
    SCREEN_WIDTH: 1130,//屏幕宽度小于1130时，右侧操作按钮变成图标
    UPLOAD_MODAL_HEIGHT: 260
};
var rightPanelShow = false;
let UNKNOWN = Intl.get('user.unknown', '未知');
//具备舆情秘书权限
const hasSecretaryAuth = userData.hasRole(userData.ROLE_CONSTANS.SECRETARY);

//标签选项下的特殊标签
const SPECIAL_LABEL = {
    NON_TAGGED_CUSTOMER: Intl.get('crm.tag.unknown', '未打标签的客户'),
    TURN_OUT: Intl.get('crm.qualified.roll.out', '转出'),
    CLUE: Intl.get('crm.sales.clue', '线索'),
    HAS_CALL_BACK: Intl.get('common.has.callback', '已回访'),
};
const day = 24 * 60 * 60 * 1000;

//默认范围参数
const DEFAULT_RANGE_PARAM = {
    from: '',
    to: '',
    type: 'time',
    name: 'start_time'
};
//查看是否可以继续添加客户
let member_id = userData.getUserData().user_id;
class Crm extends React.Component {
    getSelectedCustomer = (curCustomerList) => {
        let selectedCustomer = [];
        if (this.state) {
            if (this.state.selectAllMatched) {//全选时
                selectedCustomer = curCustomerList;
            } else if (this.state.selectedCustomer) {//非全选时
                selectedCustomer = this.state.selectedCustomer;
            }
        }
        return selectedCustomer;
    };

    getStateData = () => {
        var originCustomerList = CrmStore.getCurPageCustomers();
        var list = CrmStore.processForList(originCustomerList);
        var originCustomerListForPagination = CrmStore.getlastCurPageCustomers();
        var listForPagination = CrmStore.processForList(originCustomerListForPagination);
        var _this = this;
        let crmStoreData = CrmStore.getState();
        return {
            isLoading: crmStoreData.isLoading,//正在获取客户列表
            getErrMsg: crmStoreData.getErrMsg,//获取客户列表失败时的提示
            customersSize: CrmStore.getCustomersLength(),
            pageSize: crmStoreData.pageSize,
            pageNum: crmStoreData.pageNum,
            isConcernCustomerTop: crmStoreData.isConcernCustomerTop,//关注客户是否置顶
            curPageCustomers: list,//将后端返回的数据转为界面列表所需的数据
            originCustomerList: originCustomerList,//后端返回的客户数据
            rightPanelIsShow: rightPanelShow,
            importAlertShow: false,//是否展示导入结果提示框
            importAlertMessage: '',//导入结果提示框内容
            importAlertType: '',//导入结果提示框类型
            currentId: crmStoreData.currentId,
            curCustomer: crmStoreData.curCustomer,
            clueId: crmStoreData.clueId,//展示线索详情的id
            keyword: $('.search-input').val() || '',
            isAddFlag: _this.state && _this.state.isAddFlag || false,
            batchChangeShow: _this.state && _this.state.batchChangeShow || false,
            selectedCustomer: this.getSelectedCustomer(list),
            sorter: _this.state && _this.state.sorter || {
                field: 'start_time',
                order: 'descend'
            },
            condition: _this.state && _this.state.condition || {},
            isScrollTop: _this.state && _this.state.isScrollTop || false,
            crmTemplateRightPanelShow: false,// 是否显示导入客户下载模板
            mergePanelIsShow: false,//是否展示合并面板
            mergedCustomer: {}, //合并时要保存的客户
            deleteCusName: '', // 要删除客户的用户名
            rangParams: [DEFAULT_RANGE_PARAM],//时间范围参数
            crmFilterValue: '',
            cursor: true,//向前还是向后翻页
            pageValue: 0,//两次点击时的页数差
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
        };
    };

    setRange = (obj) => {
        if (obj.startTime) {
            this.state.rangParams[0].from = obj.startTime;
        }
        if (obj.endTime) {
            this.state.rangParams[0].to = obj.endTime;
        }
    };

    setStartRange = (value) => {
        this.state.rangParams[0].from = value;
    };

    setEndRange = (value) => {
        this.state.rangParams[0].to = value;
    };

    componentDidMount() {
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
        CrmStore.listen(this.onChange);
        OrderAction.getSysStageList();
        const query = queryString.parse(this.props.location.search);
        if (query.analysis_filter_field) {
            var filterField = query.analysis_filter_field;
            var filterValue = query.analysis_filter_value;
            filterValue = (filterValue === 'unknown' ? '未知' : filterValue);
            var startTime = parseFloat(query.login_begin_date);
            var endTime = parseFloat(query.login_end_date);
            var currentTime = parseFloat(query.current_date_timestamp);
            var saleStage = query.customerType;
            const filterAppId = query.app_id;
            delete query.analysis_filter_field;
            delete query.analysis_filter_value;
            //设置选中的APP名称
            if (filterAppId === 'all') {
                FilterAction.setApp('');
            } else {
                FilterAction.setApp(filterAppId);
            }
            //如果是从新增客户跳转过去
            if (saleStage === 'added') {
                this.setRange({ startTime, endTime });
                //如果是趋势图，则只取当前那一天的数据
                if (filterField === 'trend') {
                    startTime = currentTime - 8 * 60 * 60 * 1000;
                    endTime = currentTime + 16 * 60 * 60 * 1000 - 1;
                    this.setRange({ startTime, endTime });
                }
            } else {
                //其他三种情况都是累积数据
                startTime = '';
                this.setRange({ startTime, endTime });

                //根据从客户分析点击跳转带过来的客户类型参数得到对应的销售阶段名
                const saleStageName = tabSaleStageMap[saleStage];

                if (saleStageName) {
                    FilterAction.setStage(saleStageName);
                }
                if (filterField === 'trend') {
                    //趋势图的结束时间为当前选中那一天的结束时间
                    endTime = currentTime + 16 * 60 * 60 * 1000 - 1;
                    this.setEndRange(endTime);
                }
            }
            this.setFilterField({ filterField, filterValue });
        } else {
            this.search();
        }
        this.changeTableHeight();
        $(window).on('resize', e => this.changeTableHeight());
        var _this = this;
        //点击客户列表某一行时打开对应的详情
        $('.tbody').on('click', 'td.has-filter', function(e) {
            //td中的表示关注的星星元素不能触发打开右侧面板的事件
            if ($(e.target).hasClass('focus-customer')) {
                return;
            }
            Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.ant-table-tbody'), '打开客户详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            _this.showRightPanel(id);
        });
        //点击表头时关闭详情区
        $(this.refs.crmList).on('click', 'thead .has-filter', function() {
            if (_this.state.rightPanelIsShow) {
                _this.hideRightPanel();
            }
        });
        //如果从url跳转到该页面，并且有add=true，则打开右侧面板
        if (query.add === 'true') {
            this.showAddForm();
        }
    }
    //设置了关注客户置顶后的参数处理
    handleSortParams(params){
        //字符串类型的排序字段，key需要在字段后面加上.row
        const customerSortMap = crmUtil.CUSOTMER_SORT_MAP;
        params.sort_and_orders = JSON.stringify([
            {key: customerSortMap['interest_member_ids'], value: 'ascend'},
            {
                key: customerSortMap[this.state.sorter.field] || customerSortMap['id'],
                value: _.get(this.state, 'sorter.order', 'ascend')
            }
        ]);
        return params;
    }

    setFilterField = ({ filterField, filterValue }) => {
        //展示的团队列表
        if (filterField === 'team') {
            FilterAction.getTeamList((teams) => {
                const team = _.find(teams, item => item.group_name === filterValue);
                const teamId = team && team.group_id || '';
                FilterAction.setTeam(teamId);
                this.search();
            });
        } else {
            //地域
            if (filterField === 'zone') {
                FilterAction.setProvince(filterValue);
            }
            //销售阶段
            if (filterField === 'stage') {
                FilterAction.setStage(filterValue);
            }
            //行业
            if (filterField === 'industry') {
                FilterAction.setIndustry(filterValue);
            }
            //舆情秘书看到的团队成员列表
            if (filterField === 'team_member') {
                FilterAction.setInputCondition({ user_name: filterValue });
                this.state.crmFilterValue = filterValue;
            }
            this.search();
        }
    };

    componentDidUpdate() {
        if (this.state.isScrollTop) {
            this.scrollTop();
        }
    }

    componentWillUnmount() {
        clearTimeout(this.batchRenderTimeout);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_SALES, this.batchChangeSalesman);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_TRANSFER_CUSTOMER, this.batchChangeSalesman);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_LABELS, this.batchChangeTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_ADD_LABELS, this.batchAddTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_REMOVE_LABELS, this.batchRemoveTags);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_INDUSTRY, this.batchChangeIndustry);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_LEVEL, this.batchChangeLevel);
        batchPushEmitter.removeListener(batchPushEmitter.CRM_BATCH_CHANGE_TERRITORY, this.batchChangeTerritory);
        $(window).off('resize', this.changeTableHeight);
        //将store中的值设置初始值
        CrmAction.setInitialState();
        CrmStore.unlisten(this.onChange);
        this.hideRightPanel();
    }

    getConfitionFromFilterList(data) {
        const condition = {};
        if (!data.find(group => group.groupId === COMMON_OTHER_ITEM)) {
            condition[COMMON_OTHER_ITEM] = '';
        }
        data.forEach(item => {
            if (item.groupId) {
                if (item.groupId !== 'sales_opportunities') {
                    condition[item.groupId] = item.data.map(x => x.value);
                    if (['customer_label', 'province', 'industry', 'member_role', 'administrative_level', 'sales_team_id', COMMON_OTHER_ITEM].includes(item.groupId)) {
                        condition[item.groupId] = condition[item.groupId].join(',');
                    } else if (item.singleSelect) {
                        condition[item.groupId] = condition[item.groupId][0] || '';
                    }

                } else {
                    condition.sales_opportunities = [];
                    condition.sales_opportunities.push({
                        sale_stages: item.data.map(x => x.value)
                    });
                    condition.sales_opportunities[0].sale_stages = condition.sales_opportunities[0].sale_stages.join(',');
                }
            }
        });
        return this.processCondition(condition);
    }

    handleAddCommonFilter(params) {
        const query = this.getConfitionFromFilterList(params.filterList);
        const data = {
            query_condition: {
                query,
                rang_params: this.state.rangParams,
            },
            user_id: userInfo.user_id,
            name: params.filterName,
            type: params.range
        };
        if (query.sales_team_id) {
            data.sales_team_id = query.sales_team_id;
        }
        return CrmAction.addCommonFilter({
            data
        });
    }

    onChange = () => {
        var state = this.getStateData();
        this.setState(state, () => {
            //全选状态下，头部的全选按钮没有选中时，手动设置选中
            if (this.state.selectAllMatched && !$('.ant-table-header .ant-table-selection-column .ant-checkbox-input').parent().hasClass('ant-checkbox-checked')) {
                $('.ant-table-header .ant-table-selection-column .ant-checkbox-input').trigger('click');
            }
        });
        $('.total').show();

    };

    //批量操作渲染延迟的timeout
    batchRenderTimeout = null;

    //渲染批量操作
    delayRenderBatchUpdate = () => {
        clearTimeout(this.batchRenderTimeout);
        this.batchRenderTimeout = setTimeout(() => {
            var state = this.getStateData();
            this.setState(state);
        }, 100);
    };

    //批量变更销售人员的处理,调用store进行数据更新
    batchChangeSalesman = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeSalesman({ taskInfo, taskParams, curCustomers });
        this.delayRenderBatchUpdate();
    };

    //批量变更标签的处理,调用store进行数据更新
    batchChangeTags = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTags({ taskInfo, taskParams, curCustomers }, 'change');
        this.delayRenderBatchUpdate();
    };

    //批量添加标签的处理,调用store进行数据更新
    batchAddTags = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTags({ taskInfo, taskParams, curCustomers }, 'add');
        this.delayRenderBatchUpdate();
    };

    //批量移除标签的处理,调用store进行数据更新
    batchRemoveTags = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTags({ taskInfo, taskParams, curCustomers }, 'remove');
        this.delayRenderBatchUpdate();
    };

    //批量变更行业的处理,调用store进行数据更新
    batchChangeIndustry = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeIndustry({ taskInfo, taskParams, curCustomers });
        this.delayRenderBatchUpdate();
    };

    //批量变更行政级别的处理,调用store进行数据更新
    batchChangeLevel = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeLevel({ taskInfo, taskParams, curCustomers });
        this.delayRenderBatchUpdate();
    };

    //批量变更地域的处理,调用store进行数据更新
    batchChangeTerritory = (taskInfo, taskParams) => {
        var curCustomers = this.state.originCustomerList;
        CrmStore.batchChangeTerritory({ taskInfo, taskParams, curCustomers });
        this.delayRenderBatchUpdate();
    };

    changeTableHeight = (filterPanelHeight = 0) => {
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        tableHeight -= filterPanelHeight;
        this.setState({ tableHeight, filterPanelHeight });
    };

    confirmDelete = (cusId, cusName) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.cus-op'), '删除客户');
        this.state.currentId = cusId;
        this.state.deleteCusName = cusName;
        this.state.showDeleteConfirm = true;
        this.setState(this.state);
    };

    hideDeleteModal = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-footer .btn-cancel'), '关闭删除客户的确认模态框');
        this.state.showDeleteConfirm = false;
        this.setState(this.state);
    };

    deleteCustomer = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-footer .btn-ok'), '确定删除客户');
        this.hideDeleteModal();
        if(this.state.currentId){
            CrmAction.deleteCustomer(this.state.currentId);
        }
    };

    refreshCustomerList = (customerId) => {
        this.state.selectedCustomer = [];
        setTimeout(() => {
            CrmAction.refreshCustomerList(customerId);
        }, 1000);
    };

    editOne = (index, name) => {
        this.state.rightPanelIShow = true;
    };

    showRightPanel = (id) => {
        //舆情秘书角色不让看详情
        if (hasSecretaryAuth) {
            return;
        }
        rightPanelShow = true;
        CrmAction.setCurrentCustomer(id);
        setTimeout(() => {
            this.renderCustomerDetail();
        });
    };

    renderCustomerDetail = () => {
        //触发打开带拨打电话状态的客户详情面板
        if (this.state.currentId) {
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                customer_params: {
                    currentId: this.state.currentId,
                    refreshCustomerList: this.refreshCustomerList,
                    curCustomer: this.state.curCustomer,
                    ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                    updateCustomerDefContact: CrmAction.updateCustomerDefContact,
                    updateCustomerLastContact: CrmAction.updateCustomerLastContact,
                    handleFocusCustomer: this.handleFocusCustomer,
                    showRightPanel: this.showRightPanel,
                    hideRightPanel: this.hideRightPanel
                }
            });
        }
    };

    hideRightPanel = () => {
        this.state.rightPanelIsShow = false;
        rightPanelShow = false;
        this.setState(this.state);
        $('.ant-table-row').removeClass('current-row');
    };

    addOne = (customer) => {
        this.state.isAddFlag = false;
        this.state.isScrollTop = true;
        this.setState(this.state);
    };

    showAddForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.handle-btn-container'), '点击添加客户按钮');
        this.state.isAddFlag = true;
        this.setState(this.state);
    };

    hideAddForm = () => {
        this.state.isAddFlag = false;
        this.setState(this.state);
    };

    processCondition = (filterStoreCondition, reset) => {
        const condition = _.extend({}, filterStoreCondition, FilterStore.getState().inputCondition);
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(condition);
        //保存当前查询条件，批量变更的时候会用到
        this.state.condition = condition;

        //当重置标志为true时，重新从第一页加载，并重置客户列表
        if (reset) {
            this.state.pageNum = 1;
            //清除客户的选择
            this.clearSelectedCustomer();
            //将分页器默认选中为第一页
            CrmAction.setPageNum(1);
            CrmAction.setCurCustomers([]);
        }
        //联系方式(电话、邮箱)搜索的处理
        if (condition.phone) {
            condition.contacts = [{ phone: [condition.phone] }];
            delete condition.phone;
        }
        if (condition.email) {
            condition.contacts = [{ email: [condition.email] }];
            delete condition.email;
        }
        let term_fields = [];//需精确匹配的字段
        //未知行业,未知地域,未知销售阶段（未展示），未知联系方式(未展示)等处理
        let unexist = [];//存放未知行业、未知地域的数组
        let exist = [];
        if (condition.industry && condition.industry.length) {
            //未知行业的处理
            if (condition.industry.indexOf(UNKNOWN) !== -1) {
                unexist.push('industry');
                delete condition.industry;
            } else {//需精确匹配
                term_fields.push('industry');
            }
        }
        var saleStage = '';
        if (condition.sales_opportunities && _.isArray(condition.sales_opportunities) && condition.sales_opportunities.length !== 0) {
            saleStage = condition.sales_opportunities[0].sale_stages;
        }
        if (saleStage && saleStage === UNKNOWN) {
            //未知销售阶段的处理
            condition.contain_sales_opportunity = 'false';
            delete condition.sales_opportunities;
        }
        //未知地域的处理
        if (condition.province) {
            if (condition.province === UNKNOWN) {
                unexist.push('province');
                delete condition.province;
            } else {//需精确匹配
                term_fields.push('province');
            }
        }
        //阶段标签的处理
        if (condition.customer_label) {
            //信息、意向、试用、签约、流失
            term_fields.push('customer_label');
        }
        //合格标签的处理
        if (condition.qualify_label) {
            //从未合格标签
            if (condition.qualify_label === '3') {
                unexist.push('qualify_label');
                delete condition.qualify_label;
            } else {//合格标签、从未合格标签
                term_fields.push('qualify_label');
            }
        }
        //销售角色的处理
        if (condition.member_role) {
            term_fields.push('member_role');
        }
        //标签的处理
        if (_.isArray(condition.labels) && condition.labels.length) {
            //未打标签的客户筛选处理
            if (_.includes(condition.labels, SPECIAL_LABEL.NON_TAGGED_CUSTOMER)) {
                unexist.push('labels');
                delete condition.labels;
            } else {
                //线索、转出、已回访不可操作标签的筛选处理
                if (_.includes(condition.labels, SPECIAL_LABEL.CLUE) || _.includes(condition.labels, SPECIAL_LABEL.TURN_OUT) || _.includes(condition.labels, SPECIAL_LABEL.HAS_CALL_BACK)) {
                    condition.immutable_labels = [];
                    //线索标签
                    if (_.includes(condition.labels, SPECIAL_LABEL.CLUE)) {
                        condition.immutable_labels.push(SPECIAL_LABEL.CLUE);
                        //过滤掉线索标签
                        condition.labels = _.filter(condition.labels, label => label !== SPECIAL_LABEL.CLUE);
                    }
                    //转出标签
                    if (_.includes(condition.labels, SPECIAL_LABEL.TURN_OUT)) {
                        condition.immutable_labels.push(SPECIAL_LABEL.TURN_OUT);
                        //过滤掉转出标签
                        condition.labels = _.filter(condition.labels, label => label !== SPECIAL_LABEL.TURN_OUT);
                    }
                    // 已回访
                    if (_.includes(condition.labels, SPECIAL_LABEL.HAS_CALL_BACK)) {
                        condition.immutable_labels.push(SPECIAL_LABEL.HAS_CALL_BACK);
                        // 过滤掉已回访标签
                        condition.labels = _.filter(condition.labels, label => label !== SPECIAL_LABEL.HAS_CALL_BACK);
                    }
                    term_fields.push('immutable_labels');//精确匹配
                }
                //剩下普通标签的筛选
                if (condition.labels.length === 0) {
                    delete condition.labels;
                } else {
                    term_fields.push('labels');
                }
            }
        }
        //竞品,精确匹配
        if (condition.competing_products && condition.competing_products.length) {
            term_fields.push('competing_products');
        }
        //团队的处理
        // 所有团队的团队树
        let teamTreeList = FilterStore.getState().teamTreeList;
        //实际选中的团队列表
        let selectedTeams = [];
        if (filterStoreCondition && filterStoreCondition.sales_team_id) {
            selectedTeams = filterStoreCondition.sales_team_id.split(',');
        }
        //实际要传到后端的团队,默认是选中的团队
        let totalRequestTeams = JSON.parse(JSON.stringify(selectedTeams));
        let teamTotalArr = [];
        //跟据实际选中的id，获取包含下级团队的所有团队详情的列表teamTotalArr
        _.each(selectedTeams, (teamId) => {
            teamTotalArr = _.union(teamTotalArr, commonMethodUtil.traversingSelectTeamTree(teamTreeList, teamId));
        });
        //跟据包含下级团队的所有团队详情的列表teamTotalArr，获取包含所有的团队id的数组totalRequestTeams
        totalRequestTeams = _.union(totalRequestTeams, commonMethodUtil.getRequestTeamIds(teamTotalArr));
        if (totalRequestTeams.length) {
            condition.sales_team_id = totalRequestTeams.join(',');
        } else {
            delete condition.sales_team_id;
        }


        //其他筛选
        let dayTime = '';
        //存储筛选条件所需，用于标识时间间隔
        let interval = '';
        let dayTimeLogin = '';
        //近xxx天未写跟进记录的时间
        let dayTimeNoTrace = '';
        switch (condition.otherSelectedItem) {
            case OTHER_FILTER_ITEMS.NEVER_CONTACT: // 从未联系客户
                condition.contact_times = 0;
                break;
            case OTHER_FILTER_ITEMS.THIRTY_NO_CALL://超30天未打过电话的客户
                dayTime = DAY_TIME.THIRTY_DAY;
                break;
            case OTHER_FILTER_ITEMS.THIRTY_UNCONTACT://超30天未联系的客户
                dayTime = DAY_TIME.THIRTY_DAY;
                interval = 30;
                break;
            case OTHER_FILTER_ITEMS.FIFTEEN_UNCONTACT://超15天未联系的客户
                dayTime = DAY_TIME.FIFTEEN_DAY;
                interval = 15;
                break;
            case OTHER_FILTER_ITEMS.SEVEN_UNCONTACT://超7天未联系的客户
                dayTime = DAY_TIME.SEVEN_DAY;
                interval = 7;
                break;
            case OTHER_FILTER_ITEMS.SEVEN_LOGIN://近一周活跃客户
                dayTimeLogin = DAY_TIME.SEVEN_DAY;
                interval = 7;
                break;
            case OTHER_FILTER_ITEMS.MONTH_LOGIN://近一个月活跃客户
                dayTimeLogin = DAY_TIME.THIRTY_DAY;
                interval = 30;
                break;
            case OTHER_FILTER_ITEMS.NO_CONTACT_WAY://无联系方式的客户
                condition.contain_contact = 'false';
                break;
            case OTHER_FILTER_ITEMS.LAST_CALL_NO_RECORD://最后联系但未写跟进记录的客户
                condition.call_and_remark = '1';
                break;
            case OTHER_FILTER_ITEMS.THIRTY_NO_LAST_TRACE://超30天未写跟进记录的客户
                dayTimeNoTrace = DAY_TIME.THIRTY_DAY;
                break;
            case OTHER_FILTER_ITEMS.FIFTEEN_NO_LAST_TRACE://超15天未写跟进记录的客户
                dayTimeNoTrace = DAY_TIME.FIFTEEN_DAY;
                break;
            case OTHER_FILTER_ITEMS.SEVEN_NO_LAST_TRACE://超7天未写跟进记录的客户
                dayTimeNoTrace = DAY_TIME.SEVEN_DAY;
                break;
            case OTHER_FILTER_ITEMS.UNDISTRIBUTED://未分配销售的客户
                unexist.push('member_id');
                break;
            case OTHER_FILTER_ITEMS.INTEREST_MEMBER_IDS://被关注的客户
                exist.push('interest_member_ids');
                break;
            case OTHER_FILTER_ITEMS.MY_INTERST://我关注的客户
                condition.interest_member_ids = [crmUtil.getMyUserId()];
                break;
            case OTHER_FILTER_ITEMS.MULTI_ORDER://多个订单的客户
                this.state.rangParams[0] = {
                    from: 2,
                    name: 'sales_opportunity_count',
                    type: 'long',
                };
                break;
            case OTHER_FILTER_ITEMS.AVAILABILITY://有效客户
                condition.availability = '0';
                break;
            case OTHER_FILTER_ITEMS.TEAM_CUSTOMER://团队客户
                exist.push('sales_team_id');
                unexist.push('member_id');
                break;
            case OTHER_FILTER_ITEMS.THIS_WEEK_CONTACTED://本周联系过的客户
                this.state.rangParams[0] = {
                    from: getStartTime('week'),
                    to: getEndTime('week'),
                    name: 'last_contact_time',
                    type: 'time'
                };
                break;
        }
        //近30天拨打未接通的客户筛选
        if(condition.otherSelectedItem === OTHER_FILTER_ITEMS.THIRTY_NO_CONNECTION) {
            let currentTime = moment().valueOf();
            //最后拨打电话的时间在近30天内，
            this.state.rangParams[0] = {
                from: currentTime - DAY_TIME.THIRTY_DAY,
                to: currentTime,
                name: 'last_phone_time',
                type: 'time'
            };
            //最后联系时间在30天之前
            this.state.rangParams[1] = {
                to: currentTime - DAY_TIME.THIRTY_DAY,
                name: 'last_contact_time',
                type: 'time'
            };
        }
        //超xx天未联系的客户过滤需传的参数
        else if (dayTime) {
            //超30天未打过电话的客户
            if(condition.otherSelectedItem === OTHER_FILTER_ITEMS.THIRTY_NO_CALL) {
                this.state.rangParams[0] = {
                    to: moment().valueOf() - dayTime,
                    name: 'last_phone_time',
                    type: 'time'
                };
            } else {//超xx天未联系的客户过滤需传的参数
                this.state.rangParams[0] = {
                    to: moment().valueOf() - dayTime,
                    // from: moment().valueOf(),
                    name: 'last_contact_time',
                    type: 'time'
                };
            }
        }
        //xx天活跃客户过滤需传的参数
        else if (dayTimeLogin) {
            this.state.rangParams[0] = {
                from: moment().valueOf() - dayTimeLogin,
                name: 'last_login_time',
                type: 'time'
            };
        } else if (dayTimeNoTrace){//超xxx天未写跟进记录的客户过滤参数
            this.state.rangParams[0] = {
                to: moment().valueOf() - dayTimeNoTrace,
                name: 'last_customer_trace_time',
                type: 'time'
            };
        } else if (condition.otherSelectedItem !== OTHER_FILTER_ITEMS.MULTI_ORDER
            && condition.otherSelectedItem !== OTHER_FILTER_ITEMS.THIS_WEEK_CONTACTED) {
            //既不是超xx天未联系的客户、也不是xx天的活跃、不是多个订单客户、也不是本周未联系考核的过滤时，传默认的设置
            this.state.rangParams[0] = DEFAULT_RANGE_PARAM;
        }
        if (interval) {
            this.state.rangParams[0].interval = interval;
        }
        if (unexist.length > 0) {
            condition.unexist_fields = unexist;
        }
        if (exist.length > 0) {
            condition.exist_fields = exist;
        }
        if (term_fields.length > 0) {//需精确匹配的字段
            condition.term_fields = term_fields;
        }
        delete condition.otherSelectedItem;
        return condition;
    }

    //查询客户
    //reset参数若为true，则重新从第一页获取

    search = (reset) => {
        const filterStoreCondition = JSON.parse(JSON.stringify(FilterStore.getState().condition));

        const condition = this.processCondition(filterStoreCondition, reset);
        const rangParams = (this.props.params && this.props.params.rangParams) || this.state.rangParams;
        const conditionParams = (this.props.params && this.props.params.condition) || condition;
        const queryObjParams = $.extend({}, (this.props.params && this.props.params.queryObj));
        //组合接口所需的数据结构
        let params = {
            data: JSON.stringify(conditionParams),
            queryObj: JSON.stringify(queryObjParams),
        };
        //时间范围
        if (_.get(rangParams, '[0].from') || _.get(rangParams, '[0].to')) {
            params.rangParams = JSON.stringify(rangParams);
        }
        //设置了关注客户置顶后的处理
        if (this.state.isConcernCustomerTop) {
            params = this.handleSortParams(params);
        }

        //如果是通过列表面板打开的
        if (this.props.listPanelParamObj) {
            params = _.cloneDeep(this.props.listPanelParamObj);
            //如果是从首页跳转过来的
        } else if (this.props.fromSalesHome) {
            const locationState = this.props.location.state;

            params = {};

            //如果locationState中包含cache_key，表明是查的有效客户活跃数详细列表，需要在查询参数中增加cache_key和sub_cache_key
            if (locationState.cache_key) {
                params.url = '/rest/analysis/customer/v2/customer/active_rate/detail/:page_size/:page_num';
                params.type = 'get';
                params.cache_key = locationState.cache_key;
                params.sub_cache_key = locationState.sub_cache_key;
                params.page_size = {
                    type: 'params'
                };
                params.page_num = {
                    type: 'params'
                };
            } else {
                params.data = JSON.stringify({id: locationState.customerIds});
            }
        }

        //有关注的客户时，路径和sortAndOrders都传了排序字段时，只使用sortAndOrders中的字段进行排序（排序的优先级按数组中的顺序来排）
        CrmAction.queryCustomer(params, this.state.pageSize, this.state.pageNum, this.state.sorter);
        this.setState({rangeParams: this.state.rangParams});
    };

    //清除客户的选择
    clearSelectedCustomer = () => {
        this.state.selectedCustomer = [];
        this.state.selectAllMatched = false;
        this.setState(this.state);
    };

    onTableChange = (pagination, filters, sorter) => {
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
    };

    showCrmTemplateRightPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-item'), '点击导入客户按钮');
        this.setState({
            crmTemplateRightPanelShow: true
        });
    };

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.id === this.state.currentId) && rightPanelShow) {
            return 'current-row';
        }
        else {
            return '';
        }
    };

    closeCrmTemplatePanel = () => {
        this.setState({
            crmTemplateRightPanelShow: false
        });
    };

    selectAllSearchResult = () => {
        this.state.selectAllMatched = true;
        this.state.selectedCustomer = this.state.curPageCustomers.slice();
        this.setState(this.state);
    };

    clearSelectAllSearchResult = () => {
        this.state.selectedCustomer = [];
        this.state.selectAllMatched = false;
        this.setState(this.state, () => {
            $('th.ant-table-selection-column input').click();
        });
    };

    scrollTop = () => {
        $(ReactDOM.findDOMNode(this.refs.tableWrap)).find('.ant-table-scroll div.ant-table-body').scrollTop(0);
        this.setState({ isScrollTop: false });
    };

    showMergePanel = () => {
        if (_.isArray(this.state.selectedCustomer) && this.state.selectedCustomer.length > 1) {
            this.setState({ mergePanelIsShow: true });
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-item'), '点击合并客户按钮');
        }
    };

    hideMergePanel = () => {
        this.setState({ mergePanelIsShow: false });
    };

    //合并客户后的处理
    afterMergeCustomer = (mergeObj) => {
        this.setState({ selectedCustomer: [], mergePanelIsShow: false });//清空选择的客户
        CrmAction.afterMergeCustomer(mergeObj);
    };

    //渲染操作按钮
    renderHandleBtn = () => {
        let isWebMini = $(window).width() < LAYOUT_CONSTANTS.SCREEN_WIDTH;//浏览器是否缩小到按钮展示改成图标展示
        let btnClass = 'block ';
        btnClass += isWebMini ? 'handle-btn-mini' : 'btn-item';
        if (this.state.selectedCustomer.length) {
            //选择客户后，展示合并和批量变更的按钮
            return (<div className="top-btn-wrapper">
                <PrivilegeChecker check="CUSTOMER_BATCH_OPERATE" className="batch-btn-wrapper">
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
                <PrivilegeChecker
                    check="CUSTOMER_MERGE_CUSTOMER"
                    className='block crm-merge-btn btn-item'
                    onClick={this.showMergePanel}
                >
                    <Button>{Intl.get('crm.0', '合并客户')}</Button>
                </PrivilegeChecker>
            </div>);
        } else {
            return (<div className="top-btn-wrapper">
                <PrivilegeChecker
                    check="CUSTOMER_ADD"
                    className={btnClass}
                    title={isWebMini ? Intl.get('crm.2', '导入客户') : ''}
                    onClick={this.showCrmTemplateRightPanel}
                >
                    {isWebMini ? <i className="iconfont icon-import-btn" /> : <Button type='primary'>{Intl.get('crm.2', '导入客户')}</Button>}
                </PrivilegeChecker>
                <PrivilegeChecker
                    check="CUSTOMER_ADD"
                    className={btnClass}
                    title={isWebMini ? Intl.get('crm.3', '添加客户') : ''}
                    onClick={this.showAddForm}>
                    {isWebMini ? <Icon type="plus" /> : <Button>{Intl.get('crm.3', '添加客户')}</Button>}
                </PrivilegeChecker>
                <PrivilegeChecker
                    check="CRM_REPEAT"
                    className={btnClass + ' customer-repeat-btn btn-m-r-2'}
                    title={isWebMini ? Intl.get('crm.1', '客户查重') : ''}
                    onClick={this.props.showRepeatCustomer}
                >
                    {isWebMini ? <i className="iconfont icon-search-repeat" /> : <Button>{Intl.get('crm.1', '客户查重')}</Button>}
                </PrivilegeChecker>
                {hasPrivilege('CRM_MANAGER_GET_CUSTOMER_BAK_OPERATOR_RECORD')
                || hasPrivilege('CRM_USER_GET_CUSTOMER_BAK_OPERATOR_RECORD') ? (
                        <div className={btnClass + ' customer-recycle-btn btn-m-r-2'}
                            title={isWebMini ? Intl.get('crm.customer.recycle.bin', '回收站') : ''}
                            onClick={this.props.showCustomerRecycleBin}
                        >
                            {isWebMini ? <i className="iconfont icon-delete"/> :
                                <Button>{Intl.get('crm.customer.recycle.bin', '回收站')}</Button>}
                        </div>) : null
                }
            </div>);
        }
    };

    onCustomerImport = (list) => {
        let member_id = crmUtil.getMyUserId();
        //导入客户前先校验，是不是超过了本人的客户上限
        CrmAction.getCustomerLimit({ member_id: member_id, num: list.length }, (result) => {
            if (_.isNumber(result)) {
                if (result === 0) {
                    //可以转入
                    this.setState({
                        isPreviewShow: true,
                        previewList: this.handlePreviewList(list),
                    });
                } else if (result > 0) {
                    //不可以转入
                    message.warn(Intl.get('crm.import.over.limit', '导入客户后会超过您拥有客户的上限，请您减少{num}个客户后再导入', { num: result }));
                }
            }
        });
    };

    doImport = (successCallback,errCallback) => {
        const route = _.find(routeList, route => route.handler === 'uploadCustomerConfirm');

        const params = {
            flag: true,
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };

        ajax(arg).then(result => {
            //刷新客户列表
            this.search();
            _.isFunction(successCallback) && successCallback();
        }, (errorMsg) => {
            _.isFunction(errCallback) && errCallback(errorMsg);
        });


    };

    // 联系方式的列表
    getContactList = (text, record, index) => {
        let phoneArray = text && text.split('\n') || [];
        let className = record.phone_repeat ? 'customer-repeat' : '';
        var phoneList = phoneArray.map((item) => {
            if (item) {
                return (
                    <div className="phone-out-container">
                        <PhoneCallout
                            phoneNumber={item}
                            contactName={record.contact}
                        />
                    </div>
                );
            }
        });
        return (
            <div className={className}>
                {phoneList}
            </div>
        );
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    onPageChange = (page) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.antc-table .ant-table-wrapper'), '翻页至第' + page + '页');
        if (page === this.state.pageNum) {
            return;
        } else {
            let selectedCustomer = this.state.selectedCustomer;
            //不是全选时，清空翻页前选择的客户
            if (_.isArray(selectedCustomer) && selectedCustomer.length && !this.state.selectAllMatched) {
                this.state.selectedCustomer = [];
                this.setState({ selectedCustomer: [] });
            }
            //设置要跳转到的页码数值
            //设置要跳转到的页码数值
            CrmAction.setPageNum(page);
            setTimeout(() => {
                this.search();
            });
        }
    };

    handleFocusCustomer = (record) => {
        //请求数据
        let interestObj = {
            id: record.id,
            type: 'customer_interest'
        };
        var myUserId = crmUtil.getMyUserId();
        if (_.isArray(record.interest_member_ids) && _.indexOf(record.interest_member_ids, myUserId) > -1) {
            //取消关注客户
            interestObj.user_id = '';
        } else {
            //关注客户
            interestObj.user_id = myUserId;
        }
        var curPageCustomers = this.state.curPageCustomers;
        //暂存修改前的客户列表，（取消）关注客户失败后还原数据
        var initalCurPageCustomers = JSON.parse(JSON.stringify(curPageCustomers));
        //先更改星星的颜色,再发请求，这样页面不会显的比较卡
        var curCustomer = _.find(curPageCustomers, (customer) => {
            return record.id === customer.id;
        });
        if (curCustomer) {
            if(interestObj.user_id){//关注
                if (_.isArray(curCustomer.interest_member_ids)) {
                    curCustomer.interest_member_ids.push(interestObj.user_id);
                } else {
                    curCustomer.interest_member_ids = [interestObj.user_id];
                }
            } else {//取消关注
                curCustomer.interest_member_ids = _.filter(curCustomer.interest_member_ids, interestId => interestId !== myUserId);
            }
        }
        //更新详情中的关注图标颜色
        if(this.state.currentId === interestObj.id){
            CrmOverviewActions.updateBasicData(curCustomer);
        }
        //如果当前筛选的是我关注的客户，在列表中取消关注后要在列表中删除该条客户
        var condition = this.state.condition;
        if (condition && _.get(condition, 'interest_member_ids[0]') && !interestObj.user_id) {
            curPageCustomers = _.filter(curPageCustomers, (item) => {
                return item.id !== interestObj.id;
            });
        }
        this.setState(
            { curPageCustomers: curPageCustomers }
        );
        CrmAction.updateCustomer(interestObj, (errorMsg) => {
            //将星星的颜色修改回原来的状态及是否关注的状态改成初始状态
            if (errorMsg) {
                //还原详情中的关注图标颜色
                if(this.state.currentId === interestObj.id) {
                    let detailCustomer = _.find(initalCurPageCustomers, item => item.id === interestObj.id);
                    CrmOverviewActions.updateBasicData(detailCustomer);
                }
                //还原列表中的数据
                this.setState(
                    { curPageCustomers: initalCurPageCustomers }
                );
            }
        });
    };

    //渲染选择客户数的提示
    renderSelectCustomerTips = () => {
        //选择全部选项后，展示：已选择全部xxx项，<a>只选当前项</a>
        if (this.state.selectAllMatched) {
            return (
                <span>
                    {Intl.get('crm.8', '已选择全部{count}项', { count: this.state.customersSize })}
                    <a href="javascript:void(0)"
                        onClick={this.clearSelectAllSearchResult}>{Intl.get('crm.10', '只选当前展示项')}</a>
                </span>);
        } else {//只选择了当前页时，展示：已选当前页xxx项, <a>选择全部xxx项</a>
            return (
                <span>
                    {Intl.get('crm.11', '已选当前页{count}项', { count: this.state.selectedCustomer.length })}
                    {/*在筛选条件下可 全选 ，没有筛选条件时，后端接口不支持选 全选*/}
                    {_.isEmpty(this.state.condition) ? null : (
                        <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>
                            {Intl.get('crm.12', '选择全部{count}项', { count: this.state.customersSize })}
                        </a>)
                    }
                </span>);
        }
    };

    //删除导入预览中的重复客户
    deleteDuplicatImportCustomer = (index, e) => {
        const route = _.find(routeList, route => route.handler === 'deleteDuplicatImportCustomer');

        const params = {
            index
        };

        const arg = {
            url: route.path,
            type: route.method,
            params: params
        };
        Trace.traceEvent(e, '点击删除重复客户按钮');
        ajax(arg).then(result => {
            //    Trace.traceEvent('导入预览', '点击删除重复客户按钮');
            if (result && result.result === 'success') {
                var previewList = this.state.previewList;
                previewList.splice(index, 1);
                this.setState({
                    previewList: previewList
                });
            } else {
                message.error(Intl.get('crm.delete.duplicate.customer.failed', '删除重复客户失败'));
            }
        }, () => {
            message.error(Intl.get('crm.delete.duplicate.customer.failed', '删除重复客户失败'));
        });
        return e.stopPropagation();
    };

    toggleList = () => {
        this.setState({
            showFilterList: !this.state.showFilterList
        });
    };

    //获取排序
    getSorter = () => {
        let sorter = true;

        //从销售首页跳转过来的不显示排序
        if (this.props.fromSalesHome) {
            sorter = false;
        }

        return sorter;
    };

    hideClueRightPanel = () => {
        CrmAction.showClueDetail('');
    };

    //删除线索之后
    afterDeleteClue = () => {
        CrmAction.showClueDetail('');
    };

    state = {
        showFilterList: false,//是否展示筛选区域
        ...this.getStateData()
    };
    //是否没有筛选条件
    hasNoFilterCondition = () => {
        if (_.get(this.refs, 'filterinput.state.filterName')) {
            return false;
        } else {
            return true;
        }
    };
    renderAddAndImportBtns = () => {
        if (hasPrivilege('CUSTOMER_ADD')) {
            return (
                <div className="btn-containers">
                    <Button type='primary' className='import-btn'
                        onClick={this.showCrmTemplateRightPanel}>{Intl.get('crm.2', '导入客户')}</Button>
                    <Button className='add-clue-btn' onClick={this.showAddForm}>{Intl.get('crm.3', '添加客户')}</Button>
                </div>
            );
        } else {
            return null;
        }

    };

    //获取导入预览中的列
    getPrevColumns = () => {
        const column_width_min = 80, column_width = 120, column_width_max = 200;
        return [
            {
                title: Intl.get('crm.4', '客户名称'),
                width: column_width_max,
                dataIndex: 'name',
                render: (text, record, index) => {
                    let cls = classNames({
                        'repeat-item-name': record.name_repeat
                    });
                    return (<span className={cls}
                        title={record.name_repeat ? Intl.get('crm.name.exist', '客户名已存在！') : ''}>{text}</span>);
                }
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                width: column_width_min,
                dataIndex: 'contact_name',
            }, {
                title: Intl.get('clue.add.phone.num', '电话号码'),
                width: column_width,
                dataIndex: 'contact_phone',
                render: (text, record, index) => {
                    let cls = classNames({
                        'repeat-item-name': record.phone_repeat
                    });
                    return (
                        <div className={cls}
                            title={record.phone_repeat ? Intl.get('common.phone.is.existed', '电话已存在！') : ''}>
                            {_.map(record.contact_phone, (item, index) => {
                                return (<div key={index}>{item}</div>);
                            })}
                        </div>);
                }
            }, {
                title: 'QQ',
                width: column_width,
                dataIndex: 'contact_qq',
                render: (text, record, index) => {
                    return _.map(record.contact_qq, (item, index) => {
                        return (<div key={index}>{item}</div>);
                    });
                }
            }, {
                title: Intl.get('common.email', '邮箱'),
                width: column_width,
                dataIndex: 'contact_email',
                render: (text, record, index) => {
                    return _.map(record.contact_email, (item, index) => {
                        return (<div key={index}>{item}</div>);
                    });
                }
            }, {
                title: Intl.get('crm.contact.role', '联系人角色'),
                width: column_width_min,
                dataIndex: 'contact_role',
            }, {
                title: Intl.get('crm.113', '部门'),
                width: column_width,
                dataIndex: 'contact_department',
            }, {
                title: Intl.get('crm.91', '职位'),
                width: column_width_min,
                dataIndex: 'contact_position',
            }, {
                title: Intl.get('crm.6', '负责人'),
                width: column_width_min,
                dataIndex: 'user_name',
            }, {
                title: Intl.get('menu.trace', '跟进记录'),
                width: column_width,
                dataIndex: 'trace_record',
            }, {
                title: Intl.get('crm.add.time', '添加时间'),
                width: column_width,
                dataIndex: 'start_time',
            }, {
                title: Intl.get('common.industry', '行业'),
                width: column_width_min,
                dataIndex: 'industry',
            }, {
                title: Intl.get('crm.province.in', '所属省份'),
                width: column_width_min,
                dataIndex: 'province',
            }, {
                title: Intl.get('common.address', '地址'),
                width: column_width,
                dataIndex: 'address',
            }, {
                title: Intl.get('crm.competing.products', '竞品'),
                width: column_width_min,
                dataIndex: 'competing_products',
                render: (text, record, index) => {
                    return _.map(record.competing_products, (item, index) => {
                        return (<div key={index}>{item}</div>);
                    });
                }
            }, {
                title: Intl.get('common.remark', '备注'),
                width: column_width,
                dataIndex: 'remarks',
            }, {
                title: Intl.get('common.operate', '操作'),
                width: 50,
                render: (text, record, index) => {
                    //是否是重复的客户
                    const isRepeat = record.phone_repeat || record.name_repeat;
                    return (
                        <span className="cus-op" data-tracename="删除客户">
                            {isRepeat ? (
                                <Button className="order-btn-class" icon="delete"
                                    onClick={this.deleteDuplicatImportCustomer.bind(this, index)}
                                    title={Intl.get('common.delete', '删除')}/>
                            ) : null}
                        </span>
                    );
                }
            }
        ];
    }
    //将导入预览的数据转换为预览列表中展示所需数据
    handlePreviewList(list) {
        return _.map(list, item => {
            let start_time = _.get(item, 'start_time', '');
            start_time = start_time ? moment(start_time).format(oplateConsts.DATE_FORMAT) : '';
            return {
                name: _.get(item, 'name', ''),
                contact_name: _.get(item, 'contacts[0].name', ''),
                contact_phone: _.get(item, 'contacts[0].phone', ''),
                contact_qq: _.get(item, 'contacts[0].qq', ''),
                contact_email: _.get(item, 'contacts[0].email', ''),
                contact_role: _.get(item, 'contacts[0].role', ''),
                contact_department: _.get(item, 'contacts[0].department', ''),
                contact_position: _.get(item, 'contacts[0].position', ''),
                user_name: _.get(item, 'user_name', ''),
                trace_record: _.get(item, 'customer_traces[0].remark', ''),
                start_time,
                industry: _.get(item, 'industry', ''),
                province: _.get(item, 'province', ''),
                address: _.get(item, 'address', ''),
                competing_products: _.get(item, 'competing_products', ''),
                remarks: _.get(item, 'remarks', ''),
                name_repeat: _.get(item, 'name_repeat', false),
                phone_repeat: _.get(item, 'phone_repeat', false),
                repeat: _.get(item, 'name_repeat', false) || _.get(item, 'phone_repeat', false)
            };
        });
    }

    handleFocusCustomerTop(e) {
        let isConcernCustomerTop = !this.state.isConcernCustomerTop;
        CrmAction.setConcernCustomerTop(isConcernCustomerTop);
        setTimeout(() => {
            this.search();
        });
        //关注客户置顶标识修改后保存到个人配置上
        let personnelObj = {};
        personnelObj[oplateConsts.STORE_PERSONNAL_SETTING.CONCERN_CUSTOMER_TOP_FLAG] = isConcernCustomerTop;
        setWebsiteConfig(personnelObj);
    }

    //渲染带关注客户置顶图标的联系人列标题
    renderContactConcernTop() {
        let interestClassName = classNames('iconfont concern-customer-top-icon', {
            'icon-interested': this.state.isConcernCustomerTop,
            'icon-uninterested': !this.state.isConcernCustomerTop
        });
        let title = this.state.isConcernCustomerTop ? Intl.get('crm.concern.top.cancel', '取消关注客户置顶') : Intl.get('crm.concern.top.set', '设置关注客户置顶');
        return (
            <span>
                <span className={interestClassName} title={title}
                    onClick={this.handleFocusCustomerTop.bind(this)}/>
                <span>{Intl.get('call.record.contacts', '联系人')}</span>
            </span>);
    }
    render() {
        var _this = this;
        //只有有批量变更和合并客户的权限时，才展示选择框的处理
        let showSelectionFlag = hasPrivilege('CUSTOMER_MERGE_CUSTOMER') || hasPrivilege('CUSTOMER_BATCH_OPERATE');
        let rowSelection = showSelectionFlag ? {
            type: 'checkbox',
            selectedRowKeys: _.map(this.state.selectedCustomer, 'id'),
            onSelect: function(record, selected, selectedRows) {
                //如果一开始批量选择了全部，后来又取消了，则去掉选择全部
                if (selectedRows.length !== _this.state.curPageCustomers.length) {
                    _this.state.selectAllMatched = false;
                }
                _this.state.selectedCustomer = selectedRows;
                _this.setState(_this.state);
                Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.ant-table-selection-column'), '点击选中/取消选中某个客户');
            },
            //对客户列表当前页进行全选或取消全选操作时触发
            onSelectAll: function(selected, selectedRows, changeRows) {
                if (_this.state.selectAllMatched && selectedRows.length === 0) {
                    _this.state.selectAllMatched = false;
                }
                _this.setState({ selectedCustomer: selectedRows, selectAllMatched: _this.state.selectAllMatched });
                Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.ant-table-selection-column'), '点击选中/取消选中全部客户');
            }
        } : null;

        function rowKey(record, index) {
            return record.id;
        }

        const column_width = '80px';
        var columns = [
            {
                title: Intl.get('crm.4', '客户名称'),
                width: '240px',
                dataIndex: 'name',
                className: 'has-filter',
                sorter: this.getSorter(),
                render: function(text, record, index) {
                    var tagsArray = _.isArray(record.labels) ? record.labels : [];
                    //线索、转出、已回访标签不可操作的标签，在immutable_labels属性中，和普通标签一起展示
                    if (_.isArray(record.immutable_labels) && record.immutable_labels.length) {
                        tagsArray = record.immutable_labels.concat(tagsArray);
                    }
                    var tags = tagsArray.map(function(tag, index) {
                        return (<Tag key={index}>{tag}</Tag>);
                    });

                    const className = record.repeat ? 'repeat-item-name customer_name' : 'customer_name';
                    var isInterested = _.isArray(record.interest_member_ids) && _.indexOf(record.interest_member_ids, crmUtil.getMyUserId()) > -1;
                    var interestClassName = 'iconfont focus-customer';
                    interestClassName += (isInterested ? ' icon-interested' : ' icon-uninterested');
                    var title = (isInterested === 'true' ? Intl.get('crm.customer.uninterested', '取消关注') : Intl.get('crm.customer.interested', '添加关注'));
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
                                        {record.qualify_label === 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                                            record.qualify_label === 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ''}</Tag>) : null
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
                title: this.renderContactConcernTop(),
                width: column_width,
                dataIndex: 'contact',
                className: 'has-filter customer-contact-th',
            },
            {
                title: Intl.get('crm.5', '联系方式'),
                width: '130px',
                dataIndex: 'contact_way',
                className: 'column-contact-way  table-data-align-right',
                render: (text, record, index) => {
                    return this.getContactList(text, record, index);
                }
            },

            {
                title: Intl.get('user.apply.detail.order', '订单'),
                width: column_width,
                dataIndex: 'order',
                className: 'has-filter'
            },
            {
                title: Intl.get('crm.6', '负责人'),
                width: column_width,
                dataIndex: 'user_name',
                sorter: this.getSorter(),
                className: 'has-filter'
            },
            {
                title: Intl.get('crm.last.contact', '最后联系'),
                width: hasSecretaryAuth ? '150px' : '240px',
                dataIndex: 'last_contact_time',
                sorter: this.getSorter(),
                className: 'has-filter',
                render: function(text, record, index) {
                    //最后联系时间和跟进记录的合并
                    let time = record.last_contact_time ? record.last_contact_time : '';
                    let last_contact = '';
                    //舆情秘书不展示跟进记录
                    if (!hasSecretaryAuth && record.trace) {
                        last_contact = record.trace;
                    }
                    return (
                        <span>
                            <div className="last-contact-time">{time}</div>
                            <span title={last_contact} className="comments-fix">
                                <ShearContent>
                                    {last_contact}
                                </ShearContent>
                            </span>
                        </span>
                    );
                }
            },
            {
                title: Intl.get('user.login.score', '分数'),
                width: 60,
                dataIndex: 'score',
                align: 'right',
                sorter: this.getSorter(),
                className: 'has-filter'
            },
            {
                title: Intl.get('member.create.time', '创建时间'),
                width: '100px',
                dataIndex: 'start_time',
                sorter: this.getSorter(),
                className: 'has-filter table-data-align-right'
            },
            {
                title: Intl.get('common.operate', '操作'),
                width: 50,
                render: (text, record, index) => {
                    //是否是重复的客户
                    const isRepeat = record.repeat;
                    //是否处于导入状态
                    const isPreview = this.state.crmTemplateRightPanelShow;
                    //是否在客户列表上可以删除
                    const canDeleteOnCrmList = !isPreview && hasPrivilege('CRM_DELETE_CUSTOMER');
                    //是否在导入预览列表上可以删除
                    const canDeleteOnPreviewList = isPreview && isRepeat;
                    //是否显示删除按钮
                    const isDeleteBtnShow = canDeleteOnCrmList || canDeleteOnPreviewList;

                    return (
                        <span className="cus-op" data-tracename="删除客户">
                            {isDeleteBtnShow ? (
                                <Button className="order-btn-class" icon="delete"
                                    onClick={isRepeat ? _this.deleteDuplicatImportCustomer.bind(_this, index) : _this.confirmDelete.bind(null, record.id, record.name)}
                                    title={Intl.get('common.delete', '删除')} />
                            ) : null}
                        </span>
                    );
                }
            }
        ];
        if(!hasPrivilege('CRM_CUSTOMER_SCORE_RECORD')){
            columns = _.filter(columns, column => column.title !== Intl.get('user.login.score', '分数'));
        }

        //只对域管理员开放删除功能
        if (!userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            columns = _.filter(columns, column => column.title !== Intl.get('common.operate', '操作'));
        }
        const tableScrollX = hasSecretaryAuth ? 1000 : 1080;
        //初始加载，客户列表数据还没有取到时，不显示表格
        const shouldTableShow = (this.state.isLoading && !this.state.curPageCustomers.length) ? false : true;
        let selectCustomerLength = this.state.selectedCustomer.length;
        // if (this.state.rightPanelIsShow) {
        //     this.renderCustomerDetail();
        // }
        let customerOfCurUser = this.state.customerOfCurUser;
        const contentClassName = classNames({
            'content-container': !this.props.fromSalesHome,
            'content-full': !this.state.showFilterList
        });
        const tableLoadingClassName = classNames('table-loading-wrap', {
            'content-full': !this.state.showFilterList
        });

        return (<RightContent>
            <div className="crm_content">
                {
                    !this.props.fromSalesHome ?
                        <div className="top-nav-border-fix">
                            <div className="search-input-wrapper">
                                <FilterInput
                                    ref="filterinput"
                                    showSelectChangeTip={_.get(this.state.selectedCustomer, 'length')}
                                    toggleList={this.toggleList.bind(this)}
                                    onSubmit={this.handleAddCommonFilter.bind(this)}
                                />
                            </div>
                            <FilterBlock>
                                {selectCustomerLength ? (
                                    <div className="crm-list-selected-tip">
                                        <span className="iconfont icon-sys-notice" />
                                        {this.renderSelectCustomerTips()}
                                    </div>
                                ) : null}
                                <div style={{ display: selectCustomerLength ? 'none' : 'block' }}>
                                    <CrmFilter
                                        search={this.search.bind(this, true)}
                                        changeTableHeight={this.changeTableHeight}
                                        crmFilterValue={this.state.crmFilterValue}
                                    />
                                </div>
                                {this.renderHandleBtn()}
                                <div className="filter-block-line"></div>
                            </FilterBlock>
                        </div> : null
                }

                {this.state.isAddFlag ? (
                    <CRMAddForm
                        hideAddForm={this.hideAddForm}
                        addOne={this.addOne}
                        showRightPanel={this.showRightPanel}
                    />
                ) : null}
                <div id="content-block" className="content-block splice-table" ref="crmList"
                >
                    <div className="tbody"
                        ref="tableWrap"
                        style={{ height: this.state.tableHeight + '!important' }}
                    >
                        {
                            !this.props.fromSalesHome ?
                                <div
                                    className={this.state.showFilterList ? 'filter-container' : 'filter-container filter-close'}>
                                    <CrmFilterPanel
                                        ref="crmfilterpanel"
                                        search={this.search.bind(this, true)}
                                        showSelectTip={_.get(this.state.selectedCustomer, 'length')}
                                        style={{ width: 300, height: this.state.tableHeight + 100 }}
                                        filterPanelHeight={this.state.filterPanelHeight}
                                        changeTableHeight={this.changeTableHeight}
                                    />
                                </div> : null
                        }
                        <div className={contentClassName} style={{ display: shouldTableShow ? 'block' : 'none' }}>
                            {this.state.customersSize || this.state.getErrMsg ? <AntcTable
                                rowSelection={rowSelection}
                                rowKey={rowKey}
                                columns={columns}
                                loading={this.state.isLoading}
                                rowClassName={this.handleRowClassName}
                                dataSource={this.state.curPageCustomers}
                                util={{ zoomInSortArea: true }}
                                pagination={{
                                    total: this.state.customersSize,
                                    showTotal: total => {
                                        let str = Intl.get('crm.207', '共{count}个客户', { count: total });
                                        //首页活跃客户统计表格中的显示的活跃或非活跃客户数
                                        const showNum = _.get(this.props, 'location.state.num', 0);
                                        //由于合并或删除，已经不存在了的客户数
                                        const diffNum = showNum - total;

                                        if (showNum && diffNum) {
                                            str += ' (' + Intl.get('crm.num.customer.not.exist', '有{count}个客户已经被合并或删除后不存在了', {count: diffNum}) + ')';
                                        }
                                        return str;
                                    },

                                    pageSize: this.state.pageSize,
                                    onChange: this.onPageChange,
                                    current: this.state.pageNum
                                }}
                                onChange={this.onTableChange}
                                scroll={{ x: tableScrollX, y: this.state.tableHeight }}
                                locale={{
                                    emptyText: !this.state.isLoading ? (this.state.getErrMsg ? this.state.getErrMsg : Intl.get('common.no.more.filter.crm', '没有符合条件的客户')) : ''
                                }}
                            /> : <NoDataIntro
                                noDataAndAddBtnTip={Intl.get('contract.60', '暂无客户')}
                                renderAddAndImportBtns={this.renderAddAndImportBtns}
                                showAddBtn={this.hasNoFilterCondition()}
                                noDataTip={Intl.get('common.no.filter.crm', '没有符合条件的客户')}
                            />}
                        </div>

                    </div>
                </div>
                {!shouldTableShow ? (
                    <div className={tableLoadingClassName}>
                        <Spinner />
                    </div>
                ) : null}
                <ImportCrmTemplate
                    uploadActionName='customers'
                    importType={Intl.get('sales.home.customer', '客户')}
                    templateHref='/rest/crm/download_template'
                    uploadHref='/rest/crm/customers'
                    previewList={this.state.previewList}
                    showFlag={this.state.crmTemplateRightPanelShow}
                    getItemPrevList={this.getPrevColumns}
                    closeTemplatePanel={this.closeCrmTemplatePanel}
                    onItemListImport={this.onCustomerImport}
                    doImportAjax={this.doImport}
                    repeatAlertMessage={Intl.get('crm.repeat.delete', '红色标识客户名或电话已存在，请删除后再导入')}
                    regRules={REG_CRM_FILES_TYPE_RULES}
                    downLoadFileName={Intl.get('crm.sales.clue', '线索') + '.xls'}
                />

                {this.state.mergePanelIsShow ? (<CrmRightMergePanel
                    showFlag={this.state.mergePanelIsShow}
                    mergeCustomerList={this.state.selectedCustomer}
                    originCustomerList={this.state.originCustomerList}
                    hideMergePanel={this.hideMergePanel}
                    afterMergeCustomer={this.afterMergeCustomer}
                    refreshCustomerList={this.refreshCustomerList}
                />) : null}
                {this.state.clueId ? <ClueRightPanel
                    showFlag={true}
                    currentId={this.state.clueId}
                    hideRightPanel={this.hideClueRightPanel}
                    afterDeleteClue={this.afterDeleteClue}
                /> : null}
                {/*该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
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
                            {Intl.get('crm.15', '是否删除{cusName}？', { cusName: this.state.deleteCusName })}
                        </p>
                    </BootstrapModal.Body>
                    <BootstrapModal.Footer>
                        <BootstrapButton className="btn-ok" onClick={this.deleteCustomer}><ReactIntl.FormattedMessage
                            id="common.sure" defaultMessage="确定" /></BootstrapButton>
                        <BootstrapButton className="btn-cancel"
                            onClick={this.hideDeleteModal}><ReactIntl.FormattedMessage id="common.cancel"
                                defaultMessage="取消" /></BootstrapButton>
                    </BootstrapModal.Footer>
                </BootstrapModal>
            </div>
        </RightContent>);
    }
}
Crm.defaultProps = {
    location: {},
    fromSalesHome: false,
    showRepeatCustomer: function() {

    },
    params: {},
};
Crm.propTypes = {
    location: PropTypes.object,
    fromSalesHome: PropTypes.bool,
    showRepeatCustomer: PropTypes.func,
    params: PropTypes.object,
    showCustomerRecycleBin: PropTypes.func
};

module.exports = Crm;

