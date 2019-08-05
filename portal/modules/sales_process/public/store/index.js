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
        this.salesProcessList = [{
            'id': '1',
            'name': '默认销售流程',
            'description': '系统提供的默认销售流程',
            'status': '1',
            'type': 'default',
            'teams': [{'name': '西部公安'},{'name': '西部网信'}],
            'users': [{'name': '张三'},{'name': '李四'}],
        }, {
            'id': '2',
            'name': '自定义销售流程',
            'description': '自定义销售流程',
            'status': '0',
            'type': 'custom',
            'teams': [{'name': '北部公安'},{'name': '北部网信'}],
            'users': [{'name': '张三'},{'name': '李四'}],
        }
        ];
        this.currentSaleProcess = {}; // 当前销售流程信息
        this.isShowAddProcessFormPanel = false; // 是否显示添加销售流程表单面板，默认false
        this.isShowProcessInfoPanel = false; // 是否显示销售流程详情面板，默认false
        this.isShowCustomerStage = false; // 是否显示客户阶段，默认是false
    }
    // 获取销售流程
    getSalesProcess(result) {
        if (result.loading) {
            this.loading = result.loading;
        } else {
            this.loading = false;
            if (result.error) {
                this.errorMsg = result.errMsg || Intl.get('errorcode.1', '获取成员列表失败');
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
        this.salesProcessList.unshift(saleProcess);
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

    // 设置显示客户阶段界面
    setShowCustomerStage() {
        this.isShowCustomerStage = true;
    }
   
}

export default alt.createStore(SalesProcessStore, 'SalesProcessStore');
