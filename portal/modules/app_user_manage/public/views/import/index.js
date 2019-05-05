
const PropTypes = require('prop-types');
var React = require('react');
import {Button, Steps, message, Alert} from 'antd';
var rightPanelUtil = require('CMP_DIR/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
import Upload from './upload';
require('./index.less');
const Step = Steps.Step;
import {AntcTable} from 'antc';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';
import SelectFullWidth from 'CMP_DIR//select-fullwidth';

const SET_TIME_OUT = {
    TRANSITION_TIME: 600,//右侧面板动画隐藏的时间
    LOADING_TIME: 1500//避免在第三步时关闭太快，加上延时展示loading效果
};
const LAYOUT = {
    INITIALWIDTH: 504,
    SMALLWIDTH: 24,
    LARGEWIDTH: 75,
    TOP_DISTANCE: 150,
    BOTTOM_DISTANCE: 90,
    TABLE_TOP: 40,
    ERROR_TIPS_MESSAGE_WIDTH: 110, // 错误信息宽度
    WARN_TIPS_MESSAGE_WIDTH: 10, // 警告信息宽度
};
function noop() {}
import {isEqualArray} from 'LIB_DIR/func';
var className = require('classnames');

const steps = [{
    title: '选择产品',
    content: 'First-content'
},{
    title: Intl.get('common.image.upload', '上传'),
    content: 'Second-content',
}, {
    title: Intl.get('common.preview', '预览'),
    content: 'Third-content',
}, {
    title: Intl.get('common.import', '导入'),
    content: 'Last-content',
}];
class ImportTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,//进度条的步骤
            isLoading: false,//正在上传
            previewList: this.props.previewList,//预览列表
            isImporting: false,//正在导入
            tableHeight: this.calculateTableHeight(),
            selectedAppId: '', // 选择的应用，默认为空
        };
    }

    componentDidMount = () => {
        $(window).on('resize', e => this.changeTableHeight());
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.previewList && !isEqualArray(nextProps.previewList, this.state.previewList)) {
            this.setState({
                previewList: nextProps.previewList
            });
        }
    }
    componentWillUnmount = () => {
        $(window).off('resize', this.changeTableHeight);
    };

    onItemListImport = (list) => {
        this.props.onItemListImport(list);
        this.setState({
            isPreviewShow: true,
        });
    };
    handleCancel = (e) => {
        this.props.closeTemplatePanel();
        setTimeout(() => {
            this.setState({
                current: 0,
                isLoading: false,
                isPreviewShow: false,
                isImporting: false,
            });
            e && e.preventDefault();
        },SET_TIME_OUT.TRANSITION_TIME);
    };
    afterUpload = () => {
        this.setState({
            isLoading: false,
            current: 2
        });
    };

    onSelectedAppChange = (app_id) => {
        this.setState({
            selectedAppId: app_id,
            current: 1
        });
        this.props.getSelectAppId(app_id);
    };

    renderFirstStepContent = () => {
        let appOptions = _.map(this.props.appList, item => <Option key={item.app_id} value={item.app_id} title={item.app_name}>{item.app_name}</Option>);
        return (
            <div className="first-step-content">
                <SelectFullWidth
                    placeholder={Intl.get('leave.apply.select.product', '请选择产品')}
                    optionFilterProp="children"
                    showSearch
                    minWidth={120}
                    onChange={this.onSelectedAppChange}
                    notFoundContent={!appOptions.length ? Intl.get('user.no.app', '暂无应用') : Intl.get('user.no.related.app', '无相关应用')}
                >
                    {appOptions}
                </SelectFullWidth>
            </div>
        );
    };
    renderSecondStepContent = () => {
        return (
            <div className="second-step-content">
                <Upload
                    isLoading={this.state.isLoading}
                    afterUpload={this.afterUpload}
                    uploadHref={this.props.uploadHref + this.state.selectedAppId}
                    onItemListImport={this.onItemListImport}
                    uploadActionName={this.props.uploadActionName}
                    importType={this.props.importType}
                    regRules={this.props.regRules}
                    importFileTips={this.props.importFileTips}
                />
                <div className="down-load-template">
                    <a data-tracename="点击下载模板" href={this.props.templateHref}>
                        {Intl.get('common.download.template.filename', '下载{type}模板',{type: this.props.importType})}
                    </a>
                </div>
            </div>
        );
    };
    doImport =(e) => {
        Trace.traceEvent(e, '确定导入');
        this.setState({
            current: 3,
            isImporting: true
        });
        this.props.doImportAjax(() => {
            setTimeout(() => {
                message.success(Intl.get('clue.customer.import.clue.suceess', '导入{type}成功',{type: this.props.importType}));
                this.handleCancel();
            },SET_TIME_OUT.LOADING_TIME);
        },(errMsg) => {
            this.setState({isImporting: false});
            message.error(errMsg || Intl.get('clue.customer.import.clue.failed', '导入{type}失败',{type: this.props.importType}));
        });
    };
    renderImportFooter = () => {
        let errors = [];
        _.each(this.state.previewList, (item) => {
            if (item.errors) {
                errors = _.concat(errors, item.errors);
            }
        });
        errors = this.uniqueArray(errors);
        let length = _.get(errors, 'length');
        let noMatchCustomer = _.find(errors, item => item.field === 'customer_name');
        let disabledImportBtn = false;
        if (length) {
            if (length > 1) {
                disabledImportBtn = true;
            } else{
                if (noMatchCustomer) {
                    disabledImportBtn = false;
                } else {
                    disabledImportBtn = true;
                }
            }
        } else if (!_.get(this.state.previewList, 'length')) {
            disabledImportBtn = true;
        }
        return (
            <div className="prev-foot">
                {this.state.isImporting ? <div className="is-importing">
                    <Spinner/>
                </div> : <Button type="primary" onClick={this.doImport} disabled={disabledImportBtn}>
                    {Intl.get('common.import', '导入')}
                </Button>}
                <Button type="ghost" onClick={this.handleCancel} data-tracename="取消导入">
                    {Intl.get('common.cancel', '取消')}
                </Button>
            </div>
        );
    };
    calculateTableHeight = () => {
        return $(window).height() - LAYOUT.TOP_DISTANCE - LAYOUT.BOTTOM_DISTANCE;
    }
    changeTableHeight = () => {
        var tableHeight = this.calculateTableHeight();
        this.setState({tableHeight});
    };

    uniqueArray = (arr) => {
        let unique = []; // 去重后的数组
        for(let item1 of arr){ //循环arr数组对象的内容
            let flag = true; //建立标记，判断数据是否重复，true为不重复
            for(let item2 of unique){ // 循环新数组的内容
                if(item1.field === item2.field && item1.data === item2.data){ //让arr数组对象的内容与新数组的内容作比较，相同的话，改变标记为false
                    flag = false;
                }
            }
            if(flag){ //判断是否重复
                unique.push(item1); //不重复的放入新数组。
            }
        }
        return unique;
    };

    renderThirdStepContent = () => {
        let errors = [];
        _.each(this.state.previewList, (item) => {
            if (item.errors) {
                errors = _.concat(errors, item.errors);
            }
        });
        errors = this.uniqueArray(errors);
        let length = _.get(errors, 'length');
        let tipsMessage = [];
        let noMatchCustomer = _.find(errors, item => item.field === 'customer_name');
        let height = this.state.tableHeight + LAYOUT.TABLE_TOP;
        let tableHeight = this.state.tableHeight;
        if (length) {
            if (length > 1) {
                tipsMessage.push(Intl.get('user.import.red.tips', '红色标示数据不符合规则或是已存在，请修改数据后重新导入，或删除不符合规则的数据后直接导入。'));
                if (noMatchCustomer) {
                    tipsMessage.push(Intl.get('user.import.yellow.tips', '黄色标示系统未找到对应的客户，可以继续导入，导入后需要自行设置客户。'));
                }
                height -= (LAYOUT.ERROR_TIPS_MESSAGE_WIDTH + LAYOUT.WARN_TIPS_MESSAGE_WIDTH);
                tableHeight -= (LAYOUT.ERROR_TIPS_MESSAGE_WIDTH + LAYOUT.WARN_TIPS_MESSAGE_WIDTH);
            } else if (length === 1) {
                if (noMatchCustomer) {
                    tipsMessage.push(Intl.get('user.import.yellow.tips', '黄色标示系统未找到对应的客户，可以继续导入，导入后需要自行设置客户。'));
                } else {
                    tipsMessage.push(Intl.get('user.import.red.tips', '红色标示数据不符合规则或是已存在，请修改数据后重新导入，或删除不符合规则的数据后直接导入。'));
                    height -= LAYOUT.ERROR_TIPS_MESSAGE_WIDTH;
                    tableHeight -= LAYOUT.ERROR_TIPS_MESSAGE_WIDTH;
                }
            }
        }
        return (
            <div className="third-step-content">
                {length ? <div className="import-warning">
                    {
                        length > 1 ? (
                            <div>
                                <Alert type="error" message={'1.' + _.get(tipsMessage, [0])}/>
                                <div className="warning-rule-decription">
                                    <div>{Intl.get('user.import.username.rule', '用户名：长度为1-50个字母、数字、横线或下划线组成的字符串')}</div>
                                    <div>{Intl.get('user.import.phone.rule', '手机：11位手机号')}</div>
                                    <div>{Intl.get('user.import.email.rule', '邮箱：如 12345678@qq.com')}</div>
                                </div>
                                <Alert type="warning" message={'2.' + _.get(tipsMessage, [1])}/>
                            </div>
                        ) : (
                            noMatchCustomer ? (
                                <Alert type="warning" message={'1.' + _.get(tipsMessage, [0])}/>
                            ) : (
                                <div>
                                    <Alert type="error" message={'1.' + _.get(tipsMessage, [0])}/>
                                    <div className="warning-rule-decription">
                                        <div>{Intl.get('user.import.username.rule', '用户名：长度为1-50个字母、数字、横线或下划线组成的字符串')}</div>
                                        <div>{Intl.get('user.import.phone.rule', '手机：11位手机号')}</div>
                                        <div>{Intl.get('user.import.email.rule', '邮箱：如 12345678@qq.com')}</div>
                                    </div>
                                </div>
                            )
                        )
                    }
                </div> : null}
                <div className="deal-table-container" style={{height: height}}>
                    <AntcTable
                        dataSource={this.state.previewList}
                        columns={this.props.getItemPrevList()}
                        rowKey={this.getRowKey}
                        pagination={false}
                        scroll={{y: tableHeight}}
                    />
                </div>
                {this.renderImportFooter()}
            </div>
        );

    };
    //不同步骤渲染不同的内容
    renderStepsContent = (current) => {
        let stepContent = null;
        switch (current) {
            case 0:
                stepContent = this.renderFirstStepContent();
                break;
            case 1:
                stepContent = this.renderSecondStepContent();
                break;
            case 2:
                stepContent = this.renderThirdStepContent();
                break;
            case 3:
                stepContent = this.renderThirdStepContent();
                break;
        }
        return stepContent;
    };
    render() {
        var current = this.state.current;
        var width = LAYOUT.INITIALWIDTH;
        if (current !== 0 && current !== 1) {
            width = $(window).width() - LAYOUT.LARGEWIDTH;
        }
        var cls = className('import-step-container',{
            'show-modal': this.props.showFlag
        });
        return (
            <div className={cls}>
                <RightPanel className="import-template-panel white-space-nowrap"
                    showFlag={this.props.showFlag} data-tracename="导入模板"
                    style={{width: width}}
                >
                    <span className="iconfont icon-close clue-import-btn" onClick={this.handleCancel}
                        data-tracename="点击关闭导入面板"></span>
                    <div className="import-detail-wrap" style={{width: width - LAYOUT.SMALLWIDTH}}>
                        <div className="clue-top-title">
                            {Intl.get('clue.manage.import.clue', '导入{type}',{type: this.props.importType})}
                        </div>
                        <div className="import-title-top">
                            <Steps current={current}>
                                {steps.map(item => <Step key={item.title} title={item.title}/>)}
                            </Steps>
                        </div>
                        <div className="import-detail-container">
                            {this.renderStepsContent(current)}
                        </div>
                    </div>
                </RightPanel>
            </div>
        );
    }
}

