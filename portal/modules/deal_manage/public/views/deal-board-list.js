/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/27.
 */
import {message, Spin, Icon} from 'antd';
import {DragDropContext} from 'react-beautiful-dnd';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import adaptiveHeightHoc from 'CMP_DIR/adaptive-height-hoc';
import dealBoardAction from '../action/deal-board-action';
import dealBoardStore from '../store/deal-board-store';
import DealStageBoard from './deal-stage-board';
import dealAjax from '../ajax';
let DealBoardContainerEl = null;
let DealBoardScrollLeft = 0;
const TOP_NAV_HEIGHT = 64,//头部导航区高度
    BOTTOM_MARGIN = 5;//看板视图的下边距
class DealBoardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...dealBoardStore.getState()
        };
    }

    componentDidMount() {
        dealBoardStore.listen(this.onStoreChange);
        this.getDealBoardData();
        DealBoardContainerEl = $('.deal-board-view-container');
    }

    componentWillUnmount() {
        dealBoardAction.setInitData();
        dealBoardStore.unlisten(this.onStoreChange);
        DealBoardContainerEl = null;
        DealBoardScrollLeft = 0;
    }

    onStoreChange = () => {
        // console.log(dealBoardStore.getState());
        this.setState(dealBoardStore.getState());
    };

    getDealBoardData() {
        dealBoardAction.getStageList((stageList => {
            if (_.get(stageList, '[0]')) {
                //获取各阶段的交易列表
                _.each(stageList, stage => {
                    let stageName = _.get(stage, 'name');
                    if (stageName) {
                        let pageNum = _.get(this.state, `stageDealMap[${stageName}].pageNum`, 1);
                        dealBoardAction.getStageDealList(stageName, this.props.searchObj, pageNum);
                    }
                });
                //获取各阶段订单的总预算
                dealBoardAction.getStageTotalBudget({
                    start_time: 0,//所有时间的订单,所以start_time:0
                    end_time: moment().valueOf(),
                    app_id: 'all'
                });
            }
        }));
    }

    onDragEnd = (dragResult) => {
        const {source, destination, draggableId} = dragResult;
        // dropped outside the list
        if (!destination) return;
        //同列内做拖动时，不做排序的处理
        if (source.droppableId === destination.droppableId) return;
        //拖动的是关闭的订单时
        if (source.droppableId === 'win' || source.droppableId === 'lose') {
            message.warn(Intl.get('deal.drag.data.disabled', '关闭的订单不可以修改'));
            return;
        }
        //关闭订单（赢单、丢单）
        if (destination.droppableId === 'win' || destination.droppableId === 'lose') {
            this.closeDeal(source, destination, draggableId);
        } else {
            //拖动后交易阶段的修改
            this.editDealStage(source, destination, draggableId);
        }
    }
    //修改订单阶段
    editDealStage(source, destination, draggableId) {
        //拖动源列的数据对象
        let sourceStageObj = this.state.stageDealMap[source.droppableId];
        // 拖动的交易数据
        let dragDeal = _.find(sourceStageObj.list, deal => deal.id === draggableId);
        //修改当前拖动交易的阶段
        let editParams = {
            customer_id: dragDeal.customer_id,
            id: dragDeal.id,
            sale_stages: destination.droppableId,
            property: 'sale_stages'
        };
        dealBoardAction.setIsSavingDragData(true);
        // 获取横向滚动条的位置
        if(DealBoardContainerEl) DealBoardScrollLeft = DealBoardContainerEl.scrollLeft();
        dealAjax.editDeal(editParams).then(result => {
            dealBoardAction.setIsSavingDragData(false);
            if (result && result.code === 0) {
                //不同列拖动时的处理(从源列中移除，从目标列中加入)
                dealBoardAction.dragDealEnd({source, destination, draggableId});
                this.props.dragChangeStageMsg(editParams);
                message.success(Intl.get('user.edit.success', '修改成功'));
            } else {
                message.error(Intl.get('common.edit.failed', '修改失败'));
            }
            this.setScrollLeft();
        }, (errorMsg) => {
            dealBoardAction.setIsSavingDragData(false);
            message.error(errorMsg || Intl.get('common.edit.failed', '修改失败'));
            this.setScrollLeft();
        });
    }

    //关闭订单（赢单、丢单）
    closeDeal = (source, destination, draggableId) => {
        //拖动源列的数据对象
        let sourceStageObj = this.state.stageDealMap[source.droppableId];
        // 拖动的交易数据
        let dragDeal = _.find(sourceStageObj.list, deal => deal.id === draggableId);
        let saveDeal = {
            customer_id: dragDeal.customer_id,
            id: dragDeal.id,
            oppo_status: destination.droppableId
        };
        if (saveDeal.customer_id && saveDeal.id) {
            dealBoardAction.setIsSavingDragData(true);
            // 获取横向滚动条的位置
            if(DealBoardContainerEl) DealBoardScrollLeft = DealBoardContainerEl.scrollLeft();
            dealAjax.editDeal(saveDeal).then(result => {
                dealBoardAction.setIsSavingDragData(false);
                if (result && result.code === 0) {
                    //不同列拖动时的处理(从源列中移除，从目标列中加入)
                    dealBoardAction.dragDealEnd({source, destination, draggableId});
                    this.props.dragChangeStageMsg(saveDeal);
                    message.success(Intl.get('user.edit.success', '修改成功'));
                } else {
                    message.error(Intl.get('common.edit.failed', '修改失败'));
                }
                this.setScrollLeft();
            }, (errorMsg) => {
                dealBoardAction.setIsSavingDragData(false);
                message.error(errorMsg || Intl.get('common.edit.failed', '修改失败'));
                this.setScrollLeft();
            });
        }
    };

    // 拖放后，保持横向滚动条的位置不变
    setScrollLeft = () => {
        if(DealBoardContainerEl) DealBoardContainerEl.scrollLeft(DealBoardScrollLeft || 0);
    };

    getBoardContainerHeight() {
        //body高度-头部操作区的高度-底部margin
        return this.props.adaptiveHeight - TOP_NAV_HEIGHT - BOTTOM_MARGIN;
    }

    renderBoardView() {
        if (this.state.isLoadingStage) {
            return (<Spinner />);
        } else if (_.get(this.state, 'stageList[0]')) {
            return (
                <Spin tip={Intl.get('deal.drag.data.saving', '正在保存拖动的数据...')}
                    spinning={this.state.isSavingDragData}>
                    <div className="deal-board-list">
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            {_.map(this.state.stageDealMap, (stageObj, key) => {
                                return (<DealStageBoard
                                    key={key} stageObj={stageObj}
                                    currDeal={this.props.currDeal}
                                    showDetailPanel={this.props.showDetailPanel}
                                    showCustomerDetail={this.props.showCustomerDetail}
                                    searchObj={this.props.searchObj}
                                    containerHeight={this.getBoardContainerHeight()}/>);
                            })}
                        </DragDropContext>
                    </div>
                </Spin>
            );
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无订单');
            // if (this.state.getStageErrorMsg) {
            //     noDataTip = this.state.getStageErrorMsg;
            // } else
            if (_.get(this.props, 'searchObj.value')) {
                noDataTip = Intl.get('deal.no.filter.deal', '没有符合条件的订单');
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }
    render(){
        return (
            <div className="deal-board-view-container"
                style={{
                    height: this.getBoardContainerHeight(),
                    width: '100%'
                }}>
                {this.renderBoardView()}
            </div>);
    }
}

DealBoardList.propTypes = {
    currDeal: PropTypes.object,
    stageList: PropTypes.array,
    searchObj: PropTypes.object,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func,
    dragChangeStage: PropTypes.func,
    dragChangeStageMsg: PropTypes.func,
    adaptiveHeight: PropTypes.number
};

export default adaptiveHeightHoc(DealBoardList);