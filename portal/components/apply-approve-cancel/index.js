/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/11/28.
 */
import {Modal} from 'react-bootstrap';
import {Icon} from 'antd';
var BootstrapButton = require('react-bootstrap').Button;
class ApplyApproveCancel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }
    render(){
        return(
            <Modal
                show={this.props.showBackoutConfirm}
                onHide={this.props.hideBackoutModal}
                container={this.props.container}
                aria-labelledby="contained-modal-title"
                className="backout-apply"
            >
                <Modal.Header closeButton>
                    <Modal.Title />
                </Modal.Header>
                <Modal.Body>
                    <p>
                        {this.props.modalContent}
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <BootstrapButton className="btn-ok"
                        onClick={this.props.clickOkBtn} disabled={this.props.showResultLoading}>
                        {Intl.get('user.apply.detail.modal.ok', '撤销')}
                        {this.props.showResultLoading ? <Icon type="loading"/> : null}
                    </BootstrapButton>
                    <BootstrapButton className="btn-cancel" onClick={this.props.hideBackoutModal}>
                        {Intl.get('common.cancel', '取消')}
                    </BootstrapButton>
                </Modal.Footer>
            </Modal>
        );
    }
}
ApplyApproveCancel.defaultProps = {
    showBackoutConfirm: false,
    hideBackoutModal: function(){},
    container: {},
    modalContent: Intl.get('user.apply.detail.modal.content','是否撤销此申请？'),
    showResultLoading: false,
    clickOkBtn: function(){}
};
ApplyApproveCancel.propTypes = {
    showBackoutConfirm: PropTypes.boolean,
    hideBackoutModal: PropTypes.func,
    container: PropTypes.object,
    modalContent: PropTypes.string,
    showResultLoading: PropTypes.boolean,
    clickOkBtn: PropTypes.func
};
export default ApplyApproveCancel;