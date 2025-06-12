import { INodeProperties } from 'n8n-workflow';

export const TextToImageOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['textToImage'],
			},
		},
		options: [
			{
				name: '创建图像',
				value: 'create',
				description: '使用文本描述生成图像',
				action: '创建图像',
			},
		],
		default: 'create',
	},
];

export const TextToImageFields: INodeProperties[] = [
	// 创建图像操作的参数
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		options: [
			{
				name: 'Wanx Image',
				value: 'wanx-v1',
			},
			{
				name: 'Stable Diffusion XL',
				value: 'stable-diffusion-xl',
			},
		],
		default: 'wanx-v1',
		description: '要使用的模型',
		displayOptions: {
			show: {
				resource: ['textToImage'],
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
		placeholder: '例如：一只可爱的小猫',
		description: '用于生成图像的文本描述',
		displayOptions: {
			show: {
				resource: ['textToImage'],
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
		description: '指定不希望在图像中出现的内容',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: '输出图片数量',
		name: 'n',
		type: 'number',
		default: 1,
		description: '要生成的图像数量',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: '尺寸',
		name: 'size',
		type: 'options',
		options: [
			{
				name: '1024 x 1024',
				value: '1024*1024',
			},
			{
				name: '720 x 1280',
				value: '720*1280',
			},
			{
				name: '1280 x 720',
				value: '1280*720',
			},
		],
		default: '1024*1024',
		description: '输出图片的尺寸',
		displayOptions: {
			show: {
				resource: ['textToImage'],
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
				resource: ['textToImage'],
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
				resource: ['textToImage'],
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
				resource: ['textToImage'],
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
				resource: ['textToImage'],
				operation: ['create'],
			},
		},
		options: [
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
