import DomainService from "./DomainService";

describe("Tests DomainService throws", () => {
	it("Should throw when options is null", () => {
		expect(() => {
			new DomainService()
		}).toThrow("DomainService constructor options needs to be an object not null");
	});
	it("Should throw when options name is null", () => {
		expect(() => {
			new DomainService({

			});
		}).toThrow("DomainService constructor options needs to have name property");
	});
	it("Should throw when options services is null", () => {
		expect(() => {
			new DomainService({
				name: "test"
			});
		}).toThrow("test DomainService constructor options needs to have services property");
	});
	it("Should throw when options messages is null", () => {
		expect(() => {
			new DomainService({
				name: "test",
				services: {}
			})
		}).toThrow("test DomainService constructor options needs to have messages property");
	});
	it("Should throw when options methods is null", () => {
		expect(() => {
			new DomainService({
				name: "test",
				services: {},
				messages: {},
			})
		}).toThrow("DomainService constructor options needs to have methods property")
	})
});