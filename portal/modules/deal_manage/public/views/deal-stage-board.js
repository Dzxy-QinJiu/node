/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/13.
 */
require('../style/deal-stage-board.less');
import Spinner from 'CMP_DIR/spinner';
import DetailCard from 'CMP_DIR/detail-card';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import DealCard from './deal-card';
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
            stage: props.stage,//此阶段的订单看板
            containerHeight: props.containerHeight,//看板的高度
            isLoadingDeal: false,//正在获取订单
            stageDealList: [],//当前阶段的订单列表
            getDealErrorMsg: '',//获取订单失败的提示
            total_size: 0,
            lastDealId: '',//用于下拉加载的订单id
            listenScrollBottom: true//下拉加载的监听
        };
    }

    componentDidMount() {
        this.getStageDealList();
    }

    componentWillUnmount() {
        this.setState(this.getInitState(this.props));
    }

    getStageDealList() {
        //权限与路径的处理
        let type = 'user';
        if (hasPrivilege(AUTHS.MANAGER_DEAL_LIST)) {
            type = 'manager';
        }
        //params路径参数的处理
        let url = `/rest/deal/${type}/20/time/descend`;
        if (_.get(this.state, 'lastDealId')) {
            url += `?id=${this.state.lastDealId}&cursor=true`;
        }
        let stage = _.get(this.state, 'stage.name', '');
        if (!stage) return;
        this.setState({isLoadingDeal: true});
        $.ajax({
            url: url,
            dataType: 'json',
            type: 'post',
            data: {query: {sale_stages: stage}},
            success: resData => {
                let stageDealList = this.state.stageDealList;
                let listenScrollBottom = this.state.listenScrollBottom;
                if (this.state.lastDealId) {
                    stageDealList = stageDealList.concat(_.get(resData, 'result', []));
                } else {
                    stageDealList = _.get(resData, 'result', []);
                }
                let totalSize = _.get(resData, 'total', 0);
                let listLength = stageDealList.length;
                if (listLength >= totalSize) {
                    listenScrollBottom = false;
                }
                this.setState({
                    isLoadingDeal: false,
                    stageDealList: stageDealList,
                    listenScrollBottom: listenScrollBottom,
                    total_size: totalSize,
                    lastDealId: listLength ? _.get(stageDealList, `[${listLength - 1}].id`) : ''
                });
            },
            error: xhr => {
                this.setState({
                    isLoadingDeal: false,
                    stageDealList: [],
                    total_size: 0,
                    getDealErrorMsg: xhr.responseJSON || Intl.get('deal.list.get.failed', '获取订单列表失败')
                });
            }
        });
    }

    //监听下拉加载
    handleScrollBarBottom = () => {
        this.getStageDealList();
    };

    renderDealCardList() {
        if (this.state.isLoadingDeal && !this.state.lastDealId) {
            return (<Spinner />);
        } else if (_.get(this.state, 'stageDealList[0]')) {
            let boradHeight = this.state.containerHeight - BOARD_TITLE_HEIGHT - 3 * BOARD_CARD_MARGIN;
            return (
                <div className="deal-board-content"
                    style={{height: boradHeight}}>
                    <GeminiScrollbar handleScrollBottom={this.handleScrollBarBottom}
                        listenScrollBottom={this.state.listenScrollBottom}>
                        {_.map(this.state.stageDealList, (deal, index) => {
                            return (
                                <DealCard deal={deal} key={index}/>);
                        })}
                    </GeminiScrollbar>
                </div>);
        } else {
            let noDataTip = Intl.get('deal.no.data', '暂无订单');
            if (this.state.getDealErrorMsg) {
                noDataTip = this.state.getDealErrorMsg;
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }

    render() {
        let stage = this.state.stage;
        let title = (
            <span>
                <span className='deal-stage-name'> {_.get(stage, 'name', '')}</span>
                <span className='deal-total-price'></span>
                <span
                    className='deal-total-count'>{Intl.get('sales.home.total.count', '共{count}个', {count: this.state.total_size || '0'})}</span>
            </span>);
        return (
            <DetailCard
                className='deal-stage-board-container'
                height={this.state.containerHeight - 2 * BOARD_CARD_MARGIN}
                title={title}
                content={this.renderDealCardList()}
            />);
    }
}
DealStageBoard.propTypes = {
    stage: PropTypes.object,
    containerHeight: PropTypes.number
};
export default DealStageBoard;