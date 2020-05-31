import '../style/strategy-form.less';

import StrategyFormAction from '../action/strategy-form-action';
import StrategyFormStore from '../store/strategy-form-store';
import ClueAssignmentAction from '../action';

import {Form, Input, Switch} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const FormItem = Form.Item;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import AlertTimer from 'CMP_DIR/alert-timer';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import {getSalesDataList, getFormattedSalesMan} from '../utils/clue_assignment_utils';
import {clueAssignmentStrategy} from 'PUB_DIR/sources/utils/validate-util';

function noop() {
}

class StrategyForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            formData: this.initForm(),
            selectedSalesMan: '',//选择的销售人员
            savedStrategy: {},//保存后的策略
            regions: this.props.regions,//地域列表
            salesManList: this.props.salesManList,//销售列表
            isFirstTimeAdd: this.props.isFirstTimeAdd,//是否是在无数据时第一次添加线索分配策略
            prevSelect: '', //记录上一个选择的值
            ...StrategyFormStore.getState(),
        };
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({
            salesManList: nextProps.salesManList,
            regions: nextProps.regions,
            isFirstTimeAdd: nextProps.isFirstTimeAdd
        });
    }

    componentDidMount = () => {
        StrategyFormStore.listen(this.onStoreChange);
        setTimeout(() => {
            StrategyFormAction.initialForm();
        });
    }

    componentWillUnmount = () => {
        StrategyFormStore.unlisten(this.onStoreChange);
    };

    onStoreChange = () => {
        this.setState({
            ...StrategyFormStore.getState(),
        });
    }

    initForm = () => {
        return {
            name: '',
            condition: {province: []},
            user_name: '',
            member_id: '',
            sales_team_id: '',
            sales_team: '',
            description: '',
            status: 'enable'
        };
    };

    //渲染地域下拉选项
    renderRegionsOption = () => {
        //如果是在无数据的时候第一次添加线索分配策略，在选项框里有"全部地域"这个选项
        let regions = _.cloneDeep(this.state.regions);
        //如果只有一个策略时，添加“全部地域”选项
        if(this.state.isFirstTimeAdd && !_.includes(regions, 'all')) {
            regions.unshift('all');
        }
        return (_.map(regions, (item, index) => {
            if(_.isEqual(item, 'all')) {
                return (<Option key={index} value='all'>{Intl.get('clue.assignment.needs.regions.all.regions', '全部地域')}</Option>);
            } else {
                return (<Option key={index} value={item}>{item}</Option>);
            }
        }));
    }

    //当地域下拉列表改变后
    onSelectChange = (value) => {
        //如果选中了全部地域，将已经选择的地域清空,"全部地域"与其它选项是互斥的
        //由于FormItem内部源码原因，事件需要延迟调用
        //不可使用normalize
        setTimeout(() => {
            if(_.includes(value, 'all') && !_.includes(this.state.prevSelect, 'all')) {
                value = 'all';
            } else if(_.includes(value, 'all') && _.includes(this.state.prevSelect, 'all')) {
                value = _.drop(value);
            }
            this.props.form.setFieldsValue({
                province: value
            });
            this.setState({
                prevSelect: value
            });
        });
    }

    //关闭面板前清空验证的处理
    resetValidateFlags = () => {
        this.setState({
            formData: this.initForm
        });
    }

    //select组件销售人员切换时
    onSalesManChange = (salesValue) => {
        let savedSalesMan = getFormattedSalesMan(salesValue, _.get(this.state, 'salesManList', []));
        let formData = _.cloneDeep(this.state.formData);
        formData.user_name = savedSalesMan.user_name;
        formData.member_id = savedSalesMan.member_id;
        formData.sales_team_id = savedSalesMan.sales_team_id;
        formData.sales_team = savedSalesMan.sales_team;
        this.setState({
            selectedSalesMan: salesValue,
            formData
        });
    }

    handleCancel = (e) => {
        e && e.preventDefault();
        this.resetValidateFlags();
        this.props.closeRightPanel();
    };

    handleSubmit = (e) => {
        e && e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            let description = _.get(values, 'description', '');
            let name = _.get(values, 'name');
            let province = _.get(values, 'province');
            let formData = _.cloneDeep(this.state.formData);
            formData.condition.province = province;
            formData.name = name;
            formData.description = description;
            StrategyFormAction.saveClueAssignmentStrategy(formData, strategy => {
                if(!_.isEmpty(strategy)) {
                    ClueAssignmentAction.addStrategy(strategy);
                    this.setState({
                        savedStrategy: strategy
                    });
                }
            });
        });
    }

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        if (this.state.saveResult === 'success') {
            this.props.closeRightPanel();
        }
    };

    //更新启停项
    onSwitchChange = (changeValue) => {
        let formData = this.state.formData;
        formData.status = changeValue ? 'enable' : 'disable';
        this.setState({
            formData: formData
        });
    }

    //渲染表单内容
    renderFormContent() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        //  //“满足条件”项的布局
        // const needsFormItemLayout = {
        //     colon: false,
        //     labelCol: {span: 6},
        //     wrapperCol: {span: 18},
        // }
        let saveResult = this.state.saveResult;
        let formData = this.state.formData;
        let height = $(window).height() - 70;
        return (
            <GeminiScrollbar>
                <div className="assign-strategy-form-container" style={{height: height}}>
                    <Form layout='horizontal' className="assign-strategy-form" autoComplete="off" id="assign-strategy-form">
                        <FormItem
                            className="form-item-label"
                            label={Intl.get('clue.assignment.name','名称')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('name', {
                                rules: [clueAssignmentStrategy],
                                validateTrigger: 'onBlur'
                            })(
                                <Input
                                    name="name"
                                    id="name"
                                    placeholder={Intl.get('clue.assignment.name.tip','请输入线索分配策略名称')}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            className="needs-form-container"
                            label={Intl.get('clue.assignment.needs', '满足条件')}
                            {...formItemLayout}
                        >
                            <div className="condition-item">
                                <span className="province-label">{Intl.get('clue.assignment.needs.region', '地域')}</span>
                                <div id="condition-province">
                                    <FormItem>
                                        {
                                            getFieldDecorator('province', {
                                                rules: [{
                                                    required: true, message: Intl.get('clue.assignment.needs.region.required.tip', '地域不能为空')
                                                }],
                                                validateTrigger: 'onBlur'
                                            })(
                                                <AntcSelect
                                                    mode="multiple"
                                                    placeholder={Intl.get('clue.assignment.needs.region.tip', '请选择或输入地域')}
                                                    optionFilterProp="children"
                                                    notFoundContent={Intl.get('clue.assignment.needs.region.no.data', '暂无此地域')}
                                                    searchPlaceholder={Intl.get('clue.assignment.needs.region.tip', '请选择或输入地域')}
                                                    getPopupContainer={() => document.getElementById('condition-province')}
                                                    filterOption={(input, option) => ignoreCase(input, option)}
                                                    onChange={this.onSelectChange}
                                                >
                                                    {this.renderRegionsOption()}
                                                </AntcSelect>
                                            )
                                        }
                                    </FormItem>
                                </div>
                                {/*2019/09/29日 孙庆峰加*/}
                                {/*原因： 暂时实现地域的线索分配策略*/}
                                {/*<FormItem*/}
                                {/*    label={Intl.get('clue.assignment.needs.source', '来源',)}*/}
                                {/*    {...needsFormItemLayout}*/}
                                {/*>*/}
                                {/*    {*/}
                                {/*        getFieldDecorator('clue_source', {*/}
                                {/*            rules: [{*/}
                                {/*                required: true,*/}
                                {/*                message: Intl.get('clue.assignment.needs.source.required.tip', '线索来源不能为空')*/}
                                {/*            }]*/}
                                {/*        })(*/}
                                {/*            <AntcSelect*/}
                                {/*                combobox*/}
                                {/*                placeholder={Intl.get('clue.assignment.needs.source.tip', '请选择或输入线索来源',)}*/}
                                {/*                name="clue_source"*/}
                                {/*                getPopupContainer={() => document.getElementById('assign-strategy-form')}*/}
                                {/*                filterOption={(input, option) => ignoreCase(input, option)}*/}
                                {/*            >*/}
                                {/*                {*/}
                                {/*                    _.isArray(this.props.clueSourceArray) ?*/}
                                {/*                        this.props.clueSourceArray.map((source, idx) => {*/}
                                {/*                            return (<Option key={idx} value={source}>{source}</Option>);*/}
                                {/*                        }) : null*/}
                                {/*                }*/}
                                {/*            </AntcSelect>*/}
                                {/*        )}*/}
                                {/*</FormItem>*/}
                                {/*<FormItem*/}
                                {/*    label={Intl.get('clue.assignment.needs.access.channel','接入渠道')}*/}
                                {/*    id="access_channel"*/}
                                {/*    {...needsFormItemLayout}*/}
                                {/*>*/}
                                {/*    {*/}
                                {/*        getFieldDecorator('access_channel', {*/}
                                {/*            rules: [{*/}
                                {/*                required: true,*/}
                                {/*                message: Intl.get('clue.assignment.needs.access.channel.required.tip', '接入渠道不能为空')*/}
                                {/*            }]*/}
                                {/*        })(*/}
                                {/*            <AntcSelect*/}
                                {/*                combobox*/}
                                {/*                placeholder={Intl.get('clue.assignment.needs.access.channel.tip', '请选择或输入接入渠道')}*/}
                                {/*                name="access_channel"*/}
                                {/*                getPopupContainer={() => document.getElementById('assign-strategy-form')}*/}
                                {/*                filterOption={(input, option) => ignoreCase(input, option)}*/}
                                {/*            >*/}
                                {/*                {_.isArray(this.props.accessChannelArray) ?*/}
                                {/*                    this.props.accessChannelArray.map((source, idx) => {*/}
                                {/*                        return (<Option key={idx} value={source}>{source}</Option>);*/}
                                {/*                    }) : null*/}
                                {/*                }*/}
                                {/*            </AntcSelect>*/}
                                {/*        )}*/}
                                {/*</FormItem>*/}
                                {/*<FormItem*/}
                                {/*    label={Intl.get('clue.assignment.needs.clue.classify', '线索分类')}*/}
                                {/*    id="clue_classify"*/}
                                {/*    className="clue-classify-item"*/}
                                {/*    {...needsFormItemLayout}*/}
                                {/*>*/}
                                {/*    {*/}
                                {/*        getFieldDecorator('clue_classify', {*/}
                                {/*            rules: [{*/}
                                {/*                required: true,*/}
                                {/*                message: Intl.get('clue.assignment.needs.clue.classify.required.tip', '线索分类不能为空')*/}
                                {/*            }]*/}
                                {/*        })(*/}
                                {/*            <AntcSelect*/}
                                {/*                combobox*/}
                                {/*                placeholder={Intl.get('clue.assignment.needs.clue.classify.tip', '请选择或输入线索分类')}*/}
                                {/*                name="clue_classify"*/}
                                {/*                getPopupContainer={() => document.getElementById('assign-strategy-form')}*/}
                                {/*                filterOption={(input, option) => ignoreCase(input, option)}*/}
                                {/*            >*/}
                                {/*                {_.isArray(this.props.clueClassifyArray) ?*/}
                                {/*                    this.props.clueClassifyArray.map((source, idx) => {*/}
                                {/*                        return (<Option key={idx} value={source}>{source}</Option>);*/}
                                {/*                    }) : null*/}
                                {/*                }*/}
                                {/*            </AntcSelect>*/}
                                {/*        )}*/}
                                {/*</FormItem>*/}
                            </div>
                        </FormItem>
                        <FormItem
                            label={Intl.get('clue.assignment.assignee', '分配给')}
                            id="assignee"
                            {...formItemLayout}
                        >
                            {
                                getFieldDecorator('assignee', {
                                    rules: [{
                                        required: true,
                                        message: Intl.get('clue.assignment.assignee.required.tip', '被分配人不能为空')
                                    }],
                                    validateTrigger: 'onBlur'
                                })(
                                    <AntcSelect
                                        showSearch
                                        placeholder={Intl.get('clue.assignment.assignee.tip', '请选择或输入被分配人')}
                                        name="assignee"
                                        value={_.get(this.state, 'selectedSalesMan')}
                                        getPopupContainer={() => document.getElementById('assign-strategy-form')}
                                        filterOption={(input, option) => ignoreCase(input, option)}
                                        onChange={this.onSalesManChange}
                                    >
                                        {getSalesDataList(_.get(this.state, 'salesManList', []))}
                                    </AntcSelect>
                                )}
                        </FormItem>
                        <FormItem
                            className="form-item-label"
                            label={Intl.get('clue.assignment.description', '描述')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('description')(
                                <Input
                                    name="description"
                                    id="description"
                                    type="textarea"
                                    rows="3"
                                    placeholder={Intl.get('clue.assignment.description.tip', '请描述一下线索分配策略')}
                                />
                            )}
                        </FormItem>
                        <FormItem
                            className="start-stop-state"
                            label={Intl.get('clue.assignment.active.state', '启停状态')}
                            id="status"
                            {...formItemLayout}
                        >
                            {getFieldDecorator('status')(
                                <Switch defaultChecked
                                    checked={_.isEqual(formData.status, 'enable') ? true : false}
                                    size="small"
                                    onChange={this.onSwitchChange}/>
                            )}
                            <span className="start-stop-state-tip">{Intl.get('clue.assignment.strategy.tip','本策略对新加线索生效')}</span>
                        </FormItem>
                        <div className="submit-button-container">
                            <FormItem
                                wrapperCol={{span: 24}}>
                                <SaveCancelButton
                                    loading={this.state.isSaving}
                                    handleSubmit={this.handleSubmit}
                                    handleCancel={this.handleCancel}
                                />
                                <div className="indicator">
                                    {saveResult ?
                                        (
                                            <AlertTimer time={saveResult === 'error' ? 9999999999999 : 600}
                                                message={this.state.saveMsg}
                                                type={saveResult} showIcon
                                                onHide={saveResult === 'error' ? function(){} : this.hideSaveTooltip}/>
                                        ) : null
                                    }
                                </div>
                            </FormItem>
                        </div>
                    </Form>
                </div>
            </GeminiScrollbar>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="assignment-strategy-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={Intl.get('clue.assignment.strategy.add', '添加分配策略')}
                content={this.renderFormContent()}
                dataTracename='添加分配策略'
            />);
    }
}
StrategyForm.defaultProps = {
    closeRightPanel: noop(),
    regions: [],//地域列表
    salesManList: [],//销售人员列表
    isFirstTimeAdd: false//是否是在无数据的情况下第一次添加策略
};

StrategyForm.propTypes = {
    form: PropTypes.form,
    closeRightPanel: PropTypes.func,
    regions: PropTypes.array,
    salesManList: PropTypes.array,
    isFirstTimeAdd: PropTypes.bool,
};

module.exports = Form.create()(StrategyForm);