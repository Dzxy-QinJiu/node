import crmAjax from 'MOD_DIR/crm/public/ajax';

var React = require('react');
import '../../css/crm-basic-info.less';
import classNames from 'classnames';
var CrmOverviewStore = require('../../store/basic-overview-store');
var CrmOverviewActions = require('../../action/basic-overview-actions');
var SalesTeamStore = require('../../../../sales_team/public/store/sales-team-store');
var PrivilegeChecker = require('../../../../../components/privilege/checker').PrivilegeChecker;
let hasPrivilege = require('../../../../../components/privilege/checker').hasPrivilege;
import {Tag, Dropdown, Menu, message, Popconfirm, Icon, Input, Radio} from 'antd';
var history = require('../../../../../public/sources/history');
let NameTextareaField = require('./name-textarea-field');
let CrmAction = require('../../action/crm-actions');
let CrmRepeatAction = require('../../action/customer-repeat-action');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import LocationSelectField from 'CMP_DIR/basic-edit-field-new/location-select';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import crmUtil from '../../utils/crm-util';
import CrmBasicAjax from '../../ajax/index';
import userData from 'PUB_DIR/sources/user-data';
import {DetailEditBtn} from 'CMP_DIR/rightPanel';
import Trace from 'LIB_DIR/trace';
import CustomerLabel from 'CMP_DIR/customer_label';
import { myWorkEmitter } from 'OPLATE_EMITTER';
import crmPrivilegeConst from '../../privilege-const';
import {checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import {isCommonSalesOrPersonnalVersion} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';

const RELEASE_TYPE = crmUtil.RELEASE_TYPE;
let customerLabelList = [];//存储客户阶段的列表
const CRM_VIEW_TYPES = crmUtil.CRM_VIEW_TYPES;
const VIEW_MAPS = [
    CRM_VIEW_TYPES.CRM_REPEAT,
    CRM_VIEW_TYPES.CRM_RECYCLE,
    CRM_VIEW_TYPES.CRM_POOL
];

class BasicData extends React.Component {
    state = {
        ...CrmOverviewStore.getState(),
        basicData: {},
        salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
        showDetailFlag: false,//控制客户详情展示隐藏的标识
        editNameFlag: false,//编辑客户名的标识
        editBasicFlag: false,//编辑客户基本信息的标识
        isLoadingIndustryList: false,
        industryList: [],
        isCustomerLabelLoading: false,
        customerLabelList: customerLabelList,
        isSavingCustomerLabel: false,
        isReleasingCustomer: false,//正在释放客户
        releaseReason: '',//释放理由
        unFillReasonTip: '',//没有填写释放理由
        releaseType: RELEASE_TYPE.OWNER,//释放客户时，释放的类型（负责人、联合跟进人）
    };

    onChange = () => {
        this.setState({...CrmOverviewStore.getState()});
    };

    componentDidMount() {
        CrmOverviewStore.listen(this.onChange);
        CrmOverviewActions.getBasicData(this.props.curCustomer);
        let isGetIndustryListFlag = hasPrivilege(crmPrivilegeConst.BASE_QUERY_PERMISSION_ORGANIZATION) && crmUtil.checkPrivilege([crmPrivilegeConst.CUSTOMER_UPDATE, crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL])
            && !this.props.disableEdit;
        if (isGetIndustryListFlag) {
            this.getIndustryList();
        }
        if (this.hasEditCutomerLabelPrivilege()) {
            //如果已经获取过客户标签后，不用再获取
            if (!_.get(customerLabelList, '[0]')) {
                this.getCustomerLabelList();
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        CrmOverviewActions.getBasicData(nextProps.curCustomer);
        if (nextProps.curCustomer && this.state.basicData.id !== nextProps.curCustomer.id) {
            this.setState({
                showDetailFlag: false,
                editNameFlag: false,
            });
        }
    }

    hasEditCutomerLabelPrivilege() {
        return crmUtil.checkPrivilege([crmPrivilegeConst.CUSTOMER_UPDATE, crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL]);
    }

    componentWillUnmount() {
        CrmOverviewStore.unlisten(this.onChange);
    }

    getCustomerLabelList() {
        this.setState({
            isCustomerLabelLoading: true
        });
        $.ajax({
            url: '/rest/customer/v2/salestage',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                customerLabelList = _.isArray(_.get(data, 'result')) ? _.get(data, 'result') : customerLabelList;
                this.setState({
                    customerLabelList: customerLabelList,
                    isCustomerLabelLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isCustomerLabelLoading: false
                });
            }
        });
    }

    //获取行业列表
    getIndustryList = () => {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustryList: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.map(list, 'industry');
            }
            this.setState({isLoadingIndustryList: false, industryList: list});
        });
    };

    //修改客户基本资料成功后的处理
    editBasicSuccess = (newBasic) => {
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
        let basicData = _.extend(this.state.basicData, newBasic);
        delete basicData.type;
        delete basicData.urlType;
        CrmOverviewActions.updateBasicData(basicData);
    };

    getAdministrativeLevelOptions = () => {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>);
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    };

    getAdministrativeLevel = (levelId) => {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id === levelId);
        return levelObj ? levelObj.level : '';
    };

    //是否有转出客户的权限
    enableTransferCustomer = () => {
        let enable = false;
        //管理员有转出的权限
        if (hasPrivilege(crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL)) {
            enable = true;
        } else if (hasPrivilege(crmPrivilegeConst.CUSTOMER_UPDATE) && !isCommonSalesOrPersonnalVersion()) {
            //销售主管有转出的权限
            enable = true;
        }
        return enable;
    };

    //控制客户详情展示隐藏的方法
    toggleBasicDetail = () => {
        this.setState({
            showDetailFlag: !this.state.showDetailFlag
        });
        setTimeout(() => {
            this.props.setTabsContainerHeight();
        });
    };

    //设置编辑客户名的标识
    setEditNameFlag = (flag) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), flag ? '修改客户名' : '取消客户名的修改');
        this.setState({editNameFlag: flag});
    };

    //保存修改的基本信息
    saveEditBasicInfo = (type, saveObj, successFunc, errorFunc) => {
        saveObj.type = type;
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存客户${type}的修改`);
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
    };

    //关注客户的处理
    handleFocusCustomer = (basicData) => {
        var initialBasicData = JSON.parse(JSON.stringify(basicData));
        var myUserId = crmUtil.getMyUserId();
        var hasFocusedCustomer = _.isArray(basicData.interest_member_ids) && _.indexOf(basicData.interest_member_ids, myUserId) > -1;
        Trace.traceEvent(ReactDOM.findDOMNode(this), hasFocusedCustomer ? '取消关注客户' : '关注客户');
        //请求数据
        let interestObj = {
            id: basicData.id,
            type: 'customer_interest',
        };
        if (hasFocusedCustomer) {//取消关注
            interestObj.user_id = '';
            basicData.interest_member_ids = _.filter(basicData.interest_member_ids, interestId => interestId !== myUserId);
        } else {//关注
            interestObj.user_id = myUserId;
            if (_.isArray(basicData.interest_member_ids)) {
                basicData.interest_member_ids.push(myUserId);
            } else {
                basicData.interest_member_ids = [myUserId];
            }
        }
        CrmOverviewActions.updateBasicData(basicData);
        CrmAction.updateCustomer(interestObj, (errorMsg) => {
            if (errorMsg) {
                if(interestObj.user_id){
                    message.error(Intl.get('crm.customer.interested.error', '添加关注失败'));
                }else{
                    message.error(Intl.get('crm.customer.uninterested.error', '取消关注失败'));
                }
                //将星星的颜色修改回原来的状态
                CrmOverviewActions.updateBasicData(initialBasicData);
            } else {
                if(interestObj.user_id){
                    message.success(Intl.get('crm.customer.interested.succ', '添加关注成功'));
                }else{
                    message.success(Intl.get('crm.customer.uninterested.succ', '取消关注成功'));
                }
                interestObj.interest_member_ids = [interestObj.user_id];
                delete interestObj.type;
                delete interestObj.user_id;
                CrmAction.editBasicSuccess(interestObj);
            }
        });
    };

    //释放客户的处理
    releaseCustomer = () => {
        let basicData = this.state.basicData;
        if(!_.get(basicData,'id') || this.state.isReleasingCustomer) return;
        let _this = this;
        crmUtil.checkSingleReleaseCustomer(this.state.releaseType, basicData, basicData.id, releaseCustomer);

        function releaseCustomer(result) {
            if(_.isObject(result) && _.get(result, 'error')) {
                _this.setState({unFillReasonTip: _.get(result, 'error')});
            }else if(_.isBoolean(result)) {
                Trace.traceEvent(ReactDOM.findDOMNode(this), '客户详情中释放客户');
                _this.setState({isReleasingCustomer: true});
                let reqData = {id: basicData.id};
                if(_this.state.releaseReason) {
                    reqData.reason = _this.state.releaseReason;
                }
                reqData.type = result ? RELEASE_TYPE.OWNER : RELEASE_TYPE.JOIN;
                CrmBasicAjax.releaseCustomer(reqData).then(result => {
                    _this.setState({isReleasingCustomer: false});
                    //释放完客户后，需要将首页对应的工作设为已完成
                    if (window.location.pathname === '/home') {
                        myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                    }
                    CrmAction.afterReleaseCustomer(basicData.id);
                    //需要关闭面板
                    _.isFunction(_this.props.hideRightPanel) && _this.props.hideRightPanel($(ReactDOM.findDOMNode(_this)));
                }, (errorMsg) => {
                    _this.setState({isReleasingCustomer: false});
                    message.error(errorMsg);
                });
            }
        }
    };

    //是否展示释放按钮
    isShowReleaseBtn = () => {
        let pathname = window.location.pathname;
        let basicData = this.state.basicData;
        //重复客户，回收站，客户池不能有释放按钮
        const isNotShowRelease = _.includes(VIEW_MAPS, basicData.customer_type);
        const isAllowPath = pathname === '/home' || pathname === '/accounts';
        //（在首页或者客户列表里），以及不是运营人员
        return isAllowPath && !isNotShowRelease && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };

    getEditCustomerLabelType() {
        let type = 'user';//crmPrivilegeConst.CUSTOMER_UPDATE
        if (hasPrivilege(crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL)) {
            type = 'manager';
        }
        return type;
    }

    changeCustomerLabel = (item) => {
        let basicData = this.state.basicData;
        if (item.key === _.get(basicData, 'customer_label')) return;
        if (!_.get(basicData, 'id')) return;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存客户阶段的修改');
        let saveLabelObj = {
            id: _.get(basicData, 'id'),
            customer_label: item.key
        };
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(saveLabelObj);
            basicData.customer_label = item.key;
            this.setState({basicData});
        } else {
            let type = this.getEditCustomerLabelType();
            this.setState({
                isSavingCustomerLabel: true
            });
            $.ajax({
                url: `/rest/crm/${type}/customer_stage`,
                type: 'put',
                dateType: 'json',
                data: saveLabelObj,
                success: (data) => {
                    if (data) {
                        basicData.customer_label = item.key;
                        this.editBasicSuccess(saveLabelObj);
                    }
                    this.setState({
                        basicData,
                        isSavingCustomerLabel: false
                    });
                },
                error: (xhr) => {
                    this.setState({
                        isSavingCustomerLabel: false
                    });
                    message.error(xhr.responseJSON || Intl.get('common.edit.failed', '修改失败'));
                }
            });
        }
    };
    //渲染客户的基本信息
    renderBasicBlock = (basicData) => {
        let level = crmUtil.filterAdministrativeLevel(basicData.administrative_level);
        let industryOptions = this.state.industryList.map((item, i) => {
            return (<Option key={i} value={item}>{item}</Option>);
        });
        const EDIT_FEILD_WIDTH = 395, EDIT_FEILD_WIDTH_LESS = 370;
        return (
            <div className="basic-info-detail-block">
                <div className="basic-info-detail-show">
                    {checkVersionAndType().personal ? null : (
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
                                hasEditPrivilege={crmUtil.checkPrivilege([
                                    crmPrivilegeConst.CUSTOMER_UPDATE,
                                    crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                                ]) && !this.props.disableEdit}
                                placeholder={Intl.get('crm.administrative.level.placeholder', '请选择行政级别')}
                                saveEditSelect={this.saveEditBasicInfo.bind(this, 'administrative_level')}
                                noDataTip={Intl.get('crm.basic.no.administrative', '暂无行政级别')}
                                addDataTip={Intl.get('crm.basic.add.administrative', '添加行政级别')}
                            />
                        </div>
                    )}
                    <div className="basic-info-indestry basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('common.industry', '行业')}:
                        </span>
                        <BasicEditSelectField
                            width={EDIT_FEILD_WIDTH}
                            updateMergeCustomer={this.props.updateMergeCustomer}
                            id={basicData.id}
                            displayText={basicData.industry}
                            value={basicData.industry}
                            field="industry"
                            selectOptions={industryOptions}
                            hasEditPrivilege={crmUtil.checkPrivilege([
                                crmPrivilegeConst.CUSTOMER_UPDATE,
                                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                            ]) && !this.props.disableEdit}
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
                            hasEditPrivilege={crmUtil.checkPrivilege([
                                crmPrivilegeConst.CUSTOMER_UPDATE,
                                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                            ]) && !this.props.disableEdit}
                            noDataTip={Intl.get('crm.basic.no.location', '暂无地域信息')}
                            addDataTip={Intl.get('crm.basic.add.location', '添加地域信息')}
                        />
                    </div>
                    <div className="basic-info-detail-address basic-info-item">
                        <span className="basic-info-label">
                            {Intl.get('common.full.address', '详细地址')}:
                        </span>
                        <BasicEditInputField
                            width={EDIT_FEILD_WIDTH_LESS}
                            id={basicData.id}
                            value={basicData.address}
                            field="address"
                            type="input"
                            placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                            hasEditPrivilege={crmUtil.checkPrivilege([
                                crmPrivilegeConst.CUSTOMER_UPDATE,
                                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                            ]) && !this.props.disableEdit}
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
                            textCut={true}
                            value={basicData.remarks}
                            editBtnTip={Intl.get('user.remark.set.tip', '设置备注')}
                            placeholder={Intl.get('user.input.remark', '请输入备注')}
                            hasEditPrivilege={crmUtil.checkPrivilege([
                                crmPrivilegeConst.CUSTOMER_UPDATE,
                                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                            ]) && !this.props.disableEdit}
                            saveEditInput={this.saveEditBasicInfo.bind(this, 'remarks')}
                            noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                            addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                        />
                    </div>
                </div>
            </div>);
    };


    getCustomerLabelMenus = () => {
        return (
            <Menu onClick={this.changeCustomerLabel} selectedKeys={[_.get(this.state, 'basicData.customer_label', '')]}>
                {_.map(this.state.customerLabelList, item => {
                    return (<Menu.Item key={item}>{item}</Menu.Item>);
                })}
            </Menu>);
    }

    clearReleaseReason = () => {
        this.setState({
            releaseReason: '',
            unFillReasonTip: '',
            releaseType: RELEASE_TYPE.OWNER
        });
    };

    onReasonChange = (e) => {
        this.setState({releaseReason: _.get(e, 'target.value', '')});
    };

    onTypeChange = (e) => {
        this.setState({
            releaseType: e.target.value,
        });
    };

    renderReleaseCustomerBlock = (releaseTip) => {
        return (
            <div className="release-customer-container">
                <div className="release-customer-tip">
                    <Icon type="exclamation-circle"/>
                    <span>{releaseTip}</span>
                </div>
                {/*个人版或者普通销售，不展示释放类型*/}
                {checkVersionAndType().personal || userData.getUserData().isCommonSales ? null : (
                    <Radio.Group onChange={this.onTypeChange} value={this.state.releaseType}>
                        <Radio value={RELEASE_TYPE.OWNER}>{Intl.get('crm.6', '负责人')}</Radio>
                        <Radio value={RELEASE_TYPE.JOIN}>{Intl.get('crm.second.sales', '联合跟进人')}</Radio>
                    </Radio.Group>
                )}
                <Input.TextArea
                    placeholder={Intl.get('crm.customer.release.reason', '请填写释放理由')}
                    value={this.state.releaseReason}
                    onChange={this.onReasonChange}
                />
            </div>
        );
    };

    render() {
        var basicData = this.state.basicData ? this.state.basicData : {};
        //是否是关注客户的标识
        let interestFlag = _.isArray(basicData.interest_member_ids) && _.indexOf(basicData.interest_member_ids, crmUtil.getMyUserId()) > -1;
        const interestClass = classNames('iconfont', {
            'icon-interested': interestFlag,
            'icon-uninterested': !interestFlag
        });
        let interestTitle = interestFlag ? Intl.get('crm.customer.uninterested', '取消关注') :
            Intl.get('crm.customer.interested', '添加关注');
        if (this.props.isMerge || this.props.disableEdit) {
            interestTitle = interestFlag ? Intl.get('crm.basic.concerned', '已关注') :
                Intl.get('crm.basic.unconcerned', '未关注');
        }
        let customerLabel = basicData.customer_label ? (
            <Tag className={crmUtil.getCrmLabelCls(basicData.customer_label)}>
                {basicData.customer_label}
            </Tag>) : null;
        const isShowRelease = this.isShowReleaseBtn();
        const basicInfoNameCls = classNames('basic-info-name', {
            'show-release-btn': isShowRelease
        });
        var releaseTip = '';
        if(isShowRelease) {
            releaseTip = crmUtil.releaseCustomerTip();
        }
        return (
            <div className="basic-info-contianer" data-trace="客户基本信息">
                {this.state.editNameFlag ? (
                    <NameTextareaField
                        isMerge={this.props.isMerge}
                        updateMergeCustomer={this.props.updateMergeCustomer}
                        customerId={basicData.id}
                        name={basicData.name}
                        customer_label={basicData.customer_label}
                        modifySuccess={this.editBasicSuccess}
                        setEditNameFlag={this.setEditNameFlag}
                        showRightPanel={this.props.showRightPanel}
                        disableEdit={this.props.disableEdit}
                    /> ) : (
                    <div className="basic-info-title-block">
                        <div className={basicInfoNameCls}>
                            <CustomerLabel label ={basicData.qualify_label} />
                            {this.hasEditCutomerLabelPrivilege() && !this.props.disableEdit ? (
                                <Dropdown overlay={this.getCustomerLabelMenus()} trigger={['click']}>
                                    <span title={Intl.get('crm.customer.label.edit.tip', '点击修改客户阶段')}>
                                        {customerLabel}
                                    </span>
                                </Dropdown>) : customerLabel}
                            <span className="basic-name-text">{basicData.name}</span>
                            {crmUtil.checkPrivilege([
                                crmPrivilegeConst.CUSTOMER_UPDATE,
                                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                            ]) && !this.props.disableEdit ? (
                                    <DetailEditBtn title={Intl.get('common.edit', '编辑')}
                                        onClick={this.setEditNameFlag.bind(this, true)}/>) : null}
                        </div>
                        <div className="basic-info-btns">
                            <span
                                className={classNames('iconfont icon-detail-list handle-btn-item', {'btn-active': this.state.showDetailFlag})}
                                title={this.state.showDetailFlag ? Intl.get('crm.basic.detail.hide', '收起详情') :
                                    Intl.get('crm.basic.detail.show', '展开详情')}
                                onClick={this.toggleBasicDetail}/>
                            {this.props.isMerge || this.props.disableEdit ? (
                                <span className={interestClass} title={interestTitle}/> ) : (
                                <span className={interestClass}
                                    title={interestTitle}
                                    onClick={this.handleFocusCustomer.bind(this, basicData)}
                                />)}
                            {isShowRelease ? (
                                <AntcDropdown
                                    datatraceContainer='释放客户'
                                    btnAtTop={false}
                                    placement="bottomRight"
                                    content={(
                                        <span className='iconfont icon-release handle-btn-item' title={Intl.get('crm.customer.release', '释放')}/>
                                    )}
                                    overlayTitle={Intl.get('crm.customer.release.customer', '释放客户')}
                                    isSaving={this.state.isReleasingCustomer}
                                    overlayContent={this.renderReleaseCustomerBlock(releaseTip)}
                                    handleSubmit={this.releaseCustomer}
                                    okTitle={Intl.get('common.confirm', '确认')}
                                    cancelTitle={Intl.get('common.cancel', '取消')}
                                    unSelectDataTip={this.state.unFillReasonTip}
                                    clearSelectData={this.clearReleaseReason}
                                />
                            ) : null}
                        </div>
                    </div>
                )}
                {this.state.showDetailFlag ? this.renderBasicBlock(basicData) : null}
            </div>
        );
    }
}
BasicData.propTypes = {
    curCustomer: PropTypes.object,
    isMerge: PropTypes.bool,
    updateMergeCustomer: PropTypes.func,
    isRepeat: PropTypes.bool,
    editCustomerBasic: PropTypes.func,
    setTabsContainerHeight: PropTypes.func,
    showRightPanel: PropTypes.func,
    disableEdit: PropTypes.bool,
    hideRightPanel: PropTypes.func,
};
module.exports = BasicData;


