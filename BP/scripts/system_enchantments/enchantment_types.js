import EnchantmentList from './enchantments.js';

/**
 * The class that contains all the enchantment types and their respective
 * enchantments, icons, and color codes.
 * 
 * This class is used to get the enchantments of an item types based on the
 * category that the item falls under. The class is also used to get the
 * color codes and icons of the item types and enchantments.
 * 
 * Each item type has a set of enchantments that can be applied to it and each
 * enchantment has a set of levels that can be applied to the item. The levels
 * are used to determine the XP (in level) cost of the enchantment.
 * 
 * The breakdown of each entry is as follows:
 * ```javascript
 * {
 * 	itemCategory: {
 * 		itemType: {
 * 			icon: `path/to/icon`,
 * 			filters: [`filter1`, `filter2`, ...],
 * 			colorCodes: `§l§6`
 * 		}
 * 	}
 * }
 * ```
 * 
 * - `itemCategory`: The category of the item.
 * 	- `itemType`: The type of the item.
 * 		- `icon`: The path to the icon of the item type.
 * 		- `filters`: The filters used to determine if an item falls under this type.
 * 		- `colorCodes`: The Minecraft color code of the item type.
 *
 * All the enchantments are now a standalone singleton class from the `EnchantmentList` class.
 * 
 * @static
 * @version 1.0.0
 */
export default class EnchantmentTypes {
	constructor() {
		throw new Error(`The class "EnchantmentTypes" cannot be instantiated.`);
	}

