/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/24.
 */
require('./index.less');
import {Button, Icon, message,Upload,Popconfirm} from 'antd';
import AlertTimer from 'CMP_DIR/alert-timer';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Trace from 'LIB_DIR/trace';
import {isEqualArray} from 'LIB_DIR/func';
import {seperateFilesDiffType, hasApprovedReportAndDocumentApply} from 'PUB_DIR/sources/utils/common-data-util';
const UPLOADER_TYPES = {
    SALES: '',
};
class UploadAndDeleteFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpLoading: false,
            fileList: this.props.fileList,
            deleteResult: {
                result: '',
                delId: '',//删除申请的id
                errorMsg: '',//删除失败后的提示
            },
        };
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.fileList && !isEqualArray(nextProps.fileList, this.state.fileList)) {
            this.setState({
                fileList: nextProps.fileList
            });
        }
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
    onRemove = (file,callback) => {
        this.setState((state) => {
            const index = state.fileList.indexOf(file);
            const newFileList = state.fileList.slice();
            newFileList.splice(index, 1);
            return {
                fileList: newFileList,
            };
        },() => {
            _.isFunction(callback) && callback();
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
        //删除文件的时候传文件上传的id和工作流的id，不需要传文件的id和文件父目录的id
        var uploadId = fileItem.id;
        //工作流的id
        var id = _.get(this, 'props.detailInfoObj.id','');
        if (!uploadId || !id){
            this.onRemove(fileItem);
            return;
        }
        var submitObj = {
            id: id,
            upload_id: uploadId
        };
        var deleteResult = this.state.deleteResult;
        deleteResult.result = 'loading';
        deleteResult.delId = uploadId;
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
                    this.onRemove(fileItem,() => {
                        this.props.setUpdateFiles(this.state.fileList);
                    });
                    //删除成功了之后
                    deleteResult.result = 'success';
                    deleteResult.delId = '';
                    deleteResult.errorMsg = '';
                    this.setState({
                        deleteResult: deleteResult,
                    });
                }else {
                    this.deleteFailed();
                }
            },
            error: (err) => {
                this.deleteFailed(err && err.responseJSON);
            }
        });
    };
    renderUploadBtns = () => {
        var props = {
            name: 'reportsend',
            multiple: true,
            action: '/rest/reportsend/upload',
            showUploadList: false,
            onChange: this.handleChange,
        };
        var fileList = this.state.fileList;
        var detailInfoObj = this.props.detailInfoObj;
        var btnDesc = Intl.get('apply.approve.upload.file.type','上传{fileType}',{fileType: Intl.get('apply.approve.customer.info', '客户资料')});
        if(this.isDetailObjExist()){
            props.data = detailInfoObj.id;
            props.beforeUpload = function() {
            };
            var allUploadFiles = seperateFilesDiffType(fileList);
            //销售上传的文件
            var salesFiles = _.concat(allUploadFiles.customerFiles,allUploadFiles.customerAddedFiles);
            //管理员确认后上传的文件
            var managerFiles = allUploadFiles.approverUploadFiles;
            if (managerFiles.length){
                btnDesc = Intl.get('apply.approve.continue.file.type','继续上传{fileType}',{fileType: this.getFileListName()});
            }else if (hasApprovedReportAndDocumentApply(_.get(detailInfoObj,'approver_ids',[]))){
                btnDesc = Intl.get('apply.approve.upload.file.type','上传{fileType}',{fileType: this.getFileListName()});
            }else if (salesFiles.length){
                btnDesc = Intl.get('apply.approve.continue.file.type','继续上传{fileType}',{fileType: Intl.get('apply.approve.customer.info', '客户资料')});
            }
        }else{
            props.data = '';
            props.beforeUpload = this.beforeUpload;
            if (_.isArray(fileList) && fileList.length){
                btnDesc = Intl.get('apply.approve.continue.file.type','继续上传{fileType}',{fileType: Intl.get('apply.approve.customer.info', '客户资料')});
            }
        }
        return (
            <div>
                <Upload {...props} className="import-reportsend" data-tracename="上传文件">
                    <Button type='primary' className='download-btn'>
                        {btnDesc}
                        {this.state.isUpLoading ?
                            <Icon type="loading" className="icon-loading"/> : null}</Button>
                </Upload>
                <p>{Intl.get('click.ctrl.upload.mutil.file','可同时上传多个文件，只能上传图片文件，文本文件，视频文件，音频文件和压缩文件，文件大小不要超过50M！')}</p>
            </div>
        );
    };
    renderDeleteAndLoadingBtn = (fileItem) => {
        var deleteResult = this.state.deleteResult;
        return (
            <span>
                {deleteResult.result === 'loading' && deleteResult.delId === fileItem.id ?
                    <Icon type="loading"/> :
                    <Popconfirm placement="top" title={Intl.get('apply.approve.delete.this.file','是否删除此文件')} onConfirm={this.handleDeleteFile.bind(this, fileItem)} okText={Intl.get('user.yes', '是')} cancelText={Intl.get('user.no','否')}>
                        <i className="iconfont icon-delete"></i>
                    </Popconfirm>

                }
            </span>
        );

    };
    getFileListName = () => {
        var targetObj = _.find(this.props.selectType, item => item.value === _.get(this,'props.detailInfoObj.topic'));
        var fileType = '';
        if (targetObj){
            fileType = targetObj.name;
        }
        return fileType;
    };
    //继续上传文件
    renderContinueUploadFiles = () => {
        var fileList = this.state.fileList;
        var allUploadFiles = seperateFilesDiffType(fileList);
        //销售上传的文件
        var salesFiles = _.concat(allUploadFiles.customerFiles,allUploadFiles.customerAddedFiles);
        //管理员确认后上传的文件
        var managerFiles = allUploadFiles.approverUploadFiles;
        //销售可以上传和删除的权限
        var salesUploadAndDeletePrivilege = this.props.salesUploadAndDeletePrivilege;
        //管理员可以上传和删除的权限
        var approverUploadAndDeletePrivilege = this.props.approverUploadAndDeletePrivilege;
        return (
            <div>
                <div className="sales-upload-lists">
                    { salesFiles.length ? Intl.get('apply.approve.customer.info','客户资料') : ''}
                    {_.map(salesFiles, (fileItem) => {
                        var fileName = fileItem.file_name || fileItem.name;
                        var fileId = fileItem.file_id;
                        const reqData = {
                            file_dir_id: fileItem.file_dir_id,
                            file_id: fileId,
                            file_name: fileName,
                        };
                        return (
                            <div className="upload-file-name">
                                <span className="file-name">
                                    {hasPrivilege('DOCUMENT_DOWNLOAD') && fileId ?
                                        <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileName}</a> : fileName}
                                </span>

                                { salesUploadAndDeletePrivilege ? this.renderDeleteAndLoadingBtn(fileItem) : null}
                            </div>
                        );
                    })}
                    {salesUploadAndDeletePrivilege ? this.renderUploadBtns() : null}
                </div>
                <div className="approver-upload-lists">
                    {managerFiles.length ? this.getFileListName() : ''}
                    {_.map(managerFiles, (fileItem) => {
                        var fileName = fileItem.file_name || fileItem.name;
                        var fileId = fileItem.file_id;
                        const reqData = {
                            file_dir_id: fileItem.file_dir_id,
                            file_id: fileId,
                            file_name: fileName,
                        };
                        return (
                            <div className="upload-file-name">
                                <span className="file-name">
                                    {hasPrivilege('DOCUMENT_DOWNLOAD') && fileId ?
                                        <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileName}</a> : fileName}
                                </span>
                                {approverUploadAndDeletePrivilege ? this.renderDeleteAndLoadingBtn(fileItem) : null}

                            </div>
                        );
                    })}
                    {approverUploadAndDeletePrivilege ? this.renderUploadBtns() : null}
                </div>
            </div>
        );



    };
    //添加的时候上传及展示文件
    renderAddUploadFiles = () => {
        var fileList = this.state.fileList;
        return (
            <div>
                {_.map(fileList, (fileItem) => {
                    var fileName = fileItem.name;
                    return (
                        <div className="upload-file-name">
                            <span className="file-name">{fileName}</span>
                            {this.renderDeleteAndLoadingBtn(fileItem)}
                        </div>
                    );
                })}
                {this.renderUploadBtns()}
            </div>
        );
    };
    render() {
        var fileList = this.state.fileList;
        var hide = () => {
            var deleteResult = this.state.deleteResult;
            deleteResult.errorMsg = '';
            deleteResult.result = '';
            deleteResult.delId = '';
            this.setState({
                deleteResult: deleteResult
            });
        };
        var detailInfoObj = this.props.detailInfoObj;

        return (
            <div className="upload-wrap">
                {_.get(detailInfoObj,'id') ? this.renderContinueUploadFiles() : this.renderAddUploadFiles() }
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
    }
}
UploadAndDeleteFile.defaultProps = {
    uploadFileArrs: [],
    setUpdateFiles: function() {

    },
    detailInfoObj: {},
    data: '',
    beforeUpload: function() {

    },
    fileRemove: function() {

    },
    fileList: [],
    salesUploadAndDeletePrivilege: false,
    approverUploadAndDeletePrivilege: false,
    selectType: []

};
UploadAndDeleteFile.propTypes = {
    uploadFileArrs: PropTypes.object,
    setUpdateFiles: PropTypes.func,
    detailInfoObj: PropTypes.object,
    data: PropTypes.string,
    beforeUpload: PropTypes.func,
    fileRemove: PropTypes.func,
    fileList: PropTypes.object,
    salesUploadAndDeletePrivilege: PropTypes.boolean,
    approverUploadAndDeletePrivilege: PropTypes.boolean,
    selectType: PropTypes.object,
};
export default UploadAndDeleteFile;