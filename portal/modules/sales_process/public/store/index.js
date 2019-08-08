/**
 * Created by hzl on 2019/8/1.
 */
import SalesProcessAction from '../action';

class SalesProcessStore {
    constructor() {
        this.setInitialData();
        this.bindActions(SalesProcessAction);
    }
    // 初始化数据
    setInitialData() {
        this.loading = false; // 获取销售流程的loading
        this.errorMsg = ''; // 获取销售流程失败的信息
        this.salesProcessList = [];
        this.currentSaleProcess = {}; // 当前销售流程信息
        this.salesTeamTree = []; // 销售团队树结构
        this.salesTeamList = []; // 销售团队列表
        this.salesNoBelongToTeamList = []; // 不属于任何团队的销售列表
        this.salesMemberList = []; // 销售角色的成员列表
        this.isShowAddProcessFormPanel = false; // 是否显示添加销售流程表单面板，默认false
        this.isShowProcessInfoPanel = false; // 是否显示销售流程详情面板，默认false
        this.isShowCustomerStage = false; // 是否显示客户阶段，默认是false
        this.salesProcessId = ''; // 销售流程id
    }

    // 遍历团队树，返回要显示的树选择结构数据
    traversTeamTree(treelist) {
        let teamList = [];
        if (_.get(treelist, 'length')){
            _.each(treelist, (teamInfo) => {
                let data = {
                    key: teamInfo.group_id,
                    title: teamInfo.group_name, // 团队名称
                    value: teamInfo.group_id,
                    children: []
                };
                if (_.get(teamInfo, 'child_groups')) {
                    data.children = this.traversTeamTree(teamInfo.child_groups);
                } else {
                    delete data.children;
                }
                teamList.push(data);
            });
        }
        return teamList;
    }

    // 获取销售团队
    getSalesTeamList(result) {
        this.salesTeamTree = this.traversTeamTree(result.teamTreeList);
        this.salesTeamList = result.teamList;
    }

    // 获取销售角色的成员列表
    getSalesRoleMemberList(result) {
        if (result.error) {
            this.salesNoBelongToTeamList = [];
        } else {
            let salesNoBelongToTeamList = _.filter(result.resData, item => !item.team_id);
            this.salesMemberList = salesNoBelongToTeamList;
            if (salesNoBelongToTeamList.length) {
                _.each(salesNoBelongToTeamList, (memberInfo) => {
                    let data = {
                        key: memberInfo.user_id,
                        title: memberInfo.nick_name, // 销售名称
                        value: memberInfo.user_id,
                    };
                    this.salesNoBelongToTeamList.push(data);
                });
            }
        }
    }

    // 获取销售流程
    getSalesProcess(result) {
        if (result.loading) {
            this.loading = result.loading;
        } else {
            this.loading = false;
            if (result.error) {
                this.errorMsg = result.errMsg || Intl.get('sales.process.get.failed', '获取销售流程失败');
            } else {
                this.errorMsg = '';
                this.salesProcessList = result.resData;
            }
        }
    }

    // 显示添加销售流程表单程面板
    showAddProcessFormPanel() {
        this.isShowAddProcessFormPanel = true;
        this.isShowProcessInfoPanel = false;
    }

    // 关闭添加销售流程表单程面板
    closeAddProcessFormPanel() {
        this.isShowAddProcessFormPanel = false;
    }

    // 更新销售流程列表
    upDateSalesProcessList(saleProcess) {
        if (saleProcess.flag === 'delete') { // 删除
            this.salesProcessList = _.filter(this.salesProcessList, item => item.id !== saleProcess.id);
        } else { // 添加
            this.salesProcessList.unshift(saleProcess);
        }
    }

    // 显示销售流程详情面板
    showProcessDetailPanel(saleProcess) {
        this.isShowProcessInfoPanel = true;
        this.currentSaleProcess = saleProcess;
        this.isShowAddProcessFormPanel = false;
    }

    // 关闭销售流程详情面板
    closeProcessDetailPanel() {
        this.isShowProcessInfoPanel = false;
    }

    afterEditSaleProcessField(saleProcess) {
        let upDateProcess = _.find(this.salesProcessList, item => item.id === saleProcess.id);
        let name = _.get(saleProcess, 'name'); // 修改销售流程名称
        let description = _.get(saleProcess, 'description'); // 修改销售流程描述
        let status = _.get(saleProcess, 'status'); // 修改销售流程状态
        let scope = _.get(saleProcess, 'scope'); // 修改销售流程使用范围
        if (name) {
            upDateProcess.name = name;
        } else if (status) {
            upDateProcess.status = status;
        } else if (description) {
            upDateProcess.description = description;
        } else if (scope) {

        }
    }

    // 显示客户阶段面板
    showCustomerStagePanel(saleProcess) {
        this.salesProcessId = saleProcess.id;
        this.isShowCustomerStage = true;
    }

    // 关闭客户界阶段面板
    closeCustomerStagePanel() {
        this.salesProcessId = '';
        this.isShowCustomerStage = false;
    }
   
}

export default alt.createStore(SalesProcessStore, 'SalesProcessStore');
