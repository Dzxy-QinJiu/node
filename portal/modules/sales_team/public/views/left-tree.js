/**
 * Created by xiaojinfeng on 2016/04/11.
 */
var React = require('react');
import {Icon,Button} from 'antd';
import commonMethodUtil from '../../../../public/sources/utils/common-method-util';
var classNames = require('classnames');
var GroupFrom = require('./edit-group-form');
var PrivilegeChecker = require('../../../../components/privilege/checker').PrivilegeChecker;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var ModalDialog = require('../../../../components/ModalDialog');
var AlertTimer = require('../../../../components/alert-timer');
import {SearchInput} from 'antc';
var SalesTeamAction = require('../action/sales-team-actions');
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import Trace from 'LIB_DIR/trace';

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
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('ul.left-tree-ul .tree-operation-div .icon-update'),'编辑子团队');
        SalesTeamAction.editGroup(item);
    };

    addGroup = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('ul.left-tree-ul .tree-operation-div .icon-add'),'增加子团队');
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
        var target = e.target;
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
        var groupId = item.key;
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
        var groupId = item.key;
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
                        <span className="icon-operation iconfont icon-delete">
                        </span>
                        <span className="operation-btn-item-span"><ReactIntl.FormattedMessage id="common.delete"
                            defaultMessage="删除"/></span>
                    </div>
                </PrivilegeChecker>
            </div>
        );
    };

    element = (item, type) => {
        //团队人数的统计(递归计算该团队及所有子团队的人数)
        let organizationName = _.get(getOrganization(), 'name', '');
        let organizationId = _.get(getOrganization(), 'id', '');
        let teamMemberCount = commonMethodUtil.getTeamMemberCount(item, 0, this.props.teamMemberCountList, false);
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
                <div className="sales-team-group-info">
                    <div className="sales-team-group-name" title={item.title}>
                        <span className="sales-team-name-text">{item.title}</span>
                        <span className="sales-team-member-statistic">
                            <span>(</span>
                            <ReactIntl.FormattedMessage
                                id="sales.team.member.count"
                                defaultMessage={'{teamMemberCount}人'}
                                values={{
                                    'teamMemberCount': teamMemberCount
                                }}
                            />
                            <span>)</span>
                        </span>
                    </div>
                    {
                        item.title === organizationName && item.key === organizationId ? null : (
                            <div className="tree-operation-div">
                                <PrivilegeChecker check="BGM_SALES_TEAM_ADD">
                                    <span className="icon-operation iconfont icon-add tree-operation-icon"
                                        title={Intl.get('sales.team.add.child.team', '添加子团队')}
                                        onClick={this.addGroup.bind(this, item)}
                                    />
                                </PrivilegeChecker>
                                <PrivilegeChecker check="BGM_SALES_TEAM_EDIT">
                                    <span className="icon-operation iconfont icon-update tree-operation-icon"
                                        title={Intl.get('sales.team.edit.team', '编辑团队')}
                                        onClick={this.editGroup.bind(this, item)}
                                    />
                                </PrivilegeChecker>
                                <PrivilegeChecker check="BGM_SALES_TEAM_DELETE">
                                    <span className="icon-operation iconfont icon-delete tree-operation-icon"
                                        title={Intl.get('sales.team.del.team', '删除团队')}
                                        onClick={this.deleteGroup.bind(this, item)}
                                    />
                                </PrivilegeChecker>
                            </div>
                        )
                    }
                </div>

            </div>);
    };

    treeElement = (btnClass, item, type) => {

        if (!type) {
            btnClass += ' no-has-children';
        }

        var formClass = 'group-form-div';
        if (!item.superiorTeam || item.isAddGroup) {
            //没有上级团队的样式设置，高度去掉上级团队的一行
            formClass += ' group-form-no-superior';
        }
        return (
            item.isEditGroup || item.isAddGroup ? (
                <div className={formClass}>
                    <div className="item-border-style"></div>
                    <GroupFrom
                        cancelSalesTeamForm={this.cancelEditGroup.bind(this,item )}
                        salesTeam={item}
                        salesTeamList={this.props.salesTeamList}
                    >
                    </GroupFrom>
                </div>
            ) : (
                <div className={btnClass} onClick={this.onSelectGroup.bind(this, item )}>
                    <div className="item-border-style"></div>
                    {
                        this.element(item, type)
                    }
                </div>
            )
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

    addSalesTeamRoot = (e) => {
        Trace.traceEvent(e,'添加团队');
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
                    <li key={item.key} title={item.title} className={liClass}>
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
        var modalContent = Intl.get('sales.team.whether.del.team', '是否删除此团队') + '?';
        var scrollHeight = this.props.containerHeight;
        if (this.props.isAddSalesTeamRoot) {
            scrollHeight -= 60;//60:添加根团队form表单的高度
        } else {
            scrollHeight -= 40;//40：添加根团队按钮的高度
        }
        return (
            <div className="sales-team-group" style={{height: this.props.containerHeight}} data-tracename="团队管理左侧列表">
                <div className="sales-team-root-add item-border-style">
                    {this.props.isAddSalesTeamRoot ? (
                        <div className="group-form-div group-form-no-superior">
                            <GroupFrom
                                cancelSalesTeamForm={this.cancelEditGroup}
                                isAddRoot={true}
                                salesTeamList={this.props.salesTeamList}
                            >
                            </GroupFrom>
                        </div>) : (<div>
                        <div className="sales-team-search-input-container">
                            <SearchInput
                                searchPlaceHolder={Intl.get('sales.team.search.team.placeholder', '根据 团队名称 搜索团队')}
                                searchEvent={this.searchEvent}
                            />
                        </div>
                        <div className="add-sales-team-root-div">
                            <Button type="ghost" className="add-root-sales-team-btn"
                                onClick={(e) => {this.addSalesTeamRoot(e);}}
                            ><ReactIntl.FormattedMessage id="sales.team.add.team"
                                    defaultMessage="添加团队"/></Button>
                        </div>
                    </div>)
                    }
                </div>
                <div className="sales-team-tree-container" style={{height: scrollHeight}} data-tracename="团队列表">
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <ul className="left-tree-ul">
                            {loop(salesTeamGroupList)}
                        </ul>
                    </GeminiScrollbar>
                    <ModalDialog modalContent={modalContent}
                        modalShow={this.props.deleteGroupItem.modalDialogFlag}
                        container={this}
                        hideModalDialog={this.hideModalDialog}
                        delete={this.saveDeleteGroup}
                    />
                    {this.props.delTeamErrorMsg ? (<AlertTimer time={2000}
                        message={this.props.delTeamErrorMsg}
                        type='error' showIcon
                        onHide={this.hideDelTooltip}/>) : null}
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
};
module.exports = LeftTree;
