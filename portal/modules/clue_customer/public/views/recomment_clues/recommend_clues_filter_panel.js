/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/4/16.
 */

require('../../css/recommend-customer-condition.less');
import React, {Component} from 'react';
import {Form, Input, Select, Icon, Popover, Button, Dropdown, Menu} from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;
import {AntcAreaSelection} from 'antc';
import Trace from 'LIB_DIR/trace';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
import { registerSize, staffSize, moneySize, companyProperty, EXTRACT_CLUE_CONST_MAP } from '../../utils/clue-customer-utils';
import {
    checkVersionAndType,
    getFormattedCondition,
    removeEmptyItem,
    isExpired,
    getContactSalesPopoverTip
} from 'PUB_DIR/sources/utils/common-method-util';
import {RECOMMEND_CLUE_FILTERS, COMPANY_VERSION_KIND} from 'PUB_DIR/sources/utils/consts';
import classNames from 'classnames';
import { paymentEmitter } from 'OPLATE_EMITTER';
import {addOrEditSettingCustomerRecomment} from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';


const ADVANCED_OPTIONS = [
    {
        name: Intl.get('clue.recommend.register.half.year', '近半年注册'),
        value: `feature:${EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER}`
    },
    {
        name: Intl.get('clue.recommend.listed', '上市企业'),
        value: 'feature:上市'
    },
    {
        name: Intl.get('clue.recommend.high.tech.enterprise.enterprise', '高新技术'),
        value: 'feature:高新'
    },
    {
        name: Intl.get('clue.recommend.state.owned.enterprise', '国有企业'),
        value: 'feature:国企'
    },
    {
        name: Intl.get('clue.recommend.has.mobile', '有手机号'),
        value: 'mobile_num:1'
    },
    {
        name: Intl.get('clue.recommend.has.phone', '有电话'),
        value: 'phone_num:1'
    },
    {
        name: Intl.get('clue.recommend.has.more.contact', '多个联系方式'),
        value: 'phone_num:2'
    },
];

let searchTimeOut = null;
const delayTime = 500;

//vip集合
const VIP_ITEM_MAP = {
    REGISTER_TIME: 'register_time',//成立时间
    COMPANY_SIZE: 'company_size',//公司规模
    REGISTER_MONEY: 'register_money',//注册资本
    COMPANY_ENTYPES: 'company_entTypes',//企业类型
};

const KEYCODE = {
    ENTER: 13
};

class RecommendCluesFilterPanel extends Component {
    constructor(props) {
        super(props);

        let hasSavedRecommendParams = _.cloneDeep(this.props.hasSavedRecommendParams);
        this.state = {
            hasSavedRecommendParams,
            vipPopOverVisible: '',
            vipPopOverVisibleContent: null,
            showOtherCondition: false,
            isSaving: false,
            vipFilters: this.dealRecommendParamsVipData(hasSavedRecommendParams)
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.isEmpty(this.state.hasSavedRecommendParams) || !_.isEqual(nextProps.hasSavedRecommendParams, this.state.hasSavedRecommendParams)){
            let hasSavedRecommendParams = _.cloneDeep(nextProps.hasSavedRecommendParams);
            this.setState({
                hasSavedRecommendParams,
                vipFilters: this.dealRecommendParamsVipData({...hasSavedRecommendParams, ...this.state.vipFilters})
            });
        }
    }

    //处理线索推荐条件中的vip选项
    dealRecommendParamsVipData(condition) {
        let obj = {};
        if(condition.startTime) {
            obj.startTime = condition.endTime;
        }
        if(condition.endTime) {
            obj.endTime = condition.endTime;
        }
        if(condition.staffnumMax) {
            obj.staffnumMax = condition.staffnumMax;
        }
        if(condition.staffnumMin) {
            obj.staffnumMin = condition.staffnumMin;
        }
        if(condition.capitalMax) {
            obj.capitalMax = condition.capitalMax;
        }
        if(condition.capitalMin) {
            obj.capitalMin = condition.capitalMin;
        }
        if(condition.entTypes) {
            obj.entTypes = condition.entTypes;
        }
        return obj;
    }

