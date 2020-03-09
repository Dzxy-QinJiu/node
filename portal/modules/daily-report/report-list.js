/**
 * 报告列表
 */

import { AntcTable } from 'antc';
import { getReportList } from './utils';

class ReportList extends React.Component {
    componentDidMount() {
        getReportList(result => {
            //            this.props.updateState({ reportList: result });
        });
    }

    render() {
        return (
            <div>
                <AntcTable
                    columns={[]}
                    dataSource={[]}
                />
            </div>
        );
    }
}

export default ReportList;
