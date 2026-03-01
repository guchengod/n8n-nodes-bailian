import { INodeProperties } from 'n8n-workflow';

export const SpeechTranslationOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['speechTranslation'],
			},
		},
		options: [
			{
				name: '语音翻译',
				value: 'translate',
				description: '将音频文件翻译为其他语言',
				action: '语音翻译',
			},
		],
		default: 'translate',
	},
];

export const SpeechTranslationFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		options: [
			{
				name: 'Qwen Audio Turbo',
				value: 'qwen-audio-turbo',
			},
		],
		default: 'qwen-audio-turbo',
		description: '要使用的模型',
		displayOptions: {
			show: {
				resource: ['speechTranslation'],
				operation: ['translate'],
			},
		},
		required: true,
	},
	{
		displayName: '音频文件 URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: '例如：https://example.com/audio.wav',
		description: '待识别的音频文件 URL',
		displayOptions: {
			show: {
				resource: ['speechTranslation'],
				operation: ['translate'],
			},
		},
		required: true,
	},
	{
		displayName: '源语言',
		name: 'sourceLanguage',
		type: 'string',
		default: 'zh',
		description: '音频中的主要语言，例如 zh, en',
		displayOptions: {
			show: {
				resource: ['speechTranslation'],
				operation: ['translate'],
			},
		},
	},
	{
		displayName: '目标语言',
		name: 'targetLanguage',
		type: 'string',
		default: 'en',
		description: '翻译后的语言，例如 en, zh, ja, ko',
		displayOptions: {
			show: {
				resource: ['speechTranslation'],
				operation: ['translate'],
			},
		},
	},
	{
		displayName: '高级选项',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加选项',
		default: {},
		displayOptions: {
			show: {
				resource: ['speechTranslation'],
				operation: ['translate'],
			},
		},
		options: [
			{
				displayName: '提示词 (Prompt)',
				name: 'prompt',
				type: 'string',
				default: '',
				description: '对翻译过程的补充提示信息',
			},
		],
	},
];
