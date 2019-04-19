var React = require('react');
import IpConfigStore from '../store/ip-config-store';
import IpConfigAction from '../action/ip-config-action';
import IpConfigAjax from '../ajax/ip-config-ajax';
import Spinner from '../../../../components/spinner';
import { Alert,Icon, Checkbox } from 'antd';
import AlertTimer from '../../../../components/alert-timer';
import Trace from 'LIB_DIR/trace';
const CHECKIPMSG = Intl.get('config.manage.input.ip','请输入有效的IP（eg:192.168.1.9）');
import {ipRegex} from 'PUB_DIR/sources/utils/validate-util';

class IpConfig extends React.Component {
    state = {
        ...IpConfigStore.getState(),
        addIpErrMsg: '', // 添加IP失败信息
        deleteErrMsg: '', // 删除IP失败信息
        isLoading: false,
        deleteIpId: 0 // 删除IP配置
    };

    onStoreChange = () => {
        this.setState(IpConfigStore.getState());
    };

    componentDidMount() {
        IpConfigStore.listen(this.onStoreChange);
        IpConfigAction.getIpConfigList({pageSize: 1000});
        IpConfigAction.getFilterIp();
    }

    componentWillUnmount() {
        IpConfigStore.unlisten(this.onStoreChange);
    }

    // 获取配置IP列表
    getIpConfigList = () => {
        IpConfigAction.getIpConfigList({pageSize: 1000});
    };

    // 提交保存按钮
    handleSubmit = (event) => {
        Trace.traceEvent(event,'点击添加IP按钮');
        event.preventDefault();
        var addIpItem = $.trim(this.refs.addIpItem.value);
        if (!addIpItem) {
            this.setState({
                addIpErrMsg: CHECKIPMSG,
            });
            return;
        }
        this.setState({
            isLoading: true
        });
        $('#addIpConfigSaveBtn').attr('disabled', 'disabled');
        IpConfigAjax.addIpConfigItem(addIpItem).then((result) => {
            this.setState({
                isLoading: false
            });
            if (_.isObject(result) && result.id) {
                IpConfigAction.addIp(result);
            } else {
                this.setState({
                    addIpErrMsg: Intl.get('config.manage.add.ip.failed', '添加配置IP失败！')
                });
            }
            this.refs.addIpItem.value = '';
            $('#addIpConfigSaveBtn').removeAttr('disabled');
        }, (errMsg) => {
            this.setState({
                addIpErrMsg: errMsg,
                isLoading: false
            });
        } );
    };

    // 添加配置IP,失败的处理
    handleAddIpConfigFail = () => {
        return (
            <div className="add-config-fail">
                <Alert
                    message={this.state.addIpErrMsg}
                    type="error"
                    showIcon
                />
            </div>

        );
    };

    // 删除配置IP
    handleDeleteIpConfig = (id) => {
        this.setState({
            deleteIpId: id
        });
        IpConfigAjax.deleteIpConfigItem(id).then((result) => {
            if (result) {
                IpConfigAction.deleteIp(id);
            } else {
                this.setState({
                    deleteErrMsg: Intl.get('config.manage.del.ip.failed', '删除配置IP失败！')
                });
            }
        },(errMsg) => {
            this.setState({
                deleteErrMsg: errMsg,
                deleteIpId: 0
            });
        });
    };

    // 删除配置IP,失败的处理
    handleDeleteIpConfigFail = (item) => {
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
    };

