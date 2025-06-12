import { INodeProperties } from 'n8n-workflow';

export const TextToVideoOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['textToVideo'],
			},
		},
		options: [
			{
				name: '创建视频',
				value: 'create',
				description: '使用文本描述生成视频',
				action: '创建视频',
			},
		],
		default: 'create',
	},
];

export const TextToVideoFields: INodeProperties[] = [
	// 创建视频操作的参数
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		options: [
			{
				name: 'Text To Video',
				value: 'text-to-video',
			},
		],
		default: 'text-to-video',
		description: '要使用的模型',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['create'],
			},
		},
		required: true,
	},
	{
		displayName: '提示词',
		name: 'prompt',
		type: 'string',
		default: '',
		placeholder: '例如：一只可爱的小猫在跑步',
		description: '用于生成视频的文本描述',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['create'],
			},
		},
		required: true,
	},
	{
		displayName: '负面提示词',
		name: 'negativePrompt',
		type: 'string',
		default: '',
		placeholder: '例如：模糊、低质量',
		description: '指定不希望在视频中出现的内容',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: '是否持续轮询任务结果',
		name: 'waitingForTask',
		type: 'boolean',
		default: true,
		description: '是否等待并轮询直到任务完成',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: '轮询时间间隔 (毫秒)',
		name: 'interval',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['create'],
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
				resource: ['textToVideo'],
				operation: ['create'],
				waitingForTask: [true],
			},
		},
		default: 300,
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
				resource: ['textToVideo'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: '视频时长',
				name: 'duration',
				type: 'number',
				default: 3,
				description: '视频的持续时间，单位为秒',
			},
			{
				displayName: '图片宽度',
				name: 'width',
				type: 'number',
				default: 1024,
				description: '视频宽度',
			},
			{
				displayName: '图片高度',
				name: 'height',
				type: 'number',
				default: 576,
				description: '视频高度',
			},
			{
				displayName: '种子值',
				name: 'seed',
				type: 'number',
				default: 0,
				description: '指定随机种子值以获得可重复的结果，0表示随机',
			},
		],
	},
];
