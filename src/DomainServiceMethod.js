
import {
	capitalizeOnlyFirstLetter
} from "./stringhelpers";

import DomainContextEntity from "./DomainContextEntity";

export default ({
	messages,
	servicePackage,
	serviceRoot,
	methodName,
	client
}) => {
	const method = servicePackage.methods[methodName];
	const requestType = serviceRoot.lookupType(method.requestType);
	const responseType = serviceRoot.lookupType(method.responseType);
	return (props) => {
		return new Promise((resolve, reject) => {
			let req = new messages[method.requestType]();
			Object.keys(requestType.fields).forEach(fieldName => {
				req["set" + capitalizeOnlyFirstLetter(fieldName)](props[fieldName]);
			});
	
			client[methodName](req, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(DomainContextEntity({
						message: res,
						client
					}));
				}
			});
		});
	}
}