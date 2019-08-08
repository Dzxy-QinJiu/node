
import cluePoolAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
import { getAllSalesUserList } from 'PUB_DIR/sources/utils/common-data-util';
class CluePoolActions {
    constructor() {
        this.generateActions(
            'resetState',
            'setClueInitialData',
            'setSalesMan',//获取销售人员及团队的id
            'setSalesManName',//获取销售人员及团队的名字
            'setKeyWord',//设置关键字
            'setSortField', // 设置排序字段
            'updateCluePoolList',//更新线索池列表
            'setCurrentClueId',// 当前线索的id
            'setUnSelectDataTip', // 未选择销售的提示信息
        );
    }
    // 获取线索池列表
    getCluePoolList(queryObj) {
        this.dispatch({loading: true, error: false});
        cluePoolAjax.getCluePoolList(queryObj).then((result) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({
                loading: false,
                error: true,
                errorMsg: errorMsg || Intl.get('clue.extract.get.list.failed', '获取提取线索列表失败')
            });
        });
    }

    // 批量提取
    batchExtractClueAssignToSale(reqData, cb) {
        this.dispatch({loading: true, error: false});
        cluePoolAjax.batchExtractClueAssignToSale(reqData).then((result) => {
            this.dispatch({loading: false, error: false, resData: result});
            _.isFunction(cb) && cb({taskId: _.get(result,'batch_label','')});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true});
            _.isFunction(cb) && cb({errorMsg: errorMsg || Intl.get('clue.extract.batch.extract.failed','批量提取线索失败')});
        });
    }

    //获取销售列表
    getSalesManList(cb) {
        //客户所属销售（团队）下拉列表的数据获取
        cluePoolAjax.getSalesManList().then((list) => {
            this.dispatch(list);
            if (cb) cb();
        }, (errorMsg) => {
            // eslint-disable-next-line no-console
            console.log(errorMsg);
        });
    }

    //获取所有成员
    getAllSalesUserList(cb) {
        getAllSalesUserList((allUserList) => {
            this.dispatch(allUserList);
            if (cb) cb(allUserList);
        });
    }
}

export default alt.createActions(CluePoolActions);