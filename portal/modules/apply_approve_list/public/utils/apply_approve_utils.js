export const APPLY_TYPE = {
    APPLY_BY_ME: 'apply_by_me',
    APPROVE_BY_ME: 'approve_by_me',
    APPLY_BY_TEAM: 'apply_by_team',
};
export const APPLY_APPROVE_TAB_TYPES = [{
    value: APPLY_TYPE.APPLY_BY_ME,
    name: Intl.get('apply.approve.list.start.by.me', '我申请的')
}, {
    value: APPLY_TYPE.APPROVE_BY_ME,
    name: Intl.get('apply.approve.list.approved.by.me', '我审批的')
}, {
    value: APPLY_TYPE.APPLY_BY_TEAM,
    name: Intl.get('apply.approve.list.approved.by.team', '团队申请')
}];
export const APPLY_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA: 64,
    BOTTOM_DELTA: 80,
    APPLY_LIST_WIDTH: 336
};
export const getApplyListDivHeight = function() {
    if ($(window).width() < Oplate.layout['screen-md']) {
        return 'auto';
    }
    return $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
};