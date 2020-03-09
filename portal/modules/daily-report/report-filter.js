import { AntcDatePicker } from 'antc';

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
            <AntcDatePicker
                disableDateAfterToday={true}
                range='day'
                onSelect={this.onDateChange}
                selectedTimeFormat='int'
                className="btn-item"
            />
        );
    }
}

export default ReportFilter;
