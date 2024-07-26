import { ItemStack } from "@minecraft/server";

function generateHash() {
	return Array.apply(0, Array(100)).map(function () {
		return (function (charset) {
			return charset.charAt(Math.floor(Math.random() * charset.length))
		}('-=ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789=-'));
	}).join('');
}

/**
 * Defines a secret password that could only be accessed in this module.
 */
var HASH = generateHash();

/**
 * Base class for all enchantments. This class will only serve as an interface for the
 * enchantments, and will not be used to create instances of enchantments.
 * 
 * @version 1.0.0
 */
class BaseEnchantment {

	/**
	 * The list of levels in Roman numerals. The maximum number of levels is 10,
	 * which is represented by the Roman numeral "X".
	 */
	static LEVELS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

	/**
	 * Icon path for the enchantment.
	 */
	#icon;

	/**
	 * Name of the enchantment.
	 */
	#name;

	/**
	 * A brief description of the enchantment.
	 */
	#description;

	/**
	 * The levels at which the enchantment can be applied. The index of the
	 * array represents the level, and the value at that index represents the
	 * cost of the enchantment at that level.
	 * 
	 * The cost is the number of levels that will be consumed when the enchantment
	 * is applied. For example, if the cost is 10, then 10 levels will be consumed
	 * from the player's experience when the enchantment is applied.
	 * 
	 * Example:
	 * ```javascript
	 * levels = [10, 20, 30];
	 * ```
	 * This means that the enchantment can be applied at levels I, II, and III, and the
	 * cost of applying the enchantment at each level is 10, 20, and 30 levels, respectively.
	 */
	#levels;

	/**
	 * The types of items that the enchantment can be applied to. The list of item types
	 * can be found in the `EnchantmentTypes` class.
	 */
	#itemTypes;

	/**
	 * The Minecraft color code for the enchantment.
	 */
	#colorCode;

	/**
	 * Creates a new enchantment. This class is an abstract class and cannot be
	 * instantiated unless you know the secret password, which is only accessible via this
	 * module.
	 * 
	 * @param {string} password The secret password to create an instance of the class.
	 * @param {string} icon The icon path for the enchantment.
	 * @param {string} name The name of the enchantment. Case-sensitive.
	 * @param {string} description A brief description of the enchantment. Must be less than 30 characters.
	 * @param {string[]} itemTypes The types of items that the enchantment can be applied to. The list of item types can be found in the `EnchantmentTypes` class.
	 * @param {number[]} levels The levels at which the enchantment can be applied. Default is [20] for level I with a cost of 20 levels.
	 * @param {string} colorCode The Minecraft color code for the enchantment. Default is "§a".
	 * 
	 * @throws {Error} If the class is instantiated directly.
	 */
	constructor(
		password,
		icon,
		name,
		description,
		itemTypes,
		levels = [20],
		colorCode = "§a"
	) {
		if (password !== HASH) {
			throw new Error("BaseEnchantment is an abstract class and cannot be instantiated.");
		}

		HASH = generateHash();

		this.#icon = icon;
		this.#name = name;
		this.#description = description;
		this.#itemTypes = itemTypes;
		this.#levels = levels.slice(0, Math.min(levels.length, BaseEnchantment.LEVELS.length));
		this.#colorCode = colorCode;
	}

	///////////////////////
	// INTERFACE METHODS //
	///////////////////////

	/**
	 * Runs the effect of the enchantment. This method must be implemented by the subclass.
	 * 
	 * The `level` parameter should be a Roman numeral that's within the list of
	 * {@link BaseEnchantment.LEVELS LEVELS} for the enchantment.
	 * 
	 * All additional arguments are optional and can be used to pass additional data to the
	 * effect via the `...args` parameter.
	 * 
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param {...any} ...args Additional arguments for the effect.
	 * 
	 * @throws {Error} If the method is not implemented.
	 */
	runEffect(level, ...args) {
		throw new Error("Method 'runEffect()' must be implemented.");
	}

	/////////////
	// GETTERS //
	/////////////

	/**
	 * Gets a brief description of the enchantment.
	 * 
	 * @returns {string} A brief description of the enchantment.
	 */
	get icon() {
		return this.#icon;
	}

	/**
	 * Gets the icon path for the enchantment.
	 * 
	 * @returns {string} The icon path for the enchantment.
	 */
	get name() {
		return this.#name;
	}

	/**
	 * Gets the name of the enchantment.
	 * 
	 * @returns {string} The name of the enchantment.
	 */
	get description() {
		return this.#description;
	}

	/**
	 * Gets the list of item types that the enchantment can be applied to.
	 * 
	 * @returns {string[]} The list of item types that the enchantment can be applied to.
	 */
	get itemTypes() {
		return this.#itemTypes;
	}

