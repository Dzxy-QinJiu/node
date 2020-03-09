import {Row, Col} from 'antd';

class ReportFilter extends React.Component {
    state = {
        startTime: moment().startOf('day').valueOf(),
        endTime: moment().valueOf(),
    };

    //处理日期变更事件
    onDateChange = (startTime, endTime) => {
        //dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
        this.setState({startTime, endTime});
    };

    render() {
        return (
            <div className="sales-report" data-tracename='销售日报'>
                <div className="report-content">
                    <Row>
                        <Col span={3}>
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

export default ReportFilter;
