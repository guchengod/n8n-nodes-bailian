import { ILoadOptionsFunctions, IDataObject } from 'n8n-workflow';

// 列表搜索方法，可用于下拉选项搜索
export async function listSearch(this: ILoadOptionsFunctions) {
    return [];
}

// 轮询任务状态的函数
export async function pollTaskStatus(taskId: string, apiUrl: string, apiKey: string, interval: number, maxWaitTime: number) {
    const startTime = Date.now();
    const maxWaitTimeMs = maxWaitTime * 1000;
    
    while (Date.now() - startTime < maxWaitTimeMs) {
        const response = await fetch(`${apiUrl}/${taskId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            method: 'GET',
        });
        
        const result = await response.json() as IDataObject;
        
        if ((result.output as IDataObject)?.task_status === 'SUCCEEDED') {
            return result;
        }
        
        if ((result.output as IDataObject)?.task_status === 'FAILED') {
            const taskMessage = (result.output as IDataObject)?.task_message || '未知错误';
            throw new Error(`任务执行失败: ${JSON.stringify(taskMessage)}`);
        }
        
        // 等待指定的间隔时间
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`任务执行超时，已等待 ${maxWaitTime} 秒`);
}
