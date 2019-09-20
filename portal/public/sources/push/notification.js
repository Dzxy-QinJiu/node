var noty = require('noty');
//显示通知
function showNotification(options) {
    var {title,content,type,...props} = options;
    let iconHtml = type ? `<div class="noty-icon">${switchIcon(type)}</div>` : '';
    var titleHtml = title ? `<div class="noty-title${!type ? ' noIcon' : ''}">${iconHtml}<h5>${title}</h5></div>` : '';
    var contentHtml = content ? `<div class="noty-content${!type ? ' noIcon' : ''}">${content}</div>` : '';
    var text = `<div class="noty-container">${titleHtml}${contentHtml}</div>`;
    var notyOptions = {text,...props};
    return noty(notyOptions);
}
//更新一个通知中的内容
function updateText(notify , options) {
    var {title,content,type} = options;
    let iconHtml = type ? `<div class="noty-icon">${switchIcon(type)}</div>` : '';
    var titleHtml = title ? `<div class="noty-title${!type ? ' noIcon' : ''}">${iconHtml}<h5>${title}</h5></div>` : '';
    var contentHtml = content ? `<div class="noty-content${!type ? ' noIcon' : ''}">${content}</div>` : '';
    var text = `<div class="noty-container">${titleHtml}${contentHtml}</div>`;
    notify.setText(text);
}

//根据type匹配图标
function switchIcon(type) {
    let list = {
        calls: 'icon-phone-call-out',//日程：电联
        visit: 'icon-visit-briefcase',//日程：拜访
        other: 'icon-trace-other',//日程：其他
        clue: 'icon-clue',//线索
        customer: 'icon-crm-ico',//客户
        release: ' icon-release',//批量释放
    };
    let icon = `<span class="iconfont ${_.get(list,type,'')}"></span>`;
    return icon;
}

exports.showNotification = showNotification;
exports.updateText = updateText;