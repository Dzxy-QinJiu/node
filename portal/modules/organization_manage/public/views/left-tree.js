/**
 * Created by wangliping on 2016/10/18.
 */
var React = require('react');
var createReactClass = require('create-react-class');
import {Icon,Button} from 'antd';
var classNames = require('classnames');
var GroupFrom = require('./edit-organization-form');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var ModalDialog = require('../../../../components/ModalDialog');
var AlertTimer = require('../../../../components/alert-timer');
import {SearchInput} from 'antc';
var OrganizationAction = require('../action/organization-actions');
import {FormattedMessage, defineMessages, injectIntl} from 'react-intl';
import reactIntlMixin from '../../../../components/react-intl-mixin';
import commonMethodUtil from '../../../../public/sources/utils/common-method-util';
const CATEGORY_TYPE = oplateConsts.CATEGORY_TYPE;
const messages = defineMessages({
    organization_add_child_organization: {id: 'organization.add.child.organization'},//添加子组织
    organization_edit_organization: {id: 'organization.edit.organization'},//编辑组织
    organization_del_organization: {id: 'organization.del.organization'},//删除组织
    organization_whether_del_organization: {id: 'organization.whether.del.organization'},//是否删除此组织
    organization_search_organization_placeholder: {id: 'organization.search.organization.placeholder'},//根据 组织名称 搜索组织

});
function noop() {
}

