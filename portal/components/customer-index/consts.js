/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/16.
 */
export const MESSAGE_TYPES = {
    API_DOCUMENT_EX_VOICE: 'ApiDocumentExVoice',//音频
    API_DOCUMENT_EX_PHOTO: 'ApiDocumentExPhoto',
    API_REPLACED_ATTACHMENTS: 'ApiReplacedAttachments',
    API_DOCUMENT_MESSAGE: 'ApiDocumentMessage',
    API_TEXT_MESSAGE: 'ApiTextMessage',
    TEXT: 'TEXT',//文本
    IMAGE: 'IMAGE',//图片
    EMOJI: 'EMOJI',//表情
};

export const sdkEventConstants = {
    MessageConstants: {
        /**
         *  会话
         */
        dialog: {
            // 发送消息
            'send-message-before': 'send-message-before',
            // 收到消息
            'update-message': 'update-message',
            // 消息内容变更
            'message-content-change': 'message-content-change',
            // 发送消息成功
            'send-message-success': 'send-message-success',
            // 会话刷新
            'loaded': 'loaded'
        },
        /**
         *  用户
         */
        user: {
            // 获取用户ID
            'user-id': 'user-id',
            // 被人踢下线
            'update-offline': 'update-offline'
        }
    }
};