	/**
	 * Gets the levels at which the enchantment can be applied along with
	 * the cost of applying the enchantment at each level.
	 * 
	 * @returns {Object} An object where the key is the level and the value is the cost.
	 */
	get levels() {
		let obj = {};

		BaseEnchantment.LEVELS.forEach((level, index) => {
			if (index >= this.#levels.length)
				return;

			obj[level] = this.#levels[index];
		});

		return obj;
	}

	/**
	 * Gets the Minecraft color code for the enchantment.
	 * 
	 * @returns {string} The Minecraft color code for the enchantment.
	 */
	get colorCode() {
		return `§l${this.#colorCode}`;
	}

	/**
	 * Gets the Minecraft lore color code for the enchantment.
	 * 
	 * @returns {string} The Minecraft lore color code for the enchantment.
	 */
	get loreColor() {
		return this.#colorCode;
	}

	toString() {
		return this.name;
	}
}

/**
 * Enchantment that deals damage over time. The damage dealt is based on the level of
 * the enchantment.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class PoisonEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (PoisonEnchantment.#instance) {
			return PoisonEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/poison`,
			"Poison",
			"Poisons the target over time.",
			["sword"],
			[10, 20, 30],
			"§2"
		);

		this.#setInstance();
	}

	#setInstance() {
		PoisonEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that was hurt.
	 */
	runEffect(level, ...args) {
		const hurtEntity = args[0];

		if (hurtEntity) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				hurtEntity.runCommandAsync(`effect @s poison 3 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that slows enemies on hit. The level of the enchantment determines the
 * strength of the slowness effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class IceAspectEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (IceAspectEnchantment.#instance) {
			return IceAspectEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/snowflake`,
			"Ice Aspect",
			"Slows enemies on hit.",
			["sword"],
			[10, 20, 30],
			"§3"
		);

		this.#setInstance();
	}

	#setInstance() {
		IceAspectEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that was hurt.
	 */
	runEffect(level, ...args) {
		const hurtEntity = args[0];

		if (hurtEntity) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				hurtEntity.runCommandAsync(`effect @s slowness 2 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that levitates enemies on hit. The level of the enchantment determines the
 * strength of the levitation effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class LevitatingEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (LevitatingEnchantment.#instance) {
			return LevitatingEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/levitacion`,
			"Levitating",
			"Sends enemies levitating.",
			["sword"],
			[10, 20, 30],
			"§7"
		);

		this.#setInstance();
	}

	#setInstance() {
		LevitatingEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that was hurt.
	 */
	runEffect(level, ...args) {
		const hurtEntity = args[0];

		if (hurtEntity) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				hurtEntity.runCommandAsync(`effect @s levitation 2 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that regenerates health on hit. The level of the enchantment determines the
 * strength of the regeneration effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class VampireEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (VampireEnchantment.#instance) {
			return VampireEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/vampire`,
			"Vampire",
			"Regenerates health on hit.",
			["sword"],
			[10, 20, 30],
			"§4"
		);

		this.#setInstance();
	}

	#setInstance() {
		VampireEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that attacked.
	 */
	runEffect(level, ...args) {
		const attacker = args[0];

		if (attacker) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				attacker.runCommandAsync(`effect @s regeneration 2 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that withers enemies on hit. The level of the enchantment determines the
 * strength of the wither effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class WitherEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (WitherEnchantment.#instance) {
			return WitherEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/wither`,
			"Wither",
			"Withers enemies on hit.",
			["sword"],
			[10, 20, 30],
			"§8"
		);

		this.#setInstance();
	}

	#setInstance() {
		WitherEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that was hurt.
	 */
	runEffect(level, ...args) {
		const hurtEntity = args[0];

		if (hurtEntity) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				hurtEntity.runCommandAsync(`effect @s wither 2 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that applies weakness to enemies on hit. The level of the enchantment
 * determines the strength of the weakness effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class WeaknessEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (WeaknessEnchantment.#instance) {
			return WeaknessEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/weakness`,
			"Weakness",
			"Applies weakness to enemies.",
			["sword"],
			[10, 20, 30],
			"§7"
		);

		this.#setInstance();
	}

	#setInstance() {
		WeaknessEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that was hurt.
	 */
	runEffect(level, ...args) {
		const hurtEntity = args[0];

		if (hurtEntity) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				hurtEntity.runCommandAsync(`effect @s weakness 2 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that deals damage to all enemies in the area of the original target. The
 * level of the enchantment determines the strength of the damage dealt.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class AreaAttackEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (AreaAttackEnchantment.#instance) {
			return AreaAttackEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/netherite_sword`,
			"Area Attack",
			"Deals area damage.",
			["sword"],
			[10, 20, 30],
			"§5"
		);

		this.#setInstance();
	}

