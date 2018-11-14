/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/14.
 */
import DetailCard from 'CMP_DIR/detail-card';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import {num as antUtilsNum} from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
class DealCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {deal: props.deal};
    }

    formatTime(time) {
        return time ? moment(+time).format(oplateConsts.DATE_FORMAT) : '';
    }

    renderDealContent() {
        let deal = this.state.deal;
        let budget = deal.budget ? parseAmount(formatNumHasDotToFixed(deal.budget * 10000, 1)) : '';
        return (
            <div className="deal-card-content">
                <div className="deal-info-item deal-customer-name" title={deal.customer_name}>
                    {deal.customer_name}
                </div>
                <div className="deal-info-item deal-budget" title={Intl.get('leave.apply.buget.count', '预算')}>
                    <i className="iconfont icon-deal-budget"/>
                    {budget ? budget + Intl.get('contract.82', '元') : null}
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
        return (
            <DetailCard
                className='single-deal-card'
                content={this.renderDealContent()}
            />);
    }
}

DealCard.propTypes = {
    deal: PropTypes.object
};
export default DealCard;