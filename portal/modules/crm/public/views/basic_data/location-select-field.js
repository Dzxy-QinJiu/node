import {Icon, Alert} from 'antd';
let CrmBasicAjax = require("../../ajax/index");
import Trace from "LIB_DIR/trace";
import { AntcAreaSelection } from "antc";

var LocationSelectField = React.createClass({
    getDefaultProps: function () {
        return {
            list: [],
            onChange: function () {
            },
            onModifySuccess: function () {
            }
        };
    },
    getInitialState: function () {
        return {
            loading: false,//正在保存
            list: [],//下拉列表中的数据
            displayType: "text",
            isLoadingList: true,//正在获取下拉列表中的数据
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            disabled: this.props.disabled,
            province: this.props.province,
            city: this.props.city,
            county: this.props.county,
            submitErrorMsg: ''
        };
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时,重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.province = nextProps.province;
            stateData.city = nextProps.city;
            stateData.county = nextProps.county;
            stateData.disabled = nextProps.disabled;
            this.setState(stateData);
        }
    },
    changeDisplayType: function (type) {
        if (type === 'text') {
            Trace.traceEvent(this.getDOMNode(),"取消对地域的修改");
            this.setState({
                province: this.props.province,
                city: this.props.city,
                county: this.props.county,
                displayType: type,
                submitErrorMsg: ''
            });
        } else {
            Trace.traceEvent(this.getDOMNode(),"点击设置地域按钮");
            this.setState({
                loading: false,
                displayType: type,
                submitErrorMsg: ''
            });
        }
    },
    handleSubmit: function () {
        if (this.state.loading) return;
        let submitData = {
            id: this.state.customerId,
            type: "address",
            province: this.state.province,
            city: this.state.city,
            county: this.state.county
        };
        Trace.traceEvent(this.getDOMNode(),"保存对地域的修改");
        if (this.props.isMerge) {
            this.props.updateMergeCustomer(submitData);
            this.setState({
                loading: false,
                displayType: 'text',
                submitErrorMsg: ''
            });
        } else {
            this.setState({loading: true});
            CrmBasicAjax.updateCustomer(submitData).then(result=> {
                if (result) {
                    this.setState({
                        loading: false,
                        displayType: 'text',
                        submitErrorMsg: ''
                    });
                    //更新列表中的客户地域
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg=> {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.174", "修改客户地域失败")
                });
            });
        }
    },
    //更新地址
    updateLocation: function (address) {
        var location = address.split('/');
        this.state.province = location[0] || "";
        this.state.city = location[1] || "";
        this.state.county = location[2] || "";
        Trace.traceEvent(this.getDOMNode(),"修改地域");
    },
    render: function () {
        var location = [];
        if (this.state.province) {
            location.push(this.state.province);
        }
        if (this.state.city) {
            location.push(this.state.city);
        }
        if (this.state.county) {
            location.push(this.state.county);
        }
        if (this.state.displayType === 'text') {
            return (
                <div className="basic-location-field">
                    <span>{location.join('/')}</span>
                    <i className="iconfont icon-update" title={Intl.get("crm.175", "设置地域")}
                       onClick={this.changeDisplayType.bind(this , "edit")}/>
                </div>
            );
        }
        let buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get("common.save", "保存")} className="inline-block iconfont icon-choose"
                   onClick={this.handleSubmit}/>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={this.changeDisplayType.bind(this,"text")}/>
            </div>
        );
        return (<div className="location-edit-field">
            <AntcAreaSelection labelCol="0" wrapperCol="24" width="260"
                           placeholder={Intl.get("crm.address.placeholder", "请选择地域")}
                           prov={this.state.province}
                           city={this.state.city}
                           county={this.state.county} updateLocation={this.updateLocation}/>
            <div className="buttons">
                {buttonBlock}
            </div>
            {this.state.submitErrorMsg ? (
                <div className="has-error">
                    <span className="ant-form-explain">{this.state.submitErrorMsg}</span>
                </div>) : null
            }
        </div>);
    }
});

module.exports = LocationSelectField;