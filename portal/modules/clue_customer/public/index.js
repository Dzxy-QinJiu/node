/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
require('./css/index.less');
var RightContent = require('CMP_DIR/privilege/right-content');
var FilterBlock = require('CMP_DIR/filter-block');
import ClueCustomerFilterBlock from './views/clue-customer-search-block';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import SalesClueAddForm from './views/sales-clue-add-form';
import Trace from 'LIB_DIR/trace';
import {message, Icon, Row, Col, Button, Alert, Input, Tag, Modal} from 'antd';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
var clueCustomerStore = require('./store/clue-customer-store');
var clueCustomerAction = require('./action/clue-customer-action');
// 没有消息的提醒
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
var Spinner = require('CMP_DIR/spinner');
import ClueRightPanel from './views/clue-right-panel';
var userData = require('../../../public/sources/user-data');
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
var rightPanelShow = false;
var classNames = require('classnames');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import { storageUtil } from 'ant-utils';
import AlertTimer from 'CMP_DIR/alert-timer';
import {SELECT_TYPE, isOperation, isSalesLeaderOrManager} from './utils/clue-customer-utils';
import CONSTS from 'LIB_DIR/consts';
import AutosizeTextarea from 'CMP_DIR/autosize-textarea';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import clueCustomerAjax from './ajax/clue-customer-ajax';
import ClueImportTemplate from './views/clue-import-template';
import { clueEmitter } from 'OPLATE_EMITTER';
import {AntcTable} from 'antc';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
import ClueAnalysisPanel from './views/clue-analysis-panel';
import {removeSpacesAndEnter} from 'PUB_DIR/sources/utils/common-method-util';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
import {handleCallOutResult} from 'PUB_DIR/sources/utils/get-common-data-util';
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 68,
    BOTTOM_DISTANCE: 40,
};
const ClueCustomer = React.createClass({
    getInitialState: function() {
        return {
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
            ...clueCustomerStore.getState()
        };
    },
    onStoreChange: function() {
        this.setState(clueCustomerStore.getState());
    },
    componentDidMount: function() {
        this.changeTableHeight();
        clueCustomerStore.listen(this.onStoreChange);
        if (hasPrivilege('CUSTOMER_ADD_CLUE')){
            //获取线索来源
            this.getClueSource();
            //获取线索渠道
            this.getClueChannel();
            //获取线索分类
            this.getClueClassify();
        }
        clueCustomerAction.getSalesManList();
        if (isOperation() || isSalesLeaderOrManager()){
            //运营人员  管理员、销售领导 默认展示全部线索客户 status对应""
            clueCustomerAction.setFilterType(SELECT_TYPE.ALL);
        } else {
            //普通销售 销售默认展示已分配的线索客户 status对应1
            clueCustomerAction.setFilterType(SELECT_TYPE.HAS_DISTRIBUTE);
        }
        //获取线索客户列表
        this.getClueCustomerList();
        var _this = this;
        //点击客户列表某一行时打开对应的详情
        $('.clue_customer_content').on('click', '.clue-customer-list div.list-item', (e) => {
            if ($(e.target).hasClass('call-out') || $(e.target).hasClass('ant-btn-primary') || $(e.target).closest('.trace-content-wrap').length) {
                return;
            }
            Trace.traceEvent($(_this.getDOMNode()).find('.ant-table-tbody'), '打开线索客户详情');
            var $div = $(e.target).closest('.list-item');
            var id = $div.find('.record-id')[0].innerText;
            this.showRightPanel(id);
        });
        this.getUserPhoneNumber();
        clueEmitter.on(clueEmitter.IMPORT_CLUE, this.onClueImport);
    },
    onClueImport: function(list) {
        this.setState({
            isPreviewShow: true,
            previewList: list,
        });
    },
    componentWillUnmount: function() {
        clueCustomerStore.unlisten(this.onStoreChange);
        this.hideRightPanel();
        clueEmitter.removeListener(clueEmitter.IMPORT_CLUE, this.onClueImport);
    },
    getClueSource: function() {
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
    },
    getClueChannel: function() {
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
    },
    getClueClassify: function() {
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
    },
    showClueAddForm: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.handle-btn-container'), '点击添加销售线索按钮');
        var pageId = CONSTS.PAGE_ID.CLUE_CUSTOMER;
        var clickCount = storageUtil.local.get('click_add_cluecustomer_count', pageId);
        if (!clickCount) {
            clickCount = 1;
        }
        //点击一次页面加一
        clickCount++;
        storageUtil.local.set('click_add_cluecustomer_count', clickCount, pageId);
        this.setState({
            clueAddFormShow: true
        });
    },
    //点击导入线索按钮
    showImportClueTemplate: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.import-clue-customer-container'), '点击导入线索按钮');
        this.setState({
            clueImportTemplateFormShow: true
        });
    },
    //获取用户的坐席号
    getUserPhoneNumber: function() {
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
    },
    //点击展开线索分析面板
    handleClueAnalysisPanel: function() {
        this.setState({
            clueAnalysisPanelShow: true
        });
    },
    //点击关闭线索分析面板
    closeClueAnalysisPanel: function() {
        this.setState({
            clueAnalysisPanelShow: false
        });
    },
    renderClueAnalysisBtn: function() {
        return (
            <div className="clue-analysis-btn-container">
                <Button type="primary" className="call-analysis-btn" title="线索分析" onClick={this.handleClueAnalysisPanel}>
                    <i className="iconfont  icon-call-analysis call-analysis" data-tracename="点击线索分析按钮"></i>
                </Button>
            </div>
        );
    },
    renderHandleBtn: function() {
        let isWebMini = $(window).width() < LAYOUT_CONSTANTS.SCREEN_WIDTH;//浏览器是否缩小到按钮展示改成图标展示
        let btnClass = 'block ';
        btnClass += isWebMini ? 'handle-btn-mini' : 'handle-btn-container';
        var pageId = CONSTS.PAGE_ID.CLUE_CUSTOMER;
        var clickCount = storageUtil.local.get('click_add_cluecustomer_count', pageId);
        var containerCls = classNames('add-clue-customer-container', {
            'hide-des': clickCount > 2
        });
        return (
            <div className={containerCls}>
                {hasPrivilege('CUSTOMER_ADD_CLUE') ?
                    <Button type="primary" icon="plus" onClick={this.showClueAddForm}
                        title={Intl.get('crm.sales.add.clue', '添加线索')}>
                        <span className="button-container">{Intl.get('crm.sales.add.clue', '添加线索')}</span>
                    </Button> :
                    null
                }
            </div>
        );
    },
    //渲染导入线索的按钮
    renderImportClue: function() {
        return (
            <div className="import-clue-customer-container">
                {hasPrivilege('CUSTOMER_ADD_CLUE') ?
                    <Button type="primary" icon="plus" onClick={this.showImportClueTemplate}>
                        <span className="clue-container">
                            {Intl.get('clue.manage.import.clue', '导入线索')}
                        </span>
                    </Button>
                    : null}
            </div>
        );
    },
    changeTableHeight: function(filterPanelHeight = 0) {
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        tableHeight -= filterPanelHeight;
        var selectAllAlertHeight = $('.content-block .ant-alert').outerHeight(true);
        if (selectAllAlertHeight) tableHeight -= selectAllAlertHeight;
        this.setState({tableHeight, filterPanelHeight});
    },
    //关闭增加线索面板
    hideClueAddForm: function() {
        this.setState({
            clueAddFormShow: false
        });
    },
    //展示右侧面板
    showRightPanel: function(id) {
        this.state.rightPanelIsShow = true;
        rightPanelShow = true;
        this.setState(this.state);
        clueCustomerAction.setCurrentCustomer(id);
    },
    hideRightPanel: function() {
        this.state.rightPanelIsShow = false;
        rightPanelShow = false;
        this.setState(this.state);
        //关闭右侧面板后，将当前展示线索的id置为空
        clueCustomerAction.setCurrentCustomer('');
    },
    showNoMoreDataTip: function() {
        return !this.state.isLoading &&
            this.state.curCustomers.length >= 10 && !this.state.listenScrollBottom;
    },
    handleClickCallOut(phoneNumber, record) {
        Trace.traceEvent($(this.getDOMNode()).find('.column-contact-way'), '拨打电话');
        handleCallOutResult({
            errorMsg: this.state.errMsg,//获取坐席号失败的错误提示
            callNumber: this.state.callNumber,//坐席号
            contactName: record.contact,//联系人姓名
            phoneNumber: phoneNumber,//拨打的电话
        });
    },
    // 联系方式的列表
    getContactList(text, record, index) {
        let phoneArray = text && text.split('\n') || [];
        var contactWay = '';
        let className = record.repeat ? 'clue-repeat' : '';
        if (_.isArray(phoneArray) && phoneArray.length) {
            contactWay = phoneArray.map((item) => {
                if (item) {
                    return (
                        <div>
                            <span>{item}</span>
                            {this.state.callNumber ? <i className="iconfont icon-call-out call-out"
                                title={Intl.get('crm.click.call.phone', '点击拨打电话')}
                                onClick={this.handleClickCallOut.bind(this, item, record)}></i> : null}
                        </div>
                    );
                }
            });
        } else if (_.isArray(record.contacts) && record.contacts.length) {
            var contactArr = record.contacts[0];
            contactWay = (<div><span>{contactArr.email || contactArr.qq}</span></div>);
            return contactWay;
        }
        return (
            <div className={className}>
                {contactWay}
            </div>
        );
    },
    renderSalesBlock() {
        let dataList = [];
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        this.state.salesManList.forEach(function(salesman) {
            let teamArray = salesman.user_groups;
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                teamArray.forEach(team => {
                    dataList.push({
                        name: salesman.user_info.nick_name + '(' + team.group_name + ')',
                        value: salesman.user_info.user_id + '&&' + team.group_id
                    });
                });
            }
        });
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('crm.17', '请选择销售人员')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.getSelectSalesName}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    },
    //获取已选销售的id
    onSalesmanChange(salesMan){
        clueCustomerAction.setSalesMan({'salesMan': salesMan});
    },
    //获得已选销售的名字
    getSelectSalesName(salesManNames){
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
    },

    handleSubmitAssignSales: function(item) {
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
            //销售的名字和团队的名字 格式是 销售名称(团队名称)
            let nameArray = this.state.salesManNames.split('(');
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
                if (feedbackObj && feedbackObj.errorMsg){
                    message.error(feedbackObj.errorMsg || Intl.get('failed.to.distribute.cluecustomer','分配线索客户失败'));
                }else{
                    item.user_name = sale_name;
                    item.user_id = sale_id;
                    item.sales_team = team_name;
                    item.sales_team_id = team_id;
                    //隐藏批量变更销售面板
                    this.refs['changesale' + item.id].handleCancel();
                    this.setState({
                        curCustomers: this.state.curCustomers
                    });
                }
            });
        }

    },
    clearSelectSales: function() {
        clueCustomerAction.setSalesMan({'salesMan': ''});
        clueCustomerAction.setSalesManName({'salesManNames': ''});
    },
    //保存跟进内容
    handleSubmitTraceContent(item, e){
        //获取填写的保存跟进记录的内容
        var textareVal = $(e.target).closest('div.trace-content-wrap').find('textarea').val();
        if (!$.trim(textareVal)) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            var submitObj = {
                'customer_id': item.id,
                'remark': textareVal
            };
            clueCustomerAction.addCluecustomerTrace(submitObj, (result) => {
                if (!result.error){
                    item.addTraceContent = false;
                    if (_.isArray(item.customer_traces) && item.customer_traces.length) {
                        item.customer_traces[0].remark = textareVal;
                    } else {
                        item.customer_traces = [{'remark': textareVal}];
                    }
                    this.setState({
                        curCustomers: this.state.curCustomers
                    });
                }
            });
        }
    },
    //取消保存跟进内容
    handleCancelTraceContent(item){
        item.addTraceContent = false;
        this.setState({
            curCustomers: this.state.curCustomers
        });
    },
    showAddTraceContent(item){
        if (this.state.isEdit) {
            message.warn(Intl.get('clue.customer.save.content', '请先保存或取消保存正在编辑的跟进内容'));
            return;
        } else {
            item.addTraceContent = true;
            this.setState({
                curCustomers: this.state.curCustomers
            });
        }
    },
    updateCluecustomerContent(item, e){
        item.addTraceContent = true;
        var originContent = '';
        if (_.isArray(item.customer_traces) && item.customer_traces.length) {
            originContent = item.customer_traces[0].remark;
        }
        var $updateWrap = $(e.target).closest('div.trace-content-wrap');
        setTimeout(() => {
            $updateWrap.find('textarea').val(originContent);
        });
        this.setState({
            curCustomers: this.state.curCustomers
        });
    },
    handleClickRemarkBtn: function(item){
        var updateValue = '1';
        if (item.availability === '1'){
            updateValue = '0';
        }
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isRemarkingItem: item.id,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj,(result) => {
            if (_.isString(result)){
                this.setState({
                    isRemarkingItem: '',
                });
                message.error(Intl.get('failed.sales.remark.clue.valid','标记该线索有效性失败'));
            }else{
                //如果线索标记为有效后，将状态改为已跟进状态
                if (updateValue === '1'){
                    clueCustomerAction.removeClueItem({id: item.id});
                }
                clueCustomerAction.updateClueProperty({id: item.id,availability: updateValue});
                this.setState({
                    isRemarkingItem: ''
                });
            }
        });
    },
    //获取相对时间
    getRelativeTime(time){
        var relativeTime = '';
        if (moment(time).isSame(new Date(), 'day')){
            relativeTime = Intl.get('user.time.today', '今天');
        }else{
            relativeTime = moment(time).fromNow();
        }
        return relativeTime;
    },
    //线索客户列表
    renderClueCustomerList(){
        let user = userData.getUserData();
        var customerList = this.state.curCustomers;
        var dropDownContent = <Button type="primary" data-tracename="点击分配线索客户按钮">
            {Intl.get('clue.customer.distribute','分配')}
        </Button>;
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                submitTraceErrMsg: '',
            });
        };
        let errorBlock = this.state.submitTraceErrMsg ? (
            <div className="has-error">
                <AlertTimer
                    time={2000}
                    message={this.state.submitTraceErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        ) : null;
        return (
            _.map(customerList, (item, index) => {
                var itemCls = classNames('list-item-content', {
                    'will-distribute': item.status === SELECT_TYPE.WILL_DISTRIBUTE,
                    'has-distribute': item.status === SELECT_TYPE.HAS_DISTRIBUTE,
                    'has-trace': item.status === SELECT_TYPE.HAS_TRACE,
                });
                var listCls = classNames('list-item', {
                    //当添加完一个线索后,新加线索就是当前展示的线索
                    'current-row': this.state.currentId === item.id && (rightPanelShow || this.state.clueAddFormShow)
                });
                var addContent = '', addTime = '';
                if (_.isArray(item.customer_traces) && item.customer_traces.length) {
                    addContent = item.customer_traces[0].remark;
                    addTime = item.customer_traces[0].time ? moment(item.customer_traces[0].time).fromNow() : null;
                }
                var relativeSourceTime = this.getRelativeTime(item.source_time);
                var relativeStartTime = this.getRelativeTime(item.start_time);
                return (
                    <div className={listCls}>
                        <div className={itemCls}>
                            <Row>
                                <i></i>
                                <Col sm={12} lg={4}>
                                    <div className="customer-info-wrap">
                                        <h4>
                                            {item.customer_label ? (
                                                <Tag
                                                    className={crmUtil.getCrmLabelCls(item.customer_label)}>
                                                    {item.customer_label}</Tag>) : null
                                            }
                                            {item.name}
                                            {item.availability === '1' ? <Tag className="inavailable-tag">{Intl.get('sales.clue.is.enable','无效')}</Tag> : null}
                                        </h4>
                                        <p>{item.source}</p>
                                        <span className="hidden record-id">{item.id}</span>
                                    </div>
                                </Col>
                                <Col sm={6} lg={4}>
                                    <div className="contact-container">
                                        <div>{item.contact}</div>
                                        <div className="contact-way">{this.getContactList(item.contact_way, item)}</div>
                                    </div>
                                    <p>
                                        {item.source_time ? Intl.get('clue.customer.clue.time', '咨询于{relative}',{'relative': relativeSourceTime}) : null}
                                    </p>
                                </Col>
                                <Col sm={6} lg={3}>
                                    <div>
                                        {item.source_user_name}
                                    </div>
                                    <p>
                                        {item.start_time ? Intl.get('cluecustomer.create.time', '创建于{startTime}', {'startTime': relativeStartTime}) : null}
                                    </p>
                                </Col>
                                <Col sm={0} lg={3}>
                                    <div>{item.access_channel}</div>
                                    <p>{item.clue_source}</p>
                                </Col>
                                {item.user_name ? <Col sm={18} lg={5}>
                                    <div className="trace-record-wrap">
                                        <p>
                                            {Intl.get('cluecustomer.trace.person', '跟进人')}:{item.user_name}
                                        </p>
                                        <div className="trace-content-wrap">
                                            {item.addTraceContent ?
                                                <div className="edit-trace-content">
                                                    <AutosizeTextarea
                                                        placeholder={Intl.get('clue.customer.add.trace.content','请填写跟进内容')}
                                                        data-tracename="填写跟进内容"
                                                    />
                                                    <span className="buttons">
                                                        {this.state.submitTraceLoading ? (
                                                            <Icon type="loading"/>
                                                        ) : (
                                                            <span>
                                                                <i title={Intl.get('common.save', '保存')} className="inline-block iconfont icon-choose"
                                                                    onClick={this.handleSubmitTraceContent.bind(this, item)} data-tracename="点击保存跟进内容"/>
                                                                <i title={Intl.get('common.cancel', '取消')} className="inline-block iconfont icon-close"
                                                                    onClick={this.handleCancelTraceContent.bind(this, item)} data-tracename="点击取消保存跟进内容"/>
                                                            </span>
                                                        )}
                                                    </span>
                                                    {errorBlock}
                                                </div>
                                                : (addContent ?
                                                    <span className="trace-content">{addContent} {hasPrivilege('CLUECUSTOMER_ADD_TRACE') ? <i className="iconfont icon-update"
                                                        title={Intl.get('clue.customer.update.content', '编辑跟进内容按钮')}
                                                        onClick={this.updateCluecustomerContent.bind(this, item)} data-tracename="点击编辑跟进内容"/> : null} </span> : ( hasPrivilege('CLUECUSTOMER_ADD_TRACE') ? <span className="trace-content-flag"
                                                        onClick={this.showAddTraceContent.bind(this, item)} data-tracename="点击填写跟进内容按钮">+ {Intl.get('call.record.follow.content', '跟进内容')}</span> : null)
                                                )}

                                        </div>
                                        {addContent && addTime ? <p className="trace-time-wrap">
                                            {addTime}
                                        </p> : null}
                                    </div>
                                </Col> : null}
                                {(hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER') && !user.isCommonSales)) ?
                                    <Col sm={3} lg={2}>
                                        <div className="action-button-wrap">
                                            <AntcDropdown
                                                ref={'changesale' + item.id}
                                                content={dropDownContent}
                                                overlayTitle={Intl.get('user.salesman', '销售人员')}
                                                okTitle={Intl.get('crm.32', '变更')}
                                                cancelTitle={Intl.get('common.cancel', '取消')}
                                                isSaving={this.state.distributeLoading}
                                                overlayContent={this.renderSalesBlock()}
                                                handleSubmit={this.handleSubmitAssignSales.bind(this, item)}
                                                unSelectDataTip={this.state.unSelectDataTip}
                                                clearSelectData={this.clearSelectSales}
                                                getPopupContainer={() => document.getElementById('area')}
                                            />
                                        </div>
                                    </Col> : null
                                }
                                {hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_USER') || hasPrivilege('CLUECUSTOMER_UPDATE_AVAILABILITY_MANAGER') ?
                                    <Col sm={3} lg={3}>
                                        <div className="remark-clue-container">
                                            <Button disabled={this.state.isRemarkingItem === item.id ? true : false} type="primary" onClick={this.handleClickRemarkBtn.bind(this, item)} data-tracename="点击标记线索是否有效">
                                                {/*没有该字段，或该字段为0，表示该线索有效，为1表示无效*/}
                                                {!item.availability || item.availability === '0' ? Intl.get('sales.remark.clue.able','线索无效') : Intl.get('sales.remark.clue.enable', '线索有效')}
                                                {this.state.isRemarkingItem === item.id ? <Icon type="loading"/> : null}
                                            </Button>
                                        </div>
                                    </Col>
                                    : null}
                            </Row>
                        </div>
                    </div>
                );
            })
        );
    },
    handleScrollBarBottom: function() {
        var currListLength = _.isArray(this.state.curCustomers) ? this.state.curCustomers.length : 0;
        // 判断加载的条件
        if (currListLength <= this.state.customersSize) {
            this.getClueCustomerList();
        }
    },
    onTypeChange: function() {
        clueCustomerAction.setLastCustomerId('');
        this.state.rightPanelIsShow = false;
        rightPanelShow = false;
        this.setState(this.state);
        setTimeout(() => {
            this.getClueCustomerList();
        });
    },
    //获取线索客户列表
    getClueCustomerList: function() {
        //跟据类型筛选
        const typeFilter = JSON.parse(JSON.stringify(clueCustomerStore.getState().clueCustomerTypeFilter));
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(typeFilter);
        const lastCustomerId = clueCustomerStore.getState().lastCustomerId;
        clueCustomerAction.getClueCustomerList(typeFilter, this.state.rangParams, this.state.pageSize, this.state.sorter, lastCustomerId);
    },
    errTipBlock: function() {
        //加载完成，出错的情况
        var errMsg = <span>{this.state.clueCustomerErrMsg}
            <a onClick={this.getClueCustomerList} style={{marginLeft: '20px', marginTop: '20px'}}>
                <ReactIntl.FormattedMessage id="user.info.retry" defaultMessage="请重试"/>
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
    },
    renderClueCustomerBlock: function() {
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        if (!this.state.curCustomers.length) {
            //加载完成，没有数据的情况
            return (
                <div className="show-customer-trace">
                    <Alert
                        message={Intl.get('common.no.clue', '暂无线索')}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        } else {
            return (
                <div id="content-block" className="content-block" ref="clueCustomerList">
                    <div className="clue-customer-list"
                        style={{height: divHeight}}
                        id="area"
                    >
                        <GeminiScrollbar
                            handleScrollBottom={this.handleScrollBarBottom}
                            listenScrollBottom={this.state.listenScrollBottom}
                        >
                            {this.renderClueCustomerList()}
                            <NoMoreDataTip
                                show={this.showNoMoreDataTip}
                                message={Intl.get('common.no.more.clue','没有更多线索了')}
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
    },
    //更新线索来源列表
    updateClueSource: function(newSource) {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray: this.state.clueSourceArray
        });
    },
    //更新线索渠道列表
    updateClueChannel: function(newChannel) {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray: this.state.accessChannelArray
        });
    },
    //更新线索分类
    updateClueClassify: function(newClue) {
        this.state.clueClassifyArray.push(newClue);
        this.setState({
            clueClassifyArray: this.state.clueClassifyArray
        });
    },
    //关闭导入线索模板
    closeClueTemplatePanel: function() {
        this.setState({
            clueImportTemplateFormShow: false
        });
    },
    refreshClueList: function() {
        this.getClueCustomerList();
    },
    confirmImport(flag, cb) {
        this.setState({isImporting: true});
        $.ajax({
            url: '/rest/clue/confirm/upload/' + flag,
            dataType: 'json',
            type: 'get',
            async: false,
            success: (data) => {
                this.setState({isImporting: false});
                if (_.isFunction(cb)) cb();
            },
            error: (errorMsg) => {
                this.setState({isImporting: false});
                message.error(Intl.get('clue.customer.import.clue.failed', '导入线索失败'));
            }
        });
    },
    cancelImport() {
        this.setState({
            isPreviewShow: false,
        });

        this.confirmImport(false);
    },
    doImport(){
        this.confirmImport(true, () => {
            this.setState({
                isPreviewShow: false,
            });
            message.success(Intl.get('clue.customer.import.clue.suceess', '导入线索成功'));
            //刷新线索列表
            this.getClueCustomerList();
        });
    },
    renderImportModalFooter: function() {
        const repeatCustomer = _.find(this.state.previewList, item => (item.repeat));
        const loading = this.state.isImporting || false;

        return (
            <div>
                {repeatCustomer ? (
                    <span className="import-warning">
                        {Intl.get('clue.repeat.delete', '存在和系统中重复的线索名或联系方式，已用红色标出，请先在上方预览表格中删除这些记录，然后再导入')}
                    </span>
                ) : null}
                <Button type="ghost" onClick={this.cancelImport}>
                    {Intl.get('common.cancel', '取消')}
                </Button>
                {!repeatCustomer ? (
                    <Button type="primary" onClick={this.doImport} loading={loading}>
                        {Intl.get('common.sure', '确定') + Intl.get('common.import', '导入')}
                    </Button>
                ) : null}
            </div>
        );
    },
    //删除重复的线索
    deleteDuplicatImportClue: function(index) {
        var _this = this;
        $.ajax({
            url: '/rest/clue/repeat/delete/' + index,
            dataType: 'json',
            type: 'delete',
            success: function(result) {
                if (result && result.result === 'success') {
                    _this.state.previewList.splice(index, 1);
                    _this.setState({
                        previewList: _this.state.previewList
                    });
                } else {
                    message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败'));
                }
            },
            error: function(errorMsg) {
                message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败') || errorMsg);
            }
        });
    },
    render: function() {
        var _this = this;
        let previewColumns = [
            {
                title: Intl.get('clue.customer.clue.name', '线索名称'),
                dataIndex: 'name',
                render: function(text, record, index) {
                    var cls = record.repeat ? 'repeat-clue-name' : '';
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
                    if (_.isArray(record.contacts)){
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].name : null}</span>
                        );
                    }

                }

            },
            {
                title: Intl.get('common.phone', '电话'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)){
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].phone : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('common.email', '邮箱'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)){
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].email : null}</span>
                        );
                    }
                }
            },
            {
                title: 'QQ',
                render: function(text, record, index) {
                    if (_.isArray(record.contacts) && _.isArray(record.contacts[0].qq)){
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
                title: Intl.get('common.operate', '操作'),
                width: '60px',
                render: (text, record, index) => {
                    //是否在导入预览列表上可以删除
                    const isDeleteBtnShow = this.state.isPreviewShow && record.repeat;
                    return (
                        <span className="cus-op">
                            {isDeleteBtnShow ? (
                                <Button className="order-btn-class" icon="delete"
                                    onClick={_this.deleteDuplicatImportClue.bind(_this, index)}
                                    title={Intl.get('common.delete', '删除')}/>
                            ) : null}
                        </span>
                    );
                }
            }
        ];
        return (
            <RightContent>
                <div className="clue_customer_content" data-tracename="线索客户列表">
                    <FilterBlock>
                        <ClueCustomerFilterBlock
                            ref="clueCustomerFilter"
                            getClueCustomerList={this.getClueCustomerList}
                            clueCustomerValue={this.state.clueCustomerValue}
                            onTypeChange={this.onTypeChange}
                        />
                        {hasPrivilege('CRM_CLUE_STATISTICAL') || hasPrivilege('CRM_CLUE_TREND_STATISTIC_ALL') || hasPrivilege('CRM_CLUE_TREND_STATISTIC_SELF') ? this.renderClueAnalysisBtn() : null}
                        {this.renderHandleBtn()}
                        {this.renderImportClue()}
                        <div className="filter-block-line"></div>
                    </FilterBlock>
                    {this.state.clueAddFormShow ? (
                        <SalesClueAddForm
                            hideAddForm={this.hideClueAddForm}
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            clueClassifyArray={this.state.clueClassifyArray}
                            updateClueSource={this.updateClueSource}
                            updateClueChannel={this.updateClueChannel}
                            updateClueClassify={this.updateClueClassify}
                        />
                    ) : null}
                    <ClueImportTemplate
                        showFlag={this.state.clueImportTemplateFormShow}
                        closeClueTemplatePanel={this.closeClueTemplatePanel}
                        refreshClueList={this.refreshClueList}
                    />
                    <Modal
                        visible={this.state.isPreviewShow}
                        width="90%"
                        prefixCls="clue-import-modal ant-modal"
                        title={Intl.get('clue.manage.import.clue', '导入线索') + Intl.get('common.preview', '预览')}
                        footer={this.renderImportModalFooter()}
                        onCancel={this.cancelImport}
                    >
                        {this.state.isPreviewShow ? (
                            <AntcTable
                                dataSource={this.state.previewList}
                                columns={previewColumns}
                                rowKey={this.getRowKey}
                                pagination={false}
                            />
                        ) : null}

                    </Modal>
                    {this.state.isLoading ? (
                        <div className="table-loading-wrap">
                            <Spinner />
                        </div>
                    ) : (this.state.clueCustomerErrMsg ? this.errTipBlock() : (
                        this.renderClueCustomerBlock()
                    ))}
                    {this.state.rightPanelIsShow ? (
                        <ClueRightPanel
                            showFlag={this.state.rightPanelIsShow}
                            currentId={this.state.currentId}
                            hideRightPanel={this.hideRightPanel}
                            curCustomer={this.state.curCustomer}
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            clueClassifyArray={this.state.clueClassifyArray}
                            updateClueSource={this.updateClueSource}
                            updateClueChannel={this.updateClueChannel}
                            updateClueClassify={this.updateClueClassify}
                        />
                    ) : null}
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
                </div>
            </RightContent>
        );
    }
});
module.exports = ClueCustomer;