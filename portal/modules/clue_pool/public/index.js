require('./css/index.less');
import rightPanelUtil from 'CMP_DIR/rightPanel/index';

const RightPanelClose = rightPanelUtil.RightPanelClose;
const batchOperate = require('PUB_DIR/sources/push/batch');
import { FilterInput } from 'CMP_DIR/filter';
import { SearchInput, AntcTable } from 'antc';
import userData from 'PUB_DIR/sources/user-data';
import ClueFilterPanel from './views/clue-filter-panel';
import { clueSourceArray, accessChannelArray, clueClassifyArray } from 'PUB_DIR/sources/utils/consts';
import { removeSpacesAndEnter, getTableContainerHeight } from 'PUB_DIR/sources/utils/common-method-util';
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
import { Button, message } from 'antd';

const Spinner = require('CMP_DIR/spinner');
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import { batchPushEmitter } from 'PUB_DIR/sources/utils/emitters';
import { subtracteGlobalClue } from 'PUB_DIR/sources/utils/common-method-util';
import { RightPanel } from 'CMP_DIR/rightPanel';
import ClueDetail from 'MOD_DIR/clue_customer/public/views/clue-right-detail';

//用于布局的高度
const LAYOUT_CONSTANTS = {
    FILTER_WIDTH: 300,
    TABLE_TITLE_HEIGHT: 60,//带选择框的TH高度
    TH_MORE_HEIGHT: 20//带选择框的TH60比不带选择框的TH40多出来的高度
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
            showFilterList: userData.getUserData().isCommonSales ? true : false,//是否展示线索筛选区域
            selectedClues: [],//获取批量操作选中的线索
            singleExtractLoading: false, // 单个提取的loading
            isShowClueDetailPanel: false, // 是否显示显示详情， 默认false
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
    };

    // 筛选
    toggleList = () => {
        this.setState({
            showFilterList: !this.state.showFilterList
        });
    };

    getCondition = (isGetAllClue) => {
        let filterStoreData = clueFilterStore.getState();
        let rangeParams = isGetAllClue ? [{
            from: clueStartTime,
            to: moment().valueOf(),
            type: 'time',
            name: 'source_time'
        }] : filterStoreData.rangeParams;
        let keyWord = isGetAllClue ? '' : this.state.keyword;
        let typeFilter = {};
        //按销售进行筛选
        let filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length && !isGetAllClue) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        let queryObj = {
            keyword: keyWord,
            rangeParams: JSON.stringify(rangeParams),
            typeFilter: JSON.stringify(typeFilter)
        };
        if (!isGetAllClue) {
            // 选中的线索来源
            let filterClueSource = filterStoreData.filterClueSource;
            if (_.isArray(filterClueSource) && filterClueSource.length) {
                queryObj.clue_source = filterClueSource.join(',');
            }
            // 选中的线索接入渠道
            let filterClueAccess = filterStoreData.filterClueAccess;
            if (_.isArray(filterClueAccess) && filterClueAccess.length) {
                queryObj.access_channel = filterClueAccess.join(',');
            }
            //选中的线索分类
            let filterClueClassify = filterStoreData.filterClueClassify;
            if (_.isArray(filterClueClassify) && filterClueClassify.length) {
                queryObj.clue_classify = filterClueClassify.join(',');
            }
            //选中的线索地域
            let filterClueProvince = filterStoreData.filterClueProvince;
            if (_.isArray(filterClueProvince) && filterClueProvince.length) {
                queryObj.province = filterClueProvince.join(',');
            }
            let existFilelds = filterStoreData.exist_fields;
            //如果是筛选的重复线索，把排序字段改成repeat_id
            if (_.indexOf(existFilelds, 'repeat_id') > -1) {
                cluePoolAction.setSortField('repeat_id');
            } else {
                cluePoolAction.setSortField('source_time');
            }
            let unExistFileds = filterStoreData.unexist_fields;
            if (_.isArray(existFilelds) && existFilelds.length) {
                queryObj.exist_fields = JSON.stringify(existFilelds);
            }
            if (_.isArray(unExistFileds) && unExistFileds.length) {
                queryObj.unexist_fields = JSON.stringify(unExistFileds);
            }
        }
        return queryObj;
    };

    //获取线索列表
    getCluePoolList = (data) => {
        let rangeParams = _.get(data, 'rangeParams') || JSON.stringify(clueFilterStore.getState().rangeParams);
        let typeFilter = {};//线索类型
        let filterStoreData = clueFilterStore.getState();
        //按销售进行筛选
        let filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        let existFilelds = clueFilterStore.getState().exist_fields;
        //如果是筛选的重复线索，把排序字段改成repeat_id
        if (_.indexOf(existFilelds, 'repeat_id') > -1) {
            cluePoolAction.setSortField('repeat_id');
        } else {
            cluePoolAction.setSortField('source_time');
        }
        let unExistFileds = clueFilterStore.getState().unexist_fields;
        let condition = this.getCondition();
        delete condition.rangeParams;
        if (_.isString(condition.typeFilter)) {
            let typeFilterObj = JSON.parse(condition.typeFilter);
            for (let key in typeFilterObj) {
                condition[key] = typeFilterObj[key];
            }
            delete condition.typeFilter;
        }
        //去除查询条件中值为空的项
        commonMethodUtil.removeEmptyItem(condition);
        this.setState({
            condition: condition
        });
        //跟据类型筛选
        const queryObj = {
            lastClueId: this.state.lastId,
            pageSize: this.state.pageSize,
            sorter: this.state.sorter,
            keyword: this.state.keyword,
            rangeParams: rangeParams,
            typeFilter: _.get(data, 'typeFilter') || JSON.stringify(typeFilter),
        };
        if (!this.state.lastId) {
            //清除线索的选择
            this.clearSelectedClue();
        }
        //选中的线索来源
        let filterClueSource = filterStoreData.filterClueSource;
        if (_.isArray(filterClueSource) && filterClueSource.length) {
            queryObj.clue_source = filterClueSource.join(',');
        }
        //选中的线索接入渠道
        let filterClueAccess = filterStoreData.filterClueAccess;
        if (_.isArray(filterClueAccess) && filterClueAccess.length) {
            queryObj.access_channel = filterClueAccess.join(',');
        }
        //选中的线索分类
        let filterClueClassify = filterStoreData.filterClueClassify;
        if (_.isArray(filterClueClassify) && filterClueClassify.length) {
            queryObj.clue_classify = filterClueClassify.join(',');
        }
        //选中的线索地域
        let filterClueProvince = filterStoreData.filterClueProvince;
        if (_.isArray(filterClueProvince) && filterClueProvince.length) {
            queryObj.province = filterClueProvince.join(',');
        }
        if (_.isArray(existFilelds) && existFilelds.length) {
            queryObj.exist_fields = JSON.stringify(existFilelds);
        }

        if (_.isArray(unExistFileds) && unExistFileds.length) {
            queryObj.unexist_fields = JSON.stringify(unExistFileds);
        }
        //取全部线索列表
        cluePoolAction.getCluePoolList(queryObj);
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
                    {this.state.cluePoolListSize <= this.state.pageSize ? null : (
                        <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>
                            {Intl.get('crm.12', '选择全部{count}项', {count: this.state.cluePoolListSize})}
                        </a>)
                    }
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
            _.isEmpty(filterStoreData.filterClueProvince)) {
            return true;
        } else {
            return false;
        }
    };

    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent = () => {
        //加载中的展示
        if (this.state.isLoading && !this.state.lastId) {
            return (
                <div className="load-content">
                    <Spinner/>
                    <p className="abnornal-status-tip">{Intl.get('common.sales.frontpage.loading', '加载中')}</p>
                </div>
            );
        } else if (this.state.cluePoolGetErrMsg) {
            //加载完出错的展示
            return (
                <div className="err-content">
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{this.state.cluePoolGetErrMsg}</p>
                </div>
            );
        } else if (!this.state.isLoading && !this.state.cluePoolGetErrMsg && !_.get(this.state.cluePoolList, 'length')) {
            //如果有筛选条件时
            return (
                <NoDataIntro
                    noDataAndAddBtnTip={Intl.get('clue.no.data', '暂无线索信息')}
                    renderAddAndImportBtns={this.renderAddAndImportBtns}
                    showAddBtn={this.hasNoFilterCondition()}
                    noDataTip={Intl.get('clue.no.data.during.range.and.status', '当前筛选时间段及状态没有相关线索信息')}
                />
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
                    {this.state.cluePoolListSize ?
                        <BottomTotalCount
                            totalCount={Intl.get('crm.215', '共{count}个线索', {'count': this.state.cluePoolListSize})}/>
                        : null}
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
        let columns = [
            {
                title: Intl.get('crm.sales.clue', '线索'),
                dataIndex: 'clue_name',
                width: '35%',
                render: (text, salesClueItem, index) => {
                    return (
                        <div className="clue-top-title">
                            <span
                                className="clue-name"
                                data-tracename="查看线索详情"
                                onClick={this.showClueDetailPanel.bind(this, salesClueItem)}
                            >
                                {salesClueItem.name}
                            </span>
                            <div className="clue-trace-content" key={salesClueItem.id + index}>
                                <ShearContent>
                                    <span>
                                        <span
                                            className="clue_source_time">{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}&nbsp;</span>

                                        <span>{salesClueItem.source ? Intl.get('clue.item.acceess.channel', '描述：{content}', {content: salesClueItem.source}) : null}</span>

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
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex: 'contact',
                width: '15%',
                render: (text, record, index) => {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].name : null}</span>
                        );
                    }
                }
            }, {
                title: Intl.get('clue.extract.former.responsible.person', '原负责人'),
                dataIndex: 'user_name',
                width: '10%',
            }, {
                title: Intl.get('call.record.follow.content', '跟进内容'),
                dataIndex: 'customer_trace',
                width: 'auto',
                render: (text, record, index) => {
                    if (_.isArray(record.customer_traces)) {
                        return (
                            <ShearContent>{_.get(record, 'customer_traces[0].remark', '')}</ShearContent>
                        );
                    }
                }
            }];
        if (hasPrivilege('LEAD_EXTRACT_ALL') || hasPrivilege('LEAD_EXTRACT_SELF')) {
            columns = _.concat(columns, {
                title: Intl.get('common.operate', '操作'),
                className: 'invalid-td-clue',
                width: '10%',
                render: (text, record, index) => {
                    let user = userData.getUserData();
                    // 提取线索分配给相关的销售人员的权限
                    let hasAssignedPrivilege = !user.isCommonSales;
                    let assigenCls = classNames('assign-btn', {'can-edit': !text});
                    let containerCls = classNames('singl-extract-clue', {'assign-privilege ': hasAssignedPrivilege},'handle-btn-item');
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
        let clue_id = _.get(submitObj, 'customer_id', '');//线索的id，可能是一个，也可能是多个
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
                let totalSelectedSize = is_select_all ? this.state.customersSize : _.get(this, 'state.selectedClues.length', 0);
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
        if (!selectClueAll) {
            let cluesArr = _.map(this.state.selectedClues, item => item.id);
            selectedClueIds = cluesArr.join(',');
        }
        let submitObj = this.handleBeforeSumitChangeSales(selectedClueIds);
        if (selectClueAll) {
            submitObj.query_param = {...this.state.queryObj};
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

    render = () => {
        const contentClassName = classNames('content-container', {
            'content-full': !this.state.showFilterList
        });
        const hasSelectedClue = this.hasSelectedClues();
        return (
            <div className="extract-clue-panel">
                <div className='extract-clue-top-nav-wrap date-picker-wrap'>
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <FilterInput
                                ref="filterinput"
                                toggleList={this.toggleList.bind(this)}
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
                    {
                        hasSelectedClue ? null : <RightPanelClose onClick={this.closeExtractCluePanel}/>
                    }
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