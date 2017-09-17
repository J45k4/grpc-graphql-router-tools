import {
	GraphQLBoolean
} from "graphql";

class BooleanType {
	constructor() {

	}

	get schema() {
		return GraphQLBoolean
	}
}

export default new BooleanType();