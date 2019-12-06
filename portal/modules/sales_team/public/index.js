/**
 * Created by xiaojinfeng on 2016/04/08.
 */
require('./css/index.less');
import {Icon,Input,Button,Tabs} from 'antd';
const TabPane = Tabs.TabPane;
let SalesTeamStore = require('./store/sales-team-store');
let SalesTeamAction = require('./action/sales-team-actions');
let Spinner = require('../../../components/spinner');
let NoData = require('../../../components/analysis-nodata');
let AlertTimer = require('../../../components/alert-timer');
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
let LeftTree = require('./views/left-tree');
let MemberList = require('./views/member-list');
let SalesTeamAjax = require('./ajax/sales-team-ajax');
import OfficeManage from '../../office_manage/public';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import MemberManage from '../../member_manage/public';
import MemberManageAjax from 'MOD_DIR/member_manage/public/ajax';
import { positionEmitter } from 'PUB_DIR/sources/utils/emitters';
import SALES_DEPARTMENT_PRIVILEGE from './privilege-const';

let CONSTANT = {
    SALES_TEAM_IS_NULL: 'sales-team-is-null',//没有团队时的提示信息
    SUCCESS: 'success',
    ERROR: 'error',
    SAVE_SUCCESS: Intl.get('common.save.success', '保存成功'),
    SAVE_ERROR: Intl.get('common.save.failed', '保存失败')
};
const TAB_KEYS = {
    DEPARTMENT_TAB: '1',//部门
    POSITION_TAB: '2'// 职务
};

// 用于布局的常量
const LAYOUT_CONSTANTS = {
    FRIST_NAV_WIDTH: 75, // 一级导航的宽度
    NAV_WIDTH: 120, // 导航宽度
    TOP_ZONE_HEIGHT: 80, // 头部（添加成员、筛选的高度）高度
    PADDING_WIDTH: 24 * 2, // padding占的宽度
    PADDING_HEIGHT: 24 * 2 // padding占的高度
};

class SalesTeamPage extends React.Component {
    constructor(props, context) {
        super(props, context);
        let data = SalesTeamStore.getState();
        data.containerHeight = this.containerHeightFnc();
        data.containerWidth = this.containerWidthFnc();
        data.windowHeight = this.windowHeightFnc();
        data.salesTeamName = '';//添加团队时的团队名称
        data.isSavingSalesTeam = false;//是否正在添加团队
        data.saveSalesTeamMsg = '';//添加团队成功失败的提示
        data.saveSalesTeamResult = '';//添加团队成功还是失败（success/error）
        this.state = {
            activeKey: TAB_KEYS.DEPARTMENT_TAB,
            memberCount: 0, // 成员的数量
            officeList: [], // 职务列表
            roleList: [], // 角色列表
            ...data,
        };
    }

    onChange = () => {
        let data = SalesTeamStore.getState();
        data.containerHeight = this.containerHeightFnc();
        data.containerWidth = this.containerWidthFnc();
        data.windowHeight = this.windowHeightFnc();
        this.setState(data);
    };

    resizeWindow = () => {
        this.setState({
            containerHeight: this.containerHeightFnc(),
            containerWidth: this.containerWidthFnc(),
            windowHeight: this.windowHeightFnc()
        });
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        $(window).on('resize', this.resizeWindow);
        SalesTeamStore.listen(this.onChange);
        SalesTeamAction.getTeamMemberCountList(); // 获取部门树的数量
        SalesTeamAction.setSalesTeamLoading(true);
        SalesTeamAction.getSalesTeamList();
        SalesTeamAction.getMemberList(); // 获取非部门下的成员
        MemberManageAjax.getRoleList().then( (result) => {
            if ( _.isArray(result) && result.length) {
                this.setState({
                    roleList: result
                });
            }
        });
    }

    componentWillUnmount() {
        $(window).off('resize', this.resizeWindow);
        SalesTeamStore.unlisten(this.onChange);
        $('body').css('overflow', 'auto');
    }

    containerHeightFnc = () => {
        return $(window).height() - LAYOUT_CONSTANTS.PADDING_HEIGHT;
    };

    windowHeightFnc = () => {
        return $(window).height();
    };

    containerWidthFnc = () => {
        return $(window).width() - LAYOUT_CONSTANTS.FRIST_NAV_WIDTH -
            LAYOUT_CONSTANTS.NAV_WIDTH - LAYOUT_CONSTANTS.PADDING_WIDTH;
    };

    cancelAddGroup = () => {
        SalesTeamAction.cancelAddGroup();
    };

    //团队名称修改的处理
    onSalesTeamNameChange = (event) => {
        let salesTeamName = _.get(event, 'target.value');
        this.setState({salesTeamName: salesTeamName});
    };

