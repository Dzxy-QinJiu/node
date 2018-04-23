/**
 * 团队树组件
 *
 * 用于展示团队的树形结构，支持点击团队显示团队下的成员
 *
 * 使用方法：
 * <TeamTree
 *     属性(可选)
 * />
 *
 * 可用属性：
 * onTeamSelect (团队选中事件，回调参数为团队id)
 *
 * onMemberSelect (成员选中事件，回调参数为成员id)
 *
 * disableEmitter (是否禁用事件发射，默认为否)
 *
 * 特别说明：
 * 选中的团队id和成员id默认会通过teamTreeEmitter发射出去
 * 可在需要这些id的地方通过监听teamTreeEmitter.SELECT_TEAM事件得到选中的团队id，
 * 通过监听teamTreeEmitter.SELECT_MEMBER事件得到选中的成员id
 * 如：
 * teamTreeEmitter.on(teamTreeEmitter.SELECT_TEAM, (teamId) => {})
 *
 * 可通过将disableEmitter属性设置为true来关闭事件发射，只用onTeamSelect等回调函数得到选中的团队id或成员id
 */

require("./style.less");
import routeList from "../../modules/common/route";
import ajax from "../../modules/common/ajax";
const Emitters = require("../../public/sources/utils/emitters");
const salesmanAjax = require("../../modules/common/public/ajax/salesman");
const teamTreeEmitter = Emitters.teamTreeEmitter;
import { Tree } from "antd";
const TreeNode = Tree.TreeNode;
const noop = function () {
};

const TeamTree = React.createClass({
    getDefaultProps() {
        return {
            onTeamSelect: noop,
            onMemberSelect: noop,
            disableEmitter: false,
        };
    },
    getInitialState() {
        return {
            teamList: [],
            userList: [],
            breadcrumb: [],
        };
    },
    componentDidMount() {
        this.getTeamList();
        this.getUserList();
    },
    getTeamList() {
        const route = _.find(routeList, route => route.handler === "getTeamList");

        const arg = {
            url: route.path,
        };

        ajax(arg).then(result => {
            this.setState({teamList: result});
        }, errorMsg => {
            this.setState({teamList: []});
        });
    },
    getUserList() {
        salesmanAjax.getSalesmanListAjax().sendRequest()
            .success(result => {
                this.setState({userList: result});
            }).error(() => {
            this.setState({userList: []});
        });
    },
    handleTeamSelect(e) {
        const selectedKeys = e.selectedKeys || e;
        const teamId = selectedKeys[0];

        if (teamId) {
            if (!this.props.disableEmitter) {
                teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, teamId);
            }
            this.buildBreadcrumb(teamId);
            this.setTeamMembers(teamId);

            this.props.onTeamSelect(teamId);
        }
    },
    handleMemberSelect(e) {
        const selectedKeys = e.selectedKeys || e;
        const memberId = selectedKeys[0];

        if (memberId) {
            if (!this.props.disableEmitter) {
                teamTreeEmitter.emit(teamTreeEmitter.SELECT_MEMBER, memberId);
            }

            this.props.onMemberSelect(memberId);
        }
    },
    //选中团队后，根据团队中的成员id，结合成员列表，得到该团队下属成员的id及名称列表，并保存到state中
    setTeamMembers(teamId) {
        this.state.teamMembers = [];

        const team = _.find(this.state.teamList, item => item.group_id === teamId);

        if (team && team.user_ids) {
            _.each(team.user_ids, userId => {
                const user = _.find(this.state.userList, item => item.user_info.user_id === userId);

                if (user) {
                    this.state.teamMembers.push({
                        memberId: userId,
                        memberName: user.user_info.nick_name,
                    });
                }
            });
        }

        this.setState(this.state, () => {
            this.removeSelectState();
        });
    },
    //根据选中团队的id，构造包含其所有父团队的列表，并保存到state中，用于渲染面包屑导航
    buildBreadcrumb(teamId) {
        this.state.breadcrumb = [];

        const loop = (list, id)  => {
            const team = _.find(list, item => item.group_id === id);
            if (team) {
                this.state.breadcrumb.unshift(team);
                loop(list, team.parent_group);
            }
        };

        loop(this.state.teamList, teamId);

        this.setState(this.state);
    },
    renderTeamTree() {
        function loop(obj, key) {
            return _.map(obj[key], item => {
                if (obj[item.group_id]) {
                    return <TreeNode title={item.group_name} key={item.group_id}>{loop(obj, item.group_id)}</TreeNode>;
                } else {
                    return <TreeNode title={item.group_name} key={item.group_id}/>;
                }
            });
        }

        const groupedTeamList = _.groupBy(this.state.teamList, team => team.parent_group);

        return loop(groupedTeamList, undefined);
    },
    renderTeamMembers() {
        return _.map(this.state.teamMembers, item => {
            return <TreeNode title={item.memberName} key={item.memberId}/>;
        });
    },
    renderBreadcrumb() {
        const breadcrumb = this.state.breadcrumb;

        return (
            <div>
                <span
                    className="breadcrumb-item"
                    onClick={this.showTeamTree}
                >
                    {Intl.get("user.user.team", "团队")}
                </span>
                {breadcrumb.length ? " / " : null}
                {breadcrumb.map((item, index) => {
                    return (
                        <span
                            className="breadcrumb-item"
                            onClick={this.handleTeamSelect.bind(this, {selectedKeys: [item.group_id]})}
                        >
                            {item.group_name}
                            {index + 1 !== breadcrumb.length ? " / " : null}
                        </span>
                    );
                })}
            </div>
        );
    },
    //显示从根节点开始的团队树
    showTeamTree() {
        if (!this.props.disableEmitter) {
            teamTreeEmitter.emit(teamTreeEmitter.SELECT_TEAM, "");
        }
        delete this.state.teamMembers;
        this.state.breadcrumb = [];
        this.setState(this.state, () => {
            this.removeSelectState();
        });

        this.props.onTeamSelect();
    },
    //取消之前选中项的选中状态
    removeSelectState() {
        $(".ant-tree-node-selected").children().click();
    },
    render() {
        return (
            <div className="team-tree">
                <div className="tree-title">
                    {this.renderBreadcrumb()}
                </div>
                {this.state.teamMembers ? (
                    <Tree
                        onSelect={this.handleMemberSelect}
                        className="member-tree"
                    >
                        {this.renderTeamMembers()}
                    </Tree>
                ) : (
                    <Tree
                        onSelect={this.handleTeamSelect}
                    >
                        {this.renderTeamTree()}
                    </Tree>
                )}
            </div>
        );
    }
});

export default TeamTree;