	/**
	 * The list of categories and their respective items and attributes.
	 */
	static #CATEGORIES = {
		tools: {
			icon: `textures/enchanted/system_enchantments/tools`,
			colorCodes: `§6§l`,
			types: {
				sword: {
					icon: `textures/items/diamond_sword`,
					filters: [`sword`, `katana`],
					colorCodes: `§6§l`,
				},
				axe: {
					icon: `textures/items/diamond_axe`,
					filters: [`axe`, `battleaxe`, `tomahawk`],
					colorCodes: `§c§l`,
				},
				pickaxe: {
					icon: `textures/items/diamond_pickaxe`,
					filters: [`pickaxe`, `pick`, `mattock`],
					colorCodes: `§d§l`,
				},
				hoe: {
					icon: `textures/items/diamond_hoe`,
					filters: [`hoe`],
					colorCodes: `§8§l`,
				},
				shovel: {
					icon: `textures/items/diamond_shovel`,
					filters: [`shovel`],
					colorCodes: `§e§l`,
				},
			}
		},
		armors: {
			icon: `textures/enchanted/system_enchantments/armors`,
			colorCodes: `§c§l`,
			types: {
				helmet: {
					icon: `textures/items/netherite_helmet`,
					filters: [`helmet`, `helm`, `brigadine`],
					colorCodes: `§5§l`,
				},
				chestplate: {
					icon: `textures/items/netherite_chestplate`,
					filters: [`chestplate`, `armour`],
					colorCodes: `§5§l`,
				},
				leggings: {
					icon: `textures/items/netherite_leggings`,
					filters: [`leggings`, `pants`, `trousers`],
					colorCodes: `§5§l`,
				},
				boots: {
					icon: `textures/items/netherite_boots`,
					filters: [`boots`, `shoes`],
					colorCodes: `§5§l`,
				},
			}
		},
		shield: {
			icon: `textures/enchanted/system_enchantments/shield`,
			colorCodes: `§d§l`,
			types: {
				shield: {
					icon: `textures/enchanted/system_enchantments/shield`,
					filters: [`shield`],
					colorCodes: `§5§l`,
				},
			}
		},
		elytra: {
			icon: `textures/items/elytra`,
			colorCodes: `§5§l`,
			types: {
				elytra: {
					icon: `textures/items/elytra`,
					filters: [`elytra`],
					colorCodes: `§5§l`,
				},
			}
		},
	};

	/**
	 * Returns the list of categories allowed to be enchanted.
	 * 
	 * @param {boolean} asObject Whether to return the categories as an object. Defaults as `false`. ***(Optional)***
	 * 
	 * @returns {string[]|object} The list of item categories.
	 */
	static getCategories(asObject = false) {
		const CATEGORIES = EnchantmentTypes.#CATEGORIES;

		return asObject ? CATEGORIES : Object.keys(CATEGORIES);
	}

	/**
	 * Returns the items of a specific item category.
	 * 
	 * @param {string} category The category type. ***(Required)***
	 * @param {boolean} asObject Whether to return the items as an object. Defaults as `false`. ***(Optional)***
	 * 
	 * @returns {string[]|object} The list of items in the category. Returns an empty array if the category is not found. If `asObject` is `true`, the method will return the items as an object. Likewise, if the category is not found, the method will return an empty object.
	 */
	static getCategoryItems(category, asObject = false) {
		const TYPES = EnchantmentTypes.#CATEGORIES[category]?.types ?? {};

		return asObject ? TYPES : Object.keys(TYPES);
	}

	/**
	 * Returns the enchantments of the item in the given category.
	 * 
	 * @param {string} category The category of the item. ***(Required)***
	 * @param {string} itemType The item in the category. ***(Required)***
	 * @param {boolean} asObject Whether to return the enchantments as an object. Defaults as `false`.  ***(Optional)***
	 * 
	 * @returns {object|string[]} The list of enchantments for the item. Returns an empty array if the item is not found. If `asObject` is `true`, the method will return the enchantments as an object. Likewise, if the item is not found, the method will return an empty object.
	 */
	static getEnchantments(category, itemType, asObject = false) {
		const hasType = Object.keys(EnchantmentTypes.#CATEGORIES[category]?.types)
			.includes(itemType);

		let ENCHANTMENTS = {};

		if (hasType) {
			Object.keys(EnchantmentList)
				.forEach((enchantment) => {
					if (EnchantmentList[enchantment].itemTypes.includes(itemType)) {
						ENCHANTMENTS[enchantment] = EnchantmentList[enchantment];
					}
				});
		}

		return asObject ? ENCHANTMENTS : Object.keys(ENCHANTMENTS);
	}

	/**
	 * Returns the given Minecraft color code of the item, which uses
	 * the paragraph symbol (§) to color and even format the text.
	 * 
	 * If the item is not provided, the method will return the color code of the category.
	 * Likewise, if the enchantment is not provided, the method will return the color code
	 * of the item.
	 * 
	 * @param {string} category The category of the item. ***(Required)***
	 * @param {string} itemType The item in the category. **(Optional)**
	 * @param {string} enchantment The enchantment of the item. **(Optional)**
	 * @param {boolean} forLore Whether to get the color code for the lore. Defaults as `false`. **(Optional)**
	 * 
	 * @returns {string|undefined} The Minecraft color code of the item. `undefined` if the item is not found. If `forLore` is `true`, the method will return the color code for the lore.
	 */
	static getColorCodes(category, itemType = undefined, enchantment = undefined, forLore = false) {
		if (enchantment != undefined && itemType != undefined) {
			const COLOR = EnchantmentTypes.getEnchantments(category, itemType, true)[enchantment]?.colorCodes;
			return (forLore ? COLOR : `§l{COLOR}`) ?? undefined;
		}
		else if (itemType != undefined) {
			return EnchantmentTypes.#CATEGORIES[category]?.types[itemType]?.colorCodes ?? undefined;
		}
		else {
			return EnchantmentTypes.#CATEGORIES[category]?.colorCodes ?? undefined;
		}
	}

	/**
	 * Returns the icon path of the item or a category, which will be used to display
	 * in the form.
	 * 
	 * If the item is not provided, the method will return the icon of the category.
	 * Likewise, if the enchantment is not provided, the method will return the icon
	 * of the item.
	 * 
	 * @param {string} category The category of the item. ***(Required)***
	 * @param {string} itemType The item in the category. **(Optional)**
	 * @param {string} enchantment The enchantment of the item. **(Optional)**
	 * 
	 * @returns {string|undefined} The icon of the item. `undefined` if the item is not found.
	 */
	static getIcon(category, itemType = undefined, enchantment = undefined) {
		if (enchantment != undefined && itemType != undefined) {
			return EnchantmentTypes.getEnchantments(category, itemType, true)[enchantment]?.icon ?? undefined;
		}
		else if (itemType != undefined) {
			return EnchantmentTypes.#CATEGORIES[category]?.types[itemType]?.icon ?? undefined;
		}
		else {
			return EnchantmentTypes.#CATEGORIES[category]?.icon ?? undefined;
		}
	}

	/**
	 * Returns the list of keywords that identifies if an item is a part of that `category`
	 * and `itemType`.
	 * 
	 * @param {string} category The category of the item. ***(Required)***
	 * @param {string} itemType The item in the category. ***(Required)***
	 * 
	 * @returns {string[]|array} A list of keywords that could be used in filters. Empty array if the category or item type doesn't exist.
	 */
	static getFilters(category, itemType) {
		return EnchantmentTypes.getCategoryItems(category, true)[itemType]?.filters ?? [];
	}

	/**
	 * Verifies if the item falls under an item type irrespective of the category.
	 * 
	 * @param {string} itemId The ID of the item. (e.g. `minecraft:diamond_sword`)
	 * @param {string} itemType The type of the item. (e.g. `sword`)
	 * 
	 * @returns {boolean} Whether the item falls under the item type.
	 */
	static matchFilters(itemId, itemType) {
		let hasMatch = false;

		EnchantmentTypes.getCategories()
		.forEach((category) => {
			const filters = EnchantmentTypes.getFilters(category, itemType);

			if (filters.length > 0) {
				const matches = filters.some((filter) => itemId.includes(filter));

				if (matches) {
					hasMatch = true;
					return;
				}
			}
		});

		return hasMatch;
	}
}