/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/30.
 */
import {Row, Col, Button, Icon, Popover} from 'antd';
import { getContactSalesPopoverTip, isExpired } from 'PUB_DIR/sources/utils/common-method-util';
require('./index.less');
class ApplyDetailBottom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    renderPassOrAssignedContext = () => {
        var assigenedContext = _.isFunction(this.props.renderAssigenedContext) ? this.props.renderAssigenedContext() : null;
        const passBtn = assigenedContext ? assigenedContext : (
            <span>
                {this.props.isShowTipsClickPass ? (
                    <span className="no-select-terminals-tips">请至少选择一个多终端</span>
                ) : null}
                <Button
                    className="agree-btn btn-primary-sure"
                    disabled={this.props.disabled}
                    onClick={isExpired() ? () => { } : this.props.submitApprovalForm.bind(this, 'pass')}
                >
                    <i className='iconfont icon-agree'></i>{this.props.passText}
                </Button>
            </span>
           );
        const rejectBtn = (
            <Button className="reject-btn btn-primary-sure"
                onClick={isExpired() ? () => { } : this.props.submitApprovalForm.bind(this, 'reject')}>
                <i className='iconfont icon-reject'></i>{this.props.rejectText}
            </Button>);
        const contentTip = getContactSalesPopoverTip();
        return (
            <div className="pull-right">
                {
                    this.props.showApproveBtn || assigenedContext ? (
                        <div className="pass-and-reject-wrap">
                            {isExpired() ? (
                                <Popover content={contentTip} trigger="click" placement="left">
                                    {passBtn}
                                </Popover>) : passBtn}
                            {isExpired() ? (
                                <Popover content={contentTip} trigger="click" placement="left">
                                    {rejectBtn}
                                </Popover>) : rejectBtn}
                        </div>
                    ) : null
                }
            </div>
        );
    };
    renderBottomText = () => {
        var assigenedContext = _.isFunction(this.props.renderAssigenedContext) ? this.props.renderAssigenedContext() : null;
        var showPassOrAssignedContext = this.props.showApproveBtn || assigenedContext;
        let backoutBtn = (
            <Button onClick={isExpired() ? () => { } : this.props.submitApprovalForm.bind(this, 'cancel')}>
                {Intl.get('user.apply.detail.backout', '撤销申请')}
            </Button>);
        // 过期的账号，撤销，提示升级或续费
        if (isExpired()) {
            backoutBtn = (
                <Popover content={getContactSalesPopoverTip()} trigger="click" placement="left">
                    {backoutBtn}
                </Popover>
            );
        }
        return <div className="pull-right">
            {this.props.showCancelBtn ? backoutBtn : null}
            {showPassOrAssignedContext ? this.renderPassOrAssignedContext() : null}
        </div>;
    };

    render() {
        return (
            <div className="approval_block pull-right">
                <Row className="approval_person clearfix">
                    <Col>
                        {_.isFunction(this.props.addApplyNextCandidate) ? this.props.addApplyNextCandidate() : null}
                        {this.props.isConsumed ? null : (
                            this.props.showApproveBtn || this.props.showCancelBtn ?
                                this.renderBottomText()
                                : null
                        )}
                    </Col>
                </Row>
            </div>
        );
    }
}
ApplyDetailBottom.defaultProps = {
    create_time: '',
    applicantText: '',
    isConsumed: false,
    update_time: '',
    approvalText: '',
    showApproveBtn: false,
    showCancelBtn: false,
    submitApprovalForm: function() {

    },
    renderAssigenedContext: function(){

    },
    addApplyNextCandidate: function() {

    },
    passText: Intl.get('user.apply.detail.button.pass', '通过'),
    rejectText: Intl.get('common.apply.reject', '驳回'),
    disabled: false
};
ApplyDetailBottom.propTypes = {
    create_time: PropTypes.string,
    applicantText: PropTypes.string,
    isConsumed: PropTypes.bool,
    update_time: PropTypes.string,
    approvalText: PropTypes.string,
    showApproveBtn: PropTypes.bool,
    submitApprovalForm: PropTypes.func,
    renderAssigenedContext: PropTypes.func,
    addApplyNextCandidate: PropTypes.func,
    showCancelBtn: PropTypes.bool,
    rejectText: PropTypes.string,
    passText: PropTypes.string,
    disabled: PropTypes.bool
};

export default ApplyDetailBottom;
