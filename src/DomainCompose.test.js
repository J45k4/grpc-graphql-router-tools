import DomainCompose from "./DomainCompose";

describe("DomainCompose abuse tests", () => {
	it("Should throw when DomainCompose options are null", () => {
		expect(() => {
			new DomainCompose()
		}).toThrow("DomainCompose constructor options needs to be an object");
	});

	it("Should throw when options domainsServices property is null", () => {
		expect(() => {
			new DomainCompose({})
		}).toThrow("DomainCompose constructor options needs to have property domainServices");
	});

	it("Should throw if domainServices option is not and function", () => {
		expect(() => {
			new DomainCompose({
				domainServices: {

				}
			})
		}).toThrow("DomainCompose constructor domainServices option domainServices needs to be function that return object with services");
	});
});