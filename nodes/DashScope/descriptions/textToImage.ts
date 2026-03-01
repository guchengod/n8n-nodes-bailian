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
				name: '文生图 (异步)',
				value: 'create',
				description: '使用文本描述生成图像',
				action: '文生图',
			},
			{
				name: '图像编辑/处理 (异步)',
				value: 'edit',
				description: '对现有图像进行编辑、重绘、扩展或补全',
				action: '图像编辑',
			},
			{
				name: '行业专用生成 (异步)',
				value: 'special',
				description: '虚拟模特、试衣、写真、海报、WordArt等',
				action: '行业专用生成',
			},
		],
		default: 'create',
	},
];

export const TextToImageFields: INodeProperties[] = [
	// --- 模型选择 ---
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['create'],
			},
		},
		options: [
			{ name: '万相-文生图V2', value: 'wanx-v2' },
			{ name: '万相-文生图V1', value: 'wanx-v1' },
			{ name: '文生图FLUX', value: 'flux-schnell' },
			{ name: '文生图StableDiffusion', value: 'stable-diffusion-xl' },
			{ name: '文生图Z-Image', value: 'z-image-v1' },
			{ name: '千问-文生图', value: 'qwen-vl-max' },
		],
		default: 'wanx-v2',
		required: true,
	},
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['edit'],
			},
		},
		options: [
			{ name: '万相-图像生成与编辑2.6', value: 'wanx2.1-t2i-edit' },
			{ name: '万相-通用图像编辑2.5', value: 'wanx-edit-v25' },
			{ name: '万相-通用图像编辑2.1', value: 'wanx-edit-v21' },
			{ name: '万相-涂鸦作画', value: 'wanx-sketch-to-image-v1' },
			{ name: '万相-图像局部重绘', value: 'wanx-image-local-repaint-v1' },
			{ name: '人像风格重绘', value: 'wanx-style-repaint-v1' },
			{ name: '图像画面扩展', value: 'wanx-image-outpainting-v1' },
			{ name: '图像背景生成', value: 'wanx-background-generation-v2' },
			{ name: '图像擦除补全', value: 'wanx-image-erasure-completion-v1' },
			{ name: '人物实例分割', value: 'wanx-person-instance-segmentation-v1' },
			{ name: '千问-图像编辑', value: 'qwen-vl-edit' },
			{ name: '千问-图像翻译', value: 'qwen-vl-translation' },
		],
		default: 'wanx2.1-t2i-edit',
		required: true,
	},
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['special'],
			},
		},
		options: [
			{ name: 'AI试衣OutfitAnyone', value: 'outfit-anyone-v1' },
			{ name: '人物写真FaceChain', value: 'facechain-generation-v1' },
			{ name: '创意文字WordArt锦书', value: 'wordart-texture' },
			{ name: '虚拟模特', value: 'wanx-virtual-model-v1' },
			{ name: '鞋靴模特', value: 'wanx-shoe-model-v1' },
			{ name: '创意海报生成', value: 'wanx-creative-poster-v1' },
		],
		default: 'outfit-anyone-v1',
		required: true,
	},

	// --- 基础参数 ---
	{
		displayName: '提示词 (Prompt)',
		name: 'prompt',
		type: 'string',
		default: '',
		placeholder: '例如：一只可爱的小猫',
		description: '用于生成或编辑图像的文本描述',
		displayOptions: {
			show: {
				resource: ['textToImage'],
			},
			hide: {
				model: ['wanx-person-instance-segmentation-v1'],
			},
		},
		required: true,
	},
	{
		displayName: '原图 URL (Base Image URL)',
		name: 'baseImageUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/image.jpg',
		description: '需要编辑或处理的原图地址',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['edit', 'special'],
			},
			hide: {
				model: ['wordart-texture'],
			},
		},
		required: true,
	},
	{
		displayName: '蒙版图片 URL (Mask Image URL)',
		name: 'maskImageUrl',
		type: 'string',
		default: '',
		description: '用于局部重绘或擦除的蒙版图片',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				model: ['wanx-image-local-repaint-v1', 'wanx-image-erasure-completion-v1'],
			},
		},
	},

	// --- WordArt 特有参数 ---
	{
		displayName: '生成文字',
		name: 'text_content',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				model: ['wordart-texture'],
			},
		},
	},

	// --- 基础设置 ---
	{
		displayName: '输出图片数量',
		name: 'n',
		type: 'number',
		default: 1,
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
			{ name: '1024 x 1024', value: '1024*1024' },
			{ name: '720 x 1280', value: '720*1280' },
			{ name: '1280 x 720', value: '1280*720' },
		],
		default: '1024*1024',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				operation: ['create'],
			},
		},
	},

	// --- 轮询设置 ---
	{
		displayName: '是否持续轮询任务结果',
		name: 'waitingForTask',
		type: 'boolean',
		default: true,
		description: '是否等待并轮询直到任务完成',
		displayOptions: {
			show: {
				resource: ['textToImage'],
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
				waitingForTask: [true],
			},
		},
		default: 2000,
	},
	{
		displayName: '最长等待时间 (秒)',
		name: 'maxWaitTime',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['textToImage'],
				waitingForTask: [true],
			},
		},
		default: 300,
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
			},
		},
		options: [
			{
				displayName: '负面提示词',
				name: 'negative_prompt',
				type: 'string',
				default: '',
				description: '指定不希望在图像中出现的内容',
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
