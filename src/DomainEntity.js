import {
	GraphQLObjectType
} from "graphql";
import protobuf from "protobufjs";
import convertProtoType from "./ConvertProtoType";

export default class DomainEntity {
	constructor(options) {
		if (!options) {
			throw new Error("DomainEntity options needs to be object");
		}
		if (!options.name) {
			throw new Error("DomainEntity options needs to have name property");
		}
		this.name = options.name;
		this.fields = options.fields;
		this.properties = options.properties;
		this.disabledFields = options.disabledFields || {};
	}

	get schema() {
		if (!this._schema) {
			const getFields = () => {
				var fields = {};
				Object.keys(this.fields).forEach(fieldName => {
					fields[fieldName] = {
						type: this.fields[fieldName].type.schema
					};
				});
				return fields;
			};
			this._schema = new GraphQLObjectType({
				name: this.name,
				fields: getFields
			});
		}
		return this._schema;
	}

	getSchema(serviceRoot) {
		if (!serviceRoot) {
			throw new Error("ServiceRoot for " + this.name + " type getSchema method is null");
		}
		if (!(serviceRoot instanceof protobuf.Root)) {
			throw new Error("ServiceRoot " + this.name + " needs to be instanse of protobufjs root");
		}
		if (!this._schema) {
			const getFields = () => {
				var fields = {};
				const protoType = serviceRoot.lookupType(this.name);
				protoType.fieldsArray.forEach(field => {
					if (!this.disabledFields[field.name]) {
						fields[field.name] = {
							type: convertProtoType(field.type, field.name)
						};
					}
				})
				if (this.properties) {
					Object.keys(this.properties).forEach(propKey => {
						fields[propKey] = {
							type: this.properties[propKey].type.getSchema(serviceRoot)
						};
					});
				}

				return fields;
			};

			this._schema = new GraphQLObjectType({
				name: this.name,
				fields: getFields
			});
		}
		return this._schema;
	}
}