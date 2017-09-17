var protobuf = require("protobufjs");

class ProtoLoader {
	constructor(serviceFilePath) {
		this.root = protobuf.loadSync(serviceFilePath);
	}

	findType(typeName) {
		return this.root.lookupType(typeName);
	}

	findService(serviceName) {
		return this.root.lookupService(serviceName);
	}
}