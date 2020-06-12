/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/4/16.
 */

require('../../css/recommend-customer-condition.less');
import React, {Component} from 'react';
import {Form, Input, Icon, Popover, Button, Dropdown, Menu, DatePicker} from 'antd';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import {AntcAreaSelection, SearchInput, AntcSelect} from 'antc';
const Option = AntcSelect.Option;
import Trace from 'LIB_DIR/trace';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
import { registerSize, staffSize, moneySize, companyProperty, companyStatus, EXTRACT_CLUE_CONST_MAP, AREA_ALL } from '../../utils/clue-customer-utils';
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
import {addOrEditSettingCustomerRecomment, getCompanyListByName, getRecommendCluePicked} from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';
import {toFrontRecommendClueData} from '../../../server/dto/recommend-clue';


const ADVANCED_OPTIONS = [
    {
        name: Intl.get('clue.recommend.has.mobile', '有手机号'),
        value: 'mobile_num:1',
        processValue: (value) => {
            return _.toNumber(value);
        }
    },
    {
        name: Intl.get('clue.recommend.register.half.year', '近半年注册'),
        value: `feature:${EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER}`
    },
    {
        name: Intl.get('clue.recommend.has.website', '有官网'),
        value: 'has_website:true',
        processValue: (value) => {
            return value === 'true';
        }
    },
    {
        name: Intl.get('clue.recommend.smal.micro.enterprise', '小微企业'),
        value: 'feature:小微企业'
    },
    {
        name: Intl.get('clue.recommend.high.tech.enterprise.enterprise', '高新技术企业'),
        value: 'feature:高新'
    },
    {
        name: Intl.get('clue.recommend.listed', '上市企业'),
        value: 'feature:上市'
    },
    /*{
        name: Intl.get('clue.recommend.state.owned.enterprise', '国有企业'),
        value: 'feature:国有企业'
    },*/
    /*{
        name: Intl.get('clue.recommend.has.phone', '有电话'),
        value: 'phone_num:1',
        processValue: (value) => {
            return _.toNumber(value);
        }
    },*/
    {
        name: Intl.get('clue.recommend.has.more.contact', '多个联系方式'),
        value: 'phone_num:2',
        processValue: (value) => {
            return _.toNumber(value);
        }
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
    COMPANY_STAUTS: 'company_status',//企业类型
};

const KEYCODE = {
    ENTER: 13
};

class RecommendCluesFilterPanel extends Component {
    constructor(props) {
        super(props);

        let hasSavedRecommendParams = _.cloneDeep(this.props.hasSavedRecommendParams);
        let vipFilters = this.dealRecommendParamsVipData(hasSavedRecommendParams);
        this.state = {
            hasSavedRecommendParams,
            vipPopOverVisible: '',
            vipPopOverVisibleContent: null,
            showOtherCondition: true,
            isSaving: false,
            vipFilters,
            keywordList: [],
            registerOpen: true,
            registerPopvisible: false,
        };

        this.currentArea = {};
        this.currentListItem = {};
    }

    componentDidMount() {
        let input = '.clue-recommend-filter-search-wrapper .search-input';
        //添加keydown事件
        $(input).on('keydown', this.onKeyDown);
        //添加focus
        $(input).on('focus', this.onInputFocus);
        document.addEventListener('click', this.onClickOutsideHandler);
        if(this.searchInputRef) {
            this.searchInputRef.state.keyword = this.state.hasSavedRecommendParams.keyword;
        }
    }

    componentWillReceiveProps(nextProps) {
        if (_.isEmpty(this.state.hasSavedRecommendParams) || !_.isEqual(nextProps.hasSavedRecommendParams, this.state.hasSavedRecommendParams)){
            let hasSavedRecommendParams = _.cloneDeep(nextProps.hasSavedRecommendParams);
            let vipFilters = this.dealRecommendParamsVipData({...hasSavedRecommendParams, ...this.state.vipFilters});
            let showOtherCondition = this.state.showOtherCondition;
            this.setState({
                hasSavedRecommendParams,
                vipFilters,
                registerOpen: true
            }, () => {
                if(this.searchInputRef) {
                    this.searchInputRef.state.keyword = hasSavedRecommendParams.keyword;
                }
            });
        }
    }

    componentWillUnmount() {
        let input = '.clue-recommend-filter-search-wrapper .search-input';
        $(input).off('keydown', this.onKeyDown);
        $(input).off('focus', this.onInputFocus);
        document.removeEventListener('click', this.onClickOutsideHandler);
        this.currentListItem = {};
    }

    //处理线索推荐条件中的vip选项
    dealRecommendParamsVipData(condition) {
        let obj = {};
        if(condition.startTime) {
            obj.startTime = condition.startTime;
        }
        if(condition.endTime) {
            obj.endTime = condition.endTime;
        }
        if(condition.custom_time) {//自定义成立时间
            obj.custom_time = condition.custom_time;
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
        if(condition.openStatus) {
            obj.openStatus = condition.openStatus;
        }
        return obj;
    }

    getRecommendClueList= (condition, isSaveFilter = true, isRequiredSave = false) => {
        let newCondition = _.clone(condition);
        let propsCondition = _.clone(this.props.hasSavedRecommendParams);
        removeEmptyItem(newCondition);

        //必须保存时，或者条件没有变动时，不用请求接口保存筛选条件
        if(isRequiredSave || (isSaveFilter && !_.isEqual(newCondition, propsCondition))) {
            this.saveRecommendFilter(newCondition);
        }
        if(isSaveFilter) clueCustomerAction.saveSettingCustomerRecomment(newCondition);
        this.props.getRecommendClueLists(newCondition, EXTRACT_CLUE_CONST_MAP.RESET);
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
                clueCustomerAction.saveSettingCustomerRecomment({...targetObj});
            }
        }, () => {
            this.setState({isSaving: false});
        });
    }

    getKeyWordPlaceholder() {
        return [Intl.get('register.company.nickname', '公司名称'), Intl.get('clue.recommend.industry.name', '行业名称'), Intl.get('common.product.name', '产品名称')].join('/');
    }

    searchChange = (value) => {
        let { hasSavedRecommendParams } = this.state;
        hasSavedRecommendParams.keyword = _.trim(value || '');
        this.getCompanyListByName(hasSavedRecommendParams.keyword);
        this.setState({hasSavedRecommendParams});
    };

    onKeyDown = (e) => {
        if(e.keyCode === KEYCODE.ENTER && this.props.canClickMoreBatch) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '使用enter搜索关键词：' + e.target.value);
            this.searchEvent(e.target.value);
        }
    };

    onInputFocus = () => {
        if(this.state.keywordList.length > 0) {
            $('.recommend-clue-sug').css('display', 'block');
        }else if(this.state.hasSavedRecommendParams.keyword) {
            this.getCompanyListByName(this.state.hasSavedRecommendParams.keyword);
        }
    };

    onClickOutsideHandler = (e) => {
        if(ReactDOM.findDOMNode(this.searchInputRef).contains(e.target)) {
            return false;
        }
        //点击关键词推荐列表之外的地方，所以需要隐藏下拉列表
        if($('.recommend-clue-sug').css('display') === 'block' && !this.keywordListRef.contains(e.target)) {
            $('.recommend-clue-sug').css('display', 'none');
        }
    };

    searchEvent = (value) => {
        let { hasSavedRecommendParams } = this.state;
        hasSavedRecommendParams.keyword = _.trim(value || '');
        $('.recommend-clue-sug').css('display', 'none');
        this.setState({hasSavedRecommendParams, keywordList: []}, () => {
            this.getRecommendClueList(hasSavedRecommendParams);
        });
    }

    onSearchButtonClick = () => {
        let keyword = this.state.hasSavedRecommendParams.keyword;
        if (this.props.canClickMoreBatch && keyword) {
            this.searchEvent(keyword);
        }
    };

    closeSearchInput = () => {
        this.searchEvent();
    };

    onKeywordListClick = (value) => {
        let hasSavedRecommendParams = _.pick(this.state.hasSavedRecommendParams, ['id', 'addTime', 'userId']);
        $('.recommend-clue-sug').css('display', 'none');
        let item = _.find(this.state.keywordList, item => item.id === value);
        if(_.isEqual(this.currentListItem.id, item.id)) {return false;}

        getRecommendCluePicked({
            companyIds: item.id
        }).then((result) => {
            this.setClueInfo({...result, hasSavedRecommendParams, item});
        }, () => {
            this.setClueInfo({hasSavedRecommendParams, item});
        });
    };

    setClueInfo(result) {
        if(this.searchInputRef) {
            this.searchInputRef.state.keyword = _.get(result.item, 'name', '');
            clueCustomerAction.saveSettingCustomerRecomment({...result.hasSavedRecommendParams, keyword: _.get(result.item, 'name', '')});
            clueCustomerAction.setHotSource('');
        }
        let listItem = toFrontRecommendClueData(result.item);
        if(_.isEqual(_.get(result, 'total'), 1)) {//被提取过
            listItem.hasExtractedByOther = true;
        }
        let data = {
            list: [listItem],
            total: 1
        };
        this.currentListItem = result.item;
        clueCustomerAction.getRecommendClueLists(data, false);
    }

    //根据关键词获取推荐信息
    getCompanyListByName = (value) => {
        this.currentListItem = {};
        getCompanyListByName({
            name: value
        }).then((result) => {
            let list = _.isArray(result.list) ? result.list : [];
            if(list.length > 0) {
                $('.recommend-clue-sug').css('display', 'block');
            }else{
                $('.recommend-clue-sug').css('display', 'none');
            }
            this.setState({keywordList: list});
        }, () => {
            $('.recommend-clue-sug').css('display', 'none');
            this.setState({keywordList: []});
        });
    };

    //更新地址
    updateLocation = (addressObj) => {
        this.currentArea.province = addressObj.provName;
        this.currentArea.city = addressObj.cityName;
        this.currentArea.district = addressObj.countyName;
        const value = _.chain(this.currentArea).values().filter(item => item).value();

        const traceTip = value.join('/') || '全部';
        Trace.traceEvent(ReactDOM.findDOMNode(this), '选择了地域：' + traceTip);

        if (_.isEmpty(value)) {
            let params = _.clone(this.state.hasSavedRecommendParams);
            if(traceTip === '全部') {
                this.currentArea.province = AREA_ALL;
            }
            _.extend(params, this.currentArea);
            this.getRecommendClueList(params);
        }
    };

    onAreaPanelHide = () => {
        let params = _.clone(this.state.hasSavedRecommendParams);
        const prevArea = _.pick(params, 'province', 'city', 'district');

        if (!_.isEmpty(this.currentArea) && !_.isEqual(this.currentArea, prevArea)) {
            _.extend(params, this.currentArea);
            this.getRecommendClueList(params);
        }
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
                        delete vipFilters.custom_time;
                        delete hasSavedRecommendParams.startTime;
                        delete hasSavedRecommendParams.endTime;
                        delete hasSavedRecommendParams.custom_time;
                    }else {
                        delete vipFilters.custom_time;
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
                    this.handleRegisterPopvisible(false);
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
            case VIP_ITEM_MAP.COMPANY_STAUTS://企业状态
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.COMPANY_STAUTS, '企业状态');
                if(hasContinueUse && value && _.isString(value)) {
                    let openStatus = JSON.parse(value);
                    if(isReset) {
                        delete vipFilters.openStatus;
                        delete hasSavedRecommendParams.openStatus;
                    }else {
                        if (_.get(openStatus, 'value')){
                            vipFilters.openStatus = _.get(openStatus, 'value');
                        }else{
                            delete vipFilters.openStatus;
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
        Trace.traceEvent(ReactDOM.findDOMNode(this), `点击热门选项,${traceTip}`);

        let hasSavedRecommendParams = _.clone(this.state.hasSavedRecommendParams);
        if(advanced) {
            hasSavedRecommendParams.feature = advanced;
        }else {
            delete hasSavedRecommendParams.feature;
        }
        clueCustomerAction.saveSettingCustomerRecomment(hasSavedRecommendParams);
        clueCustomerAction.setHotSource(advanced);
        setTimeout(() => {
            this.getRecommendClueList(hasSavedRecommendParams, true, true);
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
                vipPopOverVisible: key,
                registerPopvisible: false
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

    handleToggleOtherCondition = (property) => {
        clueCustomerAction.saveSettingCustomerRecomment({...this.props.hasSavedRecommendParams, ...this.state.hasSavedRecommendParams});
        let vipFilters = this.dealRecommendParamsVipData(this.props.hasSavedRecommendParams);
        this.setState({
            [property]: !this.state[property],
            vipFilters,
            registerOpen: true,
        }, () => {
            _.isFunction(this.props.handleToggleOtherCondition) && this.props.handleToggleOtherCondition();
        });
    };

    handleSubmit = () => {
        if(!this.props.canClickMoreBatch) { return false;}
        //需要处理下vip选项
        let vipItems = ['startTime', 'endTime', 'custom_time' ,'staffnumMax', 'staffnumMin', 'capitalMax', 'capitalMin', 'entTypes', 'openStatus'];
        let hasSavedRecommendParams = _.omit(this.state.hasSavedRecommendParams, vipItems);
        this.getRecommendClueList({...hasSavedRecommendParams, ...this.state.vipFilters});
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
        if(condition.custom_time) {//如果是自定义的时间,需要展示2019-01-05 至 2019-05-06成立
            let startTime = condition.startTime ? moment(condition.startTime).format(oplateConsts.DATE_FORMAT) : '-';
            let endTime = condition.endTime ? moment(condition.endTime).format(oplateConsts.DATE_FORMAT) : '-';
            let text = `${startTime} ${Intl.get('common.time.connector', '至')} ${endTime}${Intl.get('clue.recommend.filter.set.up', '成立')}`;
            timeTarget = {
                name: text
            };
        }
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

    //处理企业状态数据
    handleOpenStatusData(condition) {
        let statusTarget = {};
        if(condition.openStatus){
            statusTarget = _.find(companyStatus, item => _.isEqual(condition.openStatus, item.value));
        }
        return statusTarget;
    }
    //已选中条件集合
    handleSelectedFilterList() {
        let { hasSavedRecommendParams } = this.state;
        let list = [];
        //可展示的已选条件field集合
        const SELECTED_FILTER_FIELDS = this.getVipFilters();
        _.each(SELECTED_FILTER_FIELDS, item => {
            if(_.isFunction(item.processValue)) {
                let value = item.processValue(hasSavedRecommendParams);
                if(!_.isEmpty(value)) {
                    list.push({
                        name: item.btnText,
                        value: value.name,
                        key: item.type,
                        handleClick: () => {
                            if(_.isFunction(item.handleClick)) {
                                item.handleClick();
                            }else{
                                this.onSelect(item.type, JSON.stringify({name: ''}), true);
                            }
                        }
                    });
                }
            }
        });
        return list;
    }

    //获取vip筛选项
    getVipFilters() {
        return [
            {
                btnText: Intl.get('clue.recommend.established.time', '成立时间'),
                type: VIP_ITEM_MAP.REGISTER_TIME,
                list: registerSize,
                processValue: this.handleRegisterTimeData
            },
            {
                btnText: Intl.get('clue.recommend.company.size', '公司规模'),
                type: VIP_ITEM_MAP.COMPANY_SIZE,
                list: staffSize,
                processValue: this.handleCompanySizeData
            },
            {
                btnText: Intl.get('clue.recommend.registered.capital', '注册资本'),
                type: VIP_ITEM_MAP.REGISTER_MONEY,
                list: moneySize,
                processValue: this.handleCapitalData
            },
            {
                btnText: Intl.get('clue.recommend.enterprise.class', '企业类型'),
                type: VIP_ITEM_MAP.COMPANY_ENTYPES,
                list: companyProperty,
                processValue: this.handleEntTypesData
            },
            {
                btnText: Intl.get('clue.recommend.filter.company.status', '企业状态'),
                type: VIP_ITEM_MAP.COMPANY_STAUTS,
                list: companyStatus,
                processValue: this.handleOpenStatusData
            }
        ];
    }

    onDateChange = (dates, dateStrings) => {
        let hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.REGISTER_TIME, '成立时间');
        if(hasContinueUse) {
            let {vipFilters} = this.state;
            if (_.get(dateStrings,'[0]') && _.get(dateStrings,'[1]')){
                //开始时间要取那天早上的00:00:00
                //结束时间要取那天晚上的23:59:59
                vipFilters.startTime = moment(_.get(dateStrings,'[0]')).startOf('day').valueOf();
                vipFilters.endTime = moment(_.get(dateStrings,'[1]')).endOf('day').valueOf();
            }else{
                delete vipFilters.startTime;
                delete vipFilters.endTime;
            }
            this.setState({
                vipFilters,
                registerPopvisible: false,
            });
        }
    };

    handleOpenChange = (open) => {
        this.setState({registerOpen: open}, () => {
            //这里延时设置为true，解决选择时间后闪烁的问题
            setTimeout(() => {
                this.setState({registerOpen: true});
            });
        });
    }

    //解决点击时间选择器上一年、下一年不起作用的问题
    handleStopPropagetion = (e) => {
        e.stopPropagation();
    };

    handleRegisterPopvisible = (visible) => {
        if(this.state.vipPopOverVisible !== VIP_ITEM_MAP.REGISTER_TIME) {
            this.setState({registerPopvisible: visible, registerOpen: true});
        }
    };

    //处理成立时间点击自定义事件
    handleRegisterTimeCustomClick = () => {
        let hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.REGISTER_TIME, '成立时间');
        if(hasContinueUse) {
            let {vipFilters} = this.state;
            vipFilters.custom_time = true;
            let startTime = vipFilters.startTime ? moment(vipFilters.startTime) : moment();
            let endTime = vipFilters.endTime ? moment(vipFilters.endTime) : moment();
            startTime = startTime.startOf('day').valueOf();
            endTime = endTime.endOf('day').valueOf();
            if(startTime > endTime) {//如果开始时间大于结束时间，两者对换一下
                let obj = {startTime, endTime};
                startTime = obj.endTime;
                endTime = obj.startTime;
            }

            vipFilters.startTime = startTime;
            vipFilters.endTime = endTime;
            this.setState({vipFilters, registerOpen: true, registerPopvisible: true});
        }
    };

    //渲染高级选项
    renderAdvancedOptions() {
        let feature = _.get(this.state.hasSavedRecommendParams,'feature', this.props.feature);
        return _.map(ADVANCED_OPTIONS, (item, idx) => {
            let cls = classNames('advance-btn-item', {
                'advance-active': feature === item.value
            });
            return (
                <span key={idx} className={cls} onClick={this.handleClickAdvanced.bind(this, item.value)}>{item.name}</span>
            );
        });
    }

    //渲染成立时间内容
    renderRegisterTimeBlock({btnText, type, list, processValue = () => {}}) {
        let {isWebMin} = isResponsiveDisplay();
        let {vipFilters, registerPopvisible} = this.state;
        let currentValue = processValue(vipFilters);
        if(_.isEmpty(currentValue)) {
            currentValue = {
                name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: btnText})
            };
        }

        let value = [];
        let registerStartTime = vipFilters.startTime || '', registerEndTime = vipFilters.endTime || '';
        if (registerStartTime && registerEndTime){
            value = [moment(registerStartTime), moment(registerEndTime)];
        }

        let text = _.get(currentValue, 'name');
        let textCls = classNames({
            'vip-item-active': text && text !== Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: btnText})
        });
        text = text ? currentValue.name : btnText;

        let menu = (
            <Menu>
                <Menu.Item>
                    {this.renderRegisterRangTimeBlock({vipFilters, value, currentValue, btnText, list, type})}
                </Menu.Item>
            </Menu>
        );

        return (
            <div key={type} className="vip-filter-item">
                <Dropdown
                    trigger={isWebMin ? 'click' : 'hover'}
                    overlay={menu}
                    visible={registerPopvisible}
                    onVisibleChange={this.handleRegisterPopvisible.bind(this)}
                    overlayClassName="register-time-container vip-item-dropDown"
                    getPopupContainer={(triggerNode) => {return triggerNode.parentNode;}}
                >
                    <Popover
                        trigger="click"
                        placement="bottomLeft"
                        content={this.state.vipPopOverVisibleContent}
                        visible={this.state.vipPopOverVisible === type}
                        onVisibleChange={this.handleVisibleChange}
                        overlayClassName="extract-limit-content"
                    >
                        <span className={textCls}>
                            {text}<Icon type="down"/>
                        </span>
                    </Popover>
                </Dropdown>
            </div>
        );
    }

    //渲染带时间选择的下拉框
    renderRegisterRangTimeBlock(data) {
        let { vipFilters, list, currentValue, btnText, value, type } = data;
        let registerTimeCls = classNames('register-time-wrapper', {
            'selected-custom': vipFilters.custom_time
        });
        return (
            <div className={registerTimeCls}>
                <div className="register-time-content">
                    <div className="register-time-item-content">
                        {_.map(list, item => {
                            let liCls = classNames('ant-dropdown-menu-item', {
                                'ant-dropdown-menu-item-selected': _.isEqual(currentValue, item) && !vipFilters.custom_time
                            });
                            return (
                                <li key={JSON.stringify(item)} className={liCls} onClick={this.onSelect.bind(this, type, JSON.stringify(item), false)}>
                                    <span data-tracename={`点击了'${btnText}:${item.name}'`}>{item.name}</span>
                                </li>
                            );
                        })}
                        <li className={`ant-dropdown-menu-item ${vipFilters.custom_time ? 'ant-dropdown-menu-item-selected' : ''}`} onClick={this.handleRegisterTimeCustomClick}>
                            <span data-tracename={`点击了'${btnText}:自定义'`}>{Intl.get('user.time.custom', '自定义')}</span>
                        </li>
                    </div>
                    <div className="register-time-select-wrapper" onClick={this.handleStopPropagetion}>
                        <div className="register-time-select-content ant-dropdown-menu-item">
                            <RangePicker
                                open={this.state.registerOpen}
                                onOpenChange={this.handleOpenChange}
                                getCalendarContainer={(trigger) => {
                                    return trigger.parentNode;
                                }}
                                value={value}
                                onChange={this.onDateChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    //渲染vip选项
    renderVipFiltersBlock() {
        let list = this.getVipFilters();
        return _.map(list, item => {
            if(item.type === VIP_ITEM_MAP.REGISTER_TIME) {
                if(this.props.isSelectedHalfYearRegister) {
                    return null;
                }else {
                    return this.renderRegisterTimeBlock(item);
                }
            }
            return (
                <div key={item.type} className="vip-filter-item">
                    {this.renderDropDownBlock({...item})}
                </div>
            );
        });
    }

    renderDropDownBlock({btnText, type, list, processValue = () => {}}) {
        let {isWebMin} = isResponsiveDisplay();
        let {vipFilters} = this.state;
        let currentValue = processValue(vipFilters);
        if(_.isEmpty(currentValue)) {
            currentValue = {
                name: Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: btnText})
            };
        }

        let menus = (
            <Menu onClick={this.onSelect.bind(this, type)} selectedKeys={[JSON.stringify(currentValue)]}>
                {_.map(list, item => (
                    <Menu.Item key={JSON.stringify(item)}><span data-tracename={`点击了'${btnText}:${item.name}'`}>{item.name}</span></Menu.Item>
                ))}
            </Menu>
        );
        let text = _.get(currentValue, 'name');
        let textCls = classNames({
            'vip-item-active': text && text !== Intl.get('clue.recommend.filter.name.no.limit', '{name}不限', {name: btnText})
        });
        return (
            <Dropdown trigger={isWebMin ? 'click' : 'hover'} overlay={menus} overlayClassName="vip-item-dropDown">
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
                <div className="selected-filter-container" data-tracename="已选条件展示区">
                    <div className="selected-filter-content">
                        <span className="selected-filter-title">{Intl.get('clue.recommend.filter.selected', '已选条件')}：</span>
                        {_.map(list, item => {
                            if(this.props.isSelectedHalfYearRegister && item.key === VIP_ITEM_MAP.REGISTER_TIME) {
                                return null;
                            }
                            return (
                                <span key={item.key} className="selected-filter-item">
                                    <span>{item.name}：{item.value}</span>
                                    <i className="iconfont icon-close" data-tracename={`点击关闭${item.name}:${item.value}`} onClick={item.handleClick}/>
                                </span>
                            );
                        })}
                    </div>
                </div>
            );
        }else { return null; }
    }

    render() {
        let { hasSavedRecommendParams, showOtherCondition, keywordList, showHotMore } = this.state;

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
                                <div className="clue-recommend-filter-search-wrapper">
                                    <SearchInput
                                        key="search-input"
                                        ref={ref => this.searchInputRef = ref}
                                        searchEvent={this.searchChange}
                                        searchPlaceHolder ={this.getKeyWordPlaceholder()}
                                        closeSearchInput={this.closeSearchInput}
                                    />
                                    <div ref={ref => this.keywordListRef = ref} className="recommend-clue-sug recommend-clue-sug-new">
                                        <ul>
                                            {_.map(keywordList, item => (
                                                <li key={item.id} className="recommend-clue-sug-overflow" onClick={this.onKeywordListClick.bind(this, item.id)}>{item.name}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <span className="ant-input-group-addon" data-tracename="点击搜索关键词按钮" onClick={this.onSearchButtonClick}>
                                        <Icon type="search" className="search-icon search-confirm-btn"/>
                                    </span>
                                </div>
                            </FormItem>
                            {this.renderSelectedFilterBlock()}
                            <FormItem
                                label={Intl.get('clue.recommend.hot.name', '热门')}
                                className="special-item"
                            >
                                <div className="advance-data-container">
                                    {this.renderAdvancedOptions()}
                                </div>
                            </FormItem>
                            <AntcAreaSelection
                                labelCol="0" wrapperCol="0" width="100%"
                                colon={false}
                                label={Intl.get('crm.96', '地域')}
                                placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                                provName={hasSavedRecommendParams.province === AREA_ALL ? '' : hasSavedRecommendParams.province}
                                cityName={hasSavedRecommendParams.city}
                                countyName={hasSavedRecommendParams.district}
                                updateLocation={this.updateLocation}
                                onAreaPanelHide={this.onAreaPanelHide}
                                // hiddenCounty
                                showAllBtn
                                filterSomeNewArea
                                sortProvinceByFirstLetter
                            />
                            <div className="show-hide-tip" onClick={this.handleToggleOtherCondition.bind(this, 'showOtherCondition')} data-tracename='点击更多或收起推荐线索的条件'>
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
                                    <div className="vip-filter-content" data-tracename="vip筛选列表">
                                        {this.renderVipFiltersBlock()}
                                        <div className="vip-filter-item">
                                            <Button className={btnCls} type="primary" data-tracename="点击确认按钮" onClick={this.handleSubmit}>{Intl.get('common.confirm', '确认')}</Button>
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
RecommendCluesFilterPanel.ADVANCED_OPTIONS = ADVANCED_OPTIONS;
export default RecommendCluesFilterPanel;
