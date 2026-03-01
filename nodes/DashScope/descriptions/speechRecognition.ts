import { INodeProperties } from 'n8n-workflow';

export const SpeechRecognitionOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['speechRecognition'],
			},
		},
		options: [
			{
				name: '语音识别',
				value: 'transcription',
				description: '将音频文件转换为文本',
				action: '语音转文本',
			},
		],
		default: 'transcription',
	},
];

export const SpeechRecognitionFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		options: [
			{
				name: 'Paraformer v1',
				value: 'paraformer-v1',
			},
			{
				name: 'Paraformer 8k v1',
				value: 'paraformer-8k-v1',
			},
			{
				name: 'Paraformer Mtl v1',
				value: 'paraformer-mtl-v1',
			},
		],
		default: 'paraformer-v1',
		description: '要使用的模型',
		displayOptions: {
			show: {
				resource: ['speechRecognition'],
				operation: ['transcription'],
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
				resource: ['speechRecognition'],
				operation: ['transcription'],
			},
		},
		required: true,
	},
	{
		displayName: '是否持续轮询任务结果',
		name: 'waitingForTask',
		type: 'boolean',
		default: true,
		description: '是否等待并轮询直到任务完成',
		displayOptions: {
			show: {
				resource: ['speechRecognition'],
				operation: ['transcription'],
			},
		},
	},
	{
		displayName: '轮询时间间隔 (毫秒)',
		name: 'interval',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['speechRecognition'],
				operation: ['transcription'],
				waitingForTask: [true],
			},
		},
		default: 2000,
		description: '检查任务状态的时间间隔',
	},
	{
		displayName: '最长等待时间 (秒)',
		name: 'maxWaitTime',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['speechRecognition'],
				operation: ['transcription'],
				waitingForTask: [true],
			},
		},
		default: 600,
		description: '等待任务完成的最长时间',
	},
	{
		displayName: '高级选项',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加选项',
		default: {},
		displayOptions: {
			show: {
				resource: ['speechRecognition'],
				operation: ['transcription'],
			},
		},
		options: [
			{
				displayName: '开启说话人角色识别',
				name: 'diarization_enabled',
				type: 'boolean',
				default: false,
				description: '是否启用说话人分类',
			},
			{
				displayName: '开启语种检测',
				name: 'language_detection_enabled',
				type: 'boolean',
				default: false,
				description: '是否启用语种自动识别',
			},
		],
	},
];
