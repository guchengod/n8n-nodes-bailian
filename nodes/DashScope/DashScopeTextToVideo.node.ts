import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

export class DashScopeTextToVideo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DashScopeTextToVideo',
		name: 'dashScopeTextToVideo',
		icon: 'file:dashscope.svg',
		group: ['transform'],
		version: 1,
		description: '使用阿里云 DashScope 的文本到视频合成 API',
		defaults: {
			name: '文本生视频',
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
						name: 'WanXiang 2.1 T2V Turbo (生成速度更快，表现均衡)',
						value: 'wanx2.1-t2v-turbo',
					},
					{
						name: 'WanXiang 2.1 T2V Plus (生成细节更丰富，画面更具质感)',
						value: 'wanx2.1-t2v-plus',
					},
				],
				default: 'wanx2.1-t2v-turbo',
				description: '选择要使用的模型',
			},
			// 提示词
			{
				displayName: '提示词',
				name: 'prompt',
				type: 'string',
				default: '',
				description: '用于生成视频的文本描述，支持中英文，长度不超过800个字符',
				required: true,
			},
			// 视频尺寸
			{
				displayName: '视频尺寸',
				name: 'size',
				type: 'options',
				options: [
					{
						name: '1088 X 832 (4:3)',
						value: '1088*832',
					},
					{
						name: '1280 X 720 (16:9)',
						value: '1280*720',
					},
					{
						name: '480 X 832 (9:16 - 480P)',
						value: '480*832',
					},
					{
						name: '624 X 624 (1:1 - 480P)',
						value: '624*624',
					},
					{
						name: '720 X 1280 (9:16)',
						value: '720*1280',
					},
					{
						name: '832 X 1088 (3:4)',
						value: '832*1088',
					},
					{
						name: '832 X 480 (16:9 - 480P)',
						value: '832*480',
					},
					{
						name: '960 X 960 (1:1)',
						value: '960*960',
					},
				],
				default: '1280*720',
				description: '生成视频的尺寸，注意wanx2.1-t2v-plus仅支持720P档位的分辨率',
			},
			// 是否开启prompt智能改写
			{
				displayName: '开启Prompt智能改写',
				name: 'promptExtend',
				type: 'boolean',
				default: true,
				description: 'Whether to 开启使用大模型对输入prompt进行智能改写，对于较短的prompt生成效果提升明显，但会增加耗时',
			},
			// 随机数种子
			{
				displayName: '随机数种子',
				name: 'seed',
				type: 'number',
				default: '',
				description: '随机数种子，用于控制模型生成内容的随机性。取值范围为[0, 2147483647]。如果不提供，则算法自动生成一个随机数作为种子',

			},
			// 轮询设置
			{
				displayName: '等待结果',
				name: 'waitForResult',
				type: 'boolean',
				default: true,
				description: 'Whether to 等待异步任务完成并返回结果（视频生成通常需要5-10分钟）',
			},
			// 轮询间隔时间
			{
				displayName: '轮询间隔(毫秒)',
				name: 'pollingInterval',
				type: 'number',
				displayOptions: {
					show: {
						waitForResult: [true],
					},
				},
				default: 15000, // 15秒
				description: '轮询任务结果的间隔时间',
			},
			// 最大轮询次数
			{
				displayName: '最大轮询次数',
				name: 'maxPollingAttempts',
				type: 'number',
				displayOptions: {
					show: {
						waitForResult: [true],
					},
				},
				default: 60, // 15秒*60=15分钟
				description: '最大轮询次数，超过此次数将停止等待（生成视频通常需要5-10分钟）',
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
		const baseUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/video-generation/video-synthesis';

		for (let i = 0; i < items.length; i++) {
			try {
				// 获取参数
				const model = this.getNodeParameter('model', i) as string;
				const prompt = this.getNodeParameter('prompt', i) as string;
				const size = this.getNodeParameter('size', i) as string;
				const promptExtend = this.getNodeParameter('promptExtend', i, true) as boolean;
				const seed = this.getNodeParameter('seed', i, '') as number | '';
				const waitForResult = this.getNodeParameter('waitForResult', i, true) as boolean;
				const pollingInterval = this.getNodeParameter('pollingInterval', i, 15000) as number;
				const maxPollingAttempts = this.getNodeParameter('maxPollingAttempts', i, 60) as number;

				// 构建API请求头
				const headers: Record<string, string> = {
					'Authorization': `Bearer ${apiKey}`,
					'Content-Type': 'application/json',
					'X-DashScope-Async': 'enable', // 文生视频API只支持异步
				};

				// 构建请求体
				const requestBody: Record<string, any> = {
					model,
					input: {
						prompt,
					},
					parameters: {
						size,
					},
				};

				// 添加可选参数
				if (promptExtend !== undefined) {
					requestBody.parameters.prompt_extend = promptExtend;
				}

				if (seed !== '') {
					requestBody.parameters.seed = seed;
				}

				// 发送API请求创建任务
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

				// 处理异步响应
				if (response.data.output?.task_id) {
					// 获取任务ID
					const taskId = response.data.output.task_id;
					const taskResultUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

					if (waitForResult) {
						// 如果需要等待结果，进行轮询
						let taskResult: any;
						let attempts = 0;
						let taskStatus = response.data.output.task_status || 'PENDING';

						// 轮询异步任务结果
						while (['PENDING', 'RUNNING'].includes(taskStatus) && attempts < maxPollingAttempts) {
							// 等待指定的轮询间隔
							await new Promise<void>(resolve => {
								setTimeout(() => resolve(), pollingInterval);
							});

							attempts++;

							try {
								const pollingResponse = await axios.get(taskResultUrl, {
									headers: { 'Authorization': `Bearer ${apiKey}` }
								});

								taskResult = pollingResponse.data;
								taskStatus = taskResult.output?.task_status;

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
							// 任务成功，返回生成的视频
							returnData.push({
								json: {
									...taskResult,
									success: true,
									polling_attempts: attempts,
								},
							});
						} else {
							// 任务失败或超时
							returnData.push({
								json: {
									task_id: taskId,
									task_status: taskStatus,
									message: taskStatus === 'FAILED' ? '任务失败' : '任务超时，请使用任务ID手动查询结果',
									success: false,
									polling_attempts: attempts,
								},
							});
						}
					} else {
						// 不等待结果，直接返回任务ID
						returnData.push({
							json: {
								...response.data,
								success: true,
								message: '任务已创建，请使用任务ID查询结果',
							},
						});
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						'API响应异常，未返回任务ID',
						{ itemIndex: i },
					);
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
