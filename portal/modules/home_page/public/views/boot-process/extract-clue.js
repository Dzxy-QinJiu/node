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
var batchOperate = require('PUB_DIR/sources/push/batch');
import userData from 'PUB_DIR/sources/user-data';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {formatSalesmanList} from 'PUB_DIR/sources/utils/common-method-util';
import Trace from 'LIB_DIR/trace';

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
        };
    }

    componentDidMount() {
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
    }

    componentWillUnmount() {
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
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

    clearSelectSales = () => {
        this.setState({salesMan: '', salesManNames: ''});
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
            this.handleBatchAssignClues(submitObj);
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
        const divHeight = $(window).height()
            - LAYOUT_CONSTANCE.PADDING_TOP
            - LAYOUT_CONSTANCE.TITLE_HEIGHT
            - LAYOUT_CONSTANCE.BTN_PADDING;

        return (
            <div className="extract-clues-wrapper" data-tracename="批量提取线索操作面板">
                <div className="extract-clues-title-wrapper">
                    <div className="extract-clues-title">
                        <span>{Intl.get('clue.extract.clue', '提取线索')}</span>
                        <a className="float-r" style={{fontWeight: 400}} href="javascript:void(0);" data-tracename="点击换一批按钮" onClick={this.props.getRecommendClueLists}>{Intl.get('clue.customer.refresh.list', '换一批')}</a>
                    </div>
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