	#setInstance() {
		AreaAttackEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that was hurt.
	 */
	runEffect(level, ...args) {
		const hurtEntity = args[0];

		if (hurtEntity) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				hurtEntity.runCommandAsync(`summon ocrp:area_attack${amp + 1}`);
			}
		}
	}
}

/**
 * Enchantment that breaks more wood blocks at once. The level of the enchantment determines
 * the number of blocks that are broken at once.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class WoodCutterEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (WoodCutterEnchantment.#instance) {
			return WoodCutterEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/diamond_axe`,
			"Wood Cutter",
			"Breaks more wood blocks.",
			["axe"],
			[10, 20, 30],
			"§b"
		);

		this.#setInstance();
	}

	#setInstance() {
		WoodCutterEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. Here are the arguments that should be passed: ***`player`***, ***`targetBlock`***.
	 */
	runEffect(level, ...args) {
		const player = args[0],
			targetBlock = args[1],
			targetBlockPos = {
				x: targetBlock.location.x,
				y: targetBlock.location.y,
				z: targetBlock.location.z
			};

		const axe = player.dimension.spawnEntity("ocrp:axe", targetBlockPos);

		if (axe) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				axe.runCommandAsync(`function system_enchantments/enchanted_axe/axe_${amp}`);
				axe.runCommandAsync(`function system_enchantments/enchanted_axe/axe2_${amp}`);
			}
		}
	}
}

/**
 * Enchantment that grants haste while holding the item. The level of the enchantment
 * determines the strength of the haste effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class HasteEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (HasteEnchantment.#instance) {
			return HasteEnchantment.#instance;
		}


		super(
			HASH,
			`textures/enchanted/system_enchantments/haste`,
			"Haste",
			"Grants haste while on hand.",
			["axe", "pickaxe", "shovel"],
			[10, 20, 30],
			"§3"
		);

		this.#setInstance();
	}

	#setInstance() {
		HasteEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the player wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`effect @s haste 1 ${amp} true`);
			}
		}
	}
}

/**
 * Enchantment that automatically gives you the items you mine. The level of the enchantment
 * determines the range at which the items are given to you.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class MagneticEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (MagneticEnchantment.#instance) {
			return MagneticEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/magnet`,
			"Magnetic",
			"Gives you the items you mine.",
			["axe", "pickaxe", "shovel"],
			[10, 20, 30],
			"§a"
		);

		this.#setInstance();
	}

	#setInstance() {
		MagneticEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. Here are the arguments that should be passed: ***`player`***, ***`targetBlock`***.
	 */
	runEffect(level, ...args) {
		const player = args[0],
			targetBlock = args[1],
			targetBlockPos = {
				x: targetBlock.location.x,
				y: targetBlock.location.y,
				z: targetBlock.location.z
			};

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`
					execute positioned ${targetBlockPos.x} ${targetBlockPos.y} ${targetBlockPos.z}
					run tp @e[type=item,r=${amp + 1}] @s
				`);
			}
		}
	}
}

