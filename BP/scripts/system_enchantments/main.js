import { world, system, EntityEquippableComponent, EquipmentSlot, EntityComponentTypes } from "@minecraft/server";
import Enchant from "./enchant";
import EnchantmentList, { getLvl } from "./enchantments";
import EnchantmentTypes from "./enchantment_types";

/**
 * Verifies if the enchantment matches the item filter of the item irrespective of the
 * category.
 * 
 * @param {string} enchantment The enchantment to check. Must be in `PascalCase`. (e.g. `AreaAttack`)
 * @param {string} itemId The ID of the item. (e.g. `minecraft:diamond_sword`)
 * 
 * @returns {boolean} Whether the item falls under the item type allowed by the enchantment.
 */
function verifyFilterMatch(enchantment, itemId) {
	return EnchantmentList[enchantment].itemTypes.some((itemType) => {
		if (EnchantmentTypes.matchFilters(itemId, itemType))
			return true;
	});
}

export default {
	init: function () {
		world.afterEvents.itemUseOn.subscribe((useEvent) => {
			try {
				const player = useEvent.source,
					onBlock = useEvent.block,
					itemUsed = useEvent.itemStack ?? null,
					lore = itemUsed?.getLore()[0] ?? null;

				/**
				 * The enchantments on the item used. This defines what enchantments
				 * to check for on the item.
				 * 
				 * The structure of this object is as follows:
				 * - Enchantment name: [`runEffect` parameters]
				 * 
				 * The key is the name of the enchantment, and the value is an array
				 * with the parameters to pass to the `runEffect` method of the
				 * enchantment class.
				 * 
				 * @type {Object<String, Array>}
				 */
				const enchantments = {
					"Furrowing": [getLvl(itemUsed, "Furrowing"), player, onBlock]
				}

				if (lore) {
					Object.entries(enchantments).forEach(([enchantment, parameters]) => {
						// Check if the item matches the filter of the enchantment.
						let itemMatch = verifyFilterMatch(enchantment, itemUsed.typeId);

						// If the lore of the item includes the enchantment and the
						// item matches the filter, run the effect of the enchantment.
						if (lore.includes(enchantment) && itemMatch) {
							EnchantmentList[enchantment].runEffect(...parameters);
						}
					});
				}
			} catch (e) {
				console.error(`itemUseOn: ${e}`);
			}
		});

		system.runInterval(() => {
			let currentEnchantment = null;
			try {
				for (const player of world.getPlayers()) {
					// Advance Enchantment Table Interaction
					if (player.hasTag("interact")) {
						Enchant.toolSelect(player);
						player.removeTag("interact");
					}

					const playerEquipment = player.getComponent(EntityEquippableComponent.componentId);
					const itemSlots = {
						MainHand: player.getComponent(EntityComponentTypes.Inventory)?.container.getItem(player.selectedSlotIndex) ?? null,
						OffHand: playerEquipment?.getEquipment(EquipmentSlot.Offhand) ?? null,
						Head: playerEquipment?.getEquipment(EquipmentSlot.Head) ?? null,
						Chest: playerEquipment?.getEquipment(EquipmentSlot.Chest) ?? null,
						Legs: playerEquipment?.getEquipment(EquipmentSlot.Legs) ?? null,
						Feet: playerEquipment?.getEquipment(EquipmentSlot.Feet) ?? null,
					};

					/**
					 * The enchantments on the item in several inventory slots. This
					 * defines what enchantments to check for on each slot.
					 * 
					 * The outer object is the slot name, and the inner object is the
					 * enchantment name and the parameters to pass to the `runEffect`
					 * method of each enchantment.
					 * 
					 * Its structure is as follows:
					 * - Slot name:
					 * 	- Enchantment name: [`runEffect` parameters]
					 * 
					 * Here is an example:
					 * ```javascript
					 * const enchantments = {
					 * 	MainHand: {
					 * 		"Enchantment Name": [getLvl(mainHand, "Enchantment Name"), player]
					 * 	}
					 * };
					 * ```
					 * The `MainHand` key is the slot name, and the `Enchantment Name`
					 * key is the name of the enchantment. The value is an array with
					 * the parameters to pass to the `runEffect` method of the
					 * enchantment.
					 * 
					 * @type {Object<String, Object<String, Array>>}
					 */
					const enchantments = {
						MainHand: {
							"Haste": [getLvl(itemSlots.MainHand, "Haste"), player],
							"Knockback": [getLvl(itemSlots.MainHand, "Knockback"), player],
							"Shared Damage": [getLvl(itemSlots.MainHand, "Shared Damage"), player],
						},
						OffHand: {
							"Knockback": [getLvl(itemSlots.OffHand, "Knockback"), player],
							"Shared Damage": [getLvl(itemSlots.OffHand, "Shared Damage"), player],
						},
						Head: {
							"Night Eyes": [getLvl(itemSlots.Head, "Night Eyes"), player],
						},
						Chest: {
							"Health": [getLvl(itemSlots.Chest, "Health"), player],
							"Impulse": [getLvl(itemSlots.Chest, "Impulse"), player],
						},
						Legs: {
							"Anti-Magic": [getLvl(itemSlots.Legs, "Anti-Magic"), player],
							"Fire Immunity": [getLvl(itemSlots.Legs, "Fire Immune"), player],
							"Water Impulse": [getLvl(itemSlots.Legs, "Water Impulse"), player],
						},
						Feet: {
							"Agility": [getLvl(itemSlots.Feet, "Agility"), player],
							"Jump": [getLvl(itemSlots.Feet, "Jump"), player],
						}
					};

					Object.keys(itemSlots).forEach((slot) => {
						const item = itemSlots[slot];

						// If the item is not present in the slot, skip it
						if (!item) return;

						/**
						 * The lore of the item in the current slot. This is used to
						 * determine the enchantments on the item.
						 * 
						 * @type {String}
						 */
						const lore = item?.getLore()[0] ?? null;

						// Iterate over the enchantments on the item slot.
						Object.entries(enchantments[slot]).forEach(([enchantment, parameters]) => {
							// Check if the item matches the filter of the enchantment.
							let itemMatch = verifyFilterMatch(enchantment.replaceAll(/[-\s]/g, ''), item.typeId);

							// If the lore of the item includes the enchantment and the
							// item matches the filter, run the effect of the enchantment.
							if (lore?.includes(enchantment) && itemMatch) {
								currentEnchantment = enchantment;
								EnchantmentList[enchantment].runEffect(...parameters);
							}
						});
					});
				}
			}
			catch (e) {
				console.error(`systemEnchantments@runInterval [${currentEnchantment}]: ${e}`);
			}
		});

		world.afterEvents.entityHurt.subscribe((damageEvent) => {
			try {
				/**
				 * The entity that is damaging the entity or attacking.
				 */
				const attackerEntity = damageEvent.damageSource.damagingEntity;
				/**
				 * The entity that is being hurt or receiving the damage.
				 */
				const damagedEntity = damageEvent.hurtEntity;

				const damagingEquipment = attackerEntity?.getComponent(EntityEquippableComponent.componentId);
				/**
				 * The list of items that the damaging entity has equipped.
				 */
				const attackerItemSlots = {
					MainHand: attackerEntity?.getComponent("inventory")?.container.getItem(attackerEntity.selectedSlotIndex) ?? null,
					OffHand: damagingEquipment?.getEquipment(EquipmentSlot.Offhand) ?? null,
					Head: damagingEquipment?.getEquipment(EquipmentSlot.Head) ?? null,
					Chest: damagingEquipment?.getEquipment(EquipmentSlot.Chest) ?? null,
					Legs: damagingEquipment?.getEquipment(EquipmentSlot.Legs) ?? null,
					Feet: damagingEquipment?.getEquipment(EquipmentSlot.Feet) ?? null,
				};

				const damagedEquipment = damagedEntity?.getComponent(EntityEquippableComponent.componentId);
				/**
				 * The list of items that the damaged entity has equipped.
				 */
				const damagedItemSlots = {
					MainHand: damagedEntity?.getComponent("inventory")?.container.getItem(damagedEntity.selectedSlotIndex) ?? null,
					OffHand: damagedEquipment?.getEquipment(EquipmentSlot.Offhand) ?? null,
					Head: damagedEquipment?.getEquipment(EquipmentSlot.Head) ?? null,
					Chest: damagedEquipment?.getEquipment(EquipmentSlot.Chest) ?? null,
					Legs: damagedEquipment?.getEquipment(EquipmentSlot.Legs) ?? null,
					Feet: damagedEquipment?.getEquipment(EquipmentSlot.Feet) ?? null,
				};

				/**
				 * The enchantments on the entities. This defines what enchantments
				 * to check for on the entities. The structure of this object is as
				 * follows:
				 * 
				 * - Entity Type:
				 * 	- Equipment Slot:
				 * 		- Enchantment name: [`runEffect` parameters]
				 * 
				 * Here is an example:
				 * ```javascript
				 * const enchantments = {
				 * 	Sender: {
				 * 		MainHand: {
				 * 			"Enchantment Name": [getLvl(damagingEntity, "Enchantment Name"), damagedEntity]
				 * 		}
				 * 	}
				 * };
				 * ```
				 * The `Sender` key is the entity type (the entity that is damaging), the
				 * `MainHand` key is the equipment slot, and the `Enchantment Name` key is
				 * the name of the enchantment. The value is an array with the parameters
				 * to pass to the `runEffect` method of the enchantment.
				 */
				const enchantments = {
					Sender: {
						MainHand: {
							"Area Attack": [getLvl(attackerItemSlots.MainHand, "Area Attack"), damagedEntity],
							"Ice Aspect": [getLvl(attackerItemSlots.MainHand, "Ice Aspect"), damagedEntity],
							"Levitating": [getLvl(attackerItemSlots.MainHand, "Levitating"), damagedEntity],
							"Poison": [getLvl(attackerItemSlots.MainHand, "Poison"), damagedEntity],
							"Vampire": [getLvl(attackerItemSlots.MainHand, "Vampire"), attackerEntity],
							"Weakness": [getLvl(attackerItemSlots.MainHand, "Weakness"), damagedEntity],
							"Wither": [getLvl(attackerItemSlots.MainHand, "Wither"), damagedEntity],
						}
					},
					Receiver: {
						Chest: {
							"Shared Damage": [getLvl(damagedItemSlots.Chest, "Shared Damage"), damagedEntity],
						}
					}
				};

				//////////////
				// ATTACKER //
				//////////////
				if (attackerEntity?.typeId === "minecraft:player") {
					// Iterate over the enchantments on the damaging entity.
					Object.entries(attackerItemSlots).forEach(([slot, itemUsed]) => {
						// If the item is not present in the slot, skip it
						if (!itemUsed) return;

						/**
						 * The lore of the item that the player is using to damage the entity.
						 */
						const lore = itemUsed?.getLore()[0] ?? null;

						if (lore && enchantments.Sender[slot]) {
							// Iterate over the enchantments on the item slot.
							Object.entries(enchantments.Sender[slot]).forEach(([enchantment, parameters]) => {
								// Check if the item matches the filter of the enchantment.
								let itemMatch = verifyFilterMatch(enchantment.replaceAll(/[-\s]/g, ''), itemUsed.typeId);

								// If the lore of the item includes the enchantment and the
								// item matches the filter, run the effect of the enchantment.
								if (lore.includes(enchantment) && itemMatch) {
									EnchantmentList[enchantment].runEffect(...parameters);
								}
							});
						}
					});
				}

				//////////////
				// RECEIVER //
				//////////////
				if (damagedEntity?.typeId === "minecraft:player") {
					// Iterate over the enchantments on the damaged entity.
					Object.entries(damagedItemSlots)?.forEach(([slot, itemUsed]) => {
						// If the item is not present in the slot, skip it
						if (!itemUsed) return;

						/**
						 * The lore of the item that the player is using to defend from the attack.
						 */
						const lore = itemUsed?.getLore()[0] ?? null;

						if (lore && enchantments.Receiver[slot]) {
							// Iterate over the enchantments on the item slot.
							Object.entries(enchantments.Receiver[slot]).forEach(([enchantment, parameters]) => {
								// Check if the item matches the filter of the enchantment.
								let itemMatch = verifyFilterMatch(enchantment.replaceAll(/[-\s]/g, ''), itemUsed.typeId);

								// If the lore of the item includes the enchantment and the
								// item matches the filter, run the effect of the enchantment.
								if (lore.includes(enchantment) && itemMatch) {
									EnchantmentList[enchantment].runEffect(...parameters);
								}
							});
						}
					});
				}
			}
			catch (e) {
				console.error(`entityHurt: ${e}`);
			}
		});

		world.afterEvents.entityHitBlock.subscribe((hitBlockEvent) => {
			try {
				const hitBlock = hitBlockEvent.hitBlock,
					instigator = hitBlockEvent.damagingEntity,
					itemUsed = instigator.getComponent("inventory")?.container.getItem(instigator.selectedSlotIndex) ?? null,
					lore = itemUsed?.getLore()[0] ?? null;

				/**
				 * The enchantments on the item used. This defines what enchantments
				 * to check for on the item.
				 * 
				 * The structure of this object is as follows:
				 * - Enchantment name: [`runEffect` parameters]
				 * 
				 * The key is the name of the enchantment, and the value is an array
				 * with the parameters to pass to the `runEffect` method of the
				 * enchantment class.
				 */
				const enchantments = {
					"Smelting": [getLvl(itemUsed, "Smelting"), true, instigator, hitBlock],
				};

				if (lore) {
					Object.entries(enchantments).forEach(([enchantment, parameters]) => {
						// Check if the item matches the filter of the enchantment.
						let itemMatch = verifyFilterMatch(enchantment.replaceAll(/[-\s]/g, ''), itemUsed.typeId);

						// If the lore of the item includes the enchantment and the
						// item matches the filter, run the effect of the enchantment.
						if (lore.includes(enchantment) && itemMatch) {
							EnchantmentList[enchantment].runEffect(...parameters);
						}
					});
				}
			} catch (e) {
				console.error(`systemEnchantments@entityHitBlock: ${e}`);
			}
		});

		world.afterEvents.playerBreakBlock.subscribe((breakEvent) => {
			try {
				const hitBlock = breakEvent.block,
					instigator = breakEvent.player,
					itemUsed = instigator.getComponent("inventory")?.container.getItem(instigator.selectedSlotIndex) ?? null,
					lore = itemUsed?.getLore()[0] ?? null;

				const enchantments = {
					"Magnetic": [getLvl(itemUsed, "Magnetic"), instigator, hitBlock],
					"Smelting": [getLvl(itemUsed, "Smelting"), false, instigator, hitBlock],
					"Strip": [getLvl(itemUsed, "Strip"), instigator, hitBlock],
					"Wood Cutter": [getLvl(itemUsed, "Wood Cutter"), instigator, hitBlock],
					"XP Collector": [getLvl(itemUsed, "XP Collector"), instigator],
				};

				if (lore) {
					Object.entries(enchantments).forEach(([enchantment, parameters]) => {
						// Check if the item matches the filter of the enchantment.
						let itemMatch = verifyFilterMatch(enchantment.replaceAll(/[-\s]/g, ''), itemUsed.typeId);

						// If the lore of the item includes the enchantment and the
						// item matches the filter, run the effect of the enchantment.
						if (lore.includes(enchantment) && itemMatch) {
							EnchantmentList[enchantment].runEffect(...parameters);
						}
					});
				}
			}
			catch (e) {
				console.error(`systemEnchantments@playerBreakBlock: ${e}`);
			}
		});
	}
}