/**
 * Created by wangliping on 2015/12/29.
 */
var language = require("../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./modalDialog-es_VE.less");
}else if (language.lan() == "zh"){
    require("./modalDialog-zh_CN.less");
}
//require("./modalDialog.less");
var Modal = require("react-bootstrap").Modal;
var Button = require("react-bootstrap").Button;
var classNames = require("classnames");

var ModalDialog = React.createClass({
    delete: function () {
        this.props.delete();
        this.close();
    },
    close: function () {
        this.props.hideModalDialog();
    },
    render: function () {
        var btnClass = classNames('', this.props.className, {
            'transparentBgFlag modal': this.props.transparentBgFlag,
            'modal': !this.props.transparentBgFlag
        });
        var closedModalTip = this.props.closedModalTip ? this.props.closedModalTip : "关闭模态框";
        return (
            <Modal
                show={this.props.modalShow}
                onHide={this.close}
                container={this.props.container}
                bsClass={btnClass}
            >
                <Modal.Header closeButton>
                    <Modal.Title />
                </Modal.Header>
                <Modal.Body>
                    <p>{this.props.modalContent}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-ok" onClick={this.delete} >
                        {Intl.get("common.sure")}
                    </Button>
                    <Button className="btn-cancel" onClick={this.close} data-tracename={closedModalTip}>
                        {Intl.get("common.cancel")}
                        </Button>
                </Modal.Footer>
            </Modal>
        );
    }
});

module.exports = ModalDialog;
