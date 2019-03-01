/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/29.
 */
import {Button} from 'antd';
import {Modal} from 'react-bootstrap';
var Spinner = require('CMP_DIR/spinner');
require('./index.less');
class ApplyApproveStatus extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render(){
        if (this.props.showLoading) {
            return (
                <Modal
                    container={this.props.container}
                    show={true}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <div className="approval_loading">
                            <Spinner/>
                            <p>
                                {Intl.get('user.apply.detail.submit.sending', '审批中...')}
                            </p>
                        </div>
                    </Modal.Body>
                </Modal>
            );
        }
        if (this.props.approveSuccess) {
            return (
                <div className="approval_result">
                    <div className="approval_result_wrap">
                        <div className="bgimg"></div>
                        <p>
                            {this.props.approveSuccessTip || Intl.get('user.apply.detail.submit.success', '审批成功')}
                        </p>
                        <Button type="ghost" onClick={this.props.viewApprovalResult}>
                            {this.props.showAfterApproveTip || Intl.get('user.apply.detail.show.content', '查看审批结果')}
                        </Button>
                    </div>
                </div>
            );
        }
        if (this.props.approveError) {
            return (
                <div className="approval_result">
                    <div className="approval_result_wrap">
                        <div className="bgimg error"></div>
                        <p>{this.props.applyResultErrorMsg}</p>
                        <Button type="ghost" className="re_send"
                            onClick={this.props.reSendApproval}>
                            {Intl.get('common.retry', '重试')}
                        </Button>
                        <Button type="ghost" className="cancel_send"
                            onClick={this.props.cancelSendApproval}>
                            {Intl.get('common.cancel', '取消')}
                        </Button>
                    </div>
                </div>
            );
        }
        return null;
    }
}
ApplyApproveStatus.defaultProps = {
    showLoading: false,
    approveSuccess: false,
    approveError: false,
    approveSuccessTip: '',
    showAfterApproveTip: '',
    viewApprovalResult: function() {

    },
    reSendApproval: function() {

    },
    cancelSendApproval: function() {

    },
    applyResultErrorMsg: '',
    container: {}
};
ApplyApproveStatus.propTypes = {
    showLoading: PropTypes.bool,
    approveSuccess: PropTypes.bool,
    approveError: PropTypes.bool,
    viewApprovalResult: PropTypes.func,
    reSendApproval: PropTypes.func,
    cancelSendApproval: PropTypes.func,
    applyResultErrorMsg: PropTypes.string,
    container: PropTypes.object,
    approveSuccessTip: PropTypes.string,
    showAfterApproveTip: PropTypes.string,
};

export default ApplyApproveStatus;