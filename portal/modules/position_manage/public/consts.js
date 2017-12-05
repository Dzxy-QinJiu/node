// 国际化常量
// 用户
export const USER = {
    bind: Intl.get('user.position.bind.user', '绑定用户'),
    first: Intl.get('user.position.bind.user.tips', '请绑定用户'),
    tips: Intl.get('user.position.tips.no.user', '暂无此用户'),
    placeholder: Intl.get('user.position.user.placeholder', '输入用户名称搜索'),
    unbind: Intl.get('user.position.unbind.user', '暂无未绑定的用户'),
    user: Intl.get('sales.home.user', '用户'),
    select: Intl.get('user.position.select.user', '请选择用户')
};

// 组织
export const ORGANIZATION = {
    select: Intl.get('user.position.select.organization', '选择组织'),
    first: Intl.get('user.position.select.organization.first', '请先选择组织'),
    tips: Intl.get('user.position.tips.no.organization', '暂无此组织'),
    placeholder: Intl.get('user.position.input.name.search', '输入组织名称搜索'),
    option: Intl.get('user.no.organization', '暂无组织'),
    organ: Intl.get('user.organization', '组织')
};

// 城市
export const CITY = {
    cs: Intl.get('user.position.area.changsha', '长沙'),
    jn: Intl.get('user.position.area.jinan', '济南'),
    bj: Intl.get('user.position.area.beijing', '北京'),
    area: Intl.get('crm.96', '地域'),
    select: Intl.get('crm.address.placeholder', '请选择地域')

};

export const POSITION = {
    tips: Intl.get('user.position.input.tips', '请输入数字'),
    number: Intl.get('user.manage.phone.order', '座席号'),
    placeholder: Intl.get('user.position.number.tips', '请输入座席号')
};