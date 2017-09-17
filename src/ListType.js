import {
	GraphQLList
} from "graphql";

export default class ListType {
	constructor(type) {
		this.type = type;
	}

	get schema() {
		return new GraphQLList(this.type.schema);
	}
}