    //添加团队
    addSalesTeam = () => {
        this.setState({
            isSavingSalesTeam: true
        });
        SalesTeamAjax.addGroup({
            groupName: this.state.salesTeamName
        }).then( (data) => {
            this.state.isSavingSalesTeam = false;
            if (data) {
                this.state.saveSalesTeamMsg = CONSTANT.SAVE_SUCCESS;
                this.state.saveSalesTeamResult = CONSTANT.SUCCESS;
            } else {
                this.state.saveSalesTeamMsg = CONSTANT.SAVE_ERROR;
                this.state.saveSalesTeamResult = CONSTANT.ERROR;
            }
            this.updateSaveState();
        }, (errorMsg) => {
            this.state.isSavingSalesTeam = false;
            this.state.saveSalesTeamMsg = errorMsg || CONSTANT.SAVE_ERROR;
            this.state.saveSalesTeamResult = CONSTANT.ERROR;
            this.updateSaveState();
        });
    };

    //更新添加团队返回结果的相关数据
    updateSaveState = () => {
        this.setState({
            isSavingSalesTeam: this.state.isSavingSalesTeam,
            saveSalesTeamMsg: this.state.saveSalesTeamMsg,
            saveSalesTeamResult: this.state.saveSalesTeamResult
        });
    };

    //隐藏添加团队后的提示信息
    hideSaveTooltip = () => {
        if (this.state.saveSalesTeamResult === CONSTANT.SUCCESS) {
            SalesTeamAction.getSalesTeamList();
        }
        this.setState({
            saveSalesTeamMsg: '',
            saveSalesTeamResult: ''
        });
    };

    //无团队时，添加团队面板的渲染
    renderAddSalesTeam = () => {
        return (<PrivilegeChecker
            check={SALES_DEPARTMENT_PRIVILEGE.CREATE_DEPARTMENT}
            className="sales-team-null-add-container"
        >
            <div className="no-sales-team-tip">
                <ReactIntl.FormattedMessage id="sales.team.no.sales.team.tip" defaultMessage="暂无团队，请先添加："/>
            </div>
            <div className="add-sales-team-div">
                <Input value={this.state.salesTeamName}
                    size="large"
                    onChange={this.onSalesTeamNameChange}
                    placeholder={Intl.get('sales.team.search.placeholder', '请输入团队名称')}/>
                {this.state.saveSalesTeamMsg ? (<div className="indicator">
                    <AlertTimer time={this.state.saveSalesTeamResult === CONSTANT.ERROR ? 3000 : 600}
                        message={this.state.saveSalesTeamMsg}
                        type={this.state.saveSalesTeamResult} showIcon
                        onHide={this.hideSaveTooltip}/>
                </div>) : null}
                <Button type="primary" size="large" onClick={this.addSalesTeam}>
                    <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加"/>
                    {this.state.isSavingSalesTeam ? (<Icon type="loading"/>) : ''}
                </Button>
            </div>
        </PrivilegeChecker>);
    };

    // 触发筛选职务事件
    emitFilterPositionEvent = () => {
        let officeList = this.state.officeList;
        let filterOffice = _.find(officeList, item => item.selected);
        let positionObj = {teamroleId: _.get(filterOffice, 'id')};
        positionEmitter.emit(positionEmitter.CLICK_POSITION, positionObj);
    };

    // 切换tab时的处理
    changeActiveKey = (key) => {
        this.setState({
            activeKey: key
        }, () => {
            // 从职务切换到部门时，并且在切换前职务，展示的是组织的成员列表，再次切换到部门时，需要再次获取组织的成员列表
            if (key === '1') {
                let organizationName = _.get(getOrganization(), 'officialName', '');
                let groupName = _.get(this.state.curShowTeamMemberObj, 'groupName');
                if (groupName === organizationName) {
                    positionEmitter.emit(positionEmitter.CLICK_POSITION, {teamroleId: ''});
                }
            } else { // 从部门切换到职务时，获取上次所选职务的成员列表
                if (this.state.officeList.length) {
                    this.emitFilterPositionEvent();
                }
            }
        });
    };

    // 切到tab为职务时，系统自动获取第一个职务的成员的处理
    getOfficeList = (data) => {
        this.setState({
            officeList: data
        }, () => {
            this.emitFilterPositionEvent();
        });
    };

