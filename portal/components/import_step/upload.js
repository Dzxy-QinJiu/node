const PropTypes = require('prop-types');
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/21.
 */
import {Upload, Icon, message, Button} from 'antd';
import Trace from 'LIB_DIR/trace';
import {REGFILESSIZERULESRULES} from 'PUB_DIR/sources/utils/consts';
class UploadBtn extends React.Component {
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
        if (info.file.status === 'done') {
            const response = info.file.response;
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-clue'), '上传表格');
            if (_.isArray(response) && response.length) {
                this.props.onItemListImport(response);
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!',{type: this.props.importType}));
            }
            this.props.afterUpload();
        }
    };
    checkFileSizeLimit = (fileSize) => {
        var sizeQualified = true;
        _.forEach(REGFILESSIZERULESRULES,(item) => {
            if (!_.isUndefined(item.minValue)){
                if (fileSize === item.minValue) {
                    message.warning(item.messageTips);
                    sizeQualified = false;
                    return false;
                }
            }
            if (_.isUndefined(item.minValue) && item.maxValue){
                if (fileSize > item.maxValue) {
                    message.warning(item.messageTips);
                    sizeQualified = false;
                    return false;
                }
            }
        });
        return sizeQualified;
    };
    checkFileNameRule = (filename) => {
        var nameQualified = true, regRules = this.props.regRules;
        if (regRules.length){
            _.forEach(regRules,(item) => {
                if (filename.indexOf(item.value) < 0){
                    message.warning(item.messageTips);
                    nameQualified = false;
                    return false;
                }
            });
        }
        return nameQualified;
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

        return (
            <Upload {...props} className="import-clue" data-tracename="上传表格">
                <Button type='primary'>{this.props.uploadTip}{this.state.isLoading ?
                    <Icon type="loading" className="icon-loading"/> : null}</Button>
                <p className="file-tip">{Intl.get('clue.and.crm.upload.size','文件大小不要超过10M!')}</p>
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
    regRules: []

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
};

export default UploadBtn;