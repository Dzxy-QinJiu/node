/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
'use strict';
var clueCustomerService = require('../service/clue-customer-service');
var path = require('path');
let BackendIntl = require('../../../../lib/utils/backend_intl');
const _ = require('lodash');
const moment = require('moment');
const multiparty = require('multiparty');
const fs = require('fs');
const DATE_FORMAT = oplateConsts.DATE_FORMAT;
const recommendClueDto = require('../dto/recommend-clue');
function getClueSourceClassify(backendIntl) {
    return [
        {
            name: backendIntl.get('crm.clue.client.source.inbound', '市场'),
            value: 'inbound'
        },{
            name: backendIntl.get( 'crm.clue.client.source.outbound', '自拓'),
            value: 'outbound'
        },{
            name: backendIntl.get( 'crm.clue.client.source.other', '未知'),
            value: 'other'
        }
    ];

}
function getClueDiffType(backendIntl) {
    return [
        {
            name: backendIntl.get('common.all', '全部'),
            value: '',
        },
        {
            name: backendIntl.get('clue.customer.will.distribution', '待分配'),
            value: '0',
        },
        {
            name: backendIntl.get('sales.home.will.trace', '待跟进'),
            value: '1',
        },
        {
            name: backendIntl.get('clue.customer.has.follow', '已跟进'),
            value: '2',
        },{
            name: backendIntl.get('clue.customer.has.transfer', '已转化'),
            value: '3',
        }];
}

