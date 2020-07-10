import '../style/strategy-info.less';

import StrategyInfoAction from '../action/strategy-info-action';
import StrategyInfoStore from '../store/strategy-info-store';
import ClueAssignmentAction from '../action';

import {Switch, Popconfirm, Icon} from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import DetailCard from 'CMP_DIR/detail-card';
import classNames from 'classnames';
import {getSalesDataList, getSelectedSaleManValue, getSelectedSaleManValueId, getFormattedSalesMan} from '../utils/clue_assignment_utils';
import { validatorNameRuleRegex } from 'PUB_DIR/sources/utils/validate-util';

const LAYOUT = {
    TITLE_INPUT_WIDTH: 88,//顶部
    NAME_EDIT_FIELD_WIDTH: 360,//策略名称宽度
    DESC_EDIT_FIELD_WIDTH: 394,//策略描述宽度
    EDIT_FIELD_WIDTH: 358,//满足条件（地域，来源）、被分配人
    EDIT_FIELD_WIDTH_4_CHAR: 346,//满足条件（接入渠道，线索分类）
};

const SAVE_CONTENT = {
    DESCRIPTION: 'description', //描述
    ASSIGNEE: 'assignee', //被分配人
    NAME: 'name', //名称
    REGION: 'region' //地域
};

class StrategyInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            strategyInfo: this.props.strategyInfo, //线索分配策略
            startStopVisible: false, //启停状态popconfirm的展示与否
            startStopErrorMsg: '', //启停项的错误提示
            isStartStopSaving: false,//启停项操作时加载的icon展示与否
            regions: this.props.regions,//地域列表
            salesManList: this.props.salesManList,//销售列表
            isFirstOneEdit: this.props.isFirstOneEdit,//修改的是否为全部分配策略里的唯一一个
            prevSelect: _.get(this.props, 'strategyInfo.condition.province'),//上次选择的地域
            ...StrategyInfoStore.getState()
        };
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            strategyInfo: nextProps.strategyInfo,
            status: nextProps.strategyInfo.status,
            regions: nextProps.regions,//地域列表
            salesManList: nextProps.salesManList,//销售列表
            isFirstOneEdit: nextProps.isFirstOneEdit,
            startStopVisible: false,
            startStopErrorMsg: '',
            isStartStopSaving: false,
        });
    }

    componentDidMount = () => {
        StrategyInfoStore.listen(this.onStoreChange);
    }

    componentWillUnmount = () => {
        setTimeout(() => {
            StrategyInfoAction.initialInfo();
        });
        StrategyInfoStore.unlisten(this.onStoreChange);
    }

    onStoreChange = () => {
        this.setState({
            ...StrategyInfoStore.getState()
        });
    }

    //当下拉选项修改时
    onSelectChange = (value) => {
        //如果选中了全部地域，将已经选择的地域清空,"全部地域"与其它选项是互斥的
        if(_.includes(value, 'all') && !_.includes(this.state.prevSelect, 'all')) {
            value = 'all';
        } else if(_.includes(value, 'all') && _.includes(this.state.prevSelect, 'all')) {
            value = _.drop(value);
        }
        setTimeout(() => {
            this.provinceSelectField.state.formData.select = _.concat([], value);
            //强制组件刷新
            this.provinceSelectField.forceUpdate();
        });
        this.setState({
            prevSelect: value,
        });
    }
    //关闭线索分配详情面板
    handleCancel = (e) => {
        e && e.preventDefault();
        this.props.closeRightPanel();
    }

    //保存修改信息
    saveEditBasicInfo = (savedObj, successFunc, errorFunc) => {
        //如果保存的为被分配人
        if(_.has(savedObj, SAVE_CONTENT.ASSIGNEE)) {
            let salesMan = getFormattedSalesMan(savedObj.assignee, _.get(this.state, 'salesManList', []));
            delete savedObj.assignee;
            savedObj.user_name = salesMan.user_name;
            savedObj.member_id = salesMan.member_id;
            savedObj.sales_team_id = salesMan.sales_team_id;
            savedObj.sales_team = salesMan.sales_team;
        } else if(_.has(savedObj, SAVE_CONTENT.REGION)) {
            let condition = {};
            condition.province = savedObj.region;
            delete savedObj.region;
            savedObj.condition = condition;
        }
        this.handleEditSave(savedObj, successFunc, errorFunc);
    }

    //启停线索分配策略状态
    handleSwitchConfirm = () => {
        let curStatus = this.state.strategyInfo.status;
        let savedObj = {};
        savedObj.id = _.get(this.state, 'strategyInfo.id');
        savedObj.status = _.isEqual(curStatus, 'enable') ? 'disable' : 'enable';
        this.setState({
            isStartStopSaving: true
        });
        this.handleEditSave(savedObj);
    }

    //删除此线索分配策略
    handleDeleteConfirm = () => {
        let id = _.get(this.state, 'strategyInfo.id');
        StrategyInfoAction.deleteAssignmentStrategy(id, result => {
            let isSuccess = result.deleteResult;
            if(_.isEqual(isSuccess, 'success')) {
                setTimeout(() => {
                    //线索分配策略列表同步更新
                    ClueAssignmentAction.deleteStrategyById(id);
                    this.props.closeRightPanel();
                }, 600);
            } else {
                //三秒后清除错误消息
                setTimeout(() => {
                    StrategyInfoAction.clearDeleteMsg();
                }, 3000);
            }
        });
    }

    handleSwitchClick = () => {
        this.setState({
            startStopVisible: true
        });
    }

    handleSwitchCancel = () => {
        this.setState({
            startStopVisible: false
        });
    }

    //获取地域列表
    getRegionOptions = () => {
        let regions = _.cloneDeep(this.state.regions);
        let selectedRegions = _.get(this.state, 'strategyInfo.condition.province', []);
        let result = _.concat(selectedRegions, regions);
        //如果只有一个策略时，添加“全部地域”选项
        if(this.state.isFirstOneEdit && !_.includes(result, 'all')) {
            result.unshift('all');
        }
        return (_.map(result, (item, index) => {
            if(_.isEqual(item, 'all')) {
                return (<Option key={index} value='all'>{Intl.get('clue.assignment.needs.regions.all.regions', '全部地域')}</Option>);
            } else {
                return (<Option key={index} value={item}>{item}</Option>);
            }
        }));
    }

    handleEditSave = (savedObj, successFunc, errorFunc) => {
        let strategyInfo = _.cloneDeep(this.state.strategyInfo);
        strategyInfo = _.extend(strategyInfo, savedObj);
        StrategyInfoAction.editAssignmentStrategy(strategyInfo, (result) => {
            let { saveResult, saveMsg } = result;
            if(_.isEqual(saveResult, 'success')) {
                if(_.isFunction(successFunc)) {
                    successFunc();
                } else {//如果没有传入successFunc说明此时修改的是分配策略的启停状态
                    this.setState({
                        startStopVisible: false,
                        isStartStopSaving: false
                    });
                }
                //在线索分配策略列表同步更新
                ClueAssignmentAction.updateStrategy(strategyInfo);
                this.setState({
                    strategyInfo
                });
            } else {
                if(_.isFunction(errorFunc)) {
                    errorFunc(saveMsg);
                } else {//如果没有传入errorFunc说明此时修改的是分配策略的启停状态,错误提示信息单独处理
                    this.setState({
                        startStopErrorMsg: saveMsg,
                        isStartStopSaving: false,
                        startStopVisible: false
                    });
                    //三秒后清除错误信息
                    setTimeout(() => {
                        this.setState({
                            startStopErrorMsg: '',
                        });
                    }, 3000);
                }
            }
        });
    }

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        if (this.state.deleteResult === 'success') {
            this.props.closeRightPanel();
        }
    };

    //线索分配策略title
    renderTitle = () => {
        let strategyInfo = this.state.strategyInfo;
        let stop = Intl.get('common.stop', '停用');
        let start = Intl.get('common.enabled', '启用');
        let switchConfirmText = _.isEqual(strategyInfo.status, 'enable') ?
            Intl.get('clue.assignment.strategy.switch.tip', '确定要{action}该线索分配策略？', {action: stop}) :
            Intl.get('clue.assignment.strategy.switch.tip', '确定要{action}该线索分配策略？', {action: start});
        let deleteConfirmText = Intl.get('clue.assignment.strategy.delete', '确定要删除该线索分配策略？');
        let strategyName = classNames('strategy-name', {
            'start-stop-has-error': !_.isEmpty(this.state.startStopErrorMsg) || !_.isEmpty(this.state.deleteResult),
            'is-loading': this.state.isStartStopSaving || this.state.isDeleting
        });
        let deleteResult = classNames('delete-tip', {
            'success-tip': _.isEqual(this.state.deleteResult, 'success'),
            'error-tip': _.isEqual(this.state.deleteResult, 'error')
        });
        return (
            <div className="strategy-info-title">
                <div className="strategy-name-container">
                    <div className={strategyName}>
                        <BasicEditInputField
                            width={LAYOUT.NAME_EDIT_FIELD_WIDTH}
                            id={strategyInfo.id}
                            value={strategyInfo.name}
                            validators={[validatorNameRuleRegex(10, Intl.get('clue.assignment.strategy.name', '线索分配策略'))]}
                            field="name"
                            type="input"
                            placeholder={Intl.get('clue.assignment.name.tip', '请输入线索分配策略名称')}
                            hasEditPrivilege={true}
                            saveEditInput={this.saveEditBasicInfo.bind(this)}
                        />
                    </div>
                    <div className="strategy-stop-start">
                        {!_.isEmpty(this.state.startStopErrorMsg) ?
                            (<div className='start-stop-error-msg'>
                                {Intl.get('crm.219', '修改失败')}
                            </div>) : null}
                        {!_.isEmpty(this.state.deleteResult) ?
                            (<div className={deleteResult}>
                                {_.get(this.state, 'deleteMsg')}
                            </div>) : null
                        }
                        {this.state.isStartStopSaving || this.state.isDeleting ? <Icon type="loading"/> : null}
                        <div className="strategy-switch">
                            <Popconfirm
                                visible={this.state.startStopVisible}
                                placement="bottomRight"
                                title={switchConfirmText}
                                onConfirm={this.handleSwitchConfirm}
                                onCancel={this.handleSwitchCancel}
                            >
                                {/*点击事件，放到span中，是为了解决打包时，报e.preventDefault is not a function的问题**/}
                                <span onClick={this.handleSwitchClick}>
                                    <Switch
                                        size="small"
                                        checked={_.isEqual(this.state.strategyInfo.status, 'enable') ? true : false}
                                    />
                                </span>
                            </Popconfirm>
                        </div>
                        <div className="strategy-delete">
                            <Popconfirm
                                placement="bottomRight"
                                title={deleteConfirmText}
                                onConfirm={this.handleDeleteConfirm}
                            >
                                <i className="iconfont icon-recycle-bin-1"></i>
                            </Popconfirm>
                        </div>
                    </div>
                </div>
                <div className="strategy-description-container">
                    <span className="strategy-info-label">{Intl.get('clue.assignment.description', '描述')}:</span>
                    <BasicEditInputField
                        width={LAYOUT.DESC_EDIT_FIELD_WIDTH}
                        id={strategyInfo.id}
                        value={strategyInfo.description}
                        field="description"
                        type="textarea"
                        placeholder={Intl.get('clue.assignment.description.tip', '请描述一下线索分配策略')}
                        hasEditPrivilege={true}
                        saveEditInput={this.saveEditBasicInfo.bind(this)}
                        noDataTip={Intl.get('clue.assignment.no.description.tip', '暂无线索分配策略描述')}
                        addDataTip={Intl.get('clue.assignment.add.description.tip', '添加线索分配策略描述')}
                    />
                </div>
            </div>);
    }

    renderDetailCardContent = () => {
        let strategyInfo = this.state.strategyInfo;
        //展示的地域取值
        let displayRegions = '';
        if(_.get(strategyInfo, 'condition.province.length') === 1) {
            displayRegions = _.isEqual(_.get(strategyInfo, 'condition.province[0]'), 'all') ? Intl.get('clue.assignment.needs.regions.all.regions', '全部地域') : _.get(strategyInfo, 'condition.province');
        } else {
            displayRegions = _.get(strategyInfo, 'condition.province', []).join('、');
        }
        return (<div className="strategy-needs-details">
            <div className="needs-content">
                <div id="condition-province">
                    <span className="needs-label">{Intl.get('clue.assignment.needs.region','地域')}:</span>
                    <BasicEditSelectField
                        ref={selectFiled => this.provinceSelectField = selectFiled}
                        width={LAYOUT.EDIT_FIELD_WIDTH}
                        id={strategyInfo.id}
                        field={SAVE_CONTENT.REGION}
                        multiple={true}
                        displayText={displayRegions}
                        value={strategyInfo.condition.province}
                        onSelectChange={this.onSelectChange}
                        placeholder={Intl.get('clue.assignment.needs.region.tip', '请选择或输入地域')}
                        hasEditPrivilege={true}
                        selectOptions={this.getRegionOptions()}
                        validators={[{
                            required: true,
                            message: Intl.get('clue.assignment.needs.region.required.tip', '地域不能为空'),
                            type: 'array'
                        }]}
                        noDataTip={Intl.get( 'clue.assignment.needs.region.no.data', '暂无此地域')}
                        saveEditSelect={this.saveEditBasicInfo.bind(this)}
                    />
                </div>
            </div>
            {/*2019/09/29日 孙庆峰加*/}
            {/*原因： 暂时先实现地域的线索分配策略*/}
            {/*<div className="needs-content">*/}
            {/*    <span className="needs-label">{Intl.get('clue.assignment.needs.source','来源')}:</span>*/}
            {/*    <BasicEditSelectField*/}
            {/*        width={LAYOUT.EDIT_FIELD_WIDTH}*/}
            {/*        id={strategyInfo.id}*/}
            {/*        field="source"*/}
            {/*        displayText={strategyInfo.needs.source}*/}
            {/*        value={strategyInfo.needs.source}*/}
            {/*        placeholder={Intl.get('clue.assignment.needs.source.tip', '请选择或输入线索来源')}*/}
            {/*        hasEditPrivilege={true}*/}
            {/*        selectOptions={this.getSelectOptions()}*/}
            {/*        validators={[{*/}
            {/*            required: true,*/}
            {/*            message: Intl.get('clue.assignment.needs.source.required.tip', '线索来源不能为空'),*/}
            {/*        }]}*/}
            {/*        saveEditSelect={this.saveEditBasicInfo.bind(this)}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<div className="needs-content channel-content">*/}
            {/*    <span className="needs-label">{Intl.get('clue.assignment.needs.access.channel', '接入渠道')}:</span>*/}
            {/*    <BasicEditSelectField*/}
            {/*        width={LAYOUT.EDIT_FIELD_WIDTH_4_CHAR}*/}
            {/*        id={strategyInfo.id}*/}
            {/*        field="access_channel"*/}
            {/*        displayText={strategyInfo.needs.access_channel}*/}
            {/*        value={strategyInfo.needs.access_channel}*/}
            {/*        placeholder={Intl.get('clue.assignment.needs.access.channel.tip', '请选择或输入接入渠道')}*/}
            {/*        hasEditPrivilege={true}*/}
            {/*        selectOptions={this.getSelectOptions()}*/}
            {/*        validators={[{*/}
            {/*            required: true,*/}
            {/*            message: Intl.get('clue.assignment.needs.access.channel.required.tip', '接入渠道不能为空'),*/}
            {/*        }]}*/}
            {/*        saveEditSelect={this.saveEditBasicInfo.bind(this)}*/}
            {/*    />*/}
            {/*</div>*/}
            {/*<div className="needs-content classify-content">*/}
            {/*    <span className="needs-label">{Intl.get('clue.assignment.needs.clue.classify', '线索分类')}:</span>*/}
            {/*    <BasicEditSelectField*/}
            {/*        width={LAYOUT.EDIT_FIELD_WIDTH_4_CHAR}*/}
            {/*        id={strategyInfo.id}*/}
            {/*        field="assignee"*/}
            {/*        displayText={strategyInfo.needs.clue_classify}*/}
            {/*        value={strategyInfo.needs.clue_classify}*/}
            {/*        placeholder={Intl.get('clue.assignment.needs.clue.classify.tip','请选择或输入线索分类')}*/}
            {/*        hasEditPrivilege={true}*/}
            {/*        selectOptions={this.getSelectOptions()}*/}
            {/*        validators={[{*/}
            {/*            required: true,*/}
            {/*            message: Intl.get('clue.assignment.needs.clue.classify.required.tip', '线索分类不能为空'),*/}
            {/*        }]}*/}
            {/*        saveEditSelect={this.saveEditBasicInfo.bind(this)}*/}
            {/*    />*/}
            {/*</div>*/}
        </div>);
    }

    //动态获取title高度
    getContainerHeight = () => {
        return $(window).height();
    }

    //线索分配策略内容
    renderDetail = () => {
        let strategyInfo = this.state.strategyInfo;
        let assigneeContent = (
            <div className="assignee-card">
                <span className="assignee-label">{Intl.get('clue.assignment.assignee', '分配给')}</span>
                <BasicEditSelectField
                    width={LAYOUT.EDIT_FIELD_WIDTH}
                    id={strategyInfo.id}
                    field="assignee"
                    displayText={getSelectedSaleManValue(strategyInfo)}
                    value={getSelectedSaleManValueId(strategyInfo)}
                    placeholder={Intl.get('clue.assignment.assignee.tip', '请选择或输入被分配人')}
                    hasEditPrivilege={true}
                    selectOptions={getSalesDataList(_.get(this.state, 'salesManList', []))}
                    validators={[{
                        required: true,
                        message: Intl.get('clue.assignment.assignee.required.tip', '被分配人不能为空'),
                    }]}
                    noDataTip={Intl.get( 'clue.assignment.assignee.no.data.tip', '暂无此分配人')}
                    saveEditSelect={this.saveEditBasicInfo.bind(this)}
                />
            </div>
        );
        return (
            <GeminiScrollbar>
                <div className="strategy-detail-card-container" height={{height: this.getContainerHeight()}}>
                    <DetailCard
                        className='strategy-card-needs'
                        title={Intl.get('clue.assignment.needs', '满足条件')}
                        content={this.renderDetailCardContent()}
                    />
                    <DetailCard
                        className='strategy-card-assignee'
                        content={assigneeContent}
                    />
                </div>
            </GeminiScrollbar>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="assignment-strategy-info-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={this.renderTitle()}
                content={this.renderDetail()}
                dataTracename='线索分配策略详情'
            />);
    }
}
StrategyInfo.defaultProps = {
    strategyInfo: null,
    regions: [],//地域列表
    salesManList: [],//销售人员列表
    isFirstOneEdit: false,//是否是只有一个线索分配策略的编辑
};

StrategyInfo.propTypes = {
    strategyInfo: PropTypes.object,
    closeRightPanel: PropTypes.func,
    regions: PropTypes.array,
    salesManList: PropTypes.array,
    isFirstOneEdit: PropTypes.bool,
};

module.exports = StrategyInfo;