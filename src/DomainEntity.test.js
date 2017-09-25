import DomainEntity from "./DomainEntity";
import ListType from "./ListType";

describe("DomainEntity throw tests", () => {
	it("Should throw when options is null", () => {
		expect(() => {
			new DomainEntity()
		}).toThrow("DomainEntity options needs to be object");
	});
	it("Should throw when options name property is null", () => {
		expect(() => {
			new DomainEntity({

			})
		}).toThrow("DomainEntity options needs to have name property");
	})
	it("Should throw when options fields property is null", () => {
		expect(() => {
			new DomainEntity({
				name: "test"
			})
		}).toThrow("DomainEntity test needs to have fields option");
	});
	it("Should throw when options fields field type is null", () => {
		expect(() => {
			new DomainEntity({
				name: "test",
				fields: {
					name: {

					}
				}
			})
		}).toThrow("test DomainEntity field name type is null");
	});

	it("Should throw when options fields field ListType has null type", () => {
		expect(() => {
			new DomainEntity({
				name: "test",
				fields: {
					items: {
						type: new ListType()
					}
				}
			})
		}).toThrow("test DomainEntity field items type is ListType but its type is null");
	});
})

// describe("DomainEntity circular depency tests", () => {
// 	it("Should work with circular dependecies", () => {
// 	});
// });