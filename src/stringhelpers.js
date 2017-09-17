
export const capitalizeFirstLetter = (str) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const capitalizeOnlyFirstLetter = (str) => {
	return capitalizeFirstLetter(str.toLowerCase());
}