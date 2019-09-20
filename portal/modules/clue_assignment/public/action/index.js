import {getAssignmentStrategies} from '../ajax';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
let scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;

class ClueAssignmentAction {
    constructor() {
        this.generateActions(
            'closeInfoRightPanel', // 关闭添加右侧面板
            'closeFormRightPanel', // 关闭线索策略详情右侧面板
            'setCurStrategy', // 设置当前的线索分配策略
            'setStrategyLoading', // 设置当前策略的loading
            'showStrategyInfoPanel', // 显示分配策略详情面板
            'showStrategyForm',// 显示分配策略的编辑面板
            'setInitialData', // 初始化分配策略
            'addStrategy',//添加线索分配策略
            'deleteStrategyById',//删除线索分配策略
            'updateStrategy',//更新线索分配策略列表
            'getRegionList', //获取地域列表
            'updatePageSize',//更新页面个数
            'updateCurPage',//更新当前页面
        );
    }

    //获取线索分配策略列表
    getAssignmentStrategies(queryBody) {
        this.dispatch({isGetStrategyDetailLoading: true});
        getAssignmentStrategies(queryBody).then(result => {
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({isGetStrategyDetailLoading: false, getStrategyListErrMsg: '', strategyList: result.detail, strategyTotal: result.total});
        }, error => {
            scrollBarEmitter.emit(scrollBarEmitter.STOP_LOADED_DATA);
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({isGetStrategyDetailLoading: false, getStrategyListErrMsg: error || Intl.get('clue.assignment.strategy.fail.to.get', '获取线索分配策略列表失败'), strategyList: [], strategyTotal: 0});
        });
    }
    // 获取所有成员
    getAllSalesManList() {
        getAllSalesUserList((allUserList) => {
            this.dispatch(allUserList);
        });
    }
}

export default alt.createActions(ClueAssignmentAction);