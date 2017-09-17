import {
	GraphQLID
} from "graphql";

class IdType {
	constructor() {

	}

	get schema() {
		return GraphQLID
	}
}

export default new IdType