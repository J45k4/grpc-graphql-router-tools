
export default class Entity {
	constructor(options) {
		this.name = options.name;
		this.fields = options.fields();
	}

	get schema() {
		Object.keys(this.fields).forEach(fieldName => {
			const field = this.fields[fieldName];
			console.log("field", field);
		});
	}
}