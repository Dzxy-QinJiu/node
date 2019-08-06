// 点开座席号某行时，显示的详细信息
var React = require('react');
var createReactClass = require('create-react-class');
import UserDetailEditField from 'CMP_DIR/basic-edit-field/input';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field/select';
import {RightPanel, RightPanelClose, RightPanelSubmit, RightPanelCancel} from 'CMP_DIR/rightPanel';
import PositionAjax from '../ajax/index';
import PositionAction from '../action/index';
import PositionStore from '../store/index';
import {Form, Input, Select} from 'antd';
import * as LANGLOBAL from '../consts';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
const Validation = require('rc-form-validation-for-react16');
const FormItem = Form.Item;
const Option = Select.Option;

const PositionInfo = createReactClass({
    displayName: 'PositionInfo',
    mixins: [Validation.FieldMixin],

    getInitialState() {
        let selectRowObj = _.find( this.props.positionList, (item) => {
            return item.phone_order === this.props.clickRowPhoneOrder;
        });
        return {
            positionInfo: $.extend(true, {}, selectRowObj),
            formData: {
                member: '',
                realm_id: ''
            },
            editOrgFlag: false // 修改组织的标志，默认是false
        };
    },

    componentWillReceiveProps(nextProps) {
        let selectRowObj = _.find( this.props.positionList, (item) => {
            return item.phone_order === nextProps.clickRowPhoneOrder;
        });
        if (selectRowObj) {
            this.setState({
                positionInfo: $.extend(true, {}, selectRowObj)
            });
        }
    },

    // 获取组织id
    getOrganizationId(selectValue) {
        let organizationList = PositionStore.getState().realmList;
        return _.chain(organizationList).filter(item => selectValue.indexOf(item.realm_name) > -1).map('realm_id').value();
    },

    componentWillUpdate(nextProps, nextState) {
        let formData = this.state.formData;
        if (formData.realm_id !== nextState.formData.realm_id && nextState.formData.realm_id) {
            let SelectId = this.getOrganizationId(nextState.formData.realm_id)[0];
            PositionAction.getUnbindMemberList({realm: SelectId});
        }
    },

    componentDidMount() {
        if (this.state.positionInfo.realm_id) {
            PositionAction.getUnbindMemberList({realm: this.state.positionInfo.realm_id});
        }
    },

    // 校验输入的座席号
    checkPhoneOrder(rule, value, callback) {
        value = _.trim(value);
        if (value) {
            if (/^[0-9]*$/.test(value)) {
                callback();
            } else {
                callback(new Error(LANGLOBAL.POSITION.tips)); // 请输入数字
            }
        } else {
            callback();
        }
    },

    // 修改座席号
    changePhoneFieldSuccess(phoneOrder) {
        PositionAction.editPosition(phoneOrder);
    },

    // 修改地域
    changeSelectFieldSuccess(location) {
        PositionAction.editLocation(location);
    },

    // 修改用户
    editBindMember(member) {
        PositionAction.editBindMember(member);
    },

    // 渲染组织列表
    renderOrganizationOptions() {
        let organizationOption = ''; // 组织列表
        let organizationList = PositionStore.getState().realmList;
        if (_.isArray(organizationList) && organizationList.length > 0) {
            organizationOption = organizationList.map( (item) => {
                return (<Option key={item.realm_id} value={item.realm_name}>
                    {item.realm_name}
                </Option>);
            });
        } else {
            organizationOption = <Option value=''>{LANGLOBAL.ORGANIZATION.option}</Option>; // 暂无组织;
        }
        return organizationOption;
    },

    //获取用户下拉列表
    getMemberOptions() {
        var memberList = PositionStore.getState().unbindMember.data;
        let positionInfo = this.state.positionInfo;
        if (_.isArray(memberList) && memberList.length > 0) {
            return memberList.map((item) => {
                return (<Option key={item.user_id} value={item.nick_name}>
                    {item.nick_name}
                </Option>);
            });
        } else {
            return [];
        }
    },

    // 选择用户
    onSelectMember(userId) {
        let selectId = this.getUnbindMemberId(userId)[0];
        var memberList = PositionStore.getState().unbindMember.data;
        let selectObj = _.find(memberList, (item) => {
            return item.user_id === selectId;
        });
        this.state.positionInfo.user_id = selectId;
        this.state.positionInfo.nick_name = selectObj.nick_name;
        this.setState({
            positionInfo: $.extend(true, {}, this.state.positionInfo)
        });
    },

    // 获取地域下拉列表
    getLocationOptions() {
        let locationList = [{id: 'changsha', name: LANGLOBAL.CITY.cs}, {id: 'jinan', name: LANGLOBAL.CITY.jn}, {id: 'beijing', name: LANGLOBAL.CITY.bj}];
        return locationList.map((item) => {
            return (<Option key={item.id} value={item.id}>
                {item.name}
            </Option>);
        });
    },

    // 选择地域
    onSelectLocation(location) {
        this.state.positionInfo.phone_order_location = location;
        this.setState({
            positionInfo: $.extend(true, {}, this.state.positionInfo)
        });
    },

    // 获取用户id
    getUnbindMemberId(selectValue) {
        var unbindMemberList = PositionStore.getState().unbindMember.data;
        return _.chain(unbindMemberList).filter(item => selectValue.indexOf(item.nick_name) > -1).map('user_id').value();
    },

    // 提交保存
    handleSubmit() {
        let reqObj = {
            id: this.state.positionInfo.id
        };
        if (this.state.formData.realm_id && this.state.formData.member) {
            reqObj.realm = this.getOrganizationId(this.state.formData.realm_id)[0];
            reqObj.user_id = this.getUnbindMemberId(this.state.formData.member)[0];
        }
        PositionAjax.memberBindPhoneOrder(reqObj).then( (result) => {
            if (result) {
                PositionAction.bindMember(reqObj);
                this.state.positionInfo.realm_id = this.state.formData.realm_id;
                this.state.positionInfo.user_id = this.state.formData.member;
                this.setState({
                    positionInfo: $.extend(true, {}, this.state.positionInfo)
                });
                this.props.closeRightPanel();
                PositionAction.getPhoneOrderList({order: PositionStore.getState().sortOrder}); // 获取座席号列表
            }
        } );
    },

    // 修改组织
    handleEditOrganization() {
        this.setState({
            editOrgFlag: true
        });
    },

    // 取消编辑
    returnUnEdit() {
        this.setState({
            editOrgFlag: false
        });
    },

    render() {
        let selectRowObj = this.state.positionInfo;
        let formData = this.state.formData;
        const areaObj = {
            'jinan': LANGLOBAL.CITY.jn, // 济南
            'changsha': LANGLOBAL.CITY.cs, // 长沙
            'beijing': LANGLOBAL.CITY.bj // 北京
        };
        return(
            <RightPanel showFlag={this.props.showFlag} className='white-space-nowrap'>
                <div>
                    <RightPanelClose onClick={this.props.closeRightPanel}/>
                    <div className='position-info'>
                        <dl className='dl-horizontal detail_item position-detail-item'>
                            <dt>{LANGLOBAL.POSITION.number}</dt>
                            <dd>
                                <UserDetailEditField
                                    user_id={selectRowObj.id}
                                    value={selectRowObj.phone_order}
                                    field='phone_order'
                                    type='text'
                                    validators={[{validator: this.checkPhoneOrder}]}
                                    placeholder={LANGLOBAL.POSITION.placeholder}// 请输入座席号
                                    saveEditInput={PositionAjax.updatePhoneOrder}
                                    modifySuccess={this.changePhoneFieldSuccess}
                                />
                            </dd>
                        </dl>
                        <dl className='dl-horizontal detail_item position-info-item'>
                            <dt>{LANGLOBAL.CITY.area}</dt> 
                            <dd>
                                <BasicEditSelectField
                                    id={selectRowObj.id}
                                    displayText={areaObj[selectRowObj.phone_order_location]}
                                    value={selectRowObj.phone_order_location}
                                    field='phone_order_location'
                                    selectOptions={this.getLocationOptions()}
                                    validators={[{message: LANGLOBAL.CITY.select}]} // 请选择地域
                                    onSelectChange={this.onSelectLocation}
                                    saveEditSelect={PositionAjax.updatePhoneOrder}
                                    modifySuccess={this.changeSelectFieldSuccess}
                                />
                            </dd>
                        </dl>
                        {this.state.positionInfo.realm_id ? <div>
                            <dl className='dl-horizontal detail_item position-info-item'>
                                <dt>{LANGLOBAL.ORGANIZATION.organ}</dt>
                                <dd>{this.state.editOrgFlag ? (
                                    <Select name='realm_id'
                                        id='realm_id'
                                        placeholder={LANGLOBAL.ORGANIZATION.first} // 请先选择组织
                                        notFoundContent={LANGLOBAL.ORGANIZATION.tips} // 暂无此组织
                                        showSearch
                                        searchPlaceholder={LANGLOBAL.ORGANIZATION.placeholder} // 输入组织名称搜索
                                        value={formData.realm_id}
                                        onChange={this.setField.bind(this, 'realm_id')}
                                        filterOption={(input, option) => ignoreCase(input, option)}
                                    >
                                        {this.renderOrganizationOptions()}
                                    </Select>
                                ) : this.state.positionInfo.realm_name}
                                {!this.state.editOrgFlag && <i className='inline-block iconfont icon-update'
                                    onClick={this.handleEditOrganization.bind(this)} title='修改' />}
                                </dd>
                            </dl>
                            <dl className='dl-horizontal detail_item position-info-item'>
                                <dt>{LANGLOBAL.USER.user}</dt>
                                <dd>
                                    {this.state.editOrgFlag ? (
                                        <div>
                                            <Select name='member'
                                                id='member'
                                                placeholder={LANGLOBAL.USER.first} // 请绑定用户
                                                notFoundContent={LANGLOBAL.USER.tips} // 暂无此用户
                                                showSearch
                                                searchPlaceholder={LANGLOBAL.USER.phoneOrder} // 输入用户名称搜索
                                                value={formData.member}
                                                onChange={this.setField.bind(this, 'member')}
                                                filterOption={(input, option) => ignoreCase(input, option)}
                                            >
                                                {this.getMemberOptions()}
                                            </Select>
                                            <FormItem wrapperCol={{span: 22}}>
                                                <RightPanelCancel onClick={this.returnUnEdit} >
                                                    <ReactIntl.FormattedMessage id='common.cancel' defaultMessage='取消' />
                                                </RightPanelCancel>
                                                <RightPanelSubmit onClick={this.handleSubmit}>
                                                    <ReactIntl.FormattedMessage id='common.save' defaultMessage='保存'/>
                                                </RightPanelSubmit>
                                            </FormItem>
                                        </div>
                                    ) : (
                                        <BasicEditSelectField
                                            id={selectRowObj.id}
                                            displayText={selectRowObj.nick_name || ''}
                                            value={selectRowObj.nick_name}
                                            field='user_id'
                                            selectOptions={this.getMemberOptions()}
                                            placeholder={LANGLOBAL.USER.select} // 请选择用户
                                            validators={[{message: LANGLOBAL.USER.select}]} // '请选择用户
                                            onSelectChange={this.onSelectMember}
                                            saveEditSelect={PositionAjax.memberBindPhoneOrder}
                                            modifySuccess={this.editBindMember}
                                        />
                                    )}
                                </dd>
                            </dl>
                        </div> : <div>
                            <Form layout='horizontal' autoComplete='off'>
                                <Validation ref='validation' onValidate={this.handleValidate}>
                                    <FormItem
                                        label={LANGLOBAL.ORGANIZATION.select} // 选择组织
                                        id='realm_id'
                                        labelCol={{span: 5}}
                                        wrapperCol={{span: 17}}
                                    >
                                        <Select name='realm_id'
                                            id='realm_id'
                                            placeholder={LANGLOBAL.ORGANIZATION.first} // 请先选择组织
                                            notFoundContent={LANGLOBAL.ORGANIZATION.tips} // 暂无此组织
                                            showSearch
                                            searchPlaceholder={LANGLOBAL.ORGANIZATION.placeholder} // 输入组织名称搜索
                                            value={formData.realm_id}
                                            onChange={this.setField.bind(this, 'realm_id')}
                                            filterOption={(input, option) => ignoreCase(input, option)}
                                        >
                                            {this.renderOrganizationOptions()}
                                        </Select>
                                    </FormItem>
                                    {formData.realm_id && <div>
                                        <FormItem
                                            label={LANGLOBAL.USER.bind} //'绑定用户'
                                            id='member'
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 17}}
                                        >
                                            <Select name='member'
                                                id='member'
                                                placeholder={LANGLOBAL.USER.first} // 请绑定用户
                                                notFoundContent={LANGLOBAL.USER.tips} // 暂无此用户
                                                showSearch
                                                searchPlaceholder={LANGLOBAL.USER.phoneOrder} // 输入用户名称搜索
                                                value={formData.member}
                                                onChange={this.setField.bind(this, 'member')}
                                                filterOption={(input, option) => ignoreCase(input, option)}
                                            >
                                                {this.getMemberOptions()}
                                            </Select>
                                        </FormItem>
                                        <FormItem wrapperCol={{span: 22}}>
                                            <RightPanelCancel onClick={this.props.closeRightPanel} >
                                                <ReactIntl.FormattedMessage id='common.cancel' defaultMessage='取消' />
                                            </RightPanelCancel>
                                            <RightPanelSubmit onClick={this.handleSubmit}>
                                                <ReactIntl.FormattedMessage id='common.save' defaultMessage='保存'/>
                                            </RightPanelSubmit>
                                        </FormItem>
                                    </div>}
                                </Validation>
                            </Form>
                        </div>}
                    </div>
                </div>
            </RightPanel>
        );
    },
});
module.exports = PositionInfo;
