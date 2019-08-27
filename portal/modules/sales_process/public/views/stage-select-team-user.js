/**
 * Created by hzl on 2019/8/26.
 * 选择适用该客户阶段的适用团队、个人
 */

import {Form, TreeSelect, Button, Icon} from 'antd';
const { SHOW_PARENT } = TreeSelect;
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
            saveResult: '', // 保存的结果，默认是false，成功是success，失败是error
            saveMsgTips: '', // 错误提示信息
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
        Trace.traceEvent(event, '关闭选择使用该客户阶段的部门、个人面板');
        this.props.closeSelectTeamUserPanel();
    }

    // 处理选择团队、个人的数据，转为后端需要的数据
    handleProcessSubmitData(selectedData) {
        let salesMemberList = this.state.salesMemberList; // 销售人员
        let salesTeamList = this.state.salesTeamList; // 销售团队
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
                id: _.get(this.props.currentStage, 'id')
            };
            let submitObj = this.handleProcessSubmitData(selectTeamUserData);

            CustomerStageAjax.updateSalesProcess(submitObj).then( (result) => {
                if (result) {
                    this.setState({
                        loading: false,
                        saveResult: 'success',
                        saveMsgTips: Intl.get('common.save.success', '保存成功')
                    });
                    this.props.changeSaleProcessFieldSuccess(submitObj);
                } else {
                    this.setState({
                        loading: false,
                        saveResult: 'error',
                        saveMsgTips: Intl.get('common.save.failed', '保存失败')
                    });
                }
            }, (errMsg) => {
                this.setState({
                    loading: false,
                    saveResult: 'error',
                    saveMsgTips: errMsg || Intl.get('common.save.failed', '保存失败')
                });
            } );
        });
    }

    hideSaveMsgTips = () => {
        this.setState({
            saveMsgTips: ''
        }, () => {
            this.props.closeSelectTeamUserPanel();
        });
    };

    renderFormContent() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        let currentStage = this.props.currentStage;
        let teams = _.map(currentStage.teams, 'id');
        let users = _.map(currentStage.users, 'id');
        let scope = _.concat(teams, users);

        return (
            <Form layout='horizontal' className="form">
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('sales.process.suitable.objects', '适用范围')}
                >
                    {getFieldDecorator('scope', {
                        initialValue: scope,
                    })(
                        <TreeSelect
                            allowClear={true}
                            treeData={this.props.treeSelectData}
                            treeCheckable={true}
                            treeDefaultExpandAll={true}
                            showCheckedStrategy={SHOW_PARENT}
                            searchPlaceholder={Intl.get('sales.process.suitable.objects.placeholder', '请选择适用该流程的团队或个人')}
                            dropdownStyle={{ maxHeight: 300, overflow: 'auto' }}
                        />
                    )}
                </FormItem>
                <div className="buttons-wrap">
                    {
                        this.state.saveMsgTips ?
                            (
                                <AlertTimer
                                    time={3000}
                                    message={this.state.saveMsgTips}
                                    type={this.state.saveResult}
                                    onHide={this.hideSaveMsgTips}
                                />
                            ) : ''
                    }
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

    render = () => {
        return (
            <RightPanelModal
                className="select-team-user-panel"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                content={this.renderFormContent()}
                title={_.get(this.props.currentStage, 'name')}
                dataTracename='选择使用该客户阶段的部门、个人'
            />);
    }
}
function noop() {
}
StageSelectTeamUserPanel.defaultProps = {
    form: {},
    closeSelectTeamUserPanel: noop,
    changeSaleProcessFieldSuccess: noop,
    treeSelectData: [],
    currentStage: {}
};
StageSelectTeamUserPanel.propTypes = {
    form: PropTypes.object,
    closeSelectTeamUserPanel: PropTypes.func,
    changeSaleProcessFieldSuccess: PropTypes.func,
    treeSelectData: PropTypes.array,
    currentStage: PropTypes.Object,
};

export default Form.create()(StageSelectTeamUserPanel);
