import { ItemStack, world, system, EquipmentSlot, LocationOutOfWorldBoundariesError } from '@minecraft/server';

const getAllEntities = () => ["overworld", "nether", "the_end"].flatMap(_0x5e3cca => world.getDimension(_0x5e3cca).getEntities());
const underWater = ["ocrp:sea_torch", "shroomlight", "froglight", "blaze", "lantern", "glowstone", "beacon", 'lit_pumpkin'];
const level15 = ["ocrp:sea_torch", "ocrp:torch", 'shroomlight', "froglight", "blaze", "lantern", "lava_bucket", "glowstone", "minecraft:campfire", 'beacon', "lit_pumpkin"];
const level11 = ['soul_torch', "soul_campfire", "soul_lantern", "crying_obsidian", "enchanting_table"];
const level8 = ["redstone_torch", "catalyst", 'redstone_block', "redstone_ore"];

function extractValues(_0xe131a6) {
	let _0x489547 = _0xe131a6.match(/rdl_pos:z:(-?\d+)y:(-?\d+)z:(-?\d+),dimension:(.+)/);
	if (_0x489547) {
		let _0x444e9c = parseInt(_0x489547[0x1]);
		let _0x43cb32 = parseInt(_0x489547[0x2]);
		let _0xa5410a = parseInt(_0x489547[0x3]);
		let _0x187a7b = _0x489547[0x4];
		return {
			'x': _0x444e9c,
			'y': _0x43cb32,
			'z': _0xa5410a,
			'dimension': _0x187a7b
		};
	} else {
		return null;
	}
}

function shouldSpawnPig(_0x1e43a3) {
	return _0x1e43a3 && itemsToTriggerSpawn.some(_0x595d80 => _0x1e43a3.typeId.includes(_0x595d80));
}

function replaceItems(_0x3a8dcd, _0x4bd00b, _0x301099) {
	for (let _0x2932a8 = 0x0; _0x2932a8 < _0x3a8dcd.size; _0x2932a8++) {
		const _0x286dcf = _0x3a8dcd.getItem(_0x2932a8);
		if (_0x286dcf && _0x286dcf.typeId === _0x4bd00b) {
			const _0x53e60f = new ItemStack(_0x301099, _0x286dcf.amount);
			_0x3a8dcd.setItem(_0x2932a8, _0x53e60f);
		}
	}
}

