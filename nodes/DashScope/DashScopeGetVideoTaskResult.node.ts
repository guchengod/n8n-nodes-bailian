import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

interface IDashScopeVideoTaskOutput {
	task_id: string;
	task_status: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'RUNNING' | 'CANCELED' | 'UNKNOWN';
	submit_time?: string;
	scheduled_time?: string;
	end_time?: string;
	video_url?: string;
	orig_prompt?: string;
	actual_prompt?: string;
	code?: string;
	message?: string;
}

interface IDashScopeVideoTaskResponse {
	request_id: string;
	output?: IDashScopeVideoTaskOutput;
	usage?: {
		video_duration?: number;
		video_ratio?: string;
		video_count?: number;
	};
}

export class DashScopeGetVideoTaskResult implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DashScopeGetVideoTaskResult',
		name: 'dashScopeGetVideoTaskResult',
		icon: 'file:dashscope.svg',
		group: ['transform'],
		version: 1,
		description: '查询阿里云 DashScope 文生视频异步任务的执行结果',
		defaults: {
			name: '获取视频任务结果',
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
			{
				displayName: '任务ID',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				description: '要查询的文生视频异步任务的ID',
			},
			{
				displayName: '轮询模式',
				name: 'pollingMode',
				type: 'options',
				options: [
					{
						name: '单次查询',
						value: 'single',
					},
					{
						name: '持续轮询直至完成',
						value: 'polling',
					},
				],
				default: 'single',
				description: '是否持续轮询直至任务完成（视频生成可能需要5-10分钟）',
			},
			{
				displayName: '轮询间隔(毫秒)',
				name: 'pollingInterval',
				type: 'number',
				displayOptions: {
					show: {
						pollingMode: ['polling'],
					},
				},
				default: 15000, // 15秒
				description: '轮询任务结果的间隔时间',
			},
			{
				displayName: '最大轮询次数',
				name: 'maxPollingAttempts',
				type: 'number',
				displayOptions: {
					show: {
						pollingMode: ['polling'],
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

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const taskId = this.getNodeParameter('taskId', itemIndex, '') as string;
				const pollingMode = this.getNodeParameter('pollingMode', itemIndex, 'single') as string;
				const pollingInterval = this.getNodeParameter('pollingInterval', itemIndex, 15000) as number;
				const maxPollingAttempts = this.getNodeParameter('maxPollingAttempts', itemIndex, 60) as number;

				const credentials = await this.getCredentials('dashScopeApi');
				const apiKey = credentials.apiKey as string;

				if (!taskId) {
					throw new NodeOperationError(this.getNode(), '任务ID不能为空');
				}

				const taskUrl = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
				const headers = {
					'Authorization': `Bearer ${apiKey}`,
				};

				if (pollingMode === 'single') {
					// 单次查询模式
					const response = await axios.get<IDashScopeVideoTaskResponse>(taskUrl, { headers });
					const apiResponseData = response.data;
					const taskOutput = apiResponseData.output;

					if (apiResponseData && taskOutput) {
						returnData.push({
							json: {
								request_id: apiResponseData.request_id,
								output: taskOutput,
								usage: apiResponseData.usage,
								success: taskOutput.task_status === 'SUCCEEDED',
								video_url: taskOutput.video_url || null,
							},
							pairedItem: { item: itemIndex },
						});
					} else {
						throw new NodeOperationError(this.getNode(), '获取任务结果失败，响应格式不正确或缺少output字段', { itemIndex });
					}
				} else {
					// 持续轮询模式
					let attempts = 0;
					let taskStatus = 'PENDING';
					let taskResult: IDashScopeVideoTaskResponse | null = null;

					while (['PENDING', 'RUNNING'].includes(taskStatus) && attempts < maxPollingAttempts) {
						// 如果不是第一次查询，等待轮询间隔
						if (attempts > 0) {
							await new Promise<void>(resolve => {
								setTimeout(() => resolve(), pollingInterval);
							});
						}

						attempts++;

						try {
							const response = await axios.get<IDashScopeVideoTaskResponse>(taskUrl, { headers });
							taskResult = response.data;
							taskStatus = taskResult?.output?.task_status || 'UNKNOWN';

							// 任务完成或失败时停止轮询
							if (taskStatus === 'SUCCEEDED' || taskStatus === 'FAILED') {
								break;
							}
						} catch (error: any) {
							throw new NodeOperationError(
								this.getNode(),
								`轮询任务结果失败: ${error.message}`,
								{ itemIndex },
							);
						}
					}

					// 处理最终结果
					if (taskResult && taskResult.output) {
						returnData.push({
							json: {
								request_id: taskResult.request_id,
								output: taskResult.output,
								usage: taskResult.usage,
								success: taskResult.output.task_status === 'SUCCEEDED',
								video_url: taskResult.output.video_url || null,
								polling_attempts: attempts,
								polling_complete: taskStatus === 'SUCCEEDED' || taskStatus === 'FAILED',
							},
							pairedItem: { item: itemIndex },
						});
					} else if (taskResult) {
						// 处理已有结果但结构不完整的情况
						returnData.push({
							json: {
								request_id: taskResult.request_id,
								output: { task_id: taskId, task_status: taskStatus },
								usage: taskResult.usage,
								success: false,
								polling_attempts: attempts,
								polling_complete: false,
								message: '任务结果格式不完整',
							},
							pairedItem: { item: itemIndex },
						});
					} else {
						// 处理没有结果的情况
						returnData.push({
							json: {
								output: { task_id: taskId, task_status: 'UNKNOWN' },
								success: false,
								polling_attempts: attempts,
								polling_complete: false,
								message: '轮询结束但未获取到结果',
							},
							pairedItem: { item: itemIndex },
						});
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							...(error.response?.data ? { details: error.response.data } : {}),
							success: false,
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error.message, {
						itemIndex,
						description: error.response?.data ? JSON.stringify(error.response.data) : undefined,
					});
				}
			}
		}
		return [returnData];
	}
}
