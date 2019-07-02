
import cluePoolAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
class CluePoolActions {
    constructor() {
        this.generateActions(
            'resetState',
            'setClueInitialData',
            'getSalesManList',//获取销售团队列表
            'distributeCluecustomerToSale',//分配线索客户给某个销售
            'setTimeRange',//设置开始和结束时间
            'setFilterType',//设置筛选线索客户的类型
            'setStatusLoading',
            'setSalesMan',//获取销售人员及团队的id
            'setSalesManName',//获取销售人员及团队的名字
            'afterAssignSales',//分配销售之后
            'setKeyWord',//设置关键字
            'setLastClueId',//用于设置下拉加载的最后一个线索的id
            'setSortField', // 设置排序字段
            'updateClueCustomers',//更新线索列表
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
}

export default alt.createActions(CluePoolActions);