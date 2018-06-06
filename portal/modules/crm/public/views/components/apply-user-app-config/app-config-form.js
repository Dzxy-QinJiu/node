/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/31.
 */
import {Form, Radio, InputNumber} from "antd";
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
class AppConfigForm extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let appFormData = this.props.appFormData;
        const timePickerConfig = this.props.timePickerConfig;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <div className="app-config-content">
                {this.props.needApplyNum ? (<div>
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get("user.batch.open.count", "开通个数")}
                    >
                        <InputNumber
                            prefixCls={appFormData.onlyOneUserTip ? "number-error-border ant-input-number" : "ant-input-number"}
                            value={appFormData.number}
                            min={1}
                            max={999}
                            onChange={this.props.onCountChange.bind(this, appFormData)}/>
                    </FormItem>
                    {appFormData.onlyOneUserTip ?
                        <div className="only-one-user-tip">
                            {Intl.get("crm.201", "用户名是邮箱格式时，只能申请1个用户")}</div> : null}
                </div>) : null}
                <FormItem
                    {...formItemLayout}
                    label={Intl.get("user.open.cycle", "开通周期")}
                >
                    {this.props.renderUserTimeRangeBlock(timePickerConfig, appFormData)}
                </FormItem>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get("user.expire.select", "到期可选")}
                >
                    <RadioGroup onChange={this.props.onOverDraftChange.bind(this, appFormData)}
                                value={appFormData.over_draft ? appFormData.over_draft.toString() : "0"}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage
                            id="user.status.stop" defaultMessage="停用"/></Radio>
                        <Radio key="2" value="2"><ReactIntl.FormattedMessage
                            id="user.status.degrade" defaultMessage="降级"/></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage
                            id="user.status.immutability"
                            defaultMessage="不变"/></Radio>
                    </RadioGroup>
                </FormItem>
            </div>
        );
    }
}
AppConfigForm.defaultProps = {};
export default AppConfigForm;