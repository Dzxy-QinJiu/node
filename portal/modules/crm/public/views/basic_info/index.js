import '../../css/crm-basic-info.less';
import classNames from 'classnames';
var CRMStore = require('../../store/basic-overview-store');
var CRMAction = require('../../action/basic-overview-actions');
var SalesTeamStore = require('../../../../sales_team/public/store/sales-team-store');
var PrivilegeChecker = require('../../../../../components/privilege/checker').PrivilegeChecker;
let hasPrivilege = require('../../../../../components/privilege/checker').hasPrivilege;
import {Tag} from 'antd';
var history = require('../../../../../public/sources/history');
let NameTextareaField = require('./name-textarea-field');
let CrmAction = require('../../action/crm-actions');
let CrmRepeatAction = require('../../action/customer-repeat-action');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import LocationSelectField from 'CMP_DIR/basic-edit-field-new/location-select';
import crmUtil from '../../utils/crm-util';
import CrmBasicAjax from '../../ajax/index';
import userData from 'PUB_DIR/sources/user-data';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import Trace from 'LIB_DIR/trace';
var BasicData = React.createClass({
    getInitialState: function() {
        return {
            ...CRMStore.getState(),
            salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
            showDetailFlag: false,//控制客户详情展示隐藏的标识
            editNameFlag: false,//编辑客户名的标识
            editBasicFlag: false,//编辑客户基本信息的标识
            isLoadingIndustryList: false,
            industryList: []
        };
    },
    onChange: function() {
        this.setState({...CRMStore.getState()});
    },
    componentDidMount: function() {
        CRMStore.listen(this.onChange);
        CRMAction.getBasicData(this.props.curCustomer);
        this.getIndustryList();
    },

    componentWillReceiveProps: function(nextProps) {
        CRMAction.getBasicData(nextProps.curCustomer);
        if (nextProps.curCustomer && this.state.basicData.id !== nextProps.curCustomer.id) {
            this.setState({
                showDetailFlag: false,
                editNameFlag: false
            });
        }
    },
    componentWillUnmount: function() {
        CRMStore.unlisten(this.onChange);
    },
    //获取行业列表
    getIndustryList: function() {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustryList: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.map(list, 'industry');
            }
            this.setState({isLoadingIndustryList: false, industryList: list});
        });
    },

    //修改客户基本资料成功后的处理
    editBasicSuccess: function(newBasic) {
        if (this.props.isMerge) {
            //合并面板的修改保存
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(newBasic);
        } else if (this.props.isRepeat) {
            //重客户的修改
            CrmRepeatAction.editBasicSuccess(newBasic);
        } else {
            CrmAction.editBasicSuccess(newBasic);
            if (_.isFunction(this.props.editCustomerBasic)) {
                this.props.editCustomerBasic(newBasic);
            }
        }
    },
    getAdministrativeLevelOptions: function() {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>);
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    },
    getAdministrativeLevel: function(levelId) {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id === levelId);
        return levelObj ? levelObj.level : '';
    },
    //是否有转出客户的权限
    enableTransferCustomer: function() {
        let isCommonSales = userData.getUserData().isCommonSales;
        let enable = false;
        //管理员有转出的权限
        if (hasPrivilege('CRM_MANAGER_TRANSFER')) {
            enable = true;
        } else if (hasPrivilege('CRM_USER_TRANSFER') && !isCommonSales) {
            //销售主管有转出的权限
            enable = true;
        }
        return enable;
    },
    //控制客户详情展示隐藏的方法
    toggleBasicDetail: function() {
        this.setState({
            showDetailFlag: !this.state.showDetailFlag
        });
        setTimeout(() => {
            this.props.setTabsContainerHeight();
        });
    },
    //设置编辑客户名的标识
    setEditNameFlag: function(flag) {
        Trace.traceEvent(this.getDOMNode(), flag ? '修改客户名' : '取消客户名的修改');
        this.setState({editNameFlag: flag});
    },

    //保存修改的基本信息
    saveEditBasicInfo: function(type, saveObj, successFunc, errorFunc) {
        saveObj.type = type;
        Trace.traceEvent(this.getDOMNode(), `保存客户${type}的修改`);
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(saveObj);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            CrmBasicAjax.updateCustomer(saveObj).then((result) => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    this.editBasicSuccess(saveObj);
                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, (errorMsg) => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        }
    },
    //关注客户的处理
    handleFocusCustomer: function(basicData) {
        var initialBasicData = JSON.parse(JSON.stringify(basicData));
        var myUserId = crmUtil.getMyUserId();
        var hasFocusedCustomer = _.isArray(basicData.interest_member_ids) && _.indexOf(basicData.interest_member_ids, myUserId) > -1;
        Trace.traceEvent(this.getDOMNode(), hasFocusedCustomer ? '取消关注客户' : '关注客户');
        //请求数据
        let interestObj = {
            id: basicData.id,
            type: 'customer_interest',
        };
        if (hasFocusedCustomer) {
            interestObj.user_id = '';
        } else {
            interestObj.user_id = myUserId;
        }
        basicData.interest_member_ids = [interestObj.user_id];
        this.setState({basicData: basicData});
        CrmAction.updateCustomer(interestObj, (errorMsg) => {
            if (errorMsg) {
                //将星星的颜色修改回原来的状态
                this.setState({
                    basicData: initialBasicData
                });
            } else {
                interestObj.interest_member_ids = [interestObj.user_id];
                delete interestObj.type;
                delete interestObj.user_id;

                CrmAction.editBasicSuccess(interestObj);
            }
        });
    },
    //渲染客户的基本信息
    renderBasicBlock: function(basicData) {
        let level = crmUtil.filterAdministrativeLevel(basicData.administrative_level);
        let industryOptions = this.state.industryList.map((item, i) => {
            return (<Option key={i} value={item}>{item}</Option>);
        });
        const EDIT_FEILD_WIDTH = 395, EDIT_FEILD_WIDTH_LESS = 370;
        return (
            <div className="basic-info-detail-block">
                <div className="basic-info-detail-show">
                    <div className="basic-info-administrative basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('crm.administrative.level', '行政级别')}:
                        </span>
                        <BasicEditSelectField
                            width={EDIT_FEILD_WIDTH_LESS}
                            updateMergeCustomer={this.props.updateMergeCustomer}
                            id={basicData.id}
                            displayText={this.getAdministrativeLevel(level)}
                            value={level}
                            field="administrative_level"
                            selectOptions={this.getAdministrativeLevelOptions()}
                            hasEditPrivilege={hasPrivilege('CUSTOMER_UPDATE_INDUSTRY')}
                            placeholder={Intl.get('crm.administrative.level.placeholder', '请选择行政级别')}
                            saveEditSelect={this.saveEditBasicInfo.bind(this, 'administrative_level')}
                            noDataTip={Intl.get('crm.basic.no.administrative', '暂无行政级别')}
                            addDataTip={Intl.get('crm.basic.add.administrative', '添加行政级别')}
                        />
                    </div>
                    <div className="basic-info-indestry basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('realm.industry', '行业')}:
                        </span>
                        <BasicEditSelectField
                            width={EDIT_FEILD_WIDTH}
                            updateMergeCustomer={this.props.updateMergeCustomer}
                            id={basicData.id}
                            displayText={basicData.industry}
                            value={basicData.industry}
                            field="industry"
                            selectOptions={industryOptions}
                            hasEditPrivilege={hasPrivilege('CUSTOMER_UPDATE_INDUSTRY')}
                            placeholder={Intl.get('crm.22', '请选择行业')}
                            editBtnTip={Intl.get('crm.163', '设置行业')}
                            saveEditSelect={this.saveEditBasicInfo.bind(this, 'industry')}
                            noDataTip={Intl.get('crm.basic.no.industry', '暂无行业')}
                            addDataTip={Intl.get('crm.basic.add.industry', '添加行业')}
                        />
                    </div>
                    <div className="basic-info-address basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('crm.96', '地域')}:
                        </span>
                        <LocationSelectField
                            width={EDIT_FEILD_WIDTH}
                            id={basicData.id}
                            province={basicData.province}
                            city={basicData.city}
                            county={basicData.county}
                            province_code={basicData.province_code}
                            city_code={basicData.city_code}
                            county_code={basicData.county_code}
                            saveEditLocation={this.saveEditBasicInfo.bind(this, 'address')}
                            hasEditPrivilege={hasPrivilege('CUSTOMER_UPDATE_ADDRESS')}
                            noDataTip={Intl.get('crm.basic.no.location', '暂无地域信息')}
                            addDataTip={Intl.get('crm.basic.add.location', '添加地域信息')}
                        />
                    </div>
                    <div className="basic-info-detail-address basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('realm.full.address', '详细地址')}:
                        </span>
                        <BasicEditInputField
                            width={EDIT_FEILD_WIDTH_LESS}
                            id={basicData.id}
                            value={basicData.address}
                            field="address"
                            type="input"
                            placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                            hasEditPrivilege={hasPrivilege('CUSTOMER_UPDATE_ADDRESS')}
                            saveEditInput={this.saveEditBasicInfo.bind(this, 'detail_address')}
                            noDataTip={Intl.get('crm.basic.no.address', '暂无详细地址')}
                            addDataTip={Intl.get('crm.basic.add.address', '添加详细地址')}
                        />
                    </div>
                    <div className="basic-info-remark basic-info-item">
                        <span className="basic-info-label">{Intl.get('common.remark', '备注')}:</span>
                        <BasicEditInputField
                            width={EDIT_FEILD_WIDTH}
                            id={basicData.id}
                            type="textarea"
                            field="remarks"
                            value={basicData.remarks}
                            editBtnTip={Intl.get('user.remark.set.tip', '设置备注')}
                            placeholder={Intl.get('user.input.remark', '请输入备注')}
                            hasEditPrivilege={hasPrivilege('CUSTOMER_UPDATE_REMARK')}
                            saveEditInput={this.saveEditBasicInfo.bind(this, 'remarks')}
                            noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                            addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                        />
                    </div>
                </div>
            </div>);
    },
    render: function() {
        var basicData = this.state.basicData ? this.state.basicData : {};
        //是否是关注客户的标识
        let interestFlag = _.isArray(basicData.interest_member_ids) && _.indexOf(basicData.interest_member_ids, crmUtil.getMyUserId()) > -1;
        const interestClass = classNames('iconfont', {
            'icon-interested': interestFlag,
            'icon-uninterested': !interestFlag
        });
        let interestTitle = interestFlag ? Intl.get('crm.customer.uninterested', '取消关注') :
            Intl.get('crm.customer.interested', '添加关注');
        if (this.props.isMerge) {
            interestTitle = interestFlag ? Intl.get('crm.basic.concerned', '已关注') :
                Intl.get('crm.basic.unconcerned', '未关注');
        }
        return (
            <div className="basic-info-contianer" data-trace="客户基本信息">
                {this.state.editNameFlag ? (
                    <NameTextareaField
                        isMerge={this.props.isMerge}
                        updateMergeCustomer={this.props.updateMergeCustomer}
                        customerId={basicData.id}
                        name={basicData.name}
                        modifySuccess={this.editBasicSuccess}
                        setEditNameFlag={this.setEditNameFlag}
                        showRightPanel={this.props.showRightPanel}
                    /> ) : (
                    <div className="basic-info-title-block">
                        <div className="basic-info-name">
                            {basicData.customer_label ? (
                                <Tag className={crmUtil.getCrmLabelCls(basicData.customer_label)}>
                                    {basicData.customer_label.substr(0, 1)}</Tag>) : null
                            }
                            {basicData.qualify_label ? (
                                <Tag className={crmUtil.getCrmLabelCls(basicData.qualify_label)}>
                                    {basicData.qualify_label === 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                                        basicData.qualify_label === 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ''}</Tag>) : null
                            }
                            <span className="basic-name-text">{basicData.name}</span>
                            {hasPrivilege('CUSTOMER_UPDATE_NAME') ? (
                                <DetailEditBtn title={Intl.get('common.edit', '编辑')}
                                    onClick={this.setEditNameFlag.bind(this, true)}/>) : null}
                        </div>
                        <div className="basic-info-btns">
                            <span
                                className={classNames('iconfont icon-detail-list', {'btn-active': this.state.showDetailFlag})}
                                title={this.state.showDetailFlag ? Intl.get('crm.basic.detail.hide', '收起详情') :
                                    Intl.get('crm.basic.detail.show', '展开详情')}
                                onClick={this.toggleBasicDetail}/>
                            {this.props.isMerge ? (
                                <span className={interestClass} title={interestTitle}/> ) : (
                                <span className={interestClass}
                                    title={interestTitle}
                                    onClick={this.handleFocusCustomer.bind(this, basicData)}
                                />)}
                        </div>
                    </div>
                )}
                {this.state.showDetailFlag ? this.renderBasicBlock(basicData) : null}
            </div>
        );
    }
});

module.exports = BasicData;