/**
 * Enchantment that automatically smelts the items you break. The level of the enchantment
 * determines the items that are affected by the enchantment.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class SmeltingEnchantment extends BaseEnchantment {
	static #instance = null;

	/**
	 * The list of items that are affected by the Smelting enchantment. The list contains
	 * another list. The index of the outer list represents the enchantment level while the
	 * inner list contains the items that are affected by the enchantment.
	 * 
	 * Example:
	 * ```javascript
	 * #affected = [
	 * 	[
	 * 		{"minecraft:copper_ore": "minecraft:copper_ingot"},
	 * 		{"minecraft:sand": "minecraft:glass"},
	 * 	],
	 * 	[
	 * 		{"minecraft:iron_ore": "minecraft:iron_ingot"},
	 * 		{"minecraft:gravel": "minecraft:flint"},
	 * 	],
	 * 	[
	 * 		{"minecraft:gold_ore": "minecraft:gold_ingot"},
	 * 		{"minecraft:clay": "minecraft:brick"},
	 * 	],
	 * ];
	 * ```
	 * This means that at level I, the enchantment can smelt copper ore into copper ingots
	 * and sand into glass. At level II, the enchantment can smelt iron ore into iron ingots
	 * and gravel into flint. At level III, the enchantment can smelt gold ore into gold ingots
	 * and clay into bricks.
	 */
	#affected = [
		[
			{ "minecraft:copper_ore": "minecraft:copper_ingot" },
			{ "minecraft:sand": "minecraft:glass" },
		],
		[
			{ "minecraft:iron_ore": "minecraft:iron_ingot" },
			{ "minecraft:gravel": "minecraft:flint" },
		],
		[
			{ "minecraft:gold_ore": "minecraft:gold_ingot" },
			{ "minecraft:clay": "minecraft:brick" },
		],
	]

	constructor() {
		if (SmeltingEnchantment.#instance) {
			return SmeltingEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/diamond_pickaxe`,
			"Smelting",
			"Automatically smelts items.",
			["pickaxe", "shovel"],
			[10, 20, 30],
			"§6"
		);

		this.#setInstance();
	}

	#setInstance() {
		SmeltingEnchantment.#instance = this;
	}

	/**
	 * Runs the effect of the enchantment. The effect of the enchantment is divided into
	 * two phases: detection phase and effect phase. The detection phase is when the
	 * enchantment detects the block that was hit by the player. The effect phase is when
	 * the enchantment smelts the items that were broken by the player.
	 * 
	 * **NOTE:** The `detectionPhase` argument is a boolean that indicates whether the
	 * enchantment is in detection phase or effect phase. If the enchantment is in
	 * detection phase, the first argument should be `true`. Otherwise, it should be
	 * `false`.
	 * 
	 * **NOTE:** `player` is the player that broke the block, and `targetBlock` is the
	 * block that was hit by the player.
	 * 
	 * **NOTE:** Detection phase is triggered by the `entityHitBlock` event, and effect
	 * phase is triggered by the `playerBreakBlock` event.
	 * 
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. Here are the arguments that should be passed: ***`detectionPhase`***, ***`player`***, ***`targetBlock`***.
	 * 
	 * @see {@link BaseEnchantment#runEffect}
	 */
	runEffect(level, ...args) {
		// Check if the enchantment is in detection phase (entityHitBlock event).
		let detectionPhase = typeof args[0] == 'boolean' ? args[0] : false,
			player = args[1],
			targetBlock = args[2];

		// If the enchantment is in detection phase (entityHitBlock event)...
		if (detectionPhase) {
			// Fetch the block ID of the block that was hit.
			const blockId = targetBlock.typeId
				.substring(targetBlock.typeId.indexOf(":") + 1),
				amp = BaseEnchantment.LEVELS.indexOf(level);

			let removeTag = false;

			// Iterate through the affected items at each level.
			this.#affected.forEach((affectedList, ampLvl) => {
				// If the current level is less than or equal to the enchantment level,
				// continue the iteration.
				if (ampLvl <= amp) {
					// Check if the block that was hit is in the list of affected items.
					// If it is, add a tag to the player to indicate that the block was
					// affected and end the iteration.
					if (affectedList.includes(blockId)) {
						player.runCommandAsync(`tag @s add ${blockId}-${BaseEnchantment.LEVELS[ampLvl]}`);
						return;
					}
				}
				// Otherwise, remove all tag related to this enchantment from the player
				// by updating `removeTag` variable and end the iteration.
				else {
					removeTag = true;
					return;
				}
			});

			// If `removeTag` is true, remove all the tag related to this enchantment from
			// the player.
			if (removeTag) {
				this.#affected.forEach((affectedList, ampLvl) => {
					affectedList.forEach((affectedItem) => {
						const affectedId = Object.keys(affectedItem)[0];
						player.runCommandAsync(`tag @s remove ${affectedId}-${BaseEnchantment.LEVELS[ampLvl]}`);
					});
				});
			}
		}
		// If the enchantment is in effect phase (playerBreakBlock event)...
		else {
			// Create a Vector object to store the target block's position.
			const targetBlockPos = {
				x: targetBlock.location.x,
				y: targetBlock.location.y,
				z: targetBlock.location.z
			};

			// If the player is not null, continue the process.
			if (player) {
				// Iterate through the list of levels and affected items within each level.
				this.#affected.forEach((affectedList, ampLvl) => {
					affectedList.forEach((affectedItem) => {
						const affectedId = Object.keys(affectedItem)[0],
							romanLvl = BaseEnchantment.LEVELS[ampLvl];

						// If the player has the tag for the affected item at the current level...
						if (player.hasTag(`${affectedId}-${romanLvl}`)) {
							// Fetch the enchantment level in Roman numeral format and the maximum
							// number of levels for the enchantment.
							const amp = BaseEnchantment.LEVELS.indexOf(level),
								maxAmp = Object.keys(this.levels).length;

							// If the enchantment level is valid, continue the process.
							if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
								// Summon the marker entity at the target block's position.
								let marker = player.dimension
									.spawnEntity("ocrp:smelting_marker", targetBlockPos);

								// Fetch all the items that matches the target block's type.
								let items = marker.dimension
									.getEntities('minecraft:item')
									.filter((item) => {
										return item.getComponent(EntityComponentTypes.Item)
											.itemStack
											.typeId == targetBlock.typeId
									});

								// Spawn the smelting entity at the target block's position before
								// killing the affected item entities.
								items.forEach((item) => {
									item.dimension.spawnItem(
										new ItemStack(affectedId, 1),
										item.location
									);

									item.kill();
								});
							}
						}
					});
				});
			}
		}
	}
}

/**
 * Enchantment that adds additional guaranteed XP when mining any block. The level of the
 * enchantment determines the amount of XP that is added.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class XpCollectorEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (XpCollectorEnchantment.#instance) {
			return XpCollectorEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/xp_orb`,
			"XP Collector",
			"Increase XP earned.",
			["pickaxe"],
			[10, 20, 30],
			"§2"
		);

		this.#setInstance();
	}

	#setInstance() {
		XpCollectorEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the player that mined the block.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				for (let i = 0; i < (amp + 1); i++) {
					player.dimension
						.spawnEntity("minecraft:xp_orb", player.location);
				}
			}
		}
	}
}

