/**
 * 报告详情
 */

import { Form } from 'antd';
import { renderFormItemFunc } from 'antc/lib/utils/form-utils';
import { VIEW_TYPE } from './consts';
import { renderButtonZoneFunc, hideReportPanel, getReportList, saveReport, showNumberDetail } from './utils';

class ReportDetail extends React.Component {
    render() {
        const { currentReport } = this.props;

        return (
            <div>
                {_.map(currentReport.item_values, item => {
                    return (
                        <div>
                            <span>{item.name}：</span>

                            {item.name === '其他' ? (
                                <span>{item.value}</span>
                            ) : (
                                <span className='clickable' onClick={showNumberDetail.bind(this, currentReport, item.name)}>{item.value}</span>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default ReportDetail;
