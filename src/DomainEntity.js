import {
	GraphQLObjectType
} from "graphql";
import protobuf from "protobufjs";
import convertProtoType from "./ConvertProtoType";

import ListType from "./ListType";

export default class DomainEntity {
	constructor(options) {
		if (!options) {
			throw new Error("DomainEntity options needs to be object");
		}
		if (!options.name) {
			throw new Error("DomainEntity options needs to have name property");
		}
		this.name = options.name;
		if (!options.fields) {
			throw new Error("DomainEntity " + this.name + " needs to have fields option");
		}
		this.fields = options.fields;
		if (typeof this.fields !== "function") {
			throw new Error(`DomainEntity ${this.name} fields option needs to be function`);
		}

		// const fields = this.fields();
		// Object.keys(fields).forEach(fieldName => {
		// 	const field = fields[fieldName];
		// 	if (!field) {
		// 		throw new Error(this.name + " DomainEntity type has null field");
		// 	}
		// 	if (!field.type) {
		// 		throw new Error(this.name + " DomainEntity field " + fieldName + " type is null");
		// 	}
		// 	if (field.type instanceof ListType) {
		// 		if (!field.type.type) {
		// 			throw new Error(this.name + " DomainEntity field " + fieldName + " type is ListType but its type is null");
		// 		}
		// 	}
		// });
	}

	get schema() {
		if (!this._schema) {
			const getFields = () => {
				const fields = this.fields();
				let newFields = {}
				Object.keys(fields).map(fieldName => {
					const field = fields[fieldName];
					if (!field) {
						throw new Error(this.name + " DomainEntity type has null field");
					}
					if (!field.type) {
						throw new Error("DomainEntity " + this.name + " field " + fieldName + " does not have valid type property");
					}
					if (field.type instanceof ListType) {
						if (!field.type.type) {
							throw new Error(this.name + " DomainEntity field " + fieldName + " type is ListType but its type is null");
						}
					}
					let args = {};
					if (field.args) {
						Object.keys(field.args).forEach(argName => {
							const arg = field.args[argName];
							args[argName] = {
								type: arg.type.schema
							};
						});
					}
					newFields[fieldName] = {
						type: fields[fieldName].type.schema,
						args
					};
				});
				return newFields;
			}
			this._schema = new GraphQLObjectType({
				name: this.name,
				fields: getFields
			});
		}
		return this._schema;
	}
}