var LeftTree = createReactClass({
    displayName: 'LeftTree',
    mixins: [reactIntlMixin],

    getDefaultProps: function() {
        return {
            getOrganizationMemberList: noop
        };
    },

    showOperationArea: function(item) {
        OrganizationAction.showOperationArea(item);
    },

    editGroup: function(item) {
        OrganizationAction.editGroup(item);
    },

    addGroup: function(item) {
        OrganizationAction.addGroup(item);
    },

    deleteGroup: function(item) {
        OrganizationAction.deleteGroup(item);
    },

    cancelOrganizationForm: function(item) {
        if (item && item.isEditGroup) {
            OrganizationAction.cancelEditGroup(item);
        } else {
            OrganizationAction.cancelAddGroup(item);
            setTimeout(() => $('.organization-search-input-container .search-input').val(this.props.searchContent));
        }
    },

    bodyClickFun: function(e) {
        var target = e.target;
        if (this.refs.operationElement && !$.contains(this.refs.operationElement, target)) {
            OrganizationAction.hideAllOperationArea();
        }
    },

    bindEvent: function() {
        $('body').on('click', this.bodyClickFun);
    },

    unbindEvent: function() {
        $('body').off('click', this.bodyClickFun);
    },

    componentDidMount: function() {
        this.bindEvent();
    },

    componentWillUnmount: function() {
        this.unbindEvent();
    },

    toggleGroupTree: function(item, event) {
        event.stopPropagation();
        var groupId = item.key;
        if (item.isEditGroup || item.isAddGroup) {
            return;
        }

        if (event.target.className.indexOf('tree-operation-icon') != -1
            || event.target.className.indexOf('tree-operation-btn-div-item') != -1
            || event.target.className.indexOf('icon-operation') != -1
            || event.target.className.indexOf('operation-btn-item-span') != -1
            || event.target.className.indexOf('tree-operation-btn-div') != -1) {
            return;
        }
        OrganizationAction.toggleGroupTree(groupId);
    },

    onSelectGroup: function(item, event) {
        event.stopPropagation();

        if (item.isEditGroup || item.isAddGroup) {
            return;
        }

        if (event.target.className.indexOf('tree-operation-icon') != -1
            || event.target.className.indexOf('tree-operation-btn-div-item') != -1
            || event.target.className.indexOf('icon-operation') != -1
            || event.target.className.indexOf('operation-btn-item-span') != -1
            || event.target.className.indexOf('tree-operation-btn-div') != -1) {
            return;
        }
        //如果正在打开其他组织成员列表
        if (this.props.isLoadingTeamMember) {
            return;
        }
        var groupId = item.key;
        OrganizationAction.selectTree(groupId);
        OrganizationAction.setTeamMemberLoading(true);
        OrganizationAction.getOrganizationMemberList(groupId);
        OrganizationAction.setSelectOrganizationGroup(groupId);
    },

    hideModalDialog: function() {
        OrganizationAction.hideModalDialog(this.props.deleteGroupItem);
    },

    saveDeleteGroup: function() {
        OrganizationAction.saveDeleteGroup(this.props.deleteGroupItem.key);
    },

    hideDelTooltip: function() {
        OrganizationAction.clearDelGroupErrorMsg();
    },

    addOrganizationRoot: function() {
        OrganizationAction.addOrganizationRoot();
    },

    operationElement: function(item) {
        return (
            <div className="tree-operation-btn-div" ref="operationElement">
                <PrivilegeChecker check="USER_ORGANIZATION_EDIT">
                    <div className="tree-operation-btn-div-item" onClick={this.editGroup.bind(this, item)}>
                        <span className="icon-operation iconfont icon-update">
                        </span>
                        <span className="operation-btn-item-span">
                            <ReactIntl.FormattedMessage id="common.update" defaultMessage="修改"/>
                        </span>
                    </div>
                </PrivilegeChecker>
                <PrivilegeChecker check="USER_ORGANIZATION_DELETE">
                    <div className="tree-operation-btn-div-item" onClick={this.deleteGroup.bind(this, item)}>
                        <span className="icon-operation iconfont icon-delete handle-btn-item">
                        </span>
                        <span className="operation-btn-item-span">
                            <ReactIntl.FormattedMessage id="common.delete" defaultMessage="删除"/>
                        </span>
                    </div>
                </PrivilegeChecker>
            </div>
        );
    },

    element: function(item, type) {
        let iconflag = <i className="iconfont icon-zuzhi" title={Intl.get('user.organization','组织')}></i>;
        if (item.category == CATEGORY_TYPE.DEPARTMENT) {
            iconflag = <i className="iconfont icon-bumen" title={Intl.get('crm.113','部门')}></i>;
        } else if (item.category == CATEGORY_TYPE.TEAM){
            iconflag = <i className="iconfont icon-team" title={Intl.get('call.record.team','团队')}></i>;
        }

        //组织人数的统计,递归遍历组织，加上所有子组织的人数
        var groupMemberCount = commonMethodUtil.getTeamMemberCount(item);
        return (
            <div className="left-tree-item-container">
                <div className="left-tree-arrow" onClick={this.toggleGroupTree.bind(this, item)}>
                    {
                        type ?
                            (<span>
                                {item.isLiSelect ? (< span className="icon-tree-arrow iconfont icon-tree-arrow-open">
                                </span>) : (<span className="icon-tree-arrow iconfont icon-tree-arrow-close">
                                </span>)}
                            </span>)
                            : null
                    }
                </div>
                <div className="organization-group-info">
                    <div className="organization-group-name" title={item.title}>
                        <span className="organization-name-icon">{iconflag}</span>
                        <span className="organization-name-text">{item.title}</span>
                        <span className="organization-member-statistic"> ({groupMemberCount}人)</span>
                    </div>
                    <div className="tree-operation-div">
                        {//团队下没有字团队，因此，团队上没有添加按钮
                            item.category == CATEGORY_TYPE.TEAM ? null :
                                <PrivilegeChecker check="USER_ORGANIZATION_ADD">
                                    <span className="icon-operation iconfont icon-add tree-operation-icon handle-btn-item"
                                        title={item.category == CATEGORY_TYPE.DEPARTMENT ? Intl.get('organization.add.department','添加部门') : Intl.get('common.add','添加')}
                                        onClick={this.addGroup.bind(this, item)}/>
                                </PrivilegeChecker>
                        }
                        <PrivilegeChecker check="USER_ORGANIZATION_EDIT">
                            <span className="icon-operation iconfont icon-update tree-operation-icon"
                                title={item.category == CATEGORY_TYPE.DEPARTMENT ? Intl.get('organization.edit.department','编辑部门') : item.category == CATEGORY_TYPE.TEAM ? Intl.get('organization.edit.team','编辑团队') : Intl.get('organization.edit.organization','编辑组织')}
                                onClick={this.editGroup.bind(this, item)}/>
                        </PrivilegeChecker>
                        <PrivilegeChecker check="USER_ORGANIZATION_DELETE">
                            <span className="icon-operation iconfont icon-delete tree-operation-icon  handle-btn-item"
                                title={item.category == CATEGORY_TYPE.DEPARTMENT ? Intl.get('organization.del.department','删除部门') : item.category == CATEGORY_TYPE.TEAM ? Intl.get('organization.del.team','删除团队') : Intl.get('organization.del.organization','删除组织')}
                                onClick={this.deleteGroup.bind(this, item)}/>
                        </PrivilegeChecker>
                    </div>
                </div>

            </div>);
    },

    treeElement: function(btnClass, item, type) {

        if (!type) {
            btnClass += ' no-has-children';
        }
        let isMinusHeight = true;//是否减高度
        let parentGroup;//上级(修改部门时需要通过上级判断是否可以修改上级部门)
        //组织下添加团队/部门时，需要展示单选框，所以不需要减高
        if (item.isAddGroup && item.category == CATEGORY_TYPE.ORGANIZATION) {
            isMinusHeight = false;
        } else if (item.isEditGroup && item.category == CATEGORY_TYPE.DEPARTMENT) {//修改的是部门
            if (item.superiorTeam) {
                parentGroup = _.find(this.props.organizationList, (group) => group.group_id == item.superiorTeam);
                // 并且上级也是部门时，可以修改上级部门，所以不需要减高
                if (parentGroup.category == CATEGORY_TYPE.DEPARTMENT) {
                    isMinusHeight = false;
                }
            }
        }
        var formClass = classNames('group-form-div', {
            'group-form-no-superior': isMinusHeight
        });
        return (
            item.isEditGroup || item.isAddGroup ? (
                <div className={formClass}>
                    <div className="item-border-style"></div>
                    <GroupFrom
                        cancelOrganizationForm={this.cancelOrganizationForm.bind(this,item )}
                        organization={item}
                        parentGroup={parentGroup}
                        organizationList={this.props.organizationList}
                    >
                    </GroupFrom>
                </div>
            ) : (<div className={btnClass} onClick={this.onSelectGroup.bind(this, item )}>
                <div className="item-border-style"></div>
                { this.element(item, type) }
            </div>)
        );
    },

    //隐藏搜索框
    clearSearchInput: function() {
        OrganizationAction.setSearchContent('');
        OrganizationAction.resetSearchOrganization();
        $('.organization-search-input-container .search-input').val('');
    },

    //搜索组织的事件处理
    searchEvent: function(searchContent) {
        searchContent = _.trim(searchContent);
        if (searchContent) {
            //搜索内容的设置
            OrganizationAction.setSearchContent(searchContent);
            //根据组织名称进行搜索
            OrganizationAction.filterByOrganizationName(searchContent);
        } else if (this.props.searchContent) {
            //清空搜索框时的处理
            //清空根据组织名称进行搜索的搜索条件时，还原所有组织及组织关系
            OrganizationAction.resetSearchOrganization();
            //清空搜索内容
            OrganizationAction.setSearchContent('');
        }
    },

    render: function() {
        var _this = this;
        var organizationGroupList = this.props.organizationGroupList;

        const loop = data => data.map((item) => {

            var btnClass = classNames('organization-group-name-div', _this.props.className, {
                'select': item.select,
                'show-tree-operation': item.isShowOperationArea
            });
            var liClass = classNames('organization-group-li', _this.props.className, {
                'isLiSelect': item.isLiSelect
            });

            if (item.children) {
                return (
                    <li key={item.key} title={item.title} className={liClass}>
                        {
                            _this.treeElement(btnClass, item, true)
                        }
                        <ul className="left-tree-children-ul">{loop(item.children)}</ul>
                    </li>
                );
            }
            return (
                <li key={item.key} className="organization-group-li">
                    {
                        _this.treeElement(btnClass, item, false)
                    }
                </li>
            );
        });
        var modalContent = Intl.get('organization.whether.del.organization', '确定要删除\'{groupName}\'？', {groupName: this.props.deleteGroupItem.title});
        var scrollHeight = this.props.containerHeight;
        if (this.props.isAddOrganizationRoot) {
            scrollHeight -= 60;//60:添加根组织form表单的高度
        } else {
            scrollHeight -= 40;//40：添加根组织按钮的高度
        }
        return (
            <div className="organization-group" style={{height: this.props.containerHeight}}>
                <div className="organization-root-add item-border-style">
                    {this.props.isAddOrganizationRoot ? (
                        <div className="group-form-div group-form-no-superior">
                            <GroupFrom
                                cancelOrganizationForm={this.cancelOrganizationForm}
                                isAddRoot={true}
                                organizationList={this.props.organizationList}
                            >
                            </GroupFrom>
                        </div>) : (<div>
                        <div className="organization-search-input-container">
                            <SearchInput
                                searchPlaceHolder={this.formatMessage(messages.organization_search_organization_placeholder)}
                                searchEvent={this.searchEvent}/>

                        </div>
                        <div className="add-root-organization-btn"
                            title={Intl.get('organization.add.organization', '添加组织')}
                            onClick={this.addOrganizationRoot}>
                            <span className="iconfont icon-add handle-btn-item"/>
                        </div>
                    </div>)
                    }
                </div>
                <div className="organization-tree-container" style={{height: scrollHeight}}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <ul className="left-tree-ul">
                            {loop(organizationGroupList)}
                        </ul>
                    </GeminiScrollbar>
                    <ModalDialog modalContent={modalContent}
                        modalShow={this.props.deleteGroupItem.modalDialogFlag}
                        container={this}
                        hideModalDialog={this.hideModalDialog}
                        delete={this.saveDeleteGroup}
                    />
                    {this.props.delOrganizationErrorMsg ? (<AlertTimer time={2000}
                        message={this.props.delOrganizationErrorMsg}
                        type='error' showIcon
                        onHide={this.hideDelTooltip}/>) : null}
                </div>
            </div>
        );
    },
});
module.exports = injectIntl(LeftTree);
