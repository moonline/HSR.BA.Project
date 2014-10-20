module core {
	/**
	 * types:
	 * 	String,
	 * 	Number,
	 * 	Object (plain data object),
	 * 	Array -> subtype must be set with list element type
	 * 	ClassXY (Prototype)
	 */
	export interface FactoryConfiguration {
		constructorArguments: { name: string; type: Function; subType: Function }[];
		publicProperties: { name: string; type: Function; subType: Function }[]
	}
}