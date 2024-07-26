import { ActionFormData } from '@minecraft/server-ui';
import EnchantmentTypes from './enchantment_types';

function generateHash() {
	return Array.apply(0, Array(100)).map(function () {
		return (function (charset) {
			return charset.charAt(Math.floor(Math.random() * charset.length))
		}('-=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=-'));
	}).join('');
}

export default class Enchant {

	#form = null;

	static #hash = generateHash();

	constructor(password) {
		if (password != Enchant.#hash)
			throw Error('SwalFlash is a static class and cannot be instantiated');

		Enchant.#hash = generateHash();
	}

	////////////////////
	// PUBLIC METHODS //
	////////////////////

	/**
	 * Shows a form which allows the player to select the tool type they wish to enchant.
	 * 
	 * This is the first and only method that should be called to start the enchanting
	 * process, allowing a streamlined way to call the other methods.
	 * 
	 * @param {Player} player The player who will receive the form
	 */
	static toolSelect(player) {
		// Initialize the first form.
		let form = new ActionFormData();

		// Set the contents of the form.
		form.title("§d§lAdvanced Enchantment Table");

		// Dynamically add buttons based on the existing categories.
		EnchantmentTypes.getCategories().forEach((category) => {
			// Adds the buttons
			let label = EnchantmentTypes.getColorCodes(category);
			label += category.charAt(0).toUpperCase() + category.slice(1);
			form.button(
				label,
				EnchantmentTypes.getIcon(category)
			);
		});

		// Show the form to the player.
		form.show(player)
			.then((response) => {
				// Remove the interact tag from the player.
				player.removeTag('interact');

				// Get the selected item from the player's inventory and initialize the enchantment.
				const currentItem = Enchant.#getSelectedItem(player),
					enchant = new Enchant(Enchant.#hash);

				// Check if the item is not empty and the player did not cancel the form,
				// then proceed to the next form.
				if (currentItem && !response.canceled) {
					// Get the item type ID and the selected button.
					const typeId = currentItem.typeId,
						selected = response.selection;

					if (Enchant.#verifyItemMatch(typeId, 'tools') && selected == 0)
						enchant.itemSelect(selected, player);
					else if (Enchant.#verifyItemMatch(typeId, 'armors') && selected == 1)
						enchant.itemSelect(selected, player);
					else if (Enchant.#verifyItemMatch(typeId, 'shield') && selected == 2)
						enchant.itemSelect(selected, player);
					else if (Enchant.#verifyItemMatch(typeId, 'elytra') && selected == 3)
						enchant.itemSelect(selected, player);
					else
						player.runCommandAsync(
							`tellraw @s {"rawtext":[{"translate":"action.ocrp.cancel"}]}`
						);
				}
				// Otherwise, if the item is empty and the player did not cancel the form,
				// show a message.
				else if (!currentItem && response.selection >= 0) {
					player.runCommandAsync(
						`tellraw @s {"rawtext":[{"translate":"action.ocrp.cancel"}]}`
					);
				}
			});
	}

	/**
	 * The 2nd step of enchantment.
	 * 
	 * Shows a form which allows the player to select the enchantment they wish to
	 * apply to the item. The enchantment will be based on the item type.
	 * 
	 * @param {number} category The category type of the item.
	 * @param {Player} player The player who will receive the form.
	 */
	itemSelect(category, player) {
		// Switch the category ID to the actual worded type (i.e. 0 => tools, 1 => armors, etc...).
		category = this.#getCorrespondingCategory(category);

		// Add the default form parts.
		this.#resetForm()
			.title("§d§lAdvanced Enchantment Table")
			.button("§l§cReturn", `textures/enchanted/system_enchantments/arrow_large`);

		// Get the items based on the type.
		let items = EnchantmentTypes.getCategoryItems(category);
		items.forEach(typeItem => {
			// Add the buttons based on the items.
			let label = EnchantmentTypes.getColorCodes(category, typeItem);
			label += typeItem.charAt(0).toUpperCase() + typeItem.slice(1);
			this.#form.button(
				label,
				EnchantmentTypes.getIcon(category, typeItem)
			);
		});

		// Show the form to the player.
		this.#form
			.show(player)
			.then((response) => {
				// Remove the interact tag from the player.
				player.removeTag('interact');

				// Get the selected button.
				const selected = response.selection,
					currentItem = Enchant.#getSelectedItem(player);

				// Otherwise, check if the item is still matches the category and type.
				if (!Enchant.#verifyItemMatch(currentItem.typeId, category)) {
					player.runCommandAsync(
						`tellraw @s {"rawtext":[{"translate":"action.ocrp.cancel"}]}`
					);
					return false;
				}

				// Check if the item is not empty and the player did not cancel the form,
				// then proceed to the next form.
				if (currentItem && !response.canceled) {
					// If the selected button is 0, return to the previous form.
					if (selected == 0)
						Enchant.toolSelect(player);
					// Otherwise, proceed to the next form. Make sure to subtract 1 from
					// the selected to match the array index.
					else if (selected > 0)
						this.enchantSelect(category, (selected - 1), player);
				}
			});
	}

	/**
	 * The 3rd step of enchantment.
	 * 
	 * Shows a form which allows the player to select the enchantment they wish to
	 * apply to the item. The enchantment will be based on the item type.
	 * 
	 * @param {string|number} category The category type of the item.
	 * @param {number} type The type of the item.
	 * @param {Player} player The player who will receive the form.
	 */
	enchantSelect(category, type, player) {
		// Switch the category ID to the actual worded type (i.e. 0 => tools, 1 => armors, etc...).
		if (category instanceof Number)
			category = this.#getCorrespondingCategory(category);

		// Switch the type ID to the actual worded type (i.e. 0 => sword, 1 => katana, etc...).
		type = this.#getCorrespondingType(category, type);

		// Set the title prefix based on the category. Use the color code as the base...
		let prefix = EnchantmentTypes.getColorCodes(category, type);
		// ...then capitalize the first letter of the type.
		prefix += type.charAt(0).toUpperCase() + type.slice(1);

		// Add the default form parts.
		this.#resetForm()
			.title(`${prefix} Enchantment`)
			.button("§l§cReturn", `textures/enchanted/system_enchantments/arrow_large`);

		// Get the enchantments based on the type.
		let enchantments = EnchantmentTypes.getEnchantments(category, type);
		enchantments.forEach(enchantment => {
			const ENCHANTMENT = EnchantmentTypes.getEnchantments(category, type, true)[enchantment];

			// Add the buttons based on the enchantments.
			let label = `§l${ENCHANTMENT.colorCode}`;
			label += `${ENCHANTMENT.name}\n`;
			label += `§r${ENCHANTMENT.description}`;
			this.#form.button(
				label,
				EnchantmentTypes.getIcon(category, type, enchantment)
			);
		});

		// Show the form to the player.
		this.#form
			.show(player)
			.then((response) => {
				if (!response.canceled) {
					// Get the selected button.
					const selected = response.selection,
						currentItem = Enchant.#getSelectedItem(player);

					// If the selected button is 0, return to the previous form.
					if (selected == 0) {
						this.itemSelect(
							this.#getCategoryID(category),
							player
						);
					}

					// Otherwise, check if the item is still matches the category and type.
					if (!Enchant.#verifyItemMatch(currentItem.typeId, category, type)) {
						player.runCommandAsync(
							`tellraw @s {"rawtext":[{"translate":"action.ocrp.cancel"}]}`
						);
						return false;
					}

					// Otherwise, proceed to the enchantment. Make sure to subtract 1 from
					// the selected to match the array index.
					if (selected > 0) {
						this.applyEnchantment(
							category,
							type,
							Object.keys(enchantments)[selected - 1],
							player
						);
					}
				}
			});
	}

	/**
	 * The 4th and final step of enchantment.
	 * 
	 * Applies the enchantment to the item after selecting what enchantment and level
	 * to apply. The enchantment will be based on the item type.
	 * 
	 * @param {string|number} category The category type of the item.
	 * @param {string|number} type The type of the item.
	 * @param {number} enchantment The enchantment to apply.
	 * @param {Player} player The player who will receive the form.
	 */
	applyEnchantment(category, type, enchantment, player) {
		// Switch the category ID to the actual worded type (i.e. 0 => tools, 1 => armors, etc...).
		if (category instanceof Number)
			category = this.#getCorrespondingCategory(category);

		// Switch the type ID to the actual worded type (i.e. 0 => sword, 1 => katana, etc...).
		if (type instanceof Number)
			type = this.#getCorrespondingType(category, type);

		// Switch the enchantment ID to the actual Enchantment class object.
		enchantment = this.#getCorrespondingEnchantment(category, type, enchantment);
		enchantment = EnchantmentTypes.getEnchantments(category, type, true)[enchantment];

		// Set the title prefix based on the category. Use the color code as the base...
		let prefix = enchantment.colorCode
		// ...then capitalize the first letter of the type.
		prefix += enchantment.name.charAt(0).toUpperCase() + enchantment.name.slice(1);

		// Add the default form parts.
		this.#resetForm()
			.title(`${prefix} Enchantment`)
			.button("§l§cReturn", `textures/enchanted/system_enchantments/arrow_large`);

		let levels = enchantment.levels;
		const lvlColors = ['§2', '§3', '§5'];
		Object.keys(levels).forEach((level, index) => {
			// Clamps the index between 0 and the length of (lvlColors - 1) array.
			index = Math.max(0, Math.min(index, lvlColors.length - 1));

			// Add the buttons based on the levels.
			let label = `§l${lvlColors[index]}Enchant ${level}\n${levels[level]} Levels`;
			this.#form.button(label, `textures/enchanted/system_enchantments/book`);
		});

		// Show the form to the player.
		this.#form
			.show(player)
			.then((response) => {
				if (!response.canceled) {
					// Get the current item and the selected button. Also get the selected
					// level based on the levels dictionary, along with the item lore.
					const selected = response.selection,
						currentItem = Enchant.#getSelectedItem(player),
						selectedLvl = Object.keys(levels)[selected - 1],
						itemLore = currentItem.getLore()[0] || '';

					// If the selected button is 0, return to the previous form.
					if (selected == 0) {
						this.enchantSelect(
							category,
							this.#getTypeID(type),
							player,
							currentItem
						);
					}

					// Otherwise, check if the item is still matches the category and type.
					if (!Enchant.#verifyItemMatch(currentItem.typeId, category, type)) {
						player.runCommandAsync(
							`tellraw @s {"rawtext":[{"translate":"action.ocrp.cancel"}]}`
						);
						return false;
					}

					// Check the player level if it is sufficient to enchant the item.
					// End the process if the player level is not enough.
					const playerLevel = player.level
					if (playerLevel < levels[selectedLvl]) {
						player.runCommandAsync(
							`tellraw @s {"rawtext":[{"translate":"action.ocrp.no_xp"}]}`
						);
						return false;
					}

					// Check if the enchantment is already applied to the item. End the
					// process if the enchantment is already applied.
					if (itemLore.includes(enchantment)) {
						player.runCommandAsync(
							`tellraw @s {"rawtext":[{"translate":"action.ocrp.repit"}]}`
						);
						return false;
					}

					try {
						// Apply the enchantment to the item.
						currentItem.setLore([`${itemLore}\n${enchantment} ${selectedLvl}`]);

						// Replace the item held.
						player.getComponent('inventory')
							.container
							.setItem(player.selectedSlot, currentItem);

						// Deduct the player level based on the enchantment level.
						player.runCommandAsync(`xp -${levels[selectedLvl]}L @s`);
						player.runCommandAsync(`playsound random.levelup @s`);
					} catch (e) {
						console.warn(e);

						// Check if the error is due to the maximum line length of the lore.
						let msg = e instanceof Error ? e.message : undefined;
						if (msg != undefined &&
							msg.includes('Provided line length') &&
							msg.includes('is greater than the maximum') &&
							msg.includes('at lore index')
						) {
							player.runCommandAsync(
								`tellraw @s {"rawtext":[{"translate":"action.ocrp.max_enchant"}]}`
							);
						}
					}
				}
			});
	};

	/////////////////////
	// PRIVATE METHODS //
	/////////////////////

	/**
	 * Gets the selected item from the player's inventory.
	 * 
	 * @param {Player} player The player which will be used to get the selected item.
	 * 
	 * @returns {ItemStack|undefined} The selected item or `undefined` if the player has no item selected.
	 */
	static #getSelectedItem(player) {
		return player.getComponent("inventory")
			.container
			.getItem(player.selectedSlot);
	}

	/**
	 * Checks the item ID if it will match one of the given types provided in the `types`
	 * array parameter.
	 * 
	 * @param {string} category The category of the item.
	 * @param {string} itemType The item type to match.
	 * @param {string} itemId The item ID to match.
	 * 
	 * @return {boolean} `true` if the item ID matches one of the types, otherwise `false`.
	 */
	static #itemIdMatch(category, itemType, itemId) {
		let filter = EnchantmentTypes.getFilters(category, itemType);

		return filter.some(type => itemId.includes(type));
	}

	/**
	 * Verifies if the item matches the given category and type.
	 * 
	 * @param {string} itemId The item ID to match. ***(Required)***
	 * @param {string} category The category of the item. ***(Required)***
	 * @param {string|undefined} type The type of the item. ***(Optional)***
	 * 
	 * @returns {boolean} `true` if the item matches the category and type (if type is given), otherwise `false`.
	 */
	static #verifyItemMatch(itemId, category, type = undefined) {
		let categoryMatch = false,
			typeMatch = false;

		// Check if the item matches the category.
		let categoryItems = EnchantmentTypes.getCategoryItems(category, true);
		for (const itemType in categoryItems) {
			if (EnchantmentTypes.getFilters(category, itemType).some(
				filter => itemId.includes(filter)
			)) {
				categoryMatch = true;
				break;
			}
		}

		// Check if the item matches the type, only if the type is given.
		if (type != undefined) {
			typeMatch = Enchant.#itemIdMatch(category, type, itemId);
		}

		return type == undefined ? categoryMatch : (categoryMatch && typeMatch);
	}

	/**
	 * Resets the form data.
	 * 
	 * @returns {ActionFormData} The form data.
	 */
	#resetForm() {
		return this.#form = new ActionFormData();
	}

