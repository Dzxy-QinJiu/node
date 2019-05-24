/**
 * Created by xiaojinfeng on 2016/04/08.
 */
var React = require('react');
require('./css/sales-team.less');
import {Icon,Input,Button} from 'antd';
var SalesTeamStore = require('./store/sales-team-store');
var SalesTeamAction = require('./action/sales-team-actions');
var Spinner = require('../../../components/spinner');
var NoData = require('../../../components/analysis-nodata');
var AlertTimer = require('../../../components/alert-timer');
var PrivilegeChecker = require('../../../components/privilege/checker').PrivilegeChecker;
var LeftTree = require('./views/left-tree');
var MemberList = require('./views/member-list');
var SalesTeamAjax = require('./ajax/sales-team-ajax');
var topHeight = 87; // 22 + 65 : 添加按钮高度+顶部导航高度
var bootomHeight = 20; //距离底部高度
var CONSTANT = {
    SALES_TEAM_IS_NULL: 'sales-team-is-null',//没有团队时的提示信息
    SUCCESS: 'success',
    ERROR: 'error',
    SAVE_SUCCESS: Intl.get('common.save.success', '保存成功'),
    SAVE_ERROR: Intl.get('common.save.failed', '保存失败')
};

class SalesTeamPage extends React.Component {
    constructor(props, context) {
        super(props, context);
        var data = SalesTeamStore.getState();
        data.containerHeight = this.containerHeightFnc();
        data.containerWidth = this.containerWidthFnc();
        data.windowHeight = this.windowHeightFnc();
        data.salesTeamName = '';//添加团队时的团队名称
        data.isSavingSalesTeam = false;//是否正在添加团队
        data.saveSalesTeamMsg = '';//添加团队成功失败的提示
        data.saveSalesTeamResult = '';//添加团队成功还是失败（success/error）
        this.state = data;
    }

    onChange = () => {
        var data = SalesTeamStore.getState();
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
        return $(window).height() - topHeight - bootomHeight;
    };

    windowHeightFnc = () => {
        return $(window).height();
    };

    containerWidthFnc = () => {
        return $(window).width() - 75 - 40;
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
        var _this = this;
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

    render() {
        var containerHeight = this.state.containerHeight - 2;
        var containerWidth = this.state.containerWidth - 2;
        var salesTeamMemberWidth = containerWidth - 300 - 2;
        var salesTeamList = this.state.salesTeamList;
        let leftTreeData = this.state.searchContent ? this.state.searchSalesTeamTree : this.state.salesTeamListArray;

        return (
            <div className="sales-team-manage-container" data-tracename="团队管理">
                {this.state.salesTeamLisTipMsg ? (this.state.salesTeamLisTipMsg === CONSTANT.SALES_TEAM_IS_NULL ? this.renderAddSalesTeam() :
                    <NoData msg={this.state.salesTeamLisTipMsg}/>) : (this.state.isLoadingSalesTeam ? (
                    <Spinner className="isloading"/>) : (
                    <div className="sales-team-table-block modal-container"
                        style={{width: containerWidth,height: containerHeight}}>
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
                        >
                        </MemberList>
                        <LeftTree
                            containerHeight={containerHeight}
                            salesTeamList={salesTeamList}
                            searchContent={this.state.searchContent}
                            salesTeamGroupList={leftTreeData}
                            deleteGroupItem={this.state.deleteGroupItem}
                            isLoadingTeamMember={this.state.isLoadingTeamMember}
                            delTeamErrorMsg={this.state.delTeamErrorMsg}
                            isAddSalesTeamRoot={this.state.isAddSalesTeamRoot}
                            teamMemberCountList={this.state.teamMemberCountList}
                        />
                    </div>))
                }
            </div>
        );
    }
}

module.exports = SalesTeamPage;
