import {
	GraphQLSchema,
	GraphQLObjectType
} from "graphql";

import CreateContextGenerator from "./CreateContextGenerator";

export default class DomainCompose {
	constructor(options) {
		if (!options) {
			throw new Error("DomainCompose constructor options needs to be an object");
		}
		if (!options.domainServices) {
			throw new Error("DomainCompose constructor options needs to have property domainServices");
		}
		this.domainServices = options.domainServices;
		this.createContext = CreateContextGenerator({
			domainServices: options.domainServices
		});
	}

	get schema() {
		let schemaObject = {
			query: {},
			mutation: {}
		};

		Object.keys(this.domainServices).map(p => this.domainServices[p]).forEach(s => {
			const schema = s.type.schema;
			schemaObject = {
				query: {
					...schemaObject.query,
					...schema.query
				},
				mutation: {
					...schemaObject.mutation,
					...schema.mutation
				}
			}
		});

		const finalSchemaObject = {}

		if (Object.keys(schemaObject.query).length > 0) {
			finalSchemaObject.query = new GraphQLObjectType({
				name: "QueryType",
				fields: () => schemaObject.query
			});
		}

		if (Object.keys(schemaObject.mutation).length > 0) {
			finalSchemaObject.mutation = new GraphQLObjectType({
				name: "MutationType",
				fields: () => schemaObject.mutation
			});
		}

		return new GraphQLSchema(finalSchemaObject);
	}
}