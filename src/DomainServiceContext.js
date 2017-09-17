import grpc from "grpc";
import services from "./service/wompatti_service_grpc_pb";
import DomainServiceMethod from "./DomainServiceMethod";

import {
	capitalizeFirstLetter
} from "./stringhelpers";

export default class DomainServiceContext {
	constructor(options) {
		this.messages = options.messages;
		this.domainService = options.domainService;
		this.generatedMethods = {};

		const {
			ip,
			port,
			context,
			name
		} = options;

		this.client = new services[capitalizeFirstLetter(name) + "Client"](
			ip + ":" + port,
			grpc.credentials.createInsecure()
		);
	}

	getMethod(methodName) {
		if (!this.generatedMethods[methodName]) {
			this.generatedMethods[methodName] = DomainServiceMethod({
				methodName,
				messages: this.messages,
				client: this.client,
				servicePackage: this.domainService.servicePackage,
				serviceRoot: this.domainService.serviceRoot
			});
		}
		return this.generatedMethods[methodName];
	}
}