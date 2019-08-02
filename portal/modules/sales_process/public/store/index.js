/**
 * Created by hzl on 2019/8/1.
 */
import SalesProcessAction from '../action';

let emptyProcess = {
    id: '',
};


class SalesProcessStore {
    constructor() {
        this.setInitialData();
        this.bindActions(SalesProcessAction);
    }
    // 初始化数据
    setInitialData() {
        this.loading = false; // 获取销售流程的loading
        this.errorMsg = ''; // 获取销售流程失败的信息
        this.salesprocessList = [{
            'name': '默认销售流程',
            'description': '系统提供的默认销售流程',
            'status': '1',
            'type': 'default',
            'teams': [{'name': '西部公安'},{'name': '西部网信'}],
            'users': [{'name': '张三'},{'name': '李四'}],
        }, {
            'name': '自定义销售流程',
            'description': '自定义销售流程',
            'status': '1',
            'type': 'custom',
            'teams': [{'name': '北部公安'},{'name': '北部网信'}],
            'users': [{'name': '张三'},{'name': '李四'}],
        }

        ];
        this.currentProcess = emptyProcess; // 编辑/添加 状态时，需要提交的域对象

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
                this.salesprocessList = result.resData;
            }
        }
    }
   
}

export default alt.createStore(SalesProcessStore, 'SalesProcessStore');
