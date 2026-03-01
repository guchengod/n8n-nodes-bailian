import { INodeProperties } from 'n8n-workflow';

export const SpeechRecognitionOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['speechRecognition'] } },
		options: [
			{ name: '录音文件识别 (异步/批处理)', value: 'transcription', action: '录音文件识别' },
			{ name: '同步语音识别 (同步/适合短音频)', value: 'recognizer', action: '同步语音识别' },
		],
		default: 'transcription',
	},
];

export const SpeechRecognitionFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: { show: { resource: ['speechRecognition'] } },
		options: [
			{ name: 'Paraformer (录音文件识别)', value: 'paraformer-v1' },
			{ name: 'Paraformer 8k (电话音频)', value: 'paraformer-8k-v1' },
			{ name: 'Fun-ASR (高性能)', value: 'funasr-v1' },
			{ name: 'Qwen-ASR (通义千问识别)', value: 'qwen-asr-v1' },
			{ name: 'SenseVoice (即将下线)', value: 'sensevoice-v1' },
			{ name: 'Gummy (实时识别)', value: 'gummy-realtime-v1' },
		],
		default: 'paraformer-v1',
	},
	{
		displayName: '音频 URL',
		name: 'fileUrl',
		type: 'string',
		default: '',
		placeholder: '例如: https://example.com/audio.wav',
		displayOptions: { show: { resource: ['speechRecognition'] } },
		required: true,
	},
	{
		displayName: '定制热词 (Hotwords)',
		name: 'hotwords',
		type: 'string',
		default: '',
		placeholder: '{"词1":10, "词2":5}',
		description: 'JSON 格式的热词权重配置',
		displayOptions: { show: { resource: ['speechRecognition'] } },
	},
	{
		displayName: '高级参数',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加参数',
		default: {},
		displayOptions: { show: { resource: ['speechRecognition'] } },
		options: [
			{ displayName: '开启说话人角色识别', name: 'diarization_enabled', type: 'boolean', default: false },
			{ displayName: '开启语种检测', name: 'language_detection_enabled', type: 'boolean', default: false },
			{ displayName: '情感检测', name: 'sentiment_enabled', type: 'boolean', default: false },
			{ displayName: '特殊词替换 (Masking)', name: 'disfluency_removal_enabled', type: 'boolean', default: false },
		],
	},
	// 轮询设置 (仅用于录音文件识别)
	{
		displayName: '是否等待识别完成',
		name: 'waitingForTask',
		type: 'boolean',
		default: true,
		displayOptions: { show: { resource: ['speechRecognition'], operation: ['transcription'] } },
	},
	{
		displayName: '轮询间隔 (毫秒)',
		name: 'interval',
		type: 'number',
		default: 3000,
		displayOptions: { show: { resource: ['speechRecognition'], operation: ['transcription'], waitingForTask: [true] } },
	},
];
