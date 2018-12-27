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
            this.afterUpload();
        } else if (info.file.status === 'error') {
            message.error(_.isString(response) ? response : Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));
            this.afterUpload();
        }


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
        setTimeout(() => {
            this.setState(state => ({
                fileList: [...state.fileList, file],
            }),() => {
                this.afterUpload();
                this.props.beforeUpload(file);
            });
        },500);
        //如果props中有detailObj，不需要返回false，直接添加就可以
        return false;
    };
    isDetailObjExist = () => {
        var detailInfoObj = this.props.detailInfoObj;
        return detailInfoObj && !_.isEmpty(detailInfoObj);
    };
    deleteFailed = (errorMsg) => {
        //删除文件失败后的提示
        var deleteResult = this.state.deleteResult;
        deleteResult.result = 'error';
        deleteResult.delId = '';
        deleteResult.errorMsg = errorMsg || Intl.get('failed.delete.apply.load.approve', '删除文件失败！');
        this.setState({
            deleteResult: deleteResult
        });

    };
    handleDeleteFile = (fileItem) => {
        var fileDirId = fileItem.file_dir_id;
        var fileId = fileItem.file_id;

        if (!fileDirId || !fileId){
            this.onRemove(fileItem);
            return;
        }
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
                //data是true的情况才是删除成功，否则就是删除失败
                if (data){
                    this.onRemove(fileItem);
                    //删除成功了之后
                    deleteResult.result = 'success';
                    deleteResult.delId = '';
                    deleteResult.errorMsg = '';
                    // //把state上之前保存上传的文件的数组中删除这个已经上传过的
                    // var fileList = this.state.fileList;
                    // fileList = _.filter(fileList, item => item.file_id !== fileId);
                    this.setState({
                        deleteResult: deleteResult,
                        // fileList: fileList
                    },() => {
                        this.props.setUpdateFiles(this.state.fileList);
                    });
                }else {
                    this.deleteFailed();
                }
            },
            error: (errorMsg) => {
                this.deleteFailed(errorMsg);
            }
        });
    };

    render() {
        var fileList = this.state.fileList;
        var props = {
            name: 'reportsend',
            multiple: true,
            action: '/rest/reportsend/upload',
            showUploadList: false,
            onChange: this.handleChange,
            // onRemove: this.onRemove,
            // fileList:fileList,
            // beforeUpload: this.beforeUpload
        };
        var detailInfoObj = this.props.detailInfoObj;
        var showOperateBtn = true;
        if(this.isDetailObjExist()){
            props.data = detailInfoObj.id;
            props.beforeUpload = function() {

            };
            if (detailInfoObj.status !== 'ongoing'){
                showOperateBtn = false;
            }
        }else{
            props.data = '';
            props.beforeUpload = this.beforeUpload;
        }
        var hide = () => {
            var deleteResult = this.state.deleteResult;
            deleteResult.errorMsg = '';
            deleteResult.result = '';
            deleteResult.delId = '';
            this.setState({
                deleteResult: deleteResult
            });
        };
        return (
            <div className="upload-wrap">
                {_.map(fileList, (fileItem) => {
                    var fileName = fileItem.file_name || fileItem.name;
                    var fileId = fileItem.file_id;
                    const reqData = {
                        file_dir_id: fileItem.file_dir_id,
                        file_id: fileId,
                        file_name: fileName,
                    };
                    return (
                        <div className="upload-file-name">
                            {hasPrivilege('DOCUMENT_DOWNLOAD') && fileId ?
                                <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileName}</a> : fileName}
                            {showOperateBtn ? <Icon type="close"
                                onClick={this.handleDeleteFile.bind(this, fileItem)}/> : null}
                        </div>
                    );
                })}
                {/*删除文件失败后的提示*/}
                {this.state.deleteResult.errorMsg ?
                    <AlertTimer
                        time={4000}
                        message={this.state.deleteResult.errorMsg}
                        type="error"
                        showIcon
                        onHide={hide}
                    /> : null}
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