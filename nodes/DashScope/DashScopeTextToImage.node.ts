import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class DashScopeTextToImage implements INodeType {
	description: INodeTypeDescription = {
		displayName: '阿里云 DashScope 文本生图',
		name: 'dashScopeTextToImage',
		icon: 'file:dashscope.svg',
		group: ['transform'],
		version: 1,
		description: '使用阿里云 DashScope 的文本到图像合成 API',
		defaults: {
			name: '文本生图',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'dashScopeApi',
				required: true,
			},
		],
		properties: [
			// 模型选择
			{
				displayName: '模型',
				name: 'model',
				type: 'options',
				options: [
					{
						name: 'WanXiang 2.1 Turbo',
						value: 'wanx2.1-t2i-turbo',
					},
					{
						name: 'WanXiang 2.0',
						value: 'wanx2.0',
					},
				],
				default: 'wanx2.1-t2i-turbo',
				description: '选择要使用的模型',
			},
			// 提示词
			{
				displayName: '提示词',
				name: 'prompt',
				type: 'string',
				default: '',
				description: '用于生成图像的文本描述',
				required: true,
			},
			// 反向提示词
			{
				displayName: '反向提示词',
				name: 'negativePrompt',
				type: 'string',
				default: '',
				description: '指定不希望在生成的图像中出现的元素',
			},
			// 图片尺寸
			{
				displayName: '图片尺寸',
				name: 'size',
				type: 'options',
				options: [
					{
						name: '1024 X 1024',
						value: '1024*1024',
					},
					{
						name: '1024 X 768',
						value: '1024*768',
					},
					{
						name: '1280 X 720',
						value: '1280*720',
					},
					{
						name: '720 X 1280',
						value: '720*1280',
					},
					{
						name: '768 X 1024',
						value: '768*1024',
					},
				],
				default: '1024*1024',
				description: '生成图像的尺寸',
			},
			// 生成的图片数量
			{
				displayName: '生成图片数量',
				name: 'n',
				type: 'number',
				default: 1,
				description: '要生成的图像数量',
				typeOptions: {
					minValue: 1,
					maxValue: 4,
				},
			},
			// 是否使用异步API
			{
				displayName: '异步请求',
				name: 'async',
				type: 'boolean',
				default: true,
				description: 'Whether to use asynchronous API request (是否使用异步API请求方式)',
			},
			// 轮询结果设置（仅异步模式下可用）
			{
				displayName: '等待结果',
				name: 'waitForResult',
				type: 'boolean',
				displayOptions: {
					show: {
						async: [true],
					},
				},
				default: true,
				description: 'Whether to wait for the async task to complete and return results (是否等待异步任务完成并返回结果)',
			},
			// 轮询间隔时间
			{
				displayName: '轮询间隔(毫秒)',
				name: 'pollingInterval',
				type: 'number',
				displayOptions: {
					show: {
						async: [true],
						waitForResult: [true],
					},
				},
				default: 2000,
				description: '轮询任务结果的间隔时间',
			},
			// 最大轮询次数
			{
				displayName: '最大轮询次数',
				name: 'maxPollingAttempts',
				type: 'number',
				displayOptions: {
					show: {
						async: [true],
						waitForResult: [true],
					},
				},
				default: 30,
				description: '最大轮询次数，超过此次数将停止等待',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		// 获取凭证
		const credentials = await this.getCredentials('dashScopeApi');
		if (!credentials) {
			throw new NodeOperationError(this.getNode(), 'No credentials found!');
		}

		const apiKey = credentials.apiKey as string;
		const baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';

		for (let i = 0; i < items.length; i++) {
			try {
				// 获取参数
				const model = this.getNodeParameter('model', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const negativePrompt = this.getNodeParameter('negativePrompt', i) as string;
				const size = this.getNodeParameter('size', i) as string;
				const n = this.getNodeParameter('n', i) as number;
				const useAsync = this.getNodeParameter('async', i) as boolean;
				const waitForResult = this.getNodeParameter('waitForResult', i, false) as boolean;
				const pollingInterval = this.getNodeParameter('pollingInterval', i, 2000) as number;
				const maxPollingAttempts = this.getNodeParameter('maxPollingAttempts', i, 30) as number;

				// 构建API请求头
				const headers: Record<string, string> = {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
				};

				if (useAsync) {
					headers['X-DashScope-Async'] = 'enable';
				}

				// 构建请求体
				const requestBody = {
					model,
					input: {
						prompt,
						negative_prompt: negativePrompt || undefined,
					},
					parameters: {
						size,
						n,
					},
				};

				// 发送API请求
				let response: any;
				try {
					response = await axios.post(baseUrl, requestBody, { headers });
				} catch (error: any) {
					if (error.response) {
						throw new NodeOperationError(
							this.getNode(),
							`API错误: ${error.response.data.code} - ${error.response.data.message}`,
							{ itemIndex: i },
						);
					}
					throw new NodeOperationError(this.getNode(), `请求错误: ${error.message}`, {
						itemIndex: i,
					});
				}

				// 处理同步和异步响应的不同情况
				if (useAsync && waitForResult && response.data.output?.task_id) {
					// 异步模式，需要轮询结果
					const taskId = response.data.output.task_id;
					const taskResultUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
					
					let taskResult: any;
					let attempts = 0;
					let taskStatus = 'PENDING';
					
					// 轮询异步任务结果
					while (['PENDING', 'RUNNING'].includes(taskStatus) && attempts < maxPollingAttempts) {
						// 等待指定的轮询间隔
						await new Promise<void>(resolve => {
							setTimeout(() => resolve(), pollingInterval);
						});
						
						attempts++;
						
						try {
							const pollingResponse = await axios.get(taskResultUrl, { headers: { 'Authorization': `Bearer ${apiKey}` } });
							taskResult = pollingResponse.data as Record<string, any>;
							taskStatus = taskResult.output?.task_status || taskResult.task_status;
							
							// 任务完成或失败时跳出循环
							if (taskStatus === 'SUCCEEDED' || taskStatus === 'FAILED') {
								break;
							}
						} catch (error: any) {
							throw new NodeOperationError(
								this.getNode(),
								`轮询任务结果失败: ${error.message}`,
								{ itemIndex: i },
							);
						}
					}
					
					if (taskStatus === 'SUCCEEDED') {
						// 任务成功，返回生成的图像
						returnData.push({
							json: {
								...(taskResult as Record<string, any>),
								success: true,
							},
						});
					} else {
						// 任务失败或超时
						returnData.push({
							json: {
								task_id: taskId,
								task_status: taskStatus,
								message: taskStatus === 'FAILED' ? '任务失败' : '任务超时',
								success: false,
							},
						});
					}
				} else {
					// 同步模式或不等待结果的异步模式
					returnData.push({
						json: {
							...(response.data as Record<string, any>),
							success: true,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							success: false,
						},
					});
				} else {
					throw error;
				}
			}
		}

		return [returnData];
	}
}