    // 遍历获取配置IP列表
    renderIpList = () => {
        if(this.state.IpConfigloading && this.refs.addIpItem.value === '' && this.state.deleteIpId === 0) {
            return <Spinner />;
        }
        if(this.state.getIpConfigErrMsg) {
            return <div className="alert-wrap">
                <Alert
                    message={this.state.getIpConfigErrMsg}
                    type="error"
                    showIcon={true}
                />
            </div>;
        }

        var ipList = this.state.IpConfigList;
        if(_.isArray(ipList) && !ipList.length) {
            return <div className="no-ip-alert-wrap">
                <Alert
                    message={Intl.get('config.manage.no.ip', '暂无IP配置，请添加！')}
                    type="info"
                    showIcon={true}
                />
            </div>;
        }
        return(
            <div>
                <ul className="mb-taglist">
                    {ipList.map((item, index) => {
                        return (
                            <li className="mb-tag" ref={index} key={index}>
                                <div className="mb-tag-content">
                                    <span className="mb-tag-text">{item.ip}</span>&nbsp;&nbsp;
                                    <span className="glyphicon glyphicon-remove mb-tag-remove"
                                        onClick={this.handleDeleteIpConfig.bind(this,item.id)}
                                        data-tracename="移除某个IP"
                                    >
                                    </span>
                                    { this.state.deleteIpId === item.id ? (
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
    };

    checkIpFormat = () => {
        var inputValue = this.refs.addIpItem.value;
        if(!ipRegex.test(inputValue)){
            this.setState({
                addIpErrMsg: CHECKIPMSG
            });
            $('#addIpConfigSaveBtn').attr('disabled', 'disabled');
        } else {
            this.setState({
                addIpErrMsg: ''
            });
            $('#addIpConfigSaveBtn').removeAttr('disabled');
        }
    };

    blurEvent = () => {
        if(this.refs.addIpItem.value === ''){
            this.setState({
                addIpErrMsg: ''
            });
            $('#addIpConfigSaveBtn').removeAttr('disabled');
        }
    };

    // 添加配置IP
    renderIpForm = () => {
        return(
            <form onSubmit={this.handleSubmit}>
                <input
                    className="mb-input"
                    ref="addIpItem"
                    onKeyUp={this.checkIpFormat}
                    onBlur={this.blurEvent}
                />
                <button className="btn mb-add-button" type="submit" id="addIpConfigSaveBtn">
                    <ReactIntl.FormattedMessage id="common.add" defaultMessage="添加"/>
                    {this.state.isLoading ? <Icon type="loading" style={{marginLeft: 12}}/> : null}
                </button>
                {this.state.addIpErrMsg !== '' ? this.handleAddIpConfigFail() : null}
            </form>
        );
    };

    reloadGetIpConfigList = () => {
        this.setState({
            deleteIpId: 0
        });
        this.getIpConfigList();
    };

    // 选择是否过滤内网ip
    selectIsFilterIntranet = (e) => {
        var status = e.target.checked;
        this.setState({
            checked: e.target.checked
        },() => {
            IpConfigAction.filterIp(status);
        } );
    };

    render() {
        return (
            <div className="box" data-tracename="IP配置">
                <div className="box-title">
                    <ReactIntl.FormattedMessage id="config.manage.ip.config" defaultMessage="IP配置"/>
                    &nbsp;&nbsp;
                    <span onClick={this.reloadGetIpConfigList} className="reload-ip-config" style={{marginRight: '30px' }} 	data-tracename="点击获取IP刷新按钮"
                    >
                        <Icon
                            type="reload"
                            title={Intl.get('config.manage.reload.ip', '重新获取IP')}
                            id="reload-ip-config"
                        />
                    </span>
                    <Checkbox
                        checked={this.state.getFilterIpStatus}
                        onChange={this.selectIsFilterIntranet}
                        data-tracename="选中/取消过滤内网ip"
                    />
                    <span>
                        <ReactIntl.FormattedMessage id="config.filter.inner.ip" defaultMessage="过滤内网ip"/>
                    </span>
                    {this.state.deleteErrMsg !== '' ? this.handleDeleteIpConfigFail() : null}
                </div>
                <div className="box-body">
                    {this.renderIpList()}
                </div>
                <div className="box-footer">
                    {this.renderIpForm()}
                </div>
            </div>
        );
    }
}

export default IpConfig;