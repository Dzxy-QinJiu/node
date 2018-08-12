/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/23.
 */
var rightPanelShow = false;
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
var clueCustomerStore = require('./store/clue-customer-store');
var clueAnalysisStore = require('./store/clue-analysis-store');
var clueCustomerAction = require('./action/clue-customer-action');
import {clueEmitter} from 'OPLATE_EMITTER';
var userData = require('../../../public/sources/user-data');
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
import Trace from 'LIB_DIR/trace';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
var SearchInput = require('CMP_DIR/searchInputNew');
import {message, Icon, Row, Col, Button, Alert, Input, Tag, Modal, Select} from 'antd';
const Option = Select.Option;
var phoneMsgEmitter = require('PUB_DIR/sources/utils/emitters').phoneMsgEmitter;
import TopNav from 'CMP_DIR/top-nav';
import DatePicker from 'CMP_DIR/datepicker';
import {removeSpacesAndEnter} from 'PUB_DIR/sources/utils/common-method-util';
require('./css/index.less');
import {SELECT_TYPE, isOperation, isSalesLeaderOrManager} from './utils/clue-customer-utils';
var Spinner = require('CMP_DIR/spinner');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import clueCustomerAjax from './ajax/clue-customer-ajax';
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
import SalesClueItem from 'MOD_DIR/common_sales_home_page/public/view/sales-clue-item';
import ClueAnalysisPanel from './views/clue-analysis-panel';
import SalesClueAddForm from './views/add-clues-form';
import ClueImportTemplate from './views/clue-import-template';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
var RightContent = require('CMP_DIR/privilege/right-content');
import {AntcTable} from 'antc';
import classNames from 'classnames';
import ClueRightPanel from './views/clue-right-detail';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
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
            clueCustomerTypeFilter: {status: ''},
            ...clueCustomerStore.getState()
        };
    },

    componentDidMount: function() {
        clueCustomerStore.listen(this.onStoreChange);
        if (hasPrivilege('CUSTOMER_ADD_CLUE')) {
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
        this.getClueList();
        this.getUserPhoneNumber();
        clueEmitter.on(clueEmitter.IMPORT_CLUE, this.onClueImport);
    },
    showClueDetailOut: function(item) {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(item.id);
    },
    //展示右侧面板
    showRightPanel: function(id) {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(id);
    },
    hideRightPanel: function() {
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        //关闭右侧面板后，将当前展示线索的id置为空
        clueCustomerAction.setCurrentCustomer('');
    },
    onClueImport: function(list) {
        this.setState({
            isPreviewShow: true,
            previewList: list,
        });
    },
    componentWillUnmount: function() {
        clueCustomerStore.unlisten(this.onStoreChange);
        // clueAnalysisStore.unlisten(this.onStoreChange);
        this.hideRightPanel();
        clueEmitter.removeListener(clueEmitter.IMPORT_CLUE, this.onClueImport);
    },
    onStoreChange: function() {
        this.setState(clueCustomerStore.getState());
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
    //渲染导入线索的按钮
    renderImportClue: function() {
        return (
            <div className="import-clue-customer-container pull-right">
                {hasPrivilege('CUSTOMER_ADD_CLUE') ?
                    <Button type="primary" onClick={this.showImportClueTemplate}>
                        <span className="clue-container">
                            {Intl.get('clue.manage.import.clue', '导入线索')}
                        </span>
                    </Button>
                    : null}
            </div>
        );
    },
    //点击导入线索按钮
    showImportClueTemplate: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.import-clue-customer-container'), '点击导入线索按钮');
        this.setState({
            clueImportTemplateFormShow: true
        });
    },
    //关闭导入线索模板
    closeClueTemplatePanel: function() {
        this.setState({
            clueImportTemplateFormShow: false
        });
    },
    showClueAddForm: function() {
        Trace.traceEvent($(this.getDOMNode()).find('.handle-btn-container'), '点击添加销售线索按钮');
        this.setState({
            clueAddFormShow: true
        });
    },
    //关闭增加线索面板
    hideClueAddForm: function() {
        this.setState({
            clueAddFormShow: false
        });
    },
    renderHandleBtn: function() {
        return (
            <div className="add-clue-customer-container pull-right">
                {hasPrivilege('CUSTOMER_ADD_CLUE') ?
                    <Button onClick={this.showClueAddForm}
                        title={Intl.get('crm.sales.add.clue', '添加线索')}>
                        <span className="button-container">{Intl.get('crm.sales.add.clue', '添加线索')}</span>
                    </Button> :
                    null
                }
            </div>
        );
    },
    handleClickCallOut(phoneNumber, record) {
        Trace.traceEvent($(this.getDOMNode()).find('.column-contact-way'), '拨打电话');
        if (this.state.errMsg) {
            message.error(this.state.errMsg || Intl.get('crm.get.phone.failed', ' 获取座机号失败!'));
        } else {
            if (this.state.callNumber) {
                phoneMsgEmitter.emit(phoneMsgEmitter.SEND_PHONE_NUMBER,
                    {
                        contact: record.contact,
                    }
                );
                let reqData = {
                    from: this.state.callNumber,
                    to: phoneNumber.replace('-', '')
                };
                crmAjax.callOut(reqData).then((result) => {
                    if (result.code === 0) {
                        message.success(Intl.get('crm.call.phone.success', '拨打成功'));
                    }
                }, (errMsg) => {
                    message.error(errMsg || Intl.get('crm.call.phone.failed', '拨打失败'));
                });
            } else {
                message.error(Intl.get('crm.bind.phone', '请先绑定分机号！'));
            }
        }
    },
    //是否是运营人员
    isOperation(){
        return userData.hasRole('operations');
    },

    setInitialData: function() {
        clueCustomerAction.setClueInitialData();
    },
    //获取线索列表
    getClueList: function() {
        //跟据类型筛选
        const queryObj = {
            lastClueId: this.state.lastCustomerId,
            pageSize: this.state.pageSize,
            sorter: this.state.sorter,
            keyword: this.state.keyword,
            rangeParams: JSON.stringify(this.state.rangParams),
            statistics_fields: 'status',
            userId: userData.getUserData().userId || '',
            typeFilter: JSON.stringify(this.state.clueCustomerTypeFilter)
        };

        //如果选中的线索状态不是全部的时候，返回的统计数字是不全的，要重新发请求，单独取统计数字
        if (this.state.clueCustomerTypeFilter.status !== ''){
            const keywordObj = {
                rangeParams: JSON.stringify(this.state.rangParams),
                pageSize: 0,
                sorter: this.state.sorter,
                statistics_fields: 'status',
                keyword: this.state.keyword,
                userId: userData.getUserData().userId,
                typeFilter: JSON.stringify({status: ''}),
                getOnlyAnalysisData: true//取统计数字的标识
            };
            clueCustomerAction.getClueFulltext(keywordObj);
        }
        //取全部线索列表
        clueCustomerAction.getClueFulltext(queryObj);
    },
    errTipBlock: function() {
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
    },
    afterAddClueTrace: function(updateId) {
        this.updateStatusStatistics(SELECT_TYPE.HAS_DISTRIBUTE,SELECT_TYPE.HAS_TRACE);
        if (this.state.clueCustomerTypeFilter.status === SELECT_TYPE.HAS_DISTRIBUTE){
            clueCustomerAction.afterAddClueTrace(updateId);
        }
    },
    updateStatusStatistics: function(subtrItem, addItem) {
        var statusStaticis = this.state.statusStaticis;
        _.forEach(statusStaticis, (value, key) => {
            //加完跟进记录后，在待跟进的线索列表中减一
            if (key === subtrItem) {
                statusStaticis[key] = value - 1;
            }
            //在已跟进的线索列表中加一
            if (key === addItem) {
                statusStaticis[key] = value + 1;
            }
        });
    },
    renderClueCustomerList: function() {
        var customerList = this.state.curCustomers;
        return (
            _.map(customerList, (item) => {
                return (
                    <SalesClueItem
                        showClueDetailOut={this.showClueDetailOut}
                        currentId = {this.state.currentId}
                        showDetailWrap={true}
                        ref={'salesclueitem' + item.id}
                        salesClueItemDetail={item}
                        callNumber={this.state.callNumber}
                        errMsg={this.state.errMsg}
                        afterAddClueTrace={this.afterAddClueTrace}
                        salesManList={this.state.salesManList}
                        getSelectContent={this.setSelectContent}
                        onSalesmanChange={this.onSalesmanChange}
                        salesMan={this.state.salesMan}
                        handleSubmitAssignSales={this.handleSubmitAssignSales}
                        distributeLoading={this.state.distributeLoading}
                        renderSalesBlock={this.renderSalesBlock}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectSales={this.clearSelectSales}
                        clueCustomerTypeFilter={this.state.clueCustomerTypeFilter}
                    />
                );
            }));
    },
    clearSelectSales: function() {
        clueCustomerAction.setSalesMan({'salesMan': ''});
        clueCustomerAction.setSalesManName({'salesManNames': ''});
    },
    renderSalesBlock: function() {
        let dataList = [];
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        this.state.salesManList.forEach(function(salesman) {
            let teamArray = salesman.user_groups;
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                teamArray.forEach(team => {
                    dataList.push({
                        name: salesman.user_info.nick_name + '-' + team.group_name,
                        value: salesman.user_info.user_id + '&&' + team.group_id
                    });
                });
            }
        });
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
                if (feedbackObj && feedbackObj.errorMsg) {
                    message.error(feedbackObj.errorMsg || Intl.get('failed.to.distribute.cluecustomer', '分配线索客户失败'));
                } else {
                    if (this.refs['salesclueitem' + item.id] && this.refs['salesclueitem' + item.id].refs['changesale' + item.id]) {
                        //隐藏批量变更销售面板
                        this.refs['salesclueitem' + item.id].refs['changesale' + item.id].handleCancel();
                    }

                    //如果是待分配状态，分配完之后要在列表中删除一个,在待跟进列表中增加一个
                    if (this.state.clueCustomerTypeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE) {
                        clueCustomerAction.afterAssignSales(item.id);
                        this.updateStatusStatistics(SELECT_TYPE.WILL_DISTRIBUTE, SELECT_TYPE.HAS_DISTRIBUTE);
                    } else {
                        item.user_name = sale_name;
                        item.user_id = sale_id;
                        item.sales_team = team_name;
                        item.sales_team_id = team_id;
                        item.status = SELECT_TYPE.HAS_DISTRIBUTE;
                        this.setState({
                            curCustomers: this.state.curCustomers
                        });
                    }
                }
            });
        }
    },
    //获取已选销售的id
    onSalesmanChange(salesMan){
        clueCustomerAction.setSalesMan({'salesMan': salesMan});
    },
    //设置已选销售的名字
    setSelectContent: function(salesManNames) {
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
    },
    handleScrollBarBottom: function() {
        var currListLength = _.isArray(this.state.curCustomers) ? this.state.curCustomers.length : 0;
        // 判断加载的条件
        if (currListLength <= this.state.customersSize) {
            this.getClueList();
        }
    },
    renderClueCustomerBlock: function() {
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        if (this.state.curCustomers.length) {
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
    },
    showNoMoreDataTip: function() {
        return !this.state.isLoading &&
            this.state.curCustomers.length >= 20 && !this.state.listenScrollBottom;
    },
    onTypeChange: function() {
        clueCustomerAction.setClueInitialData();
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        setTimeout(() => {
            this.getClueList();
        });

    },
    onSelectDate: function(start_time, end_time) {
        if (!start_time) {
            //为了防止开始时间不传，后端默认时间是从1970年开始的问题
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        clueCustomerAction.setTimeRange({start_time: start_time, end_time: end_time});
        this.onTypeChange();
    },
    onStatusChange: function(value) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.type-container'), '点击切换筛选线索客户类型');
        var clueCustomerTypeFilter = this.state.clueCustomerTypeFilter;
        clueCustomerTypeFilter.status = value;
        this.setState({
            clueCustomerTypeFilter: clueCustomerTypeFilter
        });
        this.onTypeChange();
    },
    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent: function() {
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
        } else if (!this.state.isLoading && !this.state.clueCustomerErrMsg && !this.state.curCustomers.length) {
            //数据为空的展示
            return (
                <div className="no-data">
                    <i className="iconfont icon-no-data"></i>
                    <p className="abnornal-status-tip">{Intl.get('common.sales.data.no.data', '暂无此类信息')}</p>
                </div>
            );
        } else {
            //渲染线索列表
            return this.renderClueCustomerBlock();
        }
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
            <div className="clue-analysis-btn-container pull-right">
                <Button className="call-analysis-btn" title={Intl.get('clue.alanalysis.charts','线索分析')} onClick={this.handleClueAnalysisPanel}
                    data-tracename="点击线索分析按钮">
                    {Intl.get('user.detail.analysis', '分析')}
                </Button>
            </div>
        );
    },
    refreshClueList: function() {
        this.getClueList();
    },
    cancelImport() {
        this.setState({
            isPreviewShow: false,
        });
        this.confirmImport(false);
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
    doImport(){
        this.confirmImport(true, () => {
            this.setState({
                isPreviewShow: false,
            });
            message.success(Intl.get('clue.customer.import.clue.suceess', '导入线索成功'));
            this.getClueList();
        });
    },
    searchFullTextEvent: function(keyword) {
        //如果keyword存在，就用全文搜索的接口
        clueCustomerAction.setKeyWord(keyword);
        //如果keyword不存在，就用获取线索的接口
        this.onTypeChange();

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

    render: function() {
        let user = userData.getUserData();
        var statusStaticis = this.state.statusStaticis;
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
        var cls = classNames('right-panel-modal',
            {'show-modal': this.state.clueAddFormShow
            });
        return (
            <RightContent>
                <div className="clue_customer_content" data-tracename="线索客户列表">
                    <TopNav>
                        <div className="date-picker-wrap">
                            <span className="consult-time">{Intl.get('clue.analysis.consult.time', '咨询时间')}</span>
                            <DatePicker
                                disableDateAfterToday={true}
                                range="week"
                                onSelect={this.onSelectDate}>
                                <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                            </DatePicker>
                            <div className="type-container">
                                <Select value={this.state.clueCustomerTypeFilter.status} onChange={this.onStatusChange}>
                                    {/*运营人员才展示全部这个按钮*/}
                                    {user.isCommonSales ? null : <Option value="">
                                        {Intl.get('common.all', '全部')}
                                        {statusStaticis[SELECT_TYPE.ALL]}                                    </Option>}
                                    {user.isCommonSales ? null : <Option value="0">
                                        {Intl.get('clue.customer.will.distribution', '待分配')}
                                        {statusStaticis[SELECT_TYPE.WILL_DISTRIBUTE]}
                                    </Option>}
                                    <Option value="1">
                                        {Intl.get('sales.home.will.trace', '待跟进')}
                                        {statusStaticis[SELECT_TYPE.HAS_DISTRIBUTE]}
                                    </Option>
                                    <Option value="2">
                                        {Intl.get('clue.customer.has.follow', '已跟进')}
                                        {statusStaticis[SELECT_TYPE.HAS_TRACE]}
                                    </Option>
                                </Select>
                            </div>
                            <div className="search-container">
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
                                {this.renderHandleBtn()}
                                {this.renderImportClue()}
                            </div>
                        </div>

                    </TopNav>
                    <div className="clue-content-container">
                        {this.renderLoadingAndErrAndNodataContent()}
                    </div>
                    <div className={cls}>
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
                    </div>

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
                    <RightPanel
                        className="clue_customer_rightpanel white-space-nowrap"
                        showFlag={this.state.rightPanelIsShow} data-tracename="展示销售线索客户">
                        <span className="iconfont icon-close clue-right-btn" onClick={this.hideRightPanel}></span>
                        <ClueRightPanel
                            currentId={this.state.currentId}
                            curClue={this.state.curCustomer}
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            clueClassifyArray={this.state.clueClassifyArray}
                            updateClueSource={this.updateClueSource}
                            updateClueChannel={this.updateClueChannel}
                            updateClueClassify={this.updateClueClassify}
                            salesManList={this.state.salesManList}
                        />
                    </RightPanel>
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
