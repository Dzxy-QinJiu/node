/**
 * 数字详情
 */

import DetailCard from 'CMP_DIR/detail-card';
import { phoneMsgEmitter, userDetailEmitter } from 'PUB_DIR/sources/utils/emitters';
import { secondsToHourMinuteSecond } from 'PUB_DIR/sources/utils/time-format-util';

class NumberDetail extends React.Component {
    render() {
        const { numberDetail } = this.props;
        const isCallDetail = /电话|通话/.test(numberDetail.name);

        return (
            <div className="number-detail">
                {_.map(numberDetail.detail, item => (
                    <DetailCard
                        contentNoPadding={isCallDetail}
                        content={(
                            <div>
                                {isCallDetail ? (
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
                                                        {secondsToHourMinuteSecond(item.billsec).timeDescr}
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
                                        <div className="customer-name clickable" onClick={this.onCustomerNameClick.bind(null, item.customer_id)}>
                                            {item.customer_name}
                                        </div>
                                        {item.app_user_name ? (
                                            <div className="app-user-names">
                                                <div className="app-user-name clickable" onClick={this.onUserNameClick.bind(null, item.app_user_id)}>
                                                    {item.app_user_name}
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        )}
                    />
                ))}
            </div>
        );
    }

    onCustomerNameClick(customerId) {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId
            }
        });
    }

    onUserNameClick(userId) {
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, { userId: userId });
    }
}

export default NumberDetail;
