/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/25.
 */
import { BOOT_PROCESS_KEYS, RESPONSIVE_LAYOUT } from 'PUB_DIR/sources/utils/consts';

require('../../css/recommend_clues_lists.less');
import {Button,message,Popover} from 'antd';
import {RightPanel, RightPanelClose} from 'CMP_DIR/rightPanel';
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerStore = require('../../store/clue-customer-store');
import RecommendCluesForm from '../recomment_clues/recommend_clues_form';
import {AntcTable} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import {
    formatSalesmanList,
    getTableContainerHeight,
    isResponsiveDisplay,
    checkCurrentVersion,
    checkVersionAndType
} from 'PUB_DIR/sources/utils/common-method-util';
import userData from 'PUB_DIR/sources/user-data';
const LAYOUT_CONSTANTS = {
    TH_MORE_HEIGHT: 10
};
var classNames = require('classnames');
var batchPushEmitter = require('PUB_DIR/sources/utils/emitters').batchPushEmitter;
var paymentEmitter = require('PUB_DIR/sources/utils/emitters').paymentEmitter;
import Trace from 'LIB_DIR/trace';
var batchOperate = require('PUB_DIR/sources/push/batch');
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {updateGuideMark, getMaxLimitExtractClueCount} from 'PUB_DIR/sources/utils/common-data-util';
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount,isCommonSalesOrPersonnalVersion,HASEXTRACTBYOTHERERRTIP} from '../../utils/clue-customer-utils';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
import {extractIcon} from 'PUB_DIR/sources/utils/consts';
import BackMainPage from 'CMP_DIR/btn-back';
const CLUE_RECOMMEND_SELECTED_SALES = 'clue_recommend_selected_sales';
import {leadRecommendEmitter} from 'PUB_DIR/sources/utils/emitters';
class RecommendCustomerRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRecommendClues: [],//选中状态的推荐线索
            disabledCheckedClues: [],//禁用状态的线索,用于记录提取之前selected中的线索数量
            singleExtractLoading: false, // 单个提取的loading
            batchExtractLoading: false,
            closeFocusCustomer: false,
            hasExtractCount: 0,//已经提取的推荐线索的数量
            maxLimitExtractNumber: 0,//该账号的最大提取线索数量（试用账号是今天的，正式账号是本月的）
            getMaxLimitExtractNumberError: false,//获取该账号的最大提取量出错
            tablePopoverVisible: '',//单个提取展示popover的那条推荐线索
            batchPopoverVisible: false,//批量操作展示popover
            batchSelectedSales: '',//记录当前批量选择的销售，销销售团队id
            canClickExtract: true,//防止用户连续点击批量提取
            ...clueCustomerStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    componentDidMount() {
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.on(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        //因为AntcTable中没有数据提示的时候只能传字符串，提示中的click事件中传this进去会报错，这个方法只能暂时加到window上，卸载的时候把这个方法删掉
        window.handleClickRefreshBtn = function(event) {
            leadRecommendEmitter.emit(leadRecommendEmitter.REFRESH_LEAD_LIST);
        };
        window.handleClickEditCondition = function(event,that) {
            leadRecommendEmitter.emit(leadRecommendEmitter.CHANGE_LEAD_CONDITION);
        };
        leadRecommendEmitter.on(leadRecommendEmitter.REFRESH_LEAD_LIST, this.handleClickRefreshBtn);
        leadRecommendEmitter.on(leadRecommendEmitter.CHANGE_LEAD_CONDITION, this.handleClickEditCondition);
        clueCustomerStore.listen(this.onStoreChange);
        //获取推荐的线索
        this.getRecommendClueLists();
    }

    //获取最多提取线索的数量以及已经提取多少线索
    getRecommendClueCount(callback){
        this.setState({
            canClickExtract: false
        });
        getMaxLimitExtractClueCount().then((data) => {
            this.setState({
                maxLimitExtractNumber: data.maxCount,
                hasExtractCount: data.hasExtractedCount
            },() => {
                _.isFunction(callback) && callback(data.hasExtractedCount);
            });
        },(error) => {
            this.setState({
                hasExtractCount: 0,
                maxLimitExtractNumber: 0
            });
            _.isFunction(callback) && callback('error');
        });
    }

    isShowRecommendSettingPanel = () => {
        var hasCondition = false;
        var settedCustomerRecommend = this.state.settedCustomerRecommend;
        for (var key in settedCustomerRecommend.obj){
            if (!_.isEmpty(settedCustomerRecommend.obj[key])){
                hasCondition = true;
            }
        }
        return (!settedCustomerRecommend.loading && !hasCondition) && !this.state.closeFocusCustomer;
    };
    getSearchCondition = () => {
        var conditionObj = _.cloneDeep(_.get(this, 'state.settedCustomerRecommend.obj'));
        //去掉一些不用的属性
        delete conditionObj.id;
        delete conditionObj.user_id;
        delete conditionObj.organization;
        conditionObj.load_size = this.state.pageSize;
        return conditionObj;
    };
    getRecommendClueLists = () => {
        var conditionObj = this.getSearchCondition();
        //去掉为空的数据
        clueCustomerAction.getRecommendClueLists(conditionObj);
    }

    componentWillReceiveProps(nextProps) {

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
        var clueArr = _.map(tasks, 'taskDefine');
        // 遍历每一个客户
        _.each(clueArr, (clueItem) => {
            var arr = _.split(clueItem,'_');
            //如果当前客户是需要更新的客户，才更新

            this.updateRecommendClueLists(arr[0]);
        });
        if (_.isEmpty(this.state.recommendClueLists)) {
            this.getRecommendClueLists();
        }
        this.setState({
            selectedRecommendClues: [],
            disabledCheckedClues: []
        });
    };
    updateRecommendClueLists = (updateClueId) => {
        this.updateSelectedClueLists(updateClueId);
        var disabledCheckedClues = this.state.disabledCheckedClues;
        this.setState({
            disabledCheckedClues: _.filter(disabledCheckedClues,item => item.id !== updateClueId)
        });
        clueCustomerAction.updateRecommendClueLists(updateClueId);
    };
    updateSelectedClueLists = (updateClueId) => {
        var selectedRecommendClues = this.state.selectedRecommendClues;
        this.setState({
            selectedRecommendClues: _.filter(selectedRecommendClues,item => item.id !== updateClueId),
        });
    };
    remarkLeadExtractedByOther = (remarkLeadId) => {
        this.updateSelectedClueLists(remarkLeadId);
        clueCustomerAction.remarkLeadExtractedByOther(remarkLeadId);
    };

    componentWillUnmount() {
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.removeListener(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        delete window.handleClickRefreshBtn;
        delete window.handleClickEditCondition;
        leadRecommendEmitter.removeListener(leadRecommendEmitter.REFRESH_LEAD_LIST, this.handleClickRefreshBtn);
        leadRecommendEmitter.removeListener(leadRecommendEmitter.CHANGE_LEAD_CONDITION, this.handleClickEditCondition);
        this.clearSelectSales();
        clueCustomerStore.unlisten(this.onStoreChange);
    }

    // 关闭提取线索界面
    closeRecommendCluePanel = () => {
        this.props.closeRecommendCluePanel();
    };
    handleClickRefreshBtn = () => {
        this.getRecommendClueLists();
    };
    handleClickEditCondition = () => {
        this.setState({
            showEditConditionPanel: true
        });
    };
    hideFocusCustomerPanel = () => {
        this.setState({
            closeFocusCustomer: true,
            showEditConditionPanel: false
        });
    };
    //保存成功后需要获取数据
    saveRecommedConditionsSuccess = (saveCondition) => {
        clueCustomerAction.saveSettingCustomerRecomment(saveCondition);
        this.hideFocusCustomerPanel();
        this.getRecommendClueLists();
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
                    //提取成功后，把该线索在列表中删除
                    message.success(Intl.get('clue.extract.success', '提取成功'));
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
                //如果提取失败的原因是因为被其他同事提取过，将该推荐线索设置不可点击并且前面加提示
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
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        clueCustomerAction.setSalesMan({'salesMan': salesMan});
    };
    clearSelectSales = () => {
        this.setState({
            tablePopoverVisible: '',
            batchPopoverVisible: false,
            hasExtractCount: 0
        });
        clueCustomerAction.setSalesMan({'salesMan': ''});
        clueCustomerAction.setSalesManName({'salesManNames': ''});
    };
    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
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
    extractRecommendCluesSingele = (record) => {
        this.setState({
            tablePopoverVisible: ''
        });
        let submitObj = this.handleBeforeSumitChangeSales([record.id]);
        this.handleExtractRecommendClues(submitObj);
    };
    // 单个提取线索
    handleExtractClueAssignToSale(record, flag, isDetailExtract) {
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
                    //如果获取出错了就不要校验数字了
                    if (_.isNumber(count) && (this.isTrialAccount() || this.isOfficalAccount()) && count >= this.state.maxLimitExtractNumber){
                        this.setState({
                            tablePopoverVisible: record.id,
                            singleExtractLoading: false,
                            canClickExtract: true
                        });
                    }else{
                        this.extractRecommendCluesSingele(record);
                    }
                });
            }

        }
    }
    getTimeRangeText = () => {
        return this.isTrialAccount() ? Intl.get('user.time.today', '今天') : Intl.get('common.this.month', '本月');
    }
    extractClueOperator = (hasAssignedPrivilege, record, assigenCls, isDetailExtract) => {
        var checkRecord = this.state.tablePopoverVisible === record.id;
        var maxLimitTip = Intl.get('clue.recommend.extract.num.limit', '您所在组织{timerange}提取的线索数已达{maxLimit}条上限，请明天再来提取',{maxLimit: this.state.maxLimitExtractNumber, timerange: this.getTimeRangeText()});
        maxLimitTip = this.hasNoExtractCountTip(maxLimitTip);
        if (hasAssignedPrivilege) {
            return (
                <AntcDropdown
                    isDropdownAble={record.hasExtracted}
                    datatraceContainer='线索推荐页面单个提取'
                    ref={assignSale => this['changeSales' + record.id] = assignSale}
                    content={
                        <span
                            data-tracename="点击提取按钮"
                            className={assigenCls}
                        >
                            {extractIcon}
                        </span>}
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    isSaving={this.state.singleExtractLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege, isDetailExtract)}
                    unSelectDataTip={checkRecord ? maxLimitTip : this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}
                />
            );
        } else {
            return (
                <Popover
                    placement="left"
                    content={<div>
                        <p>
                            {maxLimitTip}
                        </p>
                    </div>}
                    trigger="click"
                    visible={checkRecord}
                    onVisibleChange={this.handleTablePopoverChange}
                >
                    <span
                        onClick={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege, isDetailExtract)}
                    >
                        {extractIcon}
                    </span>
                </Popover>
            );
        }
    };
    handleTablePopoverChange = visible => {
        if (!visible){
            this.setState({
                tablePopoverVisible: ''
            });
        }
    };
    getRecommendClueTableColunms = () => {
        const column_width = '80px';
        let columns = [
            {
                title: Intl.get('clue.customer.recommend.clue.lists', '推荐线索'),
                dataIndex: 'name',
                width: '300px',
                render: (text, record, index) => {
                    var hasExtractedByOther = record.hasExtractedByOther;
                    return (
                        <span className='recommend-lead-name' title={hasExtractedByOther ? Intl.get('errorcode.169', '该线索已被其他同事提取') : ''}>
                            {hasExtractedByOther ? <i className='iconfont icon-warning-tip'></i> : null}
                            {text}
                        </span>
                    );
                }
            }, {
                title: Intl.get('clue.customer.register.time', '注册时间'),
                dataIndex: 'startTime',
                width: '200px',
                align: 'left',
                sorter: (a, b) => a.startTime - b.startTime,
                render: (text, record, index) => {
                    return (
                        <span>{text ? moment(text).format(oplateConsts.DATE_FORMAT) : null}
                        </span>
                    );
                }
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex: 'legalPerson',
                width: '300px',
            }, {
                title: Intl.get('common.phone', '电话'),
                dataIndex: 'telephones',
                width: '300px',
                render: (text, record, index) => {
                    return (
                        <span>{_.isArray(text) ? text.join('，') : null}
                        </span>
                    );
                }
            },{
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'oprate_btn',
                width: '100px',
                render: (text, record, index) => {
                    // 提取线索分配给相关的销售人员的权限
                    let hasAssignedPrivilege = !isCommonSalesOrPersonnalVersion();
                    let assigenCls = classNames('assign-btn',{'can-edit': !text});
                    return (
                        <div className='singl-extract-clue assign-privilege handle-btn-item' ref='trace-person'>
                            {this.extractClueOperator(hasAssignedPrivilege, record, assigenCls, false)}
                        </div>
                    );
                }
            }
        ];
        return columns;
    };
    //判断是否为管理员
    isManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN); // 返回true，说明是管理员，否则是销售或运营
    };
    //是否是试用账号,
    isTrialAccount = () => {
        return _.get(getOrganization(),'version.type') === '试用';
    };
    //是否是正式账号
    isOfficalAccount = () => {
        return _.get(getOrganization(),'version.type') === '正式';
    };
    handleUpdatePersonalVersion = (result) => {
        //需要更新最大线索量
        let lead_limit = _.get(result, 'version.lead_limit', '');
        let clue_number = _.get(lead_limit.split('_'),'[0]',0);
        this.setState({
            maxLimitExtractNumber: +clue_number,
            getMaxLimitExtractNumberError: false,
            tablePopoverVisible: '',
            batchPopoverVisible: false
        });
    };
    //个人试用升级为正式版
    handleUpgradePersonalVersion = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL);
    };
    //增加线索量
    handleClickAddClues = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_ADD_CLUES_PANEL, {
            updateCluesCount: (result) => {
                let count = _.get(result, 'count', 0);
                let maxLimitExtractNumber = this.state.maxLimitExtractNumber;
                this.setState({
                    maxLimitExtractNumber: count + maxLimitExtractNumber,
                    getMaxLimitExtractNumberError: false,
                    tablePopoverVisible: '',
                    batchPopoverVisible: ''
                });
            }
        });
    };
    //提取数为0时显示的提示信息
    hasNoExtractCountTip = (maxLimitTip) => {
        var maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        var ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;
        let currentVersion = checkCurrentVersion();
        if(!ableExtract){
            //个人版试用提示升级,正式提示增加线索量
            //企业版试用提示升级,正式（管理员）提示增加线索量
            if(currentVersion.personal && this.isTrialAccount()) {//个人试用
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.trial.extract.num.limit.tip"
                    defaultMessage={'明天可再提取{count}条，如需马上提取请{upgradedVersion}'}
                    values={{
                        count: maxLimitExtractNumber,
                        upgradedVersion: <a onClick={this.handleUpgradePersonalVersion} data-tracename="点击个人升级为正式版按钮">{Intl.get('personal.upgrade.to.official.version', '升级为正式版')}</a>
                    }}
                />;
            } else if(currentVersion.company && this.isTrialAccount()) {//企业试用
                maxLimitTip = Intl.get('clue.recommend.company.trial.extract.num.limit.tip', '明天可再提取{count}条，如需马上提取请联系我们销售人员（{contact}）进行升级',{count: maxLimitExtractNumber,contact: '400-6978-520'});
            } else if(currentVersion.personal && this.isOfficalAccount()//个人正式版
                || currentVersion.company && this.isOfficalAccount() && this.isManager()) { //或企业正式版管理员
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.formal.extract.num.limit.tip"
                    defaultMessage={'本月{count}条已提取完毕，如需继续提取请{addClues}'}
                    values={{
                        count: maxLimitExtractNumber,
                        addClues: <a onClick={this.handleClickAddClues} data-tracename="点击增加线索量按钮">{Intl.get('goods.increase.clues', '增加线索量')}</a>
                    }}
                />;
            }
        }
        return maxLimitTip;
    };
    batchAssignRecommendClues = (submitObj) => {
        this.setState({
            batchPopoverVisible: false,
            batchSelectedSales: _.cloneDeep(this.state.salesMan) //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        });
        this.handleBatchAssignClues(submitObj);
    };
    handleSubmitAssignSalesBatch = () => {
        if(!this.state.canClickExtract) return;
        //如果是选了修改全部
        let submitObj = this.handleBeforeSumitChangeSales(_.map(this.state.selectedRecommendClues,'id'));
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
                    if (
                        //获取已经提取的线索失败了就不校验了 获取失败count返回的是字符串‘error’
                        _.isNumber(count) &&
                        //是试用账号或者正式账号
                        (this.isTrialAccount() || this.isOfficalAccount()) &&
                        //已经提取的数量和这次要提取数量之和大于最大限制的提取数
                        count + _.get(this, 'state.disabledCheckedClues.length') > this.state.maxLimitExtractNumber
                    ){
                        this.setState({
                            batchPopoverVisible: true,
                            singleExtractLoading: false,
                            canClickExtract: true
                        });
                    }else{
                        this.batchAssignRecommendClues(submitObj);
                    }
                });
            }
        }
    };

    //批量提取,发请求前的参数处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (isCommonSalesOrPersonnalVersion()) { // 普通销售或者是个人版本，批量提取参数处理
            let saleLoginData = userData.getUserData();
            let submitObj = {
                'user_id': saleLoginData.user_id,
                'user_name': saleLoginData.nick_name,
                'sales_team_id': saleLoginData.team_id,
                'sales_team': saleLoginData.team_name,
            };
            if (_.isArray(itemId)){
                submitObj.companyIds = itemId;
            }
            return submitObj;

        } else { // 管理员或是销售领导，批量提取参数处理
            if (!this.state.salesMan) {
                clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
            } else {
                let user_id = '', sales_team_id = '', user_name = '', sales_team = '';
                //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
                let idArray = this.state.salesMan.split('&&');
                if (_.isArray(idArray) && idArray.length) {
                    user_id = idArray[0];//销售的id
                    sales_team_id = idArray[1] || '';//团队的id
                }
                //销售的名字和团队的名字 格式是 销售名称 -团队名称
                let nameArray = this.state.salesManNames.split('-');
                if (_.isArray(nameArray) && nameArray.length) {
                    user_name = nameArray[0];//销售的名字
                    sales_team = _.trim(nameArray[1]) || '';//团队的名字
                }
                let submitObj = {user_id, user_name, sales_team_id, sales_team};
                if (itemId){
                    submitObj.companyIds = itemId;
                }
                return submitObj;
            }
        }
    };
    getRowSelection = () => {
        let rowSelection = {
            type: 'checkbox',
            selectedRowKeys: _.map(this.state.selectedRecommendClues, 'id'),
            onSelect: (record, selected, selectedRows) => {
                this.setState({
                    selectedRecommendClues: selectedRows,
                });
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中某个线索');
            },
            //对客户列表当前页进行全选或取消全选操作时触发
            onSelectAll: (selected, selectedRows, changeRows) => {
                this.setState({selectedRecommendClues: selectedRows});
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中全部线索');
            },
            getCheckboxProps: record => ({
                disabled: this.getDisabledClue(record)
            }),
        };
        return rowSelection;
    };
    //该线索前的checkbox不可用
    getDisabledClue = (record) => {
        // 有hasExtracted属性是已经成功提取了的,有hasExtractedByOther属性是已经被别人提取了的
        return record.hasExtracted || _.has(this.state.disabledCheckedClues,item => item.id === record.id) || record.hasExtractedByOther;
    };
    renderRecommendClueLists = () => {
        if (this.state.isLoadingRecommendClue) {
            return <Spinner/>;
        } else if (this.state.getRecommendClueErrMsg && this.state.getRecommendClueErrMsg !== Intl.get('errorcode.168', '符合条件的线索已被提取完成，请修改条件再查看')) {
            //如果报错的信息是 '符合条件的线索已被提取完成，请修改条件再查看',要在修改条件上在加上点击的链接
            //不是这个错误就直接显示
            if(this.state.getRecommendClueErrMsg ){
                return (<div className="errmsg-container">
                    <span className="errmsg-tip">{this.state.getRecommendClueErrMsg},</span>
                    <a className="retry-btn" onClick={this.getRecommendClueLists}>
                        {Intl.get('user.info.retry', '请重试')}
                    </a>
                </div>);
            }
        } else {
            var rowSelection = this.getRowSelection();
            var conditionObj = this.getSearchCondition();
            delete conditionObj.load_size;
            delete conditionObj.userId;
            //如果有筛选条件的时候，提醒修改条件再查看，没有筛选条件的时候，提示暂无数据
            var emptyText = _.isEmpty(conditionObj) ? Intl.get('common.no.data', '暂无数据') : <ReactIntl.FormattedMessage
                id="clue.edit.condition.search"
                defaultMessage={'请{changeCondition}再查看'}
                values={{
                    'changeCondition': <a onClick={this.handleClickEditCondition}>
                        {Intl.get('clue.customer.condition.change', '修改条件')}
                    </a>
                }}
            />;
            if(this.state.getRecommendClueErrMsg && this.state.getRecommendClueErrMsg === Intl.get('errorcode.168', '符合条件的线索已被提取完成，请修改条件再查看')){
                emptyText = <ReactIntl.FormattedMessage
                    id='clue.has.extract.by.other'
                    defaultMessage={'符合条件的线索已被提取完成，请{changeCondition}再查看'}
                    values={{
                        'changeCondition': <a onClick={this.handleClickEditCondition}>
                            {Intl.get('clue.customer.condition.change', '修改条件')}
                        </a>
                    }}
                />;
            }
            var recommendList = this.state.recommendClueLists;
            //因为antctable中的noMoreDataText只接受字符串，所以这个带点击功能的提示要用字符串拼接起来
            var refreshTip = Intl.get('lead.recommend.refresh.list','如果没有符合您需求的线索，您可以') +
                '<a title=\'' + '\' onclick=\'handleClickRefreshBtn(event ' + ')\'>' + Intl.get('clue.customer.refresh.list', '换一批') + '</a>';
            var changeCondition = Intl.get('lead.recommend.refresh.list','如果没有符合您需求的线索，您可以') + '<a title=\'' + '\' onclick=\'handleClickEditCondition(event ' + ')\'>' + Intl.get('clue.customer.condition.change', '修改条件') + '</a>' + Intl.get('lead.recommend.change.condition', '再试试');
            const dropLoadConfig = {
                listenScrollBottom: false,
                handleScrollBottom: function(){},
                loading: false,
                showNoMoreDataTip: true,
                noMoreDataText: recommendList.length >= this.state.pageSize ? refreshTip : changeCondition
            };
            return (
                <AntcTable
                    dropLoad={recommendList.length ? dropLoadConfig : {}}
                    rowSelection={rowSelection}
                    rowKey={this.getRowKey}
                    dataSource={recommendList}
                    pagination={false}
                    columns={this.getRecommendClueTableColunms()}
                    scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
                    locale={{emptyText: emptyText}}
                    rowClassName={this.setInvalidClassName}
                />);
        }
    };
    setInvalidClassName= (record, index) => {
        var cls = '';
        if(record.hasExtracted){
            cls += ' has-extracted-row';
        }
        if(record.hasExtractedByOther){
            cls += ' has-extracted-by-other-row';
        }
        return cls;
    };
    getRowKey = (record, index) => {
        return record.id;
    };
    upDateGuideMark = () => {
        updateGuideMark(BOOT_PROCESS_KEYS.EXTRACT_CLUE);
    };
    handleBatchAssignClues = (submitObj) => {
        if(this.state.batchExtractLoading){
            return;
        }
        this.setState({
            batchExtractLoading: true
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
                if (this.refs.changeSales) {
                    //隐藏批量变更销售面板
                    this.refs.changeSales.handleCancel();
                }
                var taskId = _.get(data, 'batch_label','');
                if (taskId){
                    // 更新引导流程
                    this.upDateGuideMark();
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
                    //已经被其他同事提取的线索
                    var hasExtractedLeadIds = _.get(data,'picked',[]);
                    var hasExtractedLeadCount = hasExtractedLeadIds.length;
                    if(totalSelectedSize >= hasExtractedLeadCount){
                        //去掉被其他同事提取的线索数量，因为这些不会有推送
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
                this.setState({
                    batchExtractLoading: false,
                    canClickExtract: true
                });
                var errTip = errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败');
                //如果提取失败的原因是因为被其他同事提取过，将该推荐线索设置不可点击并且前面加提示
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
    renderBatchChangeClues = () => {
        var checkRecord = this.state.batchPopoverVisible, maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        var ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;
        //账号类型不一样提示也不一样
        var maxLimitTip = Intl.get('clue.recommend.has.extract', '您所在的组织{timerange}已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索',{hasExtract: this.state.hasExtractCount, ableExtract: ableExtract,timerange: this.getTimeRangeText()});
        let {isWebMin} = isResponsiveDisplay();
        maxLimitTip = this.hasNoExtractCountTip(maxLimitTip);
        if (isCommonSalesOrPersonnalVersion()) { // 普通销售或者个人版批量提取线索
            return (
                <Popover
                    placement="right"
                    content={<div>
                        <p>
                            {maxLimitTip}
                        </p>
                    </div>}
                    trigger="click"
                    visible={checkRecord}
                    onVisibleChange={this.handleBatchVisibleChange}
                >
                    <Button
                        title={Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                        type="primary"
                        data-tracename="点击批量提取线索按钮"
                        className='btn-item common-sale-batch-extract'
                        onClick={this.handleSubmitAssignSalesBatch}
                        disabled={this.state.batchExtractLoading}
                    >
                        {isWebMin ? <span className="iconfont icon-extract"></span> :
                            <React.Fragment>
                                <span className="iconfont icon-extract"></span>
                                {Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                            </React.Fragment> }
                    </Button>
                </Popover>
            );
        } else { // 管理员或是销售领导批量提取线索
            return (
                <AntcDropdown
                    ref='changeSales'
                    datatraceContainer='线索推荐页面批量提取'
                    content={
                        <Button
                            title={Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                            type="primary"
                            data-tracename="点击批量提取线索按钮"
                            className='btn-item'
                        >
                            {isWebMin ? <span className="iconfont icon-extract"></span> :
                                <React.Fragment>
                                    <span className="iconfont icon-extract"></span>
                                    {Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                                </React.Fragment> }
                        </Button>
                    }
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    isSaving={this.state.batchExtractLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleSubmitAssignSalesBatch}
                    unSelectDataTip={checkRecord ? maxLimitTip : this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}
                />
            );
        }
    };
    handleBatchVisibleChange = (visible) => {
        if (!visible){
            this.setState({
                batchPopoverVisible: false
            });
        }
    };
    render() {
        var hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length') || _.get(this, 'state.disabledCheckedClues.length');

        let {isWebMin} = isResponsiveDisplay();
        let recommendCls = classNames('recommend-customer-top-nav-wrap', {
            'responsive-mini-btn': isWebMin
        });
        return (
            <div className="recommend-clues-lists-container" data-tracename="推荐线索列表">
                <RightPanel showFlag={true} className="recommend-customer-list">
                    <div className="recommend-clue-panel">
                        <TopNav>
                            <div className={recommendCls}>
                                <BackMainPage className="clue-back-btn" 
                                    handleBackClick={this.closeRecommendCluePanel}></BackMainPage>
                                {hasSelectedClue ? null :
                                    <React.Fragment>
                                        <Button className="btn-item" data-tracename="点击修改推荐条件"
                                            title={Intl.get('clue.customer.condition.change', '修改条件')}
                                            onClick={this.handleClickEditCondition}>
                                            {isWebMin ? <span className="iconfont icon-modify-condition"></span> :
                                                <React.Fragment>
                                                    <span className="iconfont icon-modify-condition"></span>
                                                    {Intl.get('clue.customer.condition.change', '修改条件')}
                                                </React.Fragment>}
                                        </Button>
                                        <Button className="btn-item" data-tracename="点击换一批按钮"
                                            title={Intl.get('clue.customer.refresh.list', '换一批')}
                                            onClick={this.handleClickRefreshBtn}>
                                            {isWebMin ? <span className="iconfont icon-change-new"></span> :
                                                <React.Fragment>
                                                    <span className="iconfont icon-change-new"></span>
                                                    {Intl.get('clue.customer.refresh.list', '换一批')}
                                                </React.Fragment>
                                            }
                                        </Button>
                                    </React.Fragment>
                                }
                                {
                                    hasSelectedClue ? this.renderBatchChangeClues() : null
                                }
                            </div>
                        </TopNav>
                        <div className="recommend-clue-content-container">
                            {this.renderRecommendClueLists()}
                        </div>

                    </div>
                </RightPanel>
                {this.state.showEditConditionPanel || this.isShowRecommendSettingPanel() ?
                    <RecommendCluesForm
                        hasSavedRecommendParams={this.state.settedCustomerRecommend.obj}
                        hideFocusCustomerPanel={this.hideFocusCustomerPanel}
                        saveRecommedConditionsSuccess={this.saveRecommedConditionsSuccess}
                    /> : null}
            </div>


        );
    }
}

RecommendCustomerRightPanel.defaultProps = {
    hideFocusCustomerPanel: function() {

    },
    hasSavedRecommendParams: {},
    closeRecommendCluePanel: function() {

    },
};
RecommendCustomerRightPanel.propTypes = {
    hideFocusCustomerPanel: PropTypes.func,
    hasSavedRecommendParams: PropTypes.object,
    closeRecommendCluePanel: PropTypes.func,

};
module.exports = RecommendCustomerRightPanel;