ImportTemplate.defaultProps = {
    uploadActionName: '',//导入类型的英文描述
    uploadHref: '',//导入的url
    importType: '',//导入类型的中文描述
    templateHref: '',//下载导入模板的url
    //todo 导入的表格传入时，一定把标识重复的字段设置为repeat，在重复item的名称上加类名时，统一加成repeat-item-name
    previewList: [],//展示的内容
    showFlag: false,//控制导入面板是否展示
    getItemPrevList: noop,//获取要展示的列
    closeTemplatePanel: noop,//关闭面板的回调
    onItemListImport: noop,//导入时的函数
    doImportAjax: noop,//确认导入时的函数
    getSelectAppId: noop, // 获取选择的应用id
    repeatAlertMessage: '',//有重复数据后的提示信息
    regRules: [],//文件类型的校验规则,
    importFileTips: Intl.get('clue.and.crm.upload.size','文件大小不要超过10M!'), // 导入文件的提示信息
    appList: [] // 应用列表
};
ImportTemplate.propTypes = {
    uploadActionName: PropTypes.string,
    uploadHref: PropTypes.string,
    importType: PropTypes.string,
    templateHref: PropTypes.string,
    showFlag: PropTypes.bool,
    closeTemplatePanel: PropTypes.func,
    previewList: PropTypes.object,
    onItemListImport: PropTypes.func,
    doImportAjax: PropTypes.func,
    getItemPrevList: PropTypes.func,
    repeatAlertMessage: PropTypes.string,//有重复数据后的提示信息
    regRules: PropTypes.object,
    importFileTips: PropTypes.string,
    appList: PropTypes.Array, // 应用列表
    getSelectAppId: PropTypes.func,
};
export default ImportTemplate;