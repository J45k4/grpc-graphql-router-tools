
import CreateServiceContextGenerator from "./CreateServiceContextGenerator";

export default ({
	domainServices
}) => {
	var domainContexts = {};

	Object.keys(domainServices).forEach(domainServiceName => {
		domainContexts[domainServiceName] = CreateServiceContextGenerator({
			domainService: domainServices[domainServiceName].type
		});
	});

	return (config) => {
		let context = {};

		Object.keys(domainContexts).forEach(domainServiceName => {
			context[domainServiceName] = domainContexts[domainServiceName]({
				...config[domainServiceName],
				token: config.token
			});
		});

		return context;
	}
}