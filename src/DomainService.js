import protobuf from "protobufjs";
import convertProtoType from "./ConvertProtoType";

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
			throw new Error("DomainService constructor options needs to have name field");
		}
		this.services = options.services;
		this.messages = options.messages;
		this.name = options.name;
		this.methods = options.methods;
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
					resolve: (obj, props, context) => context[this.name][serviceMethodName](props)
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