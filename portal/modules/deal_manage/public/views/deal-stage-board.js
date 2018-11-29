/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/13.
 */
require('../style/deal-stage-board.less');
import {Icon} from 'antd';
import DetailCard from 'CMP_DIR/detail-card';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DealCard from './deal-card';
import dealBoardAction from '../action/deal-board-action';
const AUTHS = {
    MANAGER_DEAL_LIST: 'CRM_MANAGER_LIST_SALESOPPORTUNITY',
};
const BOARD_TITLE_HEIGHT = 40;//看板卡片头部标题的高度
const BOARD_CARD_MARGIN = 20;//看板卡片的marginRight
class DealStageBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitState(props);
    }

    getInitState(props) {
        return {
            stageObj: props.stageObj,//此阶段的数据对象
            containerHeight: props.containerHeight//看板的高度
        };
    }

    componentWillUnmount() {
        this.setState(this.getInitState(this.props));
    }

    //监听下拉加载
    handleScrollBarBottom = () => {
        let stageName = _.get(this.state, 'stageObj.stage', '');
        if (stageName) {
            let lastDealId = _.get(this.state, 'stageObj.lastId');
            dealBoardAction.getStageDealList(stageName, lastDealId);
        }
    };

    // 插入拖进来的订单,dropId:插入到哪个订单前面
    insertDeal = (deal, dropId) => {
        let stageDealList = this.state.stageDealList;
        if (dropId) {
            let insertIndex = _.findIndex(stageDealList, item => item.id === dropId);
            stageDealList.splice(insertIndex, 0, deal);
        } else {
            stageDealList.push(deal);
        }
        this.setState({stageDealList});
    };

    removeDeal = (dealId) => {
        if (dealId) {
            let stageDealList = this.state.stageDealList;
            stageDealList = _.filter(stageDealList, item => item.id !== dealId);
            this.setState({stageDealList});
        }
    };

    renderDealCardList() {
        let stageObj = this.state.stageObj;
        if (stageObj.isLoading && !stageObj.lastId) {
            return (<Icon type="loading"/>);
        } else if (_.get(stageObj, 'list[0]')) {
            let boradHeight = this.state.containerHeight - BOARD_TITLE_HEIGHT - 3 * BOARD_CARD_MARGIN;
            return (
                <div className="deal-board-content"
                    style={{height: boradHeight}}>
                    <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={stageObj.listenScrollBottom}>
                        {_.map(stageObj.list, (deal, index) => {
                            return (
                                <DealCard deal={deal} key={index}
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
        let stageObj = this.state.stageObj;
        let title = (
            <span>
                <span className='deal-stage-name'> {this.getStageName(stageObj)}</span>
                <span className='deal-total-price'></span>
                <span
                    className='deal-total-count'>{Intl.get('sales.home.total.count', '共{count}个', {count: stageObj.total || '0'})}</span>
            </span>);
        return (
            <div className='deal-stage-board-wrap'>
                <DetailCard
                    className='deal-stage-board-container'
                    height={this.state.containerHeight - 2 * BOARD_CARD_MARGIN}
                    title={title}
                    content={this.renderDealCardList()}
                />
            </div>);
    }
}

DealStageBoard.propTypes = {
    stageObj: PropTypes.object,
    containerHeight: PropTypes.number,
    showDetailPanel: PropTypes.func,
    showCustomerDetail: PropTypes.func
};

export default DealStageBoard;