    // 渲染成员列表
    renderMemberList = (containerHeight, salesTeamMemberWidth) => {
        let organizationId = _.get(getOrganization(), 'id', '');
        let groupId = _.get(this.state.curShowTeamMemberObj, 'groupId');
        // 职务和组织上的成员列表，使用是MemberManage组件，团队的成员列表，使用的是MemberList组件
        // 由于使用了两个组件，所以需要判断之前展示的是否是团队的成员列表数据
        let isBeforeShowTeamList = groupId !== organizationId; // true 说明是切换了， false 没有切换
        if (this.state.activeKey === '1') { // tab为部门时的成员列表
            if (groupId === organizationId) { // 组织
                return (
                    <div
                        className='member-zone'
                        style={{
                            height: containerHeight,
                            width: salesTeamMemberWidth
                        }}
                    >
                        <MemberManage
                            getMemberCount={this.getMemberCount}
                            isBeforeShowTeamList={isBeforeShowTeamList}
                        />
                    </div>
                );
            } else {
                return (
                    <MemberList
                        salesTeamMemberWidth={salesTeamMemberWidth}
                        containerHeight={containerHeight}
                        isLoadingTeamMember={this.state.isLoadingTeamMember}
                        salesTeamMerberList={this.state.salesTeamMemberList}
                        curShowTeamMemberObj={this.state.curShowTeamMemberObj}
                        isAddMember={this.state.isAddMember}
                        isEditMember={this.state.isEditMember}
                        addMemberList={this.state.addMemberList}
                        showMemberOperationBtn={this.state.showMemberOperationBtn}
                        teamMemberListTipMsg={this.state.teamMemberListTipMsg}
                        addMemberListTipMsg={this.state.addMemberListTipMsg}
                        salesGoals={this.state.salesGoals}
                        userInfoShow = {this.state.userInfoShow}
                        userFormShow = {this.state.userFormShow}
                        rightPanelShow={this.state.rightPanelShow}
                        isLoadingSalesGoal={this.state.isLoadingSalesGoal}
                        getSalesGoalErrMsg={this.state.getSalesGoalErrMsg}
                        selectedRowIndex={this.state.selectedRowIndex}
                        roleList={this.state.roleList}
                    />
                );
            }
        } else { // tab为职务时成员列表
            return (
                <div
                    className='member-zone'
                    style={{
                        height: containerHeight,
                        width: salesTeamMemberWidth
                    }}
                >
                    <MemberManage isBeforeShowTeamList={isBeforeShowTeamList}/>
                </div>
            );
        }
    };

    getMemberCount = (number) => {
        this.setState({
            memberCount: number
        });
    };

    render() {
        let containerHeight = this.state.containerHeight;
        let containerWidth = this.state.containerWidth;
        let salesTeamMemberWidth = containerWidth - 304;
        let salesTeamList = this.state.salesTeamList;
        let leftTreeData = this.state.searchContent ? this.state.searchSalesTeamTree : this.state.salesTeamListArray;
        let tabHeight = containerHeight - LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        return (
            <div
                className="sales-team-manage-container"
                data-tracename="团队管理"
                style={{height: containerHeight}}
            >
                <div
                    className='member-list-zone'
                    style={{height: containerHeight}}
                >
                    {
                        this.state.salesTeamLisTipMsg ? (
                            this.state.salesTeamLisTipMsg === CONSTANT.SALES_TEAM_IS_NULL ?
                                this.renderAddSalesTeam() :
                                <NoData msg={this.state.salesTeamLisTipMsg}/>
                        ) : (
                            this.state.isLoadingSalesTeam ? (
                                <Spinner className="isloading"/>) : (
                                <div
                                    className="sales-team-table-block modal-container"
                                    style={{width: containerWidth ,height: containerHeight}}
                                >
                                    <div>
                                        {this.renderMemberList(containerHeight, salesTeamMemberWidth)}
                                    </div>
                                    <div className='member-group-tabs' style={{
                                        height: containerHeight,
                                    }}>
                                        <Tabs
                                            defaultActiveKey={TAB_KEYS.DEPARTMENT_TAB}
                                            activeKey={this.state.activeKey}
                                            onChange={this.changeActiveKey}
                                        >
                                            <TabPane
                                                tab={Intl.get('crm.113', '部门')}
                                                key={TAB_KEYS.DEPARTMENT_TAB}
                                            >
                                                <LeftTree
                                                    memberCount={this.state.memberCount}
                                                    containerHeight={tabHeight}
                                                    salesTeamList={salesTeamList}
                                                    searchContent={this.state.searchContent}
                                                    salesTeamGroupList={leftTreeData}
                                                    deleteGroupItem={this.state.deleteGroupItem}
                                                    isLoadingTeamMember={this.state.isLoadingTeamMember}
                                                    delTeamErrorMsg={this.state.delTeamErrorMsg}
                                                    isAddSalesTeamRoot={this.state.isAddSalesTeamRoot}
                                                    teamMemberCountList={this.state.teamMemberCountList}
                                                    isEditGroupFlag={this.state.isEditGroupFlag}
                                                    curEditGroup={this.state.curEditGroup}
                                                    mouseZoneHoverKey={this.state.mouseZoneHoverKey}
                                                    isShowPopOver={this.state.isShowPopOver}
                                                />
                                            </TabPane>
                                            <TabPane
                                                tab={Intl.get('member.position', '职务')}
                                                key={TAB_KEYS.POSITION_TAB}
                                            >
                                                <OfficeManage
                                                    height={tabHeight}
                                                    getOfficeList={this.getOfficeList}
                                                />
                                            </TabPane>
                                        </Tabs>
                                    </div>
                                </div>))
                    }
                </div>
            </div>
        );
    }
}

module.exports = SalesTeamPage;
