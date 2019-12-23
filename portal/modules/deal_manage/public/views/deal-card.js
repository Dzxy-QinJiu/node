/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/14.
 */
import {Draggable} from 'react-beautiful-dnd';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import {num as antUtilsNum} from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;

const getItemStyle = (isDetailShow, isDragging, draggableStyle) => ({
    userSelect: 'none',
    // change background colour if dragging
    background: isDragging ? 'lightgreen' : isDetailShow ? '#d2e7f7' : '#ffffff',
    border: 'none',
    // styles we need to apply on draggables
    ...draggableStyle
});
class DealCard extends React.Component {

    formatTime(time) {
        return time ? moment(+time).format(oplateConsts.DATE_FORMAT) : '';
    }

    showDealDetial = (e) => {
        e.stopPropagation();
        //点击客户名时，只打开客户详情
        if (_.indexOf(e.target.className, 'deal-customer-name') !== -1) {
            return;
        }
        if (_.isFunction(this.props.showDetailPanel)) {
            this.props.showDetailPanel(this.props.deal);
        }
    }
    showCustomerDetail = (e) => {
        e.stopPropagation();
        let customerId = _.get(this.props, 'deal.customer_id');
        if (customerId && _.isFunction(this.props.showCustomerDetail)) {
            this.props.showCustomerDetail(customerId);
        }
    }

    renderDealContent() {
        let deal = this.props.deal;
        let budget = deal.budget ? parseAmount(formatNumHasDotToFixed(deal.budget, 2)) : '';
        return (
            <div className="deal-card-content" onClick={this.showDealDetial}>
                <div className="deal-info-item deal-customer-name">
                    <span title={deal.customer_name} onClick={this.showCustomerDetail}>{deal.customer_name}</span>
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
        let deal = this.props.deal;
        //赢单或丢单后，状态不可改，不可拖动
        return (
            <Draggable
                draggableId={deal.id}
                index={this.props.index}>
                {(provided, snapshot) => (
                    <div className="single-deal-card draggable-style"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={getItemStyle(
                            this.props.isDetailShow,
                            snapshot.isDragging,
                            provided.draggableProps.style
                        )}>
                        {this.renderDealContent()}
                    </div>
                )}
            </Draggable>);
    }
}

DealCard.propTypes = {
    index: PropTypes.bool,
    deal: PropTypes.object,
    isDetailShow: PropTypes.bool,
    showDetailPanel: PropTypes.func,
    removeDeal: PropTypes.func,
    showCustomerDetail: PropTypes.func
};

export default DealCard;
