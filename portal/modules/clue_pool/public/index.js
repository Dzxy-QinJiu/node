require('./css/index.less');
import React from 'react';
import rightPanelUtil from 'CMP_DIR/rightPanel/index';
const RightPanelClose = rightPanelUtil.RightPanelClose;
import { FilterInput } from 'CMP_DIR/filter';
import {SearchInput, AntcTable} from 'antc';
import userData from 'PUB_DIR/sources/user-data';
import ClueFilterPanel from './views/clue-filter-panel';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import {removeSpacesAndEnter, getTableContainerHeight} from 'PUB_DIR/sources/utils/common-method-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {SELECT_TYPE, getClueStatusValue,clueStartTime, getClueSalesList, getLocalSalesClickCount, SetLocalSalesClickCount, AVALIBILITYSTATUS} from './utils/clue-customer-utils';
import ShearContent from 'CMP_DIR/shear-content';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
const cluePoolStore = require('./store');
const cluePoolAction = require('./action');
import classNames from 'classnames';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import clueFilterAction from 'MOD_DIR/clue_customer/public/action/filter-action';
import clueFilterStore from 'MOD_DIR/clue_customer/public/store/clue-filter-store';
import cluePoolAjax from './ajax';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import {Button} from 'antd';
const Spinner = require('CMP_DIR/spinner');
const hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import AlwaysShowSelect from 'CMP_DIR/always-show-select';

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
            accessChannelArray: accessChannelArray,// 线索渠道
            clueSourceArray: clueSourceArray,// 线索来源
            clueClassifyArray: clueClassifyArray,// 线索分类
            showFilterList: userData.getUserData().isCommonSales ? true : false,//是否展示线索筛选区域
            selectedClues: [],//获取批量操作选中的线索
        };
    }

    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };

    onStoreChange = () => {
        this.setState(cluePoolStore.getState());
    };

    componentDidMount() {
        cluePoolStore.listen(this.onStoreChange);
        this.getCluePoolSource(); // 获取线索池来源
        this.getCluePoolChannel(); // 获取线索池接入渠道
        this.getCluePoolClassify(); // 获取线索池分类
        cluePoolAction.getSalesManList();
        //如果是普通销售，不需要发请求了
        if(!this.isCommonSales()){
            this.getClueList();
        }
    }

    componentWillUnmount() {
        cluePoolStore.unlisten(this.onStoreChange);
        //清空页面上的筛选条件
        clueFilterAction.setInitialData();
        cluePoolAction.resetState();
    }

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

    // 关闭提取线索界面
    closeExtractCluePanel = () => {
        this.props.closeExtractCluePanel();
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
        let filterClueStatus = filterStoreData.filterClueStatus;
        let typeFilter = isGetAllClue ? {status: ''} : getClueStatusValue(filterClueStatus);//线索类型
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
        if (!isGetAllClue){
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
            if (_.isArray(filterClueProvince) && filterClueProvince.length){
                queryObj.province = filterClueProvince.join(',');
            }
            let existFilelds = filterStoreData.exist_fields;
            //如果是筛选的重复线索，把排序字段改成repeat_id
            if (_.indexOf(existFilelds, 'repeat_id') > -1){
                cluePoolAction.setSortField('repeat_id');
            }else{
                cluePoolAction.setSortField('source_time');
            }
            let unExistFileds = filterStoreData.unexist_fields;
            if(_.isArray(existFilelds) && existFilelds.length){
                queryObj.exist_fields = JSON.stringify(existFilelds);
            }
            if(_.isArray(unExistFileds) && unExistFileds.length){
                queryObj.unexist_fields = JSON.stringify(unExistFileds);
            }
        }
        return queryObj;
    };

    //获取线索列表
    getCluePoolList = (data) => {
        let rangeParams = _.get(data, 'rangeParams') || JSON.stringify(clueFilterStore.getState().rangeParams);
        let filterClueStatus = clueFilterStore.getState().filterClueStatus;
        let typeFilter = getClueStatusValue(filterClueStatus);//线索类型
        let filterStoreData = clueFilterStore.getState();
        //按销售进行筛选
        let filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        let existFilelds = clueFilterStore.getState().exist_fields;
        //如果是筛选的重复线索，把排序字段改成repeat_id
        if (_.indexOf(existFilelds, 'repeat_id') > -1){
            cluePoolAction.setSortField('repeat_id');
        }else{
            cluePoolAction.setSortField('source_time');
        }
        let unExistFileds = clueFilterStore.getState().unexist_fields;
        let condition = this.getCondition();
        delete condition.rangeParams;
        if (_.isString(condition.typeFilter)){
            let typeFilterObj = JSON.parse(condition.typeFilter);
            for(let key in typeFilterObj){
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
            typeFilter: _.get(data, 'typeFilter') || JSON.stringify(typeFilter)
        };
        if (!this.state.lastId){
            //清除线索的选择
            this.clearSelectedClue();
        }
        //选中的线索来源
        let filterClueSource = filterStoreData.filterClueSource;
        if (_.isArray(filterClueSource) && filterClueSource.length){
            queryObj.clue_source = filterClueSource.join(',');
        }
        //选中的线索接入渠道
        let filterClueAccess = filterStoreData.filterClueAccess;
        if (_.isArray(filterClueAccess) && filterClueAccess.length){
            queryObj.access_channel = filterClueAccess.join(',');
        }
        //选中的线索分类
        let filterClueClassify = filterStoreData.filterClueClassify;
        if (_.isArray(filterClueClassify) && filterClueClassify.length){
            queryObj.clue_classify = filterClueClassify.join(',');
        }
        //选中的线索地域
        let filterClueProvince = filterStoreData.filterClueProvince;
        if (_.isArray(filterClueProvince) && filterClueProvince.length){
            queryObj.province = filterClueProvince.join(',');
        }
        if(_.isArray(existFilelds) && existFilelds.length){
            queryObj.exist_fields = JSON.stringify(existFilelds);
        }

        if(_.isArray(unExistFileds) && unExistFileds.length){
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
                    {Intl.get('crm.8', '已选择全部{count}项', { count: this.state.cluePoolListSize })}
                    <a href="javascript:void(0)"
                        onClick={this.clearSelectAllSearchResult}>{Intl.get('crm.10', '只选当前展示项')}</a>
                </span>);
        } else {//只选择了当前页时，展示：已选当前页xxx项, <a>选择全部xxx项</a>
            return (
                <span>
                    {Intl.get('crm.11', '已选当前页{count}项', { count: _.get(this, 'state.selectedClues.length') })}
                    {/*在筛选条件下可 全选 ，没有筛选条件时，后端接口不支持选 全选*/}
                    {/*如果一页可以展示全，不再展示选择全部的提示*/}
                    {_.isEmpty(this.state.condition) || this.state.cluePoolListSize <= this.state.pageSize ? null : (
                        <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>
                            {Intl.get('crm.12', '选择全部{count}项', { count: this.state.cluePoolListSize })}
                        </a>)
                    }
                </span>);
        }
    };

    onTypeChange = () => {
        cluePoolAction.setClueInitialData();
        setTimeout(() => {
            this.getClueList();
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
        if (_.isEmpty(filterStoreData.filterClueSource) && _.isEmpty(filterStoreData.filterClueAccess) && _.isEmpty(filterStoreData.filterClueClassify) && filterStoreData.filterClueAvailability === '' && _.get(filterStoreData,'filterClueStatus[0].selected') && _.get(filterStoreData, 'rangeParams[0].from') === clueStartTime && this.state.keyword === '' && _.isEmpty(filterStoreData.exist_fields) && _.isEmpty(filterStoreData.unexist_fields) && _.isEmpty(filterStoreData.filterClueProvince)){
            return true;
        }else{
            return false;
        }
    };

    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent = () => {
        //加载中的展示
        if (this.state.isLoading && !this.state.lastId) {
            return (
                <div className="load-content">
                    <Spinner />
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
                    noDataAndAddBtnTip={Intl.get('clue.no.data','暂无线索信息')}
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
        }else{
            return null;
        }
    };

    getRowSelection = () => {
        //只有有批量变更权限并且不是普通销售的时候，才展示选择框的处理
        let showSelectionFlag = (hasPrivilege('CLUECUSTOMER_DISTRIBUTE_MANAGER') || hasPrivilege('CLUECUSTOMER_DISTRIBUTE_USER')) && !userData.getUserData().isCommonSales;
        if (showSelectionFlag){
            let rowSelection = {
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
            return rowSelection;

        }else{
            return null;
        }
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
    // table 列
    getClueTableColunms = () => {
        const column_width = '80px';
        return [
            {
                title: Intl.get('crm.sales.clue', '线索'),
                dataIndex: 'clue_name',
                width: '30%',
                render: (text, salesClueItem, index) => {
                    return (
                        <div className="clue-top-title" >
                            <span>{salesClueItem.name}</span>
                            <div className="clue-trace-content" key={salesClueItem.id + index}>
                                <ShearContent>
                                    <span>
                                        <span className="clue_source_time">{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}&nbsp;</span>

                                        <span>{salesClueItem.source ? Intl.get('clue.item.acceess.channel', '描述：{content}',{content: salesClueItem.source}) : null}</span>

                                    </span>
                                </ShearContent>
                            </div>
                        </div>
                    );

                }
            }, {
                title: Intl.get('user.login.score', '分数'),
                dataIndex: 'score',
                width: '15%',
                sorter: true,
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex: 'contact',
                width: '15%',
            }, {
                title: '原负责人', //  todo 原负责人
                dataIndex: 'trace_person',
                width: '10%',
            },{
                title: Intl.get('call.record.follow.content', '跟进内容'),
                dataIndex: 'trace_content',
                width: '20%',
            }, {
                title: Intl.get('common.operate', '操作'),
                className: 'invalid-td-clue',
                width: '20%',
            }];
    };

    setInvalidClassName= (record, index) => {
        return (record.availability === '1' ? 'invalid-clue' : '');
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
        let rowSelection = this.getRowSelection();
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
                rowClassName={this.setInvalidClassName}
                scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
            />);

    };

    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        cluePoolAction.setSalesManName({'salesManNames': salesManNames});
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

    renderBatchChangeClues = () => {
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
                        isSaving={this.state.distributeBatchLoading}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={this.handleSubmitAssignSalesBatch}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        btnAtTop={false}
                    />
                </div>
            </div>
        );
    };

    render = () => {
        const contentClassName = classNames('content-container',{
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
                                <span className="iconfont icon-sys-notice" />
                                {this.renderSelectClueTips()}
                            </div>
                        ) : <SearchInput
                            searchEvent={this.searchFullTextEvent}
                            searchPlaceHolder ={Intl.get('clue.search.full.text','全文搜索')}
                        />}
                        {
                            hasSelectedClue ? this.renderBatchChangeClues() : null
                        }
                    </div>
                    <RightPanelClose onClick={this.closeExtractCluePanel}/>
                </div>
                <div className='extract-clue-content-container'>
                    <div className={this.state.showFilterList ? 'filter-container' : 'filter-container filter-close'}>
                        <ClueFilterPanel
                            ref={filterPanel => this.filterPanel = filterPanel}
                            clueSourceArray={this.state.clueSourceArray}
                            accessChannelArray={this.state.accessChannelArray}
                            clueClassifyArray={this.state.clueClassifyArray}
                            salesManList={this.getSalesDataList()}
                            getClueList={this.getCluePoolList}
                            style={{width: LAYOUT_CONSTANTS.FILTER_WIDTH, height: getTableContainerHeight() + LAYOUT_CONSTANTS.TABLE_TITLE_HEIGHT}}
                            showSelectTip={_.get(this.state.selectedClues, 'length')}
                        />
                    </div>
                    <div className={contentClassName}>
                        {this.renderLoadingAndErrAndNodataContent()}
                    </div>
                </div>
            </div>
        );
    }
}

ClueExtract.propTypes = {
    closeExtractCluePanel: PropTypes.func,
};

export default ClueExtract;