/**
 * 数字详情
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport } from './utils';

class NumberDetail extends React.Component {
    render() {
        const { currentReport } = this.props;

        return (
            <div>
                {_.map(currentReport.item_values, item => {
                    return <div>{item.name}：{item.value}</div>;
                })}
            </div>
        );
    }
}

export default NumberDetail;
