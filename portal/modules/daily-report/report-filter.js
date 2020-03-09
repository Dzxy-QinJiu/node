import { AntcDatePicker } from 'antc';
import { dateSelectorEmitter } from 'PUB_DIR/sources/utils/emitters';

class ReportFilter extends React.Component {
    //处理日期变更事件
    onDateChange = (startTime, endTime) => {
        dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
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
