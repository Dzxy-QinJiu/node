/**
 * 数字详情
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport } from './utils';

class NumberDetail extends React.Component {
    render() {
        const { numberDetail } = this.props;

        return (
            <div>
                {_.map(numberDetail.detail, item => {
                    return <div>客户名：{item.customer_name}</div>;
                })}
            </div>
        );
    }
}

export default NumberDetail;
