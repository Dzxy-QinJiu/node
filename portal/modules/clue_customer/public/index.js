/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/23.
 */
var React = require('react');
var rightPanelShow = false;
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
var clueCustomerStore = require('./store/clue-customer-store');
var clueFilterStore = require('./store/clue-filter-store');
var clueCustomerAction = require('./action/clue-customer-action');
var clueFilterAction = require('./action/filter-action');
import {clueEmitter} from 'OPLATE_EMITTER';
var userData = require('../../../public/sources/user-data');
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import Trace from 'LIB_DIR/trace';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {SearchInput, AntcTable} from 'antc';
import {message, Icon, Row, Col, Button, Alert, Select, Modal, Radio, Input,Tag} from 'antd';
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const Option = Select.Option;
import TopNav from 'CMP_DIR/top-nav';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import {removeSpacesAndEnter,getUnhandledClueCountParams} from 'PUB_DIR/sources/utils/common-method-util';
require('./css/index.less');
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount, AVALIBILITYSTATUS} from './utils/clue-customer-utils';
var Spinner = require('CMP_DIR/spinner');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import clueCustomerAjax from './ajax/clue-customer-ajax';
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
import SalesClueItem from 'MOD_DIR/common_sales_home_page/public/view/sales-clue-item';
import ContactItem from 'MOD_DIR/common_sales_home_page/public/view//contact-item';
import ClueAnalysisPanel from './views/clue-analysis-panel';
import SalesClueAddForm from './views/add-clues-form';
import ClueImportRightDetail from 'CMP_DIR/import_step';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
var RightContent = require('CMP_DIR/privilege/right-content');
import classNames from 'classnames';
import ClueRightPanel from './views/clue-right-detail';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后刷新未读数
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
import {pathParamRegex} from 'PUB_DIR/sources/utils/validate-util';
import {FilterInput} from 'CMP_DIR/filter';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import ClueFilterPanel from './views/clue-filter-panel';
import {renderClueStatus} from 'PUB_DIR/sources/utils/common-method-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
const DELAY_TIME = 3000;
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 68,
    BOTTOM_DISTANCE: 40,
    FILTER_WIDTH: 300
};

