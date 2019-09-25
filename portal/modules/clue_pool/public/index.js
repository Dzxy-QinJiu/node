import './css/index.less';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
import ContactItem from 'MOD_DIR/common_sales_home_page/public/view/contact-item';
const RightPanelClose = rightPanelUtil.RightPanelClose;
const batchOperate = require('PUB_DIR/sources/push/batch');
import { FilterInput } from 'CMP_DIR/filter';
import { SearchInput, AntcTable } from 'antc';
import userData from 'PUB_DIR/sources/user-data';
import ClueFilterPanel from './views/clue-filter-panel';
import { clueSourceArray, accessChannelArray, clueClassifyArray } from 'PUB_DIR/sources/utils/consts';
import {removeSpacesAndEnter, getTableContainerHeight } from 'PUB_DIR/sources/utils/common-method-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import { getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount } from './utils/clue-pool-utils';
import ShearContent from 'CMP_DIR/shear-content';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
import cluePoolStore from './store';
import cluePoolAction from './action';
import classNames from 'classnames';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import clueFilterAction from './action/filter-action';
import clueFilterStore from './store/filter-store';
import cluePoolAjax from './ajax';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {
    AVALIBILITYSTATUS, clueStartTime,
    getClueStatusValue,
    SELECT_TYPE
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {Button, message, Tag} from 'antd';

const Spinner = require('CMP_DIR/spinner');
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import { batchPushEmitter } from 'PUB_DIR/sources/utils/emitters';
import { RightPanel } from 'CMP_DIR/rightPanel';
import ClueDetail from 'MOD_DIR/clue_customer/public/views/clue-right-detail';
import filterEmitter from 'CMP_DIR/filter/emitter';
import {extractIcon} from 'PUB_DIR/sources/utils/consts';
import BackMainPage from 'CMP_DIR/btn-back';
//用于布局的高度
const LAYOUT_CONSTANTS = {
    FILTER_TOP: 64,//筛选框高度
    FILTER_WIDTH: 300,
    TABLE_TITLE_HEIGHT: 60,//带选择框的TH高度
    TH_MORE_HEIGHT: 20,//带选择框的TH60比不带选择框的TH40多出来的高度
    NO_DATA_INFO_HEIGHT: 184,//错误信息提示框
    LOADING_TOP: 280//加载中paddding-top
};
//线索池字段的宽度
const TABLE_WIDTH = {
    TITLE: 340,
    CONTACT: 260,
    TRACE: 280,
    EXTRACT: 56
};

class ClueExtract extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clueLeadingArray: [], // 负责人
            accessChannelArray: accessChannelArray,// 线索渠道
            clueSourceArray: clueSourceArray,// 线索来源
            clueClassifyArray: clueClassifyArray,// 线索分类
            clueProvinceArray: [], // 地域
            showFilterList: false,//是否展示线索筛选区域
            selectedClues: [],//获取批量操作选中的线索
            singleExtractLoading: false, // 单个提取的loading
            isShowClueDetailPanel: false, // 是否显示显示详情， 默认false
            selectedNumber: 0,//当用户只选了二十条数据时，记录此时的数据总量
            ...cluePoolStore.getState()
        };
    }

    // 判断是否为普通销售
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };

    // 是否是管理员或者运营人员
    isManagerOrOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };

    onStoreChange = () => {
        this.setState(cluePoolStore.getState());
    };

    updateItem = (item, submitObj) => {
        let sale_id = _.get(submitObj, 'sale_id', ''), team_id = _.get(submitObj, 'team_id', ''),
            sale_name = _.get(submitObj, 'sale_name', ''), team_name = _.get(submitObj, 'team_name', '');
        SetLocalSalesClickCount(sale_id);
        //需要在列表中删除
        cluePoolAction.updateCluePoolList(item.id);
    };

    batchChangeTraceMan = (taskInfo, taskParams) => {
        //如果参数不合法，不进行更新
        if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
            return;
        }
        //解析tasks
        let {
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
        let curClueLists = this.state.cluePoolList;
        let clueArr = _.map(tasks, 'taskDefine');
        // 遍历每一个线索
        _.each(clueArr, (clueId) => {
            //如果当前客户是需要更新的客户，才更新
            let target = _.find(curClueLists, item => item.id === clueId);
            if (target) {
                this.updateItem(target, taskParams);
            }
        });
        //当最后一个推送完成后
        if(_.isEqual(taskInfo.running, 0)) {
            let cluesNumber = this.state.cluePoolListSize;
            let totalSelected = this.state.selectedNumber;
            //如果批量筛选的数据为20以内并且当前的数据不为空
            if(totalSelected <= 20 && totalSelected > 0 && cluesNumber > 0) {
                //刷新重新获取列表
                //做1s延迟为了跟数据库同步
                setTimeout(() => {
                    this.getCluePoolList();
                },1000);
            }
        }
        this.setState({
            selectedClues: []
        });
    };

    componentDidMount() {
        cluePoolStore.listen(this.onStoreChange);
        this.getCluePoolLeading(); // 获取线索池的负责人
        this.getCluePoolSource(); // 获取线索池来源
        this.getCluePoolChannel(); // 获取线索池接入渠道
        this.getCluePoolClassify(); // 获取线索池分类
        this.getCluePoolProvince(); // 获取线索池地域
        // 普通销售不用获取销售人员的列表
        if (!this.isCommonSales()) {
            if (this.isManagerOrOperation()) {
                cluePoolAction.getAllSalesUserList();
            } else {
                cluePoolAction.getSalesManList();
            }
        }
        this.getCluePoolList();
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_LEAD_EXTRACT, this.batchChangeTraceMan);
    }

    componentWillUnmount() {
        cluePoolStore.unlisten(this.onStoreChange);
        //清空页面上的筛选条件
        clueFilterAction.setInitialData();
        cluePoolAction.resetState();
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_LEAD_EXTRACT, this.batchChangeTraceMan);
    }

    // 获取线索池的负责人
    getCluePoolLeading = () => {
        cluePoolAjax.getCluePoolLeading().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueLeadingArray: data.result
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索负责人出错了 ' + errorMsg);
        });
    };

    // 获取线索池来源
    getCluePoolSource = () => {
        cluePoolAjax.getCluePoolSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索来源出错了 ' + errorMsg);
        });
    };

    // 获取线索池接入渠道
    getCluePoolChannel = () => {
        cluePoolAjax.getCluePoolChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索渠道出错了 ' + errorMsg);
        });
    };

    // 获取线索池分类
    getCluePoolClassify = () => {
        cluePoolAjax.getCluePoolClassify().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueClassifyArray: _.union(this.state.clueClassifyArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索分类出错了 ' + errorMsg);
        });
    };

    // 获取线索池地域
    getCluePoolProvince = () => {
        cluePoolAjax.getCluePoolProvince().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueProvinceArray: data.result
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索池地域信息出错了 ' + errorMsg);
        });
    };

    // 关闭提取线索界面
    closeExtractCluePanel = () => {
        this.props.closeExtractCluePanel();
        //清空页面上的筛选条件
        clueFilterAction.setInitialData();
        cluePoolAction.resetState();
        //清空筛选条件
        filterEmitter.emit(filterEmitter.CLEAR_FILTERS);
        filterEmitter.emit(filterEmitter.CLOSE_LIST);
    };

    // 筛选
    toggleList = () => {
        this.setState({
            showFilterList: !this.state.showFilterList
        });
    };

    //获取查询线索的参数
    getClueSearchCondition = () => {
        let filterStoreData = clueFilterStore.getState();
        let rangeParams = filterStoreData.rangeParams;
        let typeFilter = this.getFilterStatus();//线索类型
        typeFilter.availability = filterStoreData.filterClueAvailability;
        //如果筛选的是无效的，不传status参数
        if (typeFilter.availability === AVALIBILITYSTATUS.INAVALIBILITY){
            delete typeFilter.status;
        }
        //按销售进行筛选
        let filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        let existFilelds = filterStoreData.exist_fields;
        let unExistFileds = filterStoreData.unexist_fields;
        let sorter = this.state.sorter;
        //如果选中的是已跟进或者已转化的线索，按最后联系时间排序
        if (typeFilter.status === SELECT_TYPE.HAS_TRACE || typeFilter.status === SELECT_TYPE.HAS_TRANSFER) {
            sorter.field = 'last_contact_time';
        }else{
            sorter.field = 'source_time';
        }
        if (!this.state.lastId){
            //清除线索的选择
            this.clearSelectedClue();
        }
        //选中的线索来源
        let filterClueSource = filterStoreData.filterClueSource;
        if (_.isArray(filterClueSource) && filterClueSource.length){
            typeFilter.clue_source = filterClueSource.join(',');
        }
        //选中的线索接入渠道
        let filterClueAccess = filterStoreData.filterClueAccess;
        if (_.isArray(filterClueAccess) && filterClueAccess.length){
            typeFilter.access_channel = filterClueAccess.join(',');
        }
        //选中的线索分类
        let filterClueClassify = filterStoreData.filterClueClassify;
        if (_.isArray(filterClueClassify) && filterClueClassify.length){
            typeFilter.clue_classify = filterClueClassify.join(',');
        }
        //选中的线索地域
        let filterClueProvince = filterStoreData.filterClueProvince;
        if (_.isArray(filterClueProvince) && filterClueProvince.length){
            typeFilter.province = filterClueProvince.join(',');
        }
        //选中的销售团队
        let filterClueTeamIds = filterStoreData.salesTeamId;
        if (_.isArray(filterClueTeamIds) && filterClueTeamIds.length){
            typeFilter.sales_team_id = filterClueProvince.join(',');
        }
        //相似客户和线索
        let filterLabels = filterStoreData.filterLabels;
        if(_.isArray(filterLabels) && filterLabels.length){
            typeFilter.labels = filterLabels;
        }
        let bodyField = {};
        if(_.isArray(existFilelds) && existFilelds.length){
            bodyField.exist_fields = existFilelds;
        }

        if(_.isArray(unExistFileds) && unExistFileds.length){
            bodyField.unexist_fields = unExistFileds;
        }
        //查询线索列表的请求参数
        return {
            queryParam: {
                rangeParams: rangeParams,
                keyword: _.trim(this.state.keyword),
                id: this.state.lastId,
                statistics_fields: 'status,availability',
            },
            bodyParam: {
                query: {
                    ...typeFilter
                },
                rang_params: rangeParams,
                ...bodyField,
            },
            pageSize: this.state.pageSize,//路径中需要加的参数
            sorter: sorter,
            firstLogin: this.state.firstLogin
        };
    };
    //获取线索列表
    getCluePoolList = () => {
        let condition = this.getClueSearchCondition();
        cluePoolAction.getCluePoolList(condition);
    };

    selectAllSearchResult = () => {
        this.setState({
            selectedClues: this.state.cluePoolList.slice(),
            selectAllMatched: true,
        });
    };
    clearSelectAllSearchResult = () => {
        this.setState({
            selectedClues: [],
            selectAllMatched: false,
        }, () => {
            $('th.ant-table-selection-column input').click();
        });
    };

    // 选中线索的提示信息
    renderSelectClueTips = () => {
        //选择全部选项后，展示：已选择全部xxx项，<a>只选当前项</a>
        if (this.state.selectAllMatched) {
            return (
                <span>
                    {Intl.get('crm.8', '已选择全部{count}项', {count: this.state.cluePoolListSize})}
                    <a href="javascript:void(0)"
                        onClick={this.clearSelectAllSearchResult}>{Intl.get('crm.10', '只选当前展示项')}</a>
                </span>);
        } else {//只选择了当前页时，展示：已选当前页xxx项, <a>选择全部xxx项</a>
            return (
                <span>
                    {Intl.get('crm.11', '已选当前页{count}项', {count: _.get(this, 'state.selectedClues.length')})}
                    {/*在筛选条件下可 全选 ，没有筛选条件时，后端接口不支持选 全选*/}
                    {/*如果一页可以展示全，不再展示选择全部的提示*/}
                    {/*{this.state.cluePoolListSize <= this.state.pageSize ? null : (*/}
                    {/*    <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>*/}
                    {/*        {Intl.get('crm.12', '选择全部{count}项', {count: this.state.cluePoolListSize})}*/}
                    {/*    </a>)*/}
                    {/*}*/}
                </span>);
        }
    };

    onTypeChange = () => {
        cluePoolAction.setClueInitialData();
        setTimeout(() => {
            this.getCluePoolList();
        });
    };

    searchFullTextEvent = (keyword) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-container'), '根据关键字搜索');
        //如果keyword存在，就用全文搜索的接口
        cluePoolAction.setKeyWord(keyword);
        //如果keyword不存在，就用获取线索的接口
        this.onTypeChange();
    };

    // 获取待分配人员列表
    getSalesDataList = () => {
        let clueSalesIdList = getClueSalesList();
        let dataList = _.map(commonMethodUtil.formatSalesmanList(this.state.salesManList), salesman => {
            let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman, 'value'));
            return {
                ...salesman,
                clickCount
            };
        });
        return dataList;
    };

    clearSelectedClue = () => {
        this.setState({
            selectedClues: [],
            selectAllMatched: false
        });
    };

    //是否有选中的线索
    hasSelectedClues = () => {
        return _.get(this, 'state.selectedClues.length');
    };

    //是否有筛选过滤条件
    hasNoFilterCondition = () => {
        let filterStoreData = clueFilterStore.getState();
        if (_.isEmpty(filterStoreData.filterClueSource) &&
            _.isEmpty(filterStoreData.filterClueAccess) &&
            _.isEmpty(filterStoreData.filterClueClassify) &&
            filterStoreData.filterClueAvailability === '' &&
            _.get(filterStoreData, 'filterClueStatus[0].selected') &&
            _.get(filterStoreData, 'rangeParams[0].from') === clueStartTime &&
            this.state.keyword === '' &&
            _.isEmpty(filterStoreData.exist_fields) &&
            _.isEmpty(filterStoreData.unexist_fields) &&
            _.isEmpty(filterStoreData.filterClueProvince) &&
            _.isEmpty(filterStoreData.salesTeamId) &&
            _.isEmpty(filterStoreData.filterLabels)) {
            return true;
        } else {
            return false;
        }
    };

    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent = () => {
        //计算margin-top高度展示错误信息
        let paddingTop = ($(window).height() - LAYOUT_CONSTANTS.NO_DATA_INFO_HEIGHT) / 2 - LAYOUT_CONSTANTS.FILTER_TOP;
        //加载中的展示
        if (this.state.isLoading && !this.state.lastId) {
            return (
                <div className="err-content" style={{'padding-top': LAYOUT_CONSTANTS.LOADING_TOP}}>
                    <div className="load-content">
                        <Spinner/>
                        <p className="abnornal-status-tip">{Intl.get('common.sales.frontpage.loading', '加载中')}</p>
                    </div>
                </div>
            );
        } else if (this.state.cluePoolGetErrMsg) {
            //加载完出错的展示
            return (
                <div className="err-content" style={{'padding-top': paddingTop}}>
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{this.state.cluePoolGetErrMsg}</p>
                </div>
            );
        } else if (!this.state.isLoading && !this.state.cluePoolGetErrMsg && !_.get(this.state.cluePoolList, 'length')) {
            //如果有筛选条件时
            return (
                <div className="err-content" style={{'padding-top': paddingTop}}>
                    <NoDataIntro
                        noDataAndAddBtnTip={Intl.get('clue.no.data', '暂无线索信息')}
                        renderAddAndImportBtns={this.renderAddAndImportBtns}
                        showAddBtn={this.hasNoFilterCondition()}
                        noDataTip={Intl.get('clue.no.data.during.range.and.status', '当前筛选时间段及状态没有相关线索信息')}
                    />
                </div>
            );

        } else {
            //渲染线索列表
            return this.renderClueCustomerBlock();
        }
    };

    // 渲染线索内容
    renderClueCustomerBlock = () => {
        let divHeight = getTableContainerHeight();
        if (this.state.cluePoolList.length) {
            return (
                <div id="clue-content-block" className="clue-content-block" ref="clueCustomerList">
                    <div className="clue-customer-list"
                        style={{height: divHeight + LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
                        id="area"
                    >
                        {this.renderClueCustomerLists()}
                    </div>
                    {/*{this.state.cluePoolListSize ?*/}
                    {/*    <BottomTotalCount*/}
                    {/*        totalCount={Intl.get('crm.215', '共{count}个线索', {'count': this.state.cluePoolListSize})}/>*/}
                    {/*    : null}*/}
                </div>
            );
        } else {
            return null;
        }
    };

    getRowSelection = () => {
        return {
            type: 'checkbox',
            selectedRowKeys: _.map(this.state.selectedClues, 'id'),
            onSelect: (record, selected, selectedRows) => {
                if (selectedRows.length !== _.get(this, 'state.cluePoolList.length')) {
                    this.state.selectAllMatched = false;
                }
                this.setState({
                    selectedClues: selectedRows,
                    selectAllMatched: this.state.selectAllMatched
                });
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中某个线索');
            },
            //对客户列表当前页进行全选或取消全选操作时触发
            onSelectAll: (selected, selectedRows, changeRows) => {
                if (this.state.selectAllMatched && selectedRows.length === 0) {
                    this.state.selectAllMatched = false;
                }
                this.setState({selectedClues: selectedRows, selectAllMatched: this.state.selectAllMatched});
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中全部线索');
            }
        };
    };

    // 下拉加载
    handleScrollBarBottom = () => {
        let currListLength = _.isArray(this.state.cluePoolList) ? this.state.cluePoolList.length : 0;
        // 判断加载的条件
        if (currListLength <= this.state.cluePoolListSize) {
            this.getCluePoolList();
        }
    };

    showNoMoreDataTip = () => {
        return !this.state.isLoading &&
            this.state.cluePoolList.length >= 20 && !this.state.listenScrollBottom;
    };

    // 单个提取线索
    handleExtractClueAssignToSale(record, flag, isDetailExtract) {
        if (!this.state.salesMan && flag) {
            cluePoolAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            let id = record.id; // 提取线索某条的id
            let sale_id = userData.getUserData().user_id; // 普通销售的id，提取给自己
            if (flag) {
                //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
                let idArray = this.state.salesMan.split('&&');
                if (_.isArray(idArray) && idArray.length) {
                    sale_id = idArray[0];// 提取给某个销售的id
                }
            }
            let reqData = {
                id: id,
                sale_id: sale_id
            };
            this.setState({
                singleExtractLoading: true
            });
            cluePoolAjax.extractClueAssignToSale(reqData).then((result) => {
                this.setState({
                    singleExtractLoading: false
                });
                if (result.code === 0) { // 提取成功
                    cluePoolAction.updateCluePoolList(id);
                    message.success(Intl.get('clue.extract.success', '提取成功'));
                    if (isDetailExtract) { // 详情中，提取成功后，关闭右侧面板
                        this.hideRightPanel();
                    }
                    this.clearSelectSales();
                } else { // 提取失败
                    message.error(Intl.get('clue.extract.failed', '提取失败'));
                }
            }, (errMsg) => {
                this.setState({
                    singleExtractLoading: false,
                });
                message.error(errMsg || Intl.get('clue.extract.failed', '提取失败'));
            });
        }

    }

    // 清空所选择的销售
    clearSelectSales = () => {
        cluePoolAction.setSalesMan({'salesMan': ''});
        cluePoolAction.setSalesManName({'salesManNames': ''});
    };

    // 展示右侧详情面板
    showClueDetailPanel = (item) => {
        this.setState({
            isShowClueDetailPanel: true
        }, () => {
            cluePoolAction.setCurrentClueId(item.id);
        });

    };

    hideRightPanel = () => {
        this.setState({isShowClueDetailPanel: false});
        //关闭右侧面板后，将当前展示线索的id置为空
        cluePoolAction.setCurrentClueId('');
        $('.ant-table-row').removeClass('current-row');
    };

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
                            {extractIcon}
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
                <span className={assigenCls}
                    onClick={this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege, isDetailExtract)}
                >
                    {extractIcon}
                </span>
            );
        }
    };

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if (record.id === this.state.currentId && this.state.isShowClueDetailPanel) {
            return 'current-row';
        } else {
            return '';
        }
    };

    // table 列
    getClueTableColunms = () => {
        //待跟进线索无跟进内容
        let typeFilter = this.getFilterStatus();//线索类型
        let willTrace = SELECT_TYPE.WILL_TRACE === typeFilter.status;
        let contactWidth = willTrace ? TABLE_WIDTH.CONTACT + TABLE_WIDTH.TRACE / 2 : TABLE_WIDTH.CONTACT;
        let titleWidth = willTrace ? TABLE_WIDTH.TITLE + TABLE_WIDTH.TRACE / 2 : TABLE_WIDTH.TITLE;
        let columns = [
            {
                dataIndex: 'clue_name',
                width: titleWidth,
                render: (text, salesClueItem, index) => {
                    let similarClue = _.get(salesClueItem, 'labels');
                    let availability = _.get(salesClueItem, 'availability');
                    let status = _.get(salesClueItem, 'status');
                    //判断是否为无效客户
                    let isInvalidClients = _.isEqual(availability, '1');
                    // 判断是否为已转化客户
                    let isConvertedClients = _.isEqual(status, '3');
                    // 已转化客户和无效客户，不可以展示“有相似客户”标签
                    let ifShowTags = !isInvalidClients && !isConvertedClients;
                    return (
                        <div className="clue-top-title">
                            <span
                                className="clue-name"
                                data-tracename="查看线索详情"
                                onClick={this.showClueDetailPanel.bind(this, salesClueItem)}
                            >
                                <div className="clue-name-item">{salesClueItem.name}</div>
                                {!isInvalidClients && _.indexOf(similarClue, '有相似线索') !== -1 ?
                                    <Tag className="clue-label intent-tag-style">
                                        {Intl.get('clue.has.similar.clue', '有相似线索')}
                                    </Tag> : null}
                                {ifShowTags && _.indexOf(similarClue, '有相似客户') !== -1 ?
                                    <Tag className="clue-label intent-tag-style">
                                        {Intl.get('clue.has.similar.customer', '有相似客户')}
                                    </Tag> : null}
                            </span>
                            <div className="clue-trace-content" key={salesClueItem.id + index}>
                                <ShearContent>
                                    <span>
                                        <span
                                            className="clue_source_time">{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}&nbsp;</span>

                                        <span>{salesClueItem.source ? Intl.get('clue.item.acceess.channel', '详情：{content}', {content: salesClueItem.source}) : null}</span>

                                    </span>
                                </ShearContent>
                            </div>
                        </div>
                    );
                }
            }, /*** todo 由于后端没有这列数据，先隐藏，有了之后，在展示
             {
                    title: Intl.get('user.login.score', '分数'),
                    dataIndex: 'score',
                    width: '15%',
                    sorter: true,
                },
             ***/
            {
                dataIndex: 'contact',
                width: contactWidth,
                render: (text, record, index) => {
                    var contacts = record.contacts ? record.contacts : [];
                    if (_.isArray(contacts) && contacts.length){
                        //处理联系方式，处理成只有一种联系方式
                        let handledContactObj = this.handleContactLists(_.cloneDeep(contacts));
                        return (
                            <div className="contact-container">
                                <ContactItem
                                    contacts={handledContactObj.contact}
                                    customerData={record}
                                    showContactLabel={false}
                                    hasMoreIcon={false}
                                    showClueDetailPanel={this.showClueDetailPanel.bind(this, record)}
                                    hidePhoneIcon={true}
                                />
                            </div>
                        );
                    }else{
                        return null;
                    }
                }
            },
            // }, {
            //     title: Intl.get('clue.extract.former.responsible.person', '原负责人'),
            //     dataIndex: 'user_name',
            //     width: '10%',
            // }, {
        ];
        if(!willTrace) {
            columns = _.concat(columns, {
                dataIndex: 'customer_trace',
                width: TABLE_WIDTH.TRACE,
                render: (text, record, index) => {
                    if (_.isArray(record.customer_traces)) {
                        return (
                            <ShearContent>{_.get(record, 'customer_traces[0].remark', '')}</ShearContent>
                        );
                    }
                }
            });
        }
        if (hasPrivilege('LEAD_EXTRACT_ALL') || hasPrivilege('LEAD_EXTRACT_SELF')) {
            columns = _.concat(columns, {
                className: 'invalid-td-clue',
                width: TABLE_WIDTH.EXTRACT,
                render: (text, record, index) => {
                    let user = userData.getUserData();
                    // 提取线索分配给相关的销售人员的权限
                    let hasAssignedPrivilege = !user.isCommonSales;
                    let assigenCls = classNames('assign-btn', {'can-edit': !text});
                    let containerCls = classNames('singl-extract-clue', {'assign-privilege handle-btn-item': hasAssignedPrivilege},);
                    return (
                        <div className={containerCls} ref='trace-person'>
                            {this.extractClueOperator(hasAssignedPrivilege, record, assigenCls, false)}
                        </div>
                    );
                }
            });
        }
        return columns;
    };

    renderClueCustomerLists = () => {
        let customerList = this.state.cluePoolList;
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBarBottom,
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('common.no.more.clue', '没有更多线索了'),
            loading: this.state.isLoading,
        };
        let rowSelection = hasPrivilege('LEAD_EXTRACT_ALL') ||
        hasPrivilege('LEAD_EXTRACT_SELF') ? this.getRowSelection() : null;

        function rowKey(record, index) {
            return record.id;
        }

        return (
            <AntcTable
                rowSelection={rowSelection}
                rowKey={rowKey}
                dropLoad={dropLoadConfig}
                dataSource={customerList}
                pagination={false}
                columns={this.getClueTableColunms()}
                rowClassName={this.handleRowClassName}
                scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
            />);

    };

    // 获取已选销售的id
    onSalesmanChange = (salesMan) => {
        cluePoolAction.setSalesMan({'salesMan': salesMan});
    };

    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        cluePoolAction.setSalesManName({'salesManNames': salesManNames});
    };

    renderSalesBlock = () => {
        let dataList = this.getSalesDataList();
        //按点击的次数进行排序
        dataList = _.sortBy(dataList, (item) => {return -item.clickCount;});
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

    //批量提取线索完成后的处理
    afterHandleAssignSalesBatch = (feedbackObj, submitObj) => {
        if (feedbackObj && feedbackObj.errorMsg) {
            message.error(feedbackObj.errorMsg || Intl.get('failed.to.distribute.cluecustomer', '分配线索客户失败'));
        } else {
            let taskId = _.get(feedbackObj, 'taskId', '');
            if (taskId) {
                // 向任务列表id中添加taskId
                batchOperate.addTaskIdToList(taskId);
                // 存储批量操作参数，后续更新时使用
                let batchParams = _.cloneDeep(submitObj);
                batchOperate.saveTaskParamByTaskId(taskId, batchParams, {
                    showPop: true,
                    urlPath: '/clue_customer'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                //批量操作参数
                let is_select_all = !!this.state.selectAllMatched;
                let totalSelectedSize = is_select_all ? this.state.cluePoolListSize : _.get(this, 'state.selectedClues.length', 0);
                batchOperate.batchOperateListener({
                    taskId: taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get('clue.extract.clue', '提取线索')
                });
            }

        }
    };

    //批量提取,发请求前的参数处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (this.isCommonSales()) { // 普通销售，批量提取参数处理
            let saleLoginData = userData.getUserData();
            let submitObj = {
                'sale_id': saleLoginData.user_id,
                'sale_name': saleLoginData.user_name,
                'team_id': saleLoginData.team_id,
                'team_name': saleLoginData.team_name,
            };
            if (itemId) {
                submitObj.customer_id = itemId;
            }
            return submitObj;

        } else { // 管理员或是销售领导，批量提取参数处理
            if (!this.state.salesMan) {
                cluePoolAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
            } else {
                let sale_id = '', team_id = '', sale_name = '', team_name = '';
                //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
                let idArray = this.state.salesMan.split('&&');
                if (_.isArray(idArray) && idArray.length) {
                    sale_id = idArray[0];//销售的id
                    team_id = idArray[1] || '';//团队的id
                }
                //销售的名字和团队的名字 格式是 销售名称 -团队名称
                let nameArray = this.state.salesManNames.split('-');
                if (_.isArray(nameArray) && nameArray.length) {
                    sale_name = nameArray[0];//销售的名字
                    team_name = _.trim(nameArray[1]) || '';//团队的名字
                }
                let submitObj = {sale_id, sale_name, team_id, team_name};
                if (itemId) {
                    submitObj.customer_id = itemId;
                }
                return submitObj;
            }
        }
    };

    handleSubmitAssignSalesBatch = () => {
        //如果是选了修改全部
        let selectedClueIds = '';
        let selectClueAll = this.state.selectAllMatched;
        this.setState({
            selectedNumber: 0
        });
        if (!selectClueAll) {
            let cluesArr = _.map(this.state.selectedClues, item => item.id);
            selectedClueIds = cluesArr.join(',');
            let selectedNumber = this.state.selectedClues.length;
            this.setState({
                selectedNumber
            });
        }
        let submitObj = this.handleBeforeSumitChangeSales(selectedClueIds);
        if (selectClueAll) {
            let queryObj = this.getClueSearchCondition();
            submitObj.query_param = queryObj.bodyParam;
        }
        if (_.isEmpty(submitObj)) {
            return;
        } else {
            cluePoolAction.batchExtractClueAssignToSale(_.cloneDeep(submitObj), (feedbackObj) => {
                this.afterHandleAssignSalesBatch(feedbackObj, submitObj);
            });
        }
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
                <div className="pull-right">
                    <div className="pull-right">
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
                    </div>
                </div>
            );
        }
    };

    //判断是否首次加载
    isFirstLoading = () => {
        return this.state.isLoading && !this.state.lastId && this.state.firstLogin;
    };

    //获取filter状态
    getFilterStatus = () => {
        let filterClueStatus = clueFilterStore.getState().filterClueStatus;
        return getClueStatusValue(filterClueStatus);
    };

    //火狐浏览器
    isFireFoxBrowser = () => {
        return navigator.userAgent.toUpperCase().indexOf('FIREFOX') > -1;
    };

    //切换线索tab
    handleChangeSelectedType = (selectedType) => {
        //如果选中的是无效状态
        if (selectedType === 'inavailibility'){
            clueFilterAction.setFilterClueAvailability();
        }else{
            clueFilterAction.setFilterType(selectedType);
        }
        this.onTypeChange();
    };

    handleContactLists = (contact) => {
        let clipContact = false;
        if (contact.length > 1){
            clipContact = true;
            contact.splice(1,contact.length - 1);
        }
        _.map(contact, (contactItem, idx) => {
            if (_.isArray(contactItem.phone) && contactItem.phone.length){
                if (contactItem.phone.length > 1){
                    contactItem.phone.splice(1, contactItem.phone.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.email) && contactItem.email.length || _.isArray(contactItem.qq) && contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact = true;

                }
                contactItem.email = [];
                contactItem.qq = [];
                contactItem.weChat = [];

            }
            if (_.isArray(contactItem.email) && contactItem.email.length){
                if (contactItem.email.length > 1){
                    contactItem.email.splice(1, contactItem.email.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.qq) && contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length) {
                    clipContact = true;

                }
                contactItem.qq = [];
                contactItem.weChat = [];
            }
            if (_.isArray(contactItem.qq) && contactItem.qq.length){
                if (contactItem.qq.length > 1){
                    contactItem.qq.splice(1, contactItem.qq.length - 1);
                    clipContact = true;
                } else if (_.isArray(contactItem.weChat) && contactItem.weChat.length) {
                    clipContact = true;

                }
                contactItem.qq.splice(1, contactItem.qq.length - 1);
                contactItem.weChat = [];
            }
            if (_.isArray(contactItem.weChat) && contactItem.weChat.length){
                if (contactItem.weChat.length > 1){
                    contactItem.weChat.splice(1, contactItem.weChat.length - 1);
                    clipContact = true;
                }

            }
        });
        return {clipContact: clipContact,contact: contact};
    };

    //渲染线索类型tab
    getClueTypeTab = () => {
        let isFirstLoading = this.isFirstLoading();
        let typeFilter = this.getFilterStatus();//线索类型
        let willTrace = classNames('clue-status-tab', {'active-tab': SELECT_TYPE.WILL_TRACE === typeFilter.status});
        let hasTrace = classNames('clue-status-tab', {'active-tab': SELECT_TYPE.HAS_TRACE === typeFilter.status});
        let filterStore = clueFilterStore.getState();
        let invalidClue = classNames('clue-status-tab', {'active-tab': filterStore.filterClueAvailability === AVALIBILITYSTATUS.INAVALIBILITY});
        let statics = this.state.agg_list;

        const clueStatusCls = classNames('clue-status-wrap',{
            'show-clue-filter': this.state.showFilterList,
            'firefox-padding': this.isFireFoxBrowser(),
            'status-type-hide': isFirstLoading
        });
        return <span className={clueStatusCls}>
            <span className={willTrace}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.WILL_TRACE)}>{Intl.get('sales.home.will.trace', '待跟进')}
                <span className="clue-status-num">{_.get(statics,'willTrace',0)}</span>
            </span>
            <span className={hasTrace}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.HAS_TRACE)}>{Intl.get('clue.customer.has.follow', '已跟进')}
                <span className="clue-status-num">{_.get(statics,'hasTrace',0)}</span>
            </span>
            <span className={invalidClue}
                onClick={this.handleChangeSelectedType.bind(this, 'inavailibility')}>{Intl.get('sales.clue.is.enable', '无效')}
                <span className="clue-status-num">{_.get(statics,'invalidClue',0)}</span>
            </span>
        </span>;
    };

    render = () => {
        const contentClassName = classNames('content-container', {
            'content-full': !this.state.showFilterList
        });
        const hasSelectedClue = this.hasSelectedClues();
        return (
            <div className="extract-clue-panel">
                <div className='extract-clue-top-nav-wrap date-picker-wrap'>
                    <div className="search-container">
                        {hasSelectedClue ? null : <BackMainPage className="clue-back-btn" 
                            handleBackClick={this.closeExtractCluePanel}></BackMainPage>}
                        <div className="search-input-wrapper">
                            <FilterInput
                                ref="filterinput"
                                toggleList={this.toggleList.bind(this)}
                                showSelectChangeTip={_.get(this.state.selectedClues, 'length')}
                            />
                        </div>
                        {hasSelectedClue ? (
                            <div className="clue-list-selected-tip">
                                <span className="iconfont icon-sys-notice"/>
                                {this.renderSelectClueTips()}
                            </div>
                        ) : <SearchInput
                            searchEvent={this.searchFullTextEvent}
                            searchPlaceHolder={Intl.get('clue.search.full.text', '全文搜索')}
                        />}
                        {
                            hasSelectedClue ? this.renderBatchChangeClues() : null
                        }
                    </div>
                </div>
                <div className='extract-clue-content-container'>
                    <div className={this.state.showFilterList ? 'filter-container' : 'filter-container filter-close'}>
                        <ClueFilterPanel
                            ref={filterPanel => this.filterPanel = filterPanel}
                            clueLeadingArray={this.state.clueLeadingArray}
                            clueSourceArray={this.state.clueSourceArray}
                            accessChannelArray={this.state.accessChannelArray}
                            clueClassifyArray={this.state.clueClassifyArray}
                            clueProvinceArray={this.state.clueProvinceArray}
                            salesManList={this.getSalesDataList()}
                            getClueList={this.getCluePoolList}
                            style={{
                                width: LAYOUT_CONSTANTS.FILTER_WIDTH,
                                height: getTableContainerHeight() + LAYOUT_CONSTANTS.TABLE_TITLE_HEIGHT
                            }}
                            showSelectTip={_.get(this.state.selectedClues, 'length')}
                        />
                    </div>
                    <div className={contentClassName}>
                        {this.getClueTypeTab()}
                        {this.renderLoadingAndErrAndNodataContent()}
                    </div>
                </div>
                {
                    this.state.isShowClueDetailPanel ? (
                        <RightPanel
                            className="clue-pool-clue-detail white-space-nowrap table-btn-fix"
                            showFlag={this.state.isShowClueDetailPanel}
                        >
                            <span className="iconfont icon-close" onClick={(e) => {
                                this.hideRightPanel();
                            }}/>
                            <div className="right-panel-content">
                                <ClueDetail
                                    ref={cluePanel => this.cluePanel = cluePanel}
                                    currentId={this.state.currentId}
                                    curClue={this.state.curClue}
                                    hideRightPanel={this.hideRightPanel}
                                    type='clue_pool'
                                    extractClueOperator={this.extractClueOperator}
                                />
                            </div>
                        </RightPanel>
                    ) : null
                }
            </div>
        );
    };
}

ClueExtract.propTypes = {
    closeExtractCluePanel: PropTypes.func,
};

export default ClueExtract;