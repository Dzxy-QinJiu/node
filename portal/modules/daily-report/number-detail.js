/**
 * 数字详情
 */

import DetailCard from 'CMP_DIR/detail-card';

class NumberDetail extends React.Component {
    render() {
        const { numberDetail } = this.props;

        return (
            <div>
                {_.map(numberDetail.detail, item => (
                    <DetailCard
                        content={(
                            <div>
                                {item.customer_name}
                            </div>
                        )}
                    />
                ))}
            </div>
        );
    }
}

export default NumberDetail;
