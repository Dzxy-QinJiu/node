/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/27.
 */
import {message, Spin, Icon} from 'antd';
import {DragDropContext} from 'react-beautiful-dnd';
import Spinner from 'CMP_DIR/spinner';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import dealBoardAction from '../action/deal-board-action';
import dealBoardStore from '../store/deal-board-store';
import DealStageBoard from './deal-stage-board';
import dealAjax from '../ajax';

class DealBoardList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...dealBoardStore.getState(),
            containerHeight: props.containerHeight
        };
    }

    componentDidMount() {
        dealBoardStore.listen(this.onStoreChange);
        this.getDealBoardData();
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.containerHeight !== nextProps.containerHeight) {
            this.setState({containerHeight: nextProps.containerHeight});
        }
    }

    componentWillUnmount() {
        dealBoardAction.setInitData();
        dealBoardStore.unlisten(this.onStoreChange);
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
                        let curStageLastDealId = _.get(this.state, `stageDealMap[${stageName}].lastId`, '');
                        dealBoardAction.getStageDealList(stageName, curStageLastDealId);
                    }
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
        //拖动后交易阶段的修改
        this.editDealStage(source, destination, draggableId);
    }

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
        };
        dealBoardAction.setIsSavingDragData(true);
        dealAjax.editDealStage(editParams).then(result => {
            dealBoardAction.setIsSavingDragData(false);
            if (result && result.code === 0) {
                //不同列拖动时的处理(从源列中移除，从目标列中加入)
                dealBoardAction.dragDealEnd({source, destination, draggableId});
                message.success(Intl.get('user.edit.success', '修改成功'));
            } else {
                message.error(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            dealBoardAction.setIsSavingDragData(false);
            message.error(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    }

    render() {
        if (this.state.isLoadingStage) {
            return (<Spinner />);
        } else if (_.get(this.state, 'stageList[0]')) {
            return (
                <Spin tip={Intl.get('deal.drag.data.saving', '正在保存拖动的数据...')}
                    spinning={this.state.isSavingDragData}>
                    <div className="deal-board-list">
                        <DragDropContext onDragEnd={this.onDragEnd}>
                            {_.map(this.state.stageDealMap, (stageObj, key) => {
                                return (<DealStageBoard key={key} stageObj={stageObj}
                                    showDetailPanel={this.props.showDetailPanel}
                                    showCustomerDetail={this.props.showCustomerDetail}
                                    containerHeight={this.state.containerHeight}/>);
                            })}
                        </DragDropContext>
                    </div>
                </Spin>
            );
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无订单');
            // if (this.state.getStageErrorMsg) {
            //     noDataTip = this.state.getStageErrorMsg;
            // } else if (this.state.searchObj.value) {
            //     noDataTip = Intl.get('deal.no.filter.deal', '没有符合条件的订单');
            // }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }
}

DealBoardList.propTypes = {
    stageList: PropTypes.array,
    containerHeight: PropTypes.number,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func
};

export default DealBoardList;