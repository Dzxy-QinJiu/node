var React = require('react');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * Created by jinfeng on 2015/12/28.
 */

import {Form, Icon, Input, Button,Checkbox,Dropdown, Menu,Popconfirm} from 'antd';
var FormItem = Form.Item;
var classNames = require('classnames');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var rightPanelUtil = require('../../../../components/rightPanel/index');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var AuthorityEditBtn = rightPanelUtil.RightPanelEdit;
var AuthorityDeleteBtn = rightPanelUtil.RightPanelDelete;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var AuthorityEditForm = require('./authority-edit-form');
var ModalDialog = require('../../../../components/ModalDialog');
var AlertTimer = require('../../../../components/alert-timer');
var AuthorityAction = require('../action/authority-actions');
var SearchInput = require('../../../../components/searchInput');
import Trace from 'LIB_DIR/trace';

function noop() {
}

var saveGroupNameTimer = null;//保存组名结果展示时间的控制
var TYPE_CONSTANT = 'myApp';
var AuthorityGroupForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function() {
        return {
            cancelRoleForm: noop,
            submitRoleForm: noop,
            authorityGroup: {},
            authorityGroupList: [],
            authorityGroupFromShow: false
        };
    },
    getInitialState: function() {
        //搜索框中输入的内容
        return {
            status: {
                permissionGroupName: {}
            },
            formData: $.extend(true, {}, this.props.authorityGroup),
            showAddFormFlag: false,//是否展示添加权限表单
            delModalDialogFlag: false,//是否展示删除选中权限的模态框
            isSavingGroupName: false,//是否正在保存祖名
            saveGroupNameMsg: '',//保存组名的提示信息
            saveGroupNameResult: '',//修改组名时的保存结果
            searchContent: this.props.searchContent,
            isShowPopConfirm: false, // 是否显示确认框
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.refs.searchInput.refs.searchInput.value = nextProps.searchContent;
        this.refs.validation.reset();
        var stateData = this.getInitialState();
        stateData.formData = $.extend(true, {}, nextProps.authorityGroup);
        stateData.searchContent = nextProps.searchContent;
        this.setState(stateData);
    },
    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    events: {
        //获取当前选中权限
        handleCheckBox: function(event) {
            Trace.traceEvent(event, '选中/取消选中权限');
            var curId = event.target.id, checked = event.target.checked;
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(permission) {
                    if (permission.permissionId == curId) {
                        permission.status = checked;
                    }
                });
                this.setState({
                    formData: this.state.formData
                }
                );
            }
        },

        //全选、取消选中的处理
        handleSelectAllAuthority: function(flag) {
            if (flag) {
                Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-div'),'选中全部的权限');
            } else {
                Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-div'),'取消选中的权限');
            }
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(permission) {
                    permission.status = flag;
                });
                this.setState({
                    formData: this.state.formData
                }
                );
            }
        },

        //反选
        reverseSelectAuthority: function() {
            Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-div'),'反选权限');
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(permission) {
                    permission.status = !permission.status;
                });
                this.setState({
                    formData: this.state.formData
                }
                );
            }
        },
        //将选中的权限转给哪个权限组的处理
        handleChangeGroup: function(group) {
            Trace.traceEvent($(this.getDOMNode()).find('.icon-turn-arrow'),'将选中的权限转给权限组');
            var selectIDs = [];
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(permission) {
                    if (permission.status) {
                        selectIDs.push(permission.permissionId);
                    }
                });
            }
            if (selectIDs.length > 0) {
                if (this.props.curAppId) {
                    AuthorityAction.editAuthorityGroupName({
                        classifyName: group.permissionGroupName,
                        authorityIDs: selectIDs.join(','),
                        type: 'turn'
                    }, TYPE_CONSTANT);
                } else {
                    AuthorityAction.editAuthorityGroupName({
                        classifyName: group.permissionGroupName,
                        authorityIDs: selectIDs.join(','),
                        type: 'turn'
                    });
                }
            }
        },
        //展示权限详细信息
        showAuthorityInfo: function(authorityId) {
            Trace.traceEvent($(this.getDOMNode()).find('.auth-item-icon'),'展示权限详细信息');
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(auth) {
                    if (auth.permissionId == authorityId) {
                        auth.showInfoFlag = true;
                        auth.showEditFormFlag = false;
                    } else {
                        auth.showInfoFlag = false;
                        auth.showEditFormFlag = false;
                    }
                });
                this.setState({formData: this.state.formData});
            }
        },
        //关闭权限详细信息的展示
        closeAuthDetailInfo: function(authorityId) {
            Trace.traceEvent($(this.getDOMNode()).find('.auth-item-icon'),'关闭权限详细信息');
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(auth) {
                    if (auth.permissionId == authorityId) {
                        auth.showInfoFlag = false;
                    }
                });
                this.setState({formData: this.state.formData});
            }
        },
        //展示编辑详情表单页
        showAuthorityEditForm: function(authorityId) {
            Trace.traceEvent($(this.getDOMNode()).find('.auth-item-icon'),'展示编辑权限详情');
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(auth) {
                    if (auth.permissionId == authorityId) {
                        auth.showEditFormFlag = true;
                        auth.showInfoFlag = false;
                    } else {
                        auth.showInfoFlag = false;
                        auth.showEditFormFlag = false;
                    }
                });
                this.setState({formData: this.state.formData});
            }
        },
        //关闭编辑详情表单页
        closeAuthorityEditForm: function(authorityId) {
            Trace.traceEvent($(this.getDOMNode()).find('.auth-item-icon'),'关闭编辑权限详情');
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(auth) {
                    if (auth.permissionId == authorityId) {
                        auth.showEditFormFlag = false;
                    }
                });
                this.setState({formData: this.state.formData});
            }
        },
        //添加权限表单页
        showAuthorityAddForm: function() {
            Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-name-btn'),'添加一个新权限');
            this.setState({
                showAddFormFlag: true
            });
        },
        //关闭添加权限表单页
        closeAuthorityAddForm: function() {
            this.setState({
                showAddFormFlag: false
            });
        },
        afterSaveGroupName: function(_this, resultObj) {
            _this.setState({
                isSavingGroupName: false,
                saveGroupNameMsg: resultObj.saveMsg,
                saveGroupNameResult: resultObj.saveResult
            });
            //3s后清空提示信息
            if (resultObj.saveMsg || resultObj.saveResult) {
                if (saveGroupNameTimer) {
                    clearTimeout(saveGroupNameTimer);
                    saveGroupNameTimer = null;
                }
                saveGroupNameTimer = setTimeout(function() {
                    _this.setState({
                        saveGroupNameMsg: '',//保存组名的提示信息
                        saveGroupNameResult: ''//修改组名时的保存结果
                    });
                }, 3000);
            }
        },
        saveGroupName: function() {
            var _this = this;
            var oldFormData = this.props.authorityGroup;
            var formData = _this.state.formData;
            this.setState({
                isShowPopConfirm: false
            });
            //组名没有修改时，不保存
            if (oldFormData.permissionGroupName == formData.permissionGroupName) {
                return;
            }
            var validation = this.refs.validation;
            validation.validate(function(valid) {
                if (!valid) {
                    return;
                } else if (!_this.state.isSavingGroupName) {
                    var authorityIDs = [];
                    if (_.isArray(formData.permissionList) && formData.permissionList.length > 0) {
                        formData.permissionList.forEach(function(auth) {
                            authorityIDs.push(auth.permissionId);
                        });
                    }
                    _this.setState({
                        isSavingGroupName: true
                    });
                    if (_this.props.curAppId) {
                        AuthorityAction.editAuthorityGroupName({
                            classifyName: formData.permissionGroupName,
                            authorityIDs: authorityIDs.join(',')
                        }, TYPE_CONSTANT, function(resultObj) {
                            _this.events.afterSaveGroupName(_this, resultObj);
                        });
                    } else {
                        AuthorityAction.editAuthorityGroupName({
                            classifyName: formData.permissionGroupName,
                            authorityIDs: authorityIDs.join(',')
                        }, null, function(resultObj) {
                            _this.events.afterSaveGroupName(_this, resultObj);
                        });
                    }
                }
            });
        },

        cancelSaveGroupName() {
            this.setState({
                isShowPopConfirm: false,
                formData: {
                    permissionGroupName: this.props.authorityGroup.permissionGroupName
                }
            });
        },

        //删除权限
        deleteAuthority: function(authorityId) {
            Trace.traceEvent($(this.getDOMNode()).find('.edit-role-content-label'),'删除一个权限组');
            this.props.deleteAuthority([authorityId]);
        },
        //删除多个权限
        deleteAuthoritys: function() {
            var authorityIds = [];
            Trace.traceEvent($(this.getDOMNode()).find('.edit-role-content-label'),'删除权限');
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(authority) {
                    if (authority.status) {
                        authorityIds.push(authority.permissionId);
                    }
                });
            }
            this.props.deleteAuthority(authorityIds);
        },
        //展示删除单个权限的模态框
        showSingleModalDialog: function(authorityId) {
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(authority) {
                    if (authority.permissionId == authorityId) {
                        authority.delSingleModalDialogFlag = true;
                    }
                });
                this.setState({fromData: this.state.fromData});
            }
        },
        //隐藏删除单个权限的模态框
        hideSingleModalDialog: function(authorityId) {
            if (_.isArray(this.state.formData.permissionList) && this.state.formData.permissionList.length > 0) {
                this.state.formData.permissionList.forEach(function(authority) {
                    if (authority.permissionId == authorityId) {
                        authority.delSingleModalDialogFlag = false;
                    }
                });
                this.setState({fromData: this.state.fromData});
            }
        },
        //展示删除选中权限的模态框
        showModalDialog: function() {
            //是否有选中的权限
            var hasSelectAuthority = this.getSelectedLiFlag(this.state.formData.permissionList || []);
            if (hasSelectAuthority) {
                this.setState({
                    delModalDialogFlag: true
                });
            }

        },
        //隐藏删除选中权限的模态框
        hideModalDialog: function() {
            this.setState({
                delModalDialogFlag: false
            });
        },
        //取消enter事件
        cancelEnter: function(event) {
            event.preventDefault();
        }


    },
    renderAuthorityLi: function(authorityList) {
        var _this = this;
        //搜索框中的内容
        var searchContent = this.state.searchContent;
        var authorityLis = authorityList.map(function(authority, i) {
            var delContent = '确定要删除该权限吗？';
            var isShown = true;//该权限是否展示
            //如果有搜索内容并且有服务地址时
            if (searchContent) {
                //根据搜索内容进行过滤（控制权限是否展示）
                if (_.isArray(authority.permissionApiArray) && authority.permissionApiArray.length) {
                    isShown = _.some(authority.permissionApiArray, function(permission) {
                        return ((permission.permissionApiUrl).indexOf(searchContent) >= 0);
                    });
                } else {
                    isShown = false;
                }
            }
            if (isShown) {
                return (<li className="edit-role-content-label" key={i}>
                    <div className="authority-name-li"
                        hidden={authority.showInfoFlag || authority.showEditFormFlag}>
                        <label>
                            <Checkbox id={authority.permissionId}
                                className="ant-checkbox-vertical edit-role-checkbox"
                                checked={authority.status}
                                onChange={_this.events.handleCheckBox.bind(_this)}/>
                            <span className="permission-item">{authority.permissionName}</span>
                        </label>
                        <span className="auth-item-icon">
                            <span className="iconfont icon-update"
                                onClick={_this.events.showAuthorityEditForm.bind(_this,authority.permissionId)}/>
                            <span className="iconfont icon-turn-user-list"
                                onClick={_this.events.showAuthorityInfo.bind(_this,authority.permissionId)}/>
                        </span>
                    </div>
                    {authority.showInfoFlag ?
                        (<div className="authority-detail-info-block">
                            <div className="authority-name-title">
                                <span className="authority-name">{authority.permissionName}</span>
                                <PrivilegeChecker check={_this.props.editStr}
                                    className="authority-btn-privilege">
                                    <AuthorityEditBtn
                                        onClick={_this.events.showAuthorityEditForm.bind(_this,authority.permissionId)}/>
                                </PrivilegeChecker>
                                <PrivilegeChecker
                                    check={_this.props.delStr}
                                    className="authority-btn-privilege">
                                    <AuthorityDeleteBtn
                                        onClick={_this.events.showSingleModalDialog.bind(_this,authority.permissionId)}/>
                                </PrivilegeChecker>
                                <RightPanelClose
                                    onClick={_this.events.closeAuthDetailInfo.bind(_this,authority.permissionId)}/>
                            </div>
                            <div className="authority-info-line"></div>
                            <div className="authority-detail-content">
                                {authority.permissionType ? (
                                    <div className="authority-info-item">
                                        <div className="authority-info-item-left"><ReactIntl.FormattedMessage
                                            id="authority.auth.type" defaultMessage="权限类型"/>：
                                        </div>
                                        <div className="authority-info-item-right">{authority.permissionType}</div>
                                    </div>
                                ) : null}
                                {_.isArray(authority.permissionApiArray) && authority.permissionApiArray.length > 0 ? (
                                    <div className="authority-info-item">
                                        <div className="authority-info-item-left"><ReactIntl.FormattedMessage
                                            id="authority.auth.api" defaultMessage="服务地址"/>：
                                        </div>
                                        <div className="authority-info-item-right">
                                            {authority.permissionApiArray.map(function(permission, index) {
                                                var classes = classNames({
                                                    'authority-api': true,
                                                    'selected': searchContent && (permission.permissionApiUrl).indexOf(searchContent) >= 0
                                                });
                                                return (<div className={classes} title={permission.permissionApiUrl}
                                                    key={index}>{permission.permissionApiMethod}
                                                    — {permission.permissionApiUrl}</div>);
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                                { _.isArray(authority.permissionDatas) && authority.permissionDatas.length > 0 ? (
                                    <div className="authority-info-item">
                                        <div className="authority-info-item-left"><ReactIntl.FormattedMessage
                                            id="authority.data.auth" defaultMessage="数据权限"/>：
                                        </div>
                                        <div className="authority-info-item-right">
                                            {authority.permissionDatas.map(function(permissionData, index) {
                                                return (<div className="authority-api" title={permissionData}
                                                    key={index}>{permissionData}</div>);
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                                {authority.permissionDefine ? (
                                    <div className="authority-info-item">
                                        <div className="authority-info-item-left"><ReactIntl.FormattedMessage
                                            id="authority.auth.flag" defaultMessage="权限标识"/>：
                                        </div>
                                        <div className="authority-info-item-right"
                                            title={authority.permissionDefine}>{authority.permissionDefine}</div>
                                    </div>
                                ) : null}
                            </div>
                            <ModalDialog modalContent={delContent}
                                modalShow={authority.delSingleModalDialogFlag}
                                container={_this}
                                hideModalDialog={_this.events.hideSingleModalDialog.bind(_this,authority.permissionId)}
                                delete={_this.events.deleteAuthority.bind(_this, authority.permissionId)}
                            />
                        </div>) : ''}
                    {authority.showEditFormFlag ?
                        (<AuthorityEditForm authority={authority} formType="edit"
                            curAppId={_this.props.curAppId}
                            authorityType={_this.props.authorityType}
                            closeAuthorityForm={_this.events.closeAuthorityEditForm.bind(_this,authority.permissionId)}
                            permissionList={_this.state.formData.permissionList}

                        />) : ''
                    }

                </li>);
            } else {
                return null;
            }

        });
        return authorityLis;
    },

    //获取是否有选中的权限的标志
    getSelectedLiFlag: function(permissionList) {
        var hasSelectedLi = false;//是否有选中的权限
        if (_.isArray(permissionList) && permissionList.length > 0) {
            hasSelectedLi = _.some(permissionList, function(permission) {
                return permission.status;
            });
        }
        return hasSelectedLi;
    },
    hideDelTooltip: function() {
        this.props.clearDelAuthErrorMsg();
    },
    handleSearchEvent: function(inputContent) {
        Trace.traceEvent($(this.getDOMNode()).find('.pull-right'),'按服务地址搜索');
        inputContent = inputContent ? inputContent.trim() : '';
        AuthorityAction.setSearchContent(inputContent);
    },
    // 显示确认框
    showConfirm() {
        this.setState({
            isShowPopConfirm: true
        });
    },
    render: function() {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        var authorityGroupList = this.props.authorityGroupList;
        //权限列表的展示
        var authorityLis = this.renderAuthorityLi(formData.permissionList || []);
        //是否有选中的权限
        var hasSelectedLi = this.getSelectedLiFlag(formData.permissionList || []);
        //权限组列表的展示
        var menu = (<Menu className="authority-group-drop-list">
            {
                authorityGroupList.map(function(group, key) {
                    if (group.permissionGroupName != formData.permissionGroupName) {
                        return (<Menu.Item key={key}>
                            <div className="authority-group-item"
                                onClick={_this.events.handleChangeGroup.bind(_this,group)}>
                                { Intl.get('authority.turn.to', '转移到') + group.permissionGroupName}
                            </div>
                        </Menu.Item>);
                    }
                })
            }
        </Menu>);
        var delSelectContent = Intl.get('authority.del.select.auth', '确定要删除选中的权限吗？');
        return (
            <RightPanel className="authority-group-edit-panel" showFlag={this.props.authorityGroupFormShow}>
                <RightPanelClose onClick={this.props.closeAuthorityGroupForm}/>
                <div className="right-form-scroll-div" data-tracename="添加/编辑权限">
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <Form horizontal className="authority-group-form" onSubmit={this.events.cancelEnter}>
                            <Popconfirm title={Intl.get('authority.edit.is.save', '是否保存修改的权限组名')}
                                visible={this.state.isShowPopConfirm}
                                onConfirm={this.events.saveGroupName.bind(this)}
                                onCancel={this.events.cancelSaveGroupName.bind(this)}
                                okText={Intl.get('user.yes', '是')}
                                cancelText={Intl.get('user.no', '否')}>
                                <Validation ref="validation" onValidate={this.handleValidate}>
                                    <FormItem
                                        label={Intl.get('authority.auth.group.name', '权限组名')}
                                        id="permissionGroupName"
                                        labelCol={{span: 5}}
                                        wrapperCol={{span: 18}}
                                        validateStatus={this.renderValidateStyle('permissionGroupName')}
                                        help={status.permissionGroupName.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.permissionGroupName.errors && status.permissionGroupName.errors.join(','))}
                                    >
                                        <Validator
                                            rules={[{required: true, min: 1, max: 200 , message: Intl.get('authority.input.length.tip', '最少1个字符,最多200个字符')}]}>
                                            <Input name="permissionGroupName" id="permissionGroupName"
                                                disabled={this.state.isSavingGroupName}
                                                value={formData.permissionGroupName}
                                                onChange={this.setField.bind(this, 'permissionGroupName')}
                                                onBlur={this.showConfirm}
                                                placeholder={Intl.get('common.required.tip', '必填项*')}/>
                                        </Validator>
                                        {this.state.isSavingGroupName ? (
                                            <div className="group-name-saving">
                                                {Intl.get('authority.saving.group.name', '正在保存组名')}...</div>) : this.state.saveGroupNameResult ? (<div
                                            className={'group-name-save-' + this.state.saveGroupNameResult}>
                                            {this.state.saveGroupNameMsg}</div>) : null}
                                    </FormItem>
                                </Validation>
                            </Popconfirm>
                        </Form>
                        <div className="form-authority-group-div">
                            <div className="authority-group-line"></div>
                            <div className="form-authority-group-name-div">
                                <div className="pull-right" >
                                    <SearchInput
                                        searchPlaceHolder={Intl.get('authority.search.by.server.address', '请输入服务地址搜索')}
                                        searchEvent={this.handleSearchEvent}
                                        ref="searchInput"
                                    />
                                </div>
                                <div
                                    className="form-authority-group-name"><ReactIntl.FormattedMessage
                                        id="authority.current.auth" defaultMessage="当前权限"/>
                                </div>
                                <div className="form-authority-group-name-btn">
                                    <Button type="ghost"
                                        className="form-authority-group-name-btn-label"
                                        onClick={_this.events.handleSelectAllAuthority.bind(_this,true)}
                                    >
                                        <ReactIntl.FormattedMessage id="authority.all.select" defaultMessage="全选"/>
                                    </Button>
                                    <Button type="ghost"
                                        className="form-authority-group-name-btn-label"
                                        onClick={_this.events.reverseSelectAuthority.bind(_this)}
                                    >
                                        <ReactIntl.FormattedMessage id="authority.invert.select" defaultMessage="反选"/>
                                    </Button>
                                    <Button type="ghost"
                                        className="form-authority-group-name-btn-label"
                                        onClick={_this.events.handleSelectAllAuthority.bind(_this,false)}
                                    >
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                                    </Button>
                                </div>
                                <PrivilegeChecker check={_this.props.delStr}
                                    className={hasSelectedLi ? 'autority-turn-del-btn cursor-pointer' : 'autority-turn-del-btn'}>
                                    {
                                        hasSelectedLi ? (<Dropdown overlay={menu}>
                                            <span className="iconfont icon-turn-arrow"/>
                                        </Dropdown>) : ( <span className="iconfont icon-turn-arrow"/>)
                                    }
                                    <span className="iconfont icon-delete"
                                        onClick={_this.events.showModalDialog.bind(_this)}/>
                                </PrivilegeChecker>
                            </div>
                            <PrivilegeChecker check={_this.props.addStr}>
                                <div className="authority-add-new"
                                    onClick={_this.events.showAuthorityAddForm.bind(_this)}
                                    hidden={_this.state.showAddFormFlag}>
                                    <div className="authority-add-icon"><Icon type="plus"/></div>
                                    <span className="authority-add-descr"><ReactIntl.FormattedMessage
                                        id="authority.add.new.auth" defaultMessage="添加一个新权限"/></span>
                                </div>
                            </PrivilegeChecker>
                            {_this.state.showAddFormFlag ?
                                (<AuthorityEditForm authorityType={_this.props.authorityType} formType="add"
                                    curAppId={_this.props.curAppId}
                                    classifyName={formData.permissionGroupName}
                                    closeAuthorityForm={_this.events.closeAuthorityAddForm.bind(_this)}
                                    permissionList={_this.state.formData.permissionList}
                                />) : ''}
                            <ul>
                                {authorityLis}
                            </ul>
                        </div>
                    </GeminiScrollbar>
                </div>
                <ModalDialog modalContent={delSelectContent}
                    modalShow={_this.state.delModalDialogFlag}
                    container={_this}
                    hideModalDialog={_this.events.hideModalDialog.bind(_this)}
                    delete={_this.events.deleteAuthoritys.bind(_this)}
                />
                {
                    _this.props.delAuthErrorMsg ? ( <AlertTimer time={2000}
                        message={_this.props.delAuthErrorMsg}
                        type='error' showIcon
                        onHide={this.hideDelTooltip}/>) : null
                }
            </RightPanel>
        );
    }
});

module.exports = AuthorityGroupForm;