/**
 * Enchantment that allows strip mining by destroying the block above the target block.
 * The level of the enchantment determines the height of the area covered by the enchantment.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class StripEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (StripEnchantment.#instance) {
			return StripEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/netherite_pickaxe`,
			"Strip",
			"Make strip mining easier.",
			["axe"],
			[10, 20, 30],
			"§6"
		);

		this.#setInstance();
	}

	#setInstance() {
		StripEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. Here are the arguments that should be passed: ***`player`***, ***`targetBlock`***.
	 */
	runEffect(level, ...args) {
		const player = args[0],
			targetBlock = args[1],
			targetBlockPos = {
				x: targetBlock.location.x,
				y: targetBlock.location.y,
				z: targetBlock.location.z
			};

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`
					setblock
					${targetBlockPos.x} ${targetBlockPos.y + (amp + 1)} ${targetBlockPos.z}
					air [] destroy`
				);
			}
		}
	}
}

/**
 * Enchantment that creates farmland(s) when using a hoe. The level of the enchantment
 * determines the range at which the farmland(s) are created. The enchantment can also
 * create farmland(s) on dirt blocks on higher levels.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class FurrowingEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (FurrowingEnchantment.#instance) {
			return FurrowingEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/diamond_hoe`,
			"Furrowing",
			"Create more farmlands.",
			["hoe"],
			[10, 20, 30],
			"§3"
		);

		this.#setInstance();
	}

	#setInstance() {
		FurrowingEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. Here are the arguments that should be passed: ***`player`***, ***`targetBlock`***.
	 */
	runEffect(level, ...args) {
		const player = args[0],
			targetBlock = args[1],
			targetBlockPos = {
				x: targetBlock.location.x,
				y: targetBlock.location.y,
				z: targetBlock.location.z
			};

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				let range = amp + 1,
					includedBlocks = ["minecraft:grass"];

				if (amp > 0) {
					includedBlocks.push("minecraft:dirt");
				}

				includedBlocks.forEach((included) => {
					player.runCommandAsync(`
						fill
						${targetBlockPos.x + range} ${targetBlockPos.y} ${targetBlockPos.z + range}
						${targetBlockPos.x - range} ${targetBlockPos.y} ${targetBlockPos.z - range}
						minecraft:farmland[]
						replace ${included}
					`);
				});
			}
		}
	}
}

