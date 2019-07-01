/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/23.
 */
var React = require('react');
var rightPanelShow = false;
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import { AUTHS, TAB_KEYS } from 'MOD_DIR/crm/public/utils/crm-util';
var clueCustomerStore = require('./store/clue-customer-store');
var clueFilterStore = require('./store/clue-filter-store');
var clueCustomerAction = require('./action/clue-customer-action');
var clueFilterAction = require('./action/filter-action');
var userData = require('../../../public/sources/user-data');
import Trace from 'LIB_DIR/trace';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {SearchInput, AntcTable} from 'antc';
import {message, Icon, Row, Col, Button, Alert, Select, Modal, Radio, Input,Tag} from 'antd';
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const Option = Select.Option;
import TopNav from 'CMP_DIR/top-nav';
import {removeSpacesAndEnter, getTableContainerHeight} from 'PUB_DIR/sources/utils/common-method-util';
import {XLS_FILES_TYPE_RULES} from 'PUB_DIR/sources/utils/consts';
require('./css/index.less');
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount, AVALIBILITYSTATUS} from './utils/clue-customer-utils';
var Spinner = require('CMP_DIR/spinner');
import clueCustomerAjax from './ajax/clue-customer-ajax';
import ContactItem from 'MOD_DIR/common_sales_home_page/public/view//contact-item';
import ClueAnalysisPanel from './views/clue-analysis-panel';
import SalesClueAddForm from './views/add-clues-form';
import ClueImportRightDetail from 'CMP_DIR/import_step';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
var RightContent = require('CMP_DIR/privilege/right-content');
import classNames from 'classnames';
import ClueToCustomerPanel from './views/clue-to-customer-panel';
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import ajax from 'ant-ajax';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {pathParamRegex} from 'PUB_DIR/sources/utils/validate-util';
var batchOperate = require('PUB_DIR/sources/push/batch');
import {FilterInput} from 'CMP_DIR/filter';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import ClueFilterPanel from './views/clue-filter-panel';
import {isSalesRole} from 'PUB_DIR/sources/utils/common-method-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import ShearContent from 'CMP_DIR/shear-content';
const AlertTimer = require('CMP_DIR/alert-timer');
const DELAY_TIME = 3000;
import AppUserManage from 'MOD_DIR/app_user_manage/public';
var batchPushEmitter = require('PUB_DIR/sources/utils/emitters').batchPushEmitter;
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';
//用于布局的高度
var LAYOUT_CONSTANTS = {
    FILTER_WIDTH: 300,
    TABLE_TITLE_HEIGHT: 60,//带选择框的TH高度
    TH_MORE_HEIGHT: 20//带选择框的TH60比不带选择框的TH40多出来的高度
};

