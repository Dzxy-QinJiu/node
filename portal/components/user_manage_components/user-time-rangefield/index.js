import {Form} from 'antd';
import DateSelector from '../../date-selector';
const FormItem = Form.Item;

const UserTimeRangeField = {
    renderUserTimeRangeBlock(config) {

        config = $.extend({
            isCustomSetting : false,
            appId  : '',
            globalTime : {
                range : "12m",
                start_time : new Date().getTime(),
                end_time : new Date().getTime()
            }
        } , config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        const onSelectDate = !config.isCustomSetting ? (start_time,end_time,range)=>{
            const formData = this.state.formData;
            formData.start_time = start_time;
            formData.end_time = end_time;
            formData.range = range;
            this.setState({formData});
        } : (start_time,end_time,range) => {
            if (config.appId === "applyUser") {
                this.onTimeChange(start_time, end_time, range);
            } else {
                const appPropSettingsMap = this.state.appPropSettingsMap;
                const formData = appPropSettingsMap[config.appId].time;
                const globalTime = config.globalTime;
                formData.start_time = start_time;
                formData.end_time = end_time;
                formData.range = range;
                if(globalTime.start_time != start_time ||
                   globalTime.end_time != end_time ||
                   globalTime.range != range) {
                    formData.setted = true;
                }
                this.setState({appPropSettingsMap});
            }
        };

        let currentRange, currentStartTime, currentEndTime;
        if(config.isCustomSetting) {
            if (config.appId === "applyUser") {
                currentRange = this.state.appFormData.range;
                currentStartTime = this.state.appFormData.begin_date;
                currentEndTime = this.state.appFormData.end_date;
            }
            else {
                const appPropSettingsMap = this.state.appPropSettingsMap;
                const timeInfo = appPropSettingsMap[config.appId].time;
                currentRange = timeInfo.range;
                currentStartTime = timeInfo.start_time;
                currentEndTime = timeInfo.end_time;
            }
        } else {
            const formData = this.state.formData;
            currentRange = formData.range;
            currentStartTime = formData.start_time;
            currentEndTime = formData.end_time;
        }
        return (
            <div className="user-time-rangefield-block">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <DateSelector
                        endTimeEndOfDay={false}
                        getEndTimeTip={function(date){return Intl.get("user.open.cycle.date.tip","将在{date}的0点过期",{'date':date});}}
                        onSelect={onSelectDate}
                        range={currentRange}
                        start_time={currentStartTime}
                        end_time={currentEndTime}
                        expiredRecalculate={config.expiredRecalculate}
                    >
                        <DateSelector.Option value="1w"><ReactIntl.FormattedMessage id="user.time.one.week" defaultMessage="1周" /></DateSelector.Option>
                        <DateSelector.Option value="0.5m"><ReactIntl.FormattedMessage id="user.time.half.month" defaultMessage="半个月" /></DateSelector.Option>
                        <DateSelector.Option value="1m"><ReactIntl.FormattedMessage id="user.time.one.month" defaultMessage="1个月" /></DateSelector.Option>
                        <DateSelector.Option value="6m"><ReactIntl.FormattedMessage id="user.time.six.month" defaultMessage="6个月" /></DateSelector.Option>
                        <DateSelector.Option value="12m"><ReactIntl.FormattedMessage id="user.time.twelve.month" defaultMessage="12个月" /></DateSelector.Option>
                        <DateSelector.Option value="forever"><ReactIntl.FormattedMessage id="common.time.forever" defaultMessage="永久" /></DateSelector.Option>
                        <DateSelector.Option value="custom"><ReactIntl.FormattedMessage id="user.time.custom" defaultMessage="自定义" /></DateSelector.Option>
                    </DateSelector>
                </FormItem>
            </div>
        );
    }
};

export default UserTimeRangeField;
