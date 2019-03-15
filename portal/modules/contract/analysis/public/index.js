/**
 * 合同分析
 */

import './css/style.less';
import {LAYOUT_CONSTANTS, CONTRACT_DEFAULT_PAGESIZE, CONTRACT_VIEW_AUTH} from './consts';
import {Row, Col, Input, message} from 'antd';
import FilterPanel from './view/filter-panel';
import FilterSelector from './view/filter-selector';
import TableList from './view/table-list';
import TableContent from './view/table-content';
import AnalysisStore from './store/analysis-store';
import AnalysisAction from './action/analysis-action';
var userData = require('../../../../public/sources/user-data');
const userInfo = userData.getUserData();
import ModalIntro from 'CMP_DIR/modal-intro';
const LAYOUT_CONSTS = require('LIB_DIR/consts').LAYOUT;
const {setWebsiteConfig, getLocalWebsiteConfig} = require('LIB_DIR/utils/websiteConfig');

/**websiteConfig数据结构
 * personnelSetting: {
 *  haveSeenIntro: {//是否看过引导
 *   contractAnalysis: [boolean] //合同分析模块是否看过引导  
 *  }
 * }
 */
const personnelSetting = getLocalWebsiteConfig() || {};
//是否看过合同分析的引导,看过就不再展示
const haveSeenIntro = personnelSetting.haveSeenIntro && personnelSetting.haveSeenIntro.contractAnalysis;
//窗口改变的事件emitter
const resizeEmitter = require('PUB_DIR/sources/utils/emitters').resizeEmitter;
const TOP_NAV_HEIGHT = 64;//顶部导航高度

