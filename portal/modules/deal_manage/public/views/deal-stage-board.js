/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/13.
 */
require('../style/deal-stage-board.less');
import {Icon} from 'antd';
import {Droppable} from 'react-beautiful-dnd';
import classNames from 'classnames';
import DetailCard from 'CMP_DIR/detail-card';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DealCard from './deal-card';
import dealBoardAction from '../action/deal-board-action';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import {orderEmitter} from 'PUB_DIR/sources/utils/emitters';
import {num as antUtilsNum} from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
const BOARD_TITLE_HEIGHT = 40;//看板卡片头部标题的高度
const BOARD_CARD_MARGIN = 20;//看板卡片的marginRight

class DealStageBoard extends React.Component {

    //监听下拉加载
    handleScrollBarBottom = (type) => {
        let stageName = _.get(this.props, 'stageObj.stage', '');
        if (stageName) {
            let pageNum = _.get(this.props, 'stageObj.pageNum', 1);
            dealBoardAction.getStageDealList(stageName, this.props.searchObj, pageNum, type);
        }
    };

    componentDidMount = () => {
        orderEmitter.on(orderEmitter.REFRESH_ORDER_LIST, this.refreshOrderList);
    }

    componentWillUnMount = () => {
        orderEmitter.removeListener(orderEmitter.REFRESH_ORDER_LIST, this.refreshOrderList);
    }

    refreshOrderList = () => {
        let total = _.get(this.props, 'stageObj.total', 0);
        let list = _.get(this.props, 'stageObj.list', []);
        //当前列表长度小于总长度时并且总长度的个数大于20个时，更新列表
        if(list.length <= total && total >= 20) {
            //服务器端有延迟，一秒后再更新
            setTimeout(() => {
                this.handleScrollBarBottom('update');
            }, 1000);
        }
    }

    renderDealCardList() {
        let stageObj = this.props.stageObj;
        if (stageObj.isLoading && stageObj.pageNum === 1) {
            return (<Icon type="loading"/>);
        } else if (_.get(stageObj, 'list[0]')) {
            let boradHeight = this.props.containerHeight - BOARD_TITLE_HEIGHT - 3 * BOARD_CARD_MARGIN;
            return (
                <div className="deal-board-content"
                    style={{height: boradHeight}}>
                    <GeminiScrollbar className="srollbar-out-card-style"
                        handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={stageObj.listenScrollBottom}>
                        {_.map(stageObj.list, (deal, index) => {
                            return (
                                <DealCard deal={deal} index={index}
                                    isDetailShow={deal.id === _.get(this.props, 'currDeal.id', '')}
                                    showCustomerDetail={this.props.showCustomerDetail}
                                    showDetailPanel={this.props.showDetailPanel}/>);
                        })}
                    </GeminiScrollbar>
                </div>);
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无机会');
            if (stageObj.errorMsg) {
                noDataTip = stageObj.errorMsg;
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }

    getStageName(stageObj) {
        let stageName = _.get(stageObj, 'stage', '');
        switch (stageName) {
            case 'win':
                stageName = Intl.get('crm.order.status.win', '赢单');
                break;
            case 'lose':
                stageName = Intl.get('crm.order.status.lose', '丢单');
                break;
        }
        return stageName;
    }

    render() {
        let stageObj = this.props.stageObj;
        let totalBudget = stageObj.totalBudget ? parseAmount(formatNumHasDotToFixed(stageObj.totalBudget, 2)) : '';
        let title = (
            <span>
                <span className='deal-stage-name'> {this.getStageName(stageObj)}</span>
                <span className='deal-total-count'>
                    {Intl.get('sales.home.total.count', '共{count}个', {count: stageObj.total || '0'})}
                </span>
                <span className='deal-total-price'>
                    {stageObj.totalBudget ? Intl.get('deal.total.budget.tip', '共{count}元', {count: totalBudget || '0'}) : null}
                </span>
            </span>);
        return (
            <Droppable droppableId={_.get(stageObj, 'stage', '')}>
                {(provided, snapshot) => (
                    <div className='deal-stage-board-wrap' ref={provided.innerRef}>
                        <DetailCard
                            className={classNames('deal-stage-board-container', {'dragging-over-style': snapshot.isDraggingOver})}
                            height={this.props.containerHeight - 2 * BOARD_CARD_MARGIN}
                            title={title}
                            content={this.renderDealCardList()}
                        />
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>);
    }
}

DealStageBoard.propTypes = {
    currDeal: PropTypes.object,
    stageObj: PropTypes.object,
    searchObj: PropTypes.object,
    containerHeight: PropTypes.number,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func
};

export default DealStageBoard;