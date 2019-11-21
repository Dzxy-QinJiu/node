/**
 * Created by xiaojinfeng on 2016/04/11.
 */
import {Icon,Button, Popover} from 'antd';
import commonMethodUtil from '../../../../public/sources/utils/common-method-util';
var classNames = require('classnames');
var GroupFrom = require('./edit-group-form');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var AlertTimer = require('../../../../components/alert-timer');
import {SearchInput} from 'antc';
const SalesTeamAction = require('../action/sales-team-actions');
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import Trace from 'LIB_DIR/trace';
import privilegeConfig_industry from 'MOD_DIR/industry/public/privilege-config';
const TAB_HAED_HEIGHT = 40; // tabs 头部高度

function noop() {
}

class LeftTree extends React.Component {
    static defaultProps = {
        getSalesTeamMemberList: noop
    };

    showOperationArea = (item) => {
        SalesTeamAction.showOperationArea(item);
    };

    editGroup = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('ul.left-tree-ul .tree-operation-div .icon-update'),'编辑子部门');
        SalesTeamAction.editGroup(item);
    };

    addGroup = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('ul.left-tree-ul .tree-operation-div .icon-add handle-btn-item'),'添加子部门');
        SalesTeamAction.addGroup(item);
    };

    deleteGroup = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('ul.left-tree-ul .tree-operation-div .icon-delete'),'删除子团队');
        SalesTeamAction.deleteGroup(item);
    };

    cancelEditGroup = (item) => {
        if (item && item.isEditGroup) {
            SalesTeamAction.cancelEditGroup(item);
        } else {
            SalesTeamAction.cancelAddGroup(item);
            setTimeout(() => $('.sales-team-search-input-container .search-input').val(this.props.searchContent));
        }
    };

    bodyClickFun = (e) => {
        let target = e.target;
        if (this.refs.operationElement && !$.contains(this.refs.operationElement, target)) {
            SalesTeamAction.hideAllOperationArea();
        }
    };

    bindEvent = () => {
        $('body').on('click', this.bodyClickFun);
    };

    unbindEvent = () => {
        $('body').off('click', this.bodyClickFun);
    };

    componentDidMount() {
        this.bindEvent();
    }

    componentWillUnmount() {
        this.unbindEvent();
    }

    toggleGroupTree = (item, event) => {
        Trace.traceEvent(event,'打开或者关闭子列表');
        event.stopPropagation();
        let groupId = item.key;
        if (item.isEditGroup || item.isAddGroup) {
            return;
        }

        if (event.target.className.indexOf('tree-operation-icon') !== -1
            || event.target.className.indexOf('tree-operation-btn-div-item') !== -1
            || event.target.className.indexOf('icon-operation') !== -1
            || event.target.className.indexOf('operation-btn-item-span') !== -1
            || event.target.className.indexOf('tree-operation-btn-div') !== -1) {
            return;
        }
        SalesTeamAction.toggleGroupTree(groupId);
    };

    onSelectGroup = (item, event) => {
        event.stopPropagation();

        if (item.isEditGroup || item.isAddGroup) {
            return;
        }

        if (event.target.className.indexOf('tree-operation-icon') !== -1
            || event.target.className.indexOf('tree-operation-btn-div-item') !== -1
            || event.target.className.indexOf('icon-operation') !== -1
            || event.target.className.indexOf('operation-btn-item-span') !== -1
            || event.target.className.indexOf('tree-operation-btn-div') !== -1) {
            return;
        }
        //如果正在打开其他团队成员列表
        if (this.props.isLoadingTeamMember) {
            return;
        }
        let groupId = item.key;
        SalesTeamAction.selectTree(groupId);
        SalesTeamAction.setTeamMemberLoading(true);
        //获取销售目标
        SalesTeamAction.getSalesGoals(groupId);
        SalesTeamAction.getSalesTeamMemberList(groupId);
        SalesTeamAction.setSelectSalesTeamGroup(groupId);
    };

    hideModalDialog = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'),'隐藏模态框');
        SalesTeamAction.hideModalDialog(this.props.deleteGroupItem);
    };

    saveDeleteGroup = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-dialog .modal-footer'),'确定删除某团队');
        SalesTeamAction.saveDeleteGroup(this.props.deleteGroupItem.key);
    };

    operationElement = (item) => {
        return (
            <div className="tree-operation-btn-div" ref="operationElement">
                <PrivilegeChecker check="BGM_SALES_TEAM_EDIT">
                    <div className="tree-operation-btn-div-item" onClick={this.editGroup.bind(this, item)}>
                        <span className="icon-operation iconfont icon-update">
                        </span>
                        <span className="operation-btn-item-span"><ReactIntl.FormattedMessage id="common.update"
                            defaultMessage="修改"/></span>
                    </div>
                </PrivilegeChecker>
                <PrivilegeChecker check="BGM_SALES_TEAM_DELETE">
                    <div className="tree-operation-btn-div-item" onClick={this.deleteGroup.bind(this, item)}>
                        <span className="icon-operation iconfont icon-delete handle-btn-item">
                        </span>
                        <span className="operation-btn-item-span"><ReactIntl.FormattedMessage id="common.delete"
                            defaultMessage="删除"/></span>
                    </div>
                </PrivilegeChecker>
            </div>
        );
    };

    // 添加子团队、编辑子团队、删除子团队, type：true含有子部门， false是最底层的部门
    // 只有最底层部门有删除功能，因为删除部门的接口只支持删除最底层的部门
    renderOperateChildTeam = (item, type) => {
        return (
            <div className="tree-operation-div">
                <PrivilegeChecker check="BGM_SALES_TEAM_ADD">
                    <div className="tree-operation-item-zone icon-operation tree-operation-icon"
                        onClick={this.addGroup.bind(this, item)}
                    >
                        <i className='iconfont icon-add handle-btn-item'></i>
                        <span className='operation-item-text'>
                            {Intl.get('member.team.add.child.department', '添加子部门')}
                        </span>
                    </div>
                </PrivilegeChecker>
                <PrivilegeChecker check="BGM_SALES_TEAM_EDIT">
                    <div className="tree-operation-item-zone icon-operation tree-operation-icon"
                        onClick={this.editGroup.bind(this, item)}
                    >
                        <i className='iconfont icon-update'></i>
                        <span className='operation-item-text'>
                            {Intl.get('organization.edit.department', '编辑部门')}
                        </span>
                    </div>
                </PrivilegeChecker>
                {
                    type ? null : (
                        <PrivilegeChecker check="BGM_SALES_TEAM_DELETE">
                            <div className="tree-operation-item-zone icon-operation tree-operation-icon"
                                onClick={this.deleteGroup.bind(this, item)}
                            >
                                <i className='iconfont icon-delete handle-btn-item'></i>
                                <span className='operation-item-text'>
                                    {Intl.get('organization.del.department', '删除部门')}
                                </span>
                            </div>
                        </PrivilegeChecker>
                    )
                }
            </div>
        );
    };

    // 处理鼠标移入
    handleMouseEnterItemLine = (item, event) => {
        event.stopPropagation();
        let isShowPopOver = this.props.isShowPopOver;
        SalesTeamAction.handleMouseEnterItemLine({item, isShowPopOver});
    };
    // 处理鼠标移出
    handleMouseLeaveTreeZone = (event) => {
        event.stopPropagation();
        if (!this.props.isShowPopOver) {
            SalesTeamAction.handleMouseLeaveTreeZone();
        }
    };
    // 处理鼠标悬停更多按钮
    handleMouseHoverMoreBtn = () => {
        SalesTeamAction.handleMouseHoverMoreBtn();
    };
    // 处理popover浮层的显示
    handlePopOverVisible = (flag) => {
        SalesTeamAction.handlePopOverVisible(flag);
    };

    // 确认删除部门
    handleDeleteGroup = (item) => {
        SalesTeamAction.saveDeleteGroup(_.get(item, 'key'));
    };

    // 取消删除部门
    handleCancelDeleteGroup = (item) => {
        SalesTeamAction.handleCancelDeleteGroup(item);
    };

    // 渲染添加根部门
    renderOperateRootDepartment = (item) => {
        return (
            <div className="tree-operation-div">
                <PrivilegeChecker check="BGM_SALES_TEAM_ADD">
                    <div
                        className="tree-operation-item-zone icon-operation tree-operation-icon"
                        onClick={this.handleAddRootDepartment}
                    >
                        <i className='iconfont icon-add handle-btn-item'></i>
                        <span className='operation-item-text'>
                            {Intl.get('organization.add.department', '添加部门')}
                        </span>
                    </div>
                </PrivilegeChecker>
                <PrivilegeChecker check={privilegeConfig_industry.ORGANIZATION_CONFIG}>
                    <div className="tree-operation-item-zone icon-operation tree-operation-icon"
                        onClick={this.editGroup.bind(this, item)}
                    >
                        <i className='iconfont icon-update'></i>
                        <span className='operation-item-text'>
                            {Intl.get('organization.edit.organization', '编辑组织')}
                        </span>
                    </div>
                </PrivilegeChecker>
            </div>
        );
    };

    handleAddRootDepartment = () => {
        SalesTeamAction.addSalesTeamRoot();
    };

    element = (item, type) => {
        //团队人数的统计(递归计算该团队及所有子团队的人数)
        let organizationId = _.get(getOrganization(), 'id', '');
        let teamMemberCount = commonMethodUtil.getTeamMemberCount(item, 0, this.props.teamMemberCountList, false);
        let isShowMoreBtn = this.props.mouseZoneHoverKey === item.key; // 是否显示更多按钮
        let isAddGroup = _.get(item, 'isAddGroup', false);
        let isEditGroup = _.get(item, 'isEditGroup', false);
        let isDeleteGroup = _.get(item, 'isDeleteGroup', false);
        let groupCls = classNames('sales-team-group-info', {
            'sale-team-add-group': isAddGroup
        });
        let treeItemContainerCls = classNames('sale-team-tree-item-container', {
            'sale-team-detele-item-group': isDeleteGroup
        });
        let groupName = item.title;
        let groupId = item.key;
        if (groupId === organizationId) {
            // 编辑组织，增加标识，为了区分是组织还是部门，
            item.isOrganizationFlag = true;
        }
        return (
            <div
                className="left-tree-item-container"
                onMouseEnter={this.handleMouseEnterItemLine.bind(this, item)}
            >
                {
                    groupId === organizationId ? (
                        <div className='member-info'>
                            <div className='member-info-name'>
                                <span className="sales-team-name-text">{groupName}</span>
                                {
                                    this.props.isAddSalesTeamRoot ? (
                                        <div className="group-form-div group-form-no-superior">
                                            <GroupFrom
                                                cancelSalesTeamForm={this.cancelEditGroup}
                                                isAddRoot={true}
                                                salesTeamList={this.props.salesTeamList}
                                            >
                                            </GroupFrom>
                                        </div>
                                    ) : (
                                        isShowMoreBtn ? (
                                            <Popover
                                                overlayClassName="sales-organization-department-popover"
                                                content={this.renderOperateRootDepartment(item)}
                                                placement="bottomRight"
                                                onVisibleChange={this.handlePopOverVisible}
                                                visible={this.props.isShowPopOver}
                                            >
                                                <span
                                                    className='iconfont icon-more'
                                                    onMouseOver={this.handleMouseHoverMoreBtn}
                                                ></span>
                                            </Popover>) : (
                                            <span className="member-statistic">
                                                {Intl.get('sales.team.member.count', '{teamMemberCount}人', {teamMemberCount: this.props.memberCount})}
                                            </span>
                                        )
                                    )
                                }
                            </div>
                        </div>
                    ) : (
                        <div className={treeItemContainerCls}>
                            <div className="left-tree-arrow" onClick={this.toggleGroupTree.bind(this, item)}>
                                {
                                    type ?
                                        (
                                            <span>
                                                {
                                                    item.isLiSelect ? (
                                                        < span className="icon-tree-arrow iconfont icon-tree-down-arrow"></span>
                                                    ) : (
                                                        <span className="icon-tree-arrow iconfont icon-tree-right-arrow"></span>
                                                    )}
                                            </span>
                                        )
                                        : (
                                            <span className="icon-tree-arrow iconfont tree-icon-disc"></span>
                                        )
                                }
                            </div>
                            <div className={groupCls}>
                                <div className='sales-team-group-name'>
                                    <span className="sales-team-name-text">{groupName}</span>
                                    {
                                        isAddGroup ? (
                                            <div>
                                                {this.renderAddOrEditGroup(item)}
                                            </div>
                                        ) : (
                                            isShowMoreBtn && !isAddGroup && !isEditGroup && !isDeleteGroup ? (
                                                <Popover
                                                    overlayClassName="sales-organization-department-popover"
                                                    content={this.renderOperateChildTeam(item, type)}
                                                    placement="bottomRight"
                                                    onVisibleChange={this.handlePopOverVisible}
                                                    visible={this.props.isShowPopOver}
                                                >
                                                    <span
                                                        className='iconfont icon-more'
                                                        onMouseOver={this.handleMouseHoverMoreBtn}
                                                    ></span>
                                                </Popover>
                                            ) : (
                                                isDeleteGroup ? (
                                                    <div className='sale-team-delete-group'>
                                                        <span
                                                            className='delete-group'
                                                            onClick={this.handleDeleteGroup.bind(this, item)}
                                                        >
                                                            {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                                        </span>
                                                        <span
                                                            className='cancel-delete'
                                                            onClick={this.handleCancelDeleteGroup.bind(this, item)}
                                                        >
                                                            {Intl.get('common.cancel', '取消')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="sales-team-member-statistic">
                                                        {Intl.get('sales.team.member.count', '{teamMemberCount}人', {teamMemberCount: teamMemberCount})}
                                                    </span>
                                                )
                                            )
                                        )
                                    }

                                </div>
                            </div>
                        </div>
                    )
                }
            </div>);
    };

    // 渲染添加子部门或是编辑部门
    renderAddOrEditGroup = (item) => {
        let formClass = 'group-form-div';
        let superiorTeam = _.get(item, 'superiorTeam');
        if (!superiorTeam || item.isAddGroup) {
            //没有上级团队的样式设置，高度去掉上级团队的一行
            formClass += ' group-form-no-superior';
        }
        if (this.props.isEditGroupFlag) {
            formClass += ' group-form-edit-group';
        }
        return (
            <div className={formClass}>
                <GroupFrom
                    cancelSalesTeamForm={this.cancelEditGroup.bind(this,item )}
                    salesTeam={item}
                    salesTeamList={this.props.salesTeamList}
                >
                </GroupFrom>
            </div>
        );
    };


    treeElement = (btnClass, item, type) => {
        if (!type) {
            btnClass += ' no-has-children';
        }

        return (
            <div className={btnClass} onClick={this.onSelectGroup.bind(this, item )}>
                {this.element(item, type)}
            </div>
        );
    };

    hideDelTooltip = () => {
        SalesTeamAction.clearDelTeamErrorMsg();
    };

    //搜索团队的事件处理
    searchEvent = (searchContent) => {
        searchContent = _.trim(searchContent);
        if (searchContent) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.sales-team-root-add .search-input-container input'),'跟据团队名称搜索团队');
            //搜索内容的设置
            SalesTeamAction.setSearchContent(searchContent);
            //根据团队名称进行搜索
            SalesTeamAction.filterByTeamName(searchContent);
        } else if (this.props.searchContent) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.sales-team-root-add .search-input-container input'),'清空搜索内容');
            //清空搜索条件时，还原所有团队及团队关系
            SalesTeamAction.resetSearchSalesTeam();
            //清空搜索内容
            SalesTeamAction.setSearchContent('');
        }
    };

    addSalesTeamRoot = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('ul.left-tree-ul .tree-operation-div .icon-add handle-btn-item'),'添加部门');
        SalesTeamAction.addSalesTeamRoot();
    };

    render() {
        let salesTeamGroupList = this.props.salesTeamGroupList;

        const loop = data => _.map(data, (item) => {
            let btnClass = classNames('sales-team-group-name-div', this.props.className, {
                'select': item.select,
                'show-tree-operation': item.isShowOperationArea
            });
            let liClass = classNames('sales-team-group-li', this.props.className, {
                'isLiSelect': item.isLiSelect
            });

            if (item.children) {
                return (
                    <li key={item.key} className={liClass}>
                        {
                            this.treeElement(btnClass, item, true)
                        }
                        <ul className="left-tree-children-ul">{loop(item.children)}</ul>
                    </li>
                );
            }
            return (
                <li key={item.key} className="sales-team-group-li">
                    {
                        this.treeElement(btnClass, item, false)
                    }
                </li>
            );
        });
        let scrollHeight = this.props.containerHeight;
        if (this.props.isAddSalesTeamRoot) {
            scrollHeight -= 60;//60:添加根团队form表单的高度
        } else {
            scrollHeight -= 40;//40：添加根团队按钮的高度
        }
        return (
            <div className="sales-team-group"
                style={{height: this.props.containerHeight - TAB_HAED_HEIGHT}}
                data-tracename="部门列表"
            >
                <div className="sales-team-tree-container" style={{height: scrollHeight}} data-tracename="团队列表">
                    <GeminiScrollbar
                        className="geminiScrollbar-vertical"
                    >
                        <ul
                            className="left-tree-ul"
                            onMouseLeave={this.handleMouseLeaveTreeZone}
                        >
                            {
                                this.props.isEditGroupFlag ? (
                                    this.renderAddOrEditGroup(this.props.curEditGroup)
                                ) : (
                                    loop(salesTeamGroupList)
                                )
                            }
                        </ul>
                    </GeminiScrollbar>
                    {
                        this.props.delTeamErrorMsg ? (
                            <AlertTimer
                                time={2000}
                                message={this.props.delTeamErrorMsg}
                                type='error' showIcon
                                onHide={this.hideDelTooltip}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}
LeftTree.propTypes = {
    searchContent: PropTypes.string,
    isLoadingTeamMember: PropTypes.bool,
    deleteGroupItem: PropTypes.object,
    teamMemberCountList: PropTypes.array,
    salesTeamList: PropTypes.array,
    salesTeamGroupList: PropTypes.array,
    containerHeight: PropTypes.number,
    isAddSalesTeamRoot: PropTypes.bool,
    delTeamErrorMsg: PropTypes.string,
    className: PropTypes.string,
    memberCount: PropTypes.number,
    isEditGroupFlag: PropTypes.bool,
    curEditGroup: PropTypes.string,
    mouseZoneHoverKey: PropTypes.string,
    isShowPopOver: PropTypes.bool,
    getSelectedDepartmentId: PropTypes.func
};
module.exports = LeftTree;
