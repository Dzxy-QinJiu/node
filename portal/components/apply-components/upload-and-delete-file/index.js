/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/24.
 */
require('./index.less');
import {Button, Icon, message,Upload,Popconfirm, Tooltip} from 'antd';
import AlertTimer from 'CMP_DIR/alert-timer';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Trace from 'LIB_DIR/trace';
import {isEqualArray} from 'LIB_DIR/func';
import {FILES_TYPE_FORBIDDEN_RULES, FILES_TYPE_ALLOW_RULES, FILES_LIMIT} from 'PUB_DIR/sources/utils/consts';
import {seperateFilesDiffType, hasApprovedReportAndDocumentApply} from 'PUB_DIR/sources/utils/common-data-util';
import {checkFileSizeLimit, checkFileNameForbidRule, checkFileNameAllowRule, checkFileNameRepeat} from 'PUB_DIR/sources/utils/common-method-util';
import applyPrivilegeConst from 'MOD_DIR/apply_approve_manage/public/privilege-const';
class UploadAndDeleteFile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isUpLoading: false,
            warningMsg: '',
            fileList: this.props.fileList,
            deleteResult: {
                result: '',
                delId: '',//删除申请的id
                errorMsg: '',//删除失败后的提示
            },
            totalFileSize: this.calculateExistFileSize(this.props),//所有文件的大小
        };
    }
    calculateExistFileSize = (Props) => {
        var fileSize = 0;
        _.forEach(Props.fileList,(item) => {
            fileSize += item.size;
        });
        return fileSize;
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.fileList && !isEqualArray(nextProps.fileList, this.state.fileList) || JSON.stringify(this.props.detailInfoObj) !== JSON.stringify(nextProps.detailInfoObj)) {
            this.setState({
                fileList: nextProps.fileList,
                totalFileSize: this.calculateExistFileSize(nextProps)
            });
        }
    }
    setUploadLoadingFalse = () => {
        this.setState({
            isUpLoading: false,
        });
    };
    updateCalculateFilesSize = (response) => {
        var fileSize = this.state.totalFileSize;
        _.forEach(response,(item) => {
            fileSize += item.size;
        });
        this.setState({
            totalFileSize: fileSize
        });
    };

    handleChange = (info) => {
        const response = info.file.response;
        if (info.file.status === 'done') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-reportsend'), '上传报告成功');
            if (response) {
                var fileList = this.state.fileList;
                //上传成功
                this.setState({
                    fileList: fileList.concat(response),
                },() => {
                    this.updateCalculateFilesSize(response);
                    _.isFunction(this.props.setUpdateFiles) && this.props.setUpdateFiles(this.state.fileList);
                });
            } else {
                message.error(Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));
            }
            this.setUploadLoadingFalse();
        } else if (info.file.status === 'error') {
            message.error(_.isString(response) ? response : Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!', {type: Intl.get('apply.approve.lyrical.report', '舆情报告')}));
            this.setUploadLoadingFalse();
        }
    };
    onRemove = (file,callback) => {
        var fileList = this.state.fileList;
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        if (index > -1){
            newFileList.splice(index, 1);
            var totalFileSize = this.state.totalFileSize;
            var fileSize = file.size;
            totalFileSize -= fileSize;
            this.setState({
                totalFileSize: totalFileSize,
                fileList: newFileList,
            },() => {
                _.isFunction(callback) && callback();
            });
        }
        this.props.fileRemove(file);
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
        var checkForbidObj = checkFileNameForbidRule(filename, FILES_TYPE_FORBIDDEN_RULES);
        var checkAllowObj = checkFileNameAllowRule(filename, FILES_TYPE_ALLOW_RULES);
        var checkRepeatObj = checkFileNameRepeat(filename, this.state.fileList);
        var warningMsg = checkForbidObj.warningMsg || checkAllowObj.warningMsg || checkRepeatObj.warningMsg;
        var nameQualified = true;
        if (!checkForbidObj.nameQualified || !checkAllowObj.nameQualified || !checkRepeatObj.nameQualified ){
            nameQualified = false;
        }
        if (warningMsg){
            this.setState({
                warningMsg: warningMsg
            });
        }
        return nameQualified;
    };
    checkFileType = (filename,fileSize,totalSize) => {
        if (!this.checkFileNameRule(filename)){
            return false;
        }
        if (!this.checkFileSizeLimit(fileSize || 0)){
            return false;
        }
        if (totalSize && !this.checkFileSizeLimit(totalSize)){
            return false;
        }
        return true;
    };
    beforeUploadFiles = (file) => {
        this.setState({isUpLoading: true});
        //计算之前上传过的和现在要上传的这个文件的大小，不能超过10M
        var fileName = file.name,fileSize = file.size;
        var totalFileSize = this.state.totalFileSize;
        totalFileSize += fileSize;
        if (this.checkFileType(fileName,fileSize,totalFileSize)){
            this.setState(state => ({
                totalFileSize: totalFileSize,
                fileList: [...state.fileList, file],
            }),() => {
                this.setUploadLoadingFalse();
                this.props.beforeUpload(file);
            });
        }else{
            this.setUploadLoadingFalse();
        }
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
        var _this = this;
        var props = {
            name: 'reportsend',
            action: '/rest/reportsend/upload',
            showUploadList: false,
            onChange: this.handleChange,
        };
        var fileList = this.state.fileList;
        var detailInfoObj = this.props.detailInfoObj;
        var btnDesc = Intl.get('apply.approve.upload.file.type','上传{fileType}',{fileType: Intl.get('apply.approve.customer.info', '客户资料')});
        //需要计算的是总文件大小
        var calTotalSize = this.props.uploadAndDeletePrivilege === FILES_LIMIT.TOTAL;
        if(this.isDetailObjExist()){
            props.data = detailInfoObj.id;
            props.beforeUpload = function(file) {
                var fileName = file.name,fileSize = file.size;
                _this.setState({isUpLoading: true});
                //如果是销售继续上传，需要计算文件的总大小，如果是支持部人员上传，不需要计算文件的总大小，只是需要单次的大小不能超过10M
                var Size = fileSize;
                if (calTotalSize) {
                    Size = fileSize + _this.state.totalFileSize;
                }
                if (!_this.checkFileType(fileName, Size)) {
                    _this.setUploadLoadingFalse();
                    return false;
                }
            };
            var allUploadFiles = seperateFilesDiffType(fileList);
            //销售上传的文件
            var salesFiles = _.concat(allUploadFiles.customerFiles,allUploadFiles.customerAddedFiles);
            //管理员确认后上传的文件
            var managerFiles = allUploadFiles.approverUploadFiles;
            if (managerFiles.length){
                btnDesc = Intl.get('apply.approve.continue.file.type','继续上传{fileType}',{fileType: this.getFileListName()});
            }else if (!calTotalSize){
                btnDesc = Intl.get('apply.approve.upload.file.type','上传{fileType}',{fileType: this.getFileListName()});
            }else if (salesFiles.length){
                btnDesc = Intl.get('apply.approve.continue.file.type','继续上传{fileType}',{fileType: Intl.get('apply.approve.customer.info', '客户资料')});
            }
        }else{
            props.data = '';
            props.beforeUpload = this.beforeUploadFiles;
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
                <p>
                    <ReactIntl.FormattedMessage
                        id='click.ctrl.upload.mutil.file'
                        defaultMessage={'只能上传{office}，{image}，文本文件和{compact}，{filetypes}不要超过10M！'}
                        values={{
                            'office': (
                                <Tooltip title="'docx','doc','ppt','pptx','pdf','xls','xlsx',csv'">
                                    <span>{Intl.get('leave.apply.office.document', '办公文件')}</span>
                                </Tooltip>),
                            'image': (
                                <Tooltip title="'png','bmp','jpg'">
                                    <span>{Intl.get('leave.apply.image.document', '图片文件')}</span>
                                </Tooltip>),
                            'compact': (
                                <Tooltip title="'rar','zip'">
                                    <span>{Intl.get('leave.apply.compact.document', '压缩文件')}</span>
                                </Tooltip>),
                            'filetypes': calTotalSize ? Intl.get('upload.files.total.file.size','文件总大小') : Intl.get('upload.files.each.file.size','每次上传大小') ,
                        }}
                    />
                </p>
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
                        <i className="iconfont icon-delete handle-btn-item"></i>
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
        var uploadAndDeletePrivilege = this.props.uploadAndDeletePrivilege;
        var salesUploadAndDeletePrivilege = uploadAndDeletePrivilege === FILES_LIMIT.TOTAL;
        var approverUploadAndDeletePrivilege = uploadAndDeletePrivilege === FILES_LIMIT.SINGLE;
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
                                    {hasPrivilege(applyPrivilegeConst.MEMBER_REPORT_APPLY_APPROVE) && fileId ?
                                        <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileName}</a> : fileName}
                                </span>

                                {salesUploadAndDeletePrivilege ? this.renderDeleteAndLoadingBtn(fileItem) : null}
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
                                    {hasPrivilege(applyPrivilegeConst.MEMBER_REPORT_APPLY_APPROVE) && fileId ?
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
        var hideWarning = () => {
            this.setState({
                warningMsg: ''
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
                {this.state.warningMsg ? <AlertTimer time={4000}
                    message={this.state.warningMsg}
                    type="error"
                    showIcon
                    onHide={hideWarning}/> : null}
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
    uploadAndDeletePrivilege: '',//total：上传文件计算大小是根据总文件判断 single：上传文件计算大小是根据单个文件判断
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
    uploadAndDeletePrivilege: PropTypes.string,
    selectType: PropTypes.object
};
export default UploadAndDeleteFile;