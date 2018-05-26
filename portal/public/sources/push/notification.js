var noty = require("noty");
//显示通知
function showNotification(options) {
    var {title,content,...props} = options;
    var titleHtml = title ? `<div class="noty-title">${title}</div>` : '';
    var contentHtml = content ? `<div class="noty-content">${content}</div>` : '';
    var text = `<div class="noty-container">${titleHtml}${contentHtml}</div>`;
    var notyOptions = {text,...props};
    return noty(notyOptions);
}
//更新一个通知中的内容
function updateText(notify , options) {
    var {title,content} = options;
    var titleHtml = title ? `<div class="noty-title">${title}</div>` : '';
    var contentHtml = content ? `<div class="noty-content">${content}</div>` : '';
    var text = `<div class="noty-container">${titleHtml}${contentHtml}</div>`;
    notify.setText(text);
}

exports.showNotification = showNotification;
exports.updateText = updateText;