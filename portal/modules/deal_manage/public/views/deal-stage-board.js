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
const BOARD_TITLE_HEIGHT = 40;//看板卡片头部标题的高度
const BOARD_CARD_MARGIN = 20;//看板卡片的marginRight

class DealStageBoard extends React.Component {

    //监听下拉加载
    handleScrollBarBottom = () => {
        let stageName = _.get(this.props, 'stageObj.stage', '');
        if (stageName) {
            let lastDealId = _.get(this.props, 'stageObj.lastId');
            dealBoardAction.getStageDealList(stageName, lastDealId);
        }
    };

    renderDealCardList() {
        let stageObj = this.props.stageObj;
        if (stageObj.isLoading && !stageObj.lastId) {
            return (<Icon type="loading"/>);
        } else if (_.get(stageObj, 'list[0]')) {
            let boradHeight = this.props.containerHeight - BOARD_TITLE_HEIGHT - 3 * BOARD_CARD_MARGIN;
            return (
                <div className="deal-board-content"
                    style={{height: boradHeight}}>
                    <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={stageObj.listenScrollBottom}>
                        {_.map(stageObj.list, (deal, index) => {
                            return (
                                <DealCard deal={deal} index={index}
                                    showCustomerDetail={this.props.showCustomerDetail}
                                    showDetailPanel={this.props.showDetailPanel}/>);
                        })}
                    </GeminiScrollbar>
                </div>);
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无订单');
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
        let title = (
            <span>
                <span className='deal-stage-name'> {this.getStageName(stageObj)}</span>
                <span className='deal-total-price'></span>
                <span
                    className='deal-total-count'>{Intl.get('sales.home.total.count', '共{count}个', {count: stageObj.total || '0'})}</span>
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
    stageObj: PropTypes.object,
    containerHeight: PropTypes.number,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func
};

export default DealStageBoard;