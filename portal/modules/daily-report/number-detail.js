/**
 * 数字详情
 */

import DetailCard from 'CMP_DIR/detail-card';

class NumberDetail extends React.Component {
    render() {
        const { numberDetail } = this.props;

        return (
            <div className="number-detail">
                {_.map(numberDetail.detail, item => (
                    <DetailCard
                        content={(
                            <div>
                                {/电话|通话/.test(numberDetail.name) ? (
                                    <div className="call-detail">
                                        <div className="call-time">
                                            {moment(item.call_date).format(oplateConsts.HOUR_MUNITE_FORMAT)}
                                        </div>
                                        <div className="call-info">
                                            <div className="contact-info">
                                                <div className="contact-name">
                                                    {item.contact_name || item.dst}
                                                </div>
                                                {item.billsec ? (
                                                    <div className="bill-sec">
                                                        {item.billsec}秒
                                                    </div>
                                                ) : null}
                                            </div>
                                            <div className="customer-name">
                                                {item.customer_name}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="customer-detail">
                                        {item.customer_name}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                ))}
            </div>
        );
    }
}

export default NumberDetail;
