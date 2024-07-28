import { world, system, EntityComponentTypes, BlockVolume } from '@minecraft/server';

export default {
	init: () => {
		let brushProp = { color: "black", size: "Small" };
		let playerUseItem, location, selection, item, playerPastLocation;
		let universalCheck = false;
		let exit = false;

		world.getDimension(`overworld`).runCommand(`tickingarea add 4928 319 64 5056 275 -64 painting_room true`);
		world.getDimension(`overworld`).runCommand(`gamerule sendcommandfeedback false`);
		world.getDimension(`overworld`).runCommand(`gamerule commandblockoutput false`);

		function checkDrawer() {
			for (const player of world.getAllPlayers()) {
				const riding = player.getComponent("minecraft:riding")?.entityRidingOn;
				const inventory = player.getComponent("minecraft:inventory").container;
				//player.onScreenDisplay.setActionBar(`universalCheck: ${universalCheck} Tag: ${player.getTags()} ${inventory?.getItem(0).typeId} ${inventory?.getItem(1).typeId} ${riding?.typeId}`)
				
				if (
					riding?.typeId == "ocrp:painting_stand"
					&& inventory.getItem(0)?.typeId == "minecraft:brush"
					&& inventory.getItem(1)?.typeId == "minecraft:empty_map"
				) {
					playerPastLocation = player.location;
					world.setDynamicProperty("artEnthusiasm_playerPastLocation", JSON.stringify(playerPastLocation));

					if (!player.hasTag("drawer"))
						player.addTag("drawer");

					world.getDimension(`overworld`).runCommand(`structure load art_enthusiasm:painting_room 4976 280 -16 0_degrees none true true`);
					world.getDimension(`overworld`).runCommand(`execute as @a[tag=drawer] run gamemode adventure @s`);
					player.addEffect('night_vision', 9999999, { showParticles: false });
					player.teleport({ x: 4992.95, y: 321, z: 6.95 });
					universalCheck = true;
					render();
				};
			};
		};

		function render() {
			for (let xDirect = 4984; xDirect <= 4999; xDirect++) {
				let mapX = 4928 - 8 * (4984 - xDirect);
				
				for (let yDirect = 297; yDirect >= 282; yDirect--) {
					let mapZ = -64 - 8 * (yDirect - 297);
					let pixel = world.getDimension(`overworld`).getBlock({ x: xDirect, y: yDirect, z: -14 })?.type;

					if (pixel) {
						world.getDimension(`overworld`)
							.fillBlocks(
								new BlockVolume(
									{ x: mapX, y: 319, z: mapZ },
									{ x: mapX + 8, y: 319, z: mapZ + 8 }
								),
								pixel
							);
					}
				}
			}
		}

		function paint(color, loc, size = "Small") {
			let pos1 = 0, pos2 = 0;
			switch (size) {
				case "Big":
					pos1 = pos2 = 1;
					break;

				case "Medium":
					pos2 = 1;
					break;

				case "Small":
				default:
					pos1 = pos2 = 0;
					break;
			}

			playerUseItem?.runCommandAsync(`
				fill ${loc.x - pos1} ${loc.y - pos1} -14 ${loc.x + pos2} ${loc.y + pos2} -14 minecraft:${color}_wool replace wool
			`);
			render();
		}

		world.afterEvents.itemUse.subscribe(eventData => {
			item = eventData.itemStack;
			playerUseItem = eventData.source;

			if (item.typeId === "minecraft:brush" && playerUseItem.hasTag('drawer')) {
				if (typeof location !== 'undefined') {
					if (brushProp.size === "Small") {
						playerUseItem.runCommandAsync(`fill ${location?.x} ${location?.y} -14 ${location?.x} ${location?.y} -14 minecraft:${brushProp.color}_wool replace wool`);
						render();
					}
					else if (brushProp.size === "Medium") {
						playerUseItem.runCommandAsync(`fill ${location?.x} ${location?.y} -14 ${location?.x + 1} ${location?.y + 1} -14 minecraft:${brushProp.color}_wool replace wool`);
						render();
					}
					else {
						if (selection !== "minecraft:noteblock" && selection !== "minecraft:stained_glass") {
							playerUseItem.runCommandAsync(`fill ${location?.x - 1} ${location?.y - 1} -14 ${location?.x + 1} ${location?.y + 1} -14 minecraft:${brushProp.color}_wool replace wool`);
						}
						render();
					};
				};

				const OPTIONS = {
					COLORS: {
						"minecraft:black_concrete": "black",
						"minecraft:red_concrete": "red",
						"minecraft:orange_concrete": "orange",
						"minecraft:yellow_concrete": "yellow",
						"minecraft:lime_concrete": "lime",
						"minecraft:light_blue_concrete": "light_blue",
						"minecraft:blue_concrete": "blue",
						"minecraft:purple_concrete": "purple",
						"minecraft:magenta_concrete": "magenta",
						"minecraft:pink_concrete": "pink",
						"minecraft:white_concrete": "white"
					},
					SIZES: {
						"minecraft:red_sandstone": "Big",
						"minecraft:smooth_red_sandstone_stairs": "Medium",
						"minecraft:orange_terracotta": "Small",
					},
					ACTIONS: {
						"minecraft:white_stained_glass": () => {
							world.getDimension(`overworld`).runCommand(`fill 4984 297 -14 4999 282 -14 white_wool`);
							render();
						},
						"minecraft:redstone_block": () => {
							exit = playerUseItem.isSneaking;
						}
					}
				};

				brushProp.color = OPTIONS.COLORS[selection] || brushProp.color;
				brushProp.size = OPTIONS.SIZES[selection] || brushProp.size;

				if (Object.keys(OPTIONS.ACTIONS).includes(selection)) {
					OPTIONS.ACTIONS[selection]();
				}
			}
		});

		system.runInterval(
			() => {
				if (!universalCheck) {
					checkDrawer();
				};

				let formatColor = brushProp.color.replace("_", ' ').charAt(0).toUpperCase() + brushProp.color.slice(1).replace("_", ' ');
				
				world.getAllPlayers().filter(player => player.hasTag('drawer'))
					.forEach(playerWithTag => {
						playerWithTag.onScreenDisplay
							.setActionBar(`[Selected Color - ${formatColor}] [Brush Size - ${brushProp.size}]`);
					}
				);

				if (exit) {
					playerPastLocation = playerPastLocation || JSON.parse(world.getDynamicProperty("artEnthusiasm_playerPastLocation"));

					let dimension = world.getDimension(`overworld`);
					let exitCommands = [
						`fill 5007 280 15 4976 304 -16 air`,
						`execute as @a[tag=drawer] run gamemode survival @s`,
						`execute as @a[tag=drawer] run tp @s ${playerPastLocation.x} ${playerPastLocation.y} ${playerPastLocation.z}`,
						`execute as @a[tag=drawer] run effect @s clear`,
						`execute as @a[tag=drawer] run tag @s remove drawer`
					];

					exitCommands.forEach(cmd => dimension.runCommand(cmd));

					render();
					exit = false;
					universalCheck = false;
				}
				
				if (item?.typeId === "minecraft:brush" && playerUseItem.hasTag('drawer')) {
					selection = playerUseItem.getBlockFromViewDirection()?.block.typeId
					location = playerUseItem.getBlockFromViewDirection()?.block.location
				}
				
				if (playerUseItem?.isSneaking &&
					brushProp.color !== "none" &&
					typeof location !== 'undefined' &&
					playerUseItem?.getComponent(EntityComponentTypes.Inventory)
						?.container
						?.getItem(playerUseItem?.selectedSlotIndex)
						?.typeId === "minecraft:brush"
				) {
					paint(brushProp.color, location, brushProp.size);
				};
			},
		);
	}
};