require('babel-core/register');
//后端国际化
var BackendIntl = require('../../portal/lib/utils/backend_intl');
function getConfigJson(req) {
    var backendIntl = new BackendIntl(req);
    const ERROR_TIP = {
        ILLEGAL_REQUEST: '',//非法请求
        PARMAM_ERROR: '',//参数错误
    };
    return {
        // es查询类异常
        '00001': {'httpCode': 500, 'message': backendIntl.get('errorcode.35', '很抱歉，服务器出现了异常状况')},
        // es服务器拒绝请求的异常
        '00002': {'httpCode': 500, 'message': backendIntl.get('errorcode.35', '很抱歉，服务器出现了异常状况')},
        // es服务器崩溃异常
        '00003': {'httpCode': 500, 'message': backendIntl.get('errorcode.35', '很抱歉，服务器出现了异常状况')},
        //操作参数错误
        '10001': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        /****************  成员 *******************/
        '10102': {'httpCode': 500, 'message': backendIntl.get('errorcode.1', '获取成员列表失败')},
        '10103': {'httpCode': 500, 'message': backendIntl.get('errorcode.2', '添加成员失败')},
        '10104': {'httpCode': 500, 'message': backendIntl.get('errorcode.3', '修改成员失败')},
        '10105': {'httpCode': 500, 'message': backendIntl.get('errorcode.4', '获取成员失败')},
        '10106': {'httpCode': 500, 'message': backendIntl.get('errorcode.5', '验证失败')},
        '10107': {'httpCode': 500, 'message': backendIntl.get('errorcode.6', '修改密码失败')},
        '10108': {'httpCode': 500, 'message': backendIntl.get('errorcode.7', '获取审计日志失败')},
        '10109': {'httpCode': 500, 'message': backendIntl.get('errorcode.8', '获取登录日志失败')},
        //获取相应角色的成员失败
        '10110': {'httpCode': 500, 'message': backendIntl.get('errorcode.4', '获取成员失败')},
        '10111': {'httpCode': 500, 'message': backendIntl.get('errorcode.9', '该邮箱已激活，无需重复激活')},
        '10113': {'httpCode': 500, 'message': backendIntl.get('errorcode.10', '已发送过激活邮件了，无需重复发送')},
        '10116': {'httpCode': 500, 'message': backendIntl.get('register.phone.has.registed', '该手机号已被注册')},
        '10118': {'httpCode': 500, 'message': backendIntl.get('register.code.validate.expire', '短信验证码已过期')},
        '10119': {'httpCode': 500, 'message': backendIntl.get('register.code.validate.error', '短信验证码验证错误')},
        '10120': {'httpCode': 500, 'message': backendIntl.get('errorcode.12', '您的邮箱未激活，请先激活邮箱')},
        '10121': {'httpCode': 500, 'message': backendIntl.get('register.code.has.send', '短信验证码已经发送，请勿重复发送')},
        '10122': {'httpCode': 500, 'message': backendIntl.get('errorcode.13', '成员授权失败')},
        '10123': {'httpCode': 500, 'message': backendIntl.get('errorcode.14', '原始密码错误')},
        '10124': {'httpCode': 500, 'message': backendIntl.get('errorcode.138', '座席号已存在！')},
        '10126': {'httpCode': 500, 'message': backendIntl.get('errorcode.167', '该手机号已被绑定到其他账号，请先登录原账号解绑')},
        /**用户**/
        '10202': {'httpCode': 500, 'message': backendIntl.get('errorcode.15', '添加用户失败')},
        '10203': {'httpCode': 500, 'message': backendIntl.get('errorcode.16', '获取用户失败')},
        '10204': {'httpCode': 500, 'message': backendIntl.get('errorcode.17', '修改用户失败')},
        //禁用用户的所有应用操作失败
        '10205': {'httpCode': 500, 'message': backendIntl.get('errorcode.18', '禁用应用失败')},
        '10206': {'httpCode': 500, 'message': backendIntl.get('errorcode.19', '审批申请失败')},
        '10207': {'httpCode': 500, 'message': backendIntl.get('errorcode.20', '批量操作失败')},
        '10208': {'httpCode': 500, 'message': backendIntl.get('errorcode.21', '申请开通用户失败')},
        '10209': {'httpCode': 500, 'message': backendIntl.get('errorcode.22', '不是您的客户，不能申请用户')},
        /*修改用户信息*/
        '10210': {'httpCode': 500, 'message': backendIntl.get('errorcode.25', '该手机号已被使用，请用其他手机号')},
        '10211': {'httpCode': 500, 'message': backendIntl.get('errorcode.26', '该邮箱已被使用，请使用其他邮箱')},
        '10212': {'httpCode': 500, 'message': backendIntl.get('errorcode.28', '姓名已存在')},
        '10213': {'httpCode': 500, 'message': backendIntl.get('errorcode.29', '修改邮箱失败')},
        '10214': {'httpCode': 500, 'message': backendIntl.get('errorcode.30', '用户名已被使用')},
        '10215': {'httpCode': 500, 'message': backendIntl.get('errorcode.31', '授权应用失败')},
        '10216': {'httpCode': 500, 'message': backendIntl.get('errorcode.32', '修改授权应用失败')},
        '10217': {'httpCode': 500, 'message': backendIntl.get('errorcode.33', '已经发送了开通该账号的申请，请勿重复申请')},
        '10218': {'httpCode': 500, 'message': backendIntl.get('errorcode.163', '成员数量已达上限')},
        /****************** 认证授权 auth2  *****************/

        '11000': {'httpCode': 500, 'message': backendIntl.get('errorcode.35', '很抱歉，服务器出现了异常状况')},
        //auth2报的非法请求
        '11001': {'httpCode': 500, 'message': ERROR_TIP.ILLEGAL_REQUEST},

        '11011': {'httpCode': 500, 'message': backendIntl.get('errorcode.37', 'Token不存在')},
        '11012': {'httpCode': 500, 'message': backendIntl.get('errorcode.38', 'Token过期')},
        '11041': {'httpCode': 500, 'message': backendIntl.get('errorcode.39', '用户名或密码错误')},
        '11043': {'httpCode': 500, 'message': backendIntl.get('errorcode.40', '用户授权已过期')},
        //用户没有该应用权限，用户不存在
        '11045': {'httpCode': 500, 'message': backendIntl.get('errorcode.137', '您尚未开通此应用')},
        '11046': {'httpCode': 500, 'message': backendIntl.get('errorcode.41', '用户被禁用，请联系管理员')},
        //用户名密码错误，且需要输入验证码
        '11048': {'httpCode': 500, 'message': backendIntl.get('errorcode.39', '用户名或密码错误')},
        //SSO未登录
        '11051': {'httpCode': 500, 'message': backendIntl.get('errorcode.11', '登录失败,请刷新后重试')},
        '11053': {'httpCode': 500, 'message': backendIntl.get('errorcode.login.failed', '登录失败')},
        '11107': {'httpCode': 500, 'message': backendIntl.get('errorcode.43', '验证码错误')},
        //用户不存在
        '11413': {'httpCode': 500, 'message': backendIntl.get('errorcode.39', '用户名或密码错误')},
        //用户密码错误
        '11440': {'httpCode': 500, 'message': backendIntl.get('errorcode.39', '用户名或密码错误')},
        //获取是否绑定微信时报的错
        '11462': {'httpCode': 500, 'message': backendIntl.get('errorcode.different.realm', '安全域不一致')},
        //在其他应用已退出
        //auth2报的错
        '11473': {'httpCode': 500, 'message': backendIntl.get('errorcode.36', '在其他应用已退出')},
        //客套业务接口报的错
        '19401': {'httpCode': 500, 'message': backendIntl.get('errorcode.36', '在其他应用已退出')},
        '11476': {'httpCode': 500, 'message': backendIntl.get('errorcode.42', '你的账号已被停用，请联系管理员')},
        //绑定微信时报的错
        '11520': {'httpCode': 500, 'message': backendIntl.get('errorcode.invalid.wechat', '无效的微信账号')},
        '11521': {'httpCode': 500, 'message': backendIntl.get('errorcode.bound.wechat', '该账号已绑定到其他微信')},
        '11522': {'httpCode': 500, 'message': backendIntl.get('errorcode.wechat.bound.other', '您的微信已绑定到其他账号')},

        /****************** 安全域  ***************** */

        '12001': {'httpCode': 500, 'message': backendIntl.get('errorcode.44', '获取安全域列表失败')},
        '12002': {'httpCode': 500, 'message': backendIntl.get('errorcode.45', '添加安全域失败')},
        '12003': {'httpCode': 500, 'message': backendIntl.get('errorcode.46', '修改安全域失败')},
        '12004': {'httpCode': 500, 'message': backendIntl.get('errorcode.47', '删除安全域失败')},
        '12005': {'httpCode': 500, 'message': backendIntl.get('errorcode.48', '获取安全域失败')},
        //缺少必要参数
        '12006': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        '12007': {'httpCode': 500, 'message': backendIntl.get('errorcode.49', '添加安全域信息异常')},
        '12008': {'httpCode': 500, 'message': backendIntl.get('errorcode.46', '修改安全域失败')},
        //安全域名或域名已经存在
        '12009': {'httpCode': 500, 'message': backendIntl.get('errorcode.50', '安全域名或域名已被使用')},
        //安全域启用或禁用失败
        '12010': {'httpCode': 500, 'message': backendIntl.get('errorcode.46', '修改安全域失败')},
        '12011': {'httpCode': 500, 'message': backendIntl.get('errorcode.51', '配置信息已存在')},
        '12012': {'httpCode': 500, 'message': backendIntl.get('errorcode.52', '添加配置信息失败')},

        /*************************** 应用 *****************************/

        '13001': {'httpCode': 500, 'message': backendIntl.get('errorcode.53', '获取应用列表失败')},
        '13002': {'httpCode': 500, 'message': backendIntl.get('errorcode.54', '添加应用失败')},
        '13003': {'httpCode': 500, 'message': backendIntl.get('errorcode.55', '修改应用失败')},
        '13004': {'httpCode': 500, 'message': backendIntl.get('errorcode.56', '获取应用信息失败')},
        '13005': {'httpCode': 500, 'message': backendIntl.get('errorcode.57', '应用已经存在')},
        '13006': {'httpCode': 500, 'message': backendIntl.get('errorcode.58', '刷新应用标签失败')},
        '13007': {'httpCode': 500, 'message': backendIntl.get('errorcode.59', '应用扩展信息已存在')},
        '13008': {'httpCode': 500, 'message': backendIntl.get('errorcode.60', '添加应用扩展信息失败')},

        /*************************** 客户 *****************************/

        '14001': {'httpCode': 500, 'message': backendIntl.get('errorcode.61', '获取客户列表失败')},
        '14002': {'httpCode': 500, 'message': backendIntl.get('errorcode.62', '添加客户失败')},
        //存在同名的客户
        '14003': {'httpCode': 500, 'message': backendIntl.get('errorcode.63', '客户名称已被使用')},
        '14004': {'httpCode': 500, 'message': backendIntl.get('errorcode.64', '客户的手机号已被使用')},
        '14005': {'httpCode': 500, 'message': backendIntl.get('errorcode.65', '上传客户失败，文件格式不正确')},
        '14006': {'httpCode': 500, 'message': backendIntl.get('errorcode.67', '修改客户失败')},
        //不是团队拥有者
        '14007': {'httpCode': 500, 'message': backendIntl.get('errorcode.68', '没有权限')},
        '14008': {'httpCode': 500, 'message': backendIntl.get('errorcode.69', '迁移客户失败')},
        '14009': {'httpCode': 500, 'message': backendIntl.get('errorcode.70', '删除客户失败')},
        '14010': {'httpCode': 500, 'message': backendIntl.get('errorcode.71', '电话号码已存在')},
        '14011': {'httpCode': 500, 'message': backendIntl.get('errorcode.72', '提醒时间必须大于当前时间')},
        //更新内容是空不做处理
        '14012': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        //团队管理员才有权限处理
        '14013': {'httpCode': 500, 'message': backendIntl.get('errorcode.68', '没有权限')},
        '14101': {'httpCode': 500, 'message': backendIntl.get('errorcode.73', '添加联系人失败')},
        '14102': {'httpCode': 500, 'message': backendIntl.get('errorcode.74', '客户不存在')},
        '14103': {'httpCode': 500, 'message': backendIntl.get('errorcode.71', '电话号码已存在')},
        '14104': {'httpCode': 500, 'message': backendIntl.get('errorcode.75', '修改联系人失败')},
        '14105': {'httpCode': 500, 'message': backendIntl.get('errorcode.76', '设置联系人失败')},
        '14106': {'httpCode': 500, 'message': backendIntl.get('errorcode.77', '删除联系人失败')},
        '14107': {'httpCode': 500, 'message': backendIntl.get('errorcode.78', '查询联系人失败')},
        '14201': {'httpCode': 500, 'message': backendIntl.get('errorcode.79', '添加订单失败')},
        '14202': {'httpCode': 500, 'message': backendIntl.get('errorcode.74', '客户不存在')},
        '14203': {'httpCode': 500, 'message': backendIntl.get('errorcode.80', '删除订单失败')},
        '14204': {'httpCode': 500, 'message': backendIntl.get('errorcode.81', '修改订单失败')},
        '14205': {'httpCode': 500, 'message': backendIntl.get('errorcode.82', '查询订单对应客户失败')},
        '14206': {'httpCode': 500, 'message': backendIntl.get('errorcode.83', '查询订单失败')},
        //客户跟进记录部分
        '80001': {'httpCode': 500, 'message': backendIntl.get('errorcode.134', '添加跟进记录失败')},
        '80002': {'httpCode': 500, 'message': backendIntl.get('errorcode.135', '获取跟进记录失败')},
        '80003': {'httpCode': 500, 'message': backendIntl.get('errorcode.136', '更新跟进记录失败')},

        // 客户管理，拨打电话
        '90001': {'httpCode': 500, 'message': backendIntl.get('errorcode.143', '通话系统出现未知异常')},
        '90002': {'httpCode': 500, 'message': backendIntl.get('errorcode.144', '通话系统没有响应')},
        '90003': {'httpCode': 500, 'message': backendIntl.get('errorcode.145', '座机繁忙')}, // 分机振铃或者通话中
        '90004': {'httpCode': 500, 'message': backendIntl.get('errorcode.145', '座机繁忙')}, // 分机等待拨号
        '90005': {'httpCode': 500, 'message': backendIntl.get('errorcode.146', '分机离线')},
        '90006': {'httpCode': 500, 'message': backendIntl.get('errorcode.get.call.statistics.failed', '获取通话记录统计失败')},
        '90009': {'httpCode': 500, 'message': backendIntl.get('failed.to.get.clue.customer.list', '获取线索列表失败')},
        '90021': {'httpCode': 500, 'message': backendIntl.get('errorcode.140', '没有权限执行分配线索客户的操作')},
        '90022': {'httpCode': 500, 'message': backendIntl.get('errorcode.141', '该成员不属于您管理')},
        '90023': {'httpCode': 500, 'message': backendIntl.get('errorcode.139', '被分配的用户ID不能为空')},
        '90024': {'httpCode': 500, 'message': backendIntl.get('errorcode.142', '线索不存在')},
        '90010': {'httpCode': 500, 'message': backendIntl.get('errorcode.150', '修改线索信息失败')},
        '90031': {'httpCode': 500, 'message': backendIntl.get('errorcode.152', '线索重复')},
        '90032': {'httpCode': 500, 'message': backendIntl.get('errorcode.175', '自己的线索不能分配给自己')},
        '90061': {'httpCode': 500, 'message': backendIntl.get('errorcode.162', '已达到一天的提取上限')},
        '90064': {'httpCode': 500, 'message': backendIntl.get('errorcode.165', '已达到本月的提取上限')},
        '90065': {'httpCode': 500, 'message': backendIntl.get('errorcode.168', '符合条件的线索已被提取完成，请修改条件再查看')},
        '90060': {'httpCode': 500, 'message': backendIntl.get('errorcode.169', '该线索已被提取')},
        '90066': {'httpCode': 500, 'message': backendIntl.get('errorcode.170', '您选择的线索都已经被提取')},
        '90071': {'httpCode': 500, 'message': backendIntl.get('errorcode.171', '不是您的线索，无法转为客户')},
        '90072': {'httpCode': 500, 'message': backendIntl.get('errorcode.172', '不是您的线索，无法合并到客户')},
        '90073': {'httpCode': 500, 'message': backendIntl.get('errorcode.173', '线索转为客户失败')},
        '90074': {'httpCode': 500, 'message': backendIntl.get('errorcode.174', '线索合并到客户失败')},

        '190001': {'httpCode': 500, 'message': backendIntl.get('errorcode.phone.busy', '座机繁忙，请稍后再试！')},//总机返回busy，分机忙

        /*************************** 角色权限 *****************************/
        '15101': {'httpCode': 500, 'message': backendIntl.get('errorcode.84', '添加角色失败')},
        '15102': {'httpCode': 500, 'message': backendIntl.get('errorcode.85', '修改角色失败')},
        '15103': {'httpCode': 500, 'message': backendIntl.get('errorcode.86', '获取角色列表失败')},
        '15104': {'httpCode': 500, 'message': backendIntl.get('role.del.role.failed', '删除角色失败')},
        '15106': {'httpCode': 500, 'message': backendIntl.get('errorcode.87', '删除角色失败，存在拥有该角色的用户')},
        //角色操作参数错误
        '15105': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        '15201': {'httpCode': 500, 'message': backendIntl.get('errorcode.89', '添加权限失败')},
        '15202': {'httpCode': 500, 'message': backendIntl.get('errorcode.90', '修改权限失败')},
        '15203': {'httpCode': 500, 'message': backendIntl.get('errorcode.91', '修改权限名称失败')},
        '15204': {'httpCode': 500, 'message': backendIntl.get('errorcode.92', '获取权限列表失败')},
        //权限操作参数错误
        '15205': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        '15206': {'httpCode': 500, 'message': backendIntl.get('errorcode.93', '删除权限失败，存在拥有该权限的用户')},

        /***************************销售阶段、团队&组织 *****************************/
        '16101': {'httpCode': 500, 'message': backendIntl.get('errorcode.95', '获取销售阶段失败')},
        '16102': {'httpCode': 500, 'message': backendIntl.get('errorcode.96', '删除销售阶段失败')},
        '16103': {'httpCode': 500, 'message': backendIntl.get('errorcode.97', '添加销售阶段失败')},
        '16104': {'httpCode': 500, 'message': backendIntl.get('errorcode.98', '添加默认销售阶段失败')},
        '16105': {'httpCode': 500, 'message': backendIntl.get('errorcode.99', '修改销售阶段失败')},
        /**团队**/
        '16201': {'httpCode': 500, 'message': backendIntl.get('errorcode.100', '添加销售团队失败')},
        '16202': {'httpCode': 500, 'message': backendIntl.get('errorcode.101', '修改销售团队失败')},
        '16203': {'httpCode': 500, 'message': backendIntl.get('errorcode.102', '获取销售团队列表失败')},
        '16204': {'httpCode': 500, 'message': backendIntl.get('errorcode.103', '删除销售团队失败')},
        '16205': {'httpCode': 500, 'message': backendIntl.get('errorcode.104', '修改销售团队成员失败')},
        '16206': {'httpCode': 500, 'message': backendIntl.get('errorcode.105', '获取团队中的成员失败')},
        '16207': {'httpCode': 500, 'message': backendIntl.get('errorcode.106', '获取不属于任何组织下的成员失败')},
        '16208': {'httpCode': 500, 'message': backendIntl.get('errorcode.107', '获取成员所在用户组信息失败')},
        '16209': {'httpCode': 500, 'message': backendIntl.get('errorcode.108', '判断成员是否为用户组owner失败')},
        //用户组操作参数错误
        '16210': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        '16211': {'httpCode': 500, 'message': backendIntl.get('errorcode.110', '获取团队失败')},
        '16212': {'httpCode': 500, 'message': backendIntl.get('errorcode.111', '团队名已存在')},
        '16213': {'httpCode': 500, 'message': backendIntl.get('errorcode.112', '不能删除，当前团队存在下级团队')},
        '16214': {'httpCode': 500, 'message': backendIntl.get('errorcode.149', '已有成员设置了该职务，不能删除')},
        //组织管理
        '16220': {'httpCode': 500, 'message': backendIntl.get('errorcode.114', '删除组织失败')},
        '16221': {'httpCode': 500, 'message': backendIntl.get('errorcode.115', '修改组织失败')},
        '16222': {'httpCode': 500, 'message': backendIntl.get('errorcode.116', '组织名已经存在')},
        '16223': {'httpCode': 500, 'message': backendIntl.get('errorcode.113', '不能删除，当前组织存在下级组织')},

        /*************************** 分析 *****************************/
        //该用户角色无分析相关应用权限
        '17100': {'httpCode': 500, 'message': backendIntl.get('errorcode.68', '没有权限')},
        //获取综合用户统计数据失败
        '17101': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积用户团队统计数据失败
        '17102': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增用户团队统计数据失败
        '17103': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积过期用户团队统计数据失败
        '17104': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增过期用户团队统计数据失败
        '17105': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积用户地域统计数据失败
        '17106': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增用户地域统计数据失败
        '17107': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积过期用户地域统计数据失败
        '17108': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增过期用户地域统计数据失败
        '17109': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积用户行业统计数据失败
        '17110': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增用户行业统计数据失败
        '17111': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积过期用户行业统计数据失败
        '17112': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增过期用户行业统计数据失败
        '17113': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积用户趋势统计数据失败
        '17114': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增用户趋势统计数据失败
        '17115': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取累积过期用户趋势统计数据失败
        '17116': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取新增过期用户趋势统计数据失败
        '17117': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取在线用户信息失败
        '17118': {'httpCode': 500, 'message': backendIntl.get('errorcode.119', '获取在线用户列表失败')},
        //查看用户活跃度统计失败
        '17120': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看应用用户成员分布失败
        '17121': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看新增用户活跃度统计失败
        '17122': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看新增过期用户活跃度统计失败
        '17123': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查询过期用户登录时长分布失败
        '17124': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查询所有用户登录时长分布失败
        '17125': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //根据条件查询管理用户失败
        '17126': {'httpCode': 500, 'message': backendIntl.get('errorcode.120', '获取用户列表失败')},
        //根据用户列表查询用户信息失败
        '17127': {'httpCode': 500, 'message': backendIntl.get('errorcode.121', '获取用户失败')},
        '17197': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        //缺少必要的参数
        '17198': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        //该用户角色无分析权限
        '17199': {'httpCode': 500, 'message': backendIntl.get('errorcode.68', '没有权限')},
        /**客户**/
        //查看相关客户数失败
        '17201': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户时间趋势失败
        '17202': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户地域分布失败
        '17203': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户行业分布失败
        '17204': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17205': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17206': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17207': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17208': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17209': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17210': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17211': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17212': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17213': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17214': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17215': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17216': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17217': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17218': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17219': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17220': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17221': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17222': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //查看累积客户销售团队分布失败
        '17223': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //用户角色无分析客户数据权限
        '17299': {'httpCode': 500, 'message': backendIntl.get('errorcode.68', '没有权限')},
        //统计通话的客户的地域,阶段,行业分布失败
        '17331': {'httpCode': 500, 'message': backendIntl.get('errorcode.17331', '统计通话的客户的地域,阶段,行业分布失败')},
        //获取最近联系客户统计失败
        '17334': {'httpCode': 500, 'message': backendIntl.get('errorcode.17334', '获取最近联系客户统计失败')},
        /**日志**/
        //获取相关审计日志过程中发生内部错误
        '17400': {'httpCode': 500, 'message': backendIntl.get('errorcode.122', '网络请求异常')},
        //获取用户登录时长统计数据失败
        '17408': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //获取用户登录最活跃时段失败
        '17409': {'httpCode': 500, 'message': backendIntl.get('errorcode.118', '获取数据失败')},
        //无获取相关应用审计日志的权限
        '17410': {'httpCode': 500, 'message': backendIntl.get('errorcode.68', '没有权限')},
        //根据成员名查询成员操作日志失败
        '17411': {'httpCode': 500, 'message': backendIntl.get('errorcode.123', '获取成员操作日志失败')},
        //试用用户覆盖率
        '17240': {'httpCode': 500, 'message': backendIntl.get('errorcode.150', '获取客户区域覆盖情况统计数据失败')},
        //获取即将到期的客户统计数据失败
        '17241': {'httpCode': 500, 'message': backendIntl.get('errorcode.164', '获取即将到期的客户统计数据失败')},
        //销售新开客户数
        '17242': {'httpCode': 500, 'message': backendIntl.get('errorcode.151', '获取销售新开客户数和新开帐号数失败')},	
        /*************************** 申请消息 *****************************/
        /*申请消息*/
        '18201': {'httpCode': 500, 'message': backendIntl.get('errorcode.124', '修改申请失败')},
        '18202': {'httpCode': 500, 'message': backendIntl.get('errorcode.125', '获取申请失败')},
        '18203': {'httpCode': 500, 'message': backendIntl.get('errorcode.126', '获取申请消息个数失败')},
        '18204': {'httpCode': 500, 'message': backendIntl.get('errorcode.127', '处理申请失败')},
        '18205': {'httpCode': 500, 'message': backendIntl.get('errorcode.128', '获取申请消息列表失败')},
        /*业务认证（过滤）*/
        //用户名或密码为空
        '19100': {'httpCode': 500, 'message': backendIntl.get('errorcode.39', '用户名或密码错误')},
        //用户认证失败
        '19101': {'httpCode': 500, 'message': backendIntl.get('errorcode.39', '用户名或密码错误')},
        '19102': {'httpCode': 500, 'message': backendIntl.get('errorcode.41', '用户被禁用，请联系管理员')},
        //请求缺少token
        '19200': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        //请求缺少userId
        '19201': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误，界面上不提示此类错误，展示具体的错误描述
        //请求缺少realm
        '19202': {'httpCode': 500, 'message': ERROR_TIP.PARMAM_ERROR},//参数错误
        '19300': {'httpCode': 500, 'message': backendIntl.get('errorcode.38', 'Token过期')},
        '19301': {'httpCode': 500, 'message': backendIntl.get('errorcode.129', '账户在其他地方登录')},
        '19302': {'httpCode': 500, 'message': backendIntl.get('errorcode.37', 'Token不存在')},
        '19400': {'httpCode': 500, 'message': backendIntl.get('errorcode.130', '没有操作权限')},
        '20001': {'httpCode': 500, 'message': backendIntl.get('errorcode.122', '网络请求异常')},
        '20002': {'httpCode': 500, 'message': ERROR_TIP.ILLEGAL_REQUEST},//非法请求，界面上不提示此类错误，展示具体的错误描述
        '20004': {'httpCode': 500, 'message': backendIntl.get('errorcode.161', '文件上传失败')},
        '20007': {'httpCode': 500, 'message': backendIntl.get('errorcode.organization.expire', '您的账号已到期')},
        '20008': {'httpCode': 500, 'message': backendIntl.get('errorcode.organization.expire', '您的账号已到期')},
        /*扫码登录*/
        '11058': {'httpCode': 500, 'message': ''},//请用APP扫描二维码的错误码，界面上不需要提示此错误
        '11059': {'httpCode': 500, 'message': backendIntl.get('errorcode.147', '二维码已失效')},
        /*添加合同*/
        '30001': {'httpCode': 500, 'message': backendIntl.get('contract.add.error', '添加合同失败')},
        '30002': {'httpCode': 500, 'message': backendIntl.get('contract.edit.error', '修改合同失败')},
        '30610': {'httpCode': 500, 'message': backendIntl.get('contract.add.error', '添加合同失败')},
        '30008': {'httpCode': 500, 'message': backendIntl.get('contract.invocie.delete.faild', '删除发票额失败')},
        /*周报统计*/
        '90008': {'httpCode': 500, 'message': backendIntl.get('errorcode.148', '电话时长统计视图获取失败')},
        /*批量处理线索*/
        '90012': {'httpCode': 500, 'message': backendIntl.get('errorcode.clue.batch.change.pending', '上次批量操作未完成，请稍后再试')},
        '90054': {'httpCode': 500, 'message': backendIntl.get('errorcode.clue.batch.change.pending', '上次批量操作未完成，请稍后再试')},
        '90055': {'httpCode': 500, 'message': backendIntl.get('errorcode.clue.batch.change.pending', '上次批量操作未完成，请稍后再试')},
        /*销售流程*/
        '100001': {'httpCode': 500, 'message': backendIntl.get('errorcode.153', '添加销售流程失败')},
        '100002': {'httpCode': 500, 'message': backendIntl.get('errorcode.154', '获取销售流程失败')},
        '100003': {'httpCode': 500, 'message': backendIntl.get('errorcode.155', '添加客户阶段失败')},
        '100004': {'httpCode': 500, 'message': backendIntl.get('errorcode.156', '获取客户阶段失败')},
        '100005': {'httpCode': 500, 'message': backendIntl.get('errorcode.157', '更新销售流程失败')},
        '100006': {'httpCode': 500, 'message': backendIntl.get('errorcode.158', '更新客户流程失败')},
        '100007': {'httpCode': 500, 'message': backendIntl.get('errorcode.159', '删除销售流程失败')},
        '100008': {'httpCode': 500, 'message': backendIntl.get('errorcode.160', '删除客户流程失败')},
        /*负责人及联合跟进人*/
        '14015': {'httpCode': 500, 'message': backendIntl.get('crm.no.permissions.update.sales', '您没有权限修改负责人')},
        '14016': {'httpCode': 500, 'message': backendIntl.get('crm.no.permissions.update.second.team', '您没有权限修改联合跟进人')},
        /*批量变更客户*/
        '14020': {'httpCode': 500, 'message': backendIntl.get('crm.batch.change.customer.pending', '上次批量操作未完成，请稍后再试')},
        /*其他*/
        'error-code-not-found': {'httpCode': 500, 'message': backendIntl.get('errorcode.132', '未知错误')},
        'request-timeout': {'httpCode': 500, 'message': backendIntl.get('errorcode.133', '服务器繁忙或网络不正常，请稍后再试')},
        'rest-error': {'httpCode': 500, 'message': backendIntl.get('login.service.error', '很抱歉,服务器出现了异常状况')},
        'default-error': {'httpCode': 500, 'message': backendIntl.get('errorcode.133', '服务器繁忙或网络不正常，请稍后再试')}
    };
}
exports.getConfigJson = getConfigJson;
