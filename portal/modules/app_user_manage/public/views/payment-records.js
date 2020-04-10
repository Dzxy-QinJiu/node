require('../css/user-login-analysis.less');
import ajax from 'ant-ajax';
import CardContainer from 'CMP_DIR/card-container'; // 容器
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import StatusWrapper from 'CMP_DIR/status-wrapper';
import DetailCard from 'CMP_DIR/detail-card';
var GeminiScrollbar = require('CMP_DIR/react-gemini-scrollbar');
import { Alert, message } from 'antd';
import classNames from 'classnames';
import userManagePrivilege from '../privilege-const';

class PaymentRecords extends React.Component {
    state = {
        paymentRecordList: []
    };

    componentDidMount() {
        //获取付费记录
        this.getPaymentRecordList();
    }

    getPaymentRecordList = () => {
        ajax.send({
            url: '/rest/base/v1/realm/pay/tradeorders',
            query: {user_id: this.props.userId}
        })
            .done(result => {
                result = _.unionBy(result, 'name');
            })
            .fail(err => {
                message.error(err);
            });
    };

    render() {
        return (
            <StatusWrapper>
                <div className="payment-records-panel" style={{ height: this.props.height }}>
                    <GeminiScrollbar>
                        {_.isEmpty(this.state.paymentRecordList) ? (
                            <div className="alert-container">
                                <Alert
                                    message={Intl.get('common.no.data', '暂无数据')}
                                    type="info"
                                    showIcon={true}
                                />
                            </div>                            
                        ) : (
                            <div>
                                {_.map(this.state.paymentRecordList, (item, index) => (
                                    <DetailCard
                                        className=""
                                        key={index}
                                        titleBottomBorderNone={false}
                                        title=""
                                        content={null}
                                        isShowToggleBtn={true}
                                        isExpandDetail={true}
                                        isMutipleCard={true}
                                    />
                                ))}
                            </div>
                        )}
                    </GeminiScrollbar>
                </div>
            </StatusWrapper>
        );
    }
}

export default PaymentRecords;
