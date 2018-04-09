/**
 * Created by wangliping on 2016/11/8.
 */
var language = require("../../../../public/language/getLanguage");
require('PUB_DIR/css/card-info-common.less');
if (language.lan() == "es" || language.lan() == "en") {
    require('PUB_DIR/css/card-info-es.less');
}
import {Spin, Icon, Pagination, Select, Alert, Popconfirm, message} from "antd";
import {getPassStrenth, passwordRegex} from "CMP_DIR/password-strength-bar";
var Option = Select.Option;
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelForbid = rightPanelUtil.RightPanelForbid;
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var UserDetailEditField = require("../../../../components/basic-edit-field/input");
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
var BasicEditSelectField = require("../../../../components/basic-edit-field/select");
var HeadIcon = require("../../../../components/headIcon");
import UserLog from './user-log';
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var ModalDialog = require("../../../../components/ModalDialog");
var UserFormStore = require("../store/user-form-store");
var UserStore = require("../store/user-store");
var UserInfoAjax = require("../ajax/user-ajax");
var UserAction = require("../action/user-actions");
import Trace from "LIB_DIR/trace";
import CommissionAndTarget from "./commission-and-target";
const UserData = require("PUB_DIR/sources/user-data");
var UserInfo = React.createClass({
        getInitialState: function () {
            return {
                userInfo: $.extend(true, {}, this.props.userInfo),
                logList: this.props.logList,
                modalStr: "",//模态框提示内容
                isDel: false,//是否删除
                userTeamList: UserFormStore.getState().userTeamList,
                roleList: UserFormStore.getState().roleList,
                isConfirmPasswordShow: false,//确认密码的展示标识
                saleGoalsAndCommissionRadio: UserStore.getState().saleGoalsAndCommissionRadio,
            };
        },

        componentWillReceiveProps: function (nextProps) {
            this.setState({
                userInfo: $.extend(true, {}, nextProps.userInfo),
                logList: nextProps.logList
            });
            this.layout();
        },
        onChange: function () {
            this.setState({
                userTeamList: UserFormStore.getState().userTeamList,
                roleList: UserFormStore.getState().roleList,
                saleGoalsAndCommissionRadio: UserStore.getState().saleGoalsAndCommissionRadio,
            });
        },
        componentWillUnmount: function () {
            UserStore.unlisten(this.onChange);
            UserFormStore.unlisten(this.onChange);
        },
        componentDidMount: function () {
            var _this = this;
            _this.layout();
            UserFormStore.listen(_this.onChange);
            UserStore.listen(this.onChange);
            $(window).resize(function (e) {
                e.stopPropagation();
                _this.layout();
            });
        },
        layout: function () {
            var bHeight = $("body").height();
            var formHeight = bHeight - $(".head-image-container").outerHeight(true);
            if (this.props.showAddMemberButton) {
                formHeight -= 80;
            }
            $(".log-infor-scroll").height(formHeight);
        },
        //展示是否禁用、启用的模态框
        showForbidModalDialog: function (e) {
            var modalStr = Intl.get("member.start.this", "启用此");
            if (this.state.userInfo.status == 1) {
                modalStr = Intl.get("member.stop.this", "禁用此");
            }
            Trace.traceEvent(e, "点击" + modalStr + "成员");
            this.setState({modalStr: modalStr, isDel: false});
            this.props.showModalDialog();
        },
        forbidCard: function (e) {
            var modalStr = Intl.get("member.start.this", "启用此");
            if (this.state.userInfo.status == 1) {
                modalStr = Intl.get("member.stop.this", "禁用此");
            }
            Trace.traceEvent(e, "点击确认" + modalStr + "成员");
            if (this.state.isDel) {
                this.props.deleteCard(this.props.userInfo.id);
            } else {
                var status = 1;
                if (this.props.userInfo.status == 1) {
                    status = 0
                }
                this.props.updateStatus(this.props.userInfo.id, status);
            }
        },

        //获取团队下拉列表
        getTeamOptions: function () {
            var userTeamList = this.state.userTeamList;
            if (_.isArray(userTeamList) && userTeamList.length > 0) {
                return userTeamList.map(function (team) {
                    return <Option key={team.group_id} value={team.group_id}>
                        {team.group_name}
                    </Option>
                });
            } else {
                return [];
            }
        },
        //团队的选择事件
        onSelectTeam: function (teamId) {
            Trace.traceEvent(this.getDOMNode(), "选择所属团队");
            this.state.userInfo.teamId = teamId;
            this.setState({userInfo: this.state.userInfo});
        },
        cancelEditTeam: function () {
            this.state.userInfo.teamId = this.props.userInfo.teamId;
            this.setState({userInfo: this.state.userInfo});
        },
        //修改的所属团队成功后的处理
        afterEditTeamSuccess: function (user) {
            //更新详情中的所属团队
            let updateTeam = _.find(this.state.userTeamList, team => team.group_id == user.team);
            UserAction.updateUserTeam(updateTeam);
        },

        afterEditRoleSuccess: function (user) {
            //更新详情中的角色
            let roleObj = {roleIds: [], roleNames: []}, roleList = this.state.roleList;
            if (_.isArray(user.role) && user.role.length) {
                user.role.forEach(roleId => {
                    let curRole = _.find(roleList, role => role.roleId == roleId);
                    roleObj.roleIds.push(curRole.roleId);
                    roleObj.roleNames.push(curRole.roleName);
                });
                UserAction.updateUserRoles(roleObj);
            }
        },
        changeUserFieldSuccess: function (user) {
            UserAction.afterEditUser(user);
        },
        //渲染角色下拉列表
        getRoleSelectOptions: function (userInfo) {
            //角色列表
            var roleOptions = [];
            var roleList = this.state.roleList;
            if (_.isArray(roleList) && roleList.length > 0) {
                roleOptions = roleList.map(function (role) {
                    var className = "";
                    if (_.isArray(userInfo.roleIds) && userInfo.roleIds.length > 0) {
                        userInfo.roleIds.forEach(function (roleId) {
                            if (role.roleId == roleId) {
                                className = "role-options-selected";
                            }
                        });
                    }
                    return (<Option className={className} key={role.roleId} value={role.roleId}>
                        {role.roleName}
                    </Option>);

                });
            } else {
                roleOptions = [<Option value="" key="role">{Intl.get("member.no.role", "暂无角色")}</Option>];
            }
            return roleOptions
        },
        selectRole: function (roleIds) {
            Trace.traceEvent(this.getDOMNode(), "选择角色");
            this.state.userInfo.roleIds = roleIds;
            this.setState({userInfo: this.state.userInfo});
        },
        cancelEditRole: function () {
            this.state.userInfo.roleIds = _.extend([], this.props.userInfo.roleIds);
            this.setState({userInfo: this.state.userInfo});
        },

        onPasswordDisplayTypeChange: function (type) {
            if (type === "edit") {
                this.setState({isConfirmPasswordShow: true});
            } else {
                this.setState({isConfirmPasswordShow: false});
            }
        },
        onPasswordValueChange: function () {
            const confirmPassword = this.refs.confirmPassword;
            if (confirmPassword && confirmPassword.state.formData.input) {
                confirmPassword.refs.validation.forceValidate();
            }
        },
        onConfirmPasswordDisplayTypeChange: function () {
            this.setState({isConfirmPasswordShow: false});
            this.refs.password.setState({displayType: "text"});
        },

        //对密码 进行校验
        checkPass(rule, value, callback) {
            if (value && value.match(passwordRegex)) {
                let passStrength = getPassStrenth(value);
                this.refs.password.setState({passStrength: passStrength});
                callback();
            } else {
                this.refs.password.setState({
                    passStrength: {
                        passBarShow: false,
                        passStrength: 'L'
                    }
                });
                callback(Intl.get("common.password.validate.rule", "请输入6-18位数字、字母、符号组成的密码"));
            }
        },
        //对确认密码 进行校验
        checkRePass(rule, value, callback) {
            if (value && value == this.refs.password.state.formData.input) {
                callback();
            } else {
                callback(Intl.get('common.password.unequal', '两次输入密码不一致！'));
            }
        },

        checkPhone: function (rule, value, callback) {
            value = $.trim(value);
            if (value) {
                if ((/^1[3|4|5|7|8][0-9]\d{8}$/.test(value)) ||
                    (/^\d{3,4}\-\d{7,8}$/.test(value)) ||
                    (/^400\-?\d{3}\-?\d{4}$/.test(value))) {
                    callback();
                } else {
                    callback(new Error(Intl.get("common.input.correct.phone", "请输入正确的电话号码")));
                }
            } else {
                callback();
            }
        },
        getRoleUserId: function () {
            let roleList = this.state.roleList;
            //角色列表获取出数据后再往组件里传id（避免一开始渲染的时候就传了id，取出数据后组件内相同id不重新赋值渲染的问题）
            if (_.isArray(roleList) && roleList.length > 0) {
                return this.state.userInfo.id;
            }
            return "";
        },
        getTeamUserId: function () {
            let userTeamList = this.state.userTeamList;
            //团队列表获取出数据后再往组件里传id（避免一开始渲染的时候就传了id，取出数据后组件内相同id不重新赋值渲染的问题）
            if (_.isArray(userTeamList) && userTeamList.length > 0) {
                return this.state.userInfo.id;
            }
            return "";
        },
        afterModifySuccess: function (updateObj) {
            this.setState({
                saleGoalsAndCommissionRadio:updateObj
            });
        },

        renderUserItems: function () {
            let userInfo = this.state.userInfo;
            let roleSelectOptions = this.getRoleSelectOptions(userInfo);
            let roleNames = "",isSales = false;
            if (_.isArray(userInfo.roleNames) && userInfo.roleNames.length) {
                if (_.indexOf(userInfo.roleNames, Intl.get("sales.home.sales", "销售")) > -1){
                    //是否是销售角色
                    isSales = true;
                }
                roleNames = userInfo.roleNames.join(',');

            }
            var commissionRadio = "", goal = "", recordId = "", saleGoalsAndCommissionRadio = this.state.saleGoalsAndCommissionRadio;
            if (saleGoalsAndCommissionRadio.id) {
                //某条销售目标和提成比例的id
                recordId = saleGoalsAndCommissionRadio.id;
            }
            if (saleGoalsAndCommissionRadio.commission_ratio || saleGoalsAndCommissionRadio.commission_ratio === 0) {
                //提成比例
                commissionRadio = saleGoalsAndCommissionRadio.commission_ratio;
            }
            if (saleGoalsAndCommissionRadio.goal || saleGoalsAndCommissionRadio.goal === 0) {
                //销售目标
                goal = saleGoalsAndCommissionRadio.goal;
            }

            return (
                <div data-tracename="用户详情面板">
                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("common.username", "用户名")}</dt>
                        <dd>
                            <UserDetailEditField
                                user_id={userInfo.id}
                                value={userInfo.userName}
                                field="user_name"
                                disabled={true}
                            />
                        </dd>
                    </dl>

                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("realm.change.owner.name", "姓名")}</dt>
                        <dd>
                            <UserDetailEditField
                                user_id={userInfo.id}
                                value={userInfo.name}
                                field="nick_name"
                                type="text"
                                modifySuccess={this.changeUserFieldSuccess}
                                disabled={hasPrivilege("UPDATE_MEMBER_BASE_INFO") ? false : true}
                                validators={[{
                                    required: true,
                                    min: 1,
                                    max: 20,
                                    message: Intl.get("common.input.character.prompt", "最少1个字符,最多20个字符")
                                }]}
                                placeholder={Intl.get("common.required.tip", "必填项*")}
                                saveEditInput={UserInfoAjax.editUser}
                            />
                        </dd>
                    </dl>

                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("common.password", "密码")}</dt>
                        <dd>
                            <UserDetailEditField
                                ref="password"
                                user_id={userInfo.id}
                                value={Intl.get("user.password.tip", "保密中")}
                                field="password"
                                type="password"
                                hideButtonBlock={true}
                                showPasswordStrength={true}
                                disabled={hasPrivilege("UPDATE_MEMBER_BASE_INFO") ? false : true}
                                validators={[{validator: this.checkPass}]}
                                placeholder={Intl.get("common.password.compose.rule", "6-18位字符(由数字，字母，符号组成)")}
                                title={Intl.get("user.batch.password.reset", "重置密码")}
                                onDisplayTypeChange={this.onPasswordDisplayTypeChange}
                                onValueChange={this.onPasswordValueChange}
                            />
                        </dd>
                    </dl>
                    {this.state.isConfirmPasswordShow ? (
                        <dl className="dl-horizontal detail_item member-detail-item">
                            <dt>
                                {Intl.get("common.confirm.password", "确认密码")}
                            </dt>
                            <dd>
                                <UserDetailEditField
                                    ref="confirmPassword"
                                    user_id={userInfo.id}
                                    displayType="edit"
                                    field="password"
                                    type="password"
                                    placeholder={Intl.get("common.password.compose.rule", "6-18位字符(由数字，字母，符号组成)")}
                                    validators={[{validator: this.checkRePass}]}
                                    onDisplayTypeChange={this.onConfirmPasswordDisplayTypeChange}
                                    modifySuccess={this.onConfirmPasswordDisplayTypeChange}
                                    saveEditInput={UserInfoAjax.editUser}
                                />
                            </dd>
                        </dl>
                    ) : null}
                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("common.phone", "电话")}</dt>
                        <dd>
                            <UserDetailEditField
                                user_id={userInfo.id}
                                value={userInfo.phone}
                                field="phone"
                                type="text"
                                disabled={hasPrivilege("UPDATE_MEMBER_BASE_INFO") ? false : true}
                                validators={[{validator: this.checkPhone}]}
                                placeholder={Intl.get("user.input.phone", "请输入手机号")}
                                saveEditInput={UserInfoAjax.editUser}
                                modifySuccess={this.changeUserFieldSuccess}
                            />
                        </dd>
                    </dl>
                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("common.email", "邮箱")}</dt>
                        <dd>
                            <UserDetailEditField
                                user_id={userInfo.id}
                                value={userInfo.email}
                                afterValTip={' (' + (userInfo.emailEnable ? Intl.get("common.actived", "已激活") : Intl.get("member.not.actived", "未激活")) + ')'}
                                field="email"
                                type="text"
                                disabled={hasPrivilege("UPDATE_MEMBER_BASE_INFO") ? false : true}
                                validators={[{
                                    type: "email",
                                    required: true,
                                    message: Intl.get("common.correct.email", "请输入正确的邮箱")
                                }]}
                                placeholder={Intl.get("member.input.email", "请输入邮箱")}
                                saveEditInput={UserInfoAjax.editUser}
                                modifySuccess={this.changeUserFieldSuccess}
                            />
                        </dd>
                    </dl>

                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("common.role", "角色")}</dt>
                        <dd>
                            <BasicEditSelectField
                                id={userInfo.id}
                                displayText={roleNames}
                                value={userInfo.roleIds}
                                multiple={true}
                                field="role"
                                selectOptions={roleSelectOptions}
                                disabled={hasPrivilege("UPDATE_MEMBER_ROLE") ? false : true}
                                validators={[{
                                    required: true,
                                    message: Intl.get("member.select.role", "请选择角色"),
                                    type: 'array'
                                }]}
                                placeholder={Intl.get("member.select.role", "请选择角色")}
                                onSelectChange={this.selectRole}
                                cancelEditField={this.cancelEditRole}
                                saveEditSelect={UserInfoAjax.updateUserRoles}
                                modifySuccess={this.afterEditRoleSuccess}
                            />
                        </dd>
                    </dl>
                    {/** v8环境下，不显示所属团队*/}
                    { !Oplate.hideSomeItem && <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("common.belong.team", "所属团队")}</dt>
                        <dd>
                            <BasicEditSelectField
                                id={userInfo.id}
                                displayText={userInfo.teamName}
                                value={userInfo.teamId}
                                field="team"
                                selectOptions={this.getTeamOptions()}
                                disabled={hasPrivilege("USER_MANAGE_EDIT_USER") ? false : true}
                                placeholder={Intl.get("member.select.group", "请选择团队")}
                                validators={[{message: Intl.get("member.select.group", "请选择团队")}]}
                                onSelectChange={this.onSelectTeam}
                                cancelEditField={this.cancelEditTeam}
                                saveEditSelect={UserInfoAjax.updateUserTeam}
                                modifySuccess={this.afterEditTeamSuccess}
                            />
                        </dd>
                    </dl> }
                    {isSales ? <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("contract.141", "提成比例")}</dt>
                        <dd>
                            <CommissionAndTarget
                                id={recordId}
                                field={"commission_ratio"}
                                user_id={this.state.userInfo.id}
                                userInfo = {this.state.userInfo}
                                setSalesGoals={UserInfoAjax.setSalesGoals}
                                value={commissionRadio}
                                displayType={'text'}
                                min={0}
                                max={100}
                                countTip={"%"}
                                afterModifySuccess = {this.afterModifySuccess}
                            />
                        </dd>
                    </dl> : null}
                    {isSales ? <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("sales.team.sales.goal", "销售目标")}</dt>
                        <dd>
                            <CommissionAndTarget
                                id={recordId}
                                field={"goal"}
                                user_id={this.state.userInfo.id}
                                userInfo = {this.state.userInfo}
                                setSalesGoals={UserInfoAjax.setSalesGoals}
                                value={goal}
                                displayType={'text'}
                                min={0}
                                countTip={Intl.get("contract.82", "元")}
                                afterModifySuccess = {this.afterModifySuccess}
                            />
                        </dd>
                    </dl> : null}
                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("user.manage.phone.order", "坐席号")}</dt>
                        <dd>{userInfo.phoneOrder}</dd>
                    </dl>
                    <dl className="dl-horizontal detail_item member-detail-item">
                        <dt>{Intl.get("member.create.time", "创建时间")}</dt>
                        <dd>
                            <UserDetailEditField
                                user_id={userInfo.id}
                                value={userInfo.createDate ? moment(userInfo.createDate).format(oplateConsts.DATE_FORMAT) : ""}
                                field="createDate"
                                disabled={true}
                            />
                        </dd>
                    </dl>
                </div>
            )
        },
        uploadImg: function (src) {
            Trace.traceEvent($(this.getDOMNode()).find(".upload-img-select"), "点击上传头像");
            this.state.userInfo.image = src;
            this.setState({userInfo: this.state.userInfo, showSaveIconTip: true});
        },
        saveUserIcon: function () {
            Trace.traceEvent($(this.getDOMNode()).find(".upload-img-select"), "保存上传头像");
            this.setState({showSaveIconTip: false});
            let userInfo = this.state.userInfo;
            if (userInfo.image && userInfo.image != this.props.userInfo.image) {
                let editObj = {user_id: userInfo.id, user_logo: userInfo.image};
                UserInfoAjax.editUser(editObj).then(function (result) {
                    //上传成功
                    if (result) {
                        message.success(Intl.get("common.upload.success", "上传成功！"));
                        UserAction.afterEditUser(editObj);
                    }
                }, function (errorObj) {
                    //上传失败
                    message.error(errorObj.message || Intl.get("common.upload.error", "上传失败，请重试!"));
                });
            }
        },
        cancelEditIcon: function () {
            Trace.traceEvent($(this.getDOMNode()).find(".upload-img-select"), "取消头像的保存");
            this.state.userInfo.image = this.props.userInfo.image;
            this.setState({userInfo: this.state.userInfo, showSaveIconTip: false});
        },
        render: function () {
            //当前要展示的信息
            var userInfo = this.state.userInfo;
            let user_id = userInfo.id;
            let loginUserInfo =  UserData.getUserData();
            //个人日志
            var logItems = [];
            var logList = this.state.logList;
            if (this.props.getLogErrorMsg) {
                //错误提示
                logItems = this.props.getLogErrorMsg;
            } else if (_.isArray(logList) && logList.length > 0) {
                for (var i = 0, iLen = logList.length; i < iLen; i++) {
                    logItems.push(<UserLog key={i} log={logList[i]}/>);
                }
            } else {
                logItems = Intl.get("common.no.data", "暂无数据");
            }
            var modalContent = Intl.get("member.is.or.not", "是否{modalStr}{modalType}", {
                "modalStr": this.state.modalStr,
                "modalType": this.props.modalType
            });
            var className = "right-panel-content";

            if (!this.props.userInfoShow && this.props.userFormShow) {
                //展示form面板时，整体左移
                className += " right-panel-content-slide";
            }

            var userName = this.state.userInfo.userName ? this.state.userInfo.userName : "";
            return (
                <div className={className} data-tracename="成员详情">
                    <RightPanelClose onClick={this.props.closeRightPanel} data-tracename="点击关闭成员详情"/>
                    {user_id !== loginUserInfo.user_id ? <div className="edit-buttons">
                        {!this.props.showAddMemberButton ? (
                            <PrivilegeChecker check={"USER_MANAGE_EDIT_USER"}>
                                <RightPanelForbid onClick={(e) => {
                                    this.showForbidModalDialog(e)
                                }}
                                                  isActive={this.state.userInfo.status == 0}
                                />
                            </PrivilegeChecker>
                        ) : null}
                    </div>: null}
                    <Popconfirm title="是否保存上传的头像？"
                                visible={this.state.showSaveIconTip}
                                onConfirm={this.saveUserIcon} onCancel={this.cancelEditIcon}>
                        <HeadIcon headIcon={this.state.userInfo.image} iconDescr={this.state.userInfo.name}
                                  isEdit={true}
                                  onChange={this.uploadImg}
                                  userName={userName}
                                  isUserHeadIcon={true}

                        />
                    </Popconfirm>
                    <div className="log-infor-scroll">
                        <GeminiScrollbar className="geminiScrollbar-vertical">
                            <div className="card-infor-list" id="member-infor-list">
                                {this.props.getUserDetailError ? (<div className="card-detail-error">
                                    <Alert message={this.props.getUserDetailError}
                                           type="error" showIcon/>
                                </div>) : null}
                                {this.props.infoIsloading ? (
                                    <Spin size="small"/>) : this.renderUserItems(userInfo)
                                }
                            </div>
                            <div className="log-infor-list" style={{display: this.props.hasLog ? 'block' : 'none'}}>
                                <div className="log-infor-title">
                                    <ReactIntl.FormattedMessage id="member.operation.log" defaultMessage="操作日志"/></div>
                                <div className="log-list-content">{
                                    this.props.logIsLoading ? (
                                        <Spin size="small"/>) : logItems
                                }
                                </div>
                                {this.props.logTotal / this.props.pageSize > 1 ? (
                                    <Pagination current={this.props.logNum} total={this.props.logTotal}
                                                pageSize={this.props.pageSize} size="small"
                                                onChange={this.props.changeLogNum}/>) : ""}
                            </div>
                        </GeminiScrollbar>
                    </div>
                    {this.props.showAddMemberButton ? (
                        <div className="btn-add-member" onClick={this.props.showEditForm.bind(null, "add")}>
                            <Icon type="plus"/><span><ReactIntl.FormattedMessage id="common.add.member"
                                                                                 defaultMessage="添加成员"/></span>
                        </div>
                    ) : null}
                    <ModalDialog modalContent={modalContent}
                                 modalShow={this.props.modalDialogShow}
                                 container={this}
                                 hideModalDialog={this.props.hideModalDialog}
                                 delete={(e) => {
                                     this.forbidCard(e)
                                 }}
                    />
                </div>
            );
        }
    })
;

module.exports = UserInfo;
