/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/4/23.
 */
import { Upload, Icon, message } from 'antd';
import { clueEmitter } from 'OPLATE_EMITTER';
import Trace from 'LIB_DIR/trace';

var ClueImport = React.createClass({
    getInitialState() {
        return {
            isLoading: false
        };
    },
    handleChange(info) {
        this.setState({isLoading: true});
        if (info.file.status === 'done') {
            const response = info.file.response;
            Trace.traceEvent(this.getDOMNode(),'点击导入按钮');
            if (_.isArray(response) && response.length) {
                clueEmitter.emit(clueEmitter.IMPORT_CLUE, response);
                this.props.closeClueTemplatePanel();
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入线索失败，请重试!'));
            }
            this.setState({isLoading: false});
        }
    },
    render: function() {
        var props = {
            name: 'clues',
            action: '/rest/clue/upload',
            showUploadList: false,
            onChange: this.handleChange
        };
        return (
            <Upload {...props} className="import-clue">
                {Intl.get('common.import', '导入')} {this.state.isLoading ? <Icon type="loading" className="icon-loading"/> : null}
            </Upload>
        );
    }
});

module.exports = ClueImport;