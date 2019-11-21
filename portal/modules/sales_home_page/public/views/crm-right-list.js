/**
 * 客户、用户、电话、合同统计总数
 * Created by wangliping on 2016/11/14.
 */
var React = require('react');
import {Breadcrumb, Icon, Menu, Dropdown, message} from 'antd';
import Trace from 'LIB_DIR/trace';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {getSalesTeamRoleList} from '../../../common/public/ajax/role';
import {COLOR_LIST} from 'PUB_DIR/sources/utils/consts';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {SearchInput} from 'antc';
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var OplateCustomerAnalysisAction = require('../../../oplate_customer_analysis/public/action/oplate-customer-analysis.action');
let userData = require('../../../../public/sources/user-data');
let SalesHomeAction = require('../action/sales-home-actions');
let constantUtil = require('../util/constant');
let showTypeConstant = constantUtil.SHOW_TYPE_CONSTANT;//当前展示的类型常量（销售团队列表、团队成员列表、销售的待办事宜）
const Emitters = require('PUB_DIR/sources/utils/emitters');
const teamTreeEmitter = Emitters.teamTreeEmitter;
const TOP_TEAM_ID = 'sales-team-list-parent-group-id';
var delayConstant = constantUtil.DELAY.TIMERANG;
const CALLING_STATUS = 'busy';//正在打电话的状态（busy繁忙，idle空闲，空值-还未配置座机号）
import MemberApply from './member-apply';
import classNames from 'classnames';
import shpPrivilegeConst from '../privilege-const';

const OPERATOR_MEMBER_APPLY_HEIGHT = 165; // 运营人员，成员申请的高度
const SALE_MEMBER_APPLY_HEIGHT = 190; // 销售人员，成员申请的高度

class CrmRightList extends React.Component {
    state = {
        searchInputShow: false,
        searchValue: '',
        updateScrollBar: false,
        salesTeamMembersObj: $.extend(true, {}, this.props.salesTeamMembersObj),//销售团队下的成员列表
        salesRoleList: []//销售角色列表
    };

    componentDidMount() {
        this.getSalesRoleList();
    }

