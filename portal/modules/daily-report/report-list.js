/**
 * 报告列表
 */

import { getReportList } from './utils';

class ReportList extends React.Component {
    componentDidMount() {
        getReportList(result => {
            this.props.updateState({ reportList: result });
        });
    }

    render() {
        return (
            <div>
                报告列表
            </div>
        );
    }
}

export default ReportList;