class ClueCustomer extends React.Component {
    state = {
        clueAddFormShow: false,//
        rightPanelIsShow: rightPanelShow,//是否展示右侧客户详情
        tableHeight: 630,
        accessChannelArray: accessChannelArray,//线索渠道
        clueSourceArray: clueSourceArray,//线索来源
        clueClassifyArray: clueClassifyArray,//线索分类
        isRemarkingItem: '',//正在标记的那条线索
        clueImportTemplateFormShow: false,//线索导入面板是否展示
        previewList: [],//预览列表
        clueAnalysisPanelShow: false,//线索分析面板是否展示
        showFilterList: false,//是否展示线索筛选区域
        exportRange: 'filtered',
        isExportModalShow: false,//是否展示导出线索的模态框
        isEdittingItem: {},//正在编辑的那一条
        // submitContent: this.getSubmitContent(propsItem),//要提交的跟进记录的内容
        submitTraceErrMsg: '',//提交跟进记录出错的信息
        submitTraceLoading: false,//正在提交跟进记录
        showCustomerId: '',//正在展示客户详情的客户id
        isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        ...clueCustomerStore.getState()
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
        //点击未处理线索的数量跳转过来的
        if(_.get(this.props,'location.state.clickUnhandleNum')){
            this.getUnhandledClue();
        }else{
            this.getClueList();
        }
        this.getUserPhoneNumber();
    }
    getUnhandledClue = () => {
        var data = getUnhandledClueCountParams();
        clueFilterAction.setTimeType('all');
        clueFilterAction.setFilterType([{value: _.get(JSON.parse(data.typeFilter),'status')}]);
        setTimeout(() => {
            this.getClueList(data);
        });
    };
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps,'history.action') === 'PUSH'){
            if(_.get(nextProps,'location.state.clickUnhandleNum')){
                delete nextProps.location.state.clickUnhandleNum;
                clueCustomerAction.setClueInitialData();
                this.getUnhandledClue();
            }
        }
    }
    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onStoreChange);
        this.hideRightPanel();
        //清空页面上的筛选条件
        clueFilterAction.setInitialData();
        clueCustomerAction.resetState();
    }

    //展示右侧面板
    showRightPanel = (id) => {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(id);
    };

    hideRightPanel = () => {
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        //关闭右侧面板后，将当前展示线索的id置为空
        clueCustomerAction.setCurrentCustomer('');
    };

    onClueImport = (list) => {
        this.setState({
            previewList: list,
        });
    };


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

    //获取用户的坐席号
    getUserPhoneNumber = () => {
        let member_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(member_id).then((result) => {
            if (result.phone_order) {
                this.setState({
                    callNumber: result.phone_order
                });
            }
        }, (errMsg) => {
            this.setState({
                errMsg: errMsg || Intl.get('crm.get.phone.failed', '获取座机号失败!')
            });
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
    //获取线索列表
    getClueList = (data) => {
        var rangeParams = _.get(data, 'rangeParams') || JSON.stringify(clueFilterStore.getState().rangeParams);
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        var typeFilter = getClueStatusValue(filterClueStatus);//线索类型
        var existFilelds = clueFilterStore.getState().exist_fields;
        //如果是筛选的重复线索，把排序字段改成repeat_id
        if (_.indexOf(existFilelds, 'repeat_id') > -1){
            clueCustomerAction.setSortField('repeat_id');
        }else{
            clueCustomerAction.setSortField('source_time');
        }
        var unExistFileds = clueFilterStore.getState().unexist_fields;
        //跟据类型筛选
        const queryObj = {
            lastClueId: this.state.lastCustomerId,
            pageSize: this.state.pageSize,
            sorter: this.state.sorter,
            keyword: this.state.keyword,
            rangeParams: rangeParams,
            statistics_fields: 'status',
            userId: userData.getUserData().userId || '',
            typeFilter: _.get(data, 'typeFilter') || JSON.stringify(typeFilter)
        };

        var filterStoreData = clueFilterStore.getState();
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
        //过滤无效线索
        var isFilterInavalibilityClue = filterStoreData.filterClueAvailability;
        if (isFilterInavalibilityClue){
            queryObj.availability = isFilterInavalibilityClue;
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
        //取全部线索列表
        clueCustomerAction.getClueFulltext(queryObj);
    };
    //获取请求参数
    getCondition = (isGetAllClue) => {
        var rangeParams = isGetAllClue ? [{
            from: clueStartTime,
            to: moment().valueOf(),
            type: 'time',
            name: 'source_time'
        }] : clueFilterStore.getState().rangeParams;
        var keyWord = isGetAllClue ? '' : this.state.keyword;
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        var typeFilter = isGetAllClue ? {status: ''} : getClueStatusValue(filterClueStatus);//线索类型
        var queryObj = {
            keyword: keyWord,
            rangeParams: JSON.stringify(rangeParams),
            statistics_fields: 'status',
            userId: userData.getUserData().userId || '',
            typeFilter: JSON.stringify(typeFilter)
        };
        if (!isGetAllClue){
            var filterStoreData = clueFilterStore.getState();
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
    showClueDetailOut = (item) => {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(item.id);
    };
    handleContactLists = (contact)=>{
        var clipContact = false;
        if (contact.length >1){
            clipContact= true;
            contact.splice(1,contact.length -1);
        }
        _.map(contact, (contactItem, idx) => {
            if (_.isArray(contactItem.phone) && contactItem.phone.length){
                if (contactItem.phone.length > 1){
                    contactItem.phone.splice(1, contactItem.phone.length-1);
                    clipContact= true;
                }else if (_.isArray(contactItem.email) &&  contactItem.email.length || _.isArray(contactItem.qq) &&  contactItem.qq.length || _.isArray(contactItem.weChat) &&  contactItem.weChat.length){
                    clipContact= true;

                };
                contactItem.email =[];
                contactItem.qq =[];
                contactItem.weChat =[];

            };
            if (_.isArray(contactItem.email) && contactItem.email.length){
                if (contactItem.email.length > 1){
                    contactItem.email.splice(1, contactItem.email.length-1);
                    clipContact= true;
                }else if (_.isArray(contactItem.qq) &&  contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact= true;

                };
                contactItem.qq =[];
                contactItem.weChat =[];
            };
            if (_.isArray(contactItem.qq) && contactItem.qq.length){
                if (contactItem.qq.length>1){
                    contactItem.qq.splice(1, contactItem.qq.length-1);
                    clipContact= true;
                }else if (_.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact= true;

                };
                contactItem.qq.splice(1, contactItem.qq.length-1);
                contactItem.weChat =[];
            };
            if (_.isArray(contactItem.weChat) && contactItem.weChat.length){
                if (contactItem.weChat.length>1){
                    contactItem.weChat.splice(1, contactItem.weChat.length-1);
                    clipContact= true;
                }

            };
        });
        return {clipContact:clipContact,contact:contact};
    };
    handleEditTrace = (updateItem) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '点击添加/编辑跟进内容');
        this.setState({
            isEdittingItem: updateItem
        });
    };
    handleInputChange = (e) => {
        this.setState({
            submitContent: e.target.value
        });
    };
    handleSubmitContent = (item) => {
        if (this.state.submitTraceLoading) {
            return;
        }
        var value = _.get(item, 'customer_traces[0].remark', '');
        if (Oplate && Oplate.unread && !value && userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            Oplate.unread['unhandleClue'] -= 1;
            if (timeoutFunc) {
                clearTimeout(timeoutFunc);
            }
            timeoutFunc = setTimeout(function() {
                //触发展示的组件待审批数的刷新
                notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
            }, timeout);
        }
        //获取填写的保存跟进记录的内容
        var textareVal = _.trim(this.state.submitContent);
        if (!textareVal) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            var submitObj = {
                'customer_id': item.id,
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
                    //如果是待跟进状态,需要在列表中删除，其他状态
                    var clueItem = _.find(this.state.curClueLists, clueItem=> clueItem.id === item.id);
                    // var clueItem = this.state.salesClueItemDetail;
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
                        // salesClueItemDetail: clueItem,
                        isEdittingItem: {},
                    });
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
            submitContent: this.getSubmitContent(this.state.salesClueItemDetail)
        });
    };

    renderEditTraceContent = (salesClueItem) =>{
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
                <TextArea type='textarea' value={this.state.submitContent}
                          placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')}
                          onChange={this.handleInputChange}/>
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
    renderShowTraceContent = (salesClueItem) =>{
        let user = userData.getUserData();
        let member_id = user.user_id || '';
        var traceContent = _.get(salesClueItem, 'customer_traces[0].remark', '');//该线索的跟进内容
        var traceAddTime = _.get(salesClueItem, 'customer_traces[0].add_time');//跟进时间
        var tracePersonId = _.get(salesClueItem, 'customer_traces[0].user_id', '');//跟进人的id
        var tracePersonName = _.get(salesClueItem, 'customer_traces[0].nick_name', '');//跟进人的名字
        var handlePersonName = _.get(salesClueItem,'user_name');//当前跟进人
        //是否有更改跟进记录的权限
        let canEditTrace = (member_id === _.get(salesClueItem, 'customer_traces[0].user_id', ''));
        return (
            <div className="foot-text-content">
                {/*有跟进记录*/}
                {traceContent ?
                    <div className="record-trace-container">
                        <span>{traceAddTime ? moment(traceAddTime).format(oplateConsts.DATE_FORMAT) : ''}</span>
                        <span>
                                   <span className="trace-author">
                                       <span className="trace-name">{tracePersonId === member_id ? Intl.get('sales.home.i.trace', '我') : tracePersonName} </span>{Intl.get('clue.add.trace.follow', '跟进')}:
                        </span>
                            {traceContent}
                            {canEditTrace ? <i className="iconfont icon-edit-btn"
                                               onClick={this.handleEditTrace.bind(this, salesClueItem)}
                            ></i> : null}
                    </span></div>
                    : hasPrivilege('CLUECUSTOMER_ADD_TRACE') ?
                        <span className='add-trace-content'
                                onClick={this.handleEditTrace.bind(this, salesClueItem)}>{Intl.get('clue.add.trace.content', '添加跟进内容')}</span>
                        : null}

            </div>

        )
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
            isShowCustomerUserListPanel: false
        });
    };
    //标记线索无效或者有效
    handleClickInvalidBtn = (item) => {
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
                // var salesClueItemDetail = this.state.salesClueItemDetail;
                var salesClueItemDetail = _.find(this.state.curClueLists, clueItem=> clueItem.id === item.id);
                salesClueItemDetail.invalid_info = {
                    user_name: userData.getUserData().nick_name,
                    time: moment().valueOf()
                };
                salesClueItemDetail.availability = updateValue;
                //点击无效后状态应该改成已跟进的状态
                if (updateValue === AVALIBILITYSTATUS.INAVALIBILITY){
                    //如果角色是管理员，并且该线索之前的状态是待分配状态
                    //或者  如果角色是销售人员，并且该线索之前的状态是待跟进状态
                    //标记为无效后 ,把全局上未处理的线索数量要减一
                    if (Oplate && Oplate.unread && ((userData.hasRole(userData.ROLE_CONSTANS.SALES) && salesClueItemDetail.status === SELECT_TYPE.WILL_TRACE) || (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) && salesClueItemDetail.status === SELECT_TYPE.WILL_DISTRIBUTE))) {
                        Oplate.unread['unhandleClue'] -= 1;
                        if (timeoutFunc) {
                            clearTimeout(timeoutFunc);
                        }
                        timeoutFunc = setTimeout(function() {
                            //触发展示的组件待审批数的刷新
                            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
                        }, timeout);
                    }
                    salesClueItemDetail.status = SELECT_TYPE.HAS_TRACE;
                }

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
    renderInavailabilityOrValidClue = (salesClueItem) =>{
        //是否有标记线索无效的权限
        var avalibilityPrivilege = hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER');
        var isEditting = this.state.isInvalidClue === salesClueItem.id;
        var inValid = salesClueItem.availability === '1';
        return(
            <span className="valid-or-invalid-container">
                {avalibilityPrivilege ? <span className="cancel-invalid" onClick={this.handleClickInvalidBtn.bind(this, salesClueItem)}
                                                data-tracename="取消判定线索无效"  disabled={isEditting}>
                    {inValid? <span className="can-edit"> {Intl.get('clue.cancel.set.invalid', '改为有效')}</span>: <span className="invalid-name">{Intl.get('sales.clue.is.enable', '无效')}</span>}
                    {isEditting ? <Icon type="loading"/> : null}
                </span> :null}
            </span>

        )

    };
    renderAvailabilityClue = (salesClueItem)=>{
        //是有效线索
        let availability = salesClueItem.availability !== '1';
        //关联客户
        var associatedCustomer = salesClueItem.customer_name;
        //是否有修改线索关联客户的权利
        var associatedPrivilege = (hasPrivilege('CRM_MANAGER_CUSTOMER_CLUE_ID') || hasPrivilege('CRM_USER_CUSTOMER_CLUE_ID'));
        return(
            <div className="avalibility-container">
                {/*是有效线索并且有关联客户*/}
                {associatedCustomer ?
                    <div className="associate-customer">
                        {salesClueItem.customer_label ? <Tag className={crmUtil.getCrmLabelCls(salesClueItem.customer_lable)}>{salesClueItem.customer_label}</Tag> : null}
                        <b className="customer-name" onClick={this.showCustomerDetail.bind(this, salesClueItem.customer_id)} data-tracename="点击查看关联客户详情">{associatedCustomer}<span className="arrow-right">&gt;</span></b></div> :
                    <div>
                        {associatedPrivilege ? <span className="can-edit associate-btn" onClick={this.showClueDetailOut.bind(this, salesClueItem)} data-tracename="点击关联客户按钮">{Intl.get('clue.customer.associate.customer', '关联客户')}</span> : null}
                        {this.renderInavailabilityOrValidClue(salesClueItem)}
                    </div>

                }
            </div>
        )

    };
    getClueTableColunms = () => {
        let columns = [
            {
                title: Intl.get('crm.sales.clue', '线索'),
                dataIndex: 'clue_name',
                width: '30%',
                render: (text, salesClueItem, index) => {
                    return (
                        <div className="clue-top-title">
                            <span className="hidden record-id">{salesClueItem.id}</span>
                            {renderClueStatus(salesClueItem.status)}
                            <span className="clue-name" data-tracename="查看线索详情"
                                  onClick={this.showClueDetailOut.bind(this, salesClueItem)}>{salesClueItem.name}</span>
                            <div className="clue-trace-content">
                                <span>{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}-</span>
                                <span className="clue-access-channel">{salesClueItem.access_channel || Intl.get('clue.unknown.access.channel','未知接入渠道')}{Intl.get('apply.approve.word.message','留言')}:</span>
                                <span>{salesClueItem.source}</span>
                            </div>
                        </div>
                    )

                }
            },{
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex:'contact',
                width: '20%',
                render: (text, salesClueItem, index) => {
                    //联系人的相关信息
                    var contacts = salesClueItem.contacts ? salesClueItem.contacts : [];
                    if (_.isArray(contacts) && contacts.length){
                        //处理联系方式，处理成只有一种联系方式
                        var handledContactObj = this.handleContactLists(_.cloneDeep(contacts));
                        return (
                            <div className="contact-container">
                                <ContactItem
                                    contacts={handledContactObj.contact}
                                    customerData={salesClueItem}
                                    showContactLabel={false}
                                    callNumber={this.state.callNumber}
                                    errMsg={this.state.errMsg}
                                />
                                {handledContactObj.clipContact? <i className="iconfont icon-more" onClick={this.showClueDetailOut.bind(this, salesClueItem)}/> :null}
                            </div>

                        )
                    }else{
                     return null;
                    }

                }
            },{
                title: Intl.get('clue.handle.clue.person', '当前跟进人'),
                dataIndex:'trace_person',
                width: '10%',
                render: (text, salesClueItem, index) =>{
                    let user = userData.getUserData();
                    var handlePersonName = _.get(salesClueItem,'user_name','');//当前跟进人
                    //分配线索给销售的权限
                    var hasAssignedPrivilege = hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales);
                    var assigenCls = classNames('assign-btn',{'can-edit': !handlePersonName});
                    return (
                        <div className="handle-and-trace" ref='trace-person'>
                            {/*有分配权限*/}
                            {hasAssignedPrivilege ?
                                <AntcDropdown
                                    ref={changeSale => this['changesale' + salesClueItem.id] = changeSale}
                                    content={<span
                                        data-tracename="点击分配线索客户按钮"
                                        className={assigenCls}>{handlePersonName || Intl.get('clue.customer.distribute', '分配')}</span>}
                                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                                    okTitle={Intl.get('common.confirm', '确认')}
                                    cancelTitle={Intl.get('common.cancel', '取消')}
                                    isSaving={this.state.distributeLoading}
                                    overlayContent={this.renderSalesBlock()}
                                    handleSubmit={this.handleSubmitAssignSales.bind(this, salesClueItem)}
                                    unSelectDataTip={this.state.unSelectDataTip}
                                    clearSelectData={this.clearSelectSales}
                                    btnAtTop={false}
                                /> : null
                            }
                        </div>
                    )

                }
            },{
                title: Intl.get('call.record.follow.content', '跟进内容'),
                dataIndex:'trace_content',
                width: '20%',
                render: (text, salesClueItem, index) =>{
                    return(
                        <div className="clue-foot" id="clue-foot">
                            {_.get(this,'state.isEdittingItem.id') === salesClueItem.id ? this.renderEditTraceContent(salesClueItem) :
                                this.renderShowTraceContent(salesClueItem)
                            }
                        </div>
                    )
                }
            },{
                title: Intl.get('clue.customer.associate.customer', '关联客户'),
                dataIndex:'assocaite_customer',
                className:'invalid-td-clue',
                width: '20%',
                render: (text, salesClueItem, index) =>{
                    //是有效线索
                    let availability = salesClueItem.availability !== '1';
                    //关联客户
                    var associatedCustomer = salesClueItem.customer_name;
                    return (
                        <div className="avalibity-or-invalid-container">
                            {availability? this.renderAvailabilityClue(salesClueItem):this.renderInavailabilityOrValidClue(salesClueItem)}
                        </div>
                    )
                }
            }];
        return columns;
    };
    setInvalidClassName= (record, index) =>{
        return (record.availability === '1'? 'invalid-clue' : '')
    };
    renderClueCustomerLists = () => {
        var customerList = this.state.curClueLists;
        return (
            <AntcTable dataSource={customerList}
                       pagination={false}
                       columns={this.getClueTableColunms()}
                       rowClassName={this.setInvalidClassName}
                       ref="cluetable"
            />);

    };

    clearSelectSales = () => {
        clueCustomerAction.setSalesMan({'salesMan': ''});
        clueCustomerAction.setSalesManName({'salesManNames': ''});
    };

    renderSalesBlock = () => {
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

    handleSubmitAssignSales = (item) => {
        var user_id = _.get(item, 'user_id');
        if (!this.state.salesMan) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
            return;
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
                team_name = nameArray[1].substr(0, nameArray[1].length - 1);//团队的名字
            }
            var submitObj = {
                'customer_id': item.id,
                'sale_id': sale_id,
                'sale_name': sale_name,
                'team_id': team_id,
                'team_name': team_name,
            };
            clueCustomerAction.distributeCluecustomerToSale(submitObj, (feedbackObj) => {
                SetLocalSalesClickCount(sale_id);
                if (feedbackObj && feedbackObj.errorMsg) {
                    message.error(feedbackObj.errorMsg || Intl.get('failed.to.distribute.cluecustomer', '分配线索客户失败'));
                } else {
                    //如果该账号是管理员角色，分配完毕后要把全局未处理的线索数减一
                    if (Oplate && Oplate.unread && !user_id && userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
                        Oplate.unread['unhandleClue'] -= 1;
                        if (timeoutFunc) {
                            clearTimeout(timeoutFunc);
                        }
                        timeoutFunc = setTimeout(function() {
                            //触发展示的组件待审批数的刷新
                            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
                        }, timeout);
                    }

                    if (this['changesale' + item.id]) {
                        //隐藏批量变更销售面板
                        this['changesale' + item.id].handleCancel();
                    }
                    var clueCustomerTypeFilter = getClueStatusValue(clueFilterStore.getState().filterClueStatus);
                    //如果是待分配状态，分配完之后要在列表中删除一个,在待跟进列表中增加一个
                    if (clueCustomerTypeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE) {
                        clueCustomerAction.afterAssignSales(item.id);
                    } else {
                        item.user_name = sale_name;
                        item.user_id = sale_id;
                        item.sales_team = team_name;
                        item.sales_team_id = team_id;
                        item.status = SELECT_TYPE.WILL_TRACE;
                        this.setState({
                            curClueLists: this.state.curClueLists
                        });
                    }
                }
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
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        if (this.state.curClueLists.length) {
            return (
                <div id="clue-content-block" className="clue-content-block" ref="clueCustomerList">
                    <div className="clue-customer-list"
                        style={{height: divHeight}}
                        id="area"
                    >
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            {this.renderClueCustomerLists()}
                            <NoMoreDataTip
                                show={this.showNoMoreDataTip}
                                message={Intl.get('common.no.more.clue', '没有更多线索了')}
                            />
                        </GeminiScrollbar>
                    </div>
                    {this.state.customersSize ?
                        <div className="clue-customer-total-tip">
                            {Intl.get('crm.215', '共{count}个线索', {'count': this.state.customersSize})}
                        </div> : null}
                </div>
            );
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
        } else if (!this.state.isLoading && !this.state.clueCustomerErrMsg && !this.state.curClueLists.length) {
            //如果有筛选条件时
            return (
                <NoDataIntro
                    noDataAndAddBtnTip={Intl.get('clue.no.data','暂无线索信息')}
                    renderAddAndImportBtns={this.renderAddAndImportBtns}
                    showAddBtn={this.hasNoFilterCondition()}
                    noDataTip={Intl.get('clue.no.data.during.range.and.status', '当前筛选时间段及状态没有相关线索信息')}
                />
            );


        } else {
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
    getCluePrevList = () => {
        var _this = this;
        let previewColumns = [
            {
                title: Intl.get('clue.customer.clue.name', '线索名称'),
                dataIndex: 'name',
                render: function(text, record, index) {
                    var cls = record.repeat ? 'repeat-item-name' : '';
                    return (
                        <span className={cls}>
                            {record.name}
                        </span>
                    );
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
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].phone : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('common.email', '邮箱'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].email : null}</span>
                        );
                    }
                }
            },
            {
                title: 'QQ',
                render: function(text, record, index) {
                    if (_.isArray(record.contacts) && _.isArray(record.contacts[0].qq)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].qq[0] : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('crm.sales.clue.source', '线索来源'),
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
                    //是否在导入预览列表上可以删除
                    const isDeleteBtnShow = record.repeat;
                    return (
                        <span className="cus-op">
                            {isDeleteBtnShow ? (
                                <i className="order-btn-class iconfont icon-delete "
                                    onClick={_this.deleteDuplicatImportClue.bind(_this, index)}
                                    data-tracename="删除重复线索"
                                    title={Intl.get('common.delete', '删除')}/>
                            ) : null}
                        </span>
                    );
                }
            }
        ];
        return previewColumns;
    };
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
        return (
            <RightContent>
                <div className="clue_customer_content" data-tracename="线索列表">
                    <TopNav>
                        <div className="date-picker-wrap">
                            <div className="search-container">
                                <div className="search-input-wrapper">
                                    <FilterInput
                                        ref="filterinput"
                                        toggleList={this.toggleList.bind(this)}
                                    />
                                </div>
                                <SearchInput
                                    searchEvent={this.searchFullTextEvent}
                                    searchPlaceHolder ={Intl.get('clue.search.full.text','全文搜索')}
                                />
                            </div>
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
                        </div>
                    </TopNav>
                    <div className="clue-content-container">
                        <div
                            className={this.state.showFilterList ? 'filter-container' : 'filter-container filter-close'}>
                            <ClueFilterPanel
                                clueSourceArray={this.state.clueSourceArray}
                                accessChannelArray={this.state.accessChannelArray}
                                clueClassifyArray={this.state.clueClassifyArray}
                                getClueList={this.getClueList}
                                style={{width: LAYOUT_CONSTANTS.FILTER_WIDTH, height: this.state.tableHeight}}
                            />
                        </div>
                        <div className={contentClassName}>
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
                    />
                    {this.state.rightPanelIsShow ?
                        <ClueRightPanel
                            showFlag={this.state.rightPanelIsShow}
                            currentId={this.state.currentId}
                            curClue={this.state.curClue}
                            hideRightPanel={this.hideRightPanel}
                            callNumber={this.state.callNumber}
                            errMsg={this.state.errMsg}
                        /> : null}

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
                </div>
            </RightContent>
        );
    }
}
ClueCustomer.propTypes = {
    location: PropTypes.object
};
module.exports = ClueCustomer;