class ContractAnalysis extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...AnalysisStore.getState(),
            id: null,
            contentHeight: $('.row>.col-xs-10') ? ($('.row>.col-xs-10').height() - LAYOUT_CONSTS.TOP_NAV - LAYOUT_CONSTS.PADDING_BOTTOM) : 0,
            tableData: null,
            status: CONTRACT_VIEW_AUTH.SELF.value,//展示权限 self仅自己可见 all全部
            loading: false,
            loadingMore: false,
            tableList: [],
            tableTotal: '',
            tableInfoMap: {},
            getTablelistLoading: false,
            getTablelistErrorMsg: '',
            saveTableInfoLoading: false,
            saveTableInfoErrorMsg: '',
            getTableInfoLoading: false,
            getTableInfoErrorMsg: '',
            errorMsg: '',
            contractType: 'contract',//合同类型 [合同|回款|费用]
            fieldParamObj: {//已保存的表格参数项
                filterList: [],//筛选项
                colList: [],//列字段
                rowList: [],//行字段
                valueList: [],//值
            },
            tableName: '',
            showIntro: true
        };
        this.onStoreChange = this.onStoreChange.bind(this);
    }

    componentDidMount() {
        //窗口大小改变事件
        resizeEmitter.on(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
        AnalysisStore.listen(this.onStoreChange);
        this.getTableList();
    }

    onStoreChange() {
        this.setState(
            AnalysisStore.getState()
        );
    }

    componentWillUnmount() {
        //卸载窗口大小改变事件
        resizeEmitter.removeListener(resizeEmitter.WINDOW_SIZE_CHANGE, this.resizeHandler);
    }

    //窗口缩放时候的处理函数
    resizeHandler = (data) => {
        this.setState({
            contentHeight: data.height - TOP_NAV_HEIGHT
        });
    }
    //获取已保存的表格列表
    getTableList(sortId) {
        let params = {
            sort_field: 'create_date',
            sort_id: '',
            page_size: CONTRACT_DEFAULT_PAGESIZE
        };
        if (sortId) {
            params.sort_id = sortId;
        }
        AnalysisAction.setSortId(sortId || '');
        AnalysisAction.getTableList(params);
    }

    //获取table行、列、值字段
    getTableInfo(params) {
        AnalysisAction.getTableInfo(params)
            .then(() => {
                //表格字段查询完成后获取筛选区域的高度存放到state中
                AnalysisAction.setSelectorHeight($('.filter-selector-container').height());
                this.handleTableData(this.processParams(this.state.fieldParamObj), this.state.contractType);
            });
    }

    //处理保存、预览所需参数
    processParams(fieldParamObj) {
        const mapList = list => list.map(field => ({
            item: field.value,
            item_type: field.fieldType
        }));
        let paramsObj = {
            'rows': mapList(fieldParamObj.rowList),
            'cols': mapList(fieldParamObj.colList),
            'metrics': fieldParamObj.valueList.map(field => ({
                item: field.calcType.value + '(' + field.value + ')',
                item_type: field.fieldType,
                item_value: field.text
            })),
            'filters': fieldParamObj.filterList.map(filter => {
                let obj = {
                    item_type: filter.fieldType,
                    item: filter.value
                };
                if (filter.fieldType === 'date' || filter.fieldType === 'num') {
                    obj.query_type = 'range';
                } else {
                    obj.query_type = 'contains';
                }
                return obj;
            })
        };
        return paramsObj;
    }

    //处理点击预览按钮
    onPreview(fieldParamObj, contractType) {
        this.setState({
            fieldParamObj,
            contractType
        });
        this.handleTableData(this.processParams(fieldParamObj), contractType);
    }

    //根据字段获取表格数据
    handleTableData(params, contractType) {
        switch (contractType) {
            case 'contract':
                AnalysisAction.getContractData(params);
                break;
            case 'repayment':
                AnalysisAction.getRepaymentData(params);
                break;
            case 'cost':
                AnalysisAction.getCostData(params);
                break;
        }
    }

    //处理点击保存
    onSave({fieldParamObj, status, type}) {
        if (!this.state.tableName) {
            message.error(Intl.get('contract.analysis.error.tip', '请填写分析表名称'));
            return;
        }
        let params = this.processParams(fieldParamObj);
        params.view_name = this.state.tableName;
        params.status = status;
        params.user_id = userInfo.user_id;
        params.user_name = userInfo.user_name;
        params.view_type = type;
        //修改已有的表格
        if (this.state.id) {
            params.id = this.state.id;
        }
        AnalysisAction.saveTableInfo(params)
            .then(() => {
                message.success(Intl.get('common.save.success', '保存成功'));
                this.getTableList();
            }, ({errorMsg}) => {
                message.error(errorMsg || Intl.get('common.save.failed', '保存失败'));
            });
    }

    //处理筛选条件变化
    handleFilterChange(params) {
        let filters = params.map(filter => {
            let obj = {
                item_type: filter.fieldType,
                item: filter.value
            };
            if (filter.fieldType === 'date' || filter.fieldType === 'num') {
                obj.query_type = 'range';
                $.extend(obj, {...filter.params});
            } else {
                obj.query_type = 'contains';
                obj.contains = (filter.params && filter.params.item) && [filter.params.item];
            }
            return obj;
        });
        this.handleTableData($.extend(true, {},
            this.processParams(this.state.fieldParamObj),
            {filters, contractType: this.state.contractType}
        ), this.state.contractType);
    }

    handleTableClick(tableItem) {
        this.getTableInfo({id: tableItem.id});
    }

    handleTableAdd() {
        AnalysisAction.resetState();
    }

    handleNameChange(e) {
        const tableName = e.target.value;
        this.setState({
            tableName
        });
    }

    handleHideIntro() {
        this.setState({
            showIntro: false
        }, () => {
            setWebsiteConfig({
                haveSeenIntro: {
                    contractAnalysis: true
                }
            });
        });
    }

    render() {
        var commonIntroModalLayout = {
            //展示孔比原图标要变化的宽度
            holeGapWidth: -50,
            //展示孔比原图标要变化的高度
            holeGapHeight: 16,
            //展示孔展示位置比原图标演示变化的左边距
            holeGapLeft: -170,
            //展示孔展示位置比原图标演示变化的上边距
            holeGapTop: 12,
            //提示区域展示位置比原图标展示变化的左边距
            tipAreaLeft: 70,
            //提示区域展示位置比原图标展示变化的上边距
            tipAreaTop: -50,
        };
        return (
            <div className="contract-analysis-container">
                <div className="dashboard-content">
                    <Row gutter={2}>
                        <Col className="gutter-row" span={4}>
                            <TableList
                                onClick={this.handleTableClick.bind(this)}
                                onAdd={this.handleTableAdd.bind(this)}
                                onLoad={this.getTableList.bind(this)}
                                tableListResult={{
                                    data: this.state.tableList,
                                    total: this.state.tableTotal,
                                    loading: !this.state.sortId && this.state.getTablelistLoading,
                                    errorMsg: this.state.getTablelistErrorMsg,
                                    loadingMore: this.state.sortId && this.state.getTablelistLoading
                                }}
                                style={{height: this.state.contentHeight}}
                            />
                        </Col>
                        <Col className="table-container" span={13}>
                            <div className="title-wrapper">
                                <div className="table-title">
                                    <Input
                                        value={this.state.tableName}
                                        placeholder={Intl.get('contract.analysis.title.placeholder', '新的分析，请再次输入标题')}
                                        onChange={this.handleNameChange.bind(this)}
                                    />
                                </div>
                            </div>
                            <FilterSelector
                                filterList={this.state.fieldParamObj.filterList}
                                onChange={this.handleFilterChange.bind(this)}
                            />
                            <div className="table-content-wrapper">
                                <TableContent
                                    style={{height: this.state.contentHeight - LAYOUT_CONSTANTS.TOP - this.state.selectorHeight}}
                                    valueList={this.state.fieldParamObj.valueList}
                                    tableDataResult={{
                                        data: this.state.tableData,
                                        loading: this.state.loading || this.state.getTableInfoLoading,
                                        errorMsg: this.state.errorMsg || this.state.getTableInfoErrorMsg
                                    }}
                                />
                            </div>
                        </Col>
                        <Col className="gutter-row" span={7}>
                            <FilterPanel
                                ref={ref => this.filterPanelRef = ref}
                                style={{height: this.state.contentHeight - LAYOUT_CONSTANTS.NAV_TOP}}
                                height={this.state.contentHeight}
                                disableSave={
                                    this.state.loading ||
                                    !this.state.tableData ||
                                    this.state.tableData.length === 0 ||
                                    this.state.saveTableInfoLoading
                                }
                                onPreview={this.onPreview.bind(this)}
                                onSave={this.onSave.bind(this)}
                                fieldParamObj={this.state.fieldParamObj}
                                contractType={this.state.contractType}
                                status={this.state.status}
                            />
                        </Col>
                    </Row>
                    {/*暂时将引导的功能去掉*/}
                    {this.filterPanelRef && this.state.showIntro && !haveSeenIntro && false ? <ModalIntro
                        introModalLayout={commonIntroModalLayout}
                        $introElement={$(ReactDOM.findDOMNode(this.filterPanelRef)).find('.all-field-container')}
                        handleOnclickHole={this.handleHideIntro.bind(this)}
                        hideModalIntro={this.handleHideIntro.bind(this)}
                        message={Intl.get('contract.introTip', '拖动字段到行、列、筛选条件')}
                    /> : null}
                </div>
                {/* <GeminiScrollBar>
                 </GeminiScrollBar> */}
            </div>
        );
    }
}

module.exports = ContractAnalysis;