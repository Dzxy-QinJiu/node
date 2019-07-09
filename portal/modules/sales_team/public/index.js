/**
 * Created by xiaojinfeng on 2016/04/08.
 */
const React = require('react');
require('./css/index.less');
import {Icon,Input,Button,Tabs} from 'antd';
const TabPane = Tabs.TabPane;
let SalesTeamStore = require('./store/sales-team-store');
let SalesTeamAction = require('./action/sales-team-actions');
let Spinner = require('../../../components/spinner');
let NoData = require('../../../components/analysis-nodata');
let AlertTimer = require('../../../components/alert-timer');
let PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
let LeftTree = require('./views/left-tree');
let MemberList = require('./views/member-list');
let SalesTeamAjax = require('./ajax/sales-team-ajax');
import OfficeManage from '../../office_manage/public';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import MemberManage from '../../member_manage/public';

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
        SalesTeamAction.getTeamMemberCountList();
        SalesTeamAction.setSalesTeamLoading(true);
        SalesTeamAction.getSalesTeamList();
        SalesTeamAction.getMemberList();
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
        let _this = this;
        _this.setState({
            isSavingSalesTeam: true
        });
        SalesTeamAjax.addGroup({
            groupName: this.state.salesTeamName
        }).then(function(data) {
            _this.state.isSavingSalesTeam = false;
            if (data) {
                _this.state.saveSalesTeamMsg = CONSTANT.SAVE_SUCCESS;
                _this.state.saveSalesTeamResult = CONSTANT.SUCCESS;
            } else {
                _this.state.saveSalesTeamMsg = CONSTANT.SAVE_ERROR;
                _this.state.saveSalesTeamResult = CONSTANT.ERROR;
            }
            _this.updateSaveState();
        }, function(errorMsg) {
            _this.state.isSavingSalesTeam = false;
            _this.state.saveSalesTeamMsg = errorMsg || CONSTANT.SAVE_ERROR;
            _this.state.saveSalesTeamResult = CONSTANT.ERROR;
            _this.updateSaveState();
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
        return (<PrivilegeChecker check="BGM_SALES_TEAM_ADD" className="sales-team-null-add-container">
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

    // 切换tab时的处理
    changeActiveKey = (key) => {
        this.setState({
            activeKey: key
        });
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
        let organizationName = _.get(getOrganization(), 'name', '');
        let groupName = _.get(this.state.curShowTeamMemberObj, 'groupName');
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
                                    {
                                        groupName === organizationName ? (
                                            <div
                                                className='member-zone'
                                                style={{
                                                    height: containerHeight,
                                                    width: salesTeamMemberWidth
                                                }}
                                            >
                                                <MemberManage getMemberCount={this.getMemberCount}/>
                                            </div>
                                        ) :
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
                                            />
                                    }
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
