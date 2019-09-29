import ClueAssignmentAction from '../action';

import {storageUtil} from 'ant-utils';
const session = storageUtil.session;

let emptyStrategy = {
    id: '',
    name: '',
    condition: [{province: []}],
    user_name: '',
    member_id: '',
    sales_team_id: '',
    sales_team: '',
    description: '',
    status: 'enable'
};

class ClueAssignmentStore {
    constructor() {
        this.setInitialData();
        this.bindActions(ClueAssignmentAction);
    }

    // 初始化数据
    setInitialData() {
        this.loading = false; // 获取线索分配策略的loading
        this.listenScrollBottom = false;
        this.strategyList = []; //线索分配策略数组
        this.strategyTotal = 0; // 线索分配策略数量
        this.getStrategyListErrMsg = ''; // 获取策略列表失败的信息
        this.currentStrategy = emptyStrategy; // 编辑/添加 状态时，需要提交的线索分配策略
        this.formType = 'add'; //表单的类型：添加/修改
        this.isShowStrategyDetail = false; // 是否显示策略详情，默认false
        this.isShowStrategyForm = false; // 是否显示策略表单，默认false
        this.isGetStrategyDetailLoading = false; // 获取策略详情的loading
        this.selectedRegions = [];//已选择的地域
        this.salesManList = [];//所有销售人员的列表
        this.regions = [];//可选择的地域
        this.lastId = '';//最后一个线索分配策略
        this.pageSize = 20;//一页可以展示的个数
        this.curPage = 1;//当前第几页
        this.initialRegion();
    }

    // 设置当前成员的loading
    setStrategyLoading(flag) {
        this.isGetStrategyDetailLoading = flag;
        if (flag) {
            this.getStrategyListErrMsg = ''; // 重新获取详情时，清空之前的错误提示
        }
    }
    //点击成员查看详情时，先设置已有的详情信息
    setCurStrategy(strategyId) {
        this.currentStrategy = _.find(this.strategyList, item => item.id === strategyId) || emptyStrategy;
    }
    // 显示成员详情
    showStrategyInfoPanel() {
        this.isShowStrategyDetail = true;
        this.isShowStrategyForm = false;
    }
    // 显示成员表单
    showStrategyForm(type) {
        if (type === 'add') {
            this.currentStrategy = emptyStrategy;
        }
        this.formType = type;
        this.isShowStrategyDetail = false;
        this.isShowStrategyForm = true;
    }
    // 关闭右侧添加面板
    closeInfoRightPanel() {
        this.isShowStrategyDetail = false;
        this.currentStrategy = null;
    }
    // 关闭右侧线索分配策略详情面板
    closeFormRightPanel() {
        this.isShowStrategyForm = false;
    }
    //处理线索分配策略列表
    handleStrategy() {
        //取出来所有已经选择的地域并且剔除掉
        let selectedRegions = _.map(this.strategyList, strategy => strategy.condition.province);
        selectedRegions = _.reduce(selectedRegions, (mergedRegion, region) => _.concat(mergedRegion, region), []);
        this.deleteRegion(selectedRegions);
    }
    //获取线索分配策略列表
    getAssignmentStrategies({isGetStrategyDetailLoading, getStrategyListErrMsg, strategyList, strategyTotal}) {
        if(isGetStrategyDetailLoading){
            this.isGetStrategyDetailLoading = isGetStrategyDetailLoading;
            this.getStrategyListErrMsg = '';
        }else if(getStrategyListErrMsg){
            this.isGetStrategyDetailLoading = false;
            this.getStrategyListErrMsg = getStrategyListErrMsg;
        }else{
            this.isGetStrategyDetailLoading = false;
            this.getStrategyListErrMsg = '';
            this.strategyTotal = strategyTotal;
            if(_.get(strategyList, '[0]')){
                if(this.lastId){
                    this.strategyList = this.strategyList.concat(strategyList);
                }else{
                    this.strategyList = strategyList;
                }
                //去重
                this.strategyList = _.uniqBy(this.strategyList, 'id');
                this.lastId = _.last(this.strategyList).id;
                this.handleStrategy();
            }
        }
    }
    //添加线索分配策略
    addStrategy(strategy){
        if(_.isEmpty(this.lastId)) {
            this.lastId = strategy.id;
        }
        this.strategyList.unshift(strategy);
        this.strategyTotal++;
        //添加完后处理当前的地域列表
        let selectedRegions = strategy.condition.province;
        this.deleteRegion(selectedRegions);
    }
    //删除线索分配策略
    deleteStrategyById(id) {
        let strategyList = _.cloneDeep(this.strategyList);
        let deletedStrategy = _.find(strategyList, list => _.isEqual(list.id, id));
        this.strategyList = _.filter(strategyList, list => !_.isEqual(list.id , id));
        this.strategyTotal--;
        //添加完后处理当前的地域列表
        let selectedRegions = deletedStrategy.condition.province;
        this.addRegion(selectedRegions);
    }
    //更新线索分配策略列表
    updateStrategy(newStrategy) {
        //更新前处理当前的地域列表
        //将之前选择的地域加回可选择的地域列表
        let updateStrategy = _.find(this.strategyList, strategy => newStrategy.id === strategy.id);
        let oldRegions = _.get(updateStrategy, 'condition.province', []);
        this.addRegion(oldRegions);
        //将更新后的地域从可选择的地域列表中删除
        let newRegions = _.get(newStrategy, 'condition.province', []);
        this.deleteRegion(newRegions);
        //更新线索分配策略
        _.forEach(this.strategyList, strategy => {
            if(newStrategy.id === strategy.id){
                _.extend(strategy,newStrategy);
                return false;
            }
        });
    }
    //初始select里的地域
    initialRegion() {
        let areaInfo = session.get('area_info');
        this.regions = _.map(areaInfo, area => area.name);
    }
    //获取所有的销售人员的列表
    getAllSalesManList(list) {
        this.salesManList = _.isArray(list) ? list : [];
    }
    //将已选择的地域清除
    deleteRegion(list) {
        this.selectedRegions = _.uniq(_.concat(this.selectedRegions, list));
        //将已选择的地域剔除出去
        this.regions = _.difference(this.regions, this.selectedRegions);
    }
    //当删除线索分配策略时，地域可以被重新展示
    addRegion(list) {
        this.selectedRegions = _.uniq(_.difference(this.selectedRegions, list));
        //将已选择的地域展示回去
        this.regions = _.concat(this.regions, list);
    }
    //更新每页的个数
    updatePageSize(pageSize) {
        this.pageSize = pageSize;
    }
    updateCurPage(curPage){
        this.curPage = curPage;
    }
}

export default alt.createStore(ClueAssignmentStore, 'ClueAssignmentStore');