import { INodeProperties } from 'n8n-workflow';

export const VectorOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['vectors'] } },
		options: [
			{ name: '通用文本向量 (同步)', value: 'text_embedding', action: '生成文本向量' },
			{ name: '多模态向量 (同步)', value: 'multimodal_embedding', action: '生成多模态向量' },
			{ name: '批处理文本向量 (异步)', value: 'batch_text_embedding', action: '批处理文本向量' },
		],
		default: 'text_embedding',
	},
];

export const VectorFields: INodeProperties[] = [
	{
		displayName: '模型',
		name: 'model',
		type: 'options',
		displayOptions: { show: { resource: ['vectors'] } },
		options: [
			{ name: 'Text Embedding V2 (推荐)', value: 'text-embedding-v2' },
			{ name: 'Text Embedding V1', value: 'text-embedding-v1' },
			{ name: 'Multimodal Embedding (多模态)', value: 'multimodal-embedding-v1' },
		],
		default: 'text-embedding-v2',
	},
	// --- 文本向量参数 ---
	{
		displayName: '文本列表',
		name: 'texts',
		type: 'string',
		default: '',
		placeholder: '例如: 阿里云,百炼,大模型',
		description: '多个文本用英文逗号分隔，或输入 JSON 数组',
		displayOptions: { show: { resource: ['vectors'], operation: ['text_embedding', 'batch_text_embedding'] } },
		required: true,
	},
	// --- 多模态向量参数 ---
	{
		displayName: '图片 URL',
		name: 'imageUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/image.jpg',
		displayOptions: { show: { resource: ['vectors'], operation: ['multimodal_embedding'] } },
	},
	{
		displayName: '视频 URL',
		name: 'videoUrl',
		type: 'string',
		default: '',
		placeholder: 'https://example.com/video.mp4',
		displayOptions: { show: { resource: ['vectors'], operation: ['multimodal_embedding'] } },
	},
	{
		displayName: '内容文本 (选填)',
		name: 'content',
		type: 'string',
		default: '',
		placeholder: '用于辅助描述多模态内容',
		displayOptions: { show: { resource: ['vectors'], operation: ['multimodal_embedding'] } },
	},
	// --- 批处理特有参数 ---
	{
		displayName: 'OSS 输入路径',
		name: 'oss_input_path',
		type: 'string',
		default: '',
		placeholder: 'oss://bucket/path/to/input.txt',
		displayOptions: { show: { resource: ['vectors'], operation: ['batch_text_embedding'] } },
	},
	// --- 高级参数 ---
	{
		displayName: '高级参数',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: '添加参数',
		default: {},
		displayOptions: { show: { resource: ['vectors'] } },
		options: [
			{ displayName: '向量维度 (Dimension)', name: 'dimension', type: 'number', default: 1536 },
			{ displayName: '向量类型 (Type)', name: 'text_type', type: 'options', options: [{name:'Query',value:'query'},{name:'Document',value:'document'}], default: 'document' },
		],
	},
];
