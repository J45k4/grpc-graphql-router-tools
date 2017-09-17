
import DomainServiceContext from "./DomainServiceContext";

export default class DomainComposeContext {
	constructor(options) {
		this.config = options.config;
		this.domainServices = options.domainServices;
		this.messages = options.messages
		this.generatedContexts = {};
	}

	getServiceContext(serviceName) {
		if (!this.generatedContexts[serviceName]) {
			this.generatedContexts[serviceName] = new DomainServiceContext({
				name: serviceName,
				config: {
					...this.config[serviceName],
					token: this.config.token
				},
				domainService: this.domainServices[serviceName],
				messages: this.messages
			});
		}
		return this.generatedContexts[serviceName];
	}
}