/**
 * Created by wangliping on 2016/4/18.
 */
var userData = require('../../../../public/sources/user-data');
var userAjax = require('../ajax/user-ajax');
var UserActions = require('./user-actions');
var cardEmitter = require('../../../../public/sources/utils/emitters').cardEmitter;
import {getMyTeamTreeAndFlattenList} from 'PUB_DIR/sources/utils/common-data-util';
function UserFormActions() {
    this.generateActions(
        //设置是否正在保存
        'setSaveFlag',
        //保存成员
        'addUser',
        //编辑成员
        'editUser',
        //清空保存后的提示信息
        'resetSaveResult',
        // 昵称（对应的是姓名）唯一性验证
        'checkOnlyNickName',
        //用户名唯一性的验证
        'checkOnlyUserName',
        //邮箱唯一性的验证
        'checkOnlyEmail',
        //电话唯一性的验证
        'checkOnlyPhone',
        // 重置昵称（对应的是姓名）验证的标志
        'resetNickNameFlags',
        //重置用户验证的标志
        'resetUserNameFlags',
        //重置邮箱验证的标志
        'resetEmailFlags',
        //正在获取角色列表
        'setRoleListLoading',
        //是否正在获取销售团队列表的标志
        'setTeamListLoading'
    );

    //获取团队列表
    this.getUserTeamList = function() {
        getMyTeamTreeAndFlattenList(data => {
            if(data.errorMsg) {
                this.dispatch(data.errorMsg || Intl.get('common.get.team.list.failed', '获取团队列表失败'));
            } else {
                this.dispatch(data.teamList);
            }
        });
    };

    //获取角色列表
    this.getRoleList = function() {
        var _this = this;
        var clientId = userData.getUserData().auth.client_id;
        userAjax.getRoleList(clientId).then(function(roleList) {
            _this.dispatch(roleList);
        });
    };

    //保存成员
    this.addUser = function(user) {
        var _this = this;
        userAjax.addUser(user).then(function(savedUser) {
            //保存成功后的处理
            let email = Intl.get('member.add.member.email', '新增成员的邮箱');
            if (savedUser && savedUser.email) {
                email = savedUser.email;
            }
            _this.dispatch({saveResult: 'success', saveMsg: Intl.get('user.info.active.email', '激活邮件已发送至{email}',{email}), savedUser: savedUser});

        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('member.add.failed', '添加失败！') });
        });
    };
    //编辑成员
    this.editUser = function(user) {
        var _this = this;
        userAjax.editUser(user).then(function(data) {
            //修改成功data=true，false:修改失败
            if (data) {
                //保存成功后的处理
                _this.dispatch({saveResult: 'success', saveMsg: Intl.get('common.save.success', '保存成功！')});
                //修改成功后刷新左侧列表对应成员卡片及其详情的数据
                UserActions.afterEditUser(user);
            } else {
                _this.dispatch({saveResult: 'error', saveMsg: Intl.get('common.save.failed', '保存失败!')});
            }
        }, function(errorMsg) {
            //保存失败后的处理
            _this.dispatch({saveResult: 'error', saveMsg: errorMsg || Intl.get('common.save.failed', '保存失败!')});
        });
    };

    //清空提示
    this.resetSaveResult = function(formType, saveResult) {
        if (saveResult === 'success') {
            if (formType === 'add') {
                cardEmitter.emit(cardEmitter.ADD_CARD);
                //清空搜索内容
                UserActions.updateSearchContent('');
            } else if (formType === 'edit') {
                //修改成功后返回详情
                UserActions.returnInfoPanel();
            }
        }
        this.dispatch();
    };

    //昵称（对应的是姓名）唯一性的验证
    this.checkOnlyNickName = function(nickName) {
        var _this = this;
        userAjax.checkOnlyNickName(nickName).then(function(result) {
            _this.dispatch(result);
        }, function(errorMsg) {
            _this.dispatch(errorMsg);
        });
    };

    //电话唯一性的验证
    this.checkOnlyPhone = function(phone, callback) {
        userAjax.checkOnlyPhone(phone).then(function(result) {
            _.isFunction(callback) && callback(result);
        }, function(errorMsg) {
            _.isFunction(callback) && callback(errorMsg || Intl.get('common.phone.is.unique', '电话唯一性校验出错！'));
        });
    };
    //用户名唯一性的验证
    this.checkOnlyUserName = function(userName) {
        userAjax.checkOnlyUserName(userName).then( (result) => {
            this.dispatch(result);
        }, (errorMsg) => {
            this.dispatch(errorMsg);
        });
    };

    //邮箱唯一性的验证
    this.checkOnlyEmail = function(email) {
        var _this = this;
        userAjax.checkOnlyEmail(email).then(function(result) {
            _this.dispatch(result);
            if (!result) {
                //不存在邮箱为email的用户时，验证是否存在用户名为该邮箱的用户
                _this.actions.checkOnlyUserName(email);
            }
        }, function(errorMsg) {
            _this.dispatch(errorMsg || Intl.get('user.email.only.error', '邮箱唯一性验证失败'));
        });
    };
}

module.exports = alt.createActions(UserFormActions);
