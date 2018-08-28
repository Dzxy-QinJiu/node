/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/21.
 */
import {Upload, Icon, message, Button} from 'antd';
import {clueEmitter} from 'OPLATE_EMITTER';
import Trace from 'LIB_DIR/trace';
class ClueUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isLoading !== nextProps.isLoading) {
            this.setState({
                isLoading: nextProps.isLoading
            });
        }
    }

    handleChange = (info) => {
        this.setState({isLoading: true});
        if (info.file.status === 'done') {
            const response = info.file.response;
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-clue'), '上传表格');
            if (_.isArray(response) && response.length) {
                clueEmitter.emit(clueEmitter.IMPORT_CLUE, response);
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入线索失败，请重试!'));
            }
            this.props.afterUpload();
        }
    };

    render() {
        var props = {
            name: 'clues',
            action: '/rest/clue/upload',
            showUploadList: false,
            onChange: this.handleChange
        };
        return (
            <Upload {...props} className="import-clue" data-tracename="上传表格">
                <Button type='primary'>{Intl.get('clue.import.csv', '上传表格')}{this.state.isLoading ?
                    <Icon type="loading" className="icon-loading"/> : null}</Button>
            </Upload>
        );
    }
}
ClueUpload.defaultProps = {
    isLoading: false,
    afterUpload: function() {
    }
};
ClueUpload.propTypes = {
    isLoading: React.PropTypes.bool,
    afterUpload: React.PropTypes.func,
};

export default ClueUpload;