/**
 * Created by wangliping on 2015/12/29.
 */
var React = require('react');
var language = require('../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./modalDialog-es_VE.less');
}else if (language.lan() === 'zh'){
    require('./modalDialog-zh_CN.less');
}
import {Icon} from 'antd';
//require("./modalDialog.less");
var Modal = require('react-bootstrap').Modal;
var Button = require('react-bootstrap').Button;
var classNames = require('classnames');

class ModalDialog extends React.Component {
    delete = (e) => {
        this.props.delete(e);
        if (!this.props.delayClose){
            this.close();
        }

    };

    close = () => {
        _.isFunction(this.props.hideModalDialog) && this.props.hideModalDialog();
    };

    render() {
        var btnClass = classNames('', this.props.className, {
            'transparentBgFlag modal': this.props.transparentBgFlag,
            'modal': !this.props.transparentBgFlag
        });
        var confirmOkBtn = classNames('btn-ok',this.props.confirmCls);
        var closedModalTip = this.props.closedModalTip ? this.props.closedModalTip : '关闭模态框';
        return (
            <Modal
                show={this.props.modalShow}
                onHide={this.close}
                container={this.props.container}
                bsClass={btnClass}
            >
                <Modal.Header closeButton className={this.props.confirmCls}>
                    <Modal.Title>{this.props.modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{this.props.modalContent}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className={confirmOkBtn} onClick={this.delete} disabled={this.props.showResultLoading} >
                        {this.props.okText || Intl.get('common.sure')}
                        {this.props.showResultLoading ? <Icon type="loading"/> : null}
                    </Button>
                    <Button className="btn-cancel" onClick={this.close} data-tracename={closedModalTip}>
                        {this.props.cancelText || Intl.get('common.cancel')}
                    </Button>

                </Modal.Footer>
            </Modal>
        );
    }
}
ModalDialog.defaultProps = {
    delete: function() {

    },
    hideModalDialog: function() {

    },
    className: '',
    transparentBgFlag: false,
    closedModalTip: '',
    modalShow: false,
    container: null,
    modalContent: '',
    showResultLoading: false,
    okText: '',
    cancelText: '',
    delayClose: false,
    modalTitle: '',
    confirmCls: ''

};
ModalDialog.propTypes = {
    delete: PropTypes.func,
    hideModalDialog: PropTypes.func,
    className: PropTypes.string,
    transparentBgFlag: PropTypes.bool,
    closedModalTip: PropTypes.string,
    modalShow: PropTypes.bool,
    container: PropTypes.object,
    modalContent: PropTypes.string,
    showResultLoading: PropTypes.bool,
    okText: PropTypes.string,
    cancelText: PropTypes.string,
    delayClose: PropTypes.bool,
    modalTitle: PropTypes.string,
    confirmCls: PropTypes.string,
};

module.exports = ModalDialog;

