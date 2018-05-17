/**
 * 电话状态及客户详情展示面板
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/5/17.
 */
require("./index.less");
import {RightPanel, RightPanelClose, RightPanelReturn} from "CMP_DIR/rightPanel";
import CustomerDetail from "MOD_DIR/crm/public/views/customer-detail";
import ApplyUserForm from "MOD_DIR/crm/public/views/apply-user-form";
import classNames from "classnames";
import Trace from "LIB_DIR/trace";
const PHONE_PANEAL_TYPE = {
    CUSTOMER_DETAIL: "customer_detail",//客户详情
    CALL_PUSH: "call_push",//拨打电话成功后，后端推送过来的通话状态等数据
    CURTAO_CALL: "curtao_call"//客套内打电话时，通过emitter穿过来的数据
};
class PhonePanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applyUserShowFlag: false,//是否展示申请用户的面板
            applyType: 2,//2：申请新增试用用户，3，申请新增正式用户
            apps: [],
            curOrder: {},
        };
    }

    //展示申请用户界面
    showApplyUserForm(type, curOrder, apps) {
        this.setState({
            applyType: type,
            apps: apps,
            curOrder: curOrder
        }, () => {
            this.setState({applyUserShowFlag: true});
        });
    }

    returnInfoPanel() {
        //申请后返回
        this.setState({
            applyUserShowFlag: false
        });
    }

    hideRightPanel(e) {
        Trace.traceEvent(e, "关闭客户详情");
        this.returnInfoPanel();
        let paramObj = this.props.paramObj;
        if (_.isFunction(paramObj.params.hideRightPanel)) {
            paramObj.params.hideRightPanel();
        }
        if (_.isFunction(this.props.closePhonePanel)) {
            this.props.closePhonePanel();
        }
    }

    render() {
        let paramObj = this.props.paramObj;
        let className = classNames("right-panel-content", {"crm-right-panel-content-slide": this.state.applyUserShowFlag});
        return (
            <RightPanel showFlag={this.props.showFlag}
                        className={this.state.applyUserShowFlag ? "apply-user-form-panel  white-space-nowrap table-btn-fix" : "crm-right-panel  white-space-nowrap table-btn-fix"}
                        data-tracename="客户详情">
                <span className="iconfont icon-close" onClick={(e) => {
                    this.hideRightPanel(e);
                }}/>
                <div className={className}>
                    <CustomerDetail  {...paramObj.params}
                                     hideRightPanel={this.hideRightPanel.bind(this)}
                                     showApplyUserForm={this.showApplyUserForm.bind(this)}
                    />
                </div>

                {this.state.curOrder.id ? (
                    <div className={className}>
                        <RightPanelReturn onClick={this.returnInfoPanel.bind(this)}/>
                        <RightPanelClose onClick={this.hideRightPanel.bind(this)}/>
                        <div className="crm-right-panel-content">
                            <ApplyUserForm
                                applyType={this.state.applyType}
                                apps={this.state.apps}
                                order={this.state.curOrder}
                                customerName={paramObj.params.curCustomer.name}
                                cancelApply={this.returnInfoPanel.bind(this)}
                            />
                        </div>
                    </div>
                ) : null}
            </RightPanel>
        );
    }
}
PhonePanel.defaultProps = {
    showFlag: false,
    phoneMsgObj: {}
};
export default  PhonePanel;