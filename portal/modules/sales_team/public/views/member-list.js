/**
 * Created by xiaojinfeng on 2016/04/13.
 */

import {InputNumber, Button, Popconfirm} from "antd";
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var DefaultUserLogoTitle = require("../../../../components/default-user-logo-title");
var Spinner = require("../../../../components/spinner");
var AlertTimer = require("../../../../components/alert-timer");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var SearchInput = require("../../../../components/searchInput");
var classNames = require("classnames");
var SalesTeamAction = require("../action/sales-team-actions");
var MemberListEditAction = require("../action/member-list-edit-actions");
var MemberListEditStore = require("../store/member-list-edit-store");
import salesTeamAjax from "../ajax/sales-team-ajax";
import Trace from "LIB_DIR/trace";

//成员的类型
const MEMBER_TYPE = {
    OWNER: "owner",//负责人
    MANAGER: "manager",//秘书
    USER: "user"//成员
};
//销售目标的类型
const SALES_GOALS_TYPE = {
    MEMBER: "member",//个人销售目标
    TEAM: "team"//团队销售目标
};
function noop() {
}
var MemberList = React.createClass({
    getDefaultProps: function () {
        return {
            getIsDeleteMember: noop,
            addMember: noop,
            saveEditMember: noop,
            cancelEditMember: noop,
            saveAddMember: noop,
            cancelAddMember: noop
        }
    },

    getInitialState: function () {
        var savingFlags = MemberListEditStore.getState();
        return {
            searchValue: "",
            addMemberList: $.extend(true, [], this.props.addMemberList),
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj),
            salesGoals: _.extend({}, this.props.salesGoals),
            isMemberListSaving: savingFlags.isMemberListSaving,//是否正在保存修改的成员列表
            saveMemberListResult: savingFlags.saveMemberListResult,//error，success
            saveMemberListMsg: savingFlags.saveMemberListMsg,//保存结果的提示信息
            saveMemberListObj: {},//修改、添加时要保存的数据对象
            teamConfirmVisible: false,
            memberConfirmVisible: false
        };
    },
    onChange: function () {
        var savingFlags = MemberListEditStore.getState();
        this.setState({
            isMemberListSaving: savingFlags.isMemberListSaving,
            saveMemberListResult: savingFlags.saveMemberListResult,
            saveMemberListMsg: savingFlags.saveMemberListMsg
        });
    },
    componentDidMount: function () {
        MemberListEditStore.listen(this.onChange);
    },

    componentWillUnmount: function () {
        MemberListEditStore.unlisten(this.onChange);
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState(this.getInitialState());
        this.setState({
            addMemberList: $.extend(true, [], nextProps.addMemberList),
            curShowTeamMemberObj: $.extend(true, {}, nextProps.curShowTeamMemberObj)
        });
    },

    cleanSearchInput: function () {
        this.setState({
            searchValue: ""
        });
        $(".sales-team-member-add-container .search-input").val("");
    },

    selectMember: function (salesTeamMember) {
        if (this.props.isAddMember) {
            this.state.addMemberList.forEach(function (member) {
                if (member && (member.userId == salesTeamMember.userId)) {
                    member.selected = !member.selected;
                }
            });
            this.setState({
                addMemberList: this.state.addMemberList
            });
        } else {
            //删除、编辑
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            //负责人存在
            if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.userId == salesTeamMember.userId) {
                curShowTeamMemberObj.owner.selected = !curShowTeamMemberObj.owner.selected;
                this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
                return;
            }
            //秘书存在
            if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
                var findManager = false;
                _.some(curShowTeamMemberObj.managers, function (member) {
                    if (member && (member.userId == salesTeamMember.userId)) {
                        member.selected = !member.selected;
                        findManager = true;
                        return findManager;
                    }
                });
                if (findManager) {
                    this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
                    return;
                }
            }
            //成员存在
            if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
                _.some(curShowTeamMemberObj.users, function (member) {
                    if (member && (member.userId == salesTeamMember.userId)) {
                        member.selected = !member.selected;
                        return true;
                    }
                });
                this.setState({curShowTeamMemberObj: curShowTeamMemberObj});
            }
        }
    },

    //还原团队成员对象
    resetCurShowTeamMemberObj: function () {
        this.setState({
            curShowTeamMemberObj: $.extend(true, {}, this.props.curShowTeamMemberObj)
        });
    },

    //还原添加团队成员对象
    resetAddMemberList: function () {
        this.setState({addMemberList: $.extend(true, [], this.props.addMemberList)});
    },
    addMember: function () {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (!this.props.isAddMember) {
            this.resetAddMemberList();
            SalesTeamAction.getIsAddMember();
            this.cleanSearchInput();
        }
    },

    editMember: function () {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (!this.props.isEditMember) {
            this.resetCurShowTeamMemberObj();
            SalesTeamAction.getIsEditMember();
            this.cleanSearchInput();
        }
    },

    //确认的处理
    handleOK: function (e) {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (this.props.isAddMember) {
            Trace.traceEvent(e,"保存添加团队成员的修改");
            this.saveAddMember();
        } else if (this.props.isEditMember) {
            Trace.traceEvent(e,"保存编辑团队成员的修改");
            this.saveEditMember();
        }
    },

    //取消的处理
    handleCancel: function (e) {
        //如果有确认保存的提示框，应先保存或取消保存后再进行操作
        if (this.state.teamConfirmVisible || this.state.memberConfirmVisible) {
            return;
        }
        if (this.props.isAddMember) {
            SalesTeamAction.cancelAddMember();
            this.resetAddMemberList();
            Trace.traceEvent(e,"取消添加团队成员的修改");
        } else if (this.props.isEditMember) {
            SalesTeamAction.cancelEditMember();
            this.resetCurShowTeamMemberObj();
            Trace.traceEvent(e,"取消编辑团队成员的修改");
        }
        this.cleanSearchInput();
    },

    saveEditMember: function () {
        var ownerId = "", managerIds = [], userIds = [];
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //负责人
        if (curShowTeamMemberObj.owner) {
            ownerId = curShowTeamMemberObj.owner.userId;
        }
        //秘书
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            curShowTeamMemberObj.managers.forEach(function (member) {
                managerIds.push(member.userId);
            });
        }
        //成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users.forEach(function (member) {
                userIds.push(member.userId);
            });
        }
        //保存修改后改组的负责人id、秘书id列表、成员id列表
        var saveMemberListObj = {
            groupId: curShowTeamMemberObj.groupId,
            ownerId: ownerId,
            managerIds: JSON.stringify(managerIds),
            userIds: JSON.stringify(userIds)
        };
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.editMember(saveMemberListObj);
        this.setState({saveMemberListObj: saveMemberListObj});
        this.cleanSearchInput();
    },

    saveAddMember: function () {
        var ownerId = "", managerIds = [], userIds = [];
        this.state.addMemberList.forEach(function (member) {
            if (member && member.selected) {
                switch (member.roleType) {
                    case MEMBER_TYPE.OWNER:
                        ownerId = member.userId;
                        break;
                    case MEMBER_TYPE.MANAGER:
                        managerIds.push(member.userId);
                        break;
                    case MEMBER_TYPE.USER:
                        userIds.push(member.userId);
                        break;
                }
            }
        });
        //保存新增的负责人id、秘书id列表、成员id列表
        var saveMemberListObj = {
            groupId: this.state.curShowTeamMemberObj.groupId,
            ownerId: ownerId,
            managerIds: JSON.stringify(managerIds),
            userIds: JSON.stringify(userIds)
        };
        MemberListEditAction.setMemberListSaving(true);
        MemberListEditAction.addMember(saveMemberListObj);
        this.setState({
            saveMemberListObj: saveMemberListObj
        });
        this.cleanSearchInput();
    },

    searchMember: function (searchValue) {
        searchValue = searchValue ? searchValue : '';
        this.setState({
            searchValue: searchValue
        });
        if (searchValue){
            Trace.traceEvent($(this.getDOMNode()).find(".sales-team-member-search-input-div input"),"输入昵称/用户名进行过滤");
        }else{
            Trace.traceEvent($(this.getDOMNode()).find(".sales-team-member-search-input-div input"),"清空搜索内容");
        }
    },

    createOperationBtn: function () {
        var isAddMember = this.props.isAddMember; //是否是添加状态
        var isEditMember = this.props.isEditMember;//是否是编辑状态
        var showMemberOperationBtn = this.props.showMemberOperationBtn;
        var addActiveClass = classNames('add-member-btn operation-top-btn iconfont icon-add', this.props.className, {
            'active-btn': isAddMember
        });
        var editActiveClass = classNames('edit-member-btn operation-top-btn iconfont icon-update', this.props.className, {
            'active-btn': isEditMember
        });
        return (
            showMemberOperationBtn ? null :
                (<div className="operation-top-btn-div">
                    <PrivilegeChecker check="BGM_SALES_TEAM_MEMBER_EDIT" className="operation-top-btn-div-label">
                        <div className={editActiveClass} title={Intl.get("sales.team.edit.team.member", "编辑团队成员")}
                             onClick={this.editMember} data-tracename="编辑团队成员">
                        </div>
                    </PrivilegeChecker>
                    <PrivilegeChecker check="BGM_SALES_TEAM_MEMBER_ADD" className="operation-top-btn-div-label">
                        <div className={addActiveClass} title={Intl.get("sales.team.add.team.member", "添加团队成员")}
                             onClick={this.addMember} data-tracename="添加团队成员">
                        </div>
                    </PrivilegeChecker>
                </div>)
        )
    },

    //渲染成员头像及名称，memeber:成员信息，type:负责人/秘书/成员，hasSelectBtn:是否需要选择按钮
    renderMemberEle: function (salesTeamMember, type, hasSelectBtn) {
        var selectBtnClass = "";
        //只展示的成员样式
        var memberClass = "sales-team-member-info";
        if (hasSelectBtn) {
            selectBtnClass = classNames('select-icon-div iconfont icon-select-member', this.props.className, {
                'select-member': salesTeamMember.selected
            });
            //带选择框的成员样式
            memberClass = "operation-sales-team-member-info";
        }
        let userName = salesTeamMember.userName ? salesTeamMember.userName : "";
        //没有昵称时，用用户名展示
        let nickName = salesTeamMember.nickName ? salesTeamMember.nickName : userName;
        return (
            <div className={memberClass} key={salesTeamMember.userId}
                 onClick={this.selectMember.bind(this, salesTeamMember)}>
                <DefaultUserLogoTitle defaultImgClass={"sales-team-member-info-img"}
                                      userName={userName}
                                      nickName={nickName}
                                      userLogo={salesTeamMember.userLogo}
                >
                </DefaultUserLogoTitle>
                {salesTeamMember.status == 0 ? (
                    <div className="sales-team-member-stop"><ReactIntl.FormattedMessage id="common.stop"
                                                                                        defaultMessage="停用"/>
                    </div>) : null}
                {type != MEMBER_TYPE.USER ?
                    (<span className={"iconfont icon-sale-team-"+type}/> ) : null}
                <div className="sales-team-member-info-name-div">
                    {hasSelectBtn ? (<div className={selectBtnClass}></div>) : null}
                    <div className="sales-team-member-info-name" title={nickName}>
                        {nickName}
                    </div>
                </div>
            </div>
        )
    },
    //渲染当前正在展示的团队成员列表
    renderCurTeamMemberList: function (hasSelectBtn) {
        var _this = this;
        var curShowTeamMemberObj = _this.state.curShowTeamMemberObj;
        //负责人
        var ownerElement = null;
        if (curShowTeamMemberObj.owner) {
            ownerElement = (<div className="sales-team-owner-container sales-team-member-tier">
                {_this.renderMemberEle(curShowTeamMemberObj.owner, MEMBER_TYPE.OWNER, hasSelectBtn)}
            </div>);
        }
        //秘书
        var managersElement = null;
        if (curShowTeamMemberObj.managers) {
            managersElement = (<div className="sales-team-manager-container sales-team-member-tier">
                {curShowTeamMemberObj.managers.map(function (manager) {
                    return _this.renderMemberEle(manager, MEMBER_TYPE.MANAGER, hasSelectBtn);
                })}
            </div>);
        }
        //成员
        var usersElement = null;
        if (curShowTeamMemberObj.users) {
            usersElement = (<div className="sales-team-user-container sales-team-member-tier">
                {curShowTeamMemberObj.users.map(function (user) {
                    return _this.renderMemberEle(user, MEMBER_TYPE.USER, hasSelectBtn);
                })}
            </div>);
        }
        return (<div className="sales-team-members-show-div">
            {ownerElement}
            {managersElement}
            {usersElement}
        </div>);
    },
    //获取当前选择成员个数
    getSelectSize: function () {
        var selectedSize = 0;
        if (this.props.isAddMember) {
            this.state.addMemberList.forEach(function (member) {
                if (member.selected && !member.isHidden) {
                    selectedSize++;
                }
            });
        } else if (this.props.isEditMember) {
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            //负责人
            if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
                selectedSize++;
            }
            //秘书
            if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
                curShowTeamMemberObj.managers.forEach(function (member) {
                    if (member.selected) {
                        selectedSize++;
                    }
                });
            }
            //成员
            if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
                curShowTeamMemberObj.users.forEach(function (member) {
                    if (member.selected) {
                        selectedSize++;
                    }
                });
            }
        }
        return selectedSize;
    },

    //将选中成员加为XXX的处理
    handleAddMember: function (className, type) {
        if (className && className.indexOf("member-btn-enable") != -1) {
            var _this = this;
            //将选中成员加为XXX的处理
            _this.state.addMemberList.forEach(function (member) {
                if (member && member.selected && !member.isHidden) {
                    member.roleType = type;//添加成员的角色，负责人：owner,秘书：manager,成员：user
                    member.isHidden = true;//该成员已选择添加了，在添加列表中则不显示
                }
            });
            _this.setState({
                addMemberList: _this.state.addMemberList
            });
        }
    },
    //删除团队成员的处理
    delMember: function () {
        var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
        //删除负责人
        if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
            delete curShowTeamMemberObj.owner;
        }
        //删除秘书
        if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
            curShowTeamMemberObj.managers = _.filter(curShowTeamMemberObj.managers, function (member) {
                if (!member.selected) {
                    return true;
                }
            });
        }
        //删除成员
        if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
            curShowTeamMemberObj.users = _.filter(curShowTeamMemberObj.users, function (member) {
                if (!member.selected) {
                    return true;
                }
            });
        }
        this.setState({
            curShowTeamMemberObj: curShowTeamMemberObj
        });
    },
    //加为负责人的处理
    addOwner: function (event) {
        if (this.props.isAddMember) {
            this.handleAddMember(event.target.className, MEMBER_TYPE.OWNER);
        } else if (this.props.isEditMember) {
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            var oldOwner = curShowTeamMemberObj.owner;//原负责人
            var newOwner = null;//新负责人
            if (oldOwner && oldOwner.selected) {
                //当前选中要设置为负责人的就是负责人时，不做修改
                return;
            }
            //当前选中的是秘书，将秘书转为负责人
            if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
                curShowTeamMemberObj.managers = _.filter(curShowTeamMemberObj.managers, function (member) {
                    if (member.selected) {
                        delete member.selected;
                        newOwner = member;
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            //当前选中的是成员
            if (!newOwner && _.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
                curShowTeamMemberObj.users = _.filter(curShowTeamMemberObj.users, function (member) {
                    if (member.selected) {
                        delete member.selected;
                        newOwner = member;
                    } else {
                        return true;
                    }
                });
            }

            //原负责人存在，则进行负责人的替换
            if (oldOwner) {
                //将原负责人设为成员
                if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
                    curShowTeamMemberObj.users.push(oldOwner);
                } else {
                    curShowTeamMemberObj.users = [oldOwner];
                }
            }
            //新负责人的设置
            curShowTeamMemberObj.owner = newOwner;
            this.setState({
                curShowTeamMemberObj: curShowTeamMemberObj
            });
        }

    },

    //加为秘书的处理
    addManager: function (event) {
        if (this.props.isAddMember) {
            this.handleAddMember(event.target.className, MEMBER_TYPE.MANAGER);
        } else if (this.props.isEditMember) {
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            //秘书列表
            var managers = curShowTeamMemberObj.managers || [];
            //负责人转为秘书
            if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
                delete curShowTeamMemberObj.owner.selected;
                managers.push(curShowTeamMemberObj.owner);
                delete curShowTeamMemberObj.owner;
            }
            //成员转为秘书
            if (_.isArray(curShowTeamMemberObj.users) && curShowTeamMemberObj.users.length > 0) {
                curShowTeamMemberObj.users = _.filter(curShowTeamMemberObj.users, function (member) {
                    if (member.selected) {
                        delete member.selected;
                        managers.push(member);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            curShowTeamMemberObj.managers = managers;
            this.setState({
                curShowTeamMemberObj: curShowTeamMemberObj
            });
        }
    },

    //加为成员的处理
    addUser: function (event) {
        if (this.props.isAddMember) {
            this.handleAddMember(event.target.className, MEMBER_TYPE.USER);
        } else if (this.props.isEditMember) {
            var curShowTeamMemberObj = this.state.curShowTeamMemberObj;
            //成员列表
            var users = curShowTeamMemberObj.users || [];
            //负责人转为成员
            if (curShowTeamMemberObj.owner && curShowTeamMemberObj.owner.selected) {
                delete curShowTeamMemberObj.owner.selected;
                users.push(curShowTeamMemberObj.owner);
                delete curShowTeamMemberObj.owner;
            }
            //秘书转为成员
            if (_.isArray(curShowTeamMemberObj.managers) && curShowTeamMemberObj.managers.length > 0) {
                curShowTeamMemberObj.managers = _.filter(curShowTeamMemberObj.managers, function (member) {
                    if (member.selected) {
                        delete member.selected;
                        users.push(member);
                        return false;
                    } else {
                        return true;
                    }
                });
            }
            curShowTeamMemberObj.users = users;
            this.setState({
                curShowTeamMemberObj: curShowTeamMemberObj
            });
        }
    },

    hideSaveTooltip: function () {
        var type = this.props.isAddMember ? "add" : "edit";
        MemberListEditAction.clearSaveFlags(type, this.state.saveMemberListResult, this.state.saveMemberListObj);
    },

    //渲染'加为xx'按钮
    renderAddBtns: function () {
        //成员列表已选择成员的个数
        var selectSize = this.getSelectSize();
        //负责人按钮样式设置
        var addOwnerBtnCls = "add-member-btn";
        if (selectSize == 1) {
            //只选一个成员时，加为负责任按钮点击事件可用
            addOwnerBtnCls += " member-btn-enable";
        } else if (selectSize > 1) {
            //选择的成员个数超过1个人时，加为负责人按钮为不可用状态，负责人只有一个
            addOwnerBtnCls += " member-owner-disabled"
        }

        //秘书、成员、删除按钮样式设置
        var memberBtnCls = "add-member-btn";
        if (selectSize > 0) {
            memberBtnCls += " member-btn-enable";
        }

        return (<div className="set-select-member-btns">
            {this.props.isEditMember ? (
                <div className={memberBtnCls} onClick={this.delMember} data-tracename="删除成员">{Intl.get("common.delete", "删除")}</div>) : null}
            <div className={addOwnerBtnCls} onClick={this.addOwner} data-tracename="加为负责人">{Intl.get("sales.team.add.owner", "加为负责人")}</div>
            <div className={memberBtnCls} onClick={this.addManager} data-tracename="加为秘书">{Intl.get("sales.team.add.manager", "加为秘书")}</div>
            <div className={memberBtnCls} onClick={this.addUser} data-tracename="加为成员">{Intl.get("sales.team.add.to.member", "加为成员")}</div>
        </div>)


    },
    createMemberInfoElement: function (memberListContainerH) {
        var _this = this;
        var selectMemberListH = 0;
        if (_this.props.isAddMember || _this.props.isEditMember) {
            selectMemberListH = memberListContainerH - 20 - 35;//20:paddingTOP+paddingBottom,35:BtnH+margin
            if (_this.props.isAddMember) {
                selectMemberListH -= 42;//42：搜索框的高度
            }
        } else {
            selectMemberListH -= 20;//20：padding
        }
        return _this.props.isAddMember ?
            (<div className="sales-team-member-add-container">
                <div className="sales-team-member-search-input-div">
                    <SearchInput
                        searchPlaceHolder={Intl.get("sales.team.sales.team.search.placeholder", "请输入昵称/用户名进行过滤")}
                        searchEvent={this.searchMember}/>
                </div>
                <div className="sales-team-member-select-list sales-team-member-tier"
                     style={{height: selectMemberListH}}>
                    {this.props.addMemberListTipMsg ? (
                        <div className="member-list-tip"> {this.props.addMemberListTipMsg} </div>) : (<GeminiScrollbar
                        className="geminiScrollbar-div sales-team-member-select-geminiScrollbar">
                        {
                            _this.state.addMemberList.map(function (salesTeamMember) {
                                //搜索的过滤
                                if (salesTeamMember.nickName.indexOf(_this.state.searchValue) != -1 || salesTeamMember.userName.indexOf(_this.state.searchValue) != -1) {
                                    //已选择加为的过滤
                                    if (!salesTeamMember.isHidden) {
                                        return _this.renderMemberEle(salesTeamMember, MEMBER_TYPE.USER, true);
                                    }
                                }
                            })
                        }
                    </GeminiScrollbar>)
                    }
                </div>
                {this.renderAddBtns()}
            </div>) : _this.props.isEditMember ? (
            <div className="sales-team-member-edit-container">
                <div className="sales-team-member-select-list sales-team-member-tier"
                     style={{height: selectMemberListH}}>
                    {this.props.teamMemberListTipMsg ? (
                        <div className="member-list-tip"> {this.props.teamMemberListTipMsg} </div>) : (
                        <GeminiScrollbar
                            className="geminiScrollbar-div sales-team-member-select-geminiScrollbar">
                            {_this.renderCurTeamMemberList(true)}
                        </GeminiScrollbar>)
                    }
                </div>
                {this.renderAddBtns()}
            </div>
        ) : (<div className="sales-team-member-show-list sales-team-member-tier"
                  style={{height: memberListContainerH-20}}>
            {this.props.teamMemberListTipMsg ? (
                <div className="member-list-tip"> {this.props.teamMemberListTipMsg} </div>) : (<GeminiScrollbar
                className="geminiScrollbar-div sales-team-member-select-geminiScrollbar">
                {_this.renderCurTeamMemberList()}
            </GeminiScrollbar>)
            }
        </div>)
    },
    //修改团队销售目标时的处理
    changeTeamSalesGoals: function (val) {
        this.state.salesGoals.goal = this.turnGoalToSaveData(val);
        this.setState({salesGoals: this.state.salesGoals});
    },
    //修改成员销售目标时的处理
    changeMemberSalesGoals: function (val) {
        this.state.salesGoals.member_goal = this.turnGoalToSaveData(val);
        this.setState({salesGoals: this.state.salesGoals});
    },
    //展示是否保存团队销售目标的确认框
    showTeamConfirm: function (e) {
        if (this.props.salesGoals.goal != this.state.salesGoals.goal) {
            this.setState({teamConfirmVisible: true});
            Trace.traceEvent(e,"修改团队销售目标");
        }
    },
    //展示是否保存个人销售目标的确认框
    showMemberConfirm: function (e) {
        if (this.props.salesGoals.member_goal != this.state.salesGoals.member_goal) {
            this.setState({memberConfirmVisible: true});
            Trace.traceEvent(e,"修改个人销售目标");
        }
    },
    //将销售目标转换为保存时所需的数据x万=>x*10000
    turnGoalToSaveData: function (goal) {
        return _.isNumber(goal) && !_.isNaN(goal) ? (goal * 10000) : null;
    },
    //获取要保存的销售目标
    getSaveSalesGoals: function (type) {
        let curTeamObj = this.state.curShowTeamMemberObj;
        let salesGoals = this.state.salesGoals;
        let saveParams = {};
        if (type == SALES_GOALS_TYPE.TEAM) {
            Trace.traceEvent($(this.getDOMNode()).find(".member-top-operation-div"),"保存团队销售目标");
            //团队销售目标
            saveParams = {
                sales_team_id: curTeamObj.groupId,
                sales_team: curTeamObj.groupName,
                goal: salesGoals.goal
            };
            if (salesGoals.id) {
                //修改时加上销售目标的id
                saveParams.id = salesGoals.id;
            }
        } else if (type == SALES_GOALS_TYPE.MEMBER) {
            Trace.traceEvent($(this.getDOMNode()).find(".member-top-operation-div"),"保存个人销售目标");
            //个人销售目标
            if (_.isArray(curTeamObj.users) && curTeamObj.users.length) {
                saveParams = {
                    sales_team_id: curTeamObj.groupId,
                    sales_team: curTeamObj.groupName
                };
                saveParams.users = curTeamObj.users.map(user=> {
                    let userGoal = {
                        user_id: user.userId,
                        user_name: user.nickName,
                        goal: salesGoals.member_goal
                    };
                    //修改时id的处理
                    if (_.isArray(salesGoals.user_sales_goals) && salesGoals.user_sales_goals.length) {
                        let oldUserGoal = _.find(salesGoals.user_sales_goals, goal=>goal.user_id == user.userId);
                        if (oldUserGoal && oldUserGoal.id) {
                            userGoal.id = oldUserGoal.id;
                        }
                    }
                    return userGoal;
                });
            }
        }
        return saveParams;
    },
    //保存销售目标
    saveSalesGoals: function (type) {
        let salesGoals = this.getSaveSalesGoals(type);
        salesTeamAjax.saveSalesGoals(salesGoals).then(result=> {
            if (result) {
                SalesTeamAction.updateSalesGoals({type: type, salesGoals: result});
            } else {
                this.cancelSaveSalesGoals(type);
            }
        }, errorMsg=> {
            message.error(errorMsg || Intl.get("common.edit.failed", "修改失败"));
            this.cancelSaveSalesGoals(type);
        });
    },
    //取消销售目标的保存
    cancelSaveSalesGoals: function (type) {
        if (type == SALES_GOALS_TYPE.TEAM) {
            Trace.traceEvent($(this.getDOMNode()).find(".member-top-operation-div"),"取消团队销售目标的保存");
            this.state.salesGoals.goal = this.props.salesGoals.goal;
            this.setState({teamConfirmVisible: false, salesGoals: this.state.salesGoals});
        } else if (type == SALES_GOALS_TYPE.MEMBER) {
            Trace.traceEvent($(this.getDOMNode()).find(".member-top-operation-div"),"取消个人销售目标的保存");
            this.state.salesGoals.member_goal = this.props.salesGoals.member_goal;
            this.setState({memberConfirmVisible: false, salesGoals: this.state.salesGoals});
        }
    },
    //将销售目标转换为界面展示所需数据：x0000=>x万
    turnGoalToShowData: function (goal) {
        return _.isNumber(goal) && !_.isNaN(goal) ? (goal / 10000) : '';
    },
    //渲染团队目标
    renderSalesGoals: function () {
        return (
            <div className="sales-team-goals-container">
                <span className="iconfont icon-sales-goals" title={Intl.get("sales.team.sales.goal", "销售目标")}/>
                <div className="sales-goals-item">
                    <span className="sales-goals-label">{Intl.get("user.user.team", "团队")}：</span>
                    <Popconfirm title={Intl.get("sales.team.save.team.sales.goal","是否保存团队销售目标？")}
                                visible={this.state.teamConfirmVisible}
                                onConfirm={this.saveSalesGoals.bind(this,SALES_GOALS_TYPE.TEAM)}
                                onCancel={this.cancelSaveSalesGoals.bind(this,SALES_GOALS_TYPE.TEAM)}>
                        <InputNumber className="team-goals-input"
                                     value={this.turnGoalToShowData(this.state.salesGoals.goal)}
                                     onChange={this.changeTeamSalesGoals}
                                     onBlur={(e)=>{this.showTeamConfirm(e)}}
                        />
                    </Popconfirm>

                    <span className="sales-goals-label">{Intl.get("contract.139", "万")}，</span>
                </div>
                <div className="sales-goals-item">
                    <span className="sales-goals-label">{Intl.get("sales.team.personal", "个人")}：</span>
                    <Popconfirm title={Intl.get("sales.team.save.member.sales.goal","是否保存个人销售目标？")}
                                visible={this.state.memberConfirmVisible}
                                onConfirm={this.saveSalesGoals.bind(this,SALES_GOALS_TYPE.MEMBER)}
                                onCancel={this.cancelSaveSalesGoals.bind(this,SALES_GOALS_TYPE.MEMBER)}>
                        <InputNumber className="member-goals-input"
                                     value={this.turnGoalToShowData(this.state.salesGoals.member_goal)}
                                     onChange={this.changeMemberSalesGoals}
                                     onBlur={(e)=>{this.showMemberConfirm(e)}}
                        />
                    </Popconfirm>
                    <span className="sales-goals-label">{Intl.get("contract.139", "万")}</span>
                </div>
            </div>);
    },
    render: function () {
        var _this = this;
        var salesTeamPersonnelWidth = this.props.salesTeamMemberWidth;
        var containerHeight = this.props.containerHeight;
        var isAddMember = this.props.isAddMember; //是否是添加状态
        var isEditMember = this.props.isEditMember;//是否是编辑状态
        var operationBottomBtnHeight = 0;//成员列表底部操作区域按钮（添加/删除操作会展示此区域）
        var memberListPaddingTop = 20;//成员列表顶部padding
        var memberListTitleHeight = 50;//成员列表顶部操作区域高度
        if (isAddMember || isEditMember) {
            operationBottomBtnHeight = 40;
        }
        var memberListContainerH = containerHeight - memberListPaddingTop - memberListTitleHeight - operationBottomBtnHeight;
        var saveResult = this.state.saveMemberListResult;
        return (
            <div className="sales-team-personnel"
                 style={{height: containerHeight, width: salesTeamPersonnelWidth}} data-tracename="团队列表">
                <div className="member-top-operation-div">
                    <div className="member-top-operation-div-title">
                        {this.state.curShowTeamMemberObj.groupName || ""}
                    </div>
                    {_this.renderSalesGoals()}
                    {_this.createOperationBtn()}
                </div>
                <div className="member-list-div"
                     style={{height: memberListContainerH}}>
                    {
                        this.props.isLoadingTeamMember ? (
                            <Spinner className="isloading"/>) : _this.createMemberInfoElement(memberListContainerH)
                    }
                </div>
                {this.props.isAddMember || this.props.isEditMember ? (<div className="operation-bottom-btn-div">
                    {saveResult ?
                        (<div className="indicator">
                            <AlertTimer time={saveResult=="error"?3000:600}
                                        message={this.state.saveMemberListMsg}
                                        type={saveResult} showIcon
                                        onHide={this.hideSaveTooltip}/>
                        </div>) : null
                    }
                    <Button type="ghost" className="operation-bottom-btn btn-primary-sure"
                            onClick={(e)=>{this.handleOK(e)}} ><ReactIntl.FormattedMessage id="common.confirm"
                                                                                defaultMessage="确认"/></Button>
                    <Button type="ghost" className="operation-bottom-btn btn-primary-cancel"
                            onClick={(e)=>{this.handleCancel(e)}}><ReactIntl.FormattedMessage id="common.cancel"
                                                                                    defaultMessage="取消"/></Button>
                </div>) : null}
                {this.state.isMemberListSaving ? (<div className="member-list-edit-block">
                    <Spinner className="isloading"/>
                </div>) : ""}
            </div>
        );
    }
});
module.exports = MemberList;