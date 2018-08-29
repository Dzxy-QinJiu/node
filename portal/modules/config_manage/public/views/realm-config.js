var React = require('react');
import RealmConfigStore from '../store/realm-config-store';
import RealmConfigAction from '../action/realm-config-action';
import RealmConfigAjax from '../ajax/realm-config-ajax';
import Spinner from '../../../../components/spinner';
import { Alert, Icon, Checkbox, Popconfirm, message } from 'antd';
import { Radio } from 'antd';
import AlertTimer from '../../../../components/alert-timer';
import Trace from 'LIB_DIR/trace';
const RadioGroup = Radio.Group;
const STRATEGYCONFIRMMSG = Intl.get('config.manage.realm.confirm','您确定要修改安全域密码策略吗？');
const realmOptions = [
    {
        label: 'MD5',
        value: '1'
    },
    {
        label: Intl.get('config.manage.realm.modifiedMD5', '删除前4位的MD5'),
        value: '2'
    }
];
const RealmConfig = React.createClass({
    getInitialState() {
        return {
            ...RealmConfigStore.getState(),
            setRealmConfigErrMsg: '', // 修改密码策略失败信息    
            getRealmConfigErrMsg: '',
            isLoading: false,
            strategy: '1',
            showConfirm: false
        };
    },

    onStoreChange() {
        this.setState(RealmConfigStore.getState());
    },

    componentDidMount() {
        RealmConfigStore.listen(this.onStoreChange);
        RealmConfigAction.getRealmStrategy();
    },

    componentWillUnmount() {
        RealmConfigStore.unlisten(this.onStoreChange);
    },
    setRealmConfig() {
        return (
            <div className="add-config-fail">
                <Alert
                    message={this.state.setRealmConfigErrMsg}
                    type="error"
                    showIcon
                />
            </div>
        );
    },
    getRealmConfig() {
        return (
            <div className="add-config-fail">
                <Alert
                    message={this.state.getRealmConfigErrMsg}
                    type="error"
                    showIcon
                />
            </div>
        );
    },
    onChange(e) {
        let value = e.target.value;
        this.setState({
            showConfirm: true,
            strategy: value
        });
    },
    save() {
        RealmConfigAction.updateRealmStrategy({pwd_strategy: this.state.strategy});
    },
    confirm() {
        let newVal = this.state.strategy == '1' ? 'MD5' : '删除前4位的MD5';
        Trace.traceEvent('密码策略','修改密码策略为\'' + newVal + '\'');
        this.save();
        this.setState({
            showConfirm: false
        });
    },
    cancel() {
        this.setState({
            showConfirm: false,
            strategy: this.strategy == '1' ? '2' : '1'
        });
    },
    render() {
        return (
            <div className="box realm-config">
                <div className="box-title">
                    <ReactIntl.FormattedMessage id="config.manage.realm.config" defaultMessage="安全域密码策略" />
                    &nbsp;&nbsp;
                </div>
                <div className="box-body">
                    <Popconfirm placement="leftTop" 
                        visible={this.state.showConfirm} 
                        title={STRATEGYCONFIRMMSG} 
                        onConfirm={this.confirm} 
                        onCancel={this.cancel} 
                        okText={Intl.get('config.manage.realm.oktext','确定')} 
                        cancelText={Intl.get('config.manage.realm.canceltext','取消')}>
                        <RadioGroup
                            size="large"
                            style={{ marginLeft: '65px', marginTop: '40px' }}
                            onChange={this.onChange}
                            value={this.state.strategy}
                            options={realmOptions}
                        >
                        </RadioGroup>
                    </Popconfirm>
                    {this.state.setRealmConfigErrMsg != '' ? this.setRealmConfig() : null}
                    {this.state.getRealmConfigErrMsg != '' ? this.getRealmConfig() : null}
                </div>
            </div>
        );
    }
});

export default RealmConfig;
