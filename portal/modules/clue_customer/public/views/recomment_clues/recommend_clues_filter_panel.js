/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/4/16.
 */

require('../../css/recommend-customer-condition.less');
import React, {Component} from 'react';
import {Form, Input, Select, Icon, Popover, Button} from 'antd';
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


const ADVANCED_OPTIONS = [
    {
        name: Intl.get('clue.recommend.listed', '上市企业'),
        value: 'feature:上市'
    },
    {
        name: Intl.get('clue.recommend.mask.Manufactor', '口罩厂家'),
        value: 'feature:口罩厂家'
    },
    {
        name: Intl.get('clue.recommend.register.half.year', '最近半年注册'),
        value: `feature:${EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER}`
    },
    {
        name: Intl.get('clue.recommend.State-owned.enterprise', '国有企业'),
        value: 'feature:国有'
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
        name: Intl.get('clue.recommend.has.more.contact', '有多个联系方式'),
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
    COMPANY_ENTYPES: 'company_entTypes',//企业类
    HOT_ITEM: 'hot_item',//热门
};

class RecommendCluesFilterPanel extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasSavedRecommendParams: _.cloneDeep(this.props.hasSavedRecommendParams),
            vipPopOverVisible: '',
            vipPopOverVisibleContent: null,
            showOtherCondition: false,
            isSaving: false,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.isEmpty(this.state.hasSavedRecommendParams) || !_.isEqual(nextProps.hasSavedRecommendParams, this.state.hasSavedRecommendParams)){
            this.setState({
                hasSavedRecommendParams: _.cloneDeep(nextProps.hasSavedRecommendParams)
            });
        }
    }

    getRecommendClueList= (condition, isSaveFilter = true) => {
        if(searchTimeOut) {
            clearTimeout(searchTimeOut);
        }
        searchTimeOut = setTimeout(() => {
            let newCondition = _.clone(condition);
            removeEmptyItem(newCondition);
            if(isSaveFilter) {
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
        $.ajax({
            url: '/rest/clue/recommend/condition',
            dataType: 'json',
            type: 'post',
            data: hasSavedRecommendParams,
            success: (data) => {
                this.setState({isSaving: false});
                if (data){
                    let targetObj = _.get(data, '[0]');
                    this.setState({hasSavedRecommendParams: targetObj});
                    clueCustomerAction.saveSettingCustomerRecomment(targetObj);
                }
            },
            error: () => {
                this.setState({isSaving: false});
            }
        });
    }

    getKeyWordPlaceholder() {
        return [Intl.get('register.company.nickname', '公司名称'), Intl.get('clue.recommend.industry.name', '行业名称'), Intl.get('common.product.name', '产品名称')].join('/');
    }

    searchEvent = (e) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.keyword = _.trim(e.target.value || '');
        this.setState({hasSavedRecommendParams});
    }

    onSearchButtonClick = () => {
        if (this.refs.searchInput.value.trim()) {
            this.searchEvent({target: { value: _.trim(this.refs.searchInput.value) }});
        }
    };

    closeSearchInput = () => {
        this.searchEvent({target: {value: ''}});
    };

    //更新地址
    updateLocation = (addressObj) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.province = addressObj.provName || '';
        hasSavedRecommendParams.city = addressObj.cityName || '';
        hasSavedRecommendParams.district = addressObj.countyName || '';
        //这里不要setState，否则选中了省份后的各省市面板会收起
    };

    handleChange = (e) => {
        let hasSavedRecommendParams = this.state.hasSavedRecommendParams;
        hasSavedRecommendParams.name = _.trim(e.target.value || '');
        this.setState({hasSavedRecommendParams});
    };

    onSelect = (type, value) => {
        let hasSavedRecommendParams = _.cloneDeep(this.state.hasSavedRecommendParams);
        let hasContinueUse = true;
        switch (type) {
            case 'register_size':
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.REGISTER_TIME, '成立时间');
                if (hasContinueUse && value && _.isString(value)){
                    let timeObj = JSON.parse(value);
                    //1-3年  (min:1,max:3)
                    // startTime传3年前的时间， endTime传1年前的时间
                    //所以min是传到endTime，max是传到startTime上
                    //开始时间要取那天早上的00:00:00
                    //结束时间要取那天晚上的23:59:59
                    if (_.get(timeObj, 'min')) {//传到endTime
                        hasSavedRecommendParams.endTime = moment().subtract(_.get(timeObj, 'min'), 'years').endOf('day').valueOf();
                    }else{
                        delete hasSavedRecommendParams.endTime;
                    }
                    if (_.get(timeObj, 'max')){//传到startTime
                        hasSavedRecommendParams.startTime = moment().subtract(_.get(timeObj, 'max'), 'years').startOf('day').valueOf();
                    }else{
                        delete hasSavedRecommendParams.startTime;
                    }
                }
                break;
            case 'staff_size'://公司规模
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.COMPANY_SIZE, '公司规模');
                if (hasContinueUse && value && _.isString(value)){
                    let staffObj = JSON.parse(value);
                    if (_.get(staffObj, 'staffnumMin')) {
                        hasSavedRecommendParams.staffnumMin = _.get(staffObj, 'staffnumMin');
                    }else{
                        delete hasSavedRecommendParams.staffnumMin;
                    }
                    if (_.get(staffObj, 'staffnumMax')){
                        hasSavedRecommendParams.staffnumMax = _.get(staffObj,'staffnumMax');
                    }else{
                        delete hasSavedRecommendParams.staffnumMax;
                    }
                }
                break;
            case 'money_size'://注册资本
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.REGISTER_MONEY, '注册资本');
                if (hasContinueUse && value && _.isString(value)) {
                    let moneyObj = JSON.parse(value);
                    if (_.get(moneyObj, 'capitalMin')) {
                        hasSavedRecommendParams.capitalMin = _.get(moneyObj,'capitalMin');
                    }else{
                        delete hasSavedRecommendParams.capitalMin;
                    }
                    if (_.get(moneyObj, 'capitalMax')) {
                        hasSavedRecommendParams.capitalMax = _.get(moneyObj,'capitalMax');
                    }else{
                        delete hasSavedRecommendParams.capitalMax;
                    }
                }
                break;
            case 'entTypes'://企业类
                hasContinueUse = this.handleVipItemClick(VIP_ITEM_MAP.COMPANY_ENTYPES, '企业类');
                if(hasContinueUse) {
                    if (!_.isEmpty(value) && _.get(value, '[0]')){
                        hasSavedRecommendParams.entTypes = value;
                    }else{
                        delete hasSavedRecommendParams.entTypes;
                    }
                }
                break;
        }

        if(!hasContinueUse) {
            return false;
        }
        this.setState({hasSavedRecommendParams});
    };

    handleClickAdvanced = (key) => {
        if(!this.props.canClickMoreBatch) { return false; }
        let versionAndType = checkVersionAndType();
        let advanced = '';
        let advancedValue = key.split(':')[1] || '';
        let traceTip = `取消选中'${advancedValue}'`;
        if(key !== this.props.feature) {
            advanced = key;
            traceTip = `选中'${advancedValue}'`;
        }
        Trace.traceEvent(ReactDOM.findDOMNode(this), `点击${traceTip}按钮`);
        clueCustomerAction.setHotSource(advanced);
    };

    //点击vip项处理事件
    handleVipItemClick(key, trace) {
        let currentVersionObj = checkVersionAndType();
        //个人版试用\到期，展示升级\续费的界面
        if(currentVersionObj.isPersonalTrial || (currentVersionObj.isPersonalFormal && isExpired())) {
            this.handleUpgradePersonalVersion(trace);
            return false;
        }
        //企业账号到期，提示联系销售升级\续费的popover
        else if(currentVersionObj.company) {
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
            showOtherCondition: !this.state.showOtherCondition
        }, () => {
            _.isFunction(this.props.handleToggleOtherCondition) && this.props.handleToggleOtherCondition();
        });
    };

    handleSubmit = () => {
        this.getRecommendClueList(this.state.hasSavedRecommendParams);
    };

    renderSelectFilterBlock(type, array, getValue) {
        return (
            <Select
                getPopupContainer={() => document.getElementById('clue-recommend-form')}
                value={getValue()}
                onSelect={this.onSelect.bind(this, type)}
            >
                {_.isArray(array) && array.length ?
                    array.map((sizeItem, idx) => {
                        return (<Option key={idx} value={JSON.stringify(sizeItem)}>{sizeItem.name}</Option>);
                    }) : null
                }
            </Select>
        );
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

    //label加上vip
    renderLabelAndVip(label, key) {
        return (
            <Popover
                trigger="click"
                placement="bottomLeft"
                content={this.state.vipPopOverVisibleContent}
                visible={this.state.vipPopOverVisible === key}
                onVisibleChange={this.handleVisibleChange}
                overlayClassName="extract-limit-content"
            >
                <span className="label-wrapper">
                    <span className="label-text">{label}</span>
                    <span className="label-vip">VIP</span>
                </span>
            </Popover>
        );
    }

    render() {
        const formItemLayout = {
            colon: false,
            labelCol: {
                sm: {span: 4},
            },
            wrapperCol: {
                sm: {span: 20},
            },
        };
        let { hasSavedRecommendParams, showOtherCondition } = this.state;

        let defaultValue = [];
        if (hasSavedRecommendParams.startTime && hasSavedRecommendParams.endTime){
            defaultValue = [moment(hasSavedRecommendParams.startTime), moment(hasSavedRecommendParams.endTime)];
        }

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
                                        onChange={this.searchEvent}
                                    />
                                    {hasSavedRecommendParams.keyword ? (
                                        <span className="iconfont icon-circle-close search-icon" onClick={this.closeSearchInput}/>
                                    ) : (<Icon type="search" className="search-icon" onClick={this.onSearchButtonClick}/>
                                    )}
                                </div>
                            </FormItem>
                            <FormItem
                                label={Intl.get('clue.recommend.hot.name', '热门')}
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
                            {!showOtherCondition ? (
                                <div className="show-hide-tip" onClick={this.handleToggleOtherCondition} data-tracename='点击展开或收起推荐线索的条件'>
                                    <span>{show_tip}</span>
                                    <i className={iconCls}/>
                                </div>
                            ) : null}
                            <div className={cls}>
                                <FormItem
                                    className="company-name"
                                    label={Intl.get('clue.recommed.keyword.list', '公司名')}
                                >
                                    <Input
                                        type="text"
                                        placeholder={Intl.get('clue.recommend.input.keyword', '请输入公司名')}
                                        value={hasSavedRecommendParams.name}
                                        onChange={this.handleChange}
                                    />
                                </FormItem>
                                {/*如果选了'最近半年注册',就不用再显示注册时间*/}
                                {
                                    this.props.isSelectedHalfYearRegister ? null : (
                                        <FormItem
                                            label={this.renderLabelAndVip(Intl.get('clue.recommend.established.time', '成立时间'), VIP_ITEM_MAP.REGISTER_TIME)}
                                        >
                                            {this.renderSelectFilterBlock('register_size', registerSize, () => {
                                                let timeTarget = {};
                                                let startTime = hasSavedRecommendParams.startTime, endTime = hasSavedRecommendParams.endTime;
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
                                                return _.isEmpty(timeTarget) ? JSON.stringify({name: Intl.get('crm.customer.pool.unlimited', '不限')}) : JSON.stringify(timeTarget);
                                            })}
                                        </FormItem>
                                    )
                                }
                                <FormItem
                                    label={this.renderLabelAndVip(Intl.get('clue.recommend.company.size', '公司规模'), VIP_ITEM_MAP.COMPANY_SIZE)}
                                >
                                    {this.renderSelectFilterBlock('staff_size', staffSize, () => {
                                        let staffTarget = {};
                                        if(hasSavedRecommendParams.staffnumMin || hasSavedRecommendParams.staffnumMax){
                                            staffTarget = _.find(staffSize, item => item.staffnumMin === hasSavedRecommendParams.staffnumMin && item.staffnumMax === hasSavedRecommendParams.staffnumMax );
                                        }
                                        return _.isEmpty(staffTarget) ? JSON.stringify({name: Intl.get('crm.customer.pool.unlimited', '不限')}) : JSON.stringify(staffTarget);
                                    })}
                                </FormItem>
                                <FormItem
                                    label={this.renderLabelAndVip(Intl.get('clue.recommend.registered.capital', '注册资本'), VIP_ITEM_MAP.REGISTER_MONEY)}
                                >
                                    {this.renderSelectFilterBlock('money_size', moneySize, () => {
                                        let capitalTarget = {};
                                        if(hasSavedRecommendParams.capitalMin || hasSavedRecommendParams.capitalMax){
                                            capitalTarget = _.find(moneySize, item => item.capitalMin === hasSavedRecommendParams.capitalMin && item.capitalMax === hasSavedRecommendParams.capitalMax );
                                        }
                                        return _.isEmpty(capitalTarget) ? JSON.stringify({name: Intl.get('crm.customer.pool.unlimited', '不限')}) : JSON.stringify(capitalTarget);
                                    })}
                                </FormItem>
                                <FormItem
                                    label={this.renderLabelAndVip(Intl.get('clue.recommend.enterprise.class', '企业类型'), VIP_ITEM_MAP.COMPANY_ENTYPES)}
                                >
                                    <Select
                                        mode="multiple"
                                        value={_.get(hasSavedRecommendParams,'entTypes', [])}
                                        onChange={this.onSelect.bind(this,'entTypes')}
                                        getPopupContainer={() => document.getElementById('clue-recommend-form')}
                                    >
                                        {_.isArray(companyProperty) && companyProperty.length ?
                                            companyProperty.map((propertyItem, idx) => {
                                                return (<Option key={idx} value={propertyItem.value}>{propertyItem.name}</Option>);
                                            }) : null
                                        }
                                    </Select>
                                    <div className="show-hide-tip" onClick={this.handleToggleOtherCondition} data-tracename='点击展开或收起推荐线索的条件'>
                                        <span>{show_tip}</span>
                                        <i className={iconCls}/>
                                    </div>
                                </FormItem>
                            </div>
                            <FormItem>
                                <Button className={btnCls} type="primary" onClick={this.handleSubmit} loading={this.state.isSaving || this.props.isLoading}>{Intl.get('common.confirm', '确认')}</Button>
                            </FormItem>
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