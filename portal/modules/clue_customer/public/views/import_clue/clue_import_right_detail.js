/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/20.
 */
import {Button, Steps, Icon, Upload, message, Modal} from 'antd';
var rightPanelUtil = require('CMP_DIR/rightPanel');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
import ClueImport from './clue-import';
import {clueEmitter} from 'OPLATE_EMITTER';
import Trace from 'LIB_DIR/trace';
import BasicData from '../right_panel_top';
require('../../css/clue_import.less');
const Step = Steps.Step;
import {AntcTable} from 'antc';


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
        e.preventDefault();
        this.props.closeClueTemplatePanel();
    };
    handleChange = (info) => {
        this.setState({isLoading: true});
        if (info.file.status === 'done') {
            const response = info.file.response;
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-clue'), '点击导入按钮');
            if (_.isArray(response) && response.length) {
                clueEmitter.emit(clueEmitter.IMPORT_CLUE, response);
                // this.props.closeClueTemplatePanel();
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入线索失败，请重试!'));
            }
            this.setState({
                isLoading: false,
                current: 2
            });
        }
    };
    renderFirstStepContent = () => {
        var props = {
            name: 'clues',
            action: '/rest/clue/upload',
            showUploadList: false,
            onChange: this.handleChange
        };
        return (
            <div className="first-step-content">
                <Upload {...props} className="import-clue">
                    <Button type='primary'>{Intl.get('clue.import.csv', '上传表格')}{this.state.isLoading ?
                        <Icon type="loading" className="icon-loading"/> : null}</Button>
                </Upload>
            </div>
        );
    };
    renderImportModalFooter = () => {
        const repeatCustomer = _.find(this.state.previewList, item => (item.repeat));
        const loading = this.state.isImporting || false;
        return (
            <div>
                <Button type="ghost" onClick={this.cancelImport}>
                    {Intl.get('common.cancel', '取消')}
                </Button>
                <Button type="primary" onClick={this.doImport} loading={loading} disabled={repeatCustomer}>
                    {Intl.get('common.import', '导入')}
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
                                <Button className="order-btn-class" icon="delete"
                                    onClick={_this.deleteDuplicatImportClue.bind(_this, index)}
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
            <div className="clue-prev-list">
                {repeatCustomer ? <div
                    className="import-warning">{Intl.get('clue.repeat.delete', '存在和系统中重复的线索名或联系方式，已用红色标出，请先在上方预览表格中删除这些记录，然后再导入')}</div> : null}
                <AntcTable
                    dataSource={this.state.previewList}
                    columns={this.getCluePrevList()}
                    rowKey={this.getRowKey}
                    pagination={false}
                />
                {this.renderImportModalFooter()}
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
        }
        return stepContent;
    };

    render() {
        var current = this.state.current;
        var width = '504';
        if (current !== 1) {
            width = $(window).width() - 75;
        }
        return (
            <RightPanel className="import-clue-template-panel white-space-nowrap"
                showFlag={this.props.showFlag} data-tracename="导入线索模板"
                style={{width: width}}
            >
                <span className="iconfont icon-close clue-import-btn" onClick={this.props.closeClueTemplatePanel}
                    data-tracename="点击关闭导入线索面板"></span>
                <div className="clue-import-detail-wrap" style={{width: width - 24}}>
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
    }
};
ClueImportTemplate.propTypes = {
    refreshClueList: React.PropTypes.func,
    showFlag: React.PropTypes.bool,
    closeClueTemplatePanel: React.PropTypes.func,
};
export default ClueImportTemplate;