    componentWillReceiveProps(nextProps) {
        this.setState({salesTeamMembersObj: $.extend(true, {}, nextProps.salesTeamMembersObj)});
        if (nextProps.updateScrollBar) {
            this.setState({
                updateScrollBar: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        updateScrollBar: false
                    });
                }, delayConstant);
            });
        }
    }

    //获取销售角色列表
    getSalesRoleList = () => {
        getSalesTeamRoleList().sendRequest().success((data) => {
            _.isArray(data) && data.unshift({id: 'normal', name: Intl.get('role.normal.sales', '普通销售')});
            this.setState({
                salesRoleList: _.isArray(data) ? data : [],
            });
        }).error((xhr) => {
            this.setState({
                salesRoleList: [],
            });
        });
    };

    //渲染等待效果、暂无数据的提示
    renderTooltip = (resultType, errorMsg) => {
        if (resultType === 'loading') {
            return (<Icon type="loading"/>);
        } else if (resultType === 'error' || resultType === 'noData') {
            return (<div className="no-data-tip">{errorMsg || Intl.get('sales.home.get.data.failed', '获取数据失败')}</div>);
        }
    };

    //获取传入团队的所有子团队的group_id,数组第一项为传入团队的group_id
    getAllSubTeamId = (team) => {
        let allChildTeamIds = [];
        const getAllSubChild = team => {
            if (team.group_id) {
                allChildTeamIds.push(team.group_id);
                if (team.child_groups && team.child_groups.length > 0) {
                    team.child_groups.forEach(child => getAllSubChild(child));
                } else {
                    return;
                }
            }
        };
        getAllSubChild(team);
        return allChildTeamIds;
    };

    //点击查看当前团队的数据
    selectSalesTeam = (e, team) => {
        OplateCustomerAnalysisAction.resetChartData('loading');
        SalesHomeAction.selectSalesTeam(team);
        let allChildTeamIds = [];
        //不是顶级的"销售团队列表"
        if (team.group_id !== TOP_TEAM_ID) {
            allChildTeamIds = this.getAllSubTeamId(team);
        }
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, team.group_id, allChildTeamIds);
        //刷新左侧的统计、分析数据
        setTimeout(() => {
            this.props.refreshDataByChangeSales();
        });
        this.hideSearchInput();
        Trace.traceEvent(e, '点击查看团队的数据');
    };

    //点击查看当前成员的数据
    selectSalesman = (e, user) => {
        OplateCustomerAnalysisAction.resetChartData('loading');
        SalesHomeAction.selectSalesman(user);
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, user.userId);
        //刷新左侧的统计、分析数据
        setTimeout(() => this.props.refreshDataByChangeSales());
        this.hideSearchInput();
        Trace.traceEvent(e, '点击查看销售人员的数据');
    };

    //通过面包屑返回到销售团队列表
    returnSalesTeamList = (e, team) => {
        OplateCustomerAnalysisAction.resetChartData('loading');
        SalesHomeAction.returnSalesTeamList(team.group_id);
        //刷新左侧的统计、分析数据
        setTimeout(() => this.props.refreshDataByChangeSales());
        this.hideSearchInput();
        Trace.traceEvent(e, '返回团队的数据');

        let team_id = team.group_id;
        if (team_id === 'sales-team-list-parent-group-id') {
            team_id = '';
        }
        let allChildTeamIds = [];
        //不是顶级的"销售团队列表"
        if (team.group_id !== TOP_TEAM_ID) {
            allChildTeamIds = this.getAllSubTeamId(team);
        }
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, team_id, allChildTeamIds);
    };

    //通过面包屑返回到销售成员列表
    returnSalesMemberList = (e, team) => {
        let team_id = team.group_id;
        OplateCustomerAnalysisAction.resetChartData('loading');
        SalesHomeAction.returnSalesMemberList();
        //刷新左侧的统计、分析数据
        setTimeout(() => this.props.refreshDataByChangeSales());
        Trace.traceEvent(e, '返回销售成员列表');
        let allChildTeamIds = [];
        //不是顶级的"销售团队列表"
        if (team_id !== TOP_TEAM_ID) {
            allChildTeamIds = this.getAllSubTeamId(team);
        }
        teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, team_id, allChildTeamIds);
    };

    //获取销售的标题
    getSalesmanTitle = () => {
        let salesTitle = '', originTeamTree = this.props.originSalesTeamTree;
        if (this.props.currShowSalesman) {
            //通过点击销售团队成员列表中的成员跳到其用户提醒时
            let currShowTeam = this.props.currShowSalesTeam;
            if (currShowTeam) {
                //从销售团队列表一级级进入
                let titleItem = [];
                //遍历添加所有的上级团队
                this.addTitleItem(originTeamTree, titleItem);
                salesTitle = (<Breadcrumb>
                    {titleItem}
                    <Breadcrumb.Item><a
                        onClick={ e => this.returnSalesMemberList(e, currShowTeam) }>{currShowTeam.group_name}</a></Breadcrumb.Item>
                    <Breadcrumb.Item>{this.props.currShowSalesman.nickName}</Breadcrumb.Item>
                </Breadcrumb>);
            } else {
                //销售团队成员列表
                var itemList = [];
                itemList.push(<Breadcrumb.Item><a
                    onClick={ e => this.returnSalesMemberList(e, currShowTeam) }>{originTeamTree.group_name}</a></Breadcrumb.Item>);
                itemList.push(<Breadcrumb.Item>{this.props.currShowSalesman.nickName}</Breadcrumb.Item>);
                salesTitle = (<Breadcrumb>{itemList}</Breadcrumb>);
            }
        } else {
            salesTitle = userData.getUserData().nick_name;
        }
        return salesTitle;
    };

    //加入其上级团队
    addTitleItem = (team, titleItem) => {
        //该团队是当前展示列表的上级团队
        if (team.isCurrShowListParent && team.group_id !== this.props.currShowSalesTeam.group_id) {
            titleItem.push(<Breadcrumb.Item>
                <a onClick={ e => this.returnSalesTeamList(e, team) }>{team.group_name}</a>
            </Breadcrumb.Item>);
            if (_.isArray(team.child_groups) && team.child_groups.length > 0) {
                _.some(team.child_groups, team => {
                    if (team.isCurrShowListParent) {
                        this.addTitleItem(team, titleItem);
                        return true;
                    }
                });
            }
        }
    };

    //获取销售团队/成员列表的标题
    getSalesListTitle = () => {
        let salesTitle = '', originTeamTree = this.props.originSalesTeamTree;
        if (this.props.currShowSalesTeam) {
            //通过点击销售团队列表中的销售团队转到其团队/成员列表时
            let titleItem = [];
            //遍历添加所有的上级团队
            this.addTitleItem(originTeamTree, titleItem);
            salesTitle = (<Breadcrumb>
                {titleItem}
                <Breadcrumb.Item>{this.props.currShowSalesTeam.group_name}</Breadcrumb.Item>
            </Breadcrumb>);
        } else {
            //首次展示就是销售团队的团队/成员列表
            salesTitle = originTeamTree.group_name;
        }
        return salesTitle;
    };

    //更新团队成员角色
    updateTeamMemberRole = (sales, role) => {
        let salesTeamMemberList = this.state.salesTeamMembersObj.data;
        if (_.isArray(salesTeamMemberList) && salesTeamMemberList.length) {
            _.some(salesTeamMemberList, member => {
                if (member.userId === sales.userId) {
                    member.teamRoleId = role.id;
                    member.teamRoleName = role.name;
                    member.teamRoleColor = role.color;
                }
            });
            let salesTeamMembersObj = this.state.salesTeamMembersObj;
            salesTeamMembersObj.data = salesTeamMemberList;
            this.setState({salesTeamMembersObj});
        }
    };

    //如果销售角色id为“normal”，则选择清空销售角色的函数,反之则选择改变销售角色的函数
    changeAllSalesRole = (sales, options) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find(`#sales-member-li${sales.userId} .icon-role-auth-config`), '设置销售角色');

        if(options.key === 'normal'){
            this.resetSalesRole(sales, options);

        }else{
            this.changeSalesRole(sales, options);
        }
    };

    //更改销售角色
    changeSalesRole = (sales, options) => {
        if (sales.teamRoleId === options.key) {
            return;
        }
        let selectRole = _.find(this.state.salesRoleList, role => role.id === options.key);
        if(!selectRole) return;
        this.updateTeamMemberRole(sales, selectRole);
        $.ajax({
            url: '/rest/sales/role/change',
            type: 'post',
            dateType: 'json',
            data: {member_id: sales.userId, teamrole_id: selectRole.id},
            success: (result) => {
                if (result) {
                    message.success(Intl.get('user.info.setting.succeess', '设置成功！'));
                    //更新store中对应成员的销售角色
                    SalesHomeAction.updateSalesTeamMembersObj(this.state.salesTeamMembersObj);
                } else {
                    message.error(Intl.get('failed.set.no.tip', '设置失败'));
                }
            },
            error: (errorInfo) => {
                message.error(errorInfo.responseJSON || Intl.get('failed.set.no.tip', '设置失败'));
                //还原成员销售角色
                this.setState({salesTeamMembersObj: $.extend(true, {}, this.props.salesTeamMembersObj)});
            }
        });
    };

    //清空、重置销售角色
    resetSalesRole = (sales, options) => {
        let selectRoleNormal = {};
        this.updateTeamMemberRole(sales, selectRoleNormal);
        $.ajax({
            url: `/rest/sales/role/reset/${sales.userId}`,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                if (result) {
                    message.success(Intl.get('user.info.setting.succeess', '设置成功！'));
                    //更新store中对应成员的销售角色
                    SalesHomeAction.updateSalesTeamMembersObj(this.state.salesTeamMembersObj);
                } else {
                    message.error(Intl.get('failed.set.no.tip', '设置失败'));
                }
            },
            error: (errorInfo) => {
                message.error(errorInfo.responseJSON || Intl.get('failed.set.no.tip', '设置失败'));
                //还原成员销售角色
                this.setState({salesTeamMembersObj: $.extend(true, {}, this.props.salesTeamMembersObj)});
            }
        });
    };

    //获取销售角色的菜单
    getSalesRoleMenus = (sales) => {
        let salesRoleList = this.state.salesRoleList;
        return (
            <Menu
                selectedKeys={[sales.teamRoleId]}
                onClick={this.changeAllSalesRole.bind(this, sales)}
            >
                {_.isArray(salesRoleList) && salesRoleList.length ? _.map(salesRoleList, role => {
                    return (<Menu.Item key={role.id}>{role.name} </Menu.Item>);
                }) : null}
            </Menu>

        );
    };

    //获取销售团队的成员列表
    renderSalesRole = (salesman) => {
        let color = salesman.teamRoleColor || '#123';
        // if (salesman.status === 0) {//停用的就展示灰色的方块
        //     return (<span className="sales-item-icon"/>);
        // } else
        if (salesman.teamRoleName) {//有销售角色时，展示不同颜色的角色图标
            return (<span className="iconfont icon-team-role sales-role-icon" style={{color: color}}
                title={salesman.teamRoleName}/>);
        } else {//无销售角色时，展示“未设置角色”的图标
            return <span className="iconfont icon-role-set sales-role-icon"
                title={Intl.get('sales.home.role.null', '未设置角色')}/>;
        }
    };

    renderSalesRoleSetBtn = (salesman) => {
        let salesRoleList = this.state.salesRoleList;
        // salesman.status !== 0 &&
        if (hasPrivilege(shpPrivilegeConst.USER_MANAGE_EDIT_USER) && _.isArray(salesRoleList) && salesRoleList.length) {
            return (
                <Dropdown overlay={this.getSalesRoleMenus(salesman)}
                    getPopupContainer={() => document.getElementById('sales-member-li' + salesman.userId)}>
                    <span className="iconfont icon-role-auth-config"
                        title={Intl.get('sales.home.set.role', '点此设置销售角色')}/>
                </Dropdown>);
        } else {//停用的成员或没有设置角色权限或销售角色列表为空时，不展示设置角色按钮
            return null;
        }
    };

    //获取销售团队的成员列表
    getSalesMemberList = () => {
        let salesListLi = [];
        let salesTeamMembersObj = this.state.salesTeamMembersObj;
        if (salesTeamMembersObj.resultType) {
            //等待效果及错误提示
            salesListLi = this.renderTooltip(salesTeamMembersObj.resultType, salesTeamMembersObj.errorMsg);
        } else {
            let salesTeamMemberList = salesTeamMembersObj.data;
            if (_.isArray(salesTeamMemberList) && salesTeamMemberList.length > 0) {
                let salesRoleList = _.isArray(this.state.salesRoleList) ? this.state.salesRoleList : [];
                let roleListLength = salesRoleList.length;
                salesTeamMemberList.map((salesman, i) => {
                    if (salesman.nickName.indexOf(this.state.searchValue) !== -1) {
                        let name = salesman.nickName;
                        if (salesman.status === 0) {
                            //停用状态
                            name += ' ( ' + Intl.get('common.stop', '停用') + ' ) ';
                        }
                        salesListLi.push(
                            <div>
                                <li key={salesman.userId} className={salesman.status === 0 ? 'user-stop-li' : ''}
                                    id={'sales-member-li' + salesman.userId}>
                                    {this.renderSalesRole(salesman)}
                                    <span className="sales-member-name" title={name} onClick={ e => this.selectSalesman(e, salesman)}>{name}</span>
                                    {salesman.status !== 0 && this.props.salesCallStatus[salesman.userId] === CALLING_STATUS ?
                                        <span className="iconfont icon-phone-waiting"
                                            title={Intl.get('sales.status.calling', '正在打电话')}/>
                                        : null }
                                    {this.renderSalesRoleSetBtn(salesman)}
                                </li>
                                <hr/>
                            </div>);
                    }
                });
            } else {
                //无数据的提示
                salesListLi = this.renderTooltip('noData', Intl.get('sales.home.no.sales', '暂无销售成员'));
            }
        }
        return salesListLi;
    };

    //获取销售团队列表
    getSalesTeamList = () => {
        let salesListLi = [], salesTeamList = this.props.salesTeamListObj.data;
        let teamMemberCountList = this.props.teamMemberCountList;
        if (_.isArray(salesTeamList) && salesTeamList.length > 0) {
            salesTeamList.map((salesTeam, i) => {
                let teamMemberCount = commonMethodUtil.getTeamMemberCount(salesTeam, 0, teamMemberCountList, true);
                if (salesTeam.group_name.indexOf(this.state.searchValue) !== -1) {
                    let color = this.getBgColor(i);
                    salesListLi.push(<li key={salesTeam.group_id} onClick={e => this.selectSalesTeam(e, salesTeam)}>
                        <span className="sales-item-icon"
                            style={{backgroundColor: color}}/>{salesTeam.group_name}({teamMemberCount}人)
                    </li>);
                }
            });
        } else {
            //无数据的提示
            salesListLi = this.renderTooltip('noData', Intl.get('sales.home.no.team', '暂无销售团队'));
        }
        return salesListLi;
    };

    searchEvent = (searchValue) => {
        this.setState({
            searchValue: searchValue
        });
    };

    hideSearchInput = () => {
        this.setState({searchInputShow: false, searchValue: ''});
        //$(".sales-team-top .search-input").val("");
    };

    showSearchInput = () => {
        this.setState({searchInputShow: true});
    };

    // 获取销售团队列表的高度
    getSalesListHeight = () => {
        let salesListHeight = this.props.getSalesListHeight();
        let pendingLength = _.get(this.props.pendingApproveMemberObj, 'list.length');
        if (pendingLength) {
            let detail = _.get(this.props.pendingApproveMemberObj, 'list[0].detail');
            let teamId = _.get(detail, 'team.group_id', '');
            if (teamId) {
                salesListHeight -= SALE_MEMBER_APPLY_HEIGHT;
            } else {
                salesListHeight -= OPERATOR_MEMBER_APPLY_HEIGHT;
            }
        }
        return salesListHeight;
    };

    renderListContent = () => {
        let salesTitle = '', salesListLi = [], isShowSearch = true;
        switch (this.props.currShowType) {
            case showTypeConstant.SALESMAN:
            //没有销售团队时，并且是普通销售或者舆情秘书时，展示过期用户提醒
                salesTitle = this.getSalesmanTitle();
                isShowSearch = false;
                //如果是通过点击团队成员列表 显示出来的销售，什么都不展示
                if (this.props.currShowSalesman) {
                    salesListLi = '';
                }
                break;
            case showTypeConstant.SALES_MEMBER_LIST:
            //当前展示的是该销售团队的成员列表
                salesTitle = this.getSalesListTitle();
                salesListLi = this.getSalesMemberList();
                break;
            case showTypeConstant.SALES_TEAM_LIST:
            //当前展示的是销售团队的列表
                salesTitle = this.getSalesListTitle();
                salesListLi = this.getSalesTeamList();
                break;
        }
        let salesListHeight = this.getSalesListHeight();
        let pendingLength = _.get(this.props.pendingApproveMemberObj, 'list.length');
        let salesTeamCls = classNames('sales-team-top',{
            'has-pending-approve-member': pendingLength,
        });
        return (
            <div>
                <div className={salesTeamCls}>
                    <span className="sales-team-title"> {salesTitle}</span>
                    {isShowSearch ? this.state.searchInputShow ? (
                        <SearchInput searchPlaceHolder={Intl.get('sales.home.filter.tip', '请输入关键字进行过滤')}
                            closeSearchInput={this.hideSearchInput}
                            searchEvent={this.searchEvent}/>) : (
                        <Icon type="search" className="search-sales-icon" onClick={this.showSearchInput}/>)
                        : null}
                </div>
                <ul className="sales-list-container" style={{height: salesListHeight}}>
                    {this.renderContent(salesListLi)}
                </ul>
            </div>
        );
    };

    renderContent = (salesListLi) => {
        if (this.state.updateScrollBar) {
            return (
                <div>
                    {salesListLi}
                </div>
            );
        } else {
            return (
                <GeminiScrollbar
                    enabled={this.props.scrollbarEnabled}
                    ref="scrollbar"
                >
                    {salesListLi}
                </GeminiScrollbar>
            );
        }
    };

    //获取颜色（从echart的颜色列表中循环获取）
    getBgColor = (i) => {
        let colorIndex = i;
        if (i > COLOR_LIST.length) {
            colorIndex = i % COLOR_LIST.length;
        }
        return COLOR_LIST[colorIndex];
    };

    //设置当前要展示的视图
    setActiveView = (view) => {
        SalesHomeAction.setActiveView(view);
    };

    // 处理成员审批
    handleMemberApprove = (flag) => {
        SalesHomeAction.handleMemberApprove(flag);
        let pendingLength = _.get(this.props.pendingApproveMemberObj, 'list.length');
        if (pendingLength === 0) {
            SalesHomeAction.getPendingApproveMemberApplyList();
        }
    };

    renderPendingApproveMemberContent = () => {
        let pendingInfo = _.get(this.props.pendingApproveMemberObj, 'list[0]');
        return (
            <MemberApply
                pendingInfo={pendingInfo}
                memberApprove={this.handleMemberApprove}
            />
        );
    };

    render() {
        let resultType = this.props.salesTeamListObj.resultType, errorMsg = this.props.salesTeamListObj.errorMsg;
        let pendingLength = _.get(this.props.pendingApproveMemberObj, 'list.length');
        return (
            <div className="crm-sales-team-zone">
                {
                    hasPrivilege(shpPrivilegeConst.MEMBER_INVITE_APPLY) && pendingLength ? (
                        <div className="member-apply-container" data-tracename='成员审批'>
                            {this.renderPendingApproveMemberContent()}
                        </div>
                    ) : null
                }
                <div className="crm-sales-team-container" data-tracename="销售（团队）列表">
                    {resultType ? (this.renderTooltip(resultType, errorMsg)) : this.renderListContent()}
                </div>
            </div>
        );
    }
}
CrmRightList.propTypes = {
    salesTeamMembersObj: PropTypes.object,
    salesTeamListObj: PropTypes.object,
    updateScrollBar: PropTypes.bool,
    originSalesTeamTree: PropTypes.object,
    currShowSalesman: PropTypes.object,
    currShowSalesTeam: PropTypes.object,
    scrollbarEnabled: PropTypes.object,
    salesCallStatus: PropTypes.object,
    teamMemberCountList: PropTypes.array,
    currShowType: PropTypes.string,
    refreshDataByChangeSales: PropTypes.func,
    getSalesListHeight: PropTypes.func,
    pendingApproveMemberObj: PropTypes.object,
    isGetMemberApplyList: PropTypes.bool
};
module.exports = CrmRightList;

