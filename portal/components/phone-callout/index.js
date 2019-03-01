/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/2/28.
 */
import {Popover} from 'antd';
import {hasCalloutPrivilege} from 'PUB_DIR/sources/utils/common-method-util';
import {showDisabledCallTip, handleCallOutResult}from 'PUB_DIR/sources/utils/common-data-util';
require('./index.less');
import Trace from 'LIB_DIR/trace';
class PhoneCallout extends React.Component {
    componentDidMount() {

    }
    // 自动拨号
    handleClickCallOut = (phoneNumber, contactName) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-active-call_record-ico'), '拨打电话');
        handleCallOutResult({
            contactName: contactName,//联系人姓名
            phoneNumber: phoneNumber,//拨打的电话
        });
    };
    renderPhoneIcon = () => {
        var contentTip = showDisabledCallTip();
        var titleTip = Intl.get('crm.click.call.phone', '点击拨打电话');
        if (hasCalloutPrivilege()){
            var contactName = this.props.contactName;
            return <i className="iconfont icon-active-call_record-ico able-call"
                title={titleTip}
                onClick={this.handleClickCallOut.bind(this, this.props.phoneNumber, contactName)}></i>;
        }else{
            return <Popover placement="right" content={contentTip} trigger="click">
                <i className="iconfont icon-active-call_record-ico"
                    title={titleTip}></i>
            </Popover>;
        }
    };
    render() {
        return(
            <span className="phone-callout-container" >
                <span>{this.props.showPhoneNum || this.props.phoneNumber}</span>
                {this.renderPhoneIcon()}
            </span>
        );
    }
}
PhoneCallout.defaultProps = {
    showPhoneNum: '',
    phoneNumber: '',
    contactName: ''
};
PhoneCallout.propTypes = {
    showPhoneNum: PropTypes.string,
    phoneNumber: PropTypes.string,
    contactName: PropTypes.string
};
export default PhoneCallout;