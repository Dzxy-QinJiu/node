/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
require('./style/index.less');
import { Button, Radio } from 'antd';
import { SearchInput } from 'antc';
import TopNav from 'CMP_DIR/top-nav';
import { PrivilegeChecker } from 'CMP_DIR/privilege/checker';
import dealAction from './action';
import dealBoardAction from './action/deal-board-action';
import DealForm from './views/deal-form';
import DealDetailPanel from './views/deal-detail-panel';
import { DEAL_STATUS } from 'PUB_DIR/sources/utils/consts';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import { RightPanel } from 'CMP_DIR/rightPanel';
import Trace from 'LIB_DIR/trace';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import classNames from 'classnames';
import DealBoardList from './views/deal-board-list';
import DealTable from './views/deal-table';
import orderPrivilegeConst from './privilege-const';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const PAGE_SIZE = 20;
const TOP_NAV_HEIGHT = 64,//头部导航区高度
    BOTTOM_MARGIN = 5;//看板视图的下边距
const VIEW_TYPES = {
    BOARD: 'board',//看板视图
    LIST: 'list'//列表视图
};

class DealManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDealFormShow: false,//是否展示添加订单面版
            isDetailPanelShow: false,//是否展示订单详情
            currDeal: {},//当前查看详情的订单
            searchObj: {
                field: '',
                value: ''
            },
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            curShowCustomerId: '',//当前查看的客户详情
            viewType: VIEW_TYPES.LIST,//默认展示看板视图
        };
        this.boardListRef = null;
        this.dealTableRef = null;
    }

    showDetailPanel = (deal) => {
        if (deal) {
            this.setState({currDeal: deal, isDetailPanelShow: true});
        }
    };

    hideDetailPanel = () => {
        this.setState({currDeal: {}, isDetailPanelShow: false});
    };
    //获取搜索订单的body参数
    getSearchBody = () => {
        let searchBody = {};
        //客户、负责人、阶段的搜索
        let searchObj = this.state.searchObj;
        if (_.get(searchObj, 'value')) {
            //订单阶段的搜索
            if (_.get(searchObj, 'field') === 'sale_stages') {
                let sale_stages = searchObj.value;
                if (sale_stages === Intl.get('crm.order.status.won', '赢单')) {
                    sale_stages = DEAL_STATUS.WIN;
                } else if (sale_stages === Intl.get('crm.order.status.lost', '丢单')) {
                    sale_stages = DEAL_STATUS.LOSE;
                }
                searchBody.query = {sales_opportunities: [{sale_stages}]};
            } else {
                //客户名、负责人的搜索
                let customerQuery = {};
                customerQuery[searchObj.field] = searchObj.value;
                searchBody.query = customerQuery;
            }
        }
        return searchBody;
    };

    getDealList() {
        let dealTableState = this.dealTableRef.state;
        let body = this.getSearchBody();
        let sorter = dealTableState.sorter;
        dealAction.getDealList({
            page_size: PAGE_SIZE,
            page_num: _.get(dealTableState, 'dealListObj.pageNum', 1),
            sort_field: sorter.field,
            sort_order: sorter.order
        }, body);
    }

    hideRightPanel = () => {
        this.setState({
            curShowCustomerId: ''
        });
    };

    showCustomerDetail = (customerId) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.deal-customer-name'), '查看客户详情');
        this.setState({
            curShowCustomerId: customerId,
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.hideRightPanel
            }
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };
    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    showDealForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-deal-btn'), '点击添加订单按钮');
        this.setState({isDealFormShow: true});
    };

    hideDealForm = () => {
        this.setState({isDealFormShow: false});
    };

    searchEvent = (value, key) => {
        let searchObj = this.state.searchObj;
        if (searchObj.field !== key || _.trim(value) !== searchObj.value) {
            searchObj.field = key;
            searchObj.value = _.trim(value);
            this.setState({searchObj}, () => {
                if (this.state.viewType === VIEW_TYPES.BOARD) {
                    dealBoardAction.setInitStageDealData();
                    setTimeout(() => {
                        _.each(this.boardListRef.state.stageList, stage => {
                            let stageName = _.get(stage, 'name');
                            if (stageName) {
                                let pageNum = _.get(this.boardListRef.state, `stageDealMap[${stageName}].pageNum`, 1);
                                dealBoardAction.getStageDealList(stageName, searchObj, pageNum);
                            }
                        });
                    });
                } else {//订单列表的查询
                    dealAction.setPageNum(1);
                    setTimeout(() => {
                        this.getDealList();
                    });
                }
            });
        }
    };

    getBoardContainerHeight() {
        //body高度-头部操作区的高度-底部margin
        return $('body').height() - TOP_NAV_HEIGHT - BOTTOM_MARGIN;
    }

    changViewType = (e) => {
        this.setState({
            viewType: e.target.value
        });
    };

    //当拖动改变阶段时，同步状态到订单详情展示
    dragChangeStageMsg = (editParams) => {
        if(editParams.id === this.state.currDeal.id){
            let currDeal = _.cloneDeep(this.state.currDeal);
            if(editParams.oppo_status){
                currDeal.oppo_status = editParams.oppo_status;
            }else{
                currDeal.sale_stages = editParams.sale_stages;
            }
            this.setState({currDeal});
        }
    }

    render() {
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'name'
            },
            {
                name: Intl.get('crm.6', '负责人'),
                field: 'user_name'
            }
        ];
        let isBoardView = this.state.viewType === VIEW_TYPES.BOARD;
        if (!isBoardView) {
            searchFields.unshift({
                name: Intl.get('deal.stage', '阶段'),
                field: 'sale_stages'
            });
        }
        let customerOfCurUser = this.state.customerOfCurUser;
        let dealViewCls = classNames('deal-manage-content', {'board-view-style': this.state.viewType === VIEW_TYPES.BOARD});
        let containerHeight = this.getBoardContainerHeight();
        return (
            <div className="deal-manage-container" data-tracename="订单管理">
                <TopNav>
                    <div className="deal-search-block">
                        <SearchInput
                            type="select"
                            searchFields={searchFields}
                            searchEvent={this.searchEvent}
                            className="btn-item"
                        />
                    </div>
                    <PrivilegeChecker check={orderPrivilegeConst.SALESOPPORTUNITY_ADD}>
                        <Button className='btn-item add-deal-btn' onClick={this.showDealForm}>
                            {Intl.get('crm.161', '添加订单')}
                        </Button>
                    </PrivilegeChecker>
                    <div className="deal-view-radio-container">
                        <RadioGroup size="large" value={this.state.viewType} onChange={this.changViewType}>
                            <RadioButton value={VIEW_TYPES.LIST}><i
                                className="iconfont icon-list-view"/></RadioButton>
                            <RadioButton value={VIEW_TYPES.BOARD}><i
                                className="iconfont icon-board-view"/></RadioButton>
                        </RadioGroup>
                    </div>
                </TopNav>
                <div className={dealViewCls}>
                    {this.state.viewType === VIEW_TYPES.LIST ? (
                        <DealTable
                            ref={(dealTable) => {
                                this.dealTableRef = dealTable;
                            }}
                            showCustomerDetail={this.showCustomerDetail}
                            showDetailPanel={this.showDetailPanel}
                            currDeal={this.state.currDeal}
                            curShowCustomerId={this.state.curShowCustomerId}
                            getSearchBody={this.getSearchBody}
                            searchObj={this.state.searchObj}
                            isDetailPanelShow={this.state.isDetailPanelShow}
                        />) : (
                        <div className="deal-board-view-container"
                            style={{
                                height: containerHeight,
                                width: '100%'
                            }}>
                            <DealBoardList
                                containerHeight={containerHeight}
                                ref={(boardList) => {
                                    this.boardListRef = boardList;
                                }}
                                showCustomerDetail={this.showCustomerDetail}
                                showDetailPanel={this.showDetailPanel}
                                currDeal={this.state.currDeal}
                                searchObj={this.state.searchObj}
                                dragChangeStageMsg={this.dragChangeStageMsg}
                            />
                        </div>)}
                </div>
                {this.state.isDetailPanelShow ? (
                    <DealDetailPanel currDeal={this.state.currDeal} isBoardView={isBoardView}
                        hideDetailPanel={this.hideDetailPanel}/>
                ) : this.state.isDealFormShow ? (
                    <DealForm hideDealForm={this.hideDealForm} isBoardView={isBoardView}/>
                ) : null}
                {/*查看该客户下的用户列表*/}
                <RightPanel
                    className="customer-user-list-panel"
                    showFlag={this.state.isShowCustomerUserListPanel}
                >
                    {this.state.isShowCustomerUserListPanel ?
                        <AppUserManage
                            customer_id={customerOfCurUser.id}
                            hideCustomerUserList={this.closeCustomerUserListPanel}
                            customer_name={customerOfCurUser.name}
                        /> : null
                    }
                </RightPanel>
            </div>);
    }
}

export default DealManage;