class ClueCustomer extends React.Component {
    state = {
        clueAddFormShow: false,//
        rightPanelIsShow: rightPanelShow,//是否展示右侧客户详情
        accessChannelArray: accessChannelArray,//线索渠道
        clueSourceArray: clueSourceArray,//线索来源
        clueClassifyArray: clueClassifyArray,//线索分类
        isRemarkingItem: '',//正在标记的那条线索
        clueImportTemplateFormShow: false,//线索导入面板是否展示
        previewList: [],//预览列表
        clueAnalysisPanelShow: false,//线索分析面板是否展示
        showFilterList: isSalesRole() ? true : false,//是否展示线索筛选区域
        exportRange: 'filtered',
        isExportModalShow: false,//是否展示导出线索的模态框
        isEdittingItem: {},//正在编辑的那一条
        submitContent: '',//要提交的跟进记录的内容
        submitTraceErrMsg: '',//提交跟进记录出错的信息
        submitTraceLoading: false,//正在提交跟进记录
        showCustomerId: '',//正在展示客户详情的客户id
        isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
        isShowClueToCustomerPanel: false,//是否展示线索转客户面板
        isShowAddCustomerPanel: false,//是否展示添加客户面板
        customerOfCurUser: {},//当前展示用户所属客户的详情
        selectedClues: [],//获取批量操作选中的线索
        condition: {},
        filterClueStatus: clueFilterStore.getState().filterClueStatus,
        ...clueCustomerStore.getState()
    };
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };
    componentDidMount() {
        clueCustomerStore.listen(this.onStoreChange);
        //获取线索来源
        this.getClueSource();
        //获取线索渠道
        this.getClueChannel();
        //获取线索分类
        this.getClueClassify();
        clueCustomerAction.getSalesManList();
        //如果是销售角色，不需要发请求了
        if(!isSalesRole()){
            this.getClueList();
        }

        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_CHANGE_TRACE, this.batchChangeTraceMan);
        phoneMsgEmitter.on(phoneMsgEmitter.SETTING_CLUE_INVALID, this.invalidBtnClickedListener);
    }
    getUnhandledClue = () => {
        //现在只有普通销售有未读数
        clueFilterAction.setTimeType('all');
        clueFilterAction.setFilterClueAllotNoTrace('0');
        this.filterPanel.filterList.setDefaultFilterSetting();
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps,'history.action') === 'PUSH' && _.get(nextProps,'location.state.clickUnhandleNum')){

            var filterStoreData = clueFilterStore.getState();
            var checkAllotNoTraced = filterStoreData.filterAllotNoTraced === '0';//待我处理
            var checkedAdvance = false;//在高级筛选中是否有其他的选中项
            var checkOtherData = _.get(this,'filterPanel.filterList.props.advancedData',[]);//线索状态
            if (filterStoreData.filterClueAvailability === '1'){
                //是否选中线索无效的标签
                checkedAdvance = true;
            }
            if (!checkedAdvance){
                _.forEach(checkOtherData,(group) => {
                    var target = _.find(group.data, item => item.selected);
                    if (target){
                        checkedAdvance = true;
                        return;
                    }
                });
            }
            if (!checkedAdvance){
                var filterItem = ['filterClueAccess','filterClueClassify','filterClueProvince','filterClueSource'];//高级筛选的其他选项
                _.forEach(filterItem,(itemName) => {
                    if (_.get(filterStoreData,`[${itemName}].length`)){
                        checkedAdvance = true;
                        return;
                    }
                });
            }
            //点击数字进行跳转时，如果当前选中的条件只是待我审批的条件，那么就不需要清空数据,如果当前选中的除了待我审批的，还有其他的条件，就需要把数据进行情况  checkAllotNoTraced： 选中了待我审批  checkedAdvance： 还有其他筛选项
            if((!checkAllotNoTraced || (checkAllotNoTraced && checkedAdvance))){
                delete nextProps.location.state.clickUnhandleNum;
                clueCustomerAction.setClueInitialData();
                this.getUnhandledClue();
            }
        }
    }
    batchChangeTraceMan = (taskInfo, taskParams) => {
        //如果参数不合法，不进行更新
        if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
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
        var curClueLists = this.state.curClueLists;
        var clueArr = _.map(tasks, 'taskDefine');
        //遍历每一个客户
        _.each(clueArr, (clueId) => {
            //如果当前客户是需要更新的客户，才更新
            var target = _.find(curClueLists,item => item.id === clueId);
            if (target) {
                this.updateItem(target, taskParams, taskParams.isWillDistribute);
            }
        });
        clueCustomerAction.updateClueCustomers(curClueLists);
        this.setState({
            selectedClues: []
        });
    };
    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onStoreChange);
        this.hideRightPanel();
        //清空页面上的筛选条件
        clueFilterAction.setInitialData();
        clueCustomerAction.resetState();
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_CHANGE_TRACE, this.batchChangeTraceMan);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.SETTING_CLUE_INVALID, this.invalidBtnClickedListener);
    }
    invalidBtnClickedListener = (data) => {
        this.handleClickInvalidBtn(data.item, data.callback);
    };
    //展示右侧面板
    showClueDetailOut = (item) => {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(item.id);
        setTimeout(() => {
            this.renderClueDetail();
        });
    };
    renderClueDetail = () => {
        //触发打开带拨打电话状态的线索详情面板
        if (this.state.currentId) {
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
                clue_params: {
                    currentId: this.state.currentId,
                    showRightPanel: this.showClueDetailOut,
                    hideRightPanel: this.hideRightPanel,
                    curClue: this.state.curClue,
                    ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,

                    // refreshCustomerList: this.refreshCustomerList,
                    // updateCustomerDefContact: CrmAction.updateCustomerDefContact,
                    // updateCustomerLastContact: CrmAction.updateCustomerLastContact,
                    // handleFocusCustomer: this.handleFocusCustomer,

                }
            });
        }
    };
    hideRightPanel = () => {
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        //关闭右侧面板后，将当前展示线索的id置为空
        clueCustomerAction.setCurrentCustomer('');
    };

    onClueImport = (list) => {
        this.setState({
            previewList: this.handlePreviewList(list),
        });
    };
    //将导入预览的数据转换为预览列表中展示所需数据
    handlePreviewList(list) {
        return _.map(list, item => {
            if (_.get(item, 'errors')) {
                //导入组件中需要此参数进行判断是否展示错误提示
                item.repeat = true;
            }
            return item;
        });
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    getClueSource = () => {
        clueCustomerAjax.getClueSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索来源出错了 ' + errorMsg);
        });
    };

    getClueChannel = () => {
        clueCustomerAjax.getClueChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索渠道出错了 ' + errorMsg);
        });
    };

    getClueClassify = () => {
        clueCustomerAjax.getClueClassify().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueClassifyArray: _.union(this.state.clueClassifyArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索分类出错了 ' + errorMsg);
        });
    };

    //渲染导入线索的按钮
    renderImportClue = () => {
        return (
            <div className="import-clue-customer-container pull-right">
                {hasPrivilege('CUSTOMER_ADD_CLUE') ?
                    <Button type="primary" onClick={this.showImportClueTemplate} className="btn-item">
                        <span className="clue-container">
                            {Intl.get('clue.manage.import.clue', '导入{type}',{type: Intl.get('crm.sales.clue', '线索')})}
                        </span>
                    </Button>
                    : null}
            </div>
        );
    };
    //渲染导出线索的按钮
    renderExportClue = () => {
        return (
            <div className="export-clue-customer-container pull-right">
                <Button onClick={this.showExportClueModal} className="btn-item">
                    <span className="clue-container">
                        {Intl.get('clue.export.clue.list','导出线索')}
                    </span>
                </Button>
            </div>
        );
    };

    //点击导入线索按钮
    showImportClueTemplate = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-clue-customer-container'), '点击导入线索按钮');
        this.setState({
            clueImportTemplateFormShow: true
        });
    };
    //点击导出线索按钮
    showExportClueModal = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.export-clue-customer-container'), '点击导出线索按钮');
        this.setState({
            isExportModalShow: true
        });
    };
    hideExportModal = () => {
        this.setState({
            isExportModalShow: false
        });
    };

    //关闭导入线索模板
    closeClueTemplatePanel = () => {
        this.setState({
            clueImportTemplateFormShow: false,
            previewList: [],
        });
    };

    showClueAddForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-clue-customer-container'), '点击添加销售线索按钮');
        this.setState({
            clueAddFormShow: true
        });
    };

    //关闭增加线索面板
    hideClueAddForm = () => {
        this.setState({
            clueAddFormShow: false
        });
    };

    renderHandleBtn = () => {
        return (
            <div className="add-clue-customer-container pull-right">
                {hasPrivilege('CUSTOMER_ADD_CLUE') ?
                    <Button onClick={this.showClueAddForm}
                        className="btn-item"
                        title={Intl.get('crm.sales.add.clue', '添加线索')}>
                        <span className="button-container">{Intl.get('crm.sales.add.clue', '添加线索')}</span>
                    </Button> :
                    null
                }
            </div>
        );
    };
    clearSelectedClue = () => {
        this.setState({
            selectedClues: [],
            selectAllMatched: false
        });
    };
    //获取线索列表
    getClueList = (data) => {
        var rangeParams = _.get(data, 'rangeParams') || JSON.stringify(clueFilterStore.getState().rangeParams);
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        var typeFilter = getClueStatusValue(filterClueStatus);//线索类型
        var filterStoreData = clueFilterStore.getState();
        //按销售进行筛选
        var filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        var existFilelds = clueFilterStore.getState().exist_fields;
        //如果是筛选的重复线索，把排序字段改成repeat_id
        if (_.indexOf(existFilelds, 'repeat_id') > -1){
            clueCustomerAction.setSortField('repeat_id');
        }else{
            clueCustomerAction.setSortField('source_time');
        }
        var unExistFileds = clueFilterStore.getState().unexist_fields;
        var filterAllotNoTraced = clueFilterStore.getState().filterAllotNoTraced;//待我处理的线索

        var condition = this.getCondition();
        delete condition.rangeParams;
        if (_.isString(condition.typeFilter)){
            var typeFilterObj = JSON.parse(condition.typeFilter);
            for(var key in typeFilterObj){
                condition[key] = typeFilterObj[key];
            }
            delete condition.typeFilter;
        }
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(condition);
        this.setState({
            condition: condition
        });
        //跟据类型筛选
        const queryObj = {
            lastClueId: this.state.lastCustomerId,
            pageSize: this.state.pageSize,
            sorter: this.state.sorter,
            keyword: this.state.keyword,
            rangeParams: rangeParams,
            statistics_fields: 'status',
            typeFilter: _.get(data, 'typeFilter') || JSON.stringify(typeFilter),
            availability: AVALIBILITYSTATUS.AVALIBILITY
        };
        if (!this.state.lastCustomerId){
            //清除线索的选择
            this.clearSelectedClue();
        }
        //选中的线索来源
        var filterClueSource = filterStoreData.filterClueSource;
        if (_.isArray(filterClueSource) && filterClueSource.length){
            queryObj.clue_source = filterClueSource.join(',');
        }
        //选中的线索接入渠道
        var filterClueAccess = filterStoreData.filterClueAccess;
        if (_.isArray(filterClueAccess) && filterClueAccess.length){
            queryObj.access_channel = filterClueAccess.join(',');
        }
        //选中的线索分类
        var filterClueClassify = filterStoreData.filterClueClassify;
        if (_.isArray(filterClueClassify) && filterClueClassify.length){
            queryObj.clue_classify = filterClueClassify.join(',');
        }
        //选中的线索地域
        var filterClueProvince = filterStoreData.filterClueProvince;
        if (_.isArray(filterClueProvince) && filterClueProvince.length){
            queryObj.province = filterClueProvince.join(',');
        }
        if(_.isArray(existFilelds) && existFilelds.length){
            queryObj.exist_fields = JSON.stringify(existFilelds);
        }

        if(_.isArray(unExistFileds) && unExistFileds.length){
            queryObj.unexist_fields = JSON.stringify(unExistFileds);
        }
        if (filterAllotNoTraced){
            //取全部线索列表
            clueCustomerAction.getClueFulltextSelfHandle(queryObj);
        }else{
            //取全部线索列表
            clueCustomerAction.getClueFulltext(queryObj);
        }



    };
    //获取请求参数
    getCondition = (isGetAllClue) => {
        var filterStoreData = clueFilterStore.getState();
        var rangeParams = isGetAllClue ? [{
            from: clueStartTime,
            to: moment().valueOf(),
            type: 'time',
            name: 'source_time'
        }] : filterStoreData.rangeParams;
        var keyWord = isGetAllClue ? '' : this.state.keyword;
        var filterClueStatus = filterStoreData.filterClueStatus;
        var typeFilter = isGetAllClue ? {status: ''} : getClueStatusValue(filterClueStatus);//线索类型
        //按销售进行筛选
        var filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length && !isGetAllClue) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        var filterAllotNoTraced = filterStoreData.filterAllotNoTraced;//待我处理的线索
        if (filterAllotNoTraced && !isGetAllClue){
            typeFilter.allot_no_traced = filterAllotNoTraced;
        }
        var queryObj = {
            keyword: keyWord,
            rangeParams: JSON.stringify(rangeParams),
            typeFilter: JSON.stringify(typeFilter)
        };
        if (!isGetAllClue){
            //选中的线索来源
            var filterClueSource = filterStoreData.filterClueSource;
            if (_.isArray(filterClueSource) && filterClueSource.length) {
                queryObj.clue_source = filterClueSource.join(',');
            }
            //选中的线索接入渠道
            var filterClueAccess = filterStoreData.filterClueAccess;
            if (_.isArray(filterClueAccess) && filterClueAccess.length) {
                queryObj.access_channel = filterClueAccess.join(',');
            }
            //选中的线索分类
            var filterClueClassify = filterStoreData.filterClueClassify;
            if (_.isArray(filterClueClassify) && filterClueClassify.length) {
                queryObj.clue_classify = filterClueClassify.join(',');
            }
            //过滤无效线索
            var isFilterInavalibilityClue = filterStoreData.filterClueAvailability;
            if (isFilterInavalibilityClue) {
                queryObj.availability = isFilterInavalibilityClue;
            }
            //选中的线索地域
            var filterClueProvince = filterStoreData.filterClueProvince;
            if (_.isArray(filterClueProvince) && filterClueProvince.length){
                queryObj.province = filterClueProvince.join(',');
            }
            var existFilelds = filterStoreData.exist_fields;
            //如果是筛选的重复线索，把排序字段改成repeat_id
            if (_.indexOf(existFilelds, 'repeat_id') > -1){
                clueCustomerAction.setSortField('repeat_id');
            }else{
                clueCustomerAction.setSortField('source_time');
            }
            var unExistFileds = filterStoreData.unexist_fields;
            if(_.isArray(existFilelds) && existFilelds.length){
                queryObj.exist_fields = JSON.stringify(existFilelds);
            }
            if(_.isArray(unExistFileds) && unExistFileds.length){
                queryObj.unexist_fields = JSON.stringify(unExistFileds);
            }
        }
        return queryObj;
    };
    exportData = () => {
        Trace.traceEvent('线索管理', '导出线索');
        const sorter = this.state.sorter;
        var type = 'user';
        if (hasPrivilege('CUSTOMERCLUE_QUERY_FULLTEXT_MANAGER')){
            type = 'manager';
        }
        const params = {
            page_size: 10000,
            sort_field: sorter.field,
            order: sorter.order,
            type: type
        };
        const route = '/rest/customer/v2/customer/range/clue/export/:page_size/:sort_field/:order/:type';
        const url = route.replace(pathParamRegex, function($0, $1) {
            return params[$1];
        });
        const reqData = this.state.exportRange === 'all' ? this.getCondition(true) : this.getCondition();
        let form = $('<form>', {action: url, method: 'post'});
        form.append($('<input>', {name: 'reqData', value: JSON.stringify(reqData)}));
        //将构造的表单添加到body上
        //Chrome 56 以后不在body上的表单不允许提交了
        $(document.body).append(form);
        form.submit();
        form.remove();
        this.hideExportModal();
    };

    errTipBlock = () => {
        //加载完成，出错的情况
        var errMsg = <span>{this.state.clueCustomerErrMsg}
            <a onClick={this.getClueList}>
                {Intl.get('user.info.retry', '请重试')}
            </a>
        </span>;
        return (
            <div className="alert-wrap">
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon={true}
                />
            </div>
        );
    };
    getSubmitContent(propsItem) {
        return _.get(propsItem, 'customer_traces[0]', '') ? propsItem.customer_traces[0].remark : '';
    }

    afterAddClueTrace = (updateId) => {
        var clueCustomerTypeFilter = getClueStatusValue(clueFilterStore.getState().filterClueStatus);
        if (clueCustomerTypeFilter.status === SELECT_TYPE.WILL_TRACE){
            clueCustomerAction.afterAddClueTrace(updateId);
        }
    };

    handleContactLists = (contact) => {
        var clipContact = false;
        if (contact.length > 1){
            clipContact = true;
            contact.splice(1,contact.length - 1);
        }
        _.map(contact, (contactItem, idx) => {
            if (_.isArray(contactItem.phone) && contactItem.phone.length){
                if (contactItem.phone.length > 1){
                    contactItem.phone.splice(1, contactItem.phone.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.email) && contactItem.email.length || _.isArray(contactItem.qq) && contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact = true;

                }
                contactItem.email = [];
                contactItem.qq = [];
                contactItem.weChat = [];

            }
            if (_.isArray(contactItem.email) && contactItem.email.length){
                if (contactItem.email.length > 1){
                    contactItem.email.splice(1, contactItem.email.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.qq) && contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact = true;

                }
                contactItem.qq = [];
                contactItem.weChat = [];
            }
            if (_.isArray(contactItem.qq) && contactItem.qq.length){
                if (contactItem.qq.length > 1){
                    contactItem.qq.splice(1, contactItem.qq.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact = true;

                }
                contactItem.qq.splice(1, contactItem.qq.length - 1);
                contactItem.weChat = [];
            }
            if (_.isArray(contactItem.weChat) && contactItem.weChat.length){
                if (contactItem.weChat.length > 1){
                    contactItem.weChat.splice(1, contactItem.weChat.length - 1);
                    clipContact = true;
                }

            }
        });
        return {clipContact: clipContact,contact: contact};
    };
    handleEditTrace = (updateItem) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '点击添加/编辑跟进内容');
        this.setState({
            isEdittingItem: updateItem,
            submitContent: ''
        }, () => {
            if (this['changeTextare' + updateItem.id]) {
                this['changeTextare' + updateItem.id].focus();
            }
        });
    };
    handleInputChange = (e) => {
        e.preventDefault();
        //todo 如果用setState方法页面会卡顿
        this.state.submitContent = e.target.value;
        // this.setState({
        //     submitContent: e.target.value
        // });
    };
    handleSubmitContent = (item) => {
        if (this.state.submitTraceLoading) {
            return;
        }
        var value = _.get(item, 'customer_traces[0].remark', '');
        if (Oplate && Oplate.unread && item.status === SELECT_TYPE.WILL_TRACE) {
            subtracteGlobalClue(item);
        }
        //获取填写的保存跟进记录的内容
        var textareVal = _.trim(this.state.submitContent);
        if (!textareVal) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            var submitObj = {
                'lead_id': item.id,
                'type': 'other',
                'remark': textareVal
            };
            this.setState({
                submitTraceLoading: true,
            });
            clueCustomerAction.addCluecustomerTrace(submitObj, (result) => {
                if (result && result.error) {
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: Intl.get('common.save.failed', '保存失败')
                    });
                } else {
                    var clueItem = _.find(this.state.curClueLists, clueItem => clueItem.id === item.id);
                    clueItem.status = SELECT_TYPE.HAS_TRACE;
                    var userId = userData.getUserData().user_id || '';
                    var userName = userData.getUserData().nick_name;
                    var addTime = moment().valueOf();
                    if (!clueItem.customer_traces) {
                        clueItem.customer_traces = [
                            {
                                remark: textareVal,
                                user_id: userId,
                                nick_name: userName,
                                add_time: addTime
                            }];
                    } else {
                        //原来有customer_traces这个属性时，数组中除了remark还有别的属性
                        clueItem.customer_traces[0].remark = textareVal;
                        clueItem.customer_traces[0].user_id = userId;
                        clueItem.customer_traces[0].nick_name = userName;
                        clueItem.customer_traces[0].add_time = addTime;
                    }
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: '',
                        isEdittingItem: {},
                    });
                    //如果是待跟进状态,需要在列表中删除并且把数字减一
                    this.afterAddClueTrace(item.id);
                }
            });
        }
    };
    handleCancelBtn = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '取消保存跟进内容');
        this.setState({
            submitTraceErrMsg: '',
            isEdittingItem: {},
            submitContent: ''
        });
    };

    renderEditTraceContent = (salesClueItem) => {
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                submitTraceErrMsg: '',
            });
        };
        return (
            <div className="edit-trace-content">
                {this.state.submitTraceErrMsg ? (
                    <div className="has-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.submitTraceErrMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                ) : null}
                <TextArea onScroll={event => event.stopPropagation()} ref={changeTextare => this['changeTextare' + salesClueItem.id] = changeTextare} placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')} onChange={this.handleInputChange}
                />
                <div className="save-cancel-btn">
                    <Button type='primary' onClick={this.handleSubmitContent.bind(this, salesClueItem)}
                        disabled={this.state.submitTraceLoading} data-tracename="保存跟进内容">
                        {Intl.get('common.save', '保存')}
                        {this.state.submitTraceLoading ? <Icon type="loading"/> : null}
                    </Button>
                    <Button className='cancel-btn'
                        onClick={this.handleCancelBtn}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
    };
    renderShowTraceContent = (salesClueItem) => {
        var traceContent = _.get(salesClueItem, 'customer_traces[0].remark', '');//该线索的跟进内容
        var traceAddTime = _.get(salesClueItem, 'customer_traces[0].call_date') || _.get(salesClueItem, 'customer_traces[0].add_time');//跟进时间
        return (
            <div className="foot-text-content" key={salesClueItem.id}>
                {/*有跟进记录*/}
                {traceContent ?
                    <div className="record-trace-container">
                        <ShearContent>
                            <span className="trace-time">{traceAddTime ? moment(traceAddTime).format(oplateConsts.DATE_FORMAT) : ''}</span>
                            <span>
                                {traceContent}
                            </span>
                        </ShearContent>
                    </div>
                    : hasPrivilege('CLUECUSTOMER_ADD_TRACE') ?
                        <span className='add-trace-content'
                            onClick={this.handleEditTrace.bind(this, salesClueItem)}>{Intl.get('clue.add.trace.content', '添加跟进内容')}</span>
                        : null}

            </div>

        );
    };
    showCustomerDetail = (customerId) => {
        this.setState({
            showCustomerId: customerId
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    };
    closeRightPanel = () => {
        this.setState({
            showCustomerId: ''
        });
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
    //标记线索无效或者有效
    handleClickInvalidBtn = (item, callback) => {
        var updateValue = AVALIBILITYSTATUS.INAVALIBILITY;
        if (item.availability === AVALIBILITYSTATUS.INAVALIBILITY) {
            updateValue = AVALIBILITYSTATUS.AVALIBILITY;
        }
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isInvalidClue: item.id,
        });

        clueCustomerAction.updateCluecustomerDetail(submitObj, (result) => {
            if (_.isString(result)) {
                this.setState({
                    isInvalidClue: '',
                });
            } else {
                _.isFunction(callback) && callback(updateValue);
                var salesClueItemDetail = _.find(this.state.curClueLists, clueItem => clueItem.id === item.id);
                salesClueItemDetail.invalid_info = {
                    user_name: userData.getUserData().nick_name,
                    time: moment().valueOf()
                };
                salesClueItemDetail.availability = updateValue;
                clueCustomerAction.updateClueProperty({
                    id: item.id,
                    availability: updateValue,
                    status: SELECT_TYPE.HAS_TRACE
                });
                this.setState({
                    isInvalidClue: '',
                    salesClueItemDetail: salesClueItemDetail
                });
            }
        });
    };
    renderInavailabilityOrValidClue = (salesClueItem) => {
        //是否有标记线索无效的权限
        var avalibilityPrivilege = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        var isEditting = this.state.isInvalidClue === salesClueItem.id;
        var inValid = salesClueItem.availability === '1';
        return(
            <span className="valid-or-invalid-container">
                {avalibilityPrivilege ? <span className="cancel-invalid" onClick={this.handleClickInvalidBtn.bind(this, salesClueItem)}
                    data-tracename="取消判定线索无效" disabled={isEditting}>
                    {inValid ? <span className="can-edit"> {Intl.get('clue.cancel.set.invalid', '改为有效')}</span> : <span className="can-edit">{Intl.get('clue.customer.set.invalid', '标为无效')}</span>}
                    {isEditting ? <Icon type="loading"/> : null}
                </span> : null}
            </span>

        );

    };
    renderAvailabilityClue = (salesClueItem) => {
        //是有效线索
        let availability = salesClueItem.availability !== '1';
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID'));
        return(
            <div className="avalibility-container">
                <div className="associate-customer">
                    {associatedPrivilege ? (
                        <span
                            className="can-edit"
                            style={{marginRight: 15}}
                            onClick={this.onConvertToCustomerBtnClick.bind(this, salesClueItem.id, salesClueItem.name)}
                        >
                            {Intl.get('common.convert.to.customer', '转为客户')}
                        </span> 
                    ) : null}

                    {this.renderInavailabilityOrValidClue(salesClueItem)}
                </div>
            </div>
        );

    };
    handleChangeSelectedType = (selectedType) => {
        clueFilterAction.setFilterType(selectedType);
        this.onTypeChange();
    };
    isFireFoxBrowser = () => {
        return navigator.userAgent.toUpperCase().indexOf('FIREFOX') > -1;
    };
    getClueTypeTab = () => {
        var filterStore = clueFilterStore.getState();
        var filterClueStatus = filterStore.filterClueStatus;
        var typeFilter = getClueStatusValue(filterClueStatus);//线索类型
        var willDistCls = classNames('clue-status-tab', {'active-will-distribute': SELECT_TYPE.WILL_DISTRIBUTE === typeFilter.status});
        var willTrace = classNames('clue-status-tab', {'active-will-trace': SELECT_TYPE.WILL_TRACE === typeFilter.status});
        var hasTrace = classNames('clue-status-tab', {'active-has-trace': SELECT_TYPE.HAS_TRACE === typeFilter.status});
        var hasTransfer = classNames('clue-status-tab', {'active-has-transfer': SELECT_TYPE.HAS_TRANSFER === typeFilter.status});
        var statics = this.state.agg_list;
        const clueStatusCls = classNames('clue-status-wrap',{
            'show-clue-filter': this.state.showFilterList,
            'firefox-padding': this.isFireFoxBrowser()
        });
        return <span className={clueStatusCls}>
            {isSalesRole() ? null : <span className={willDistCls}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.WILL_DISTRIBUTE)}>{Intl.get('clue.customer.will.distribution', '待分配')}
                <span className="clue-status-num">{_.get(statics,'willDistribute','')}</span>
            </span>}
            <span className={willTrace}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.WILL_TRACE)}>{Intl.get('sales.home.will.trace', '待跟进')}
                <span className="clue-status-num">{_.get(statics,'willTrace','')}</span>
            </span>
            <span className={hasTrace}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.HAS_TRACE)}>{Intl.get('clue.customer.has.follow', '已跟进')}
                <span className="clue-status-num">{_.get(statics,'hasTrace','')}</span>
            </span>
            <span className={hasTransfer}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.HAS_TRANSFER)}>{Intl.get('clue.customer.has.transfer', '已转化')}
                <span className="clue-status-num">{_.get(statics,'hasTransfer','')}</span>
            </span>
        </span>;
    };
   showClueDetailPanel = (salesClueItem) => {
       phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
           clue_params: {
               curClue: salesClueItem,
               currentId: salesClueItem.id
           }
       });
   };
    getClueTableColunms = () => {
        const column_width = '80px';
        let columns = [
            {
                dataIndex: 'clue_name',
                width: '350px',
                render: (text, salesClueItem, index) => {
                    return (
                        <div className="clue-top-title" >
                            <span className="hidden record-id">{salesClueItem.id}</span>
                            <span className="clue-name" data-tracename="查看线索详情"
                                onClick={this.showClueDetailOut.bind(this, salesClueItem)}>{salesClueItem.name}</span>
                            <div className="clue-trace-content" key={salesClueItem.id + index}>
                                <ShearContent>
                                    <span>
                                        <span className="clue_source_time">{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}&nbsp;</span>
                                        
                                        <span>{salesClueItem.source ? Intl.get('clue.item.acceess.channel', '描述：{content}',{content: salesClueItem.source}) : null}</span>

                                    </span>
                                </ShearContent>
                            </div>
                        </div>
                    );

                }
            },{
                dataIndex: 'contact',
                width: '230px',
                render: (text, salesClueItem, index) => {
                    //联系人的相关信息
                    var contacts = salesClueItem.contacts ? salesClueItem.contacts : [];
                    if (_.isArray(contacts) && contacts.length){
                        //处理联系方式，处理成只有一种联系方式
                        var handledContactObj = this.handleContactLists(_.cloneDeep(contacts));
                        var hasMoreIconPrivilege = handledContactObj.clipContact;
                        return (
                            <div className="contact-container">
                                <ContactItem
                                    contacts={handledContactObj.contact}
                                    customerData={salesClueItem}
                                    showContactLabel={false}
                                    hasMoreIcon={hasMoreIconPrivilege}
                                    showClueDetailPanel={this.showClueDetailPanel.bind(this, salesClueItem)}
                                />
                                {hasMoreIconPrivilege ? <i className="iconfont icon-more" onClick={this.showClueDetailOut.bind(this, salesClueItem)}/> : null}
                            </div>

                        );
                    }else{
                        return null;
                    }

                }
            },{
                dataIndex: 'trace_person',
                width: '100px',
                render: (text, salesClueItem, index) => {
                    let user = userData.getUserData();
                    var handlePersonName = _.get(salesClueItem,'user_name','');//当前跟进人
                    //分配线索给销售的权限
                    var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
                    var assigenCls = classNames('assign-btn',{'can-edit': !handlePersonName});
                    var containerCls = classNames('handle-and-trace',{'assign-privilege': hasAssignedPrivilege});
                    return (
                        <div className={containerCls} ref='trace-person'>
                            {/*有分配权限*/}
                            {hasAssignedPrivilege ?
                                <AntcDropdown
                                    ref={changeSale => this['changesale' + salesClueItem.id] = changeSale}
                                    content={<span
                                        data-tracename="点击分配线索客户按钮"
                                        className={assigenCls}> {handlePersonName || Intl.get('clue.customer.distribute', '分配')}</span>}
                                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                                    okTitle={Intl.get('common.confirm', '确认')}
                                    cancelTitle={Intl.get('common.cancel', '取消')}
                                    isSaving={this.state.distributeLoading}
                                    overlayContent={this.renderSalesBlock()}
                                    handleSubmit={this.handleSubmitAssignSales.bind(this, salesClueItem)}
                                    unSelectDataTip={this.state.unSelectDataTip}
                                    clearSelectData={this.clearSelectSales}
                                    btnAtTop={false}
                                /> : handlePersonName
                            }
                        </div>
                    );

                }
            },{
                dataIndex: 'trace_content',
                width: '300px',
                render: (text, salesClueItem, index) => {
                    return(
                        <div className="clue-foot" id="clue-foot">
                            {_.get(this,'state.isEdittingItem.id') === salesClueItem.id ? this.renderEditTraceContent(salesClueItem) :
                                this.renderShowTraceContent(salesClueItem)
                            }
                        </div>
                    );
                }
            }];
        //只有不是待跟进状态，才能展示操作区域
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        var typeFilter = getClueStatusValue(filterClueStatus);//线索类型
        if (typeFilter.status === SELECT_TYPE.HAS_TRACE){
            columns.push({
                className: 'invalid-td-clue',
                width: '150px',
                render: (text, salesClueItem, index) => {
                    //是有效线索
                    let availability = salesClueItem.availability !== '1';
                    return (
                        <div className="avalibity-or-invalid-container">
                            {availability ? this.renderAvailabilityClue(salesClueItem) : this.renderInavailabilityOrValidClue(salesClueItem)}
                        </div>
                    );
                }
            });
        }
        return columns;
    };

    //转为客户按钮点击事件
    onConvertToCustomerBtnClick = (clueId, clueName) => {
        //线索名为空时不能执行转为客户的操作
        //此时提示用户完善客户名
        if (!clueName) {
            message.error(Intl.get('clue.need.complete.clue.name', '请先完善线索名'));

            return;
        }

        //设置当前线索
        clueCustomerAction.setCurrentCustomer(clueId);
        
        //权限类型
        const authType = hasPrivilege(AUTHS.GETALL) ? 'manager' : 'user';

        //根据线索名称查询相似客户
        ajax.send({
            url: `/rest/customer/v3/customer/range/${authType}/20/1/start_time/descend`,
            type: 'post',
            data: {
                query: {
                    name: clueName
                }
            }
        })
            .done(result => {
                const existingCustomers = _.get(result, 'result');

                //若存在相似客户
                if (_.isArray(existingCustomers) && !_.isEmpty(existingCustomers)) {
                    this.setState({
                        //显示线索转客户面板
                        isShowClueToCustomerPanel: true,
                        //不显示添加客户面板
                        isShowAddCustomerPanel: false,
                        //保存相似客户
                        existingCustomers
                    });
                } else {
                    this.setState({
                        //不显示线索转客户面板
                        isShowClueToCustomerPanel: false,
                        //显示添加客户面板
                        isShowAddCustomerPanel: true,
                        //清空相似客户
                        existingCustomers: []
                    });
                }
            })
            .fail(err => {
                const errMsg = Intl.get('member.apply.approve.tips', '操作失败') + Intl.get('user.info.retry', '请重试');
                message.error(errMsg);
            });
    };

    //隐藏线索转客户面板
    hideClueToCustomerPanel = () => {
        this.setState({isShowClueToCustomerPanel: false});
    };

    //显示添加客户面板
    showAddCustomerPanel = () => {
        this.setState({isShowAddCustomerPanel: true});
    };

    //隐藏添加客户面板
    hideAddCustomerPanel = () => {
        this.setState({isShowAddCustomerPanel: false});
    };

    //在列表中隐藏当前操作的线索
    hideCurClue = () => {
        const index = _.findIndex(this.state.curClueLists, item => item.id === this.state.curClue.id);
        
        $('.clue-customer-list .ant-table-body tr:nth-child(' + (index + 1) + ')').slideToggle(2000);
    }

    //线索转为新客户完成后的回调事件
    onConvertClueToNewCustomerDone = () => {
        const msgInfo = Intl.get('crm.3', '添加客户') + Intl.get('contract.41', '成功');
        message.success(msgInfo);

        //在列表中隐藏当前操作的线索
        this.hideCurClue();

        //隐藏添加客户面板
        this.hideAddCustomerPanel();
    };

    setInvalidClassName= (record, index) => {
        return (record.availability === '1' ? 'invalid-clue' : '');
    };
    getRowSelection = () => {
        //只有有批量变更权限并且不是普通销售的时候，才展示选择框的处理
        let showSelectionFlag = (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER')) && !userData.getUserData().isCommonSales;
        if (showSelectionFlag){
            let rowSelection = {
                type: 'checkbox',
                selectedRowKeys: _.map(this.state.selectedClues, 'id'),
                onSelect: (record, selected, selectedRows) => {
                    if (selectedRows.length !== _.get(this, 'state.curClueLists.length')) {
                        this.state.selectAllMatched = false;
                    }
                    this.setState({
                        selectedClues: selectedRows,
                        selectAllMatched: this.state.selectAllMatched
                    });
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中某个线索');
                },
                //对客户列表当前页进行全选或取消全选操作时触发
                onSelectAll: (selected, selectedRows, changeRows) => {
                    if (this.state.selectAllMatched && selectedRows.length === 0) {
                        this.state.selectAllMatched = false;
                    }
                    this.setState({selectedClues: selectedRows, selectAllMatched: this.state.selectAllMatched});
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中全部线索');
                }
            };
            return rowSelection;

        }else{
            return null;
        }
    };
    renderClueCustomerLists = () => {
        var customerList = this.state.curClueLists;
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBarBottom,
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('common.no.more.clue', '没有更多线索了'),
            loading: this.state.isLoading,
        };
        var rowSelection = this.getRowSelection();
        function rowKey(record, index) {
            return record.id;
        }
        return (
            <AntcTable
                rowSelection={rowSelection}
                rowKey={rowKey}
                dropLoad={dropLoadConfig}
                dataSource={customerList}
                pagination={false}
                columns={this.getClueTableColunms()}
                rowClassName={this.setInvalidClassName}
                scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
            />);

    };

    clearSelectSales = () => {
        clueCustomerAction.setSalesMan({'salesMan': ''});
        clueCustomerAction.setSalesManName({'salesManNames': ''});
    };
    getSalesDataList = () => {
        let dataList = [];
        var clueSalesIdList = getClueSalesList();
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        this.state.salesManList.forEach((salesman) => {
            let teamArray = salesman.user_groups;
            var clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'user_info.user_id'));
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                teamArray.forEach(team => {
                    let teamName = _.get(team, 'group_name') ? ` - ${team.group_name}` : '';
                    let teamId = _.get(team, 'group_id') ? `&&${team.group_id}` : '';
                    dataList.push({
                        name: _.get(salesman, 'user_info.nick_name', '') + teamName,
                        value: _.get(salesman, 'user_info.user_id', '') + teamId,
                        clickCount: clickCount
                    });
                });
            }
        });
        return dataList;
    };
    renderSalesBlock = () => {
        var dataList = this.getSalesDataList();
        //按点击的次数进行排序
        dataList = _.sortBy(dataList,(item) => {return -item.clickCount;});
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    };
    //批量修改或者单个修改线索的跟进人，发请求前的处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (!this.state.salesMan) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            let sale_id = '', team_id = '', sale_name = '', team_name = '';
            //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
            let idArray = this.state.salesMan.split('&&');
            if (_.isArray(idArray) && idArray.length) {
                sale_id = idArray[0];//销售的id
                team_id = idArray[1];//团队的id
            }
            //销售的名字和团队的名字 格式是 销售名称 -团队名称
            let nameArray = this.state.salesManNames.split('-');
            if (_.isArray(nameArray) && nameArray.length) {
                sale_name = nameArray[0];//销售的名字
                team_name = _.trim(nameArray[1]);//团队的名字
            }
            var submitObj = {
                'sale_id': sale_id,
                'sale_name': sale_name,
                'team_id': team_id,
                'team_name': team_name,
            };
            if (itemId){
                submitObj.customer_id = itemId;
            }
            return submitObj;
        }
    };
    updateItem = (item, submitObj,isWillDistribute) => {
        let sale_id = _.get(submitObj,'sale_id',''), team_id = _.get(submitObj,'team_id',''), sale_name = _.get(submitObj,'sale_name',''), team_name = _.get(submitObj,'team_name','');
        SetLocalSalesClickCount(sale_id);
        //member_id是跟进销售的id
        if (Oplate && Oplate.unread && item.status === SELECT_TYPE.WILL_TRACE) {
            subtracteGlobalClue(item,(flag) => {
                var filterAllotNoTraced = clueFilterStore.getState().filterAllotNoTraced;//待我处理的线索
                if (flag && filterAllotNoTraced){
                    //需要在列表中删除
                    clueCustomerAction.afterAddClueTrace(item.id);
                }
            });


        }
        if (!isWillDistribute){
            item.user_name = sale_name;
            item.user_id = sale_id;
            item.sales_team = team_name;
            item.sales_team_id = team_id;
            if (item.status !== SELECT_TYPE.HAS_TRACE){
                item.status = SELECT_TYPE.WILL_TRACE;
            }
        }
    };
    //单个及批量修改跟进人完成后的处理
    afterHandleAssignSalesBatch = (feedbackObj,submitObj,item) => {
        let clue_id = _.get(submitObj,'customer_id','');//线索的id，可能是一个，也可能是多个
        if (feedbackObj && feedbackObj.errorMsg) {
            message.error(feedbackObj.errorMsg || Intl.get('failed.to.distribute.cluecustomer', '分配线索客户失败'));
        } else {
            var clueCustomerTypeFilter = getClueStatusValue(clueFilterStore.getState().filterClueStatus);
            //如果是待分配状态，分配完之后要在列表中删除一个,在待跟进列表中增加一个
            var isWillDistribute = clueCustomerTypeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE;
            if (item){
                //有item的是单个修改跟进人
                this.updateItem(item,submitObj,isWillDistribute);
                if (this['changesale' + clue_id]) {
                    //隐藏批量变更销售面板
                    this['changesale' + clue_id].handleCancel();
                }
            }else{
                //这个是批量修改联系人
                if (this.refs.changesales) {
                    //隐藏批量变更销售面板
                    this.refs.changesales.handleCancel();
                }
                var taskId = _.get(feedbackObj, 'taskId','');
                if (taskId){
                    //向任务列表id中添加taskId
                    batchOperate.addTaskIdToList(taskId);
                    //存储批量操作参数，后续更新时使用
                    var batchParams = _.cloneDeep(submitObj);
                    batchParams.isWillDistribute = isWillDistribute;
                    batchOperate.saveTaskParamByTaskId(taskId, batchParams, {
                        showPop: true,
                        urlPath: '/clue_customer'
                    });
                    //立即在界面上显示推送通知
                    //界面上立即显示一个初始化推送
                    var totalSelectedSize = _.get(this,'state.selectedClues.length',0);
                    batchOperate.batchOperateListener({
                        taskId: taskId,
                        total: totalSelectedSize,
                        running: totalSelectedSize,
                        typeText: Intl.get('clue.batch.change.trace.man', '变更跟进人')
                    });
                }
            }
            if (isWillDistribute) {
                clueCustomerAction.afterAssignSales(clue_id);
            }
            this.setState({
                curClueLists: this.state.curClueLists
            });

        }
    };
    //批量修改跟进人
    handleSubmitAssignSalesBatch = () => {
        //如果是选了修改全部
        var selectedClueIds = '', selectClueAll = this.state.selectAllMatched;
        if (!selectClueAll){
            var cluesArr = _.map(this.state.selectedClues, item => item.id);
            selectedClueIds = cluesArr.join(',');
        }
        var submitObj = this.handleBeforeSumitChangeSales(selectedClueIds);
        if (selectClueAll){
            submitObj.query_param = {
                query: this.state.condition,
                rangeParams: this.state.rangeParams,
            };
        }
        if (_.isEmpty(submitObj)){
            return;
        }else{
            clueCustomerAction.distributeCluecustomerToSaleBatch(_.cloneDeep(submitObj), (feedbackObj) => {
                this.afterHandleAssignSalesBatch(feedbackObj,submitObj);
            });
        }
    };
    //修改跟进人
    handleSubmitAssignSales = (item) => {
        var submitObj = this.handleBeforeSumitChangeSales(item.id);
        if (_.isEmpty(submitObj)){
            return;
        }else{
            clueCustomerAction.distributeCluecustomerToSale(_.cloneDeep(submitObj), (feedbackObj) => {
                this.afterHandleAssignSalesBatch(feedbackObj,submitObj,item);
            });
        }
    };

    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        clueCustomerAction.setSalesMan({'salesMan': salesMan});
    };

    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
    };

    handleScrollBarBottom = () => {
        var currListLength = _.isArray(this.state.curClueLists) ? this.state.curClueLists.length : 0;
        // 判断加载的条件
        if (currListLength <= this.state.customersSize) {
            this.getClueList();
        }
    };

    renderClueCustomerBlock = () => {
        var divHeight = getTableContainerHeight();
        if (this.state.curClueLists.length) {
            return (
                <div id="clue-content-block" className="clue-content-block" ref="clueCustomerList">
                    <div className="clue-customer-list"
                        style={{height: divHeight + LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
                        id="area"
                    >
                        {this.renderClueCustomerLists()}
                    </div>
                </div>
            );
        }else{
            return null;
        }
    };

    showNoMoreDataTip = () => {
        return !this.state.isLoading &&
            this.state.curClueLists.length >= 20 && !this.state.listenScrollBottom;
    };

    onTypeChange = () => {
        clueCustomerAction.setClueInitialData();
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        setTimeout(() => {
            this.getClueList();
        });
    };

    renderAddAndImportBtns = () => {
        if (hasPrivilege('CUSTOMER_ADD_CLUE')){
            return (
                <div className="btn-containers">
                    <Button type='primary' className='import-btn' onClick={this.showImportClueTemplate}>{Intl.get('clue.manage.import.clue', '导入{type}',{type: Intl.get('crm.sales.clue', '线索')})}</Button>
                    <Button className='add-clue-btn' onClick={this.showClueAddForm}>{Intl.get('crm.sales.add.clue', '添加线索')}</Button>
                </div>
            );
        }else{
            return null;
        }

    };
    //是否有筛选过滤条件
    hasNoFilterCondition = () => {
        var filterStoreData = clueFilterStore.getState();
        if (_.isEmpty(filterStoreData.filterClueSource) && _.isEmpty(filterStoreData.filterClueAccess) && _.isEmpty(filterStoreData.filterClueClassify) && filterStoreData.filterClueAvailability === '' && _.get(filterStoreData,'filterClueStatus[0].selected') && _.get(filterStoreData, 'rangeParams[0].from') === clueStartTime && this.state.keyword === '' && _.isEmpty(filterStoreData.exist_fields) && _.isEmpty(filterStoreData.unexist_fields) && _.isEmpty(filterStoreData.filterClueProvince)){
            return true;
        }else{
            return false;
        }
    };
    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent = () => {
        //加载中的展示
        if (this.state.isLoading && !this.state.lastCustomerId) {
            return (
                <div className="load-content">
                    <Spinner />
                    <p className="abnornal-status-tip">{Intl.get('common.sales.frontpage.loading', '加载中')}</p>
                </div>
            );
        } else if (this.state.clueCustomerErrMsg) {
            //加载完出错的展示
            return (
                <div className="err-content">
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{this.state.clueCustomerErrMsg}</p>
                </div>
            );
        }
        else if (!this.state.isLoading && !this.state.clueCustomerErrMsg && !this.state.curClueLists.length) {
            //如果有筛选条件时
            return (
                <NoDataIntro
                    renderAddAndImportBtns={this.renderAddAndImportBtns}
                    showAddBtn={false}
                    noDataTip={Intl.get('clue.no.data.during.range.and.status', '没有符合条件的线索')}
                />
            );
        }
        else {
            //渲染线索列表
            return this.renderClueCustomerBlock();
        }
    };

    //点击展开线索分析面板
    handleClueAnalysisPanel = () => {
        this.setState({
            clueAnalysisPanelShow: true
        });
    };

    //点击关闭线索分析面板
    closeClueAnalysisPanel = () => {
        this.setState({
            clueAnalysisPanelShow: false
        });
    };

    renderClueAnalysisBtn = () => {
        return (
            <div className="clue-analysis-btn-container pull-right">
                <Button className="call-analysis-btn btn-item" title={Intl.get('clue.alanalysis.charts','线索分析')} onClick={this.handleClueAnalysisPanel}
                    data-tracename="点击线索分析按钮">
                    {Intl.get('user.detail.analysis', '分析')}
                </Button>
            </div>
        );
    };
    searchFullTextEvent = (keyword) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-container'), '根据关键字搜索');
        //如果keyword存在，就用全文搜索的接口
        clueCustomerAction.setKeyWord(keyword);
        //如果keyword不存在，就用获取线索的接口
        this.onTypeChange();
    };

    //更新线索来源列表
    updateClueSource = (newSource) => {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray: this.state.clueSourceArray
        });
    };

    //更新线索渠道列表
    updateClueChannel = (newChannel) => {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray: this.state.accessChannelArray
        });
    };

    //更新线索分类
    updateClueClassify = (newClue) => {
        this.state.clueClassifyArray.push(newClue);
        this.setState({
            clueClassifyArray: this.state.clueClassifyArray
        });
    };

    //是否是运营人员
    isOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };

    //是否是管理员
    isRealmManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
    };

    toggleList = () => {
        this.setState({
            showFilterList: !this.state.showFilterList
        });
    };
    onExportRangeChange = (e) => {
        this.setState({
            exportRange: e.target.value
        });
    };
    doImportAjax = (successCallback,errCallback) => {
        $.ajax({
            url: '/rest/clue/confirm/upload/' + true,
            dataType: 'json',
            type: 'get',
            async: false,
            success: (data) => {
                this.getClueList();
                _.isFunction(successCallback) && successCallback();
            },
            error: (errorMsg) => {
                _.isFunction(errCallback) && errCallback(errorMsg);
            }
        });
    };
    //删除重复的线索
    deleteDuplicatImportClue = (index) => {
        var _this = this;
        $.ajax({
            url: '/rest/clue/repeat/delete/' + index,
            dataType: 'json',
            type: 'delete',
            success: function(result) {
                if (result && result.result === 'success') {
                    var previewList = _this.state.previewList;
                    previewList.splice(index, 1);
                    _this.setState({
                        previewList: previewList
                    });
                } else {
                    message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败'));
                }
            },
            error: function(errorMsg) {
                message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败') || errorMsg);
            }
        });
    };
    //是否包含此项内容
    isIncludesItem(list, item) {
        return !_.isEmpty(list) && _.includes(list, item);
    }
    getCluePrevList = () => {
        var _this = this;
        let previewColumns = [
            {
                title: Intl.get('clue.customer.clue.name', '线索名称'),
                dataIndex: 'name',
                render: function(text, record, index) {
                    if (text) {
                        //线索名不符合验证规则
                        let name_verify = _.get(record, 'errors.name_verify');
                        //导入的数据中存在同名线索
                        let import_name_repeat = _.get(record, 'errors.import_name_repeat');
                        //系统中存在同名线索
                        let name_repeat = _.get(record, 'errors.name_repeat');
                        let cls = classNames({
                            'repeat-item-name': name_verify || import_name_repeat || name_repeat
                        });
                        let title = '';
                        if (name_verify) {
                            title = Intl.get('clue.name.rule', '线索名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到50（包括50）之间');
                        } else if (import_name_repeat) {
                            title = Intl.get('crm.import.name.repeat', '导入数据中存在同名{type}',{type: Intl.get('crm.sales.clue', '线索')});
                        } else if (name_repeat) {
                            title = Intl.get('crm.system.name.repeat', '系统中已存在同名{type}',{type: Intl.get('crm.sales.clue', '线索')});
                        }
                        return (<span className={cls} title={title}>{text}</span>);
                    } else {//必填
                        return (
                            <span className='repeat-item-name' title={Intl.get('crm.import.required', '必填项，不能为空')}>
                                {Intl.get('apply.components.required.item', '必填')}
                            </span>);
                    }
                }
            },
            {
                title: Intl.get('call.record.contacts', '联系人'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].name : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('common.phone', '电话'),
                render: (text, record, index) => {
                    if (_.isArray(_.get(record, 'contacts[0].phone'))) {
                        return _.map(_.get(record, 'contacts[0].phone'), (item, index) => {
                            //电话规则不匹配的电话列表
                            let phone_verify_list = _.get(record, 'errors.phone_verify');
                            //导入的列表中存在相同的电话的电话列表
                            let import_phone_repeat_list = _.get(record, 'errors.import_phone_repeat');
                            //系统中存在相同电话的电话列表
                            let phone_repeat_list = _.get(record, 'errors.phone_repeat_list');
                            let cls = '';
                            let title = '';
                            //电话规则不匹配
                            if (this.isIncludesItem(phone_verify_list, item)) {
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.import.phone.verify', '电话只能是11位手机号或11-12位带区号的座机号');
                            } else if (this.isIncludesItem(import_phone_repeat_list, item)) {
                                //导入的列表中存在相同的电话
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.import.phone.repeat', '导入数据中存在相同的电话');
                            } else if (this.isIncludesItem(phone_repeat_list, item)) {
                                //系统中存在同名客户
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.system.phone.repeat', '系统中已存在相同的电话');
                            }
                            return (<div className={cls} title={title} key={index}>{item}</div>);
                        });
                    }
                }
            },
            {
                title: 'QQ',
                render: function(text, record, index) {
                    if (_.isArray(_.get(record, 'contacts[0].qq'))) {
                        return _.map(_.get(record, 'contacts[0].qq'), (item, index) => {
                            //电话规则不匹配的电话列表
                            let qq_verify_list = _.get(record, 'errors.QQ_verify');
                            let cls = '';
                            let title = '';
                            //电话规则不匹配
                            if (qq_verify_list) {
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('common.correct.qq', '请输入正确的QQ号');
                            }
                            return (<div className={cls} title={title} key={index}>{item}</div>);
                        });
                    }
                }
            },
            {
                title: Intl.get('clue.analysis.source', '来源'),
                dataIndex: 'clue_source',
            }, {
                title: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                dataIndex: 'access_channel',
            }, {
                title: Intl.get('crm.sales.clue.descr', '线索描述'),
                dataIndex: 'source',
            }, {
                title: 'IP',
                dataIndex: 'source_ip',
            }, {
                title: Intl.get('common.operate', '操作'),
                width: '60px',
                render: (text, record, index) => {
                    return (
                        <span className="cus-op">
                            <i className="order-btn-class iconfont icon-delete "
                                onClick={_this.deleteDuplicatImportClue.bind(_this, index)}
                                data-tracename="删除重复线索"
                                title={Intl.get('common.delete', '删除')}/>

                        </span>
                    );
                }
            }
        ];
        return previewColumns;
    };
    selectAllSearchResult = () => {
        this.setState({
            selectedClues: this.state.curClueLists.slice(),
            selectAllMatched: true,
        });
    };
    clearSelectAllSearchResult = () => {
        this.setState({
            selectedClues: [],
            selectAllMatched: false,
        }, () => {
            $('th.ant-table-selection-column input').click();
        });
    };

    renderSelectClueTips = () => {
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
                    {Intl.get('crm.11', '已选当前页{count}项', { count: _.get(this, 'state.selectedClues.length') })}
                    {/*在筛选条件下可 全选 ，没有筛选条件时，后端接口不支持选 全选*/}
                    {/*如果一页可以展示全，不再展示选择全部的提示*/}
                    {_.isEmpty(this.state.condition) || this.state.customersSize <= this.state.pageSize ? null : (
                        <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>
                            {Intl.get('crm.12', '选择全部{count}项', { count: this.state.customersSize })}
                        </a>)
                    }
                </span>);
        }
    };
    renderBatchChangeClues = () => {
        return (
            <div className="pull-right">
                <div className="pull-right">
                    <AntcDropdown
                        ref='changesales'
                        content={<Button type="primary"
                            data-tracename="点击分配线索客户按钮"
                            className='btn-item'>{Intl.get('clue.batch.assign.sales', '批量分配')}</Button>}
                        overlayTitle={Intl.get('user.salesman', '销售人员')}
                        okTitle={Intl.get('common.confirm', '确认')}
                        cancelTitle={Intl.get('common.cancel', '取消')}
                        isSaving={this.state.distributeBatchLoading}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={this.handleSubmitAssignSalesBatch}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        btnAtTop={false}
                    />
                </div>
            </div>
        );
    };
    //是否有选中的线索
    hasSelectedClues = () => {
        return _.get(this, 'state.selectedClues.length');
    };
    updateCustomerLastContact = (item) => {
        clueCustomerAction.updateCustomerLastContact(item);
    };
    renderNotSelectClueBtns = () => {
        return (
            <div className="pull-right add-anlysis-handle-btns">
                {/*是否有查看线索分析的权限
                 CRM_CLUE_STATISTICAL 查看线索概览的权限
                 CRM_CLUE_TREND_STATISTIC_ALL CRM_CLUE_TREND_STATISTIC_SELF 查看线索趋势分析的权限
                 */}
                {hasPrivilege('CRM_CLUE_STATISTICAL') || hasPrivilege('CRM_CLUE_TREND_STATISTIC_ALL') || hasPrivilege('CRM_CLUE_TREND_STATISTIC_SELF') ? this.renderClueAnalysisBtn() : null}
                {this.renderExportClue()}
                {this.renderHandleBtn()}
                {this.renderImportClue()}
            </div>
        );
    };

    //线索合并到客户后的回调事件
    onClueMergedToCustomer = (customerId) => {
        //在列表中隐藏当前操作的线索
        this.hideCurClue();

        //打开客户面板，显示合并后的客户信息
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                activeKey: TAB_KEYS.CONTACT_TAB
            }
        });

        //关闭线索转客户面板
        this.hideClueToCustomerPanel();
    }

    render() {
        var cls = classNames('right-panel-modal',
            {'show-modal': this.state.clueAddFormShow
            });
        var importCls = classNames('right-panel-modal',
            {'show-modal': this.state.clueImportTemplateFormShow
            });
        //是运营人员或者是域管理员
        var isOperationOrManager = this.isOperation() || this.isRealmManager();
        const contentClassName = classNames('content-container',{
            'content-full': !this.state.showFilterList
        });
        var hasSelectedClue = this.hasSelectedClues();
        return (
            <RightContent>
                <div className="clue_customer_content" data-tracename="线索列表">
                    <TopNav>
                        <div className="date-picker-wrap">
                            <div className="search-container">
                                <div className="search-input-wrapper">
                                    <FilterInput
                                        ref="filterinput"
                                        showSelectChangeTip={_.get(this.state.selectedClues, 'length')}
                                        toggleList={this.toggleList.bind(this)}
                                        filterType={Intl.get('crm.sales.clue', '线索')}
                                    />
                                </div>
                                {hasSelectedClue ? (
                                    <div className="clue-list-selected-tip">
                                        <span className="iconfont icon-sys-notice" />
                                        {this.renderSelectClueTips()}
                                    </div>
                                ) : <SearchInput
                                    searchEvent={this.searchFullTextEvent}
                                    searchPlaceHolder ={Intl.get('clue.search.full.text','全文搜索')}
                                />}
                            </div>
                            {hasSelectedClue ? this.renderBatchChangeClues() : this.renderNotSelectClueBtns()}
                        </div>
                    </TopNav>
                    <div className="clue-content-container">
                        <div
                            className={this.state.showFilterList ? 'filter-container' : 'filter-container filter-close'}>
                            <ClueFilterPanel
                                ref={filterPanel => this.filterPanel = filterPanel}
                                clueSourceArray={this.state.clueSourceArray}
                                accessChannelArray={this.state.accessChannelArray}
                                clueClassifyArray={this.state.clueClassifyArray}
                                salesManList={this.getSalesDataList()}
                                getClueList={this.getClueList}
                                style={{width: LAYOUT_CONSTANTS.FILTER_WIDTH, height: getTableContainerHeight() + LAYOUT_CONSTANTS.TABLE_TITLE_HEIGHT}}
                                showSelectTip={_.get(this.state.selectedClues, 'length')}
                            />
                        </div>
                        <div className={contentClassName}>
                            {this.getClueTypeTab()}
                            {this.renderLoadingAndErrAndNodataContent()}
                        </div>
                    </div>
                    {this.state.clueAddFormShow ?
                        <div className={cls}>
                            <span className="iconfont icon-close clue-add-btn" onClick={this.hideClueAddForm}
                                data-tracename="关闭添加线索面板"></span>
                            <SalesClueAddForm
                                hideAddForm={this.hideClueAddForm}
                                accessChannelArray={this.state.accessChannelArray}
                                clueSourceArray={this.state.clueSourceArray}
                                clueClassifyArray={this.state.clueClassifyArray}
                                updateClueSource={this.updateClueSource}
                                updateClueChannel={this.updateClueChannel}
                                updateClueClassify={this.updateClueClassify}
                            />
                            )
                        </div> : null}
                    <ClueImportRightDetail
                        importType={Intl.get('crm.sales.clue', '线索')}
                        uploadActionName='clues'
                        templateHref='/rest/clue/download_template'
                        uploadHref='/rest/clue/upload'
                        previewList={this.state.previewList}
                        getItemPrevList={this.getCluePrevList}
                        showFlag={this.state.clueImportTemplateFormShow}
                        closeTemplatePanel={this.closeClueTemplatePanel}
                        doImportAjax={this.doImportAjax}
                        onItemListImport={this.onClueImport}
                        repeatAlertMessage={Intl.get('import.repeat.delete.tip', '红色标示数据已存在或不符合规则，请删除红色标示的数据后直接导入，或本地修改数据后重新导入')}
                        regRules={XLS_FILES_TYPE_RULES}
                    />
                    {this.state.clueAnalysisPanelShow ? <RightPanel
                        className="clue-analysis-panel"
                        showFlag={this.state.clueAnalysisPanelShow}
                    >
                        <ClueAnalysisPanel
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            closeClueAnalysisPanel={this.closeClueAnalysisPanel}
                        />
                    </RightPanel> : null}
                    <Modal
                        className="clue-export-modal"
                        visible={this.state.isExportModalShow}
                        closable={false}
                        onOk={this.exportData}
                        onCancel={this.hideExportModal}
                    >
                        <div>
                            {Intl.get('contract.116', '导出范围')}:
                            <RadioGroup
                                value={this.state.exportRange}
                                onChange={this.onExportRangeChange}
                            >
                                <Radio key="all" value="all">
                                    {Intl.get('common.all', '全部')}
                                </Radio>
                                <Radio key="filtered" value="filtered">
                                    {Intl.get('contract.117', '符合当前筛选条件')}
                                </Radio>
                            </RadioGroup>
                        </div>
                        <div>
                            {Intl.get('contract.118','导出类型')}:
                            {Intl.get('contract.152','excel格式')}
                        </div>
                    </Modal>
                    {/*该客户下的用户列表*/}
                    {
                        this.state.isShowCustomerUserListPanel ?
                            <RightPanel
                                className="customer-user-list-panel"
                                showFlag={this.state.isShowCustomerUserListPanel}
                            >
                                {this.state.isShowCustomerUserListPanel ?
                                    <AppUserManage
                                        customer_id={this.state.customerOfCurUser.id}
                                        hideCustomerUserList={this.closeCustomerUserListPanel}
                                        customer_name={this.state.customerOfCurUser.name}
                                    /> : null
                                }
                            </RightPanel> : null
                    }

                    {this.state.isShowClueToCustomerPanel ? (
                        <ClueToCustomerPanel
                            showFlag={this.state.isShowClueToCustomerPanel}
                            clue={this.state.curClue}
                            existingCustomers={this.state.existingCustomers}
                            hidePanel={this.hideClueToCustomerPanel}
                            showAddCustomerPanel={this.showAddCustomerPanel}
                            onMerged={this.onClueMergedToCustomer}
                        />
                    ) : null}

                    {this.state.isShowAddCustomerPanel ? (
                        <CRMAddForm
                            hideAddForm={this.hideAddCustomerPanel}
                            addOne={this.onConvertClueToNewCustomerDone}
                            formData={this.state.curClue}
                            isAssociateClue={true}
                            phoneNum={_.get(this.state, 'curClue.phones[0]', '')}
                            isShowMadal={false}
                        />
                    ) : null}
                </div>
            </RightContent>
        );
    }
}
ClueCustomer.propTypes = {
    location: PropTypes.object
};
module.exports = ClueCustomer;

