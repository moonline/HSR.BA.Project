module core {
	export interface FactoryConfiguration {
		constructorArguments: { name: string; type: Function; subType: Function }[];
		publicProperties: { name: string; type: Function; subType: Function }[]
	}
}