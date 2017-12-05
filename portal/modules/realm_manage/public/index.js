var RightContent = require("../../../components/privilege/right-content");
var RightCardsContainer = require("../../../components/rightCardsContainer");
var rightPanelUtil = require("../../../components/rightPanel");
var RightPanel = rightPanelUtil.RightPanel;
var RealmStore = require("./store/realm-store");
var RealmAction = require("./action/realm-actions");
var AddRealmForm = require("./views/realm-form");
var OwnerForm = require("./views/owner-form");
var RealmInfo = require("./views/realm-info");
var Spinner = require("../../../components/spinner");
var batchPushEmitter = require("../../../public/sources/utils/emitters").batchPushEmitter;
import Trace from "LIB_DIR/trace";
var openTimeout = null;//打开面板时的时间延迟设置
var focusTimeout = null;//focus事件的时间延迟设置
//构造搜索条件,搜索关键字：安全域名称、域名
function constructorSearchObj(searchContent) {
    if (searchContent) {
        searchContent = JSON.stringify({
            realmName: searchContent,
            realmDomain: searchContent
        });
    }
    return searchContent;
}
var RealmManage = React.createClass({
        getInitialState: function () {
            return RealmStore.getState();
        },
        onChange: function () {
            this.setState(RealmStore.getState());
        },
        componentDidMount: function () {
            $("body").css("overflow", "hidden");
            RealmStore.listen(this.onChange);
            //异步创建安全域
            batchPushEmitter.on(batchPushEmitter.TASK_REALM_CERATE, RealmAction.createRealms);
        },
       
        componentWillUnmount: function () {
            $("body").css("overflow", "auto");
            RealmStore.unlisten(this.onChange);
            batchPushEmitter.removeListener(batchPushEmitter.TASK_REALM_CERATE, RealmAction.createRealms);
        },
        events: {
            showRealmForm: function (type) {
                if(type === "add") {
                    Trace.traceEvent("安全域管理","点击添加安全域按钮");
                }
                //type：“edit”/"add"
                if (type === "add") {
                    if (focusTimeout) {
                        clearTimeout(focusTimeout);
                    }
                    focusTimeout = setTimeout(function () {
                        $("#realmName").focus();
                    }, 600);
                }
                RealmAction.showRealmForm(type);
            },
            showOwnerForm: function () {
                RealmAction.showOwnerForm();
                setTimeout(() => {
                    RealmAction.infoPanel2OwnerForm();
                });
            },

            //启用、停用
            updateRealmStatus: function (realmId, status) {
                RealmAction.updateRealmStatus({id: realmId, status: status});
            },

            //切换页数时，当前页展示数据的修改
            onChangePage: function (count, curPage) {
                RealmAction.updateCurPage(curPage);
                var searchObj = {
                    cur_page: curPage,
                    page_size: count,
                    search_content: constructorSearchObj(this.state.searchContent)
                };
                RealmAction.getCurRealmList(searchObj);
            },

            //展示模态框
            showModalDialog: function () {
                RealmAction.showModalDialog();
            },
            //隐藏模态框
            hideModalDialog: function () {
                RealmAction.hideModalDialog();
            },

            showRealmInfo: function (realm) {
                //正在获取其他安全域详情，则先不展示当前安全域详情
                if (this.state.realmIsLoading) {
                    return;
                }
                RealmAction.setCurRealm(realm.id);
                //获取安全域的详情
                RealmAction.getCurRealmById(realm.id);
                if ($(".right-panel-content").hasClass("right-panel-content-slide")) {
                    $(".right-panel-content").removeClass("right-panel-content-slide");
                    if (openTimeout) {
                        clearTimeout(openTimeout);
                    }
                    openTimeout = setTimeout(function () {
                        RealmAction.showRealmInfo(realm);
                    }, 200);
                } else {
                    RealmAction.showRealmInfo(realm);
                }
            },
            searchEvent: function (searchContent) {
                Trace.traceEvent($(this.getDOMNode()).find(".search-input-block"),"按安全域/域名搜索");
                RealmAction.updateCurPage(1);
                RealmAction.updateSearchContent(searchContent);
                var searchObj = {
                    cur_page: 1,
                    page_size: this.state.pageSize,
                    search_content: constructorSearchObj(searchContent)
                };
                RealmAction.getCurRealmList(searchObj);
            },

            //右侧面板的关闭
            closeRightPanel: function () {
                RealmAction.closeRightPanel();
            },
            //由编辑页面返回信息展示页面
            returnInfoPanel: function () {
                RealmAction.returnInfoPanel();
            },
            //一页展示多少安全域的修改
            updatePageSize: function (count) {
                RealmAction.updatePageSize(count);
            },
            //删除创建失败的安全域
            removeFailRealm:function (taskId) {
                RealmAction.removeFailRealm(taskId);
            }
        },
        //获取卡片展示所需的安全域列表
        getCardShowRealmList: function () {
            let realmList = _.isArray(this.state.curRealmList) ? this.state.curRealmList : [];
            return realmList.map(realm=> {
                let pageRealm = {
                    id: realm.id,
                    name: realm.company,
                    image: realm.image,
                    realmName: {
                        label: Intl.get("realm.name", "域名") + ':',
                        value: realm.realmName,
                        showOnCard: true
                    },
                    phone: {
                        label: Intl.get("common.phone", "电话") + ':',
                        value: realm.phone,
                        showOnCard: true
                    },
                    profession: {
                        label: Intl.get("realm.industry", "行业") + ':',
                        value: realm.profession,
                        showOnCard: true
                    },
                    status: realm.status,
                    taskId: realm.taskId ||'',
                    createMsg :realm.createMsg||'',
                };
                return pageRealm;
            });
        },
        render: function () {
            var currentRealm = JSON.parse(JSON.stringify(this.state.currentRealm));
            var owner = currentRealm && currentRealm.owner || "";
            delete currentRealm.owner;
            var modalType = Intl.get("user.info.realm", "安全域");
            var firstLoading = this.state.isLoading;
            return (
                <div className="realm_manage_style">
                    {
                        firstLoading ? <div className="firstLoading">
                            <Spinner />
                        </div> : null
                    }
                    <RightContent>
                        <div className="realm_content" data-tracename="安全域管理">
                            <RightCardsContainer
                                currentCard={this.state.currentRealm}
                                cardListSize={this.state.realmListSize}
                                curCardList={this.getCardShowRealmList()}
                                selectCards={this.state.selectRealms}
                                listTipMsg={this.state.realmListTipMsg}
                                curPage={this.state.curPage}
                                pageSize={this.state.pageSize}
                                searchPlaceHolder={Intl.get("realm.search.placeholder", "安全域名称/域名")}
                                updatePageSize={this.events.updatePageSize.bind(this)}
                                showCardForm={this.events.showRealmForm}
                                editCard={this.events.editRealm}
                                changePageEvent={this.events.onChangePage.bind(this)}
                                showCardInfo={this.events.showRealmInfo.bind(this)}
                                searchEvent={this.events.searchEvent.bind(this)}
                                removeFailRealm={this.events.removeFailRealm.bind(this)}
                                modalType={modalType}
                                addRoleStr={"REALM_MANAGE_ADD_REALM"}
                            >
                                <RightPanel className="white-space-nowrap" showFlag={this.state.rightPanelShow}>
                                    <RealmInfo
                                        closeRightPanel={this.events.closeRightPanel}
                                        realmInfo={currentRealm}
                                        realmOwner={owner}
                                        realmInfoShow={this.state.realmInfoShow}
                                        realmFormShow={this.state.realmFormShow || this.state.ownerFormShow}
                                        infoIsloading={this.state.realmIsLoading}
                                        modalDialogShow={this.state.modalDialogShow}
                                        modalType={modalType}
                                        showModalDialog={this.events.showModalDialog.bind(this)}
                                        hideModalDialog={this.events.hideModalDialog}
                                        showEditForm={this.events.showRealmForm}
                                        updateStatus={this.events.updateRealmStatus}
                                        showOwnerForm={this.events.showOwnerForm}
                                        hasLog={false}
                                    />
                                    {this.state.ownerFormShow == false ? (
                                        <AddRealmForm
                                            formType={this.state.formType}
                                            realm={this.state.currentRealm}
                                            realmFormShow={this.state.realmFormShow}
                                            closeRightPanel={this.events.closeRightPanel}
                                            returnInfoPanel={this.events.returnInfoPanel}
                                        />
                                    ) : (
                                        <OwnerForm
                                            formType={this.state.formType}
                                            realm={this.state.currentRealm}
                                            ownerFormShow={this.state.ownerFormShow}
                                            closeRightPanel={this.events.closeRightPanel}
                                            returnInfoPanel={this.events.returnInfoPanel}
                                        />
                                    )}
                                </RightPanel>
                            </RightCardsContainer>
                        </div>
                    </RightContent>
                </div>
            );
        }
    })
    ;

module.exports = RealmManage;