//获取线索来源
exports.getClueSource = function(req, res) {
    clueCustomerService.getClueSource(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

//获取线索渠道
exports.getClueChannel = function(req, res) {
    clueCustomerService.getClueChannel(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取线索最大提取量及已经提取的线索量
exports.getMaxLimitCountAndHasExtractedClue = function(req, res) {
    clueCustomerService.getMaxLimitCountAndHasExtractedClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取线索分类
exports.getClueClassify = function(req, res) {
    clueCustomerService.getClueClassify(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

//添加或者更新跟进内容
exports.addCluecustomerTrace = function(req, res) {
    clueCustomerService.addCluecustomerTrace(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//把线索客户分配给对应的销售
exports.distributeCluecustomerToSale = function(req, res) {
    clueCustomerService.distributeCluecustomerToSale(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//修改更新线索客户的详情
exports.updateCluecustomerDetail = function(req, res) {
    clueCustomerService.updateCluecustomerDetail(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//将线索和客户进行关联
exports.relateClueAndCustomer = function(req, res) {
    clueCustomerService.relateClueAndCustomer(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
// 管理员或销售领导导入线索模板文件
exports.getClueTemplate = function(req, res) {
    //普通销售用一个模板，销售领导和管理员用一个模板
    var filePath = path.resolve(__dirname, '../../tpl/clue_temp.xls');
    if(req.params.isCommonSales === 'true'){
        filePath = path.resolve(__dirname, '../../tpl/clue_temp_common_sales.xls');
    }
    let backendIntl = new BackendIntl(req);
    let filename = backendIntl.get('crm.sales.clue', '线索') + '.xls';
    res.download(filePath, filename);
};
exports.uploadClues = function(req, res) {
    var form = new multiparty.Form();
    //开始处理上传请求
    form.parse(req, function(err, fields, files) {
        // 获取上传文件的临时路径
        let tmpPath = files['clues'][0].path;
        // 文件不为空的处理
        let formData = {
            attachments: [fs.createReadStream(tmpPath)]
        };
        //调用上传请求服务
        clueCustomerService.uploadClues(req, res, formData)
            .on('success', function(data) {
                res.json(data.result);
            })
            .on('error', function(err) {
                res.json(err && err.message);
            });
    });
};

exports.confirmUploadClues = function(req, res) {
    clueCustomerService.confirmUploadClues(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.deleteRepeatClue = function(req, res) {
    clueCustomerService.deleteRepeatClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取线索分析
exports.getClueAnalysis = function(req, res) {
    clueCustomerService.getClueAnalysis(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取线索统计
exports.getClueStatics = function(req, res) {
    clueCustomerService.getClueStatics(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//获取线索趋势统计
exports.getClueTrendStatics = function(req, res) {
    clueCustomerService.getClueTrendStatics(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//全文搜索线索
exports.getClueFulltext = function(req, res) {
    clueCustomerService.getClueFulltext(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getClueDetailByIdBelongTome = function(req, res) {
    clueCustomerService.getClueDetailByIdBelongTome(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

//获取线索动态
exports.getDynamicList = function(req, res) {
    clueCustomerService.getDynamicList(req, res)
        .on('success', function(data) {
            res.status(200).json(data.result);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//删除线索
exports.deleteClue = function(req, res) {
    clueCustomerService.deleteClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        })
        .on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//根据线索的id获取线索的详情
exports.getClueDetailById = function(req, res) {
    clueCustomerService.getClueDetailById(req, res)
        .on('success', function(data) {
            res.status(200).json(data.result);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
function getClueListColumns(backendIntl) {
    return [
        {
            title: backendIntl.get('clue.customer.clue.name', '线索名称'),
            dataIndex: 'name',
        },{
            title: backendIntl.get('lead.company.legal.person', '法人'),
            dataIndex: 'legal_person',
        },{
            title: backendIntl.get('clue.customer.register.time', '注册时间'),
            dataIndex: 'formed',
        },{
            title: backendIntl.get('clue.recommend.clue.scope', '经营范围'),
            dataIndex: 'business_scope',
        },{
            title: backendIntl.get('clue.recommend.clue.introduction', '简介'),
            dataIndex: 'company_profile',
        },{
            title: backendIntl.get('call.record.contacts', '联系人'),
            dataIndex: 'contacts_name',
        },{
            title: backendIntl.get('common.phone', '电话'),
            dataIndex: 'contacts_phone',
        },{
            title: backendIntl.get('common.email', '邮箱'),
            dataIndex: 'contacts_email',
        },{
            title: 'QQ',
            dataIndex: 'contacts_qq',
        },{
            title: backendIntl.get('crm.58', '微信'),
            dataIndex: 'contacts_wechat',
        },{
            title: backendIntl.get('clue.customer.other.contact_way', '其他联系方式'),
            dataIndex: 'contacts_otherways',
        }, {
            title: backendIntl.get('clue.filter.clue.status', '线索状态'),
            dataIndex: 'status'
        },
        {
            title: backendIntl.get('common.login.time', '时间'),
            dataIndex: 'source_time',
        },
        {
            title: backendIntl.get('crm.clue.client.source', '获客方式'),
            dataIndex: 'source_classify'
        },
        {
            title: backendIntl.get('clue.analysis.source', '来源'),
            dataIndex: 'clue_source',
        },{
            title: backendIntl.get('clue.customer.source.ip', '来源IP'),
            dataIndex: 'source_ip',
        },{
            title: backendIntl.get('crm.96', '地域'),
            dataIndex: 'province',
        },{
            title: backendIntl.get('common.full.address', '详细地址'),
            dataIndex: 'address',
        },{
            title: backendIntl.get('crm.sales.clue.access.channel', '接入渠道'),
            dataIndex: 'access_channel',
        },{
            title: backendIntl.get('clue.customer.classify', '线索分类'),
            dataIndex: 'clue_classify'
        },{
            title: backendIntl.get('crm.sales.clue.descr', '线索描述'),
            dataIndex: 'source',
        },{
            title: backendIntl.get('clue.customer.associate.customer', '关联客户'),
            dataIndex: 'customer_name'
        },{
            title: backendIntl.get('crm.6', '负责人'),
            dataIndex: 'user_name'
        },{
            title: backendIntl.get('clue.list.clue.availibility','无效线索'),
            dataIndex: 'availability'
        },{
            title: backendIntl.get('call.record.follow.content', '跟进内容'),
            dataIndex: 'customer_traces'
        }
    ];
}

//导出数据
exports.exportClueFulltext = function(req, res) {
    clueCustomerService.exportClueFulltext(req, res).on('success', result => {
        let backendIntl = new BackendIntl(req);
        doExport(result, backendIntl,res);
    }).on('error', codeMessage => {
        res.status(500).json(codeMessage);
    });
};
//执行导出
function doExport(data, backendIntl, res) {
    const CLUE_LIST_COLUMNS = getClueListColumns(backendIntl);
    const columnTitles = _.map(CLUE_LIST_COLUMNS, 'title');
    const list = _.isArray(data.result) ? data.result : [];
    const rows = list.map(item => {
        const values = CLUE_LIST_COLUMNS.map(column => {
            let value = item[column.dataIndex];
            if (!value && isNaN(value)) value = '';
            if (column.dataIndex === 'province') {
                if (item['city']) {
                    value += item['city'];
                }
            }
            if (column.dataIndex === 'status'){
                const CLUE_DIFF_TYPE = getClueDiffType(backendIntl);
                var targetObj = _.find(CLUE_DIFF_TYPE,(item) => {
                    return value === item.value;
                });
                value = _.get(targetObj,'name') || value;
            }
            if (column.dataIndex === 'formed' && value){
                value = moment(value).format(DATE_FORMAT);
            }
            if (column.dataIndex === 'source_time' && value){
                value = moment(value).format(DATE_FORMAT);
            }
            if (column.dataIndex === 'source_classify' && value){
                const sourceClassifyArray = getClueSourceClassify(backendIntl);
                var targetObj = _.find(sourceClassifyArray,(item) => {
                    return value === item.value;
                });
                value = _.get(targetObj,'name') || value;
            }
            if (_.isString(column.dataIndex) && column.dataIndex.indexOf('contacts') > -1){
                value = item['contacts'];
                if(_.isArray(value)){
                    var firstContact = _.get(value,'[0]'),otherContactArr = value.slice(1), contactDes = '';
                    switch (column.dataIndex) {
                        case 'contacts_name':
                            contactDes += _.get(firstContact,'name','');
                            //如果有职务就加上职务
                            var position = _.get(firstContact,'name','position');
                            if(position){
                                contactDes += `(${position})`;
                            }
                            break;
                        case 'contacts_phone':
                            contactDes += '\t' + _.get(firstContact,'phone',[]).join('；');//加上\t是为了防止在用wps打开的时候，如果是座机会把前面的0忽略，直接展示成一个数字，例如01085655689会展示成1085655689
                            break;
                        case 'contacts_email':
                            contactDes += _.get(firstContact,'email',[]).join('；');
                            break;
                        case 'contacts_qq':
                            contactDes += _.get(firstContact,'qq',[]).join('；');
                            break;
                        case 'contacts_wechat':
                            contactDes += _.get(firstContact,'weChat',[]).join('；');
                            break;
                        case 'contacts_otherways':
                            if (_.get(otherContactArr, '[0]')) {
                                _.forEach(otherContactArr, (contactItem, index) => {
                                    if(index !== 0){
                                        contactDes += '；';
                                    }
                                    contactDes += _.get(contactItem, 'name', '') ? backendIntl.get('call.record.contacts', '联系人') + '：' + _.get(contactItem, 'name', '') + ' ' : '';
                                    contactDes += _.get(contactItem, 'position', '') ? '(' + _.get(contactItem, 'positon', '') + ')' : '';
                                    contactDes += _.get(contactItem, 'phone[0]', '') ? backendIntl.get('common.phone', '电话') + '：' + _.get(contactItem, 'phone', []).join('，') + ' ' : '';
                                    contactDes += _.get(contactItem, 'email[0]', '') ? backendIntl.get('common.email', '邮箱') + '：' + _.get(contactItem, 'email', []).join('，') + ' ' : '';
                                    contactDes += _.get(contactItem, 'qq[0]', '') ? 'QQ' + '：' + _.get(contactItem, 'qq', []).join('，') + ' ' : '';
                                    contactDes += _.get(contactItem, 'weChat[0]', '') ? backendIntl.get('crm.58', '微信') + '：' + _.get(contactItem, 'weChat', []).join('，') + ' ' : '';

                                });
                            }
                            break;

                    }
                    value = contactDes;
                }

            }
            if (column.dataIndex === 'customer_traces' && _.isArray(value)){
                var traceAddTime = _.get(value, '[0].call_date');//跟进时间

                traceAddTime = traceAddTime ? moment(traceAddTime).format(oplateConsts.DATE_FORMAT) : '';
                var tracePersonName = _.get(value, '[0].nick_name', '');//跟进人的名字
                value = _.get(value,'[0].remark','') + '(' + backendIntl.get('clue.export.trace.msg', '{traceman}于{tracetime}添加',{'traceman': tracePersonName, 'tracetime': traceAddTime}) + ')';
            }
            if (column.dataIndex === 'user_name' && item.sales_team){
                value += `—${item.sales_team}`;
            }
            if (column.dataIndex === 'availability'){
                value = value === '1' ? backendIntl.get('user.yes', '是') : backendIntl.get('user.no', '否');
            }
            //处理特殊字符
            value = _.isString(value) ? value.replace(/,/g, '，') : '';
            value = value.replace(/\n/g, ' ');
            return value;
        });
        return values.join();
    });
    const head = columnTitles.join();
    let csvArr = [];
    csvArr.push(head);
    csvArr = csvArr.concat(rows);
    let csv = csvArr.join('\n');
    //防止中文乱码
    csv = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(csv)]);
    res.setHeader('Content-disposition', `attachement; filename=${encodeURI(backendIntl.get('crm.sales.clue', '线索'))}.csv`);
    res.setHeader('Content-Type', 'application/csv');
    res.send(csv);
}
//批量修改线索的所属销售
exports.changeClueSalesBatch = function(req, res) {
    clueCustomerService.changeClueSalesBatch(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getRecommendClueCount = function(req, res) {
    clueCustomerService.getRecommendClueCount(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getSimilarClueLists = function(req, res) {
    clueCustomerService.getSimilarClueLists(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getSimilarCustomerLists = function(req, res) {
    clueCustomerService.getSimilarCustomerLists(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getRecommendClueLists = function(req, res) {
    clueCustomerService.getRecommendClueLists(req, res)
        .on('success', function(data) {
            var result = {list: [],total: _.get(data,'total',0), listId: _.get(data,'id','')};
            _.forEach(_.get(data,'list',[]), item => {
                result.list.push(recommendClueDto.toFrontRecommendClueData(item));
            });
            res.status(200).json(result);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getClueIndustryLists = function(req, res) {
    clueCustomerService.getClueIndustryLists(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getSelfClueConditionConfig = function(req, res) {
    clueCustomerService.getSelfClueConditionConfig(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.addOrEditSelfClueConditionConfig = function(req, res) {
    clueCustomerService.addOrEditSelfClueConditionConfig(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.extractRecommendClue = function(req, res) {
    clueCustomerService.extractRecommendClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.batchExtractRecommendLists = function(req, res) {
    clueCustomerService.batchExtractRecommendLists(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getClueListByKeyword = function(req, res) {
    clueCustomerService.getClueListByKeyword(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//释放线索
exports.releaseClue = function(req, res) {
    clueCustomerService.releaseClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
//线索批量操作
exports.batchReleaseClue = function(req, res) {
    clueCustomerService.batchReleaseClue(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};

//线索名、电话唯一性验证
exports.checkOnlyClueNamePhone = function(req, res) {
    clueCustomerService.checkOnlyClueNamePhone(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err.message);
        });
};

//获取申请试用数据
exports.getApplyTryData = function(req, res) {
    clueCustomerService.getApplyTryData(req, res)
        .on('success',function(data) {
            res.status(200).json(data);
        }).on('error',function(err) {
            res.status(500).json(err.message);
        });
};

//获取申请试用数据
exports.getCompanyListByName = function(req, res) {
    clueCustomerService.getCompanyListByName(req, res)
        .on('success',function(data) {
            res.status(200).json(data);
        }).on('error',function(err) {
            res.status(500).json(err.message);
        });
};
