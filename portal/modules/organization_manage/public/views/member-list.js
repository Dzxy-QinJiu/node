/**
 * Created by wangliping on 2016/10/18.
 */
var React = require('react');
var createReactClass = require('create-react-class');
require('../../../../components/antd-table-pagination/index.less');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var DefaultUserLogoTitle = require('../../../../components/default-user-logo-title');
var Spinner = require('../../../../components/spinner');
var AlertTimer = require('../../../../components/alert-timer');
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var NoData = require('../../../../components/analysis-nodata');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
import {SearchInput} from 'antc';
var Table = require('antd').Table;
var insertStyle = require('../../../../components/insert-style');
var Button = require('antd').Button;
var classNames = require('classnames');
var OrganizationAction = require('../action/organization-actions');
var MemberListEditAction = require('../action/member-list-edit-actions');
var MemberListEditStore = require('../store/member-list-edit-store');

import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
const messages = defineMessages({
    organization_edit_organization_member: {id: 'organization.edit.organization.member'},//编辑组织成员
    organization_add_organization_member: {id: 'organization.add.organization.member'},//添加组织成员
    common_username: {id: 'common.username'},//用户名
    common_nickname: {id: 'common.nickname'},//昵称
    common_remark: {id: 'common.remark'},//备注
    organization_search_placeholder: {id: 'organization.search.placeholder'},//根据用户名、昵称、备注进行搜索
    common_add: {id: 'common.add'},//添加
    common_confirm: {id: 'common.confirm'},//确认
});
//分页器
var paginationintl = '';
var language = require('../../../../public/language/getLanguage');
if (language.lan() === 'es') {
    paginationintl = {
        // Options.jsx
        items_per_page: '/página',//条/页
        jump_to: 'salta a',//跳至
        page: 'página',//页

        // Pager.jsx
        first_page: 'Primera página',//第一页
        last_page: 'Última página',//最后一页

        // Pagination.jsx
        prev_page: 'Página anterior',//上一页
        next_page: 'Siguiente página',//下一页
        prev_5: '5 Páginas adelante',//向前 5 页
        next_5: '5 Páginas atrás'//向后 5 页
    };
} else if (language.lan() === 'en') {
    paginationintl = {
        // Options.jsx
        items_per_page: '/page',
        jump_to: 'Goto',
        page: 'page',

        // Pager.jsx
        first_page: 'First Page',
        last_page: 'Last Page',

        // Pagination.jsx
        prev_page: 'Previous Page',
        next_page: 'Next Page',
        prev_5: 'Previsous 5 Pages',
        next_5: 'Next 5 Pages'
    };
} else if (language.lan() === 'zh') {
    paginationintl = {
        // Options.jsx
        items_per_page: '条/页',
        jump_to: '跳至',
        page: '页',

        // Pager.jsx
        first_page: '第一页',
        last_page: '最后一页',

        // Pagination.jsx
        prev_page: '上一页',
        next_page: '下一页',
        prev_5: '向前 5 页',
        next_5: '向后 5 页'
    };
}


import enUS from 'antd/lib/locale-provider/en_US';
//成员的类型
var MEMBER_TYPE = {
        OWNER: 'owner',//负责人
        MANAGER: 'manager',//管理员
        USER: 'user'//成员
    }, dynamicStyle;


