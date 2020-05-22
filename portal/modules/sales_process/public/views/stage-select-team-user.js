/**
 * Created by hzl on 2019/8/26.
 * 选择适用该客户阶段的适用团队、个人
 */

import {Form, TreeSelect, Button, Icon, message} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const { SHOW_ALL } = TreeSelect;
const FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SalesProcessStore from '../store';
import CustomerStageAjax from '../ajax';
import AlertTimer from 'CMP_DIR/alert-timer';

class StageSelectTeamUserPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            ...SalesProcessStore.getState(),
        };
    }

    componentDidMount() {
        SalesProcessStore.listen(this.onChange);
    }

    componentWillUnmount() {
        SalesProcessStore.unlisten(this.onChange);
    }

    onChange = () => {
        this.setState(SalesProcessStore.getState());
    }

    // 取消事件
    handleCancel(event) {
        event.preventDefault();
        this.props.cancelEditCustomerScope();
        Trace.traceEvent(event, '关闭选择使用该客户阶段的部门、个人面板');
    }

    // 处理选择团队、个人的数据，转为后端需要的数据
    handleProcessSubmitData(selectedData) {
        let salesMemberList = _.cloneDeep(this.state.salesMemberList); // 销售人员
        let salesTeamList = _.cloneDeep(this.state.salesTeamList); // 销售团队
        let scope = selectedData.scope; // 选择的流程的适用范围的数据
        if (scope && scope.length) {
            selectedData.teams = [];
            selectedData.users = [];
            _.each(scope, id => {
                let selectTeam = _.find(salesTeamList, item => item.group_id === id);
                if (selectTeam) {
                    selectedData.teams.push({id: id, name: selectTeam.group_name});
                    // 已经找到的数据，从原数组中删除，remove是为了减少遍历的数据
                    _.remove(salesTeamList, item => item.group_id === id);
                } else {
                    let selectUser = _.find(salesMemberList, item => item.user_id === id);
                    if (selectUser) {
                        selectedData.users.push({id: id, name: selectUser.nick_name});
                        _.remove(salesMemberList, item => item.user_id === id);
                    }
                }
            });
        } else {
            selectedData.teams = [];
            selectedData.users = [];
        }
        delete selectedData.scope;
        return selectedData;
    }

    //保存销售流程
    handleSubmit(event) {
        event.preventDefault();
        Trace.traceEvent(event, '保存选择使用该客户阶段的部门、个人面板');
        this.setState({
            loading: true
        });
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let selectTeamUserData = {
                scope: values.scope,
                id: _.get(this.props.currentCustomerStage, 'id')
            };
            let submitObj = this.handleProcessSubmitData(selectTeamUserData);

            CustomerStageAjax.updateSalesProcess(submitObj).then( (result) => {
                this.props.cancelEditCustomerScope();
                if (result) {
                    this.setState({
                        loading: false,
                    });
                    this.props.changeSaleProcessFieldSuccess(submitObj);
                    message.success(Intl.get('crm.218', '修改成功！'));
                } else {
                    this.setState({
                        loading: false,
                    });
                    message.error(Intl.get('crm.219', '修改失败！'));
                }
            }, (errMsg) => {
                this.props.cancelEditCustomerScope();
                this.setState({
                    loading: false,
                });
                message.error(errMsg || Intl.get('crm.219', '修改失败！'));
            } );
        });
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 24},
        };
        let currentCustomerStage = this.props.currentCustomerStage;
        let teams = _.map(currentCustomerStage.teams, 'id');
        let users = _.map(currentCustomerStage.users, 'id');
        let scope = _.concat(teams, users);

        return (
            <Form layout='horizontal' className="form">
                <FormItem
                    {...formItemLayout}
                >
                    {getFieldDecorator('scope', {
                        initialValue: scope,
                    })(
                        <TreeSelect
                            allowClear={true}
                            treeData={this.props.treeSelectData}
                            treeCheckable={true}
                            treeDefaultExpandAll={true}
                            showCheckedStrategy={SHOW_ALL}
                            searchPlaceholder={Intl.get('contract.choose', '请选择')}
                            dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                        />
                    )}
                </FormItem>
                <div className="buttons-wrap">
                    <Button
                        disabled={this.state.loading}
                        type='primary'
                        onClick={this.handleSubmit.bind(this)}
                    >
                        {Intl.get('common.save', '保存')}
                        {
                            this.state.loading ? <Icon type="loading"/> : null
                        }

                    </Button>
                    <Button onClick={this.handleCancel.bind(this)}>
                        {Intl.get('common.cancel', '取消')}
                    </Button>
                </div>
            </Form>
        );
    }

    // render = () => {
    //     return (
    //         <RightPanelModal
    //             className="select-team-user-panel"
    //             isShowMadal={false}
    //             isShowCloseBtn={true}
    //             onClosePanel={this.handleCancel.bind(this)}
    //             content={this.renderFormContent()}
    //             title={_.get(this.props.currentCustomerStage, 'name')}
    //             dataTracename='选择使用该客户阶段的部门、个人'
    //         />);
    // }
}
function noop() {
}
StageSelectTeamUserPanel.defaultProps = {
    form: {},
    closeSelectTeamUserPanel: noop,
    changeSaleProcessFieldSuccess: noop,
    treeSelectData: [],
    currentCustomerStage: {}
};
StageSelectTeamUserPanel.propTypes = {
    form: PropTypes.object,
    closeSelectTeamUserPanel: PropTypes.func,
    changeSaleProcessFieldSuccess: PropTypes.func,
    treeSelectData: PropTypes.array,
    currentCustomerStage: PropTypes.Object,
    cancelEditCustomerScope: PropTypes.func,
};

export default Form.create()(StageSelectTeamUserPanel);
