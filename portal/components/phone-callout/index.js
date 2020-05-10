/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/2/28.
 */
import {Popover, message} from 'antd';
import {hasCalloutPrivilege, checkVersionAndType, getContactSalesPopoverTip, isExpired} from 'PUB_DIR/sources/utils/common-method-util';
import {showDisabledCallTip, handleCallOutResult, checkPhoneStatus}from 'PUB_DIR/sources/utils/common-data-util';
import {isRongLianPhoneSystem, handleBeforeCallOutCheck} from 'PUB_DIR/sources/utils/phone-util';
var phoneMsgEmitter = require('PUB_DIR/sources/utils/emitters').phoneMsgEmitter;
import { paymentEmitter } from 'OPLATE_EMITTER';
var classNames = require('classnames');
require('./index.less');
import Trace from 'LIB_DIR/trace';
import { COMPANY_VERSION_KIND, COMPANY_PHONE } from 'PUB_DIR/sources/utils/consts';
import {isPhone} from 'PUB_DIR/sources/utils/validate-util';

class PhoneCallout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            ableClickPhoneIcon: true,//是否可以点击电话的icon
            ableClickCheckPhoneIcon: true,//是否可以点击检测按钮
        };
    }
    componentDidMount() {
    }

    //检测空号
    handleCheckPhone = () => {
        if(!this.state.ableClickCheckPhoneIcon) {return false;}
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-search'), '单个手机号检测空号');
        this.setState({ableClickCheckPhoneIcon: false});
        checkPhoneStatus([{
            clue_id: this.props.id,
            mobile_phone: this.props.phoneNumber
        }]).then((result) => {
            this.setState({ableClickCheckPhoneIcon: true});
            _.isFunction(this.props.onCheckPhoneSuccess) && this.props.onCheckPhoneSuccess(result);
        }, () => {
            this.setState({ableClickCheckPhoneIcon: true});
            message.error(Intl.get('lead.check.phone.fiald', '检测空号失败!!!'));
        });
    };

    // 自动拨号
    handleClickCallOut = (phoneNumber, contactName) => {
        handleBeforeCallOutCheck( () => {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-active-call-records-ico'), '拨打电话');
            handleCallOutResult({
                contactName: contactName,//联系人姓名
                phoneNumber: phoneNumber,//拨打的电话
                id: this.props.id,
                type: this.props.type
            },() => {
                this.setState({
                    ableClickPhoneIcon: true
                });
                //如果是在线索里拨打的电话，要展示线索的详情
                _.isFunction(this.props.showClueDetailPanel) && this.props.showClueDetailPanel();
                //拨打电话成功后的回调处理
                _.isFunction(this.props.onCallSuccess) && this.props.onCallSuccess();
            });
        } );
    };
    handleVisibleChange = (phoneNumber, contactName,visible) => {
        //如果是个人试用版，需要提示升级为基础版以上才能拨打号码
        let versionAndType = checkVersionAndType();
        if(versionAndType.isPersonalTrial) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)), '个人版点击电话按钮');
            paymentEmitter.emit(paymentEmitter.OPEN_APPLY_TRY_PANEL, {
                versionKind: COMPANY_VERSION_KIND,
                title: Intl.get('personal.apply.trial.enterprise.dail', '申请企业试用体验拨打电话')
            });
            return;
        }
        if (visible && hasCalloutPrivilege() && !versionAndType.personal && !isExpired()){// 显示，并且能拨打电话，以及不是个人版、未过期时
            if (!this.state.ableClickPhoneIcon){
                return;
            }
            this.setState({
                visible: false,
                ableClickPhoneIcon: false
            });
            this.handleClickCallOut(phoneNumber, contactName);
        }else{
            this.setState({
                visible: visible
            });
        }

    };
    renderPhoneIcon = () => {
        //如果是在线索池中，电话按钮隐藏
        //容联电话系统，如果正在打电话，不展示拨打电话的按钮
        if ((isRongLianPhoneSystem() && Oplate.isCalling) || this.props.hidePhoneIcon) {
            return null;
        }
        var contentTip = showDisabledCallTip();
        //如果是个人正式版，需要提示升级为企业版才能拨打号码
        let versionAndType = checkVersionAndType();
        if(versionAndType.isPersonalFormal) {//个人正式
            contentTip = Intl.get('payment.please.contact.our.sale.upgrade','请联系我们的销售人员进行升级，联系方式：{contact}',{contact: COMPANY_PHONE});
        } else if(isExpired()) {//企业试用\正式过期, 联系销售升级\续费的提示
            contentTip = getContactSalesPopoverTip();
        }
        var titleTip = Intl.get('crm.click.call.phone', '点击拨打电话');
        var contactName = this.props.contactName;
        var visible = this.state.visible;
        var iconCls = classNames('iconfont icon-active-call-records-ico handle-btn-item',{
            'default-show': this.props.showPhoneIcon || this.props.hidePhoneNumber
        });
        return (
            <Popover placement="right" content={contentTip} trigger="click" visible={visible}
                onVisibleChange={this.handleVisibleChange.bind(this, this.props.phoneNumber, contactName)}>
                <i className={iconCls}
                    title={titleTip}></i>
            </Popover>
        );
    };
    renderCheckPhone = () => {
        //正式版，拨打电话按钮展示时，且该电话是手机号、沒有检测过状态时，才能展示检测按钮
        if(checkVersionAndType().formal && this.props.showCheckPhone && !this.props.hidePhoneIcon && isPhone(this.props.phoneNumber) && _.indexOf(this.props.showPhoneNum, '(') < 0) {
            var iconCls = classNames('iconfont icon-search handle-btn-item',{
                'default-show': this.props.showPhoneIcon
            });
            return <i className={iconCls} title={Intl.get('lead.check.phone.status', '检测空号')} onClick={this.handleCheckPhone}/>;
        }
        return null;
    };
    render() {
        return(
            <span className="phone-callout-container" >
                {this.props.hidePhoneNumber ? null : (<span>{this.props.showPhoneNum || this.props.phoneNumber}{this.renderCheckPhone()}</span>)}
                {this.renderPhoneIcon()}
            </span>
        );
    }
}
PhoneCallout.defaultProps = {
    id: '',//线索的id或客户的id
    type: '',//'customer'或‘lead'
    showPhoneNum: '',//（非必传）当展示和拨打时用的不是同一个时，展示的用此属性值展示（例如：展示：0531-88457451，拨打：053188457451）
    phoneNumber: '',//（必传）拨打和展示的相同时，用来拨号和展示，不同时，用来拨号
    contactName: '',//（非必传）拨打电话时，用来在弹屏上展示的联系人姓名
    showPhoneIcon: false,//是否一直展示电话图标
    hidePhoneNumber: false,//是否不展示电话号码，不展示时，电话图标会一直显示
    hidePhoneIcon: false,//是否隐藏电话图标
    showClueDetailPanel: function(){},
    onCallSuccess: function(){},//打电话成功的处理（首页）
    showCheckPhone: false,//是否展示检测空号图标
    onCheckPhoneSuccess: function() {},
};
PhoneCallout.propTypes = {
    id: PropTypes.string,
    type: PropTypes.string,
    showPhoneNum: PropTypes.string,
    phoneNumber: PropTypes.string,
    contactName: PropTypes.string,
    showPhoneIcon: PropTypes.bool,
    hidePhoneNumber: PropTypes.bool,
    showClueDetailPanel: PropTypes.func,
    onCallSuccess: PropTypes.func,
    hidePhoneIcon: PropTypes.bool,
    showCheckPhone: PropTypes.bool,
    onCheckPhoneSuccess: PropTypes.func,
};
export default PhoneCallout;