/**
 * Enchantment that grants night vision while wearing the item. The level of the
 * enchantment determines the strength of the night vision effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class NightEyesEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (NightEyesEnchantment.#instance) {
			return NightEyesEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/night_eyes`,
			"Night Eyes",
			"Gives night vision when worn.",
			["helmet"],
			[10, 20, 30],
			"§5"
		);

		this.#setInstance();
	}

	#setInstance() {
		NightEyesEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the player wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`effect @s minecraft:night_vision 11 ${amp} true`);
			}
		}
	}
}

/**
 * Enchantment that shares damage with nearby entities. The level of the enchantment
 * determines the range at which the damage is shared.
 * 
 * The enchantment is activated when the player is sneaking and holding the item
 * with the enchantment. Once activated, the player will share the damage with
 * nearby entities.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class SharedDamageEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (SharedDamageEnchantment.#instance) {
			return SharedDamageEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/shared_damage`,
			"Shared Damage",
			"Shares damage to others.",
			["chestplate", "shield", "elytra"],
			[10, 20, 30],
			"§2"
		);

		this.#setInstance();
	}

	#setInstance() {
		SharedDamageEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				let level = amp == 0 ? '' : (amp + 1);

				if (player.isSneaking) {
					if (!player.hasTag(`ocrp:system_enchantments:shared_damage`)) {
						player.runCommandAsync(`summon ocrp:shared_damage${level} ^ ^ ^0.025`);
						player.addTag(`ocrp:system_enchantments:shared_damage`);
					}

					if (player.hasTag(`ocrp:system_enchantments:shared_damage`)) {
						for (let i = 0; i < maxAmp; i++) {
							let altLvl = i == 0 ? '' : (i + 1);
							player.runCommandAsync(`tp @e[type=ocrp:shared_damage${altLvl}] ^ ^ ^0.025`);
						}
						player.removeTag(`ocrp:system_enchantments:shared_damage`);
					}
				}
			}
		}
	}
}

/**
 * Enchantment that provides additional health points. The level of the enchantment
 * determines the amount of health points that are added.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class HealthEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (HealthEnchantment.#instance) {
			return HealthEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/health`,
			"Health",
			"Increases HP.",
			["chestplate", "elytra"],
			[10, 20, 30],
			"§4"
		);

		this.#setInstance();
	}

	#setInstance() {
		HealthEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`effect @s minecraft:health_boost 1 ${amp}`);
			}
		}
	}
}

/**
 * Enchantment that negates all magic damage. The enchantment is applied to leggings.
 * This enchantment negates the following effects:
 * - Blindness
 * - Mining Fatigue
 * - Nausea
 * - Poison
 * - Slowness
 * - Weakness
 * - Wither
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class AntiMagicEnchantment extends BaseEnchantment {
	static #instance = null;

	/**
	 * List of all effects that are negated by the Anti-Magic enchantment. The list
	 * contains another list. The outer list represents the levels of the enchantment
	 * while the inner list contains the effect IDs that are negated by the enchantment.
	 * 
	 * This setup allows the enchantment to be updated and have different levels which
	 * provides additional effects that can be negated.
	 */
	static #effectList = [
		[
			"minecraft:blindness",
			"minecraft:mining_fatigue",
			"minecraft:nausea",
			"minecraft:poison",
			"minecraft:slowness",
			"minecraft:weakness",
			"minecraft:wither",
		]
	];

	constructor() {
		if (AntiMagicEnchantment.#instance) {
			return AntiMagicEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/anti_magic`,
			"Anti-Magic",
			"Negates magic damage.",
			["leggings"],
			[20],
			"§5"
		);

		this.#setInstance();
	}

	#setInstance() {
		AntiMagicEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				AntiMagicEnchantment.#effectList.forEach((ampLevelList, ampLvl) => {
					if (ampLvl <= amp) {
						ampLevelList.forEach((effect) => {
							player.runCommandAsync(`effect clear @s ${effect}`);
						});
					}
					else {
						return;
					}
				});
			}
		}
	}
}

/**
 * Enchantment that creates a water impulse when sneaking in water. This boosts the
 * player's movement speed in water. The level of the enchantment determines the strength
 * of the water impulse.
 * 
 * The enchantment is activated when the player is sneaking and in water. Once activated,
 * the player will be given a boost in movement speed. The enchantment has a cooldown of
 * 20 ticks (1 second) before it can be used again.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class WaterImpulseEnchantment extends BaseEnchantment {
	static #instance = null;

	/**
	 * The time in ticks that the enchantment has to wait before it can be used again.
	 */
	#time = 0;

	constructor() {
		if (WaterImpulseEnchantment.#instance) {
			return WaterImpulseEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/diamond_leggings`,
			"Water Impulse",
			"Boosts your water movement.",
			["leggings"],
			[10, 20, 30],
			"§3"
		);

		this.#setInstance();
	}

	#setInstance() {
		WaterImpulseEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				if (player.isSneaking && player.isInWater && this.#time == 0) {
					let level = amp == 0 ? '' : (amp + 1);

					player.runCommandAsync(`summon ocrp:elytra${level}`);
					player.hasTag(`ocrp:system_enchantments:water_impulse_used`);
				}

				// After 20 ticks (1 second), reset the time to 0.
				if (this.#time <= 20) {
					player.removeTag(`ocrp:system_enchantments:water_impulse_used`);
					this.#time = 0;
				}
			}

			if (player.hasTag(`ocrp:system_enchantments:water_impulse_used`)) {
				this.#time++;
			}
		}
	}
}

