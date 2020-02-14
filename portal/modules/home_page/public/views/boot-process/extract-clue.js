/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/01.
 */
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import { Checkbox, Button, message, Popover } from 'antd';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var clueCustomerStore = require('MOD_DIR/clue_customer/public/store/clue-customer-store');
var batchPushEmitter = require('PUB_DIR/sources/utils/emitters').batchPushEmitter;
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
var paymentEmitter = require('PUB_DIR/sources/utils/emitters').paymentEmitter;
var batchOperate = require('PUB_DIR/sources/push/batch');
import userData from 'PUB_DIR/sources/user-data';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import NoMoreDataTip from 'CMP_DIR/no_more_data_tip';
import classNames from 'classnames';
import {
    SetLocalSalesClickCount,
    isCommonSalesOrPersonnalVersion, getClueSalesList, getLocalSalesClickCount, HASEXTRACTBYOTHERERRTIP
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import { formatSalesmanList, checkCurrentVersionType, checkVersionAndType, isResponsiveDisplay } from 'PUB_DIR/sources/utils/common-method-util';
import { getMaxLimitExtractClueCount, updateGuideMark } from 'PUB_DIR/sources/utils/common-data-util';
import Trace from 'LIB_DIR/trace';
import DifferentVersion from 'MOD_DIR/different_version/public';
import { BOOT_PROCESS_KEYS, COMPANY_PHONE, COMPANY_VERSION_KIND, extractIcon } from 'PUB_DIR/sources/utils/consts';
const CLUE_RECOMMEND_SELECTED_SALES = 'clue_recommend_selected_sales';

const LAYOUT_CONSTANCE = {
    TITLE_HEIGHT: 70,// 顶部标题区域高度
    PADDING_TOP: 24,// 距离顶部标题区域高度
    BTN_PADDING: 10, //底部按钮区域高度
};

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
            batchSelectedSales: '',//记录当前批量选择的销售，销销售团队id
            canClickExtract: true, //防止连续点击批量提取相同线索
            showDifferentVersion: false,//是否显示版本信息面板
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
        clueCustomerAction.initialRecommendClues();
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
            hasExtractCount: hasExtractCount
        });
        clueCustomerAction.updateRecommendClueLists(updateClueId);
    };
    //更新选中的推荐线索
    updateSelectedClueLists = (updateClueId) => {
        var selectedRecommendClues = this.state.selectedRecommendClues;
        this.setState({
            selectedRecommendClues: _.filter(selectedRecommendClues,item => item.id !== updateClueId),
        });
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
            this.setState({
                hasExtractCount: data.hasExtractedCount,
                maxLimitExtractNumber: data.maxCount,
            });
            _.isFunction(callback) && callback(data.hasExtractedCount);
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
    //提取数为0时显示的提示信息
    hasNoExtractCountTip = () => {
        var maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        var ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;
        let versionAndType = checkVersionAndType();
        const i18Obj = {hasExtract: <span className="has-extracted-count">{this.state.hasExtractCount}</span>, ableExtract: ableExtract, timerange: this.getTimeRangeText()};
        /*let maxLimitTip = versionAndType.isCompanyFormal ?
            Intl.get('clue.recommend.has.extract', '您所在的组织{timerange}已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索', i18Obj)
            : Intl.get('clue.recommend.has.extract.count', '{timerange}已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索', i18Obj);*/
        let maxLimitTip = <ReactIntl.FormattedMessage
            id="clue.recommend.has.extracted.count"
            defaultMessage={'{timerange}已提取{hasExtract}条线索'}
            values={i18Obj}
        />;
        if(!ableExtract && this.state.hasNoExtractCountTip){
            //个人版试用提示升级,正式提示增加线索量
            //企业版试用提示升级,正式（管理员）提示增加线索量
            if(versionAndType.isPersonalTrial) {//个人试用
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.trial.extract.num.limit.tip"
                    defaultMessage={'已提取{count}条，如需继续提取请{upgradedVersion}'}
                    values={{
                        count: <span className="has-extracted-count">{maxLimitExtractNumber}</span>,
                        upgradedVersion: (
                            <Button className="customer-btn" data-tracename="点击个人升级为正式版按钮"
                                title={Intl.get('personal.upgrade.to.official.version', '升级为正式版')}
                                onClick={this.handleUpgradePersonalVersion}>
                                {Intl.get('personal.upgrade.to.official.version', '升级为正式版')}
                            </Button>
                        )
                    }}
                />;
            } else if(versionAndType.isCompanyTrial) {//企业试用
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.company.trial.extract.num.limit.tip"
                    defaultMessage={'已提取{count}条，如需继续提取,请联系我们的销售人员进行升级，联系方式：{contact}'}
                    values={{
                        count: <span className="has-extracted-count">{maxLimitExtractNumber}</span>,
                        contact: COMPANY_PHONE
                    }}
                />;
            } else if(versionAndType.isPersonalFormal//个人正式版
                || versionAndType.isCompanyFormal && this.isManager()) { //或企业正式版管理员
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.formal.extract.num.limit.tip"
                    defaultMessage={'本月{count}条已提取完毕，如需继续提取请{addClues}'}
                    values={{
                        count: <span className="has-extracted-count">{maxLimitExtractNumber}</span>,
                        addClues: (
                            <Button className="customer-btn" data-tracename="点击增加线索量"
                                title={Intl.get('goods.increase.clues', '增加线索量')}
                                onClick={this.handleClickAddClues}>
                                {Intl.get('goods.increase.clues', '增加线索量')}
                            </Button>
                        )
                    }}
                />;
            }else if(versionAndType.isCompanyFormal && !this.isManagerOrOperation()) {//企业正式版销售（除了管理员和运营人员）
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.company.formal.sales.extract.num.limit.tip"
                    defaultMessage={'本月{count}条已提取完毕，如需继续提取请联系管理员'}
                    values={{
                        count: <span className="has-extracted-count">{maxLimitExtractNumber}</span>
                    }}
                />;
            }
        }
        return maxLimitTip;
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
                this.getRecommendClueCount((count) => {
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
                            disabledCheckedClues: []
                        });
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
            selectedRecommendClues
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
        this.setState({selectedRecommendClues: canExtractClues});
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
        return _.find(this.state.selectedRecommendClues, item => item.id === record.id);
    };

    handleUpdatePersonalVersion = (result) => {
        //需要更新最大线索量
        let lead_limit = _.get(result, 'version.lead_limit', '');
        let clue_number = _.get(lead_limit.split('_'),'[0]',0);
        this.setState({
            maxLimitExtractNumber: +clue_number,
            getMaxLimitExtractNumberError: false,
            hasNoExtractCountTip: false,
            disabledCheckedClues: []
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
            disabledCheckedClues: []
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
                this.getRecommendClueCount((count) => {
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
                            return (
                                <div className={cls}>
                                    <Checkbox checked={this.hasChecked(item)} disabled={this.getDisabledClue(item)} onChange={this.handleCheckChange.bind(this, item)}/>
                                    <div className="extract-clue-text-wrapper" title={item.hasExtractedByOther ? Intl.get('errorcode.169', '该线索已被提取') : ''}>
                                        <div className="extract-clue-text__name">
                                            {item.hasExtractedByOther ? <i className='iconfont icon-warning-tip'/> : null}
                                            <span>{item.name}</span>
                                        </div>
                                        <div className="extract-clue-text__filters">
                                            <div className="extract-clue-text-item">
                                                <span className="extract-clue-text-label">{Intl.get('clue.customer.register.time', '注册时间')}：</span>
                                                <span> {item.startTime ? moment(item.startTime).format(oplateConsts.DATE_FORMAT) : null}</span>
                                            </div>
                                            <div className="extract-clue-text-item">
                                                <span className="extract-clue-text-label">{Intl.get('call.record.contacts', '联系人')}</span>：
                                                <span>{item.legalPerson}</span>
                                            </div>
                                            <div className="extract-clue-text-item">
                                                <span className="extract-clue-text-label">{Intl.get('common.phone', '电话')}</span>：
                                                <span>{item.telephones}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="single-extract-clue">
                                        {item.hasExtracted ? Intl.get('common.has.been.extracted', '已提取') : (
                                            <div className="handle-btn-item">
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
                    <a data-tracename="点击换一批按钮" onClick={this.getRecommendLists}>{Intl.get('clue.customer.refresh.list', '换一批')}</a>
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

    getRecommendLists = () => {
        if(this.state.canClickMoreBatch) {
            this.props.getRecommendClueLists();
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
                    onClick={this.getRecommendLists}
                >
                    <span className={moreRotationClass}/>
                    <span>{isWebMin ? null : Intl.get('clue.customer.refresh.list', '换一批')}</span>
                </Button>
            </React.Fragment>
        );
    };

    render() {
        let divHeight = $(window).height()
            - LAYOUT_CONSTANCE.PADDING_TOP
            - LAYOUT_CONSTANCE.TITLE_HEIGHT
            - LAYOUT_CONSTANCE.BTN_PADDING;

        let {isWebMin} = isResponsiveDisplay();
        let hasNoExtractCountTip = this.state.hasNoExtractCountTip;

        let unextractClueTipEl = $('.unextract-clue-tip');
        if(unextractClueTipEl.length) {
            divHeight -= unextractClueTipEl.height();
        }

        const hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length') || _.get(this, 'state.disabledCheckedClues.length');

        return (
            <div className="extract-clues-wrapper" data-tracename="线索推荐操作面板">
                <div className="extract-clues-title-wrapper">
                    <div className="extract-clues-title">
                        <span>{Intl.get('clue.customer.clue.recommend', '线索推荐')}</span>
                        <div className="extract-clues-btn-container">
                            {
                                hasSelectedClue ? this.renderExtractOperator(isWebMin) : this.renderBtnClock(isWebMin)
                            }
                        </div>
                    </div>
                </div>
                <div className="unextract-clue-tip clearfix">
                    <Checkbox className="check-all" checked={this.isCheckAll()} onChange={this.handleCheckAllChange} disabled={this.disabledCheckAll()}>{Intl.get('common.all.select', '全选')}</Checkbox>
                    <span className="no-extract-count-tip">
                        {this.hasNoExtractCountTip()}
                    </span>
                </div>
                <div className="extract-clues-content" style={{height: divHeight}}>
                    <GeminiScrollbar>
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

export default ExtractClues;