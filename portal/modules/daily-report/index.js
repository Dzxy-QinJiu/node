require('./style.less');
import {Row, Col} from 'antd';
import ReportList from './report-list';
import ReportLeftMenu from 'CMP_DIR/report-left-menu';
import ButtonZones from 'CMP_DIR/top-nav/button-zones';

const TopNav = require('CMP_DIR/top-nav');

class DailyReport extends React.Component {
    state = {
        startTime: moment().startOf('day').valueOf(),
        endTime: moment().valueOf(),
    };

    //处理日期变更事件
    onDateChange = (startTime, endTime) => {
        //dateSelectorEmitter.emit(dateSelectorEmitter.SELECT_DATE, startTime, endTime);
        this.setState({startTime, endTime});
    };

    //渲染筛选器
    renderFilter = () => {
        const memberList = this.state.memberList;
        const currentMember = this.state.currentMember;

        return (
            <ButtonZones>
                <div className="btn-item-container">
                </div>
            </ButtonZones>
        );
    };

    render() {
        return (
            <div className="sales-report" data-tracename='销售日报'>
                {this.renderFilter()}
                <div className="report-content">
                    <Row>
                        <Col span={3}>
                            <ReportLeftMenu/>
                        </Col>
                        <Col span={21} >
                            <ReportList />
                        </Col>
                    </Row>
                </div>
            </div>
        );
    }
}

module.exports = DailyReport;
