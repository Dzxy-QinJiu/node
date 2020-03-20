import {Form, Select} from 'antd';
const Option = Select.Option;
import DateSelector from '../../date-selector';
const FormItem = Form.Item;
import { isModifyAppConfig } from 'PUB_DIR/sources/utils/common-method-util';

const UserTimeRangeField = {
    renderUserTimeRangeBlock(config, app) {//客户详情中，新版的用户申请，需要用到app，来查找要修改的应用配置表单

        config = $.extend({
            isCustomSetting: false,
            appId: '',
            globalTime: {
                range: '12m',
                start_time: new Date().getTime(),
                end_time: new Date().getTime()
            }
        } , config);

        if(config.isCustomSetting && !config.appId) {
            return null;
        }

        const onSelectDate = !config.isCustomSetting ? (start_time,end_time,range) => {
            //统一配置调用
            const formData = this.state.formData;
            formData.start_time = start_time;
            formData.end_time = end_time;
            formData.range = range;
            //此处只修改formData，在点击下一步时将formData数据同步到appSettingMap中
            this.setState({formData});
        } : (start_time,end_time,range) => {
            //分别配置调用
            if (config.appId === 'applyUser') {
                this.onTimeChange(start_time, end_time, range, app);
            } else {
                const appPropSettingsMap = this.state.appPropSettingsMap;
                const formData = _.get(appPropSettingsMap[config.appId], 'time') || {};
                isModifyAppConfig(_.clone(formData), 'time', {start_time, end_time, range});
                const globalTime = config.globalTime;
                formData.start_time = start_time;
                formData.end_time = end_time;
                formData.range = range;
                if(globalTime.start_time !== start_time ||
                   globalTime.end_time !== end_time ||
                   globalTime.range !== range) {
                    formData.setted = true;
                }
                this.setState({appPropSettingsMap});
            }
        };

        let currentRange, currentStartTime, currentEndTime;
        if(config.isCustomSetting) {
            if (config.appId === 'applyUser') {
                let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
                currentRange = appFormData.range;
                currentStartTime = appFormData.begin_date;
                currentEndTime = appFormData.end_date;
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
                    {/* <Select>
                        <Option value="1w">{Intl.get('user.time.one.week','1周')}</Option>
                        <Option value="0.5m">{Intl.get('user.time.half.month','半个月')}</Option>
                        <Option value="1m">{Intl.get('user.time.one.month','1个月')}</Option>
                        <Option value="6m">{Intl.get('user.time.six.month','6个月')}</Option>
                        <Option value="12m">{Intl.get('user.time.twelve.month','12个月')}</Option>
                        <Option value="forever">{Intl.get('common.time.forever','永久')}</Option>
                        <Option value="custom">{Intl.get('user.time.custom','自定义')}</Option>
                    </Select> */}
                    <DateSelector
                        disableDateBeforeRange={true}
                        disableDateBeforeToday={true}
                        endTimeEndOfDay={false}
                        getEndTimeTip={function(date){return Intl.get('user.open.cycle.date.tip','将在{date}的23:59:59过期',{'date': date});}}
                        onSelect={onSelectDate}
                        range={currentRange}
                        start_time={currentStartTime}
                        end_time={currentEndTime}
                        expiredRecalculate={config.expiredRecalculate}
                    >
                        <DateSelector.Option value="1w">{Intl.get('user.time.one.week','1周')}</DateSelector.Option>
                        <DateSelector.Option value="0.5m">{Intl.get('user.time.half.month','半个月')}</DateSelector.Option>
                        <DateSelector.Option value="1m">{Intl.get('user.time.one.month','1个月')}</DateSelector.Option>
                        <DateSelector.Option value="6m">{Intl.get('user.time.six.month','6个月')}</DateSelector.Option>
                        <DateSelector.Option value="12m">{Intl.get('user.time.twelve.month','12个月')}</DateSelector.Option>
                        <DateSelector.Option value="forever">{Intl.get('common.time.forever','永久')}</DateSelector.Option>
                        <DateSelector.Option value="custom">{Intl.get('user.time.custom','自定义')}</DateSelector.Option>
                    </DateSelector>
                </FormItem>
            </div>
        );
    }
};

export default UserTimeRangeField;
