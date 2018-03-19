/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/12.
 */
import {Button, Radio,Icon} from "antd";
const RadioGroup = Radio.Group;
var AlertTimer = require("CMP_DIR/alert-timer");
class AddCustomerTrace extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addCustomerLoading:this.props.addCustomerLoading
        }
    };
    onChange = (e) =>{
        this.props.handleChange(e.target.value);
    };

    //提交输入客户跟踪记录成功或者失败后的提示信息
    handleSubmitResult =  ()=> {
    var hide = () => {
        this.props.handleSubmitResult();
    };
    if (this.props.addCustomerErrMsg) {
        return (
            <div className="resultTip">
                <AlertTimer
                    time={2000}
                    message={this.props.addCustomerErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    } else {
        return (
            <div className="resultTip">
                <AlertTimer
                    time={2000}
                    message={this.props.addCustomerSuccMsg}
                    type="info"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    }
};

    render() {
        var hide = () =>{
            this.props.afterHideErrTip()
        };
        return (
            <div className="add-customer-trace-wrap">
                <div className="add-customer-trace-content">
                    <div className="add-customer-body">
                        <div className="add-trace-item">
                            <div className="pull-left">{Intl.get("sales.frontpage.trace.time", "跟进时间")}</div>
                            <div
                                className="right-col pull-left">{moment().format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT)}</div>
                        </div>
                        <div className="add-trace-item">
                            <div className="pull-left">{Intl.get("sales.frontpage.trace.type", "跟进类型")}</div>
                            <div className="right-col pull-left">
                                <RadioGroup onChange={this.onChange} value={this.props.selectedtracetype}>
                                    <Radio value="visit">
                                        <i className="iconfont icon-schedule-visit"></i>
                                        {Intl.get("common.visit", "拜访")}
                                    </Radio>
                                    <Radio value="other">
                                        <i className="iconfont icon-schedule-other"></i>
                                        {Intl.get("common.others", "其他")}
                                    </Radio>
                                </RadioGroup>
                            </div>
                        </div>
                        <div className="add-trace-item">
                            <div className="pull-left">{Intl.get("crm.211", "跟进内容")}</div>
                            <div className="right-col pull-left">
                                  <textarea className="add-content-input" id="add-content-input" type="text"
                                            placeholder={Intl.get("customer.input.customer.trace.content", "请填写跟进内容，保存后不可修改")}
                                            onChange={this.props.handleInputChange} value={this.props.inputContent}/>
                                {this.props.addErrTip ?
                                    <AlertTimer
                                        time={2000}
                                        message={this.props.addErrTip}
                                        type="error"
                                        showIcon
                                        onHide={hide}
                                    />
                                    : null
                                }
                            </div>
                        </div>
                        {this.props.addCustomerErrMsg || this.props.addCustomerSuccMsg ? this.handleSubmitResult() : null}
                    </div>

                    <div className="add-customer-footer">
                        <Button
                            type="ghost"
                            onClick={this.props.closeAddCustomerTrace}
                            className="pull-right btn-primary-cancel cancel-btn"
                        >
                            {Intl.get("common.cancel", "取消")}
                        </Button>
                        <Button
                            type="primary"
                            onClick={this.props.showModalDialog}
                            className="pull-right btn-primary-sure submit-btn"
                        >
                            {Intl.get("common.save", "保存")}
                            {this.props.addCustomerLoading ?
                                <Icon type="loading"/> : null}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}
AddCustomerTrace.defaultProps = {
    closeAddCustomerTrace: function () {

    },
    handleSubmit: function () {

    },
    handleInputChange: function () {

    },
    addCustomerLoading:false
};
export default AddCustomerTrace;
