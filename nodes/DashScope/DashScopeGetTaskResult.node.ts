import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';
import axios from 'axios';

interface IDashScopeTaskResultError {
	code?: string;
	message?: string;
}

interface IDashScopeTaskResultItem extends IDashScopeTaskResultError {
	orig_prompt?: string;
	actual_prompt?: string;
	url?: string;
}

interface IDashScopeTaskOutput {
	task_id: string;
	task_status: 'SUCCEEDED' | 'FAILED' | 'PENDING' | 'RUNNING' | 'CANCELED' | 'UNKNOWN';
	submit_time?: string;
	scheduled_time?: string;
	end_time?: string;
	results?: IDashScopeTaskResultItem[];
	task_metrics?: {
		TOTAL: number;
		SUCCEEDED: number;
		FAILED: number;
	};
	code?: string;
	message?: string;
}

interface IDashScopeTaskResponse {
	request_id: string;
	output?: IDashScopeTaskOutput;
	usage?: {
		image_count?: number;
	};
}

export class DashScopeGetTaskResult implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DashScopeGetTaskResult',
		name: 'dashScopeGetTaskResult',
		icon: 'file:dashscope.svg',
		group: ['transform'],
		version: 1,
		description: '查询阿里云 DashScope 异步任务的执行结果',
		defaults: {
			name: '获取任务结果',
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
				displayName: '任务ID (Task ID)',
				name: 'taskId',
				type: 'string',
				default: '',
				required: true,
				description: '要查询的异步任务的ID',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const taskId = this.getNodeParameter('taskId', itemIndex, '') as string;
				const credentials = await this.getCredentials('dashScopeApi');
				const apiKey = credentials.apiKey as string;

				if (!taskId) {
					throw new NodeOperationError(this.getNode(), '任务ID不能为空 (Task ID cannot be empty)');
				}

				const response = await axios.get<IDashScopeTaskResponse>(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
					headers: {
						'Authorization': `Bearer ${apiKey}`,
					},
				});

				// 根据API返回的task_status处理结果
				const apiResponseData = response.data;
				const taskOutput = apiResponseData.output;

				if (apiResponseData && taskOutput) {
					const taskStatus = taskOutput.task_status;
					// 检查 'results' 是否存在，并且它是一个数组
					const hasSuccessfulResults = taskOutput.results && Array.isArray(taskOutput.results) && taskOutput.results.some((r: IDashScopeTaskResultItem) => r.url);

					returnData.push({
						json: {
							request_id: apiResponseData.request_id,
							output: taskOutput,
							usage: apiResponseData.usage,
							success: taskStatus === 'SUCCEEDED' || (taskStatus === 'FAILED' && hasSuccessfulResults), // 部分成功也算成功
						},
						pairedItem: { item: itemIndex },
					});
				} else if (apiResponseData && apiResponseData.output === undefined && apiResponseData.request_id) {
					// 处理任务仍在进行中或output未定义但有request_id的情况 (例如 PENDING 状态)
					returnData.push({
						json: {
							request_id: apiResponseData.request_id,
							output: { task_id: taskId, task_status: 'PENDING', message: '任务仍在处理中或输出未定义 (Task is still processing or output is undefined)' },
							usage: apiResponseData.usage,
							success: false, // 标记为非最终成功状态
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), '获取任务结果失败，响应格式不正确或缺少output字段 (Failed to get task result, invalid response format or missing output field)', { itemIndex });
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
