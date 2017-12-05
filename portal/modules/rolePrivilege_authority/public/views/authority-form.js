const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
/**
 * 添加权限组面板
 */
import { Radio, Button, Form, Input, Select, Icon} from 'antd';
const RadioGroup = Radio.Group;
var classNames = require("classnames");
var FormItem = Form.Item;
var AlertTimer = require("../../../../components/alert-timer");
var Spinner = require("../../../../components/spinner");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var rightPanelUtil = require("../../../../components/rightPanel/index");
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var userData = require("../../../../public/sources/user-data");
var AuthorityFormAction = require("../action/authority-form-actions");
var AuthorityFormStore = require("../store/authority-form-store");
var language = require("../../../../public/language/getLanguage");
import Trace from "LIB_DIR/trace";

var CONSTANT = {
    PERMISSION_NAME: "permissionName_",//权限名称
    PERMISSION_DEFINE: "permissionDefine_",//权限标识
    PERMISSION_API_ARRAY: "permissionApiArray_",//服务地址数组
    PERMISSION_TYPE: "permissionType_",//权限类型
    PERMISSION_DATAS: "permissionDatas_",//数据权限
    HAS_PERMISSION_API: "hasPermissionApi_",//是否有填写的服务地址
    PERMISSION_DATA_NUll: "permissionDataNull_"//数据权限是否都为空（必填一项）
};

