//去除json对象中的空白项
const removeEmptyItem = function (obj) {
    _.each(obj, (v, k) => {
        if (v === "") delete obj[k];
        if (_.isArray(v)) {
            _.each(v, (subv) => {
                if (subv === "") delete obj[k];
                else if (_.isObject(subv)) {
                    removeEmptyItem(subv);
                    if (Object.keys(subv).length === 0) delete obj[k];
                }
            });
        }
    });
};
//将后端传来的字段拼接成句子
const processForTrace = function (item) {
    var traceObj = {
        traceDsc: "",
        iconClass: "",
        title: "",
        detail :""
    };
    if (_.isObject(item)) {
        //渲染时间线
        var iconClass = '', title = '', des = '', contact = '', billsec = '', tip = [];
        //根据不同的类型
        if (item.type) {
            switch (item.type) {
                case 'visit':
                    iconClass = 'icon-visit';
                    title = Intl.get("customer.visit", "拜访");
                    des = Intl.get("customer.visit.customer", "拜访客户");
                    break;
                case 'phone':
                    iconClass = 'icon-call-back';
                    title = Intl.get("customer.phone.system", "电话系统");
                    des = Intl.get("customer.contact.customer", "联系客户");
                    break;
                case 'app':
                    iconClass = 'icon-ketao-app';
                    title = Intl.get("customer.ketao.app", "客套app");
                    des = Intl.get("customer.contact.customer", "联系客户");
                    break;
                case 'other':
                    iconClass = 'icon-other';
                    title = Intl.get("customer.other", "其他");
                    des = Intl.get("customer.follow.customer", "跟进客户");
                    break;
            }
        };
        tip.push(des);
        iconClass += ' iconfont';
        contact = (item.contact_name || item.phone) ? Intl.get('customer.contact.somebody', '联系') : '';
        contact += item.contact_name && item.phone ? (item.contact_name + '（' + item.phone + '）') : '';
        contact += item.contact_name && !item.phone ? (item.contact_name) : '';
        contact += !item.contact_name && item.phone ? (item.phone) : '';
        contact && tip.push(contact);
        billsec = item.billsec == 0 ? (Intl.get("customer.no.connect", "未接通")) : (item.billsec ? Intl.get("customer.call.duration", "通话{num}秒", {'num': item.billsec}) : '');
        billsec && tip.push(billsec);
        traceObj.traceDsc = tip.join('，');
        traceObj.iconClass = iconClass;
        traceObj.title = title;
        traceObj.detail = item.detail;
    }
    return traceObj;
};
//行政级别
exports.administrativeLevels = [{id:"1",level:"省部级"},{id:"2",level:"地市级"},{id:"3",level:"区县级"}];
exports.removeEmptyItem = removeEmptyItem;
exports.processForTrace = processForTrace;

