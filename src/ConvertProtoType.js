
import {
	GraphQLID,
	GraphQLInt,
	GraphQLString
} from "graphql";

import isIdType from "./IsIdType";

export default (type, fieldName) => {
	if (fieldName && isIdType(fieldName)) {
		return GraphQLID;
	}
	switch(type) {
		case "uint32":
			return GraphQLInt;
		case "string":
			return GraphQLString;
	}
}