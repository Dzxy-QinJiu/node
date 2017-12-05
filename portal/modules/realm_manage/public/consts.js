/**
 * 国际化提取常量
 * */

// 邮箱服务器配置
export const EMAIL = {
    emailLabel: Intl.get('common.email', '邮箱'),
    emailMessage: Intl.get('member.input.email', '请输入邮箱'),
    passwordMessage: Intl.get('common.input.password', '请输入密码'),
    hostLabel: Intl.get('realm.email.host', '服务器地址'),
    hostMessage: Intl.get('realm.email.host.message', '请输入邮件服务器地址'),
    portLabel: Intl.get('realm.email.port', '端口'),
    portMessage: Intl.get('realm.email.port.message', '请输入邮件服务器端口号'),
    protocolLabel: Intl.get('realm.email.protocol', '发送协议'),
    protocolMessage: Intl.get('realm.email.protocol.message', '请输入发送邮件协议'),
    title: Intl.get('realm.email.title', '邮箱服务器配置信息'),
    editTitle: Intl.get('realm.email.edit.title', '修改邮箱服务器的配置信息'),
    setTitle: Intl.get('realm.email.set.title', '配置邮箱服务器'),
    errMsgTips: Intl.get('realm.email.set.error', '配置邮箱服务器失败')
};


// 短信服务器配置
export const SMS = {
    smsLabel: Intl.get('common.username', '用户名'),
    smsMessage: Intl.get('realm.sms.username', '请输入短信网关用户名'),
    passwordMessage: Intl.get('realm.sms.password.message', '请输入短信网关密码'),
    title: Intl.get('realm.sms.title', '短信服务器配置信息'),
    editTitle: Intl.get('realm.sms.edit.title', '修改短信服务器的配置信息'),
    setTitle: Intl.get('realm.sms.set.title', '配置短信服务器'),
    errMsgTips: Intl.get('realm.sms.set.error', '配置短信服务器失败')
};

// 微信公众号配置
export const WECHAT = {
    wechatLabel: Intl.get('realm.wechat.id.label', 'ID'),
    wechatMessage: Intl.get('realm.wechat.id.placeholder', '请输入微信公众号ID'),
    secretLabel: Intl.get('realm.wechat.secret.label', '密钥'),
    secretMessage: Intl.get('realm.wechat.secret.placeholder', '请输入微信公众号密钥'),
    title: Intl.get('realm.wechat.title', '微信公众号配置信息'),
    editTitle: Intl.get('realm.wechat.edit.title', '修改微信公众号的配置信息'),
    setTitle: Intl.get('realm.wechat.set.title', '配置微信公众号'),
    errMsgTips: Intl.get('realm.wechat.set.error', '配置微信公众号失败')
};

// 短信和邮箱设置公共常量
export const COMMON = {
    password: Intl.get('common.password', '密码'),
    passwordSercet: Intl.get('user.password.tip', '保密中'),
    sure: Intl.get('common.sure', '确定'),
    cancel: Intl.get('common.cancel', '取消'),
};