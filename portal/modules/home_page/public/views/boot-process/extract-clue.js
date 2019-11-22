/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/08/01.
 */
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import GuideAjax from 'MOD_DIR/common/public/ajax/guide';
import {Checkbox, Button} from 'antd';
var batchPushEmitter = require('PUB_DIR/sources/utils/emitters').batchPushEmitter;
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;
var paymentEmitter = require('PUB_DIR/sources/utils/emitters').paymentEmitter;
var batchOperate = require('PUB_DIR/sources/push/batch');
import userData from 'PUB_DIR/sources/user-data';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {SetLocalSalesClickCount} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import { formatSalesmanList, checkCurrentVersionType, checkVersionAndType } from 'PUB_DIR/sources/utils/common-method-util';
import {getMaxLimitExtractClueCount} from 'PUB_DIR/sources/utils/common-data-util';
import Trace from 'LIB_DIR/trace';

const CLUE_RECOMMEND_SELECTED_SALES = 'clue_recommend_selected_sales';

const LAYOUT_CONSTANCE = {
    TITLE_HEIGHT: 70,// 顶部标题区域高度
    PADDING_TOP: 24,// 距离顶部标题区域高度
    BTN_PADDING: 45, //底部按钮区域高度
};

class ExtractClues extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            batchExtractLoading: false,
            saveErrorMsg: '',
            recommendClueLists: props.recommendClueLists,
            selectedRecommendClues: [],
            salesMan: '',
            salesManNames: '',
            unSelectDataTip: '', // 没有选择销售时的提示
            hasExtractCount: 0,//已经提取的推荐线索的数量
            maxLimitExtractNumber: 0,//该账号的最大提取线索数量（试用账号是今天的，正式账号是本月的）
            getMaxLimitExtractNumberError: false,//获取该账号的最大提取量出错
            batchPopoverVisible: false,//批量操作展示popover
            batchSelectedSales: '',//记录当前批量选择的销售，销销售团队id
        };
    }

    componentDidMount() {
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.on(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
    }

    componentWillUnmount() {
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.removeListener(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
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

        this.setState({
            selectedRecommendClues: []
        });
    };

    //获取某个安全域已经提取多少推荐线索数量,
    getRecommendClueCount(callback){
        getMaxLimitExtractClueCount().then((data) => {
            var maxCount = _.get(data,'total', 0);
            var hasExtractedCount = _.get(data,'pulled_clue_numbers');
            this.setState({
                hasExtractCount: hasExtractedCount,
                maxLimitExtractNumber: maxCount,
            });
            _.isFunction(callback) && callback(hasExtractedCount);
        }).catch(() => {
            this.setState({
                hasExtractCount: 0,
                maxLimitExtractNumber: 0
            });
            _.isFunction(callback) && callback('error');
        });
    }

    handleBatchAssignClues = (submitObj) => {
        this.setState({
            batchExtractLoading: true,
            unSelectDataTip: '',
            saveErrorMsg: ''
        });
        GuideAjax.batchExtractRecommendClues(submitObj).then((data) => {
            this.setState({
                batchExtractLoading: false
            });
            var taskId = _.get(data, 'batch_label','');
            if (taskId){
                //todo 到这一步，提取线索的引导就完成了，需要更新引导流程状态
                this.props.afterSuccess();
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(taskId);
                //存储批量操作参数，后续更新时使用
                var batchParams = _.cloneDeep(submitObj);
                batchOperate.saveTaskParamByTaskId(taskId, batchParams, {
                    showPop: true,
                    urlPath: '/clue_customer'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                //批量操作参数
                var totalSelectedSize = _.get(this,'state.selectedRecommendClues.length',0);
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
        }, (errorMsg) => {
            this.setState({
                batchExtractLoading: false,
                saveErrorMsg: errorMsg || Intl.get('clue.extract.failed', '提取失败'),
                unSelectDataTip: errorMsg || Intl.get('clue.extract.failed', '提取失败')
            });
        });
    };

    dealData = (obj) => {
        let str = '';
        // 所属行业
        let industry = _.get(obj, 'industry', '');
        // 省份
        let province = _.get(obj, 'province', '');
        // 处理人员规模
        let staffnum = '';
        let staffnumMin = _.get(obj, 'staffnumMin', '');
        let staffnumMax = _.get(obj, 'staffnumMax', '');
        if(staffnumMin && staffnumMax) {
            staffnum = Intl.get('clue.customer.condition.staff.range', '{min}-{max}人', {min: staffnumMin, max: staffnumMax});
        }else {
            // 以下
            if(!staffnumMin && staffnumMax) {
                staffnum = Intl.get('clue.customer.condition.staff.size', '{num}人以下', {num: staffnumMax});
            }
            // 以上
            if(staffnumMin && !staffnumMax) {
                staffnum = Intl.get('clue.customer.staff.over.num', '{num}人以上', {num: staffnumMin});
            }
        }

        // 资金规模
        let capital = _.get(obj, 'capital', '');
        // 企业性质
        let entType = _.get(obj, 'entType', '');

        if(industry && !_.isEqual(industry, '-')) {
            str += industry + ' / ';
        }
        if(province && !_.isEqual(province, '-')) {
            str += province + ' / ';
        }
        if(staffnum) {
            str += staffnum + ' / ';
        }
        if(capital && !_.isEqual(capital, '-')) {
            str += Intl.get('crm.149', '{num}万',{num: (capital / 10000)}) + ' / ';
        }
        if(entType && !_.isEqual(entType, '-')) {
            str += entType;
        }
        return str;
    };

    // 判断是否为普通销售
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };
    //判断是否为管理员
    isManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN); // 返回true，说明是管理员，否则是销售或运营
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
        let dataList = formatSalesmanList(this.props.salesManList);

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
        if(this.isCommonSales()) {// 普通销售
            let saleLoginData = userData.getUserData();
            let submitObj = {
                'user_id': saleLoginData.user_id,
                'user_name': saleLoginData.nick_name,
                'sales_team_id': saleLoginData.team_id,
                'sales_team': saleLoginData.team_name,
            };
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
        let maxLimitTip = Intl.get('clue.recommend.has.extract', '您所在的组织{timerange}已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索',{hasExtract: this.state.hasExtractCount, ableExtract: ableExtract, timerange: this.getTimeRangeText()});
        if(!ableExtract){
            //个人版试用提示升级,正式提示增加线索量
            //企业版试用提示升级,正式（管理员）提示增加线索量
            if(versionAndType.isPersonalTrial) {//个人试用
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.trial.extract.num.limit.tip"
                    defaultMessage={'明天可再提取{count}条，如需马上提取请{upgradedVersion}'}
                    values={{
                        count: maxLimitExtractNumber,
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
                maxLimitTip = Intl.get('clue.recommend.company.trial.extract.num.limit.tip', '明天可再提取{count}条，如需马上提取请联系我们销售人员（{contact}）进行升级',{count: maxLimitExtractNumber,contact: '400-6978-520'});
            } else if(versionAndType.isPersonalFormal//个人正式版
                || versionAndType.isCompanyFormal && this.isManager()) { //或企业正式版管理员
                maxLimitTip = <ReactIntl.FormattedMessage
                    id="clue.recommend.formal.extract.num.limit.tip"
                    defaultMessage={'本月{count}条已提取完毕，如需继续提取请{addClues}'}
                    values={{
                        count: maxLimitExtractNumber,
                        addClues: (
                            <Button className="customer-btn" data-tracename="点击增加线索量"
                                title={Intl.get('goods.increase.clues', '增加线索量')}
                                onClick={this.handleClickAddClues}>
                                {Intl.get('goods.increase.clues', '增加线索量')}
                            </Button>
                        )
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
        let selectedIds = _.map(this.state.selectedRecommendClues,'id');
        if(_.isEmpty(selectedIds)) {
            return;
        }
        //如果是选了修改全部
        let submitObj = this.handleBeforeSubmitChangeSales(selectedIds);
        if (_.isEmpty(submitObj)){
            return;
        }else{
            //批量提取之前要验证一下可以再提取多少条的数量，如果提取的总量比今日上限多，就提示还能再提取几条
            //如果获取提取总量失败了,就不校验数字了
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
                        count + _.get(this, 'state.selectedRecommendClues.length') > this.state.maxLimitExtractNumber
                    ){
                        this.setState({
                            batchPopoverVisible: true,
                        });
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

    handleUpdatePersonalVersion = (result) => {
        //需要更新最大线索量
        let lead_limit = _.get(result, 'version.lead_limit', '');
        let clue_number = _.get(lead_limit.split('_'),'[0]',0);
        this.setState({
            maxLimitExtractNumber: +clue_number,
            getMaxLimitExtractNumberError: false,
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
                    batchPopoverVisible: false
                });
            }
        });
    };

    renderRecommendLists = () => {
        let {recommendClueLists} = this.state;
        return (
            <div className="extract-clue-panel-container">
                {
                    _.map(recommendClueLists, item => {
                        let str = this.dealData(item);

                        return (
                            <div className="extract-clue-item">
                                <Checkbox onChange={this.handleCheckChange.bind(this, item)}/>
                                <div className="extract-clue-text-wrapper">
                                    <div className="extract-clue-text__name" title={item.name}>{item.name}</div>
                                    <div className="extract-clue-text__filters">{str}</div>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    };

    renderExtractOperator = () => {
        let hasAssignedPrivilege = !this.isCommonSales();
        if(hasAssignedPrivilege) {
            return (
                <div className="button-container">
                    <Button className="button-cancel" onClick={this.props.onClosePanel}>{Intl.get('common.cancel', '取消')}</Button>
                    <AntcDropdown
                        ref="changeSales"
                        content={
                            <Button
                                data-tracename="点击批量提取线索按钮"
                                type="primary"
                                className="button-save"
                            >
                                {Intl.get('guide.extract.clue.now', '立即提取')}
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
                <SaveCancelButton
                    loading={this.state.batchExtractLoading}
                    saveErrorMsg={this.state.saveErrorMsg}
                    okBtnText={Intl.get('guide.extract.clue.now', '立即提取')}
                    handleSubmit={(e) => {
                        Trace.traceEvent(e, '点击立即提取线索按钮');
                        this.handleSubmitAssignSalesBatch();
                    }}
                    handleCancel={this.props.onClosePanel}
                />
            );
        }
    };

    render() {
        let divHeight = $(window).height()
            - LAYOUT_CONSTANCE.PADDING_TOP
            - LAYOUT_CONSTANCE.TITLE_HEIGHT
            - LAYOUT_CONSTANCE.BTN_PADDING;

        let batchPopoverVisible = this.state.batchPopoverVisible;

        let unextractClueTipEl = $('.unextract-clue-tip');
        if(batchPopoverVisible && unextractClueTipEl.length) {
            divHeight -= unextractClueTipEl.height();
        }

        return (
            <div className="extract-clues-wrapper" data-tracename="批量提取线索操作面板">
                <div className="extract-clues-title-wrapper">
                    <div className="extract-clues-title">
                        <span>{Intl.get('clue.extract.clue', '提取线索')}</span>
                        <a className="float-r" style={{fontWeight: 400}} href="javascript:void(0);" data-tracename="点击换一批按钮" onClick={this.props.getRecommendClueLists}>{Intl.get('clue.customer.refresh.list', '换一批')}</a>
                    </div>
                </div>
                <div className="unextract-clue-tip" style={{display: batchPopoverVisible ? 'block' : 'none'}}>
                    {this.hasNoExtractCountTip()}
                </div>
                <div className="extract-clues-content" style={{height: divHeight}}>
                    <GeminiScrollbar>
                        {this.renderRecommendLists()}
                    </GeminiScrollbar>
                </div>
                <div className="extract-btn-wrapper">
                    <Button className="back-btn" data-tracename="点击返回上一步" onClick={this.props.handleBackClick}>{Intl.get('user.user.add.back', '上一步')}</Button>
                    {this.renderExtractOperator()}
                </div>
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
};

export default ExtractClues;