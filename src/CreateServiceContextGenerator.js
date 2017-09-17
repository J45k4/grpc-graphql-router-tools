import grpc from "grpc";
import DataLoader from "dataloader";

import {
	DomainEntity,
	ListType
} from "./";

import {
	capitalizeFirstLetter,
	capitalizeOnlyFirstLetter
} from "./stringhelpers";

export default ({
	domainService,
	services
}) => {
	var serviceMethodGenerators = {};
	let contextDomainEntitys = {};
	
	const getContextDomainEntity = (context, domainEntity) => {
		return function(model) {
			Object.keys(domainEntity.fields).forEach(fieldName => {
				const field = domainEntity.fields[fieldName];
				if (field.serviceMethod) {
					let args = {};

					Object.keys(field.inhertedArgs).forEach(argName => {
						args[field.inhertedArgs[argName]] = model["get" + capitalizeOnlyFirstLetter(argName)]()
					});

					this[fieldName] = () => {
						return new Promise((resolve, reject) => {
							context[field.serviceMethod](args).then(res => {
								if (field.returnField) {
									resolve(res[field.returnField]);
								} else {
									resolve(res);
								}
							}).catch(err => {
								reject(err);
							});
						});
					}
				} else {
					if (field.type instanceof DomainEntity) {
						if (typeof model["get" + capitalizeOnlyFirstLetter(fieldName)] === "function") {
							Object.defineProperty(this, fieldName, {
								get: () => new (getContextDomainEntity(context, field.type))(model["get" + capitalizeOnlyFirstLetter(fieldName)]())
							})
						}  else {
							console.warn(domainEntity.name + " model does not have domainentity get method get" + capitalizeOnlyFirstLetter(fieldName));
						}
					} else if (field.type instanceof ListType) {
						if (typeof model["get" + capitalizeOnlyFirstLetter(fieldName) + "List"] === "function") {
							Object.defineProperty(this, fieldName, {
								get: () => {
									var NewType = getContextDomainEntity(context, field.type.type);
									return model["get" + capitalizeOnlyFirstLetter(fieldName) + "List"]().map(p => (
										new NewType(p)
									));
								}
							});
						} else {
							console.warn(domainEntity.name + " model does not have list get method get" + capitalizeOnlyFirstLetter(fieldName) + "List");
						}
					} else {
						if (typeof model["get" + capitalizeOnlyFirstLetter(fieldName)] === "function") {
							Object.defineProperty(this, fieldName, {
								get: () => model["get" + capitalizeOnlyFirstLetter(fieldName)]()
							});
						} else {
							console.warn(domainEntity.name + " model does not have get method get" + capitalizeOnlyFirstLetter(fieldName));
						}
					}
				}
			});
		}
	};

	Object.keys(domainService.methods).forEach(methodName => {
		serviceMethodGenerators[methodName] = CreateServiceMethodGenerator({
			serviceMethodName: methodName,
			method: domainService.methods[methodName],
			messages: domainService.messages,
			getContextDomainEntity
		});
	});

	return (config) => {
		
		if (!config) {

		}
		const {
			ip,
			port
		} = config;
		var client = new domainService.services[capitalizeFirstLetter(domainService.name) + "Client"](
			ip + ":" + port,
			grpc.credentials.createInsecure()
		);

		var context = {};
		Object.keys(serviceMethodGenerators).forEach(methodName => {
			context[methodName] = serviceMethodGenerators[methodName](context, client);
		});
		return context;
	}
}

const CreateServiceMethodGenerator = ({
	serviceMethodName,
	method,
	messages,
	getContextDomainEntity
}) => {
	return (context, client) => {
		if (client[serviceMethodName] && typeof client[serviceMethodName] === "function") {
			if (method.dataLoader) {
				let dataLoader = new DataLoader(keys => new Promise((resolve, reject) => {
					var req = new messages[method.requestTypeName]();
					req["set" + capitalizeOnlyFirstLetter(method.dataLoader.serviceTypeName) + "List"](keys);
					client[serviceMethodName](req, (err, res) => {
						if (err) {
							reject(err);
						} else {
							resolve(res["get" + capitalizeOnlyFirstLetter(method.dataLoader.returnField) + "List"]().map(p => {
								if (p.getId() > 0) {
									return new (getContextDomainEntity(context, method.type))(p);
								} else {
									return null;
								}
							}))
						}
					});
				}));
				return (props) => dataLoader.load(props[method.dataLoader.name]);
			} else {
				return (props) => new Promise((resolve, reject) => {
					var req = new messages[method.requestTypeName]();
					Object.keys(method.args).forEach(argName => {
						req["set" + capitalizeOnlyFirstLetter(argName)](props[argName]);
					});
					client[serviceMethodName](req, (err, res) => {
						if (err) {
							reject(err);
						} else {
							resolve(new (getContextDomainEntity(context, method.type))(res));
						}
					});
				});
			}
		} else {
			throw new Error("Grpc client does not have method " + serviceMethodName);
		}
	}
}