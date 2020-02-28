const _ = require('lodash');

/**
 * User是前端界面使用的成员对象
 * @param obj 服务端返回的成员对象
 */
function User(obj) {
    this.userId = obj.user_id || '';
    this.userName = obj.user_name || '';
    this.nickName = obj.nick_name || '';
}

exports.User = User;


//根据成员id获取成员信息
function UserById(obj) {
    this.user_id = obj.user_id || '';
    this.user_name = obj.user_name || '';
    this.nick_name = obj.nick_name || '';
    this.user_logo = obj.user_logo || '';
    this.create_date = _.get(obj, 'create_date', '');
    this.team_name = obj.team_name || '';
    this.team_id = obj.team_id || '';
    this.email_enable = obj.email_enable || false;
    this.email = obj.email || '';
    this.role_name = _.get(obj, 'roles[0].role_name', ''); // 角色
}

exports.UserById = UserById;
