import { Upload, message, Button, Icon } from 'antd';
var AppStore = require('../store/app-store');
var RoleAction = require("../../../rolePrivilege_role/public/action/role-actions");
var AuthorityAction = require("../../../rolePrivilege_authority/public/action/authority-actions");

var TYPE_CONSTANT = "myApp";

var fileTypes = [".json"];

var ImportData = React.createClass({

    getInitialState() {
        return {
            isLoading: false
        };
    },

    // 导入数据成功之后，重新刷新界面
    refreshData: function(key) {
        var client_id = AppStore.getState().showAuthoRoleAppId;
        if (key == "authority") {
            AuthorityAction.setAuthListLoading(true);
            AuthorityAction.getAuthorityList(client_id, TYPE_CONSTANT);
        } else if (key == "role") {
            RoleAction.setRoleListLoading(true);
            RoleAction.getRoleList(client_id, TYPE_CONSTANT);
        }
    },

    // 检查上传文件的格式
    checkFile: function(file) {
        if (!/\.json$/.test(file.name)) {
            return false;
        } else {
            return (file.name).indexOf(fileTypes) > -1;
        }
    },

    // 检查文件是否上传成功
    handleChange(info) {
        this.setState({isLoading: true});
        if (info.file.status === "done") {
            if (info.file.response == true) {
                message.success(info.file.name + Intl.get("common.upload.success", ' 上传成功!'));
                this.refreshData(this.props.type);
            } else if((info.file.response).indexOf("SyntaxError") > -1){
                message.warn(info.file.name + Intl.get("common.upload.syntax.error", ' 上传文件格式错误，请修改后重试! ') ,3);
            }else {
                message.error(info.file.name + Intl.get("common.upload.error", ' 上传失败，请重试!'));
            }
            this.setState({isLoading: false});
        }
    },

    render: function() {
        var _this = this;
        var client_id = AppStore.getState().showAuthoRoleAppId;
        if (this.props.type == "role") {
            var props = {
                name: 'import_role',
                action: '/rest/my_app/import_role/'+ client_id,
                accept: fileTypes.join(),
                showUploadList: false,
                beforeUpload(file) {
                    var isJson = _this.checkFile(file);
                    if (!isJson) {
                        message.error(Intl.get("common.upload.type.tip", '只能上传 json 文件哦！'));
                    }
                    return isJson;
                },
                onChange: this.handleChange
            };
            return (
                <Upload {...props} className="upload-role">
                    {Intl.get("common.import", "导入")} {this.state.isLoading? <Icon type="loading" style={{marginLeft: 12}}/> : null}
                </Upload>
            );
        } else {
            var props = {
                name: 'import_authority',
                action: '/rest/my_app/import_authority/'+ client_id,
                accept: fileTypes.join(),
                showUploadList: false,
                beforeUpload(file) {
                    var isJson = _this.checkFile(file);
                    if (!isJson) {
                        message.error(Intl.get("common.upload.type.tip", '只能上传 json 文件哦！'));
                    }
                    return isJson;
                },
                onChange: this.handleChange
            };
            return (
                <Upload {...props} className="upload-authority">
                    {Intl.get("common.import", "导入")} {this.state.isLoading? <Icon type="loading" style={{marginLeft: 12}}/> : null}
                </Upload>
            );
        }
    }
});

module.exports = ImportData;