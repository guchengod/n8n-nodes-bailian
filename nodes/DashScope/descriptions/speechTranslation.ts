import { INodeProperties } from 'n8n-workflow';

export const SpeechTranslationOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['speechTranslation'] } },
		options: [
			{ name: '音视频翻译 (异步)', value: 'livetranslate_async', action: '音视频翻译' },
			{ name: '同步语音翻译 (同步)', value: 'gummy_translate', action: '同步语音翻译' },
		],
		default: 'livetranslate_async',
	},
];

export const SpeechTranslationFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: { show: { resource: ['speechTranslation'] } },
		options: [
			{ name: '通义千问-音视频翻译', value: 'qwen-livetranslate-v1' },
			{ name: '通义千问-实时音视频翻译', value: 'qwen-livetranslate-realtime-v1' },
			{ name: 'Gummy (实时长语音翻译)', value: 'gummy-realtime-v1' },
		],
		default: 'qwen-livetranslate-v1',
	},
	{
		displayName: '文件 URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: '例如: https://example.com/video.mp4',
		displayOptions: { show: { resource: ['speechTranslation'] } },
		required: true,
	},
	{
		displayName: '源语言',
		name: 'sourceLanguage',
		type: 'string',
		default: 'zh',
		placeholder: 'zh, en, ja, ko...',
		displayOptions: { show: { resource: ['speechTranslation'] } },
	},
	{
		displayName: '目标语言',
		name: 'targetLanguage',
		type: 'string',
		default: 'en',
		placeholder: 'en, zh, ja, ko...',
		displayOptions: { show: { resource: ['speechTranslation'] } },
	},
	{
		displayName: '高级参数',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加参数',
		default: {},
		displayOptions: { show: { resource: ['speechTranslation'] } },
		options: [
			{ displayName: '提示词 (Prompt)', name: 'prompt', type: 'string', default: '' },
			{ displayName: '输出格式 (Format)', name: 'format', type: 'options', options: [{name:'MP3',value:'mp3'},{name:'WAV',value:'wav'}], default: 'mp3' },
			{ displayName: '视频背景音乐保留', name: 'background_music_preservation', type: 'boolean', default: true },
		],
	},
	{
		displayName: '是否等待翻译完成',
		name: 'waitingForTask',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['speechTranslation'], operation: ['livetranslate_async'] } },
	},
];
