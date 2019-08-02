/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/25.
 */
require('../../css/recommend_clues_lists.less');
import {Button,message} from 'antd';
import {RightPanel, RightPanelClose} from 'CMP_DIR/rightPanel';
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerStore = require('../../store/clue-customer-store');
import RecommendCluesForm from '../recomment_clues/recommend_clues_form';
import {AntcTable} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import {getTableContainerHeight} from 'PUB_DIR/sources/utils/common-method-util';
import userData from 'PUB_DIR/sources/user-data';
const LAYOUT_CONSTANTS = {
    TH_MORE_HEIGHT: 10
};
var classNames = require('classnames');
var batchPushEmitter = require('PUB_DIR/sources/utils/emitters').batchPushEmitter;
import Trace from 'LIB_DIR/trace';
var batchOperate = require('PUB_DIR/sources/push/batch');
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount, AVALIBILITYSTATUS, isNotHasTransferStatus} from '../../utils/clue-customer-utils';
class RecommendCustomerRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRecommendClues: [],
            singleExtractLoading: false, // 单个提取的loading
            batchExtractLoading: false,
            closeFocusCustomer: false,
            ...clueCustomerStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    componentDidMount() {
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        clueCustomerStore.listen(this.onStoreChange);
        //获取推荐的线索
        this.getRecommendClueLists();
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

    getRecommendClueLists = () => {
        var conditionObj = _.cloneDeep(_.get(this, 'state.settedCustomerRecommend.obj'));
        //去掉一些不用的属性
        delete conditionObj.id;
        delete conditionObj.user_id;
        delete conditionObj.organization;
        conditionObj.load_size = this.state.pageSize;
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
            clueCustomerAction.updateRecommendClueLists(arr[0]);
        });
        this.setState({
            selectedRecommendClues: []
        });
    }

    componentWillUnmount() {
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
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
        $.ajax({
            url: '/rest/clue/extract/recommend/clue',
            dataType: 'json',
            type: 'post',
            data: reqData,
            success: (data) => {
                this.setState({
                    singleExtractLoading: false,
                });
                if (data){
                    //提取成功后，把该线索在列表中删除
                    message.success(Intl.get('clue.extract.success', '提取成功'));
                    this.clearSelectSales();
                    clueCustomerAction.updateRecommendClueLists(_.get(reqData,'companyIds[0]'));
                    //线索提取完后，会到待分配状态中
                }else{
                    message.error(Intl.get('clue.extract.failed', '提取失败'));
                }
            },
            error: (xhr) => {
                this.setState({
                    singleExtractLoading: false,
                });
                message.error(Intl.get('clue.extract.failed', '提取失败'));
            }
        });

    };
    // 获取待分配人员列表
    getSalesDataList = () => {
        let dataList = [];
        let clueSalesIdList = getClueSalesList();
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        _.each(this.state.salesManList, (salesman) => {
            let teamArray = salesman.user_groups;
            let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'user_info.user_id'));
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                _.each(teamArray, team => {
                    let teamName = _.get(team, 'group_name') ? ` - ${team.group_name}` : '';
                    let teamId = _.get(team, 'group_id') ? `&&${team.group_id}` : '';
                    dataList.push({
                        name: _.get(salesman, 'user_info.nick_name', '') + teamName,
                        value: _.get(salesman, 'user_info.user_id', '') + teamId,
                        clickCount: clickCount
                    });
                });
            }
        });
        return dataList;
    };
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        clueCustomerAction.setSalesMan({'salesMan': salesMan});
    };
    clearSelectSales = () => {
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
    // 单个提取线索
    handleExtractClueAssignToSale(record, flag, isDetailExtract) {
        if (!this.state.salesMan && flag) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            let submitObj = this.handleBeforeSumitChangeSales([record.id]);
            this.setState({
                singleExtractLoading: true
            });
            this.handleExtractRecommendClues(submitObj);
        }
    }
    extractClueOperator = (hasAssignedPrivilege, record, assigenCls, isDetailExtract) => {
        if (hasAssignedPrivilege) {
            return (
                <AntcDropdown
                    ref={assignSale => this['assignSale' + record.id] = assignSale}
                    content={
                        <span
                            data-tracename="点击提取按钮"
                            className={assigenCls}
                        >
                            {Intl.get('clue.extract', '提取')}
                        </span>}
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    isSaving={this.state.singleExtractLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege, isDetailExtract)}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}
                />
            );
        } else {
            return (
                <span
                    onClick={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege, isDetailExtract)}
                >
                    {Intl.get('clue.extract', '提取')}
                </span>
            );
        }
    };
    getRecommendClueTableColunms = () => {
        const column_width = '80px';
        let columns = [
            {
                title: Intl.get('clue.customer.recommend.clue.lists', '推荐线索'),
                dataIndex: 'name',
                width: '300px',
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex: 'legalPerson',
                width: '300px',
            }, {
                title: Intl.get('common.phone', '电话'),
                dataIndex: 'telephones',
                width: '300px',
            },{
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'oprate_btn',
                width: '300px',
                render: (text, record, index) => {
                    // 提取线索分配给相关的销售人员的权限
                    let hasAssignedPrivilege = !this.isCommonSales();
                    let assigenCls = classNames('assign-btn',{'can-edit': !text});
                    let containerCls = classNames('singl-extract-clue',{'assign-privilege': hasAssignedPrivilege});
                    return (
                        <div className={containerCls} ref='trace-person'>
                            {this.extractClueOperator(hasAssignedPrivilege, record, assigenCls, false)}
                        </div>
                    );
                }
            }
        ];
        return columns;
    };
    // 判断是否为普通销售
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };

    handleSubmitAssignSalesBatch = () => {
        //如果是选了修改全部
        let submitObj = this.handleBeforeSumitChangeSales(_.map(this.state.selectedRecommendClues,'id'));
        if (_.isEmpty(submitObj)){
            return;
        }else{
            this.handleBatchAssignClues(submitObj);
        }
    };
    //批量提取,发请求前的参数处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (this.isCommonSales()) { // 普通销售，批量提取参数处理
            let saleLoginData = userData.getUserData();
            let submitObj = {
                'user_id': saleLoginData.user_id,
                'user_name': saleLoginData.user_name,
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
                    sales_team_id = idArray[1];//团队的id
                }
                //销售的名字和团队的名字 格式是 销售名称 -团队名称
                let nameArray = this.state.salesManNames.split('-');
                if (_.isArray(nameArray) && nameArray.length) {
                    user_name = nameArray[0];//销售的名字
                    sales_team = _.trim(nameArray[1]);//团队的名字
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
            }
        };
        return rowSelection;
    };
    renderRecommendClueLists = () => {
        if (this.state.isLoadingRecommendClue) {
            return <Spinner/>;
        } else if (this.state.getRecommendClueErrMsg) {
            return (<div className="errmsg-container">
                <span className="errmsg-tip">{this.state.getRecommendClueErrMsg},</span>
                <a className="retry-btn" onClick={this.getRecommendClueLists}>
                    {Intl.get('user.info.retry', '请重试')}
                </a>
            </div>);
        } else {
            var rowSelection = this.getRowSelection();
            return (
                <AntcTable
                    rowSelection={rowSelection}
                    rowKey={this.getRowKey}
                    dataSource={this.state.recommendClueLists}
                    pagination={false}
                    columns={this.getRecommendClueTableColunms()}
                    scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
                />);
        }
    };
    getRowKey = (record, index) => {
        return record.id;
    };
    handleBatchAssignClues = (submitObj) => {
        this.setState({
            batchExtractLoading: true,
        });
        $.ajax({
            url: '/rest/clue/batch/recommend/list',
            type: 'post',
            dateType: 'json',
            data: submitObj,
            success: (data) => {
                this.setState({
                    batchExtractLoading: false
                });
                var taskId = _.get(data, 'batch_label','');
                if (taskId){
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
            },
            error: (errorMsg) => {
                this.setState({
                    batchExtractLoading: false
                });
                message.error(errorMsg || Intl.get('clue.extract.failed', '提取失败'));
            }
        });
    };
    renderBatchChangeClues = () => {
        if (this.isCommonSales()) { // 普通销售批量提取线索
            return (
                <Button
                    type="primary"
                    data-tracename="点击批量提取线索按钮"
                    className='btn-item common-sale-batch-extract'
                    onClick={this.handleSubmitAssignSalesBatch}
                >
                    {Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                </Button>
            );
        } else { // 管理员或是销售领导批量提取线索
            return (
                <AntcDropdown
                    ref='changesales'
                    content={
                        <Button
                            type="primary"
                            data-tracename="点击批量提取线索按钮"
                            className='btn-item'
                        >
                            {Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                        </Button>
                    }
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    isSaving={this.state.batchExtractLoading}
                    overlayContent={this.renderSalesBlock()}
                    handleSubmit={this.handleSubmitAssignSalesBatch}
                    unSelectDataTip={this.state.unSelectDataTip}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}
                />


            );
        }
    };

    render() {
        var hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length');
        return (
            <RightPanel showFlag={true} data-tracename="推荐线索列表" className="recommend-customer-list">
                <RightPanelClose data-tracename="关闭推荐线索列表" onClick={this.closeRecommendCluePanel}/>
                <div className="recommend-clue-panel">
                    <TopNav>
                        <div className='recommend-customer-top-nav-wrap'>
                            <Button className="btn-item" data-tracename="点击换一批按钮"
                                onClick={this.handleClickRefreshBtn}>{Intl.get('clue.customer.refresh.list', '换一批')}</Button>
                            <Button className="btn-item" data-tracename="点击修改推荐条件"
                                onClick={this.handleClickEditCondition}>{Intl.get('clue.customer.condition.change', '修改条件')}</Button>
                            {
                                hasSelectedClue ? this.renderBatchChangeClues() : null
                            }


                        </div>
                    </TopNav>
                    <div className="recommend-clue-content-container">
                        {this.renderRecommendClueLists()}
                    </div>

                </div>
                {this.state.showEditConditionPanel || this.isShowRecommendSettingPanel() ? <RecommendCluesForm
                    hasSavedRecommendParams={this.state.settedCustomerRecommend.obj}
                    hideFocusCustomerPanel={this.hideFocusCustomerPanel}
                    saveRecommedConditionsSuccess={this.saveRecommedConditionsSuccess}
                /> : null}


            </RightPanel>

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