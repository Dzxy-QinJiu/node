import TeleConfigStore from '../store/tele-config-store';
import TeleConfigAction from '../action/tele-config-action';
import TeleConfigAjax from '../ajax/tele-config-ajax';
import Spinner from '../../../../components/spinner';
import { Alert, Icon, Checkbox } from 'antd';
import AlertTimer from '../../../../components/alert-timer';
import Trace from "LIB_DIR/trace";
const CHECKTELEMSG = Intl.get('config.manage.input.tele', '请输入有效的客服电话 ( eg:0531-88887755 , +8613688887755)');
const REPEATMSG = Intl.get('config.manage.input.teleRepeat', '该电话号码已录入');
//座机正则  
const isPhone = /^([0-9]{3,4}-)?[0-9]{7,8}$/;
//带区号的手机号正则
const isMob = /^((\+?86)|(\+86))?(13[012356789][0-9]{8}|15[012356789][0-9]{8}|18[02356789][0-9]{8}|147[0-9]{8}|1349[0-9]{7})$/;

const TeleConfig = React.createClass({
    getInitialState() {
        return {
            ...TeleConfigStore.getState(),
            addTeleErrMsg: '',
            deleteErrMsg: '',
            isLoading: false,
            isAdding: false,
            deleteTele: ""
        };
    },

    onStoreChange() {
        this.setState(TeleConfigStore.getState());
    },

    componentDidMount() {
        TeleConfigStore.listen(this.onStoreChange);
        this.getTeleList();
    },

    componentWillUnmount() {
        TeleConfigStore.unlisten(this.onStoreChange);
    },

    // 获取客服电话列表
    getTeleList() {
        TeleConfigAction.getTeleList({ pageSize: 1000 });
    },

    // 提交保存按钮
    handleSubmit(event) {
        var _this = this;
        event.preventDefault();
        if (this.state.isLoading) {
            return;
        }
        var inputValue = this.refs.addTeleItem.value;
        var flag = (isMob.test(inputValue)) || (isPhone.test(inputValue));
        var isRepeat = this.state.telesList.indexOf(inputValue) >= 0;
        this.setState({
            isRepeat
        });
        //格式不正确返回      
        if (!flag) {
            return;
        }
        //重复录入提示并返回
        if (isRepeat) {
            this.setState({
                addTeleRepeat: REPEATMSG
            });
            return;
        }
        this.setState({
            isAdding: true
        });
        var addTeleItem = $.trim(inputValue);
        Trace.traceEvent(event,"添加客服电话");
        TeleConfigAjax.addTele({ phone: addTeleItem }).then((result) => {
            this.state.telesList.unshift(addTeleItem);
            this.setState({
                isAdding: false,
                telesList: this.state.telesList
            });
            this.refs.addTeleItem.value = '';
        }, (errMsg) => {
            this.setState({
                addTeleErrMsg: errMsg,
                isAdding: false
            });
        });
    },

    // 添加客服电话,失败的处理
    handleAddTeleFail() {
        return (
            <div className="add-config-fail">
                <Alert
                    message={this.state.addTeleErrMsg}
                    type="error"
                    showIcon
                />
            </div>

        );
    },

    // 删除客服电话
    handleDeleteTele(phone) {
        this.setState({
            deleteTele: phone
        });
        TeleConfigAjax.delTele({ phone }).then((result) => {
            this.setState({
                deleteTele: "",
                telesList: this.state.telesList.filter(x => x != phone)
            });
        }, (errMsg) => {
            this.setState({
                deleteErrMsg: errMsg,
                deleteTele: ""
            });
        });
    },

    // 删除客服电话，失败的处理
    handleDeleteTeleFail(item) {
        var hide = () => {
            this.setState({
                deleteErrMsg: ''
            });
        };
        return (
            <div className="delete_ip_config_err_tips">
                <AlertTimer
                    time={4000}
                    message={this.state.deleteErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            </div>
        );
    },

    // 遍历电话列表
    renderTelesList() {
        if (this.state.isLoading && this.refs.addTeleItem.value == '' && this.state.deleteTele == 0) {
            return <Spinner />;
        }
        if (this.state.getTelesErrMsg) {
            return <div className="alert-wrap">
                <Alert
                    message={this.state.getTelesErrMsg}
                    type="error"
                    showIcon={true}
                />
            </div>;
        }

        var teleList = this.state.telesList;
        if (!teleList || teleList.length == 0) {
            return <div className="no-ip-alert-wrap">
                <Alert
                    message={Intl.get("config.manage.no.tele", "暂无客服电话，请添加！")}
                    type="info"
                    showIcon={true}
                />
            </div>;
        }
        return (
            <div>
                <ul className="mb-taglist">
                    {teleList.map((item, key) => {
                        return (
                            <li className="mb-tag" ref={key}>
                                <div className="mb-tag-content">
                                    <span className="mb-tag-text">{item}</span>&nbsp;&nbsp;
                                            <span className="glyphicon glyphicon-remove mb-tag-remove"
                                        onClick={this.handleDeleteTele.bind(this, item)}
                                        data-tracename="删除客服电话"
                                    >
                                    </span>
                                    {this.state.deleteTele == item ? (
                                        <span ><Icon type="loading" /></span>
                                    ) : null
                                    }
                                </div>
                            </li>
                        );
                    }
                    )}
                </ul>
            </div>
        );
    },

    checkTeleFormat() {
        var inputValue = this.refs.addTeleItem.value;
        var isValid = true;
        if (inputValue) { 
            isValid = (isMob.test(inputValue)) || (isPhone.test(inputValue));
        }
        var isRepeat = this.state.telesList.indexOf(inputValue) >= 0;
        var errMsg = '';
        if (!isValid) {
            errMsg = CHECKTELEMSG;
        }
        if (isRepeat) {
            errMsg = REPEATMSG;
        }      
        this.setState({
            addTeleErrMsg: errMsg,
            isInvalid: !isValid,
            isRepeat: isRepeat
        });
    },

    blurEvent() {
        if (this.refs.addTeleItem.value == '') {
            this.setState({
                addTeleErrMsg: '',
                addTeleRepeat: ''
            });

        }
    },

    // 添加客服电话
    renderTeleForm() {
        return (
            <form onSubmit={this.handleSubmit}>
                <input
                    className="mb-input"
                    ref="addTeleItem"
                    onKeyUp={this.checkTeleFormat}
                    onBlur={this.blurEvent}
                />
                <button className="btn mb-add-button" type="submit" disabled={this.state.isRepeat || this.state.isAdding || this.state.isInvalid}>
                    <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加" />
                    {this.state.isAdding ? <Icon type="loading" style={{ marginLeft: 12 }} /> : null}
                </button>
                {this.state.addTeleErrMsg != '' ? this.handleAddTeleFail() : null}
            </form>
        );
    },

    reloadGetTeleList() {
        this.setState({
            deleteTele: ""
        });
        this.getTeleList();
    },

    render() {
        return (
            <div className="box">
                <div className="box-title">
                    <ReactIntl.FormattedMessage id="config.manage.tele.config" defaultMessage="客服电话" />
                    &nbsp;&nbsp;
                    <span 
                        onClick={this.reloadGetTeleList} 
                        className="reload-ip-config" 
                        style={{ marginRight: '30px' }} 
                        data-tracename="重新获取客服电话"
                    >
                        <Icon
                            type="reload"
                            title={Intl.get("config.manage.reload.tele", "重新获取客服电话")}
                            id="reload-ip-config"
                        />
                    </span>

                    {this.state.deleteErrMsg != '' ? this.handleDeleteTeleFail() : null}
                </div>
                <div className="box-body">
                    {this.renderTelesList()}
                </div>
                <div className="box-footer">
                    {this.renderTeleForm()}
                </div>
            </div>
        );
    }
});

export default TeleConfig;