    getRecommendClueList= (condition) => {
        if(searchTimeOut) {
            clearTimeout(searchTimeOut);
        }
        searchTimeOut = setTimeout(() => {
            let newCondition = _.clone(condition);
            let propsCondition = _.clone(this.props.hasSavedRecommendParams);
            removeEmptyItem(newCondition);

            //条件没有变动时，不用请求接口保存筛选条件
            if(!_.isEqual(newCondition, propsCondition)) {
                this.saveRecommendFilter(newCondition);
            }
            clueCustomerAction.saveSettingCustomerRecomment(newCondition);
            this.props.getRecommendClueLists(newCondition, EXTRACT_CLUE_CONST_MAP.RESET);
        }, delayTime);
    };

    //保存推荐线索的条件
    saveRecommendFilter(hasSavedRecommendParams) {
        if(this.state.isSaving || this.props.isLoading) return false;
        let traceStr = getFormattedCondition(hasSavedRecommendParams, RECOMMEND_CLUE_FILTERS);
        Trace.traceEvent($(ReactDOM.findDOMNode(this)), '保存线索推荐查询条件 ' + traceStr);
        this.setState({isSaving: true});
        addOrEditSettingCustomerRecomment(hasSavedRecommendParams).then((data) => {
            this.setState({isSaving: false});
            if (data){
                let targetObj = _.get(data, '[0]');
                this.setState({hasSavedRecommendParams: targetObj});
                clueCustomerAction.saveSettingCustomerRecomment(targetObj);
            }
        }, () => {
            this.setState({isSaving: false});
        });
    }

    getKeyWordPlaceholder() {
        return [Intl.get('register.company.nickname', '公司名称'), Intl.get('clue.recommend.industry.name', '行业名称'), Intl.get('common.product.name', '产品名称')].join('/');
    }

