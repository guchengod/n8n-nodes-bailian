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
				name: '文生视频 (异步)',
				value: 'textToVideo',
				description: '使用文本描述生成视频',
				action: '文生视频',
			},
			{
				name: '图生视频 (异步)',
				value: 'imageToVideo',
				description: '基于单张或多张图片生成视频',
				action: '图生视频',
			},
			{
				name: '人像动画/数字人 (异步)',
				value: 'portraitAnimation',
				description: '舞动人像、悦动人像、灵动人像及数字人播报',
				action: '人像动画',
			},
			{
				name: '视频编辑/重绘 (异步)',
				value: 'videoEdit',
				description: '视频换人、风格重绘及通用编辑',
				action: '视频编辑',
			},
		],
		default: 'textToVideo',
	},
];

export const TextToVideoFields: INodeProperties[] = [
	// --- 模型选择 ---
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['textToVideo'],
			},
		},
		options: [
			{ name: '万相-文生视频', value: 'wanx-v2-t2v' },
		],
		default: 'wanx-v2-t2v',
	},
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['imageToVideo'],
			},
		},
		options: [
			{ name: '万相-图生视频-基于首帧', value: 'wanx-v2-i2v' },
			{ name: '万相-图生视频-基于首尾帧', value: 'wanx-v2-i2v-dual' },
			{ name: '万相-参考生视频', value: 'wanx-v2-reference' },
			{ name: '万相-图生动作', value: 'wanx-image-to-action-v1' },
			{ name: '图生表情包视频-Emoji', value: 'wanx-emoji-v1' },
		],
		default: 'wanx-v2-i2v',
	},
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['portraitAnimation'],
			},
		},
		options: [
			{ name: '舞动人像-AnimateAnyone', value: 'animate-anyone-v1' },
			{ name: '悦动人像-EMO', value: 'emo-v1' },
			{ name: '灵动人像-LivePortrait', value: 'live-portrait-v1' },
			{ name: '万相-数字人', value: 'wanx-digital-human-v1' },
		],
		default: 'animate-anyone-v1',
	},
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['videoEdit'],
			},
		},
		options: [
			{ name: '万相-通用视频编辑', value: 'wanx-video-edit-v1' },
			{ name: '万相-视频换人', value: 'wanx-video-face-replace-v1' },
			{ name: '视频口型替换-VideoRetalk', value: 'video-retalk-v1' },
			{ name: '视频风格重绘', value: 'wanx-video-style-repaint-v1' },
		],
		default: 'wanx-video-edit-v1',
	},

	// --- 基础参数 ---
	{
		displayName: '提示词 (Prompt)',
		name: 'prompt',
		type: 'string',
		default: '',
		placeholder: '例如：一只可爱的小猫在跑步',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
			},
			hide: {
				model: ['wanx-emoji-v1', 'wanx-digital-human-v1', 'video-retalk-v1'],
			},
		},
	},
	{
		displayName: '首帧图片 URL',
		name: 'imageUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/start.jpg',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['imageToVideo', 'portraitAnimation'],
			},
		},
		required: true,
	},
	{
		displayName: '尾帧图片 URL',
		name: 'lastFrameUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/end.jpg',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				model: ['wanx-v2-i2v-dual'],
			},
		},
		required: true,
	},
	{
		displayName: '视频 URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/input.mp4',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				operation: ['videoEdit'],
			},
		},
		required: true,
	},
	{
		displayName: '音频 URL',
		name: 'audioUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/audio.mp3',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				model: ['emo-v1', 'video-retalk-v1', 'wanx-digital-human-v1'],
			},
		},
		required: true,
	},

	// --- 轮询设置 ---
	{
		displayName: '是否持续轮询任务结果',
		name: 'waitingForTask',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['textToVideo'],
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
				waitingForTask: [true],
			},
		},
		default: 5000,
	},
	{
		displayName: '最长等待时间 (秒)',
		name: 'maxWaitTime',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['textToVideo'],
				waitingForTask: [true],
			},
		},
		default: 600,
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
			},
		},
		options: [
			{
				displayName: '负面提示词',
				name: 'negative_prompt',
				type: 'string',
				default: '',
			},
			{
				displayName: '种子值',
				name: 'seed',
				type: 'number',
				default: 0,
			},
			{
				displayName: '分辨率',
				name: 'size',
				type: 'options',
				options: [
					{ name: '1280*720', value: '1280*720' },
					{ name: '720*1280', value: '720*1280' },
				],
				default: '1280*720',
			},
		],
	},
];
