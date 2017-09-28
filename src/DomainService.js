import protobuf from "protobufjs";
import convertProtoType from "./ConvertProtoType";

import ListType from "./ListType";

import {
	GraphQLID,
	GraphQLInputObjectType
} from "graphql";

import {
	capitalizeFirstLetter,
	capitalizeOnlyFirstLetter
} from "./stringhelpers";

import METHOD_TYPES from "./method_types";

export default class DomainService {
	constructor(options) {
		if (!options) {
			throw new Error("DomainService constructor options needs to be an object not null");
		}
		if (!options.name) {
			throw new Error("DomainService constructor options needs to have name property");
		}
		this.name = options.name;
		if (!options.services) {
			throw new Error(this.name + " DomainService constructor options needs to have services property");
		}
		this.services = options.services;
		if (!options.messages) {
			throw new Error(this.name + " DomainService constructor options needs to have messages property");
		}
		this.messages = options.messages;
		if (!options.methods) {
			throw new Error(this.name + " DomainService constructor options needs to have methods property");
		}
		this.methods = options.methods;

		Object.keys(this.methods).forEach(methodName => {
			const method = this.methods[methodName];
			if (!method.type) {
				throw new Error(this.name + " DomainService method " + methodName + " type property is null");
			}
			if (method.type instanceof ListType) {
				if (!method.type.type) {
					throw new Error(this.name + " DomainService method " + methodName + " type ListType property type is null");
				}
			}
		});
	}

	get serviceMethods() {
		
	}
	
	get schema() {
		if (!this._schema) {
			this._schema = {
				query: {},
				mutation: {}
			};
		
			Object.keys(this.methods).forEach(serviceMethodName => {
				const method = this.methods[serviceMethodName];

				if (method.name && !method.methodType) {
					throw new Error(this.name + " service method " + serviceMethodName + " needs to have methodType property");
				}

				if (!method.name && method.methodType) {
					throw new Error(this.name + " service method " + serviceMethodName + " needs to have name property");
				}

				let args = {};
				if (method.dataLoader) {
					args[method.dataLoader.name] = {
						type: GraphQLID
					}
				} else {
					if (method.args) {
						args = {
							params: {
								type: new GraphQLInputObjectType({
									name: capitalizeFirstLetter(method.name) + "Input",
									fields: () => {
										let a = {};
										Object.keys(method.args).forEach(argName => {
											a[argName] = {
												type: method.args[argName].type.schema
											};
										});
										return a;
									}
								})
							}
						};					
					} else {
						throw new Error(this.name + " service method " + serviceMethodName + " needs to provide either args or dataLoader");
					}
				}
				let obj = {
					name: method.name,
					type: method.type.schema,
					args,
					resolve: (obj, props, context) => context[this.name][serviceMethodName](props ? method.dataLoader ? props : props.params || {} : {})
				};
				if (method.methodType === METHOD_TYPES.QUERY) {
					this._schema.query[method.name] = obj;
				} else if (method.methodType === METHOD_TYPES.MUTATION) {
					this._schema.mutation[method.name] = obj;
				}
			});
		}
		return this._schema;
	}
}