function noop() {
}
var MemberList = createReactClass({
    displayName: 'MemberList',
    mixins: [reactIntlMixin],

    getDefaultProps: function() {
        return {
            saveEditMember: noop,
            cancelEditMember: noop,
            addMember: noop,
            saveAddMember: noop,
            cancelAddMember: noop
        };
    },

    getInitialState: function() {
        var editMemberListState = MemberListEditStore.getState();
        return {
            ...editMemberListState,
            searchValue: '',
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj),
            saveMemberListObj: {},//修改、添加时要保存的数据对象
            memberListHeight: this.getMemberListHeight()
        };
    },

    onChange: function() {
        var editMemberListState = MemberListEditStore.getState();
        this.setState(editMemberListState);
    },

    getMemberListHeight: function() {
        let containerHeight = this.props.containerHeight;
        let memberListPaddingTop = 20;//成员列表顶部padding
        let memberListTitleHeight = 50;//成员列表顶部操作区域高度
        return containerHeight - memberListPaddingTop - memberListTitleHeight;
    },

    layout: function() {
        setTimeout(() => {
            this.setState({memberListHeight: this.getMemberListHeight()});
        });
    },

    componentDidMount: function() {
        MemberListEditStore.listen(this.onChange);
        $(window).on('resize', this.layout);
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
    },

    //获取不在任何组织内的成员列表
    getMemberList: function(currPage, pageSize) {
        var searchObj = {
            page_num: currPage,
            page_size: pageSize
        };

        if (this.state.searchValue) {
            searchObj.keyword = this.state.searchValue;
        }
        MemberListEditAction.getMemberList(searchObj);
    },

    componentWillUnmount: function() {
        MemberListEditStore.unlisten(this.onChange);
        $(window).off('resize', this.layout);
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState(this.getInitialState());
        this.setState({
            curShowTeamMemberObj: $.extend(true, {}, nextProps.curShowTeamMemberObj)
        });
    },

    selectMember: function(organizationMember) {
        //删除、编辑
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //负责人存在
        //if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.userId === organizationMember.userId) {
        //    curShowTeamMemberObj.owner.selected = !curShowTeamMemberObj.owner.selected;
        //    this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
        //    return;
        //}
        //管理员存在
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            var findManager = false;
            _.some(curShowTeamMemberObj.managers, function(member) {
                if (member && (member.userId === organizationMember.userId)) {
                    member.selected = !member.selected;
                    findManager = true;
                    return findManager;
                }
            });
            if (findManager) {
                this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
                return;
            }
        }
        //成员存在
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            let curMemberId = organizationMember.userId;
            _.some(curShowTeamMemberObj.users, function(member) {
                if (member && (member.userId === curMemberId)) {
                    member.selected = !member.selected;
                    return true;
                }
            });
            this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
        }
    },

    //还原组织成员对象
    resetCurShowTeamMemberObj: function() {
        this.setState({
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj)
        });
    },

    addMember: function() {
        if (!this.props.isAddMember) {
            this.cleanSearchInput();
            MemberListEditAction.setAddMemberPage(1);
            this.getMemberList(1, this.state.addMemberPageSize);
            OrganizationAction.getIsAddMember();
        }
    },

    editMember: function() {
        if (!this.props.isEditMember) {
            this.resetCurShowTeamMemberObj();
            OrganizationAction.getIsEditMember();
            this.cleanSearchInput();
        }
    },

    //确认的处理
    handleOK: function() {
        if (this.props.isAddMember) {
            this.saveAddMember();
        } else if (this.props.isEditMember) {
            this.saveEditMember();
        }
    },

    //取消的处理
    handleCancel: function() {
        if (this.props.isAddMember) {
            OrganizationAction.cancelAddMember();
        } else if (this.props.isEditMember) {
            OrganizationAction.cancelEditMember();
            this.resetCurShowTeamMemberObj();
        }
        this.cleanSearchInput();
    },

    //确认的处理
    saveEditMember: function() {
        var ownerId = '', userIds = [];
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //负责人
        if (curShowTeamMemberObj.owner) {
            ownerId = curShowTeamMemberObj.owner.userId;
        }

        //管理员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            curShowTeamMemberObj.managers.forEach(function(member) {
                managerIds.push(member.userId);
            });
        }

        //成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users.forEach(function(member) {
                userIds.push(member.userId);
            });
        }
        //保存修改后改组的负责人id、成员id列表、成员id列表
        var saveMemberListObj = {
            groupId: curShowTeamMemberObj.groupId,
            ownerId: ownerId,
            managerIds: JSON.stringify(managerIds),
            userIds: JSON.stringify(userIds)
        };
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(saveMemberListObj);
        this.setState({saveMemberListObj: saveMemberListObj});
        this.cleanSearchInput();
    },

    saveAddMember: function() {
        var userIds = [], selectedMemberRows = this.state.selectedMemberRows;
        if (selectedMemberRows && selectedMemberRows.length > 0) {
            userIds = _.map(selectedMemberRows, 'key');
            //从新增成员中，过滤掉该组织中已存在的负责人或成员
            let curShowTeamMemberObj = this.state.curShowTeamMemberObj || {};
            //负责人的过滤
            if (curShowTeamMemberObj.owner) {
                userIds = _.filter(userIds, userId => userId !== curShowTeamMemberObj.owner.userId);
            }
            //成员的过滤
            if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length) {
                //取出该组织中的成员id
                let curTeamUserIds = _.map(curShowTeamMemberObj.users, 'userId');
                //过滤掉该组织中已有的成员id
                userIds = _.filter(userIds, userId => curTeamUserIds.indexOf(userId) < 0);
            }
            if (userIds.length > 0) {
                //保存新增的负责人id、成员id列表
                var saveMemberListObj = {
                    groupId: this.state.curShowTeamMemberObj.groupId,
                    userIds: JSON.stringify(userIds)
                };
                MemberListEditAction.setMemberListSaving(true);
                MemberListEditAction.addMember(saveMemberListObj);
                this.setState({
                    saveMemberListObj: saveMemberListObj
                });
            } else {
                OrganizationAction.afterAddMember();
            }
            this.cleanSearchInput();
        }
    },

    createOperationBtn: function() {
        var isAddMember = this.props.isAddMember; //是否是添加状态
        var isEditMember = this.props.isEditMember;//是否是编辑状态
        var showMemberOperationBtn = this.props.showMemberOperationBtn;
        var addActiveClass = classNames('add-member-btn operation-top-btn iconfont icon-add handle-btn-item', this.props.className, {
            'active-btn': isAddMember
        });
        var editActiveClass = classNames('edit-member-btn operation-top-btn iconfont icon-update', this.props.className, {
            'active-btn': isEditMember
        });
        return (
            showMemberOperationBtn ? null :
                (<div className="operation-top-btn-div">
                    <PrivilegeChecker check="USER_ORGANIZATION_MEMBER_EDIT" className="operation-top-btn-div-label">
                        <div className={editActiveClass}
                            title={this.formatMessage(messages.organization_edit_organization_member)}
                            onClick={this.editMember}>
                        </div>
                    </PrivilegeChecker>
                    <PrivilegeChecker check="USER_ORGANIZATION_MEMBER_ADD" className="operation-top-btn-div-label">
                        <div className={addActiveClass}
                            title={this.formatMessage(messages.organization_add_organization_member)}
                            onClick={this.addMember}>
                        </div>
                    </PrivilegeChecker>
                </div>)
        );
    },

    //渲染成员头像及名称，memeber:成员信息，type:负责人/管理员/成员，hasSelectBtn:是否需要选择按钮
    renderMemberEle: function(organizationMember, type, hasSelectBtn) {
        var selectBtnClass = '';
        //只展示的成员样式
        var memberClass = 'organization-member-info';
        if (hasSelectBtn) {
            selectBtnClass = classNames('select-icon-div iconfont icon-select-member', this.props.className, {
                'select-member': organizationMember.selected
            });
            //带选择框的成员样式
            memberClass = 'operation-organization-member-info';
        }
        let userName = organizationMember.userName ? organizationMember.userName : '';
        //没有昵称时，用用户名展示
        let nickName = organizationMember.nickName ? organizationMember.nickName : userName;
        return (
            <div className={memberClass} key={organizationMember.userId}
                onClick={this.selectMember.bind(this, organizationMember)}>
                <DefaultUserLogoTitle defaultImgClass={'organization-member-info-img'}
                    userName={userName}
                    nickName={nickName}
                    userLogo={organizationMember.userLogo}
                >
                </DefaultUserLogoTitle>
                {organizationMember.status === 0 ? (
                    <div className="organization-member-stop"><ReactIntl.FormattedMessage id="common.stop"
                        defaultMessage="停用"/>
                    </div>) : null}
                {type !== MEMBER_TYPE.USER ?
                    (<span className={'iconfont icon-sale-team-' + type}/> ) : null}
                <div className="organization-member-info-name-div">
                    {hasSelectBtn ? (<div className={selectBtnClass}></div>) : null}
                    <div className="organization-member-info-name" title={nickName}>
                        {nickName}
                    </div>
                </div>
            </div>
        );
    },

    //渲染当前正在展示的组织成员列表
    renderCurTeamMemberList: function(hasSelectBtn) {
        var _this = this;
        var curShowTeamMemberObj = _this.state.curShowTeamMemberObj;
        //负责人
        var ownerElement = null;
        if (curShowTeamMemberObj.owner) {
            ownerElement = (<div className="organization-owner-container organization-member-tier">
                {_this.renderMemberEle(curShowTeamMemberObj.owner, MEMBER_TYPE.OWNER, false)}
            </div>);
        }
        //管理员
        var managersElement = null;
        if (curShowTeamMemberObj.managers) {
            managersElement = (<div className="sales-team-manager-container sales-team-member-tier">
                {curShowTeamMemberObj.managers.map(function(manager) {
                    return _this.renderMemberEle(manager, MEMBER_TYPE.MANAGER, hasSelectBtn);
                })}
            </div>);
        }
        //成员
        var usersElement = null;
        if (curShowTeamMemberObj.users) {
            usersElement = (<div className="organization-user-container organization-member-tier">
                {curShowTeamMemberObj.users.map(function(user) {
                    return _this.renderMemberEle(user, MEMBER_TYPE.USER, hasSelectBtn);
                })}
            </div>);
        }
        return (<div className="organization-members-show-div">
            {ownerElement}
            {managersElement}
            {usersElement}
        </div>);
    },

    //获取当前选择成员个数
    getSelectSize: function() {
        var selectedManagerSize = 0, selectedUserSize = 0;
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //负责人
        //if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
        //    selectedSize++;
        //}
        //管理员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            curShowTeamMemberObj.managers.forEach(function(member) {
                if (member.selected) {
                    selectedManagerSize++;
                }
            });
        }
        //成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users.forEach(function(member) {
                if (member.selected) {
                    selectedUserSize++;
                }
            });
        }
        return {
            selectedManagerSize: selectedManagerSize,
            selectedUserSize: selectedUserSize,
            selectedSize: selectedUserSize + selectedManagerSize
        };
    },

    //删除组织成员的处理
    delMember: function() {
        if (!$('#del-member-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        ////删除负责人
        //if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
        //    delete curShowTeamMemberObj.owner;
        //}
        let managerIds = [], userIds = [];
        //删除管理员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            _.each(curShowTeamMemberObj.managers, function(member) {
                if (member.selected) {
                    managerIds.push(member.userId);
                }
            });
        }
        //删除成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            _.each(curShowTeamMemberObj.users, function(member) {
                if (member.selected) {
                    userIds.push(member.userId);
                }
            });
        }
        var saveMemberListObj = {
            groupId: curShowTeamMemberObj.groupId,
            operate: 'delete'
        };
        MemberListEditAction.setMemberListSaving(true);
        if (managerIds.length) {
            saveMemberListObj.userIds = JSON.stringify(managerIds);
            saveMemberListObj.type = 'manager';
        }
        if (userIds.length) {
            saveMemberListObj.userIds = JSON.stringify(userIds);
            saveMemberListObj.type = 'user';
        }
        MemberListEditAction.editMember(saveMemberListObj);
        this.setState({saveMemberListObj: saveMemberListObj});
        this.cleanSearchInput();
    },

    //加为负责人的处理
    addOwner: function() {
        //var selectSize = this.getSelectSize();
        ////只有选择个数为一个时，可以加为负责人
        //if (selectSize !== 1) {
        //    return;
        //}
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        var oldOwner = curShowTeamMemberObj.owner;//原负责人
        var newOwner = null;//新负责人
        if (oldOwner && oldOwner.selected) {
            //当前选中要设置为负责人的就是负责人时，不做修改
            return;
        }
        //当前选中的是成员
        if (!newOwner && _.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users = _.filter(curShowTeamMemberObj.users, function(member) {
                if (member.selected) {
                    delete member.selected;
                    newOwner = member;
                } else {
                    return true;
                }
            });
        }

        //新负责人的设置
        curShowTeamMemberObj.owner = newOwner;
        this.setState({
            curShowTeamMemberObj: curShowTeamMemberObj
        });
    },

    //加为管理员的处理
    addManager: function() {
        if (!$('#set-manager-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //要加为管理员的成员列表
        var userIds = [];
        //成员转为管理员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            //成员列表中，要转为管理员的成员
            _.each(curShowTeamMemberObj.users, function(member) {
                if (member.selected) {
                    userIds.push(member.userId);
                }
            });
        }
        if (userIds.length) {
            var saveMemberListObj = {
                groupId: curShowTeamMemberObj.groupId,
                userIds: JSON.stringify(userIds),
                operate: 'exchange',
                type: 'user'
            };
            MemberListEditAction.setMemberListSaving(true);
            MemberListEditAction.editMember(saveMemberListObj);
            this.setState({saveMemberListObj: saveMemberListObj});
            this.cleanSearchInput();
        }
    },

    //加为成员的处理
    addUser: function() {
        if (!$('#set-manager-btn').hasClass('member-btn-enable')) {
            return;
        }
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //要设为成员的管理员列表
        var userIds = [];
        //管理员转为成员
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            _.each(curShowTeamMemberObj.managers, function(member) {
                if (member.selected) {
                    userIds.push(member.userId);
                }
            });
        }
        if (userIds.length) {
            var saveMemberListObj = {
                groupId: curShowTeamMemberObj.groupId,
                userIds: JSON.stringify(userIds),
                operate: 'exchange',
                type: 'manager'
            };
            MemberListEditAction.setMemberListSaving(true);
            MemberListEditAction.editMember(saveMemberListObj);
            this.setState({saveMemberListObj: saveMemberListObj});
            this.cleanSearchInput();
        }
    },

    hideSaveTooltip: function() {
        var type = this.props.isAddMember ? 'add' : 'edit';
        MemberListEditAction.clearSaveFlags(type, this.state.saveMemberListResult, this.state.saveMemberListObj);
    },

    //渲染'加为xx'按钮
    renderEditBtns: function() {
        //成员列表已选择成员的个数
        var selectSizeObj = this.getSelectSize();
        //负责人按钮样式设置
        //var addOwnerBtnCls = "add-member-btn";
        //if (selectSizeObj.selectedSize === 1) {
        //    //只选一个成员时，加为负责任按钮点击事件可用
        //    addOwnerBtnCls += " member-btn-enable";
        //} else if (selectSizeObj.selectedSize > 1) {
        //    //选择的成员个数超过1个人时，加为负责人按钮为不可用状态，负责人只有一个
        //    addOwnerBtnCls += " member-owner-disabled"
        //}

        //删除按钮样式设置
        let delMemberBtnCls = classNames('add-member-btn', {
            'member-btn-enable': selectSizeObj.selectedSize && !(selectSizeObj.selectedManagerSize && selectSizeObj.selectedUserSize)
        });

        let editMemberBtnCls = classNames('add-member-btn', {
            'member-btn-enable': selectSizeObj.selectedSize
        });

        return (<div className="set-select-member-btns">
            {this.renderSaveMsg()}
            <div id="del-member-btn" className={delMemberBtnCls} onClick={this.delMember}><ReactIntl.FormattedMessage
                id="common.delete"
                defaultMessage="删除"/>
            </div>
            {
                // <div className={addOwnerBtnCls} onClick={this.addOwner}><ReactIntl.FormattedMessage
                //    id="organization.setting.leader" defaultMessage="设为负责人"/></div>
            }

            <div id="set-manager-btn" className={editMemberBtnCls} onClick={this.addManager}><ReactIntl.FormattedMessage
                id="organization.setting.manager" defaultMessage="设为管理员"/></div>
            <div id="set-user-btn" className={editMemberBtnCls} onClick={this.addUser}><ReactIntl.FormattedMessage
                id="sales.team.add.to.member" defaultMessage="设为成员"/></div>
            <div className="add-member-btn member-btn-enable"
                onClick={this.handleCancel}><ReactIntl.FormattedMessage id="common.cancel"
                    defaultMessage="取消"/>
            </div>
        </div>);
    },

    getTableColumns: function() {
        return [
            {
                title: this.formatMessage(messages.common_username),
                dataIndex: 'userName',
                key: 'user_name',
                width: null
            },
            {
                title: this.formatMessage(messages.common_nickname),
                dataIndex: 'nickName',
                key: 'nick_name',
                width: null
            },
            {
                title: this.formatMessage(messages.common_remark),
                dataIndex: 'description',
                key: 'description',
                width: null
            }
        ];
    },

    getPagination: function() {
        var basicConfig = {
            total: this.state.addMemberTotal,
            pageSize: this.state.addMemberPageSize,
            current: this.state.addMemberPage,
            showSizeChanger: true,
            onShowSizeChange: this.onShowSizeChange,
            locale: paginationintl
        };
        var page = Math.ceil(basicConfig.total / basicConfig.pageSize);
        if (page > 10) {
            basicConfig.showQuickJumper = true;
        } else {
            basicConfig.showQuickJumper = false;
        }
        return basicConfig;
    },

    onShowSizeChange: function(current, pageSize) {
        MemberListEditAction.setAddMemberPageSize(pageSize);
        if (current * pageSize > this.state.addMemberTotal) {
            current = 1;
        }
        MemberListEditAction.setAddMemberPage(current);
        //重新发请求获取数据
        MemberListEditAction.getMemberList({
            current_page: current,
            page_size: pageSize,
            user_name: this.state.searchContent,
            nick_name: this.state.searchContent,
            description: this.state.searchContent
        });
    },

    handleTableChange: function(pagination) {
        MemberListEditAction.setAddMemberPage(pagination.current);
        this.getMemberList(pagination.current, this.state.addMemberPageSize);
    },

    getRowSelection: function() {
        return {
            type: 'checkbox',
            onSelect: function(currentRow, isSelected, allSelectedRows) {
                MemberListEditAction.setSelectedMemberRows(allSelectedRows);
            },
            onSelectAll: function(isSelectedAll, allSelectedRows) {
                MemberListEditAction.setSelectedMemberRows(allSelectedRows);
            }
        };

    },

    renderSaveMsg: function() {
        let saveResult = this.state.saveMemberListResult;
        return saveResult ?
            (<div className="indicator">
                <AlertTimer time={saveResult === 'error' ? 3000 : 600}
                    message={this.state.saveMemberListMsg}
                    type={saveResult} showIcon
                    onHide={this.hideSaveTooltip}/>
            </div>) : null;

    },

    renderAddBtns: function() {
        let enable = true;//没有选择要添加的组织成员时，不可点击添加
        if (this.props.isAddMember && this.state.selectedMemberRows.length === 0) {
            enable = false;
        }
        let sureBtnCls = classNames('operation-bottom-btn', {
            'operation-btn-enable': enable
        });
        return (<div className="operation-bottom-btn-div">
            {this.renderSaveMsg()}
            <Button type="ghost" className={sureBtnCls} onClick={this.handleOK}>
                {Intl.get('common.add', '添加')}
            </Button>
            <Button type="ghost" className="operation-bottom-btn operation-btn-enable"
                onClick={this.handleCancel}>
                {Intl.get('common.cancel', '取消')}
            </Button>
        </div>);
    },

    createMemberInfoElement: function() {
        var _this = this;
        var selectMemberListH = 0;
        let memberListContainerH = this.state.memberListHeight;
        if (_this.props.isAddMember || _this.props.isEditMember) {
            selectMemberListH = memberListContainerH - 40 - 20;//20:paddingTOP+paddingBottom,40：底部按钮的高度
        } else {
            selectMemberListH -= 20;//20：padding
        }
        var columns = this.getTableColumns();
        var pagination = this.getPagination();
        var rowSelection = hasPrivilege('USER_ORGANIZATION_MEMBER_ADD') ? this.getRowSelection() : null;
        var tbodyHeight = selectMemberListH - 86;//86:th+pagination
        dynamicStyle = insertStyle('.organization-member-add-container .ant-table-body {height:' + tbodyHeight + 'px;overflow:auto;borderBottom:none;}');

        return this.props.isAddMember ?
            (<div className="organization-member-add-container">
                <div className="organization-member-select-list organization-member-tier"
                    style={{height: selectMemberListH}}>
                    {this.state.addMemberListTipMsg ? (
                        <NoData msg={this.state.addMemberListTipMsg}/>) : (
                        <div className="add-member-table-wrap" ref="tableWrap">
                            <Table
                                loading={this.state.isLoadingAddMemberList}
                                dataSource={this.state.addMemberList}
                                rowSelection={rowSelection}
                                columns={columns}
                                pagination={pagination}
                                onChange={this.handleTableChange}
                                useFixedHeader

                            />
                        </div>)
                    }
                </div>
                {this.renderAddBtns()}
            </div>) : _this.props.isEditMember ? (
                <div className="organization-member-edit-container">
                    <div className="organization-member-select-list organization-member-tier"
                        style={{height: selectMemberListH}}>
                        {this.props.teamMemberListTipMsg ? (
                            <NoData msg={this.props.teamMemberListTipMsg}/>) : (
                            <GeminiScrollbar
                                className="geminiScrollbar-div organization-member-select-geminiScrollbar">
                                {_this.renderCurTeamMemberList(true)}
                            </GeminiScrollbar>)
                        }
                    </div>
                    {this.renderEditBtns()}
                </div>
            ) : (<div className="organization-member-show-list organization-member-tier"
                style={{height: memberListContainerH - 20}}>
                {this.props.teamMemberListTipMsg ? (
                    <NoData msg={this.props.teamMemberListTipMsg}/>) : (<GeminiScrollbar
                    className="geminiScrollbar-div organization-member-select-geminiScrollbar">
                    {_this.renderCurTeamMemberList()}
                </GeminiScrollbar>)
                }
            </div>);
    },

    onSearchInputChange: function(keyword) {
        let searchValue = _.trim(keyword);
        if (searchValue !== this.state.searchValue) {
            this.setState({searchValue: searchValue}, () => {
                this.getMemberList(1, this.state.addMemberPageSize);
            });
        }
    },

    cleanSearchInput: function() {
        this.setState({searchValue: ''});
    },

    render: function() {
        var _this = this;
        var organizationPersonnelWidth = this.props.organizationMemberWidth;
        var containerHeight = this.props.containerHeight;
        if (dynamicStyle) {
            dynamicStyle.destroy();
            dynamicStyle = null;
        }
        var title = this.state.curShowTeamMemberObj.groupName || '';
        if (this.props.isAddMember && title) {
            title = Intl.get('organization.add.member','为“{title}”添加成员',{'title': title});
        }
        return (
            <div className="organization-personnel"
                style={{height: containerHeight, width: organizationPersonnelWidth}}>
                <div className="member-top-operation-div">
                    <div className="member-top-operation-div-title">
                        {title}
                    </div>
                    { this.props.isAddMember ? (<div className="search-user-div">
                        <SearchInput
                            ref="searchInput"
                            type="input"
                            searchPlaceHolder={this.formatMessage(messages.organization_search_placeholder)}
                            searchEvent={this.onSearchInputChange}
                        />
                    </div>) : _this.createOperationBtn()}
                </div>
                <div className="member-list-div"
                    style={{height: this.state.memberListHeight}}>
                    {
                        this.props.isLoadingTeamMember ? (
                            <Spinner className="isloading"/>) : _this.createMemberInfoElement()
                    }
                </div>
                {this.state.isMemberListSaving ? (<div className="member-list-edit-block">
                    <Spinner className="isloading"/>
                </div>) : ''}
            </div>
        );
    },
});
module.exports = injectIntl(MemberList);
