/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/2/8.
 */
import {Icon, Select} from "antd";
var Option = Select.Option;
import {LEALVE_OPTION, LEALVE_DURATION_OPTION} from "../utils/weekly-report-utils";
import WeeklyReportDetailAction from '../action/weekly-report-detail-actions';
import WeeklyReportDetailStore from '../store/weekly-report-detail-store';


const leaveOptions = LEALVE_OPTION.map(x => (
    <Option value={x.value}>{x.label}</Option>
));
const leaveDurationOptions = LEALVE_DURATION_OPTION.map(x => {
    return <Option value={x.value}>{x.label}</Option>;
});
class AskForLeaveForm extends React.Component {
    constructor(props) {
        super(props);
        var submitObj = {};
        if (this.props.formType === "add") {
            //添加某条请假信息
            submitObj = {
                "leave_time": moment(this.props.startAndEndTimeRange.startTime).valueOf(),
                "leave_detail": "leave",
                "leave_days": 1
            };
        } else if (this.props.formType === "edit") {
            //编辑某条请假信息
            submitObj = {
                "leave_time": this.props.isEdittingItem.leave_time,
                "leave_detail": this.props.isEdittingItem.leave_detail,
                "leave_days": this.props.isEdittingItem.leave_days
            };
        }
        this.state = {
            ...WeeklyReportDetailStore.getState(),
            userId: this.props.userId,
            submitObj: submitObj
        };
    }

    onStoreChange = () => {
        this.setState(WeeklyReportDetailStore.getState());
    };
    componentDidMount = () => {
        WeeklyReportDetailStore.listen(this.onStoreChange);
    };
    componentWillUnmount = () => {
        WeeklyReportDetailStore.unlisten(this.onStoreChange);
    };
    //请假的类型
    selectleaveOptions = (value) => {
        this.state.submitObj.leave_detail = value;
        this.setState({
            submitObj: this.state.submitObj
        });
    };
    //选择请假的时间
    selectLeaveDayOptions = (value) => {
        this.state.submitObj.leave_time = value;
        this.setState({
            submitObj: this.state.submitObj
        });
    };
    //选择请假的天数
    selectLeaveDurationOptions = (value) => {
        this.state.submitObj.leave_days = value;
        this.setState({
            submitObj: this.state.submitObj
        });
    };
    //保存数据
    handleSaveLeaveData = () => {
        this.addOrEditFunction("save");
    };
    //取消保存数据
    handleCancelLeaveData = () => {
        this.addOrEditFunction("cancel");
    };

    //添加或者修改时提取出相似的方法
    addOrEditFunction = (type) =>{
        //添加请假信息时
        if (this.props.formType === "add") {
            if (type === "save"){
                var reqData = _.extend({}, {user_id: this.state.userId}, this.state.submitObj);
                WeeklyReportDetailAction.addForLeave(reqData, (result) => {
                    this.props.afterAddLeave(result);
                });
            }else if(type === "cancel"){
                this.props.cancelAddLeave();
            }

        } else if (this.props.formType === "edit") {
            if (type === "save"){
                //更新请假信息时
                var reqData = _.extend({},{id:this.props.isEdittingItem.id},this.state.submitObj);
                WeeklyReportDetailAction.updateForLeave(reqData, (result) => {
                    this.props.afterUpdateLeave(result);
                });
            }else if(type === "cancel"){
                this.props.cancelUpdateLeave();
            }
        }
    };

    render() {
        //选中的时间
        var selectedTime = this.state.submitObj.leave_time;
        var startTime = this.props.startAndEndTimeRange.startTime;
        var timeRangeArr = [startTime];
        var endTime = this.props.startAndEndTimeRange.endTime;
        for (var i = 1; i <= 6; i++) {
            timeRangeArr.push(moment(startTime).add(i, 'day').format(oplateConsts.DATE_FORMAT));
        }
        timeRangeArr.push(endTime);
        var timeRangeOptions = timeRangeArr.map(x => {
            return <Option value={moment(x).valueOf()}>{x}</Option>;
        });
        return (
            <div>
                <Select
                    defaultValue={this.state.submitObj.leave_time}
                    onChange={this.selectLeaveDayOptions}
                >
                    {timeRangeOptions}
                </Select>
                <Select
                    defaultValue={this.state.submitObj.leave_detail}
                    onChange={this.selectleaveOptions}
                >
                    {leaveOptions}
                </Select>
                <Select
                    defaultValue={this.state.submitObj.leave_days}
                    onChange={this.selectLeaveDurationOptions}
                >
                    {leaveDurationOptions}
                </Select>
                <span className="btn-container">
                    {this.state.addAskForLeave.submitting ? <Icon type="loading"/> : <span>
                        <i className="iconfont icon-choose" onClick={this.handleSaveLeaveData}></i>
                        <i className="iconfont icon-close" onClick={this.handleCancelLeaveData}></i>
                    </span>}
                </span>
            </div>
        );
    }
}
AskForLeaveForm.defaultProps = {
    formType: "add",
};
export default AskForLeaveForm;

