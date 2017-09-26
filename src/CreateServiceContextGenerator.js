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
			const fields = domainEntity.fields();
			Object.keys(fields).forEach(fieldName => {
				const field = fields[fieldName];
				if (field.serviceMethod) {
					let args = {};

					if (field.inhertedArgs) {
						Object.keys(field.inhertedArgs).forEach(argName => {
							args[field.inhertedArgs[argName]] = model["get" + capitalizeOnlyFirstLetter(argName)]()
						});
					}

					this[fieldName] = (props) => {
						var newArgs = {
							...args
						}
						if (field.args) {
							Object.keys(field.args).forEach(argName => {
								newArgs[argName] = props[argName];
							});
						}
						return new Promise((resolve, reject) => {
							context[field.serviceMethod](newArgs).then(res => {
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
					let req;
					let requestMessageName = method.requestTypeName;
					if (requestMessageName) {
						if (!messages[method.requestTypeName] &&
							messages[method.requestTypeName] !== "function") {
								throw new Error("There is no messagetype " + requestMessageName);
							} else {
								req = new messages[requestMessageName]();
							}
						
					} else {
						requestMessageName = capitalizeFirstLetter(serviceMethodName) + "Request";
						if (messages[requestMessageName] &&
							typeof messages[requestMessageName] === "function") {
							req = new messages[requestMessageName]();
						} else {
							throw new Error("There is no messagetype " + requestMessageName);
						}						
					}
					if (!req["set" + capitalizeOnlyFirstLetter(method.dataLoader.serviceTypeName) + "List"] &&
						typeof req["set" + capitalizeOnlyFirstLetter(method.dataLoader.serviceTypeName) + "List"] !== "function") {
						throw new Error(requestMessageName + " type does not have property " + method.dataLoader.serviceTypeName);
					}

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
					let req;
					if (method.requestTypeName) {
						if (!messages[method.requestTypeName] &&
							messages[method.requestTypeName] !== "function") {
								throw new Error("There is no messagetype " + method.requestTypeName);
							} else {
								req = new messages[method.requestTypeName]();
							}
						
					} else {
						const requestMessageName = capitalizeFirstLetter(serviceMethodName) + "Request";
						if (messages[requestMessageName] &&
							typeof messages[requestMessageName] === "function") {
							req = new messages[requestMessageName]();
						} else {
							throw new Error("There is no messagetype " + requestMessageName);
						}
						
					}
					if (props) {
						Object.keys(method.args).forEach(argName => {
							const arg = method.args[argName];
							if (arg.type instanceof ListType) {
								if (req["set" + capitalizeOnlyFirstLetter(argName) + "List"]) {
									req["set" + capitalizeOnlyFirstLetter(argName) + "List"](props[argName]);
								} else {
									console.error(serviceMethodName, "has no method set" + capitalizeOnlyFirstLetter(argName) + "List");
								}
							} else {
								if (req["set" + capitalizeOnlyFirstLetter(argName)]) {
									req["set" + capitalizeOnlyFirstLetter(argName)](props[argName]);
								} else {
									console.error(serviceMethodName, "has no method set" + capitalizeOnlyFirstLetter(argName));
								}
							}
						});
					}
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