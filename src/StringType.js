import {
	GraphQLString
} from "graphql";

class StringType {
	constructor() {

	}

	get schema() {
		return GraphQLString
	}
}

export default new StringType();