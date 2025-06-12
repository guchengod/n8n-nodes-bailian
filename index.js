module.exports = {
	nodes: [
		// DashScope节点
		require('./nodes/DashScope/DashScopeTextToImage.node.js').DashScopeTextToImage,
		require('./nodes/DashScope/DashScopeGetTaskResult.node.js').DashScopeGetTaskResult,
		// DashScope文生视频节点
		require('./nodes/DashScope/DashScopeTextToVideo.node.js').DashScopeTextToVideo,
		require('./nodes/DashScope/DashScopeGetVideoTaskResult.node.js').DashScopeGetVideoTaskResult,
	],
	credentials: [
		// DashScope凭证
		require('./credentials/DashScopeApi.credentials.js').DashScopeApi,
	],
};
