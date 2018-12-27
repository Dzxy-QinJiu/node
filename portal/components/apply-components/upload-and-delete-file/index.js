/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/24.
 */
require('./index.less');
import {Button, Icon, message,Upload} from 'antd';
import AlertTimer from 'CMP_DIR/alert-timer';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Trace from 'LIB_DIR/trace';

class UploadAndDeleteFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpLoading: false,
            fileList: this.props.uploadFileArrs,
            deleteResult: {
                result: '',
                delId: '',//删除申请的id
                errorMsg: '',//删除失败后的提示
            },
        };
    }

    componentDidMount() {

    }
    afterUpload = () => {
        this.setState({
            isUpLoading: false,
        });
    };
    handleChange = (info) => {
        this.setState({isUpLoading: true});
        const response = info.file.response;
        if (info.file.status === 'done') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-reportsend'), '上传报告成功');
            if (response) {
                var fileList = this.state.fileList;
                //上传成功
                this.setState({
                    fileList: fileList.concat(response)
                },() => {
                    _.isFunction(this.props.setUpdateFiles) && this.props.setUpdateFiles(this.state.fileList);
                });
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));
            }

        } else if (info.file.status === 'error') {
            message.error(_.isString(response) ? response : Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));

        }
        this.afterUpload();

    };
    onRemove = (file) => {
        this.setState((state) => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            };
        });
        this.props.fileRemove(file);
    };
    beforeUpload = (file) => {
        // this.setState(state => ({
        //     fileList: [...state.fileList, file],
        // }));
        _.isFunction(this.props.beforeUpload) && this.props.beforeUpload(file);
        return false;
    };
    handleDeleteFile = (fileDirId, fileId) => {
        var submitObj = {
            file_dir_id: fileDirId,
            file_id: fileId
        };
        var deleteResult = this.state.deleteResult;
        deleteResult.result = 'loading';
        deleteResult.delId = fileId;
        deleteResult.errorMsg = '';
        this.setState({
            deleteResult: deleteResult
        });
        $.ajax({
            url: '/rest/applyapprove/delete',
            dataType: 'json',
            type: 'delete',
            data: submitObj,
            success: (data) => {
                //删除成功了之后
                deleteResult.result = 'success';
                deleteResult.delId = '';
                deleteResult.errorMsg = '';
                //把state上之前保存上传的文件的数组中删除这个已经上传过的
                var fileList = this.state.fileList;
                fileList = _.filter(fileList, item => item.file_id !== fileId);
                this.setState({
                    deleteResult: deleteResult,
                    fileList: fileList
                },() => {
                    _.isFunction(this.props.setUpdateFiles) && this.props.setUpdateFiles(this.state.fileList);
                });
            },
            error: (errorMsg) => {
                deleteResult.result = 'error';
                deleteResult.delId = '';
                deleteResult.errorMsg = errorMsg || Intl.get('failed.delete.apply.load.approve', '删除文件失败！');
                this.setState({
                    deleteResult: deleteResult
                });
            }
        });
    };

    render() {
        var props = {
            name: 'reportsend',
            multiple: true,
            action: '/rest/reportsend/upload',
            showUploadList: false,
            onChange: this.handleChange,
            onRemove: this.onRemove
        };
        var detailInfoObj = this.props.detailInfoObj;
        var showOperateBtn = true;
        if(!_.isEmpty(detailInfoObj)){
            props.data = detailInfoObj.id;
            if (detailInfoObj.status !== 'ongoing'){
                showOperateBtn = false;
            }
        }
        var fileList = this.state.fileList;
        if (_.isFunction(this.props.beforeUpload)){
            props.beforeUpload = this.beforeUpload;
            props.fileList = fileList;
        }

        return (
            <div className="upload-wrap">
                {_.map(fileList, (fileItem) => {
                    const reqData = {
                        file_dir_id: fileItem.file_dir_id,
                        file_id: fileItem.file_id,
                        file_name: fileItem.file_name,
                    };
                    return (
                        <div className="upload-file-name">
                            {hasPrivilege('DOCUMENT_DOWNLOAD') ?
                                <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileItem.file_name}</a> : fileItem.file_name}
                            {showOperateBtn ? <Icon type="close"
                                onClick={this.handleDeleteFile.bind(this, fileItem.file_dir_id, fileItem.file_id)}/> : null}
                            {/*删除文件失败后的提示*/}
                            {this.state.deleteResult.errorMsg ?
                                <AlertTimer
                                    time={4000}
                                    message={this.state.deleteResult.errorMsg}
                                    type="error"
                                    showIcon
                                    onHide={hide}
                                /> : null}
                        </div>
                    );
                })}
                {hasPrivilege('DOCUMENT_UPLOAD') && showOperateBtn ?
                    <div>
                        <Upload {...props} className="import-reportsend" data-tracename="上传文件">
                            <Button type='primary' className='download-btn'>
                                {_.isArray(fileList) && fileList.length ? Intl.get('apply.approve.update.file', '继续添加文件') : Intl.get('apply.approve.import.file', '上传文件')}
                                {this.state.isUpLoading ?
                                    <Icon type="loading" className="icon-loading"/> : null}</Button>
                        </Upload>
                        <p>{Intl.get('click.ctrl.upload.mutil.file','可上传多个文件！')}</p>
                    </div>
                    : null}

            </div>
        );
    }
}
UploadAndDeleteFile.defaultProps = {
    fileList: [],
    uploadFileArrs: [],
    setUpdateFiles: function() {

    },
    detailInfoObj: {},
    data: '',
    beforeUpload: function() {

    },
    fileRemove: function() {

    }

};
UploadAndDeleteFile.propTypes = {
    fileList: PropTypes.object,
    uploadFileArrs: PropTypes.object,
    setUpdateFiles: PropTypes.func,
    detailInfoObj: PropTypes.object,
    data: PropTypes.string,
    beforeUpload: PropTypes.func,
    fileRemove: PropTypes.func,
};
export default UploadAndDeleteFile;