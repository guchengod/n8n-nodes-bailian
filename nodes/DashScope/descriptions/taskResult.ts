import { INodeProperties } from 'n8n-workflow';

export const TaskResultOperations: INodeProperties[] = [
	{
		displayName: '操作',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['taskResult'],
			},
		},
		options: [
			{
				name: '查询图像任务',
				value: 'queryImageTask',
				description: '查询图像生成任务的结果',
				action: '查询图像任务',
			},
			{
				name: '查询视频任务',
				value: 'queryVideoTask',
				description: '查询视频生成任务的结果',
				action: '查询视频任务',
			},
		],
		default: 'queryImageTask',
	},
];

export const TaskResultFields: INodeProperties[] = [
	// 查询图像任务结果
	{
		displayName: '任务 ID',
		name: 'taskId',
		type: 'string',
		default: '',
		placeholder: '例如：6552xxxxxxxxxxxxx',
		description: '需要查询的任务ID',
		displayOptions: {
			show: {
				resource: ['taskResult'],
				operation: ['queryImageTask'],
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
				resource: ['taskResult'],
				operation: ['queryImageTask'],
			},
		},
	},
	{
		displayName: '轮询时间间隔 (毫秒)',
		name: 'interval',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['taskResult'],
				operation: ['queryImageTask'],
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
				resource: ['taskResult'],
				operation: ['queryImageTask'],
				waitingForTask: [true],
			},
		},
		default: 300,
		description: '等待任务完成的最长时间',
	},
	// 查询视频任务结果
	{
		displayName: '任务 ID',
		name: 'taskId',
		type: 'string',
		default: '',
		placeholder: '例如：6552xxxxxxxxxxxxx',
		description: '需要查询的任务ID',
		displayOptions: {
			show: {
				resource: ['taskResult'],
				operation: ['queryVideoTask'],
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
				resource: ['taskResult'],
				operation: ['queryVideoTask'],
			},
		},
	},
	{
		displayName: '轮询时间间隔 (毫秒)',
		name: 'interval',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['taskResult'],
				operation: ['queryVideoTask'],
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
				resource: ['taskResult'],
				operation: ['queryVideoTask'],
				waitingForTask: [true],
			},
		},
		default: 300,
		description: '等待任务完成的最长时间',
	},
	{
		displayName: '如果任务失败怎么处理',
		name: 'continueOnFail',
		type: 'boolean',
		default: true,
		description: '即使任务失败也继续工作流执行',
		displayOptions: {
			show: {
				resource: ['taskResult'],
			},
		},
	},
];
