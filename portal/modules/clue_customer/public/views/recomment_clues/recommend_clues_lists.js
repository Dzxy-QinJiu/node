/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/7/25.
 */
import { BOOT_PROCESS_KEYS } from 'PUB_DIR/sources/utils/consts';

require('../../css/recommend_clues_lists.less');
import {Button,message,Popover} from 'antd';
import {RightPanel, RightPanelClose} from 'CMP_DIR/rightPanel';
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerStore = require('../../store/clue-customer-store');
import RecommendCluesForm from '../recomment_clues/recommend_clues_form';
import {AntcTable} from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import { formatSalesmanList, getTableContainerHeight } from 'PUB_DIR/sources/utils/common-method-util';
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
import {updateGuideMark} from 'PUB_DIR/sources/utils/common-data-util';
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount} from '../../utils/clue-customer-utils';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';
const maxLimitExtractNumber = 20;
class RecommendCustomerRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRecommendClues: [],
            singleExtractLoading: false, // 单个提取的loading
            batchExtractLoading: false,
            closeFocusCustomer: false,
            hasExtractCount: 0,//已经提取的推荐线索的数量
            tablePopoverVisible: '',//单个提取展示popover的那条推荐线索
            batchPopoverVisible: false,//批量操作展示popover
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
    //获取某个安全域已经提取多少推荐线索数量
    getRecommendClueCount(callback){
        $.ajax({
            url: '/rest/recommend/clue/count',
            dataType: 'json',
            type: 'get',
            data: {
                timeStart: moment().startOf('day').valueOf(),
                timeEnd: moment().endOf('day').valueOf(),
            },
            success: (data) => {
                var count = _.get(data,'total', 0);
                this.setState({
                    hasExtractCount: count
                });
                _.isFunction(callback) && callback(count);

            },
            error: (errorInfo) => {
                this.setState({
                    hasExtractCount: 0
                });
            }
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
                    // 更新引导流程
                    this.upDateGuideMark();
                    //提取成功后，把该线索在列表中删除
                    message.success(Intl.get('clue.extract.success', '提取成功'));
                    this.clearSelectSales();
                    clueCustomerAction.updateRecommendClueLists(_.get(reqData,'companyIds[0]'));
                    //线索提取完后，会到待分配状态中
                }else{
                    message.error(Intl.get('clue.extract.failed', '提取失败'));
                }
            },
            error: (errorInfo) => {
                this.setState({
                    singleExtractLoading: false,
                });
                message.error(errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败'));
            }
        });

    };
    // 获取待分配人员列表
    getSalesDataList = () => {
        let clueSalesIdList = getClueSalesList();
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
    // 单个提取线索
    handleExtractClueAssignToSale(record, flag, isDetailExtract) {
        if (!this.state.salesMan && flag) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            this.setState({
                singleExtractLoading: true
            });
            //提取线索前，先发请求获取还能提取的线索数量
            this.getRecommendClueCount((count) => {
                if (_.get(getOrganization(),'type') === Intl.get( 'common.trial', '试用') && count >= maxLimitExtractNumber){
                    this.setState({
                        tablePopoverVisible: record.id,
                        singleExtractLoading: false
                    });
                }else{
                    this.setState({
                        tablePopoverVisible: ''
                    });
                    let submitObj = this.handleBeforeSumitChangeSales([record.id]);
                    this.handleExtractRecommendClues(submitObj);
                }
            });
        }
    }
    extractClueOperator = (hasAssignedPrivilege, record, assigenCls, isDetailExtract) => {
        var checkRecord = this.state.tablePopoverVisible === record.id;
        var maxLimitTip = Intl.get('clue.recommend.extract.num.limit', '您所在组织今天提取的线索数已达{maxLimit}条上限，请明天再来提取',{maxLimit: maxLimitExtractNumber});
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
                        {Intl.get('clue.extract', '提取')}
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
            },{
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'oprate_btn',
                width: '100px',
                render: (text, record, index) => {
                    // 提取线索分配给相关的销售人员的权限
                    let hasAssignedPrivilege = !this.isCommonSales();
                    let assigenCls = classNames('assign-btn',{'can-edit': !text});
                    let containerCls = classNames('singl-extract-clue',{'assign-privilege ': hasAssignedPrivilege},'handle-btn-item');

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
            //批量提取之前要验证一下可以再提取多少条的数量，如果提取的总量比今日上限多，就提示还能再提取几条
            this.getRecommendClueCount((count) => {
                if (_.get(getOrganization(),'type') === Intl.get( 'common.trial', '试用') && count + _.get(this, 'state.selectedRecommendClues.length') > maxLimitExtractNumber){
                    this.setState({
                        batchPopoverVisible: true,
                        singleExtractLoading: false
                    });
                }else{
                    this.setState({
                        batchPopoverVisible: false
                    });
                    this.handleBatchAssignClues(submitObj);
                }
            });



        }
    };
    //批量提取,发请求前的参数处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (this.isCommonSales()) { // 普通销售，批量提取参数处理
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
    upDateGuideMark = () => {
        updateGuideMark(BOOT_PROCESS_KEYS.EXTRACT_CLUE);
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
                    // 更新引导流程
                    this.upDateGuideMark();
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
            error: (errorInfo) => {
                this.setState({
                    batchExtractLoading: false
                });
                message.error(errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败'));
            }
        });
    };
    renderBatchChangeClues = () => {
        var checkRecord = this.state.batchPopoverVisible;
        var maxLimitTip = Intl.get('clue.recommend.has.extract', '您所在的组织今天已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索',{hasExtract: this.state.hasExtractCount, ableExtract: maxLimitExtractNumber - this.state.hasExtractCount});
        if (this.isCommonSales()) { // 普通销售批量提取线索
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
                        type="primary"
                        data-tracename="点击批量提取线索按钮"
                        className='btn-item common-sale-batch-extract'
                        onClick={this.handleSubmitAssignSalesBatch}
                    >
                        {Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                    </Button>
                </Popover>
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
        var hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length');
        return (
            <div className="recommend-clues-lists-container">
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