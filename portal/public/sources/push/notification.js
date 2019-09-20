var noty = require('noty');
//显示通知
function showNotification(options) {
    var {title,content,type,...props} = options;
    let icon = '';
    switch(type){
        case 'calls': icon = '<span class="iconfont icon-phone-call-out"></span>';//日程：电联
            break;
        case 'visit': icon = '<span class="iconfont icon-visit-briefcase"></span>';//日程：拜访
            break;
        case 'other': icon = '<span class="iconfont icon-trace-other"></span>';//日程：其他
            break;
        case 'clue': icon = '<span class="iconfont icon-clue"></span>';//线索
            break;
        case 'customer': icon = '<span class="iconfont icon-crm-ico"></span>';//客户
            break;
        case 'release': icon = '<span class="iconfont icon-release"></span>';//批量释放
            break;
        default: icon = '<span class="iconfont icon-release"></span>';//适应旧的图标调用默认为释放
    }
    var titleHtml = title ? `<div class="noty-title"><div class="noty-icon">${icon}</div><h5>${title}</h5></div>` : '';
    var contentHtml = content ? `<div class="noty-content">${content}</div>` : '';
    var text = `<div class="noty-container">${titleHtml}${contentHtml}</div>`;
    var notyOptions = {text,...props};
    return noty(notyOptions);
}
//更新一个通知中的内容
function updateText(notify , options) {
    var contentHtml = content ? `<div class="noty-content">${content}</div>` : '';
    var text = `<div class="noty-container">${titleHtml}${contentHtml}</div>`;
    notify.setText(text);
}

exports.showNotification = showNotification;
exports.updateText = updateText;