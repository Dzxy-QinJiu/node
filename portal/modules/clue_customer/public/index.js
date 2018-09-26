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
import {SearchInput} from 'antc';
import {message, Icon, Row, Col, Button, Alert, Select, Modal, Radio} from 'antd';
const RadioGroup = Radio.Group;
const Option = Select.Option;
import TopNav from 'CMP_DIR/top-nav';
import {removeSpacesAndEnter,getUnhandledClueCountParams} from 'PUB_DIR/sources/utils/common-method-util';
require('./css/index.less');
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount} from './utils/clue-customer-utils';
var Spinner = require('CMP_DIR/spinner');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import clueCustomerAjax from './ajax/clue-customer-ajax';
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
import SalesClueItem from 'MOD_DIR/common_sales_home_page/public/view/sales-clue-item';
import ClueAnalysisPanel from './views/clue-analysis-panel';
import SalesClueAddForm from './views/add-clues-form';
// import ClueImportRightDetail from './views/import_clue/clue_import_right_detail';
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
import {pathParamRegex} from 'PUB_DIR/sources/utils/consts';
import {FilterInput} from 'CMP_DIR/filter';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import ClueFilterPanel from './views/clue-filter-panel';
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

    showClueDetailOut = (item) => {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(item.id);
    };

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

    afterAddClueTrace = (updateId) => {
        var clueCustomerTypeFilter = getClueStatusValue(clueFilterStore.getState().filterClueStatus);
        if (clueCustomerTypeFilter.status === SELECT_TYPE.WILL_TRACE){
            clueCustomerAction.afterAddClueTrace(updateId);
        }
    };

    renderClueCustomerList = () => {
        var customerList = this.state.curClueLists;
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
                        getSelectContent={this.setSelectContent}
                        onSalesmanChange={this.onSalesmanChange}
                        salesMan={this.state.salesMan}
                        handleSubmitAssignSales={this.handleSubmitAssignSales}
                        distributeLoading={this.state.distributeLoading}
                        renderSalesBlock={this.renderSalesBlock}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectSales={this.clearSelectSales}
                        clueCustomerTypeFilter = {getClueStatusValue(clueFilterStore.getState().filterClueStatus)}
                    />
                );
            }));
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
                    dataList.push({
                        name: salesman.user_info.nick_name + '-' + team.group_name,
                        value: salesman.user_info.user_id + '&&' + team.group_id,
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

                    if (this.refs['salesclueitem' + item.id] && this.refs['salesclueitem' + item.id].refs['changesale' + item.id]) {
                        //隐藏批量变更销售面板
                        this.refs['salesclueitem' + item.id].refs['changesale' + item.id].handleCancel();
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
                </div>
            </RightContent>
        );
    }
}
ClueCustomer.propTypes = {
    location: PropTypes.object
};
module.exports = ClueCustomer;