function noop() {
}
var TYPE_CONSTANT = "myApp";
var AuthorityForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getInitialState: function () {
        var saveFlags = AuthorityFormStore.getState();
        return {
            status: {
                permissionName_1: {},
                permissionDefine_1: {},
                permissionApiArray_1: {},
                classifyName: {}
            },
            formData: {
                classifyName: "",
                permissionName_1: "",
                permissionDefine_1: "",
                permissionApiArray_1: [{
                    permissionApiUrl: "",
                    permissionApiMethod: "PUT"
                }],
                permissionType_1: "REST",
                permissionDatas_1: []
            },
            multiFormNum: 1,
            multiFormNumArr: [1],
            isGroupSaving: saveFlags.isGroupSaving,//是否正在保存
            saveGroupMsg: saveFlags.saveGroupMsg,//保存结果的提示信息
            saveGroupResult: saveFlags.saveGroupResult//error、success
        };
    },
    onChange: function () {
        var saveFlags = AuthorityFormStore.getState();
        this.setState({
            isGroupSaving: saveFlags.isGroupSaving,
            saveGroupMsg: saveFlags.saveGroupMsg,
            saveGroupResult: saveFlags.saveGroupResult
        });
    },
    componentDidMount: function () {
        AuthorityFormStore.listen(this.onChange);
    },
    componentWillUnmount: function () {
        AuthorityFormStore.unlisten(this.onChange);
    },

    componentWillReceiveProps: function () {
        this.refs.validation.reset();
        this.setState(this.getInitialState());
    },

    renderValidateStyle: function (item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    handleCancel: function (e) {
        e.preventDefault();
        Trace.traceEvent(e,"点击取消添加权限组按钮");
        this.props.cancelAuthorityForm();
    },

    showAuthorityInfo: function (e) {
        e.preventDefault();
        this.props.showAuthorityInfo(this.props.authority);
    },

    handleSubmit: function (e) {
        e.preventDefault();
        Trace.traceEvent(e,"点击保存添加权限组按钮");
        var _this = this;
        var validation = this.refs.validation;
        validation.validate(function (valid) {
            if (!valid) {
                return;
            } else {
                var authority = _this.returnAuthorityArrayData();
                var isValid = true;
                //添加权限的服务地址有为空的，验证不通过，不可保存
                _this.state.multiFormNumArr.find(function (index) {
                    if (!_this.state.formData[CONSTANT.HAS_PERMISSION_API + index]) {
                        isValid = false;
                        return true;
                    }
                });
                if (!isValid) {
                    return;
                }
                //是否有没有通过验证的数据权限
                let hasNotValidPermissionData = _.some(_this.state.multiFormNumArr, index=>_this.state.formData[CONSTANT.PERMISSION_DATA_NUll + index]);
                //有没通过验证的数据权限，不可保存
                if (hasNotValidPermissionData) {
                    return;
                }
                AuthorityFormAction.setGroupSavingFlag(true);
                if (_this.props.appId) {
                    //我的应用中添加权限分组
                    AuthorityFormAction.addAuthorityGroup(authority, _this.props.appId, TYPE_CONSTANT);
                } else {
                    AuthorityFormAction.addAuthorityGroup(authority);
                }
            }
        });
    },

    returnAuthorityArrayData: function () {
        var clientId = this.props.appId ? this.props.appId : userData.getUserData().auth.client_id;//应用id
        var realmId = userData.getUserData().auth.realm_id;//安全域id

        var formData = this.state.formData;
        var multiFormNumArr = this.state.multiFormNumArr;
        var authorityArray = [], _this = this;
        var classifyName = formData.classifyName;//权限组名
        //添加权限的处理
        multiFormNumArr.map(function (index) {
            var defaultAuthority = {
                permissionName: formData[CONSTANT.PERMISSION_NAME + index],
                permissionDefine: formData[CONSTANT.PERMISSION_DEFINE + index],
                permissionApis: {},
                permissionDatas: [],
                permissionType: formData[CONSTANT.PERMISSION_TYPE + index],
                classifyName: classifyName,
                clientId: clientId,
                realmId: realmId
            };

            //数据权限的赋值
            if (formData[CONSTANT.PERMISSION_TYPE + index] == "DATA") {
                defaultAuthority.permissionDatas = _.filter(formData[CONSTANT.PERMISSION_DATAS + index] || [], function (str) {
                    return str.trim() !== '';
                });
                if (defaultAuthority.permissionDatas.length == 0) {
                    //必填一项的验证提示
                    formData[CONSTANT.PERMISSION_DATA_NUll + index] = true;
                } else {
                    delete formData[CONSTANT.PERMISSION_DATA_NUll + index];
                }
                formData[CONSTANT.HAS_PERMISSION_API + index] = true;//保存时，用来判断服务地址验证是否通过
            } else {//服务地址
                //遍历添加权限的服务地址数组，将[{url:‘urlVal’，method：‘methodVal’},..]对象数组，转为后台接口参数所需{urlVal:methodVal,..}对象
                formData[CONSTANT.PERMISSION_API_ARRAY + index].forEach(function (permission, i) {
                    if (permission.permissionApiUrl) {
                        _this.handlePermissionApis(defaultAuthority.permissionApis, permission);
                        formData[CONSTANT.HAS_PERMISSION_API + index] = true;//保存时，用来判断服务地址验证是否通过
                    } else if (i == 0) {
                        //服务地址url为空时，必填一项的验证
                        permission.isNull = true;
                    }
                });
                if (formData[CONSTANT.HAS_PERMISSION_API + index]) {
                    //如果有服务地址，则去掉必填一项的验证
                    delete formData[CONSTANT.PERMISSION_API_ARRAY + index][0].isNull;
                }
            }
            authorityArray.push(defaultAuthority);
        });
        this.state.formData = formData;
        this.setState({
            formData: this.state.formData
        });
        return authorityArray;
    },

    //权限的服务地址的处理
    handlePermissionApis: function (permissionApis, permission) {
        //同一地址不同方法的处理
        if (permissionApis[permission.permissionApiUrl]) {
            //如果已有该路径，该路径对应的value中没有当前方法名，则value+=,method
            if (permissionApis[permission.permissionApiUrl].indexOf(permission.permissionApiMethod) < 0) {
                permissionApis[permission.permissionApiUrl] += "," + permission.permissionApiMethod;
            }
        } else {
            //不存在改路径时，该路径对应的value就是其方法名
            permissionApis[permission.permissionApiUrl] = permission.permissionApiMethod;
        }
    },

    addFormDiv: function (event) {
        Trace.traceEvent(event,"添加一个权限信息模块");
        var validation = this.refs.validation, _this = this;
        validation.validate(function (valid) {
            if (!valid) {
                return;
            } else {
                var multiFormNum = _this.state.multiFormNum;
                var multiFormNumArr = _this.state.multiFormNumArr;
                var formData = _this.state.formData;
                //前一项权限模块的验证通过后再添加
                var preAuthorityIndex = multiFormNumArr[multiFormNumArr.length - 1];
                if (formData[CONSTANT.PERMISSION_TYPE + preAuthorityIndex] == "DATA") {
                    let permissionDatas = _.filter(formData[CONSTANT.PERMISSION_DATAS + preAuthorityIndex] || [], function (str) {
                        return str.trim() !== '';
                    });
                    //前一项数据权限的验证
                    if (permissionDatas.length == 0) {
                        formData[CONSTANT.PERMISSION_DATA_NUll + preAuthorityIndex] = true;
                        _this.setState({formData: formData});
                        //前一项数据权限的验证不通过不能继续添加权限模块
                        return;
                    } else {
                        delete formData[[CONSTANT.PERMISSION_DATA_NUll + preAuthorityIndex]];
                    }

                } else {
                    //前一项的服务地址验证
                    var hasPermissionApi = _.some(formData[CONSTANT.PERMISSION_API_ARRAY + preAuthorityIndex], function (permission, i) {
                        if (permission.permissionApiUrl) {
                            return true;
                        } else if (i == 0) {
                            //服务地址url为空时，必填一项的验证
                            permission.isNull = true;
                        }
                    });
                    if (hasPermissionApi) {
                        //如果有服务地址，则去掉必填一项的验证,继续添加权限模块
                        delete formData[CONSTANT.PERMISSION_API_ARRAY + preAuthorityIndex][0].isNull;
                    } else {
                        _this.setState({formData: formData});
                        //服务地址验证不通过不能继续添加权限模块
                        return;
                    }
                }
                var status = _this.state.status;
                multiFormNum++;
                multiFormNumArr.push(multiFormNum);
                formData[CONSTANT.PERMISSION_NAME + multiFormNum] = "";
                formData[CONSTANT.PERMISSION_TYPE + multiFormNum] = "REST";
                formData[CONSTANT.PERMISSION_DEFINE + multiFormNum] = "";
                formData[CONSTANT.PERMISSION_API_ARRAY + multiFormNum] = [{
                    permissionApiUrl: "",
                    permissionApiMethod: "PUT"
                }];

                status[CONSTANT.PERMISSION_NAME + multiFormNum] = {};
                status[CONSTANT.PERMISSION_TYPE + multiFormNum] = {};
                status[CONSTANT.PERMISSION_DEFINE + multiFormNum] = {};
                status[CONSTANT.PERMISSION_API_ARRAY + multiFormNum] = {};

                _this.setState({
                    multiFormNum: multiFormNum,
                    multiFormNumArr: multiFormNumArr,
                    formData: formData,
                    status: status
                });
            }
        });
    },

    deleteFormDiv: function (index) {
        var formData = this.state.formData;
        var status = this.state.status;
        var multiFormNumArr = this.state.multiFormNumArr;

        delete  formData[CONSTANT.PERMISSION_NAME + index];
        delete formData[CONSTANT.PERMISSION_TYPE + index];
        delete  formData[CONSTANT.PERMISSION_DEFINE + index];
        delete  formData[CONSTANT.PERMISSION_API_ARRAY + index];

        delete  status[CONSTANT.PERMISSION_NAME + index];
        delete  status[CONSTANT.PERMISSION_TYPE + index];
        delete  status[CONSTANT.PERMISSION_DEFINE + index];
        delete  status[CONSTANT.PERMISSION_API_ARRAY + index];

        multiFormNumArr.splice(jQuery.inArray(index, multiFormNumArr), 1);
        this.setState({
            multiFormNumArr: multiFormNumArr,
            formData: formData,
            status: status
        });
    },

    hideSaveTooltip: function () {
        if (this.props.appId) {
            AuthorityFormAction.clearSaveFlags(this.state.saveGroupResult, this.props.appId, TYPE_CONSTANT);
        } else {
            AuthorityFormAction.clearSaveFlags(this.state.saveGroupResult);
        }
    },
    //更新state中formData的服务地址数组
    updateCurPermissionApiArray: function (permissionIndex, permissionApiArray) {
        if (permissionIndex) {
            //更新添加一个权限模块的服务地址数组
            this.state.formData[CONSTANT.PERMISSION_API_ARRAY + permissionIndex] = permissionApiArray;
        } else {
            //更新默认添加的权限模块的服务地址
            this.state.formData.permissionApiArray = permissionApiArray;
        }
        this.setState({
            formData: this.state.formData
        });
    },

    //更新服务地址,i:当前修改的是第几个地址，newVal:修改后的url/method,type:当前修改的是url还是method
    updatePermissionApiObj: function (i, newVal, type, permissionIndex) {
        var permissionApiArray = this.getCurPermissionApiArray(permissionIndex);
        //找到数组中对应的对象，更新url/method
        if (permissionApiArray[i] && _.isObject(permissionApiArray[i])) {
            if (type == "url") {
                if (newVal) {
                    delete permissionApiArray[i].isNull;
                } else if (i == 0) {
                    //服务地址url为空时，必填一项的验证
                    permissionApiArray[i].isNull = true;
                }
                permissionApiArray[i].permissionApiUrl = newVal;
            } else {
                permissionApiArray[i].permissionApiMethod = newVal || "PUT";
            }
            this.updateCurPermissionApiArray(permissionIndex, permissionApiArray);
        }
    },
    //选择服务地址的请求方式的处理
    onPermissionSelect: function (index, permissionIndex, selectVal) {
        this.updatePermissionApiObj(index, selectVal, "method", permissionIndex);
    },
    //服务地址输入的处理
    onPermissionInputChange: function (index, permissionIndex, event) {
        var newKey = event.target.value;
        this.updatePermissionApiObj(index, newKey, "url", permissionIndex);
    },
    //添加一个服务地址的处理
    addPermissionApi: function (permissionIndex, event) {
        Trace.traceEvent(event,"添加服务地址");
        var permissionApiArray = this.getCurPermissionApiArray(permissionIndex);
        permissionApiArray.push({
            permissionApiUrl: "",
            permissionApiMethod: "PUT"
        });
        this.updateCurPermissionApiArray(permissionIndex, permissionApiArray);
    },
    //删除服务地址
    delPermissionApi: function (index, permissionIndex, event) {
        Trace.traceEvent(event,"删除服务地址");
        var value = event.target.value;
        if (value) {
            return;
        }
        var permissionApiArray = this.getCurPermissionApiArray(permissionIndex);
        if (permissionApiArray[index]) {
            permissionApiArray.splice(index, 1);
            this.updateCurPermissionApiArray(permissionIndex, permissionApiArray);
        }
    },
    //验证服务地址是否为空
    validatePermissionApi: function (index, permissionIndex, event) {
        var value = event.target.value;
        var permissionApiArray = this.getCurPermissionApiArray(permissionIndex);
        if (permissionApiArray[index]) {
            if (value) {
                //服务地址url不为空时，则删除是否为空的标志
                delete permissionApiArray[index].isNull;
            } else if (index == 0) {
                //服务地址url为空时，必填一项的验证
                permissionApiArray[index].isNull = true;
            }
            this.updateCurPermissionApiArray(permissionIndex, permissionApiArray);
        }
    },

    renderPermissionApiItem: function (permissionApi, index, permissionApiLen, permissionIndex) {
        var onlyOneItem = index == 0 && index == permissionApiLen - 1;//只有一条服务地址
        return (<div className="permission-api-item" key={index}>
            <Select size="large"
                    name="permissionApisVal" onChange={this.onPermissionSelect.bind(this,index,permissionIndex)}
                    value={permissionApi.permissionApiMethod}>
                <Option value="PUT">PUT</Option>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="DELETE">DELETE</Option>
            </Select>
            <Input name="permissionApisKey" id="permissionApisKey"
                   className={permissionApi.isNull?"auth-validate-error":""}
                   value={permissionApi.permissionApiUrl}
                   placeholder={index==0?Intl.get("authority.need.write.one", "必填一项*"):""}
                   onBlur={index==0?this.validatePermissionApi.bind(this,index,permissionIndex):noop}
                   onChange={this.onPermissionInputChange.bind(this,index,permissionIndex)}
            />
            <div className="permission-inputgroup-btns-div">
                {onlyOneItem ? null : (
                    <Icon type="minus" className="del-permission-inputgroup-btn permission-inputgroup-btn"
                          onClick={this.delPermissionApi.bind(this,index,permissionIndex)}/>)}
                {(index == permissionApiLen - 1) ? (
                    <Icon type="plus" className="add-permission-inputgroup-btn permission-inputgroup-btn"
                          onClick={this.addPermissionApi.bind(this,permissionIndex)}/>) : null}
            </div>
            {permissionApi.isNull ? (
                <div className="auth-validate-error-tip permissionApi-validate">
                    <ReactIntl.FormattedMessage
                        id="authority.need.write.one.api"
                        defaultMessage="必填一项服务地址"/>
                </div>) : null}
        </div>);
    },
    //获取当前权限的服务地址数组
    getCurPermissionApiArray: function (permissionIndex) {
        var permissionApiArray = [];
        if (permissionIndex) {
            //点击添加一个权限模块后添加的权限的服务地址数组
            permissionApiArray = this.state.formData[CONSTANT.PERMISSION_API_ARRAY + permissionIndex] || [];
        } else {
            //默认添加的第一个权限的服务地址数组
            permissionApiArray = this.state.formData.permissionApiArray || [];
        }
        return permissionApiArray;
    },
    //渲染某个权限的服务地址
    renderPermissionApis: function (permissionIndex) {
        var permissionApiArray = this.getCurPermissionApiArray(permissionIndex);
        var permissionApiLen = _.isArray(permissionApiArray) ? permissionApiArray.length : 0;
        var permissionApisEle = [];
        var _this = this;
        if (permissionApiLen > 0) {
            //如果权限服务地址数组有数据，则遍历数组中的服务地址对象进行渲染展示
            permissionApisEle = permissionApiArray.map(function (permissionApi, index) {
                if (_.isObject(permissionApi)) {
                    return _this.renderPermissionApiItem(permissionApi, index, permissionApiLen, permissionIndex);
                }
            });
        } else {
            //如果权限服务地址数组没有数据
            var permissionApi = {permissionApiUrl: "", permissionApiMethod: "PUT"};
            //权限服务地址数组中默认加入一个服务地址对象
            this.state.formData.permissionApiArray = [permissionApi];
            //默认渲染一个空的服务地址url输入框和method选择框
            permissionApisEle.push(_this.renderPermissionApiItem(permissionApi, 0, 1, permissionIndex));
        }
        return permissionApisEle;
    },
    //获取当前权限的数据权限
    getCurPermissionDatas: function (permissionIndex) {
        var permissionDatas = [];
        if (permissionIndex) {
            //点击添加一个权限模块后添加的权限的数据权限数组
            permissionDatas = this.state.formData[CONSTANT.PERMISSION_DATAS + permissionIndex] || [""];
        } else {
            //默认添加的第一个权限的服务地址数组
            permissionDatas = this.state.formData.permissionDatas || [""];
        }
        if (!_.isArray(permissionDatas) || permissionDatas.length === 0) {
            permissionDatas = this.state.formData.permissionDatas = [""];
        }
        return permissionDatas;
    },

    //渲染数据权限
    renderPermissionDatas: function (permissionIndex) {
        var permissionDatas = this.getCurPermissionDatas(permissionIndex);
        var _this = this;
        var onlyOneItem = permissionDatas.length === 1;
        var permissionDatasLen = permissionDatas.length;
        //数据权限是否为空的标识（只要有一个就不为空）
        let permissionDataNull = permissionIndex ? this.state.formData[CONSTANT.PERMISSION_DATA_NUll + permissionIndex] : this.state.formData.permissionDataNull;
        return (
            <div className="permissionDatas-content">
                {
                    permissionDatas.map(function (str, index) {
                        return <div className="permissionData-item" key={index}>
                            <Input name="permissionData" id="permissionData"
                                   className={permissionDataNull&&index==0?"auth-validate-error":""}
                                   placeholder={index==0?Intl.get("authority.need.write.one", "必填一项*"):""}
                                   value={permissionDatas[index]}
                                   onBlur={index==0?_this.validatePermissionData.bind(this,index,permissionIndex):noop}
                                   onChange={_this.onPermissionDataChange.bind(_this , index,permissionIndex)}
                            />
                            <div className="permission-inputgroup-btns-div">
                                {onlyOneItem ? null : (
                                    <Icon type="minus"
                                          className="del-permission-inputgroup-btn permission-inputgroup-btn"
                                          onClick={_this.removePermissionData.bind(_this , index,permissionIndex)}/>)}
                                {(index == permissionDatasLen - 1) ? (
                                    <Icon type="plus"
                                          className="add-permission-inputgroup-btn permission-inputgroup-btn"
                                          onClick={_this.addPermissionData.bind(_this , permissionIndex)}/>) : null}
                            </div>
                            {permissionDataNull && index == 0 ? (
                                <div className="auth-validate-error-tip"><ReactIntl.FormattedMessage
                                    id="authority.need.write.one.data"
                                    defaultMessage="必填一项数据权限"/>
                                </div>) : null}
                        </div>
                    })
                }
            </div>
        );
    },
    //数据权限输入框发生改变
    onPermissionDataChange: function (idx, permissionIndex, event) {
        var permissionDatas = this.getCurPermissionDatas(permissionIndex);
        permissionDatas[idx] = event.target.value;
        this.updateCurPermissionDatas(permissionIndex, permissionDatas);
        this.validatePermissionData(idx, permissionIndex, event);
    },
    //验证数据权限是否为空
    validatePermissionData: function (idx, permissionIndex, event) {
        var value = event.target.value;
        if (value) {
            //数据权限不为空时，则删除是否为空的标志(只要有一个即可)
            if (permissionIndex) {
                delete this.state.formData[CONSTANT.PERMISSION_DATA_NUll + permissionIndex];
            } else {
                delete this.state.formData.permissionDataNull;
            }
        } else if (idx == 0) {
            //数据权限为空时，必填一项的验证
            if (permissionIndex) {
                this.state.formData[CONSTANT.PERMISSION_DATA_NUll + permissionIndex] = true;
            } else {
                this.state.formData.permissionDataNull = true;
            }
        }
        this.setState({
            formData: this.state.formData
        });
    },
    //更新state中formData的服务地址数组
    updateCurPermissionDatas: function (permissionIndex, permissionDatas) {
        if (permissionIndex) {
            //更新添加一个权限模块的服务地址数组
            this.state.formData[CONSTANT.PERMISSION_DATAS + permissionIndex] = permissionDatas;
        } else {
            //更新默认添加的权限模块的服务地址
            this.state.formData.permissionDatas = permissionDatas;
        }
        this.setState({
            formData: this.state.formData
        });
    },

    //添加一个数据权限
    addPermissionData: function (permissionIndex) {
        var permissionDatas = this.getCurPermissionDatas(permissionIndex);
        permissionDatas.push("");
        this.updateCurPermissionDatas(permissionIndex, permissionDatas);
    },
    //移除一个数据权限
    removePermissionData: function (index, permissionIndex) {
        var permissionDatas = this.getCurPermissionDatas(permissionIndex);
        permissionDatas.splice(index, 1);
        this.updateCurPermissionDatas(permissionIndex, permissionDatas);
    },
    render: function () {
        var _this = this;
        var multiFormNumArr = this.state.multiFormNumArr;
        var formData = this.state.formData;
        var status = this.state.status;
        var btnClass = classNames('authority-form-content', this.props.className, {
            'formTranslate': !this.state.showAuthorityInfoFlag
        });

        let labelCol = (language.lan() == 'zh' ? 6 : 8);
        let wrapperCol = (language.lan() == 'zh' ? 17 : 16);

        var mulitFormElement = multiFormNumArr.map(function (index) {
            var permissionNameID = CONSTANT.PERMISSION_NAME + index;
            var permissionDefineID = CONSTANT.PERMISSION_DEFINE + index;
            var permissionTypeID = CONSTANT.PERMISSION_TYPE + index;
            return (
                <div key={index} className="authority-formItem-group" data-tracename="权限列表">
                    <FormItem
                        label={Intl.get("authority.auth.name", "权限名称")}
                        id={permissionNameID}
                        labelCol={{span: labelCol}}
                        wrapperCol={{span: 18}}
                        validateStatus={_this.renderValidateStyle(permissionNameID)}
                        help={status[permissionNameID].isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status[permissionNameID].errors && status[permissionNameID].errors.join(','))}
                    >
                        <Validator
                            rules={[{required: true, min: 1, max : 200 , message: Intl.get("authority.input.length.tip", "最少1个字符,最多200个字符")}]}>
                            <Input name={permissionNameID} id={permissionNameID}
                                   value={formData[permissionNameID]}
                                   placeholder={Intl.get("common.required.tip", "必填项*")}
                                   onChange={_this.setField.bind(_this, permissionNameID)}
                            />

                        </Validator>
                    </FormItem>
                    <FormItem
                        label={Intl.get("authority.auth.type", "权限类型")}
                        labelCol={{span: labelCol}}
                        wrapperCol={{span: wrapperCol}}
                    >
                        <RadioGroup onChange={_this.setField.bind(_this, permissionTypeID)}
                                    value={formData[permissionTypeID]||"REST"}>
                            <Radio value="REST">REST</Radio>
                            <Radio value="DATA">DATA</Radio>
                        </RadioGroup>
                    </FormItem>
                    {formData[permissionTypeID] === "DATA" ? ( <FormItem
                        label={Intl.get("authority.data.auth", "数据权限")}
                        labelCol={{span: labelCol}}
                        wrapperCol={{span: wrapperCol}}
                    >
                        <div className="permissionDatas-container">
                            {_this.renderPermissionDatas(index)}
                        </div>
                    </FormItem>) : ( <FormItem
                        label={Intl.get("authority.auth.api", "服务地址")}
                        labelCol={{span: labelCol}}
                        wrapperCol={{span: wrapperCol}}
                    >
                        <div className="permissionApis-content">
                            {_this.renderPermissionApis(index)}
                        </div>
                    </FormItem>)}

                    <FormItem
                        label={Intl.get("authority.auth.flag", "权限标识")}
                        id={permissionDefineID}
                        labelCol={{span: labelCol}}
                        wrapperCol={{span: 18}}
                        validateStatus={_this.renderValidateStyle(permissionDefineID)}
                        help={status[permissionDefineID].isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status[permissionDefineID].errors && status[permissionDefineID].errors.join(','))}
                    >
                        <Validator
                            rules={[{required: true, min: 1, max : 200 , message: Intl.get("authority.input.length.tip", "最少1个字符,最多200个字符")}]}>
                            <Input name={permissionDefineID} id={permissionDefineID}
                                   value={formData[permissionDefineID]}
                                   onChange={_this.setField.bind(_this, permissionDefineID)}
                                   placeholder={Intl.get("common.required.tip", "必填项*")}/>
                        </Validator>
                    </FormItem>
                    {index == 1 ? null : (<div className="delete-action-icon-div">
                        <Icon type="minus-circle" className="delete-action "
                              onClick={_this.deleteFormDiv.bind(_this, index)}/>
                    </div>)}
                </div>
            )
        });

        return (
            <div className={btnClass}>
                <RightPanelClose onClick={this.handleCancel}/>
                <div className="right-form-scroll-div">
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <Form horizontal className="form"
                        >
                            <Validation ref="validation"
                                        onValidate={this.handleValidate}
                            >
                                <div className="classifyName-div">
                                    <FormItem
                                        label={Intl.get("authority.group.name", "分组名称")}
                                        id="classifyName"
                                        labelCol={{span: labelCol}}
                                        wrapperCol={{span: 14}}
                                        validateStatus={this.renderValidateStyle('classifyName')}
                                        hasFeedback
                                        help={status.classifyName.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.classifyName.errors && status.classifyName.errors.join(','))}
                                    >
                                        <Validator
                                            rules={[{required: true, min: 1, max : 200 , message: Intl.get("authority.input.length.tip", "最少1个字符,最多200个字符")}]}>
                                            <Input name="classifyName" id="classifyName"
                                                   value={formData.classifyName}
                                                   onChange={this.setField.bind(this, 'classifyName')}
                                                   placeholder={Intl.get("common.required.tip", "必填项*")}/>
                                        </Validator>
                                    </FormItem>
                                </div>
                                {mulitFormElement}
                            </Validation>
                        </Form>
                        <div className="addauthority-btn-class">
                            <RightPanelCancel onClick={_this.handleCancel}>
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消"/>
                            </RightPanelCancel>
                            &nbsp;&nbsp;&nbsp;
                            <RightPanelSubmit onClick={_this.handleSubmit}>
                                <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存"/>
                            </RightPanelSubmit>
                            <Button type="ghost" className="form-addauthority-btn" onClick={_this.addFormDiv}>
                                <ReactIntl.FormattedMessage id="authority.add.new.module" defaultMessage="添加一个权限信息模块"/>
                            </Button>
                            {this.state.saveGroupResult ? (
                                <div className="indicator">
                                    <AlertTimer time={this.state.saveGroupResult=="error"?3000:600}
                                                message={this.state.saveGroupMsg}
                                                type={this.state.saveGroupResult} showIcon
                                                onHide={this.hideSaveTooltip}/>
                                </div>) : null
                            }
                        </div>

                    </GeminiScrollbar>
                    {this.state.isGroupSaving ? (<div className="right-pannel-block">
                        <Spinner className="right-panel-saving"/>
                    </div>) : null}

                </div>
            </div>
        );
    }
});

module.exports = AuthorityForm;