export default {
	init: () => {
		system.runInterval(() => {
			let entities = getAllEntities();
		
			entities.forEach(entity => {
				const _0xdf151a = entity?.["getComponent"]("equippable");
				const _0x3de313 = _0xdf151a?.['getEquipment'](EquipmentSlot.Mainhand);
				const _0xaa8767 = _0xdf151a?.["getEquipment"](EquipmentSlot.Offhand);
				const _0x14c9d7 = entity?.["getComponent"]("inventory")?.["container"];
		
				if (_0x14c9d7) {
					replaceItems(_0x14c9d7, "minecraft:torch", "ocrp:torch");
					replaceItems(_0x14c9d7, 'minecraft:underwater_torch', "ocrp:sea_torch");
				}

				try {
					if (world.getDimension(entity.dimension.id).getBlock(entity.location) !== undefined) {
						let _0x439288 = Math.floor(entity.location.x);
						let _0x4324cb = Math.floor(entity.location.z);
						let _0x27c912 = Math.floor(world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x1,
							'z': _0x4324cb
						}).typeId === 'minecraft:air' || world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x1,
							'z': _0x4324cb
						}).typeId === 'minecraft:light_block' ? entity.location.y + 0x1 : world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x1,
							'z': _0x4324cb
						}).typeId === 'minecraft:flowing_water' || world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x1,
							'z': _0x4324cb
						}).typeId === "minecraft:water" && (underWater.some(_0x2aa381 => _0x3de313?.["typeId"]["includes"](_0x2aa381)) || underWater.some(_0x9800da => _0xaa8767?.["typeId"]["includes"](_0x9800da))) ? entity.location.y + 2.5 : world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x2,
							'z': _0x4324cb
						}).typeId === "minecraft:air" || world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x2,
							'z': _0x4324cb
						}).typeId === "minecraft:light_block" ? entity.location.y + 0x2 : world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x2,
							'z': _0x4324cb
						}).typeId === "minecraft:flowing_water" || world.getDimension(entity.dimension.id).getBlock({
							'x': _0x439288,
							'y': entity.location.y + 0x2,
							'z': _0x4324cb
						}).typeId === 'minecraft:water' && (underWater.some(_0x558662 => _0x3de313?.["typeId"]["includes"](_0x558662)) || underWater.some(_0x1de145 => _0xaa8767?.["typeId"]["includes"](_0x1de145)) || entity?.["typeId"] === "minecraft:glow_squid") || entity.getComponent("item")?.["isValid"] && underWater.some(_0x3c6b14 => entity.getComponent("item").itemStack?.["typeId"]["includes"](_0x3c6b14)) ? entity.location.y + 2.5 : null);
			
						if (_0x27c912 !== null) {
							if (entity?.["typeId"] === "minecraft:tnt") {
								world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xc);
							}
			
							if (entity?.["getComponent"]("item")?.['isValid']) {
								const _0x215214 = entity?.['getComponent']("item")?.["itemStack"];
								if (level15.some(_0x3684ce => _0x215214?.['typeId']["includes"](_0x3684ce))) {
									world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xf);
								}
								if (level11.some(_0x48359a => _0x215214?.['typeId']['includes'](_0x48359a))) {
									world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xb);
								}
								if (level8.some(_0x3160f3 => _0x215214?.["typeId"]["includes"](_0x3160f3))) {
									world.setDynamicProperty('rdl_pos:z:' + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ',dimension:' + entity.dimension.id, 0x8);
								}
							}
			
							if (entity?.["getDynamicProperty"]("creeper:try_exploding") === 0x1) {
								world.setDynamicProperty('rdl_pos:z:' + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xc);
							}
			
							if (entity?.['getComponent']("onfire")?.["onFireTicksRemaining"] > 0x0) {
								world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xc);
							}
			
							if (entity?.["typeId"] === "minecraft:glow_squid") {
								world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xe);
							}
			
							if (underWater.some(_0x5dfb42 => entity.getComponent("item")?.["itemStack"]?.["typeId"]['includes'](_0x5dfb42))) {
								world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xe);
							}
			
							if ((underWater.some(_0x4a4a72 => _0x3de313?.["typeId"]["includes"](_0x4a4a72)) || underWater.some(_0x5cf193 => _0xaa8767?.['typeId']["includes"](_0x5cf193))) && world.getDimension(entity.dimension.id).getBlock({
								'x': _0x439288,
								'y': _0x27c912,
								'z': _0x4324cb
							}).typeId !== 'minecraft:air' && world.getDimension(entity.dimension.id).getBlock({
								'x': _0x439288,
								'y': _0x27c912,
								'z': _0x4324cb
							}).typeId !== "minecraft:light_block") {
								world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ',dimension:' + entity.dimension.id, 0xe);
							} else {
								if (level15.some(_0x3c0ced => _0x3de313?.["typeId"]["includes"](_0x3c0ced)) || level15.some(_0x1cb48a => _0xaa8767?.["typeId"]["includes"](_0x1cb48a))) {
									world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xf);
								} else {
									if (underWater.some(_0x144816 => _0x3de313?.['typeId']["includes"](_0x144816)) || underWater.some(_0x5d206d => _0xaa8767?.["typeId"]["includes"](_0x5d206d))) {
										world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xe);
									} else {
										if (level11.some(_0x1eb6e5 => _0x3de313?.["typeId"]["includes"](_0x1eb6e5)) || level11.some(_0x681c57 => _0xaa8767?.["typeId"]["includes"](_0x681c57))) {
											world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ",dimension:" + entity.dimension.id, 0xb);
										} else if (level8.some(_0x374239 => _0x3de313?.['typeId']['includes'](_0x374239)) || level8.some(_0x267c9a => _0xaa8767?.['typeId']["includes"](_0x267c9a))) {
											world.setDynamicProperty("rdl_pos:z:" + _0x439288 + 'y:' + _0x27c912 + 'z:' + _0x4324cb + ',dimension:' + entity.dimension.id, 0x8);
										}
									}
								}
							}
						}
					}
				} catch (e) {
					if (!e instanceof LocationOutOfWorldBoundariesError)
						throw e;
				}
			});
		
			const _0x65f4b8 = world.getDynamicPropertyIds();
		
			_0x65f4b8.forEach(_0x5df96f => {
				if (_0x5df96f.includes("rdl_pos")) {
					const _0xc041bd = extractValues(_0x5df96f);
					if (world.getDimension(_0xc041bd.dimension).getBlock({
						'x': _0xc041bd.x,
						'z': _0xc041bd.z,
						'y': _0xc041bd.y
					}) !== undefined) {
						if (world.getDynamicProperty(_0x5df96f) === 0x0) {
							if ((world.getDimension(_0xc041bd.dimension).getBlock({
								'x': _0xc041bd.x,
								'y': _0xc041bd.y + 0x1,
								'z': _0xc041bd.z
							}).typeId === "minecraft:water" || world.getDimension(_0xc041bd.dimension).getBlock({
								'x': _0xc041bd.x,
								'y': _0xc041bd.y + 0x1,
								'z': _0xc041bd.z
							}).typeId === "minecraft:flowing_water") && (world.getDimension(_0xc041bd.dimension).getBlock({
								'x': _0xc041bd.x,
								'y': _0xc041bd.y - 0x1,
								'z': _0xc041bd.z
							}).typeId === "minecraft:water" || world.getDimension(_0xc041bd.dimension).getBlock({
								'x': _0xc041bd.x,
								'y': _0xc041bd.y - 0x1,
								'z': _0xc041bd.z
							}).typeId === 'minecraft:flowing_water')) {
								world.getDimension(_0xc041bd.dimension).runCommand("fill " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " water replace light_block");
							} else {
								world.getDimension(_0xc041bd.dimension).runCommand("fill " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " air replace light_block");
							}
							world.setDynamicProperty(_0x5df96f, undefined);
						} else {
							world.getDimension(_0xc041bd.dimension).runCommand("fill " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " light_block [\"block_light_level\" =  " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 0xf : world.getDynamicProperty(_0x5df96f)) + "] replace " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 'flowing_water' : "light_block"));
							world.getDimension(_0xc041bd.dimension).runCommand("fill " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " light_block [\"block_light_level\" = " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 0xf : world.getDynamicProperty(_0x5df96f)) + "] replace " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 'water' : "light_block"));
							world.getDimension(_0xc041bd.dimension).runCommand("fill " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " light_block [\"block_light_level\" =  " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 0xf : world.getDynamicProperty(_0x5df96f)) + "] replace " + (world.getDynamicProperty(_0x5df96f) === 0xe ? "flowing_water" : 'air'));
							world.getDimension(_0xc041bd.dimension).runCommand("fill " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " " + _0xc041bd.x + " " + _0xc041bd.y + " " + _0xc041bd.z + " light_block [\"block_light_level\" = " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 0xf : world.getDynamicProperty(_0x5df96f)) + "] replace " + (world.getDynamicProperty(_0x5df96f) === 0xe ? 'water' : "air"));
						}
						if (world.getDynamicProperty(_0x5df96f) !== undefined) {
							world.setDynamicProperty(_0x5df96f, 0x0);
						}
					}
				}
			});
		});

		world.afterEvents.dataDrivenEntityTrigger.subscribe(({
			eventId: _0x26da2a,
			entity: _0x289700
		}) => {
			if (_0x26da2a === "minecraft:start_exploding") {
				_0x289700.setDynamicProperty('creeper:try_exploding', 0x1);
			}
			if (_0x26da2a === "minecraft:stop_exploding") {
				_0x289700.setDynamicProperty("creeper:try_exploding", 0x0);
			}
			if (_0x26da2a === "minecraft:start_exploding_forced") {
				_0x289700.setDynamicProperty("creeper:try_exploding", 0x1);
			}
		});

		world.afterEvents.entitySpawn.subscribe(({
			entity: _0x49a382
		}) => {
			if (_0x49a382.hasComponent("minecraft:item")) {
				const _0x32fe30 = _0x49a382.getComponent("minecraft:item");
				const _0x2cea92 = _0x32fe30.itemStack;
				const _0x4483dc = _0x32fe30.itemStack.amount;
				const _0x5b07ad = new ItemStack("ocrp:torch", _0x4483dc);
				if (_0x2cea92.typeId === 'minecraft:torch') {
					_0x49a382.dimension.spawnItem(_0x5b07ad, _0x49a382.location);
					_0x49a382.remove();
				}
				const _0x2c0117 = new ItemStack('ocrp:sea_torch', _0x4483dc);
				if (_0x2cea92.typeId === 'minecraft:underwater_torch') {
					_0x49a382.dimension.spawnItem(_0x2c0117, _0x49a382.location);
					_0x49a382.remove();
				}
			}
		});
	}
}