/**
 * Enchantment that negates fire damage. The enchantment is applied to leggings.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class FireImmunityEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (FireImmunityEnchantment.#instance) {
			return FireImmunityEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/fire_immune`,
			"Fire Immunity",
			"Negates fire damage.",
			["leggings"],
			[20],
			"§6"
		);

		this.#setInstance();
	}

	#setInstance() {
		FireImmunityEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`effect @s minecraft:fire_resistance 2 ${amp} true`);
			}
		}
	}
}

/**
 * Enchantment that grants speed boost. The level of the enchantment determines the
 * strength of the speed boost effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class AgilityEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (AgilityEnchantment.#instance) {
			return AgilityEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/agility`,
			"Agility",
			"Grants agility.",
			["boots"],
			[10, 20, 30],
			"§b"
		);

		this.#setInstance();
	}

	#setInstance() {
		AgilityEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`effect @s minecraft:speed 1 ${amp} true`);
			}
		}
	}
}

/**
 * Enchantment that grants jump boost. The level of the enchantment determines the
 * strength of the jump boost effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class JumpEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (JumpEnchantment.#instance) {
			return JumpEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/jump`,
			"Jump",
			"Grants jump boost.",
			["boots"],
			[10, 20, 30],
			"§6"
		);

		this.#setInstance();
	}

	#setInstance() {
		JumpEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				player.runCommandAsync(`effect @s minecraft:jump_boost 1 ${amp + 1} true`);
			}
		}
	}
}

/**
 * Enchantment that knocks back enemies on hit. The level of the enchantment determines
 * the strength of the knockback effect.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class KnockbackEnchantment extends BaseEnchantment {
	static #instance = null;

	constructor() {
		if (KnockbackEnchantment.#instance) {
			return KnockbackEnchantment.#instance;
		}

		super(
			HASH,
			`textures/enchanted/system_enchantments/shield`,
			"Knockback",
			"Knocks back enemies on hit.",
			["sword"],
			[10, 20, 30],
			"§5"
		);

		this.#setInstance();
	}

	#setInstance() {
		KnockbackEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				if (player.isSneaking) {
					let level = amp == 0 ? '' : (amp + 1);

					player.runCommandAsync(`summon ocrp:shield${level} ^ ^ ^0.025`);
					player.addTag(`ocrp:system_enchantments:shield_used`);
				}
			}

			if (player.hasTag(`ocrp:system_enchantments:shield_used`) && !player.isSneaking) {
				for (let i = 0; i < maxAmp; i++) {
					let altLvl = i == 0 ? '' : (i + 1);
					player.runCommandAsync(`tp @e[type=ocrp:shield${altLvl}] ^ ^ ^0.025`);
				}
			}
			else {
				player.runCommandAsync(`event entity @e[type=ocrp:shield${altLvl}] ocrp:despawn`);
				player.removeTag(`ocrp:system_enchantments:shield_used`);
			}
		}
	}
}

/**
 * Enchantment that creates an impulse. The level of the enchantment determines the
 * strength of the impulse effect.
 * 
 * The enchantment is activated when the player is sneaking and not on the ground.
 * Once activated, the player will be given a boost in movement speed. The enchantment
 * has a cooldown of 20 ticks (1 second) before it can be used again.
 * 
 * This class is a singleton, so there can only be one instance of this class.
 * 
 * @extends BaseEnchantment
 */
class ImpulseEnchantment extends BaseEnchantment {
	static #instance = null;

	/**
	 * The time in ticks that the enchantment has to wait before it can be used again.
	 */
	#time = 0;

	constructor() {
		if (ImpulseEnchantment.#instance) {
			return ImpulseEnchantment.#instance;
		}

		super(
			HASH,
			`textures/items/elytra`,
			"Impulse",
			"Fly without fireworks.",
			["elytra"],
			[10, 20, 30],
			"§b"
		);

		this.#setInstance();
	}

	#setInstance() {
		ImpulseEnchantment.#instance = this;
	}

	/**
	 * @param {string} level The level of the enchantment. The level is a Roman numeral from I to X.
	 * @param  {...any} args The arguments for the effect. The first argument should be the entity that is wearing or holding the item.
	 */
	runEffect(level, ...args) {
		const player = args[0];

		if (player) {
			const amp = BaseEnchantment.LEVELS.indexOf(level),
				maxAmp = Object.keys(this.levels).length;

			if (!isNaN(amp) && amp < maxAmp && amp >= 0) {
				if (player.isSneaking && !player.isOnGround && this.#time == 0) {
					let level = amp == 0 ? '' : (amp + 1);

					player.runCommandAsync(`summon ocrp:elytra${level} ^ ^ ^-0.5`);
					player.hasTag(`ocrp:system_enchantments:impulse_used`);
				}

				// After 20 ticks (1 second), reset the time to 0.
				if (this.#time <= 20) {
					player.removeTag(`ocrp:system_enchantments:impulse_used`);
					this.#time = 0;
				}
			}

			if (player.hasTag(`ocrp:system_enchantments:impulse_used`)) {
				player.runCommandAsync(`tp @e[family=elytra] ^ ^ ^-0.5`)
				this.#time++;
			}
		}
	}
}

