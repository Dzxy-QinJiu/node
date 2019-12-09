/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2019/11/14.
 */
//组织到期提示组件
import './style.less';
import {Alert} from 'antd';
import { getOrganizationInfo } from 'PUB_DIR/sources/utils/common-data-util';
import { checkVersionAndType } from 'PUB_DIR/sources/utils/common-method-util';
import { paymentEmitter } from 'PUB_DIR/sources/utils/emitters';
import DifferentVersion from 'MOD_DIR/different_version/public';
import history from 'PUB_DIR/sources/history';


const REMIND_DAYS = {
    TRIAL: 3,
    FORMAL: 7
};
class OrganizationExipreTip extends React.PureComponent {

    state = {
        visible: false,
        endTime: 0,
        showDifferentVersion: false,//是否显示版本信息面板
    };

    componentDidMount() {
        paymentEmitter.on(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.hideExpiredTip);
        this.getOrganization();
    }

    componentWillUnmount() {
        paymentEmitter.removeListener(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.hideExpiredTip);
    }

    getOrganization() {
        getOrganizationInfo().then((result) => {
            let endTime = _.get(result, 'end_time');
            if(endTime) {
                //试用期提前三天提醒，正式的提前一周
                let versionAndType = checkVersionAndType();
                // 0: 今天到期， 负数表示已过期xx天
                let expire_after_days = _.get(result, 'expire_after_days');
                //今天的起始、结束时间(23:59:59+1)
                /*let todayEndTime = moment().endOf('day').valueOf() + 1;
                let time = moment(endTime).endOf('day').valueOf() + 1;
                let diffTime = moment(time).diff(moment(todayEndTime), 'days');*/
                if((versionAndType.trial && expire_after_days <= REMIND_DAYS.TRIAL)
                    || (versionAndType.formal && expire_after_days <= REMIND_DAYS.FORMAL)) {
                    this.setState({
                        endTime: expire_after_days,
                        visible: true
                    });
                }
            }
        });
    }

    hideExpiredTip = () => {
        this.setState({visible: false});
    };

    handleClickRenewal = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL);
    };
    //显示/隐藏版本信息面板
    triggerShowVersionInfo = () => {
        this.setState({showDifferentVersion: !this.state.showDifferentVersion});
    };
    handleContinueFn = (orderInfo) => {
        history.push('/leads');
    };
    renderMsgBlock = () => {
        //试用期提前三天提醒，正式的提前一周
        let versionAndType = checkVersionAndType();
        let tip = '';
        if(versionAndType.trial) {
            if(versionAndType.personal || versionAndType.company) {
                tip = <ReactIntl.FormattedMessage
                    id="organization.personal.trial.expired.tip"
                    defaultMessage={'您的试用期剩余{time}天，是否{upgrade}？'}
                    values={{
                        'time': this.state.endTime,
                        upgrade: <a data-tracename="点击组织到期，升级为正式版按钮" onClick={this.triggerShowVersionInfo}>{Intl.get('user.info.version.upgrade', '升级为正式版')}</a>
                    }}
                />;
            }else {
                tip = Intl.get('organization.company.trial.expired.tip', '您的试用期剩余{time}天，请联系我们的销售人员: {contact}',{
                    time: this.state.endTime,
                    contact: '400-6978-520'
                });
            }
        }else if(versionAndType.formal) {
            if(versionAndType.personal) {
                tip = <ReactIntl.FormattedMessage
                    id="organization.formal.expired.tip"
                    defaultMessage={'您的账号即将到期，是否{renewal}？'}
                    values={{
                        renewal: <a data-tracename="点击组织到期，升级续费按钮" onClick={this.triggerShowVersionInfo}>{Intl.get('payment.renewal', '续费')}</a>
                    }}
                />;
            }else {
                tip = Intl.get('organization.company.formal.expired.tip', '您的账号即将到期，请联系我们的销售人员: {contact}',{contact: '400-6978-520'});
            }
        }
        return tip;
    };

    render() {
        if(this.state.visible) {
            return (
                <div>
                    <Alert
                        message={this.renderMsgBlock()}
                        banner
                        closable
                        className="organization-expired-tip"
                    />
                    <DifferentVersion
                        showFlag={this.state.showDifferentVersion}
                        closeVersion={this.triggerShowVersionInfo}
                        continueFn={this.handleContinueFn}

                    />
                </div>
            );
        }else {return null;}
    }
}

module.exports = OrganizationExipreTip;
