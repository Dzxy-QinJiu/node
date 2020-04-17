/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/01.
 */
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import { Checkbox, Button, message, Popover, notification, Tag } from 'antd';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var clueCustomerStore = require('MOD_DIR/clue_customer/public/store/clue-customer-store');
import {batchPushEmitter, notificationEmitter, showWiningClueEmitter} from 'PUB_DIR/sources/utils/emitters';
var paymentEmitter = require('PUB_DIR/sources/utils/emitters').paymentEmitter;
var batchOperate = require('PUB_DIR/sources/push/batch');
import userData from 'PUB_DIR/sources/user-data';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import ShearContent from 'CMP_DIR/shear-content';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import classNames from 'classnames';
import {
    SetLocalSalesClickCount,
    isCommonSalesOrPersonnalVersion, getClueSalesList, getLocalSalesClickCount, HASEXTRACTBYOTHERERRTIP
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import { formatSalesmanList, checkCurrentVersionType,
    checkVersionAndType, isResponsiveDisplay, isShowWinningClue, isCurtao } from 'PUB_DIR/sources/utils/common-method-util';
import { getMaxLimitExtractClueCount, updateGuideMark } from 'PUB_DIR/sources/utils/common-data-util';
import Trace from 'LIB_DIR/trace';
import { BOOT_PROCESS_KEYS, COMPANY_PHONE, COMPANY_VERSION_KIND, extractIcon, GIFT_LOGO} from 'PUB_DIR/sources/utils/consts';
import WinningClue from 'CMP_DIR/winning-clue';
const CLUE_RECOMMEND_SELECTED_SALES = 'clue_recommend_selected_sales';

const LAYOUT_CONSTANCE = {
    TITLE_HEIGHT: 70,// 顶部标题区域高度
    PADDING_TOP: 24,// 距离顶部标题区域高度
    BTN_PADDING: 10, //底部按钮区域高度
};

//线索推荐面板的静态常量集合
const EXTRACT_CLUE_CONST_MAP = {
    ANOTHER_BATCH: 'anotherBatch',//换一批
    LAST_HALF_YEAR_REGISTER: '最近半年注册',
};

const HOT_SELECTORS = [/*{
    name: Intl.get('clue.recommend.return.to.work', '已复工企业'),
    value: '复工'
},*/{
        name: Intl.get('clue.recommend.listed', '上市企业'),
        value: '上市'
    }, {
        name: Intl.get('clue.recommend.register.half.year', '最近半年注册'),
        value: EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER
    },{
        name: Intl.get('clue.recommend.mask.Manufactor', '口罩厂家'),
        value: '口罩厂家'
    },{
        name: Intl.get('clue.recommend.State-owned.enterprise', '国有企业'),
        value: '规模'
    },];

const CONTACT_PHONE_CLS = 'extract-clue-contact-count';

class ExtractClues extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            singleExtractLoading: false, // 单个提取的loading
            batchExtractLoading: false,
            saveErrorMsg: '',
            selectedRecommendClues: [],//选中状态的推荐线索
            disabledCheckedClues: [],//禁用状态的线索,用于记录提取之前selected中的线索数量
            salesMan: '',
            salesManNames: '',
            unSelectDataTip: '', // 没有选择销售时的提示
            hasExtractCount: 0,//已经提取的推荐线索的数量
            maxLimitExtractNumber: 0,//该账号的最大提取线索数量（试用账号是今天的，正式账号是本月的）
            getMaxLimitExtractNumberError: false,//获取该账号的最大提取量出错
            hasNoExtractCountTip: false,//批量操作展示popover
            disableExtract: false,//是否还能提取
            batchSelectedSales: '',//记录当前批量选择的销售，销销售团队id
            canClickExtract: true, //防止连续点击批量提取相同线索
            showDifferentVersion: false,//是否显示版本信息面板
            isShowWiningClue: false, // 是否显示领线索活动界面
            ...clueCustomerStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    componentDidMount() {
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.on(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        paymentEmitter.on(paymentEmitter.ADD_CLUES_PAYMENT_SUCCESS, this.handleUpdateClues);
        this.getRecommendClueCount('didMount');
        clueCustomerStore.listen(this.onStoreChange);
    }

    componentWillUnmount() {
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.removeListener(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        paymentEmitter.removeListener(paymentEmitter.ADD_CLUES_PAYMENT_SUCCESS, this.handleUpdateClues);
        clueCustomerStore.unlisten(this.onStoreChange);
    }

    batchExtractCluesLists = (taskInfo, taskParams) => {
        //如果参数不合法，不进行更新
        if (!_.isObject(taskInfo)) {
            return;
        }
        //解析tasks
        var {
            tasks
        } = taskInfo;
        //如果tasks为空，不进行更新
        if (!_.isArray(tasks) || !tasks.length) {
            return;
        }
        //检查taskDefine
        tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
        //如果没有要更新的数据
        if (!tasks.length) {
            return;
        }

        // 如果提取给的销售是自己，则需要提示刷新
        if(_.isEqual(_.get(taskParams,'user_id'), userData.getUserData().user_id)) {
            notificationEmitter.emit(notificationEmitter.UPDATED_MY_HANDLE_CLUE, {});
        }

        var clueArr = _.map(tasks, 'taskDefine');
        // 遍历每一个线索
        _.each(clueArr, (clueItem) => {
            var arr = _.split(clueItem,'_');
            //如果当前线索是需要更新的线索，才更新
            this.updateRecommendClueLists(arr[0]);
        });
        //不是引导且为列表空时
        if (!this.props.showSuccessPage && _.isEmpty(this.state.recommendClueLists)) {
            this.props.getRecommendClueLists();
        }

        this.setState({
            selectedRecommendClues: [],
            disabledCheckedClues: []
        });
    };
    //更新推荐线索列表,需要给已经提取成功的加上一个类名，界面相应的加上对应的不能处理的样式
    updateRecommendClueLists = (updateClueId) => {
        this.updateSelectedClueLists(updateClueId);
        var disabledCheckedClues = this.state.disabledCheckedClues;
        //todo 更新已提取线索量
        let hasExtractCount = this.state.hasExtractCount;
        hasExtractCount++;
        this.setState({
            disabledCheckedClues: _.filter(disabledCheckedClues,item => item.id !== updateClueId),
            hasExtractCount: hasExtractCount,
            //判断是否还能提取
            disableExtract: !this.isExtractedCount(hasExtractCount).ableExtract
        });
        clueCustomerAction.updateRecommendClueLists(updateClueId);
    };
    //更新选中的推荐线索
    updateSelectedClueLists = (updateClueId) => {
        let { selectedRecommendClues, disabledCheckedClues } = this.state;
        let name = '', list = [];
        //在这里需要判断selectedRecommendClues是否存在，不存在就使用disabledCheckedClues
        if(_.get(selectedRecommendClues, 'length')) {
            name = 'selectedRecommendClues';
            list = selectedRecommendClues;
        }else if(_.get(disabledCheckedClues, 'length')) {
            name = 'disabledCheckedClues';
            list = disabledCheckedClues;
        }
        if(name) {
            let newDate = {
                [name]: _.filter(list,item => item.id !== updateClueId)
            };

            this.setState(newDate);
        }
    };
    //标记线索已被其他人提取
    remarkLeadExtractedByOther = (remarkLeadId) => {
        this.updateSelectedClueLists(remarkLeadId);
        clueCustomerAction.remarkLeadExtractedByOther(remarkLeadId);
    };

    //处理被别人提取过的线索
    handleLeadHasExtractedByOther = (hasExtractedLeadIds) => {
        if(_.isArray(hasExtractedLeadIds)){
            _.each(hasExtractedLeadIds, remarkId => {
                this.remarkLeadExtractedByOther(remarkId);
            });
        }
    };

    // 获取待分配人员列表
    getSalesDataList = () => {
        let clueSalesIdList = getClueSalesList(CLUE_RECOMMEND_SELECTED_SALES);
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        let dataList = _.map(formatSalesmanList(this.state.salesManList), salesman => {
            let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'value'));
            return {
                ...salesman,
                clickCount
            };
        });
        return dataList;
    };

    //获取最多提取线索的数量以及已经提取多少线索
    getRecommendClueCount(callback){
        if(!_.isEqual(callback, 'didMount')) {
            this.setState({canClickExtract: false});
        }
        getMaxLimitExtractClueCount().then((data) => {
            let disableExtract = !(data.maxCount - data.hasExtractedCount);
            this.setState({
                hasExtractCount: data.hasExtractedCount,
                maxLimitExtractNumber: data.maxCount,
                disableExtract
            });
            _.isFunction(callback) && callback(data.hasExtractedCount, disableExtract);
        }, (error) => {
            _.isFunction(callback) && callback('error');
        }
        );
    }


    handleBatchAssignClues = (submitObj) => {
        if(this.state.batchExtractLoading) return;
        this.setState({
            batchExtractLoading: true,
            unSelectDataTip: '',
            saveErrorMsg: '',
            canClickExtract: false
        });
        $.ajax({
            url: '/rest/clue/batch/recommend/list',
            type: 'post',
            dateType: 'json',
            data: submitObj,
            success: (data) => {
                this.setState({
                    batchExtractLoading: false,
                    canClickExtract: true
                });
                var taskId = _.get(data, 'batch_label','');
                if (taskId){
                    //todo 到这一步，提取线索的引导就完成了，需要更新引导流程状态
                    // 更新引导流程
                    this.upDateGuideMark();
                    this.props.afterSuccess();
                    //向任务列表id中添加taskId
                    batchOperate.addTaskIdToList(taskId);
                    //存储批量操作参数，后续更新时使用
                    var batchParams = _.cloneDeep(submitObj);
                    batchOperate.saveTaskParamByTaskId(taskId, batchParams, {
                        showPop: true,
                        urlPath: '/leads'
                    });
                    //总的被选中的线索数量
                    var totalSelectedSize = _.get(this.state,'disabledCheckedClues.length',0);
                    //已经被提取的线索
                    var hasExtractedLeadIds = _.get(data,'picked',[]);
                    var hasExtractedLeadCount = hasExtractedLeadIds.length;
                    if(totalSelectedSize >= hasExtractedLeadCount){
                        //去掉被提取的线索数量，因为这些不会有推送
                        totalSelectedSize -= hasExtractedLeadCount;
                    }
                    //在这些数据上加一个特殊的标识
                    if(hasExtractedLeadCount){
                        this.handleLeadHasExtractedByOther(hasExtractedLeadIds);
                    }
                    //立即在界面上显示推送通知
                    //界面上立即显示一个初始化推送
                    //批量操作参数
                    batchOperate.batchOperateListener({
                        taskId: taskId,
                        total: totalSelectedSize,
                        running: totalSelectedSize,
                        typeText: Intl.get('clue.extract.clue', '提取线索')
                    });
                    this.clearSelectSales();
                    let batchSelectedSales = this.state.batchSelectedSales;
                    SetLocalSalesClickCount(batchSelectedSales, CLUE_RECOMMEND_SELECTED_SALES);
                }
            },
            error: (errorInfo) => {
                var errTip = errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败');
                this.setState({
                    canClickExtract: true,
                    batchExtractLoading: false,
                    disabledCheckedClues: [],
                    selectedRecommendClues: _.get(this.state,'disabledCheckedClues', [])
                    // saveErrorMsg: errTip,
                    // unSelectDataTip: errTip
                });
                //如果提取失败的原因是因为被提取过，将该推荐线索设置不可点击并且前面加提示
                if(_.includes(HASEXTRACTBYOTHERERRTIP, errTip)){
                    this.handleLeadHasExtractedByOther(submitObj.companyIds);
                    if (this['changeSales']) {
                        //隐藏批量变更销售面板
                        this['changeSales'].handleCancel();
                    }
                }
                message.error(errTip);
            }
        });
    };

    // 判断是否为普通销售
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };
    //判断是否为管理员
    isManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN); // 返回true，说明是管理员，否则是销售或运营
    };
    // 是否是管理员或者运营人员
    isManagerOrOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };
    clearSelectSales = () => {
        this.setState({
            salesMan: '',
            salesManNames: '',
        });
    };
    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        this.setState({salesManNames, unSelectDataTip: ''});
    };
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        this.setState({salesMan,unSelectDataTip: ''});
    };

    renderSalesBlock = () => {
        let dataList = this.getSalesDataList();
        //按点击的次数进行排序
        dataList = _.sortBy(dataList,(item) => {return -item.clickCount;});
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    };

    // 批量提取，发请求前的参数处理
    handleBeforeSubmitChangeSales = (itemId) => {
        let list_id = this.state.recommendClueListId;
        if(isCommonSalesOrPersonnalVersion()) {// 普通销售或者个人版
            let saleLoginData = userData.getUserData();
            let submitObj = {
                'user_id': saleLoginData.user_id,
                'user_name': saleLoginData.nick_name,
                'sales_team_id': saleLoginData.team_id,
                'sales_team': saleLoginData.team_name,
            };
            if(list_id) {
                submitObj.list_id = list_id;
            }
            if(_.isArray(itemId)) {
                submitObj.companyIds = itemId;
            }
            return submitObj;
        }else {// 管理员，运营人员或销售领导
            if(!this.state.salesMan) {
                this.setState({unSelectDataTip: Intl.get('crm.17', '请选择销售人员')});
            }else {
                let user_id = '', sales_team_id = '', user_name = '', sales_team = '';
                // 销售id和所属团队的id，中间是用&&连接的 格式为销售id&&所属团队id
                let idArray = this.state.salesMan.split('&&');
                if(_.isArray(idArray) && idArray.length) {
                    user_id = idArray[0];//销售id
                    sales_team_id = idArray[1] || '';//所属团队id
                }
                // 销售的名字和团队的名字 格式是 销售名称-团队名称
                let nameArray = this.state.salesManNames.split('-');
                if(_.isArray(nameArray) && nameArray.length) {
                    user_name = nameArray[0];//销售的名字
                    sales_team = _.trim(nameArray[1]) || '';//团队的名字
                }
                let submitObj = {user_id, user_name, sales_team_id, sales_team};
                if(list_id) {
                    submitObj.list_id = list_id;
                }
                if (itemId){
                    submitObj.companyIds = itemId;
                }
                return submitObj;
            }
        }
    };
    getTimeRangeText = () => {
        return checkCurrentVersionType().trial ? Intl.get('user.time.today', '今天') : Intl.get('common.this.month', '本月');
    };

    handleClickWinningClue = () => {
        this.setState({
            isShowWiningClue: true
        }, () => {
            GeminiScrollbar.scrollTo(this.refs.scrolltoTop, 0);
            showWiningClueEmitter.emit(showWiningClueEmitter.SHOW_WINNING_CLUE);
        });
    }

    handleClickCloseWinningClue = (flag) => {
        this.setState({
            isShowWiningClue: flag
        });
    }

    renderWinningClueBtn = () => {
        return (
            <Button
                className="winning-clue-btn"
                data-tracename="点击领线索按钮"
                onClick={this.handleClickWinningClue}
            >
                <img className="gift-logo" src={GIFT_LOGO} />
                <span className="text">领线索</span>
            </Button>
        );
    }

    getSelectedClues = () => {
        return _.isEmpty(this.state.selectedRecommendClues) ? this.state.disabledCheckedClues : this.state.selectedRecommendClues;//选中的线索
    };

    // 可提取数为0时，或者选中的个数等于可提取数时
    isExtractedCount(hasExtractCount) {
        let selectedRecommendClues = this.getSelectedClues();
        let selectedClueLength = _.get(selectedRecommendClues, 'length',0);
        let maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        hasExtractCount = hasExtractCount || this.state.hasExtractCount;
        //可提取数
        let ableExtract = maxLimitExtractNumber > hasExtractCount ? maxLimitExtractNumber - hasExtractCount : 0;
        //选中的个数等于可提取数时
        let isExtractedEqual = _.isEqual(selectedClueLength, ableExtract);

        return {
            ableExtract,
            isExtractedEqual
        };
    }

    //提取数为0时显示的提示信息
    hasNoExtractCountTip = () => {
        var maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        var ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;
        let versionAndType = checkVersionAndType();
        const i18Obj = {
            hasExtract: <span className="has-extracted-count">
                {this.state.hasExtractCount}</span>,
            ableExtract: <span className="has-extracted-count">{ableExtract}</span>, timerange: this.getTimeRangeText()
        };
        let maxLimitTip = <ReactIntl.FormattedMessage
            id="clue.recommend.default.tip"
            defaultMessage={'{timerange}还可提取{ableExtract}条线索'}
            values={i18Obj}
        />;
        if(versionAndType.isPersonalTrial || versionAndType.isCompanyTrial) {//个人试用/企业试用,展示领取线索按钮
            maxLimitTip = (
                <React.Fragment>
                    <ReactIntl.FormattedMessage
                        id="clue.recommend.default.tip"
                        defaultMessage={'{timerange}还可提取{ableExtract}条线索'}
                        values={i18Obj}
                    />
                    {
                        isShowWinningClue() ? this.renderWinningClueBtn() : null
                    }
                </React.Fragment>
            );
        }
        return maxLimitTip;
    };
    //超限时的事件处理
    handleExtractLimit = (disableExtract) => {
        var maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        var ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;
        let versionAndType = checkVersionAndType();
        const i18Obj = {hasExtract: <span className="has-extracted-count">{this.state.hasExtractCount}</span>, ableExtract: <span className="has-extracted-count">{ableExtract}</span>, timerange: this.getTimeRangeText()};
        let maxLimitTip = null;

        /***
         * 超限下的处理
         * 个人试用：直接滑出付费界面
         * 个人正式、企业正式管理员：直接滑出增加线索量界面
         * 企业试用、企业正式销售，展示notification弹框
         *
         * 选中个数超过可提取数时
         * 个人版和企业正式管理员：直接弹出付费或者购买线索量界面
         * 企业试用和企业正式销售，展示notification弹框
        */
        if(versionAndType.isPersonalTrial) {//个人试用
            Trace.traceEvent(ReactDOM.findDOMNode(this), '超限后再提取线索自动打开个人升级界面');
            this.handleUpgradePersonalVersion();
        }else if(versionAndType.isPersonalFormal//个人正式版
            || versionAndType.isCompanyFormal && this.isManager()) { //或企业正式版管理员
            Trace.traceEvent(ReactDOM.findDOMNode(this), '超限后再提取线索自动打开增加线索量界面');
            this.handleClickAddClues();
        }else if(disableExtract && versionAndType.isCompanyTrial) {//超限时，企业试用
            maxLimitTip = <ReactIntl.FormattedMessage
                id="clue.recommend.company.trial.extract.num.limit.tip"
                defaultMessage={'还可提取{count}条，如需继续提取,请联系我们的销售人员进行升级，联系方式：{contact}'}
                values={{
                    count: <span className="has-extracted-count">{ableExtract}</span>,
                    contact: COMPANY_PHONE
                }}
            />;
        } else if(disableExtract && versionAndType.isCompanyFormal && !this.isManagerOrOperation()) {//超限时，企业正式版销售（除了管理员和运营人员）
            maxLimitTip = <ReactIntl.FormattedMessage
                id="clue.recommend.company.formal.sales.extract.num.limit.tip"
                defaultMessage={'本月{count}条已提取完毕，如需继续提取请联系管理员'}
                values={{
                    count: <span className="has-extracted-count">{maxLimitExtractNumber}</span>
                }}
            />;
        }else {//选中个数超过可提取数时
            maxLimitTip = <ReactIntl.FormattedMessage
                id="clue.recommend.has.extract.count"
                defaultMessage="{timerange}已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索"
                values={i18Obj}
            />;
        }

        if(maxLimitTip) {
            notification.open({
                key: Date.now(),
                description: (<div>
                    <i className="iconfont icon-warn-icon"/>
                    {maxLimitTip}
                </div>),
                className: 'extract-notification-wrapper'
            });
        }
    };

    batchAssignRecommendClues = (submitObj) => {
        this.setState({
            hasNoExtractCountTip: false,
            batchSelectedSales: _.cloneDeep(this.state.salesMan) //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        });
        this.handleBatchAssignClues(submitObj);
    };
    handleSubmitAssignSalesBatch = () => {
        if(!this.state.canClickExtract) return;
        let selectedIds = _.map(this.state.selectedRecommendClues,'id');
        if(_.isEmpty(selectedIds)) {return;}
        //如果是选了修改全部
        let submitObj = this.handleBeforeSubmitChangeSales(selectedIds);
        if (_.isEmpty(submitObj)){
            return;
        }else{
            //批量提取之前要验证一下可以再提取多少条的数量，如果提取的总量比今日上限多，就提示还能再提取几条
            //如果获取提取总量失败了,就不校验数字了
            //点击批量提取后把select的check选中状态都取消，并且加上disabled的样式
            this.setState({
                disabledCheckedClues: this.state.selectedRecommendClues
            },() => {
                this.setState({
                    selectedRecommendClues: [],
                });
            });
            if(this.state.getMaxLimitExtractNumberError){
                this.batchAssignRecommendClues(submitObj);
            }else{
                this.getRecommendClueCount((count, disableExtract) => {
                    let currentVersionType = checkCurrentVersionType();
                    if (
                        //获取已经提取的线索失败了就不校验了 获取失败count返回的是字符串‘error’
                        _.isNumber(count) &&
                        //是试用账号或者正式账号
                        (currentVersionType.trial || currentVersionType.formal) &&
                        //已经提取的数量和这次要提取数量之和大于最大限制的提取数
                        count + _.get(this, 'state.disabledCheckedClues.length') > this.state.maxLimitExtractNumber
                    ){
                        this.setState({
                            hasNoExtractCountTip: true,
                            canClickExtract: true,
                            disabledCheckedClues: [],
                            selectedRecommendClues: disableExtract ? [] : this.state.disabledCheckedClues
                        });
                        this.handleExtractLimit(disableExtract);

                        if (this['changeSales']) {
                            //隐藏批量变更销售面板
                            this['changeSales'].handleCancel();
                        }
                    }else{
                        this.batchAssignRecommendClues(submitObj);
                    }
                });
            }
        }
    };

    handleCheckChange = (item, e) => {
        let checked = e.target.checked;
        let selectedRecommendClues = this.state.selectedRecommendClues;
        if(checked) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.extract-clue-item .ant-checkbox-wrapper'), '点击选中某个线索');
            selectedRecommendClues.push(item);
        }else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.extract-clue-item .ant-checkbox-wrapper'), '点击取消选中某个线索');
            selectedRecommendClues = _.filter(selectedRecommendClues, recommend => {
                return recommend.id !== item.id;
            });
        }
        this.setState({
            selectedRecommendClues: _.uniqBy(selectedRecommendClues, 'id'),
            hasNoExtractCountTip: false
        });
    };

    // 全选/反选
    handleCheckAllChange = (e) => {
        let canExtractClues = [];
        let isCheckAll = this.isCheckAll();
        if(!isCheckAll) {
            canExtractClues = _.filter(this.state.recommendClueLists, item => {
                return !this.getDisabledClue(item);
            });
        }
        this.setState({selectedRecommendClues: canExtractClues, hasNoExtractCountTip: false});
        Trace.traceEvent(e, '点击选中/取消选中全部线索');
    };
    isCheckAll = () => {
        let canExtractClues = _.filter(this.state.recommendClueLists, item => {
            return !this.getDisabledClue(item);
        });
        return canExtractClues.length > 0 && canExtractClues.length === this.state.selectedRecommendClues.length;
    };
    //是否选中
    hasChecked = (record) => {
        return _.find(this.getSelectedClues(), item => item.id === record.id);
    };

    handleUpdatePersonalVersion = (result) => {
        //需要更新最大线索量
        let lead_limit = _.get(result, 'version.lead_limit', '');
        let clue_number = _.get(lead_limit.split('_'),'[0]',0);
        this.setState({
            maxLimitExtractNumber: +clue_number,
            getMaxLimitExtractNumberError: false,
            hasNoExtractCountTip: false,
            disabledCheckedClues: [],
            disableExtract: false
        });
    };
    //个人试用升级为正式版
    handleUpgradePersonalVersion = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            isShowModal: false,//是否显示个人版界面遮罩层
            isShowLeadModal: false,//是否显示购买线索量遮罩层
            showDifferentVersion: this.triggerShowVersionInfo
        });
    };
    //显示/隐藏版本信息面板
    triggerShowVersionInfo = (isShowModal = true) => {
        paymentEmitter.emit(paymentEmitter.OPEN_APPLY_TRY_PANEL, {isShowModal, versionKind: COMPANY_VERSION_KIND});
    };
    handleUpdateClues = (result) => {
        let count = _.get(result, 'count', 0);
        let maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        this.setState({
            maxLimitExtractNumber: count + maxLimitExtractNumber,
            getMaxLimitExtractNumberError: false,
            hasNoExtractCountTip: false,
            disabledCheckedClues: [],
            disableExtract: false
        });
    };
    //增加线索量
    handleClickAddClues = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_ADD_CLUES_PANEL, {isShowModal: false});
    };

    //该线索前的checkbox不可用
    getDisabledClue = (record) => {
        // 有hasExtracted属性是已经成功提取了的,有hasExtractedByOther属性是已经被别人提取了的
        return record.hasExtracted || _.find(this.state.disabledCheckedClues,item => item.id === record.id) || record.hasExtractedByOther;
    };

    //点击线索名，选中checkbox
    handleClickClueName = (item, event) => {
        let target = _.get(event,'target');

        if( //如果被禁用了，点击后无效
            this.getDisabledClue(item)
            //如果是电话和提取按钮点击冒泡上来的，不触发选中checkbox
            || _.includes(['iconfont icon-extract', CONTACT_PHONE_CLS, `${CONTACT_PHONE_CLS} ant-popover-open`,'ant-checkbox-input'], _.get(target,'className'))) {
            return false;
        }

        let isSelected = _.find(this.state.selectedRecommendClues, clueItem => clueItem.id === item.id);
        this.handleCheckChange(item,{target: {checked: !isSelected}});
    };

    setInvalidClassName = (record) => {
        var cls = '';
        if(record.hasExtracted){
            cls += ' has-extracted-row';
        }
        if(record.hasExtractedByOther){
            cls += ' has-extracted-by-other-row';
        }
        return cls;
    };

    upDateGuideMark = () => {
        updateGuideMark(BOOT_PROCESS_KEYS.EXTRACT_CLUE);
    };

    //处理高亮文字
    handleHighLightStyle(text) {
        //百捷集团武汉<em>百度</em>分公司
        return {
            content: _.replace(text, /<em>/g, '<em class="text-highlight">'),
            hasHighLight: text && text.indexOf('<em>') > -1
        };
    }

    handleExtractRecommendClues = (reqData) => {
        //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        let salesMan = _.cloneDeep(this.state.salesMan);
        var leadId = _.get(reqData,'companyIds[0]');
        $.ajax({
            url: '/rest/clue/extract/recommend/clue',
            dataType: 'json',
            type: 'post',
            data: reqData,
            success: (data) => {
                this.setState({
                    singleExtractLoading: false,
                    canClickExtract: true
                });
                if (data){
                    if (this['changeSales' + leadId]) {
                        //隐藏批量变更销售面板
                        this['changeSales' + leadId].handleCancel();
                    }
                    // 更新引导流程
                    this.upDateGuideMark();
                    this.props.afterSuccess();
                    //提取成功后，把该线索在列表中删除
                    // message.success(Intl.get('clue.extract.success', '提取成功'));
                    this.clearSelectSales();
                    SetLocalSalesClickCount(salesMan, CLUE_RECOMMEND_SELECTED_SALES);
                    this.updateRecommendClueLists(leadId);
                    //线索提取完后，会到待分配状态中
                }else{
                    message.error(Intl.get('clue.extract.failed', '提取失败'));
                }
            },
            error: (errorInfo) => {
                this.setState({
                    singleExtractLoading: false,
                    canClickExtract: true
                });
                var errTip = errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败');
                //如果提取失败的原因是因为被提取过，将该推荐线索设置不可点击并且前面加提示
                if(_.includes(HASEXTRACTBYOTHERERRTIP, errTip)){
                    this.handleLeadHasExtractedByOther(reqData.companyIds);
                    if (this['changeSales' + leadId]) {
                        //隐藏批量变更销售面板
                        this['changeSales' + leadId].handleCancel();
                    }
                }
                message.error(errTip);
            }
        });

    };
    extractRecommendCluesSingele = (record) => {
        this.setState({
            hasNoExtractCountTip: false
        });
        let submitObj = this.handleBeforeSubmitChangeSales([record.id]);
        this.handleExtractRecommendClues(submitObj);
    };
    //单个提取线索
    handleExtractClueAssignToSale = (record, flag) => {
        //如果这条线索已经提取过了或正在提取，就不能再点击提取了
        if(record.hasExtracted || record.hasExtractedByOther || this.state.singleExtractLoading){
            return;
        }
        if (!this.state.salesMan && flag) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            this.setState({
                singleExtractLoading: true
            });
            //提取线索前，先发请求获取还能提取的线索数量
            //如果获取能提取的总量出错了就不用发请求了获取已经提取的线索量，直接提取就可以，后端有校验
            if(this.state.getMaxLimitExtractNumberError){
                this.extractRecommendCluesSingele(record);
            }else{
                this.getRecommendClueCount((count, disableExtract) => {
                    let currentVersionType = checkCurrentVersionType();
                    //如果获取出错了就不要校验数字了
                    if (_.isNumber(count) &&
                        //是试用账号或者正式账号
                        (currentVersionType.trial || currentVersionType.formal) &&
                        count >= this.state.maxLimitExtractNumber
                    ){
                        this.setState({
                            hasNoExtractCountTip: true,
                            singleExtractLoading: false,
                            canClickExtract: true
                        });
                        this.handleExtractLimit(disableExtract);

                        if (this['changeSales' + record.id]) {
                            //隐藏批量变更销售面板
                            this['changeSales' + record.id].handleCancel();
                        }
                    }else{
                        this.extractRecommendCluesSingele(record);
                    }
                });
            }
        }
    };
    //渲染单项中的提取按钮
    extractClueOperator = (record) => {
        // 提取线索分配给相关的销售人员的权限
        let hasAssignedPrivilege = !isCommonSalesOrPersonnalVersion();
        if (hasAssignedPrivilege) {
            return (
                <AntcDropdown
                    isDropdownAble={record.hasExtracted}
                    datatraceContainer='线索推荐页面单个提取'
                    ref={assignSale => this['changeSales' + record.id] = assignSale}
                    content={
                        <span
                            data-tracename="点击提取按钮"
                            className="assign-btn"
                        >
                            {extractIcon}
                        </span>}
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    isSaving={this.state.singleExtractLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege)}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}
                />
            );
        } else {
            return (
                <span
                    onClick={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege)}
                    data-tracename='单个提取推荐线索'
                >
                    {extractIcon}
                </span>
            );
        }
    };

    renderBackBtn = () => {
        return (
            <Button
                type='primary'
                className='back-btn'
                data-tracename="点击修改推荐条件"
                onClick={this.props.handleBackClick}
            >{Intl.get('clue.customer.condition.change', '修改条件')}</Button>
        );
    };

    renderRecommendLists = () => {
        let {
            recommendClueLists,
            settedCustomerRecommend,
            isLoadingRecommendClue,
            getRecommendClueErrMsg
        } = this.state;
        if(settedCustomerRecommend.loading || isLoadingRecommendClue) {
            return (
                <div className="load-content">
                    <Spinner className='home-loading'/>
                </div>
            );
        }else if(getRecommendClueErrMsg && getRecommendClueErrMsg !== Intl.get('errorcode.168', '符合条件的线索已被提取完成，请修改条件再查看')) {
            return (
                <div className="errmsg-container">
                    <span className="errmsg-tip">{getRecommendClueErrMsg},</span>
                    <a className="retry-btn" data-tracename="点击重新获取推荐线索按钮" onClick={this.getRecommendLists}>
                        {Intl.get('user.info.retry', '请重试')}
                    </a>
                </div>
            );
        }else if(!_.get(recommendClueLists,'[0]')) {
            return (
                <NoDataIntro
                    noDataAndAddBtnTip={Intl.get('clue.no.data.during.range.and.status', '没有符合条件的线索')}
                    renderAddAndImportBtns={this.renderBackBtn}
                    showAddBtn
                />
            );
        }else {
            return (
                <div className="extract-clue-panel-container">
                    {
                        _.map(recommendClueLists, item => {
                            const cls = 'extract-clue-item' + this.setInvalidClassName(item);
                            let otherProps = {
                                products: this.handleHighLightStyle(item.products),
                                scope: this.handleHighLightStyle(item.scope),
                                industry: this.handleHighLightStyle(item.industry),
                                companyProfile: this.handleHighLightStyle(item.companyProfile),
                            };
                            const otherCls = classNames('extract-clue-text__info extract-clue-text__filters', {
                                'extract-clue-text__null': !otherProps.products.hasHighLight && !otherProps.scope.hasHighLight && !otherProps.industry.hasHighLight && !otherProps.companyProfile.hasHighLight
                            });
                            let labels = item.labels.concat(item.features);
                            return (
                                <div className={cls} key={item.id} onClick={this.handleClickClueName.bind(this, item)}>
                                    <Checkbox checked={this.hasChecked(item)} disabled={this.getDisabledClue(item)} onChange={this.handleCheckChange.bind(this, item)}/>
                                    <div className="extract-clue-text-wrapper" title={item.hasExtractedByOther ? Intl.get('errorcode.169', '该线索已被提取') : ''}>
                                        <div className="extract-clue-text__name">
                                            {item.hasExtractedByOther ? <i className='iconfont icon-warning-tip'/> : null}
                                            <span dangerouslySetInnerHTML={{__html: this.handleHighLightStyle(item.name).content}}/>
                                            {labels.length ? (
                                                <div className="clue-labels">
                                                    {_.map(labels, (tag, index) => (
                                                        <Tag key={index}>{tag}</Tag>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="extract-clue-text__filters">
                                            {item.startTime ? (
                                                <div className="extract-clue-text-item">
                                                    <span className="extract-clue-text-label">{Intl.get('clue.customer.register.time', '注册时间')}：</span>
                                                    <span> { moment(item.startTime).format(oplateConsts.DATE_FORMAT)}</span>
                                                </div>
                                            ) : null}
                                            <div className="extract-clue-text-item">
                                                {_.get(item.contact, 'phones') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">{Intl.get('common.phone', '电话')}：</span>
                                                        <Popover trigger="hover" content={_.get(item,'telephones').map(phone => (<div key={phone}>{phone}</div>))}>
                                                            <span className={CONTACT_PHONE_CLS}>{_.get(item.contact, 'phones')}</span>
                                                        </Popover>
                                                        {Intl.get('contract.22', '个')}
                                                    </span>
                                                ) : null}
                                                {_.get(item.contact, 'email') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">{Intl.get('common.email', '邮箱')}：</span>
                                                        <span>{Intl.get('clue.recommend.clue.count', '{count}个', {
                                                            count: _.get(item.contact, 'email')
                                                        })}</span>
                                                    </span>
                                                ) : null}
                                                {_.get(item.contact, 'qq') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">QQ：</span>
                                                        <span>{Intl.get('clue.recommend.clue.count', '{count}个', {
                                                            count: _.get(item.contact, 'qq')
                                                        })}</span>
                                                    </span>
                                                ) : null}
                                                {_.get(item.contact, 'weChat') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">{Intl.get('crm.58', '微信')}：</span>
                                                        <span>{Intl.get('clue.recommend.clue.count', '{count}个', {
                                                            count: _.get(item.contact, 'weChat')
                                                        })}</span>
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className={otherCls}>
                                            {/*产品*/}
                                            {otherProps.products.hasHighLight ? (
                                                <div className="extract-clue-text-item">
                                                    <span>{Intl.get('common.product', '产品')}：</span>
                                                    <span dangerouslySetInnerHTML={{__html: otherProps.products.content}}/>
                                                </div>
                                            ) : null}
                                            {/*经营范围*/}
                                            {otherProps.scope.hasHighLight ? (
                                                <div className="extract-clue-text-item">
                                                    <ShearContent rowsNum={1}>
                                                        <span>{Intl.get('clue.recommend.clue.scope', '经营范围')}：</span>
                                                        <span dangerouslySetInnerHTML={{__html: otherProps.scope.content}}/>
                                                    </ShearContent>
                                                </div>
                                            ) : null}
                                            {/*行业*/}
                                            {otherProps.industry.hasHighLight ? (
                                                <div className="extract-clue-text-item">
                                                    <span>{Intl.get('menu.industry', '行业')}：</span>
                                                    <span dangerouslySetInnerHTML={{__html: otherProps.industry.content}}/>
                                                </div>
                                            ) : null}
                                            {/*简介*/}
                                            {otherProps.companyProfile.hasHighLight ? (
                                                <div className="extract-clue-text-item">
                                                    <ShearContent
                                                        rowsNum={1}
                                                    >
                                                        <span>{Intl.get('clue.recommend.clue.introduction', '简介')}：</span>
                                                        <span dangerouslySetInnerHTML={{__html: otherProps.companyProfile.content}}/>
                                                    </ShearContent>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="single-extract-clue">
                                        {item.hasExtracted ? Intl.get('common.has.been.extracted', '已提取') : (
                                            this.getDisabledClue(item) ? null : <div className="handle-btn-item">
                                                {this.extractClueOperator(item)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                    {this.renderMoreDataBlock()}
                </div>
            );
        }
    };

    renderMoreDataBlock = () => {
        let recommendList = this.state.recommendClueLists;
        let moreDataTip = null;
        if(recommendList.length >= this.state.pageSize) {
            moreDataTip = (
                <span>
                    {Intl.get('lead.recommend.refresh.list','如果没有符合您需求的线索，您可以')}
                    <a data-tracename="点击换一批按钮" onClick={this.getRecommendLists.bind(this, EXTRACT_CLUE_CONST_MAP.ANOTHER_BATCH)}>{Intl.get('clue.customer.refresh.list', '换一批')}</a>
                </span>
            );
        }else {
            moreDataTip = (
                <span>
                    {Intl.get('lead.recommend.refresh.list','如果没有符合您需求的线索，您可以')}
                    <a data-tracename="点击修改推荐条件" onClick={this.props.handleBackClick}>{Intl.get('clue.customer.condition.change', '修改条件')}</a>
                    {Intl.get('lead.recommend.change.condition', '再试试')}
                </span>
            );
        }
        return <NoMoreDataTip
            fontSize="12"
            message={moreDataTip}
            show={() => {
                return recommendList.length;
            }}
        />;
    };

    //渲染批量提取的按钮
    renderExtractOperator = (isWebMin) => {
        let hasAssignedPrivilege = !isCommonSalesOrPersonnalVersion();
        if(hasAssignedPrivilege) {
            return (
                <div>
                    <AntcDropdown
                        datatraceContainer='批量提取线索'
                        ref={ref => this['changeSales'] = ref}
                        content={
                            <Button
                                type="primary"
                                className="button-save btn-item"
                            >
                                <span className="iconfont icon-extract"/>
                                {isWebMin ? null : Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                            </Button>}
                        overlayTitle={Intl.get('user.salesman', '销售人员')}
                        okTitle={Intl.get('common.confirm', '确认')}
                        cancelTitle={Intl.get('common.cancel', '取消')}
                        isSaving={this.state.batchExtractLoading}
                        isDisabled={this.state.selectedRecommendClues.length === 0}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={this.handleSubmitAssignSalesBatch}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        placement="topRight"
                        btnAtTop={false}
                    />
                </div>
            );
        }else {
            return (
                <Button
                    title={Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                    type="primary"
                    data-tracename="点击批量提取线索按钮"
                    className='btn-item common-sale-batch-extract'
                    onClick={this.handleSubmitAssignSalesBatch}
                    disabled={this.state.batchExtractLoading}
                >
                    <span className="iconfont icon-extract"/>
                    {isWebMin ? null : Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                </Button>
            );
        }
    };

    getRecommendLists = (type) => {
        if(this.state.canClickMoreBatch) {
            this.props.getRecommendClueLists(null, type);
        }
    };

    //是否禁用全选按钮
    disabledCheckAll = () => {
        //列表为空，或者请求数据，或者提取线索中（单个和批量）
        return !this.state.recommendClueLists.length || this.state.isLoadingRecommendClue || this.state.singleExtractLoading || this.state.batchExtractLoading;
    };

    renderBtnClock = (isWebMin) => {
        let moreRotationClass = classNames('iconfont icon-change-new', {
            'change-new-icon-rotation': !this.state.canClickMoreBatch
        });
        return (
            <React.Fragment>
                <Button
                    className="btn-item"
                    data-tracename="点击修改推荐条件"
                    title={Intl.get('clue.customer.condition.change', '修改条件')}
                    onClick={this.props.handleBackClick}
                >
                    <span className="iconfont icon-modify-condition"/>
                    {isWebMin ? null : Intl.get('clue.customer.condition.change', '修改条件')}
                </Button>
                <Button
                    className="btn-item more-batch-btn"
                    data-tracename="点击换一批按钮"
                    title={Intl.get('clue.customer.refresh.list', '换一批')}
                    onClick={this.getRecommendLists.bind(this, EXTRACT_CLUE_CONST_MAP.ANOTHER_BATCH)}
                >
                    <span className={moreRotationClass}/>
                    <span>{isWebMin ? null : Intl.get('clue.customer.refresh.list', '换一批')}</span>
                </Button>
            </React.Fragment>
        );
    };

    //热门选项点击处理事件
    handleClickHotBtn = (key) => {
        if(!this.state.canClickMoreBatch) { return false; }
        let versionAndType = checkVersionAndType();
        if(versionAndType.isPersonalTrial) {//个人试用
            Trace.traceEvent(ReactDOM.findDOMNode(this), `点击'${key}'按钮自动打开个人升级界面`);
            this.handleUpgradePersonalVersion();
            return false;
        }else if(versionAndType.isCompanyTrial) {//企业试用
            Trace.traceEvent(ReactDOM.findDOMNode(this), `点击了'${key}'按钮`);
            notification.open({
                key: Date.now(),
                description: (<div>
                    <i className="iconfont icon-warn-icon"/>
                    <ReactIntl.FormattedMessage
                        id="payment.please.contact.our.sale.upgrade"
                        defaultMessage={'请联系我们的销售人员进行升级，联系方式：{contact}'}
                        values={{
                            contact: COMPANY_PHONE
                        }}
                    />
                </div>),
                className: 'extract-notification-wrapper'
            });
            return false;
        }
        let hot_source = '';
        let traceTip = `取消选中${key}`;
        if(key !== this.state.feature) {
            hot_source = key;
            traceTip = `选中${key}`;
        }
        Trace.traceEvent(ReactDOM.findDOMNode(this), `点击${traceTip}按钮`);
        clueCustomerAction.setHotSource(hot_source);
        setTimeout(() => {
            this.getRecommendLists();
        });
    };

    render() {
        let divHeight = $(window).height()
            - LAYOUT_CONSTANCE.PADDING_TOP
            - LAYOUT_CONSTANCE.BTN_PADDING;

        let extractClueTipEl = $('.extract-clues-title-container');
        if(extractClueTipEl.length) {
            divHeight -= extractClueTipEl.outerHeight(true);
        }

        let {isWebMin} = isResponsiveDisplay();

        let unextractClueTipEl = $('.unextract-clue-tip');
        if(unextractClueTipEl.length) {
            divHeight -= unextractClueTipEl.height();
        }

        const hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length') || _.get(this, 'state.disabledCheckedClues.length');

        return (
            <div className="extract-clues-wrapper" data-tracename="线索推荐操作面板">
                <div className="extract-clues-title-container">
                    <div className="extract-clues-title-wrapper">
                        <div className="extract-clues-title">
                            <span>{isCurtao() ? Intl.get('clue.find.recommend.clue', '找线索') : Intl.get('clue.customer.clue.recommend', '线索推荐')}</span>
                            <div className="extract-clues-btn-container">
                                {
                                    hasSelectedClue ? this.renderExtractOperator(isWebMin) : this.renderBtnClock(isWebMin)
                                }
                            </div>
                        </div>
                    </div>
                    <div className="extract-hot-wrapper">
                        <span className="extract-hot-title">{Intl.get('clue.recommend.hot.name', '热门')}：</span>
                        <div className='extract-hot-btn-container'>
                            {_.map(HOT_SELECTORS, hotItem => {
                                let cls = classNames('hot-btn-item', {
                                    'hot-active': this.state.feature === hotItem.value
                                });
                                return (
                                    <span className={cls} onClick={this.handleClickHotBtn.bind(this, hotItem.value)}>{hotItem.name}</span>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="unextract-clue-tip clearfix">
                    <Checkbox className="check-all" checked={this.isCheckAll()} onChange={this.handleCheckAllChange} disabled={this.disabledCheckAll()}>{Intl.get('common.all.select', '全选')}</Checkbox>
                    <span className="no-extract-count-tip">
                        {this.hasNoExtractCountTip()}
                    </span>
                </div>
                <div className="extract-clues-content" style={{height: divHeight}} ref="scrolltoTop">
                    <GeminiScrollbar>
                        {
                            this.state.isShowWiningClue ? (
                                <div className="winning-clue-tips">
                                    <WinningClue
                                        handleClickClose={this.handleClickCloseWinningClue}
                                    />
                                </div>
                            ) : null
                        }
                        {this.renderRecommendLists()}
                    </GeminiScrollbar>
                </div>
                {/*<DifferentVersion*/}
                {/*showFlag={this.state.showDifferentVersion}*/}
                {/*closeVersion={this.triggerShowVersionInfo}*/}
                {/*/>*/}
            </div>
        );
    }
}

ExtractClues.defaultProps = {
    onClosePanel: function() {},
    recommendClueLists: [],
    salesManList: [],
    hasShowBackBtn: false,
    handleBackClick: function() {},
    getRecommendClueLists: function() {},
    afterSuccess: function() {},
};
ExtractClues.propTypes = {
    onClosePanel: PropTypes.func,
    recommendClueLists: PropTypes.array,
    hasShowBackBtn: PropTypes.bool,
    handleBackClick: PropTypes.func,
    getRecommendClueLists: PropTypes.func,
    afterSuccess: PropTypes.func,
    salesManList: PropTypes.array,
    showSuccessPage: PropTypes.bool,
};
ExtractClues.EXTRACT_CLUE_CONST_MAP = EXTRACT_CLUE_CONST_MAP;
export default ExtractClues;
