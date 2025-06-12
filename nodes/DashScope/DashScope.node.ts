// 创建一个主节点，例如 DashScope.node.ts
import { 
	INodeType, 
	INodeTypeDescription, 
	NodeConnectionType,
	IExecuteFunctions,
	INodeExecutionData,
	NodeOperationError,
	IDataObject,
	ILoadOptionsFunctions
} from 'n8n-workflow';
import {
	TextToImageFields, 
	TextToImageOperations,
	TextToVideoFields, 
	TextToVideoOperations,
	TaskResultFields, 
	TaskResultOperations
} from './descriptions';
import { pollTaskStatus } from './descriptions/utils';
import axios from 'axios';

export class DashScope implements INodeType {
	description: INodeTypeDescription = {
		displayName: '阿里云百炼',
		name: 'dashScope',
		icon: 'file:dashscope.svg',
		group: ['ai'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: '使用阿里云百炼API',
		defaults: {
			name: '阿里云百炼',
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
				displayName: '资源',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: '图像生成',
						value: 'textToImage',
					},
					{
						name: '视频生成',
						value: 'textToVideo',
					},
					{
						name: '任务结果',
						value: 'taskResult',
					},
				],
				default: 'textToImage',
			},
			// 根据选择的资源动态加载相应的操作和字段
			...TextToImageOperations,
			...TextToImageFields,
			...TextToVideoOperations,
			...TextToVideoFields,
			...TaskResultOperations,
			...TaskResultFields,
		]
	};

	methods = {
		loadOptions: {
			async getOptions() {
				return [];
			}
		},
		listSearch: {
			async search(this: ILoadOptionsFunctions) {
				return { results: [] };
			}
		}
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('dashScopeApi');
		const apiKey = credentials.apiKey as string;

		try {
			// 处理不同的资源和操作
			if (resource === 'textToImage') {
				// 文本生成图像
				if (operation === 'create') {
					for (let i = 0; i < items.length; i++) {
						// 获取参数
						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						const n = this.getNodeParameter('n', i, 1) as number;
						const size = this.getNodeParameter('size', i, '1024*1024') as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						
						// 构造请求体
						const requestBody: IDataObject = {
							model,
							input: {
								prompt,
							},
							parameters: {
								n,
								size,
							}
						};

						// 添加负面提示词
						if (negativePrompt) {
							(requestBody.input as IDataObject).negative_prompt = negativePrompt;
						}

						// 添加高级选项
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						if (Object.keys(additionalOptions).length > 0 && requestBody.parameters) {
							Object.assign(requestBody.parameters as IDataObject, additionalOptions);
						}

						// 发送请求
						const response = await axios({
							method: 'POST',
							url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${apiKey}`
							},
							data: requestBody,
						});

						// 处理响应
						let result = response.data as IDataObject;
						
						// 如果需要轮询任务结果
						if (waitingForTask && result.output) {
							const outputData = result.output as IDataObject;
							if (outputData && typeof outputData.task_id === 'string') {
								const interval = this.getNodeParameter('interval', i, 2000) as number;
								const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 300) as number;
								const taskId = outputData.task_id;
								
								try {
									result = await pollTaskStatus(
										taskId,
										'https://dashscope.aliyuncs.com/api/v1/tasks',
										apiKey,
										interval,
										maxWaitTime
									) as IDataObject;
								} catch (error) {
									throw new NodeOperationError(this.getNode(), `轮询任务结果失败: ${error.message}`);
								}
							}
						}

						returnData.push({
							json: result,
						});
					}
				}
			} else if (resource === 'textToVideo') {
				// 文本生成视频
				if (operation === 'create') {
					for (let i = 0; i < items.length; i++) {
						// 获取参数
						const model = this.getNodeParameter('model', i) as string;
						const prompt = this.getNodeParameter('prompt', i) as string;
						const negativePrompt = this.getNodeParameter('negativePrompt', i, '') as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						
						// 构造请求体
						const requestBody: IDataObject = {
							model,
							input: {
								prompt,
							},
							parameters: {}
						};

						// 添加负面提示词
						if (negativePrompt) {
							(requestBody.input as IDataObject).negative_prompt = negativePrompt;
						}

						// 添加高级选项
						const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as IDataObject;
						if (Object.keys(additionalOptions).length > 0 && requestBody.parameters) {
							Object.assign(requestBody.parameters as IDataObject, additionalOptions);
						}

						// 发送请求
						const response = await axios({
							method: 'POST',
							url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2video/generation',
							headers: {
								'Content-Type': 'application/json',
								'Authorization': `Bearer ${apiKey}`
							},
							data: requestBody,
						});

						// 处理响应
						let result = response.data as IDataObject;
						
						// 如果需要轮询任务结果
						if (waitingForTask && result.output) {
							const outputData = result.output as IDataObject;
							if (outputData && typeof outputData.task_id === 'string') {
								const interval = this.getNodeParameter('interval', i, 2000) as number;
								const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 300) as number;
								const taskId = outputData.task_id as string;
								
								try {
									result = await pollTaskStatus(
										taskId,
										'https://dashscope.aliyuncs.com/api/v1/tasks',
										apiKey,
										interval,
										maxWaitTime
									) as IDataObject;
								} catch (error) {
									throw new NodeOperationError(this.getNode(), `轮询任务结果失败: ${error.message}`);
								}
							}
						}

						returnData.push({
							json: result,
						});
					}
				}
			} else if (resource === 'taskResult') {
				// 查询任务结果
				if (operation === 'queryImageTask' || operation === 'queryVideoTask') {
					for (let i = 0; i < items.length; i++) {
						// 获取参数
						const taskId = this.getNodeParameter('taskId', i) as string;
						const waitingForTask = this.getNodeParameter('waitingForTask', i, true) as boolean;
						const continueOnFail = this.getNodeParameter('continueOnFail', i, true) as boolean;
						
						try {
							// 发送请求
							const response = await axios({
								method: 'GET',
								url: `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
								headers: {
									'Content-Type': 'application/json',
									'Authorization': `Bearer ${apiKey}`
								},
							});

							// 处理响应
							let result = response.data as IDataObject;
							
							// 如果需要轮询任务结果
							if (waitingForTask && result.output) {
								const outputData = result.output as IDataObject;
								if (outputData && typeof outputData.task_id === 'string') {
									if (outputData && outputData.task_status !== 'SUCCEEDED' && outputData.task_status !== 'FAILED') {
										const interval = this.getNodeParameter('interval', i, 2000) as number;
										const maxWaitTime = this.getNodeParameter('maxWaitTime', i, 300) as number;
										const taskId = outputData.task_id as string;
										
										try {
											result = await pollTaskStatus(
												taskId,
												'https://dashscope.aliyuncs.com/api/v1/tasks',
												apiKey,
												interval,
												maxWaitTime
											) as IDataObject;
										} catch (error) {
											if (continueOnFail) {
												result.error = error.message;
											} else {
												throw new NodeOperationError(this.getNode(), `轮询任务结果失败: ${error.message}`);
											}
										}
									}
								}
							}

							returnData.push({
								json: result,
							});
						} catch (error) {
							if (continueOnFail) {
								returnData.push({
									json: {
										error: error.message,
										taskId
									}
								});
							} else {
								throw error;
							}
						}
					}
				}
			}

			return [returnData];
		} catch (error) {
			throw new NodeOperationError(this.getNode(), error as Error);
		}
	}
}
