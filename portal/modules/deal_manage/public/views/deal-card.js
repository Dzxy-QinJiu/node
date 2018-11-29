/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/14.
 */
import {DragSource, DropTarget} from 'react-dnd';
import DetailCard from 'CMP_DIR/detail-card';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import {num as antUtilsNum} from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;

class DealCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {deal: props.deal};
    }

    // componentDidMount() {
    // this.props.connectDragPreview(
    //     <div style={{color: 'red', height: 100, width: 100, float: 'left'}}>
    //         拖动视图============================</div>
    // );
    // }

    formatTime(time) {
        return time ? moment(+time).format(oplateConsts.DATE_FORMAT) : '';
    }

    showDealDetial = (e) => {
        //点击客户名时，只打开客户详情
        if (_.indexOf(e.target.className, 'deal-customer-name') !== -1) {
            return;
        }
        if (_.isFunction(this.props.showDetailPanel)) {
            this.props.showDetailPanel(this.state.deal);
        }
    }
    showCustomerDetail = (e) => {
        e.stopPropagation();
        let customerId = _.get(this.state, 'deal.customer_id');
        if (customerId && _.isFunction(this.props.showCustomerDetail)) {
            this.props.showCustomerDetail(customerId);
        }
    }

    renderDealContent() {
        let deal = this.state.deal;
        let budget = deal.budget ? parseAmount(formatNumHasDotToFixed(deal.budget * 10000, 1)) : '';
        return (
            <div className="deal-card-content" onClick={this.showDealDetial}>
                <div className="deal-info-item deal-customer-name" title={deal.customer_name}
                    onClick={this.showCustomerDetail}>
                    {deal.customer_name}
                </div>
                <div className="deal-info-item deal-budget" title={Intl.get('leave.apply.buget.count', '预算')}>
                    <i className="iconfont icon-deal-budget"/>
                    {budget ? budget + Intl.get('contract.82', '元') : (
                        <span className="deal-no-budget">{Intl.get('crm.order.no.budget', '暂无预算')}</span>)}
                </div>
                <div className="deal-info-item deal-predict-finish-time">
                    <span className="deal-item-label">{Intl.get('crm.order.expected.deal', '预计成交')}</span>
                    {this.formatTime(deal.predict_finish_time)}
                </div>
                <div className="deal-info-item">
                    <span className="deal-item-label">{deal.user_name || ''}</span>
                    <span className="deal-add-time">
                        {Intl.get('crm.order.add.to', '添加于{time}', {time: this.formatTime(deal.time)})}
                    </span>
                </div>
            </div>
        );
    }

    render() {
        const {
            connectDragSource,
            connectDropTarget,
            isOver,
            isDragging
        } = this.props;
        return connectDropTarget(connectDragSource(
            <div className="single-deal-card" style={{
                opacity: isDragging ? 0 : 1,
                backgroundColor: isOver ? '#f1f8ff' : '#ffffff'
            }}>
                {this.renderDealContent()}
            </div>));
    }
}

DealCard.propTypes = {
    deal: PropTypes.object,
    showDetailPanel: PropTypes.func,
    removeDeal: PropTypes.func,
    showCustomerDetail: PropTypes.func,
    connectDragSource: PropTypes.func,
    connectDropTarget: PropTypes.func,
    isDragging: PropTypes.bool,
    isOver: PropTypes.bool
};

const dragSpec = {
    beginDrag(props) {
        // console.log(props.deal);
        return props.deal;
    },
    endDrag(props, monitor, component) {
        if (!monitor.didDrop()) {
            return;
        }

        const item = monitor.getItem();

        const dropResult = monitor.getDropResult();

        _.isFunction(props.removeDeal) && props.removeDeal(item.id);
    }
};

function dragCollect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    };
}

const dropSpec = {
    drop(props, monitor) {
        return props.deal;
    },
    canDrop(props, monitor) {
        console.log(monitor.getItem());
        return props.deal.id !== monitor.getItem().id;
    },
};

function dropCollect(connect, monitor) {
    return {
        connectDropTarget: connect.dropTarget(),
        isOver: monitor.isOver()
    };
}

export default DropTarget('dealDragKey', dropSpec, dropCollect)(
    DragSource('dealDragKey', dragSpec, dragCollect)(DealCard)
);
