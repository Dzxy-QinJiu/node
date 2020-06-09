const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/20.
 */
import {Button, Steps, message, Alert} from 'antd';
var rightPanelUtil = require('CMP_DIR/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
import Upload from './upload';
require('./index.less');
const Step = Steps.Step;
import {AntcTable} from 'antc';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';
import {isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';
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
    TABLE_TOP: 40

};
function noop() {}
import {isEqualArray} from 'LIB_DIR/func';
var className = require('classnames');
const steps = [{
    title: Intl.get('common.image.upload', '上传'),
    content: 'First-content',
}, {
    title: Intl.get('common.preview', '预览'),
    content: 'Second-content',
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
            tableHeight: this.calculateTableHeight()
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
            current: 1
        },() => {
            this.changeTableHeight();
        });
    };
    renderFirstStepContent = () => {
        return (
            <div className="first-step-content">
                <Upload
                    isLoading={this.state.isLoading}
                    afterUpload={this.afterUpload}
                    uploadHref={this.props.uploadHref}
                    onItemListImport={this.onItemListImport}
                    uploadActionName={this.props.uploadActionName}
                    importType={this.props.importType}
                    regRules={this.props.regRules}
                />
                <div className="down-load-template">
                    <a data-tracename="点击下载模板" href={this.props.templateHref}>
                        {Intl.get('clue.download.clue.csv', '下载{type}模板',{type: this.props.importType})}
                    </a>
                </div>
            </div>
        );
    };
    doImport =(e) => {
        Trace.traceEvent(e, '确定导入');
        this.setState({
            current: 2,
            isImporting: true
        },() => {
            this.changeTableHeight();
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
        const disabledImportBtn = _.find(this.state.previewList, item => (item.repeat)) || _.isEmpty(this.state.previewList);
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
        if(isResponsiveDisplay().isWebMin) {
            let tableEl = $('.deal-table-container');
            if(tableEl.length) {
                return $(window).height() - tableEl.offset().top - LAYOUT.TABLE_TOP - LAYOUT.BOTTOM_DISTANCE;
            }
        }
        return $(window).height() - LAYOUT.TOP_DISTANCE - LAYOUT.BOTTOM_DISTANCE;
    }
    changeTableHeight = () => {
        var tableHeight = this.calculateTableHeight();
        this.setState({tableHeight});
    };
    renderSecondStepContent = () => {
        const repeatCustomer = _.find(this.state.previewList, item => (item.repeat));
        let columns = this.props.getItemPrevList();
        if(isResponsiveDisplay().isWebMin) {
            columns = _.map(columns, column => {
                if(_.isEmpty(column.width)) {
                    column.width = 200;
                }
                return column;
            });
        }
        return (
            <div className="second-step-content">
                {repeatCustomer ? <div
                    className="import-warning">
                    <Alert type="warning" message={this.props.repeatAlertMessage} showIcon/>
                </div> : null}
                <div className="deal-table-container" style={{height: this.state.tableHeight + LAYOUT.TABLE_TOP}}>
                    <AntcTable
                        dataSource={this.state.previewList}
                        columns={columns}
                        rowKey={this.getRowKey}
                        pagination={false}
                        scroll={{y: this.state.tableHeight}}
                    />
                </div>
                {this.renderImportFooter()}
            </div>
        );

    };
    //不同步骤渲染不同的内容
    renderStepsContent = (current) => {
        var stepContent = null;
        switch (current) {
            case 0:
                stepContent = this.renderFirstStepContent();
                break;
            case 1:
                stepContent = this.renderSecondStepContent();
                break;
            case 2:
                stepContent = this.renderSecondStepContent();
                break;
        }
        return stepContent;
    };
    render() {
        var current = this.state.current;
        var width = LAYOUT.INITIALWIDTH;
        if (current !== 0) {
            width = $(window).width() - LAYOUT.LARGEWIDTH;
        }
        var cls = className('import-step-container',{
            'show-modal': this.props.showFlag,
            'mobile-import-step-container': isResponsiveDisplay().isWebMin
        });
        return (
            <div className={cls}>
                <RightPanel className="import-clue-template-panel white-space-nowrap"
                    showFlag={this.props.showFlag} data-tracename="导入模板"
                    style={{width: width}}
                >
                    <span className="iconfont icon-close clue-import-btn" onClick={this.handleCancel}
                        data-tracename="点击关闭导入面板"></span>
                    <div className="clue-import-detail-wrap" style={{width: width - LAYOUT.SMALLWIDTH}}>
                        <div className="clue-top-title">
                            {this.props.title ? this.props.title : Intl.get('clue.manage.import.clue', '导入{type}',{type: this.props.importType})}
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
    repeatAlertMessage: '',//有重复数据后的提示信息
    regRules: [],//文件类型的校验规则,
    title: null,//头部标题区域
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
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
};
export default ImportTemplate;