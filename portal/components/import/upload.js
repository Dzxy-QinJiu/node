const PropTypes = require('prop-types');
var React = require('react');
import {Upload, Icon, message, Button} from 'antd';
import Trace from 'LIB_DIR/trace';
import {checkFileSizeLimit, checkFileNameAllowRule} from 'PUB_DIR/sources/utils/common-method-util';
var AlertTimer = require('CMP_DIR/alert-timer');
class UploadBtn extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: this.props.isLoading,
            warningMsg: ''
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
        if (info.file.status === 'done') {
            const response = info.file.response;
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-clue'), '上传表格');
            if (_.isArray(response) && response.length) {
                this.props.onItemListImport(response);
            } else {
                this.setState({
                    isLoading: false,
                    warningMsg: Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!',{type: this.props.importType})
                });
            }
            this.props.afterUpload();
        }else if(info.file.status === 'error') {
            const response = info.file.response;
            this.setState({
                isLoading: false,
                warningMsg: response
            });
        }
    };
    checkFileSizeLimit = (fileSize) => {
        var checkObj = checkFileSizeLimit(fileSize);
        if (checkObj.warningMsg){
            this.setState({
                warningMsg: checkObj.warningMsg
            });
        }
        return checkObj.sizeQualified;
    };
    checkFileNameRule = (filename) => {
        var regRules = this.props.regRules;
        var checkObj = checkFileNameAllowRule(filename,regRules);
        if (checkObj.warningMsg){
            this.setState({
                warningMsg: checkObj.warningMsg
            });
        }
        return checkObj.nameQualified;
    };
    checkFileType = (filename,fileSize) => {
        if (!this.checkFileNameRule(filename)){
            return false;
        }
        if (!this.checkFileSizeLimit(fileSize || 0)){
            return false;
        }
        return true;
    };
    beforeUploadFiles = (file) => {
        var fileName = file.name,fileSize = file.size;
        if (this.checkFileType(fileName,fileSize)){
            this.setState({isLoading: true});
            return true;
        }else{
            return false;
        }

    };

    render() {
        var props = {
            name: this.props.uploadActionName,
            action: this.props.uploadHref,
            showUploadList: false,
            onChange: this.handleChange,
            beforeUpload: this.beforeUploadFiles
        };
        var hide = () => {
            this.setState({
                warningMsg: ''
            });
        };


        return (
            <Upload {...props} className="import-clue" data-tracename="上传表格">
                <Button type='primary'>{this.props.uploadTip}{this.state.isLoading ?
                    <Icon type="loading" className="icon-loading"/> : null}</Button>
                <p className="file-tip">{this.props.importFileTips}</p>
                {this.state.warningMsg ? <AlertTimer time={4000}
                    message={this.state.warningMsg}
                    type="error"
                    showIcon
                    onHide={hide}/> : null}
            </Upload>
        );
    }
}
UploadBtn.defaultProps = {
    isLoading: false,
    afterUpload: function() {
    },
    onItemListImport: function() {

    },
    importType: '',
    uploadActionName: '',
    uploadHref: '',
    uploadTip: Intl.get('clue.import.csv', '上传表格'),
    regRules: [],
    importFileTips: Intl.get('clue.and.crm.upload.size','文件大小不要超过10M!')
};
UploadBtn.propTypes = {
    isLoading: PropTypes.bool,
    afterUpload: PropTypes.func,
    onItemListImport: PropTypes.func,
    importType: PropTypes.string,
    uploadActionName: PropTypes.string,
    uploadHref: PropTypes.string,
    uploadTip: PropTypes.string,
    regRules: PropTypes.object,
    importFileTips: PropTypes.string
};

export default UploadBtn;