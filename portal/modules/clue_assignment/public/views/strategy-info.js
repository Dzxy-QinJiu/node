import '../style/strategy-info.less';

import StrategyInfoAction from '../action/strategy-info-action';
import StrategyInfoStore from '../store/strategy-info-store';
import ClueAssignmentAction from '../action';
import ClueAssignmentStore from '../store';

import {Switch, Popconfirm, Icon} from 'antd';
import Trace from 'LIB_DIR/trace';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import DetailCard from 'CMP_DIR/detail-card';
import AlertTimer from 'CMP_DIR/alert-timer';
import {getSalesDataList, getSelectedSaleManValue, getFormattedSalesMan} from '../utils/clue_assignment_utils';

const LAYOUT = {
    TITLE_INPUT_WIDTH: 88,//顶部
    NAME_EDIT_FIELD_WIDTH: 360,//策略名称宽度
    DESC_EDIT_FIELD_WIDTH: 394,//策略描述宽度
    EDIT_FIELD_WIDTH: 366,//满足条件（地域，来源）
    EDIT_FIELD_WIDTH_4_CHAR: 346,//满足条件（接入渠道，线索分类）
    EDIT_FIELD_WIDTH_ASSIGNEE: 363 //被分配人
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
            status: this.props.strategyInfo.status, // 当前线索分配策略的启停状态
            start_stop_visible: false, //启停状态popconfirm的展示与否
            availableRegions: '', //可选择的地域
            ...ClueAssignmentStore.getState(),
            ...StrategyInfoStore.getState()
        };
    }
    componentWillReceiveProps = (nextProps) => {
        this.setState({
            strategyInfo: nextProps.strategyInfo,
            status: nextProps.strategyInfo.status
        });
    }

    componentDidMount = () => {
        ClueAssignmentStore.listen(this.onStoreChange);
        ClueAssignmentAction.getAllSalesManList();
        StrategyInfoStore.listen(this.onStoreChange);
        // 在编辑面板地域下拉选择要展示自己已选择的地域
        let regions = _.cloneDeep(this.state.regions);
        let selectedRegions = _.get(this.props, 'strategyInfo.condition[0].province', []);
        this.setState({
            availableRegions: _.concat(regions, selectedRegions)
        });
    }

    componentWillUnmount = () => {
        ClueAssignmentStore.unlisten(this.onStoreChange);
        StrategyInfoStore.unlisten(this.onStoreChange);
    }

    onStoreChange = () => {
        this.setState({
            ...ClueAssignmentStore.getState(),
            ...StrategyInfoStore.getState()
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
            let salesMan = getFormattedSalesMan(savedObj.assignee);
            delete savedObj.assignee;
            savedObj.user_name = salesMan.user_name;
            savedObj.member_id = salesMan.member_id;
            savedObj.sales_team_id = salesMan.sales_team_id;
            savedObj.sales_team_name = salesMan.sales_team_name;
        } else if(_.has(savedObj, SAVE_CONTENT.REGION)) {
            let condition = [];
            let province = savedObj.region;
            delete savedObj.region;
            condition.push({province: province});
            savedObj.condition = condition;
        }
        this.handleEditSave(savedObj, successFunc, errorFunc);
    }

    //启停线索分配策略状态
    handleSwitchConfirm = () => {
        let curStatus = this.state.status;
        let savedObj = {};
        savedObj.id = _.get(this.state, 'strategyInfo.id');
        savedObj.status = _.isEqual(curStatus, 'enable') ? 'disable' : 'enable';
        this.handleEditSave(savedObj);
    }

    //删除此线索分配策略
    handleDeleteConfirm = () => {
        let id = _.get(this.state, 'strategyInfo.id');
        StrategyInfoAction.deleteAssignmentStrategy(id, result => {
            let isSuccess = result.deleteResult;
            if(_.isEqual(isSuccess, 'success')) {
                //线索分配策略列表同步更新
                ClueAssignmentAction.deleteStrategyById(id);
            }
        });
    }

    handleSwitchClick = () => {
        this.setState({
            start_stop_visible: true
        });
    }

    handleSwitchCancel = () => {
        this.setState({
            start_stop_visible: false
        });
    }

    //获取地域列表
    getRegionOptions = () => {
        return(_.map(this.state.availableRegions, (item, index) => {
            return (<Option key={index} value={item}>{item}</Option>);
        }));
    }

    handleEditSave = (savedObj, successFunc, errorFunc) => {
        let strategyInfo = _.cloneDeep(this.state.strategyInfo);
        strategyInfo = _.extend(strategyInfo, savedObj);
        StrategyInfoAction.editAssignmentStrategy(strategyInfo, (result) => {
            let { saveResult, saveMsg } = result;
            if(_.isEqual(saveResult, 'success')) {
                //如果没有传入successFunc说明此时修改的是分配策略的启停状态
                if(_.isEmpty(successFunc)) {
                    let status = this.state.status;
                    this.setState({
                        status: _.isEqual(status, 'enable') ? 'disable' : 'enable'
                    });
                } else {
                    successFunc();
                }
                //在线索分配策略列表同步更新
                ClueAssignmentAction.updateStrategy(strategyInfo);
                this.setState({
                    strategyInfo
                });

            } else {
                //如果没有传入errorFunc说明此时修改的是分配策略的启停状态
                if(!_.isEmpty(errorFunc)) {
                    errorFunc(saveMsg);
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
        return (
            <div className="strategy-info-title">
                <div className="strategy-name-container">
                    <div className="strategy-name">
                        <BasicEditInputField
                            width={LAYOUT.NAME_EDIT_FIELD_WIDTH}
                            id={strategyInfo.id}
                            value={strategyInfo.name}
                            field="name"
                            type="input"
                            placeholder={Intl.get('clue.assignment.name.tip', '请输入线索分配策略名称')}
                            hasEditPrivilege={true}
                            saveEditInput={this.saveEditBasicInfo.bind(this)}
                        />
                    </div>
                    <div className="strategy-stop-start">
                        <div className="strategy-switch">
                            {this.state.isSaving ? <Icon type="loading"/> : null}
                            <Popconfirm
                                visible={this.state.start_stop_visible}
                                placement="bottomRight"
                                title={switchConfirmText}
                                onConfirm={this.handleSwitchConfirm}
                                onCancel={this.handleSwitchCancel}
                            >
                                {/*点击事件，放到span中，是为了解决打包时，报e.preventDefault is not a function的问题**/}
                                <span onClick={this.handleSwitchClick}>
                                    <Switch
                                        size="small"
                                        checked={_.isEqual(this.state.status, 'enable') ? true : false}
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
                                <i className="iconfont icon-huishouzhan"></i>
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
        return (<div className="strategy-needs-details">
            <div className="needs-content">
                <div id="condition-province">
                    <span className="needs-label">{Intl.get('clue.assignment.needs.region','地域')}:</span>
                    <BasicEditSelectField
                        width={LAYOUT.EDIT_FIELD_WIDTH}
                        id={strategyInfo.id}
                        field={SAVE_CONTENT.REGION}
                        multiple={true}
                        displayText={strategyInfo.condition[0].province}
                        value={strategyInfo.condition[0].province}
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
                    width={LAYOUT.EDIT_FIELD_WIDTH_ASSIGNEE}
                    id={strategyInfo.id}
                    field="assignee"
                    displayText={getSelectedSaleManValue(this.state.strategyInfo)}
                    value={getSelectedSaleManValue(this.state.strategyInfo)}
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
        let deleteResult = this.state.deleteResult;
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
                    <div className="indicator">
                        {deleteResult ?
                            (
                                <AlertTimer time={deleteResult === 'error' ? 3000 : 600}
                                    message={this.state.deleteMsg}
                                    type={deleteResult} showIcon
                                    onHide={deleteResult === 'error' ? function(){} : this.hideSaveTooltip}/>
                            ) : null
                        }
                    </div>
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
    strategyInfo: null
};

StrategyInfo.propTypes = {
    strategyInfo: PropTypes.object,
    closeRightPanel: PropTypes.func
};

module.exports = StrategyInfo;