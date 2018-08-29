const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/20.
 */
import {Button, Steps, message, Modal, Alert} from 'antd';
var rightPanelUtil = require('CMP_DIR/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
import ClueUpload from './clue_upload';
import {clueEmitter} from 'OPLATE_EMITTER';
require('../../css/clue_import.less');
const Step = Steps.Step;
import {AntcTable} from 'antc';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';
const SET_TIME_OUT = {
    TRANSITION_TIME: 600,//右侧面板动画隐藏的时间
    LOADING_TIME: 1500//避免在第三步时关闭太快，加上延时展示loading效果
};
const LAYOUT = {
    INITIALWIDTH: 504,
    SMALLWIDTH: 24,
    LARGEWIDTH: 75
};


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
class ClueImportTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 1,//进度条的步骤
            isLoading: false,//正在上传
            previewList: [],//预览列表
            isImporting: false//正在导入
        };
    }
    componentDidMount = () => {
        clueEmitter.on(clueEmitter.IMPORT_CLUE, this.onClueImport);
    };
    componentWillUnmount = () => {
        clueEmitter.removeListener(clueEmitter.IMPORT_CLUE, this.onClueImport);
    };

    onClueImport = (list) => {
        this.setState({
            isPreviewShow: true,
            previewList: list,
        });
    };
    handleCancel = (e) => {
        this.props.closeClueTemplatePanel();
        setTimeout(() => {
            this.setState({
                current: 1,
                isLoading: false,
                previewList: [],
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
    renderFirstStepContent = () => {
        return (
            <div className="first-step-content">
                <ClueUpload
                    isLoading={this.state.isLoading}
                    afterUpload={this.afterUpload}
                />
                <div className="down-load-template">
                    <a data-tracename="点击下载线索模板" href="/rest/clue/download_template">{Intl.get('clue.download.clue.csv', '下载导入线索表格')}</a>
                </div>
            </div>
        );
    };
    doImport =(e) => {
        Trace.traceEvent(e, '确定导入线索');
        this.setState({
            current: 3,
            isImporting: true
        });
        $.ajax({
            url: '/rest/clue/confirm/upload/' + true,
            dataType: 'json',
            type: 'get',
            async: false,
            success: (data) => {
                setTimeout(() => {
                    message.success(Intl.get('clue.customer.import.clue.suceess', '导入线索成功'));
                    this.handleCancel();
                    this.props.getClueList();
                },SET_TIME_OUT.LOADING_TIME);
            },
            error: (errorMsg) => {
                this.setState({isImporting: false});
                message.error(Intl.get('clue.customer.import.clue.failed', '导入线索失败'));
            }
        });
    };
    renderImportFooter = () => {
        const repeatCustomer = _.find(this.state.previewList, item => (item.repeat));
        return (
            <div className="prev-foot">
                {this.state.isImporting ? <div className="is-importing">
                    <Spinner/>
                </div> : <Button type="primary" onClick={this.doImport} disabled={repeatCustomer}>
                    {Intl.get('common.import', '导入')}
                </Button>}
                <Button type="ghost" onClick={this.handleCancel} data-tracename="取消导入线索">
                    {Intl.get('common.cancel', '取消')}
                </Button>
            </div>
        );
    };
    //删除重复的线索
    deleteDuplicatImportClue = (index) => {
        var _this = this;
        $.ajax({
            url: '/rest/clue/repeat/delete/' + index,
            dataType: 'json',
            type: 'delete',
            success: function(result) {
                if (result && result.result === 'success') {
                    _this.state.previewList.splice(index, 1);
                    _this.setState({
                        previewList: _this.state.previewList
                    });
                } else {
                    message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败'));
                }
            },
            error: function(errorMsg) {
                message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败') || errorMsg);
            }
        });
    };
    getCluePrevList = () => {
        var _this = this;
        let previewColumns = [
            {
                title: Intl.get('clue.customer.clue.name', '线索名称'),
                dataIndex: 'name',
                render: function(text, record, index) {
                    var cls = record.repeat ? 'repeat-clue-name' : '';
                    return (
                        <span className={cls}>
                            {record.name}
                        </span>
                    );
                }
            },
            {
                title: Intl.get('call.record.contacts', '联系人'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].name : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('common.phone', '电话'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].phone : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('common.email', '邮箱'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].email : null}</span>
                        );
                    }
                }
            },
            {
                title: 'QQ',
                render: function(text, record, index) {
                    if (_.isArray(record.contacts) && _.isArray(record.contacts[0].qq)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].qq[0] : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('crm.sales.clue.source', '线索来源'),
                dataIndex: 'clue_source',
            }, {
                title: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                dataIndex: 'access_channel',
            }, {
                title: Intl.get('crm.sales.clue.descr', '线索描述'),
                dataIndex: 'source',
            }, {
                title: 'IP',
                dataIndex: 'source_ip',
            }, {
                title: Intl.get('common.operate', '操作'),
                width: '60px',
                render: (text, record, index) => {
                    //是否在导入预览列表上可以删除
                    const isDeleteBtnShow = this.state.isPreviewShow && record.repeat;
                    return (
                        <span className="cus-op">
                            {isDeleteBtnShow ? (
                                <i className="order-btn-class iconfont icon-delete "
                                    onClick={_this.deleteDuplicatImportClue.bind(_this, index)}
                                    data-tracename="删除重复线索"
                                    title={Intl.get('common.delete', '删除')}/>
                            ) : null}
                        </span>
                    );
                }
            }
        ];
        return previewColumns;
    };
    renderSecondStepContent = () => {
        const repeatCustomer = _.find(this.state.previewList, item => (item.repeat));
        return (
            <div className="second-step-content">
                {repeatCustomer ? <div
                    className="import-warning">
                    <Alert type="warning" message={Intl.get('clue.repeat.delete', '存在和系统中重复的线索名或联系方式，已用红色标出，请先在上方预览表格中删除这些记录，然后再导入')} showIcon/>
                </div> : null}
                <AntcTable
                    dataSource={this.state.previewList}
                    columns={this.getCluePrevList()}
                    rowKey={this.getRowKey}
                    pagination={false}
                />
                {this.renderImportFooter()}
            </div>
        );

    };
    //不同步骤渲染不同的内容
    renderStepsContent = (current) => {
        var stepContent = null;
        switch (current) {
            case 1:
                stepContent = this.renderFirstStepContent();
                break;
            case 2:
                stepContent = this.renderSecondStepContent();
                break;
            case 3:
                stepContent = this.renderSecondStepContent();
                break;
        }
        return stepContent;
    };
    render() {
        var current = this.state.current;
        var width = LAYOUT.INITIALWIDTH;
        if (current !== 1) {
            width = $(window).width() - LAYOUT.LARGEWIDTH;
        }
        return (
            <RightPanel className="import-clue-template-panel white-space-nowrap"
                showFlag={this.props.showFlag} data-tracename="导入线索模板"
                style={{width: width}}
            >
                <span className="iconfont icon-close clue-import-btn" onClick={this.handleCancel}
                    data-tracename="点击关闭导入线索面板"></span>
                <div className="clue-import-detail-wrap" style={{width: width - LAYOUT.SMALLWIDTH}}>
                    <div className="clue-top-title">
                        {Intl.get('clue.manage.import.clue', '导入线索')}
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
        );
    }
}

ClueImportTemplate.defaultProps = {
    refreshClueList: function() {
    },
    showFlag: false,
    closeClueTemplatePanel: function() {
    },
    getClueList: function() {

    }
};
ClueImportTemplate.propTypes = {
    refreshClueList: PropTypes.func,
    showFlag: PropTypes.bool,
    closeClueTemplatePanel: PropTypes.func,
    getClueList: PropTypes.func
};
export default ClueImportTemplate;