///////////////
// EXPORTING //
///////////////
export const Poison = new PoisonEnchantment(),
	IceAspect = new IceAspectEnchantment(),
	Levitating = new LevitatingEnchantment(),
	Vampire = new VampireEnchantment(),
	Wither = new WitherEnchantment(),
	Weakness = new WeaknessEnchantment(),
	AreaAttack = new AreaAttackEnchantment(),
	WoodCutter = new WoodCutterEnchantment(),
	Haste = new HasteEnchantment(),
	Magnetic = new MagneticEnchantment(),
	Smelting = new SmeltingEnchantment(),
	XpCollector = new XpCollectorEnchantment(),
	Strip = new StripEnchantment(),
	Furrowing = new FurrowingEnchantment(),
	NightEyes = new NightEyesEnchantment(),
	SharedDamage = new SharedDamageEnchantment(),
	Health = new HealthEnchantment(),
	AntiMagic = new AntiMagicEnchantment(),
	WaterImpulse = new WaterImpulseEnchantment(),
	FireImmunity = new FireImmunityEnchantment(),
	Agility = new AgilityEnchantment(),
	Jump = new JumpEnchantment(),
	Knockback = new KnockbackEnchantment(),
	Impulse = new ImpulseEnchantment();

/**
 * The super class for all enchantments. This class contains the basic properties
 * and methods that are shared by all enchantments. Can be used as a base class
 * for creating new enchantments.
 * 
 * This class is an abstract class and cannot be instantiated directly.
 * 
 * @abstract
 * @class BaseEnchantment
 */
export const Base = Object.freeze(BaseEnchantment);

/**
 * Fetches the enchantment level for a specific enchantment.
 * 
 * @param {ItemStack} item The item stack to check for enchantments.
 * @param {BaseEnchantment|string} enchantment The enchantment to check for.
 * 
 * @returns {string} The enchantment level in Roman numeral format. If the enchantment is not found, an empty string is returned.
 * 
 * @throws {Error} If the `item` or `enchantment` is null or undefined, or if the `item` is not an instance of `ItemStack`, or if the `enchantment` is not an instance of `BaseEnchantment` class or a string.
 */
export const getLvl = (item, enchantment) => {
	// Null and undefined checking.
	if (!item && item !== null)
		throw new Error("Item stack cannot be undefined.");
	if (!enchantment && enchantment !== null)
		throw new Error("Enchantment cannot be undefined.");

	// Type checking.
	if (!(item instanceof ItemStack) && item !== null)
		throw new Error("Item stack must be an instance of 'ItemStack' class.");
	if (!(enchantment instanceof BaseEnchantment) && typeof enchantment != 'string' && enchantment !== null)
		throw new Error("Enchantment must either be an instance of 'BaseEnchantment' class or a string.");

	// Null handling.
	if (item === null || enchantment === null)
		return '';

	// Convert the enchantment to a string if it is an instance of BaseEnchantment class.
	if (enchantment instanceof BaseEnchantment)
		enchantment = enchantment.name;

	// Get the lore of the item stack.
	const lore = item.getLore()[0];

	// If the lore is null or undefined, return an empty string.
	if (!lore)
		return '';

	// Fetch the enchantment level from the lore.
	const lvl = lore.match(new RegExp(`${enchantment} ([IVXLCDM]+)`));

	// If the enchantment level is null or undefined, return an empty string.
	if (!lvl)
		return '';

	// Return the enchantment level in Roman numeral format.
	return lvl[1];
};

/**
 * List of all enchantments that are available in the game. The list contains the
 * enchantment name as the key and the enchantment object as the value.
 * 
 * @type {Object.<string, BaseEnchantment>}
 */
export default {
	"Poison": new PoisonEnchantment(),
	"IceAspect": new IceAspectEnchantment(),
	"Levitating": new LevitatingEnchantment(),
	"Vampire": new VampireEnchantment(),
	"Wither": new WitherEnchantment(),
	"Weakness": new WeaknessEnchantment(),
	"AreaAttack": new AreaAttackEnchantment(),
	"WoodCutter": new WoodCutterEnchantment(),
	"Haste": new HasteEnchantment(),
	"Magnetic": new MagneticEnchantment(),
	"Smelting": new SmeltingEnchantment(),
	"XpCollector": new XpCollectorEnchantment(),
	"Strip": new StripEnchantment(),
	"Furrowing": new FurrowingEnchantment(),
	"NightEyes": new NightEyesEnchantment(),
	"SharedDamage": new SharedDamageEnchantment(),
	"Health": new HealthEnchantment(),
	"AntiMagic": new AntiMagicEnchantment(),
	"WaterImpulse": new WaterImpulseEnchantment(),
	"FireImmunity": new FireImmunityEnchantment(),
	"Agility": new AgilityEnchantment(),
	"Jump": new JumpEnchantment(),
	"Knockback": new KnockbackEnchantment(),
	"Impulse": new ImpulseEnchantment()
};