	/**
	 * Gets the corresponding category of the item based on the given category ID.
	 * 
	 * The current category IDs are as follows:
	 * - 0: tools
	 * - 1: armors
	 * - 2: shield
	 * - 3: elytra
	 * 
	 * @param {number} category The category ID of the item.
	 * 
	 * @returns {string} The corresponding type of the item.
	 */
	#getCorrespondingCategory(category) {
		return EnchantmentTypes.getCategories()[category];
	}

	/**
	 * Gets the category ID of the item based on the given category.
	 * 
	 * The category could be fetched using the `{@link #getCorrespondingCategory}` method.
	 * 
	 * The current category IDs are as follows:
	 * - tools: 0
	 * - armors: 1
	 * - shield: 2
	 * - elytra: 3
	 * 
	 * @param {string} category The string representation of the category.
	 * 
	 * @returns {number} The category ID of the item.
	 */
	#getCategoryID(category) {
		return EnchantmentTypes.getCategories().indexOf(category);
	}

	/**
	 * Gets the corresponding type of the item based on the given category and type ID.
	 * 
	 * The category could be fetched using the `{@link #getCorrespondingCategory}` method.
	 * 
	 * The current type IDs are as follows:
	 * - tools:
	 * 	- 0: sword
	 * 	- 1: axe
	 * 	- 2: pickaxe
	 * 	- 3: hoe
	 * 	- 4: shovel
	 * - armors:
	 * 	- 0: helmet
	 * 	- 1: chestplate
	 * 	- 2: leggings
	 * 	- 3: boots
	 * - shield:
	 * 	- 0: shield
	 * - elytra:
	 * 	- 0: elytra
	 * 
	 * 
	 * @param {string} category The category of the item.
	 * @param {number} type The type ID of the item.
	 * 
	 * @returns {string} The corresponding type of the item.
	 * ---
	 * @see #getCorrespondingCategory
	 */
	#getCorrespondingType(category, type) {
		return EnchantmentTypes.getCategoryItems(category)[type];
	}

	/**
	 * Gets the corresponding type of the item based on the given category and type ID.
	 * 
	 * The category and type could be fetched using the `{@link #getCorrespondingCategory}`
	 * and `{@link #getCorrespondingType}` methods respectively.
	 * 
	 * The current type IDs are as follows:
	 * - tools:
	 * 	- sword: 0
	 * 	- axe: 1
	 * 	- pickaxe: 2
	 * 	- hoe: 3
	 * 	- shovel: 4
	 * - armors:
	 * 	- helmet: 0
	 * 	- chestplate: 1
	 * 	- leggings: 2
	 * 	- boots: 3
	 * - shield:
	 * 	- shield: 0
	 * - elytra:
	 * 	- elytra: 0
	 * 
	 * 
	 * @param {string} category The category of the item.
	 * @param {string} type The type ID of the item.
	 * 
	 * @returns {string} The corresponding type of the item.
	 * ---
	 * @see #getCorrespondingCategory
	 */
	#getTypeID(category, type) {
		return EnchantmentTypes.getCategoryItems(category).indexOf(type);
	}

	/**
	 * Gets the corresponding enchantment name of the item based on the given category, type,
	 * and enchantment ID.
	 * 
	 * The category and type could be fetched using the `{@link #getCorrespondingCategory}`
	 * and `{@link #getCorrespondingType}` methods respectively.
	 * 
	 * For the list of enchantments, refer to the `enchantment_types.js` file.
	 * 
	 * @param {string} category The category of the item.
	 * @param {string} type The type of the item.
	 * @param {number} enchantment The enchantment ID of the enchantment.
	 *
	 * @returns {string} The corresponding enchantment name of the item.
	 */
	#getCorrespondingEnchantment(category, type, enchantment) {
		return EnchantmentTypes.getEnchantments(category, type)[enchantment];
	}

	/**
	 * Gets the enchantment ID of the item based on the given category, type, and enchantment.
	 * 
	 * The category and type could be fetched using the `{@link #getCorrespondingCategory}`
	 * and `{@link #getCorrespondingType}` methods respectively.
	 * 
	 * For the list of enchantments, refer to the `enchantment_types.js` file.
	 * 
	 * @param {string} category The category of the item.
	 * @param {string} type The type of the item.
	 * @param {string} enchantment The enchantment name of the enchantment.
	 *
	 * @returns {number} The enchantment ID of the item.
	 */
	#getEnchantmentID(category, type, enchantment) {
		return EnchantmentTypes.getEnchantments(category, type).indexOf(enchantment);
	}
}