    searchChange = (e) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.keyword = _.trim(e.target.value || '');
        this.setState({hasSavedRecommendParams});
    };

    onKeyDown = (e) => {
        if(e.keyCode === KEYCODE.ENTER && this.props.canClickMoreBatch) {
            this.searchEvent(e.target.value);
        }
    };

    searchEvent = (value) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.keyword = _.trim(value || '');
        this.setState({hasSavedRecommendParams}, () => {
            this.getRecommendClueList(hasSavedRecommendParams);
        });
    }

    onSearchButtonClick = () => {
        if (this.props.canClickMoreBatch && _.trim(this.refs.searchInput.props.value)) {
            this.searchEvent(this.refs.searchInput.props.value);
        }
    };

    closeSearchInput = () => {
        this.searchEvent();
    };

    //更新地址
    updateLocation = (addressObj) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.province = addressObj.provName || '';
        hasSavedRecommendParams.city = addressObj.cityName || '';
        hasSavedRecommendParams.district = addressObj.countyName || '';
        //这里不要setState，否则选中了省份后的各省市面板会收起
        this.getRecommendClueList(hasSavedRecommendParams);
    };

    handleChange = (e) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.name = _.trim(e.target.value || '');
        this.setState({hasSavedRecommendParams});
    };

    onSelect = (type, value, isReset) => {
        let vipFilters = _.cloneDeep(this.state.vipFilters);
        let hasSavedRecommendParams = _.cloneDeep(this.state.hasSavedRecommendParams);
        let hasContinueUse = true;
        value = _.isObject(value) ? value.key : value;
        switch (type) {
            case VIP_ITEM_MAP.REGISTER_TIME:
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.REGISTER_TIME, '成立时间');
                if (hasContinueUse && value && _.isString(value)){
                    let timeObj = JSON.parse(value);
                    //1-3年  (min:1,max:3)
                    // startTime传3年前的时间， endTime传1年前的时间
                    //所以min是传到endTime，max是传到startTime上
                    //开始时间要取那天早上的00:00:00
                    //结束时间要取那天晚上的23:59:59
                    if(isReset) {
                        delete vipFilters.startTime;
                        delete vipFilters.endTime;
                        delete hasSavedRecommendParams.startTime;
                        delete hasSavedRecommendParams.endTime;
                    }else {
                        if (_.get(timeObj, 'min')) {//传到endTime
                            vipFilters.endTime = moment().subtract(_.get(timeObj, 'min'), 'years').endOf('day').valueOf();
                        }else{
                            delete vipFilters.endTime;
                        }
                        if (_.get(timeObj, 'max')){//传到startTime
                            vipFilters.startTime = moment().subtract(_.get(timeObj, 'max'), 'years').startOf('day').valueOf();
                        }else{
                            delete vipFilters.startTime;
                        }
                    }
                }
                break;
            case VIP_ITEM_MAP.COMPANY_SIZE://公司规模
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.COMPANY_SIZE, '公司规模');
                if (hasContinueUse && value && _.isString(value)){
                    let staffObj = JSON.parse(value);
                    if(isReset) {
                        delete vipFilters.staffnumMin;
                        delete vipFilters.staffnumMax;
                        delete hasSavedRecommendParams.staffnumMax;
                        delete hasSavedRecommendParams.staffnumMin;
                    }else {
                        if (_.get(staffObj, 'staffnumMin')) {
                            vipFilters.staffnumMin = _.get(staffObj, 'staffnumMin');
                        }else{
                            delete vipFilters.staffnumMin;
                        }
                        if (_.get(staffObj, 'staffnumMax')){
                            vipFilters.staffnumMax = _.get(staffObj,'staffnumMax');
                        }else{
                            delete vipFilters.staffnumMax;
                        }
                    }
                }
                break;
            case VIP_ITEM_MAP.REGISTER_MONEY://注册资本
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.REGISTER_MONEY, '注册资本');
                if (hasContinueUse && value && _.isString(value)) {
                    let moneyObj = JSON.parse(value);
                    if(isReset) {
                        delete vipFilters.capitalMax;
                        delete vipFilters.capitalMin;
                        delete hasSavedRecommendParams.capitalMax;
                        delete hasSavedRecommendParams.capitalMin;
                    }else {
                        if (_.get(moneyObj, 'capitalMin')) {
                            vipFilters.capitalMin = _.get(moneyObj,'capitalMin');
                        }else{
                            delete vipFilters.capitalMin;
                        }
                        if (_.get(moneyObj, 'capitalMax')) {
                            vipFilters.capitalMax = _.get(moneyObj,'capitalMax');
                        }else{
                            delete vipFilters.capitalMax;
                        }
                    }
                }
                break;
            case VIP_ITEM_MAP.COMPANY_ENTYPES://企业类型
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.COMPANY_ENTYPES, '企业类型');
                if(hasContinueUse && value && _.isString(value)) {
                    let entTypes = JSON.parse(value);
                    if(isReset) {
                        delete vipFilters.entTypes;
                        delete hasSavedRecommendParams.entTypes;
                    }else {
                        if (_.get(entTypes, 'value')){
                            vipFilters.entTypes = [_.get(entTypes, 'value')];
                        }else{
                            delete vipFilters.entTypes;
                        }
                    }
                }
                break;
        }

        if(!hasContinueUse) {
            return false;
        }
        this.setState({vipFilters}, () => {
            if(isReset) {
                this.getRecommendClueList(hasSavedRecommendParams);
            }
        });
    };

    handleClickAdvanced = (key) => {
        if(!this.props.canClickMoreBatch) { return false; }
        let advanced = '';
        let currentAdvancedItem = _.find(ADVANCED_OPTIONS, item => item.value === key);
        let advancedName = '';
        if(currentAdvancedItem) {
            advancedName = currentAdvancedItem.name;
        }

        let traceTip = `取消选中'${advancedName}'`;
        if(key !== this.props.feature) {
            advanced = key;
            traceTip = `选中'${advancedName}'`;
        }
        Trace.traceEvent(ReactDOM.findDOMNode(this), `点击${traceTip}按钮`);
        clueCustomerAction.saveSettingCustomerRecomment(this.state.hasSavedRecommendParams);
        clueCustomerAction.setHotSource(advanced);
        setTimeout(() => {
            this.getRecommendClueList(this.state.hasSavedRecommendParams);
        });
    };

    //点击vip项处理事件
    handleVipItemClick(key, trace) {
        let currentVersionObj = checkVersionAndType();
        //个人版试用\到期，展示升级\续费的界面
        if(currentVersionObj.isPersonalTrial || (currentVersionObj.isPersonalFormal && isExpired())) {
            this.handleUpgradePersonalVersion(trace);
            return false;
        }
        //企业试用或者企业账号到期，提示联系销售升级\续费的popover
        else if(currentVersionObj.isCompanyTrial || currentVersionObj.isCompanyFormal && isExpired()) {
            let tip = null;
            if(currentVersionObj.isCompanyTrial) {
                Trace.traceEvent(ReactDOM.findDOMNode(this), `企业试用点击了'${trace}'`);
                tip = getContactSalesPopoverTip(true);
            }else if(currentVersionObj.isCompanyFormal && isExpired()) {
                Trace.traceEvent(ReactDOM.findDOMNode(this), `企业正式过期后，点击了'${trace}'`);
                tip = getContactSalesPopoverTip();
            }

            //提示跟随
            let content = (
                <div>
                    <i className="iconfont icon-warn-icon"/>
                    {tip}
                    <i className="iconfont icon-close" title={Intl.get('common.app.status.close','关闭')} onClick={this.handleVisibleChange.bind(this, false)}/>
                </div>
            );
            this.setState({
                vipPopOverVisibleContent: content,
                vipPopOverVisible: key
            });
            return false;
        }
        return true;
    }

    //------ 升级正式版的处理start ------//
    //个人试用升级为正式版
    handleUpgradePersonalVersion = (trace) => {
        let tipTitle = '';
        let currentVersionObj = checkVersionAndType();
        //个人试用版本过期
        if (currentVersionObj.isPersonalTrial) {
            if(isExpired()) {
                // 展示升级个人正式版的界面
                Trace.traceEvent(event, '个人试用到期后点击vip选项，打开个人升级界面');
            }else {
                Trace.traceEvent(ReactDOM.findDOMNode(this), `个人试用点击'${trace}', 自动打开个人升级界面`);
            }
        } else if (currentVersionObj.isPersonalFormal && isExpired()) {//个人正式版过期时，展示续费界面
            Trace.traceEvent(event, '个人正式过期后点击vip选项，打开个人续费界面');
            tipTitle = Intl.get('payment.renewal.extract.lead', '续费后可提取线索');
        }
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            showDifferentVersion: this.triggerShowVersionInfo,
            leftTitle: tipTitle
        });
    };
    //显示/隐藏版本信息面板
    triggerShowVersionInfo = (isShowModal = true) => {
        paymentEmitter.emit(paymentEmitter.OPEN_APPLY_TRY_PANEL, {isShowModal, versionKind: COMPANY_VERSION_KIND});
    };
    //------ 升级正式版的处理end ------//

    handleVisibleChange = (visible) => {
        if(!visible) {
            this.setState({vipPopOverVisible: '', vipPopOverVisibleContent: null});
        }
    };

    handleToggleOtherCondition = () => {
        this.setState({
            showOtherCondition: !this.state.showOtherCondition,
            vipFilters: this.dealRecommendParamsVipData(this.props.hasSavedRecommendParams)
        }, () => {
            _.isFunction(this.props.handleToggleOtherCondition) && this.props.handleToggleOtherCondition();
        });
    };

    handleSubmit = () => {
        if(!this.props.canClickMoreBatch) { return false;}
        this.getRecommendClueList({...this.state.hasSavedRecommendParams, ...this.state.vipFilters});
    };

    //处理成立时间数据
    handleRegisterTimeData(condition) {
        let timeTarget = {};
        let startTime = condition.startTime, endTime = condition.endTime;
        if(startTime) {
            timeTarget.max = moment().diff(startTime, 'years');
        }
        if(endTime) {
            timeTarget.min = moment().endOf('day').diff(endTime, 'years');
        }
        timeTarget = _.find(registerSize, item => {
            if(timeTarget.max <= 1 && item.max === 1) {//一年以内
                return true;
            }else if(timeTarget.min >= 10 && item.min === 10) {//10年以上
                return true;
            }
            if(timeTarget.max >= item.min && timeTarget.max <= item.max) {
                return true;
            }
        });
        return timeTarget;
    }

    //处理公司规模数据
    handleCompanySizeData(condition) {
        let staffTarget = {};
        if(condition.staffnumMin || condition.staffnumMax){
            staffTarget = _.find(staffSize, item => item.staffnumMin === condition.staffnumMin && item.staffnumMax === condition.staffnumMax );
        }
        return staffTarget;
    }

    //处理注册资本数据
    handleCapitalData(condition) {
        let capitalTarget = {};
        if(condition.capitalMin || condition.capitalMax){
            capitalTarget = _.find(moneySize, item => item.capitalMin === condition.capitalMin && item.capitalMax === condition.capitalMax );
        }
        return capitalTarget;
    }

    //处理企业类型数据
    handleEntTypesData(condition) {
        let entypesTarget = {};
        if(condition.entTypes){
            entypesTarget = _.find(companyProperty, item => _.includes(condition.entTypes, item.value));
        }
        return entypesTarget;
    }

    //已选中条件集合
    handleSelectedFilterList() {
        let { hasSavedRecommendParams } = this.state;
        let list = [];
        //可展示的已选条件field集合
        const SELECTED_FILTER_FIELDS = [
            {
                name: Intl.get('clue.recommend.established.time', '成立时间'),
                key: VIP_ITEM_MAP.REGISTER_TIME,
                processValue: this.handleRegisterTimeData
            }, {
                name: Intl.get('clue.recommend.company.size', '公司规模'),
                key: VIP_ITEM_MAP.COMPANY_SIZE,
                processValue: this.handleCompanySizeData
            }, {
                name: Intl.get('clue.recommend.registered.capital', '注册资本'),
                key: VIP_ITEM_MAP.REGISTER_MONEY,
                processValue: this.handleCapitalData
            }, {
                name: Intl.get('clue.recommend.enterprise.class', '企业类型'),
                key: VIP_ITEM_MAP.COMPANY_ENTYPES,
                processValue: this.handleEntTypesData
            }
        ];
        _.each(SELECTED_FILTER_FIELDS, item => {
            if(_.isFunction(item.processValue)) {
                let value = item.processValue(hasSavedRecommendParams);
                if(!_.isEmpty(value)) {
                    list.push({
                        name: item.name,
                        value: value.name,
                        key: item.key,
                        handleClick: () => {
                            if(_.isFunction(item.handleClick)) {
                                item.handleClick();
                            }else{
                                this.onSelect(item.key, JSON.stringify({name: ''}), true);
                            }
                        }
                    });
                }
            }
        });
        return list;
    }

    //渲染高级选项
    renderAdvancedOptions() {
        return _.map(ADVANCED_OPTIONS, (item, idx) => {
            let cls = classNames('advance-btn-item', {
                'advance-active': this.props.feature === item.value
            });
            return (
                <span key={idx} className={cls} onClick={this.handleClickAdvanced.bind(this, item.value)}>{item.name}</span>
            );
        });
    }

    renderDropDownBlock({btnText, type, list, getValue = () => {}}) {
        let currentValue = getValue();
        let menus = (
            <Menu onClick={this.onSelect.bind(this, type)} selectedKeys={currentValue}>
                {_.map(list, item => (
                    <Menu.Item key={JSON.stringify(item)}>{item.name}</Menu.Item>
                ))}
            </Menu>
        );
        currentValue = JSON.parse(currentValue);
        let text = _.get(currentValue, 'name');
        let textCls = classNames({
            'vip-item-active': text && text !== Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: btnText})
        });
        return (
            <Dropdown overlay={menus} overlayClassName="vip-item-dropDown">
                <Popover
                    trigger="click"
                    placement="bottomLeft"
                    content={this.state.vipPopOverVisibleContent}
                    visible={this.state.vipPopOverVisible === type}
                    onVisibleChange={this.handleVisibleChange}
                    overlayClassName="extract-limit-content"
                >
                    <span className={textCls}>
                        {text ? currentValue.name : btnText}<Icon type="down"/>
                    </span>
                </Popover>
            </Dropdown>
        );
    }

    //渲染已选中条件
    renderSelectedFilterBlock() {
        let list = this.handleSelectedFilterList();
        if(list.length) {
            return (
                <div className="selected-filter-container">
                    <div className="selected-filter-content">
                        <span className="selected-filter-title">{Intl.get('clue.recommend.filter.selected', '已选条件')}：</span>
                        {_.map(list, item => (
                            <span key={item.key} className="selected-filter-item"><span>{item.name}：{item.value}</span><i className="iconfont icon-close" onClick={item.handleClick}/></span>
                        ))}
                    </div>
                </div>
            );
        }else { return null; }
    }

    render() {
        let { hasSavedRecommendParams, showOtherCondition, vipFilters } = this.state;

        var cls = 'other-condition-container', show_tip = '', iconCls = 'iconfont', btnCls = 'btn-item save-btn';
        //是否展示其他的筛选条件
        if(showOtherCondition){
            cls += ' show-container';
            show_tip = Intl.get('crm.contact.way.hide', '收起');
            iconCls += ' icon-up-twoline';
            btnCls += ' has-up-class';
        }else{
            cls += ' hide-container';
            show_tip = Intl.get('crm.basic.more', '更多');
            iconCls += ' icon-down-twoline';
        }

        return (
            <div className="recommend-customer-condition recommend-customer-condition-wrapper" data-tracename="线索推荐筛选面板">
                <div className="recommend-clue-filter-panel">
                    <div className="add-customer-recommend">
                        <Form layout='horizontal' className="clue-recommend-form" id="clue-recommend-form">
                            <FormItem>
                                <div className="search-input-container">
                                    <Input
                                        ref="searchInput"
                                        type="text"
                                        value={hasSavedRecommendParams.keyword}
                                        placeholder={this.getKeyWordPlaceholder()}
                                        className="search-input"
                                        onChange={this.searchChange}
                                        onKeyDown={this.onKeyDown}
                                        addonAfter={(
                                            <Icon type="search" className="search-icon search-icon-btn" onClick={this.onSearchButtonClick}/>
                                        )}
                                    />
                                    {hasSavedRecommendParams.keyword ? (
                                        <span className="iconfont icon-circle-close search-icon" onClick={this.closeSearchInput}/>
                                    ) : null}
                                </div>
                            </FormItem>
                            {this.renderSelectedFilterBlock()}
                            <FormItem
                                label={Intl.get('clue.recommend.hot.name', '热门')}
                                className="special-item"
                            >
                                <div className="advance-data-container" data-tracename="热门">
                                    {this.renderAdvancedOptions()}
                                </div>
                            </FormItem>
                            <AntcAreaSelection
                                labelCol="0" wrapperCol="0" width="100%"
                                colon={false}
                                label={Intl.get('crm.96', '地域')}
                                placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                                provName={hasSavedRecommendParams.province}
                                cityName={hasSavedRecommendParams.city}
                                countyName={hasSavedRecommendParams.district}
                                updateLocation={this.updateLocation}
                                hiddenCounty
                                showAllBtn
                            />
                            <div className="show-hide-tip" onClick={this.handleToggleOtherCondition} data-tracename='点击更多或收起推荐线索的条件'>
                                <span>{show_tip}</span>
                                <i className={iconCls}/>
                            </div>
                            <div className={cls}>
                                {/*<FormItem
                                    className="company-name"
                                    label={Intl.get('clue.recommed.keyword.list', '公司名')}
                                >
                                    <Input
                                        type="text"
                                        placeholder={Intl.get('clue.recommend.input.keyword', '请输入公司名')}
                                        value={hasSavedRecommendParams.name}
                                        onChange={this.handleChange}
                                    />
                                </FormItem>*/}
                                <FormItem className="vip-filter-container" label={Intl.get('clue.recommend.filter.vip', 'VIP筛选')}>
                                    <div className="vip-filter-content">
                                        {this.props.isSelectedHalfYearRegister ? null : (
                                            <div className="vip-filter-item">
                                                {this.renderDropDownBlock({
                                                    btnText: Intl.get('clue.recommend.established.time', '成立时间'),
                                                    type: VIP_ITEM_MAP.REGISTER_TIME,
                                                    list: registerSize,
                                                    getValue: () => {
                                                        let timeTarget = {};
                                                        let startTime = vipFilters.startTime, endTime = vipFilters.endTime;
                                                        if(startTime) {
                                                            timeTarget.max = moment().diff(startTime, 'years');
                                                        }
                                                        if(endTime) {
                                                            timeTarget.min = moment().endOf('day').diff(endTime, 'years');
                                                        }
                                                        timeTarget = _.find(registerSize, item => {
                                                            if(timeTarget.max <= 1 && item.max === 1) {//一年以内
                                                                return true;
                                                            }else if(timeTarget.min >= 10 && item.min === 10) {//10年以上
                                                                return true;
                                                            }
                                                            if(timeTarget.max >= item.min && timeTarget.max <= item.max) {
                                                                return true;
                                                            }
                                                        });
                                                        if(_.isEmpty(timeTarget)) {
                                                            timeTarget = {
                                                                name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.established.time', '成立时间')})
                                                            };
                                                        }
                                                        return [JSON.stringify(timeTarget)];
                                                    }
                                                })}
                                            </div>
                                        )}
                                        <div className="vip-filter-item">
                                            {this.renderDropDownBlock({
                                                btnText: Intl.get('clue.recommend.company.size', '公司规模'),
                                                type: VIP_ITEM_MAP.COMPANY_SIZE,
                                                list: staffSize,
                                                getValue: () => {
                                                    let staffTarget = {};
                                                    if(vipFilters.staffnumMin || vipFilters.staffnumMax){
                                                        staffTarget = _.find(staffSize, item => item.staffnumMin === vipFilters.staffnumMin && item.staffnumMax === vipFilters.staffnumMax );
                                                    }
                                                    if(_.isEmpty(staffTarget)) {
                                                        staffTarget = {
                                                            name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.company.size', '公司规模')})
                                                        };
                                                    }
                                                    return [JSON.stringify(staffTarget)];
                                                }
                                            })}
                                        </div>
                                        <div className="vip-filter-item">
                                            {this.renderDropDownBlock({
                                                btnText: Intl.get('clue.recommend.registered.capital', '注册资本'),
                                                type: VIP_ITEM_MAP.REGISTER_MONEY,
                                                list: moneySize,
                                                getValue: () => {
                                                    let capitalTarget = {};
                                                    if(vipFilters.capitalMin || vipFilters.capitalMax){
                                                        capitalTarget = _.find(moneySize, item => item.capitalMin === vipFilters.capitalMin && item.capitalMax === vipFilters.capitalMax );
                                                    }
                                                    if(_.isEmpty(capitalTarget)) {
                                                        capitalTarget = {
                                                            name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.registered.capital', '注册资本')})
                                                        };
                                                    }
                                                    return [JSON.stringify(capitalTarget)];
                                                }
                                            })}
                                        </div>
                                        <div className="vip-filter-item">
                                            {this.renderDropDownBlock({
                                                btnText: Intl.get('clue.recommend.enterprise.class', '企业类型'),
                                                type: VIP_ITEM_MAP.COMPANY_ENTYPES,
                                                list: companyProperty,
                                                getValue: () => {
                                                    let entypesTarget = {};
                                                    if(vipFilters.entTypes){
                                                        entypesTarget = _.find(companyProperty, item => _.includes(vipFilters.entTypes, item.value));
                                                    }
                                                    if(_.isEmpty(entypesTarget)) {
                                                        entypesTarget = {
                                                            name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: Intl.get('clue.recommend.enterprise.class', '企业类型')})
                                                        };
                                                    }
                                                    return [JSON.stringify(entypesTarget)];
                                                }
                                            })}
                                        </div>
                                        <div className="vip-filter-item">
                                            <Button className={btnCls} type="primary" onClick={this.handleSubmit}>{Intl.get('common.confirm', '确认')}</Button>
                                        </div>
                                    </div>
                                </FormItem>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    }
}
RecommendCluesFilterPanel.defaultProps = {
    style: {},
    getRecommendClueLists: function() {},
    isSelectedHalfYearRegister: false,
};
RecommendCluesFilterPanel.propTypes = {
    form: PropTypes.object,
    style: PropTypes.object,
    getRecommendClueLists: PropTypes.func,
    isSelectedHalfYearRegister: PropTypes.bool,
    hasSavedRecommendParams: PropTypes.object,
    isLoading: PropTypes.bool,
    canClickMoreBatch: PropTypes.bool,
    feature: PropTypes.string,
    handleToggleOtherCondition: PropTypes.func,
};
export default RecommendCluesFilterPanel;