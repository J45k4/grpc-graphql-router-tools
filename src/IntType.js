import {
	GraphQLInt
} from "graphql";

class IntType {
	constructor() {

	}
	get schema() {
		return GraphQLInt
	}
}

export default new IntType();