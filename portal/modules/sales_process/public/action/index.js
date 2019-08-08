/**
 * Created by hzl on 2019/8/1.
 * 销售流程-action
 */

import SalesProcessAjax from '../ajax';
import { getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
import userAjax from 'MOD_DIR/common/public/ajax/user';

class SalesProcessAction {
    constructor() {
        this.generateActions(
            'showAddProcessFormPanel', // 显示添加销售流程表单程面板
            'closeAddProcessFormPanel', // 关闭销售流程表单程面板
            'upDateSalesProcessList', // 更新销售流程列表
            'showProcessDetailPanel', // 显示销售流程详情面板
            'closeProcessDetailPanel', // 关闭销售流程详情面板
            'afterEditSaleProcessField', // 编辑销售流程字段
            'showCustomerStagePanel', // 显示客户阶段面板
            'closeCustomerStagePanel' // 关闭客户界阶段面板
        );
    }
    // 获取销售团队
    getSalesTeamList() {
        getMyTeamTreeAndFlattenList(data => {
            let list = data.teamList || [];
            this.dispatch({teamList: list, teamTreeList: data.teamTreeList || []});
        });
    }

    // 获取销售角色的成员列表
    getSalesRoleMemberList(queryObj) {
        userAjax.getEnableMemberListByRoleId().sendRequest(queryObj).success((list) => {
            if (list && list.data){
                this.dispatch({error: false, resData: list.data});
            }
        }).error( (errMsg) => {
            this.dispatch({error: true, errMsg: errMsg});
        } );
    }

    // 获取销售流程
    getSalesProcess() {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.getSalesProcess().then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
        } );
    }

    // 添加销售流程
    addSalesProcess(addProcessObj, cb) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.addSalesProcess(addProcessObj, cb).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
            _.isFunction(cb) && cb();
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
            _.isFunction(cb) && cb();
        } );
    }

    // 更新销售流程
    updateSalesProcess(upDateProcessObj, cb) {
        this.dispatch({loading: true, error: false});
        SalesProcessAjax.updateSalesProcess(upDateProcessObj).then( (result) => {
            this.dispatch({loading: false, resData: result, error: false});
            _.isFunction(cb) && cb();
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg, error: true});
            _.isFunction(cb) && cb();
        } );
    }

}

export default alt.createActions(SalesProcessAction);
