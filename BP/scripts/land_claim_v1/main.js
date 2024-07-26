import { world, system, BlockVolume } from "@minecraft/server";
import { ProtectedAreas } from "./ProtectedAreaHandler.js";
import { ModalFormData, ActionFormData, MessageFormData } from '@minecraft/server-ui';
import Vector3 from "./Vector3.js"

const protectedAreas = new ProtectedAreas();

const cooldownPeriod = 1000;
const selectedCoordinates = new Map(); // Map to track cooldown for each player
const playerParticles = new Map(); // Map to track particles for each player

export default {
	init: function () {
		world.afterEvents.itemUse.subscribe(({
			itemStack, source
		}) => {
			if (itemStack.typeId == "ocrp:protection" && !source.isSneaking) select(source);
		});

		world.beforeEvents.playerInteractWithBlock.subscribe(data => {
			const { block, player, itemStack } = data;
			const { x, y, z } = block.location;
			const centerX = x + 0.5; // Calculate the center X coordinate
			const centerY = y + 1.5; // Calculate the Y coordinate for the top surface
			const centerZ = z + 0.5; // Calculate the center Z coordinate
			const Vec3 = { x: centerX, y: centerY, z: centerZ };
			const currentTime = Date.now();

			if (!selectedCoordinates.has(player)) {
				selectedCoordinates.set(player, { lastExecutionTime: 0, coords: [] });
			}

			if (!playerParticles.has(player)) {
				playerParticles.set(player, []);
			}

			const playerCooldown = selectedCoordinates.get(player);
			const playerParticlesList = playerParticles.get(player);

			if (currentTime - playerCooldown.lastExecutionTime >= cooldownPeriod) {
				playerCooldown.lastExecutionTime = currentTime;

				if (player.isSneaking && itemStack?.typeId === "ocrp:protection") {
					if (playerCooldown.coords.length === 0 || playerCooldown.coords.length === 1) {
						if (playerCooldown.coords[playerCooldown.coords.length - 1] !== `${x} ${y} ${z}`) {
							playerCooldown.coords.push(`${x} ${y} ${z}`);
						}

						const dimensions = ["overworld", "nether", "the_end"];

						for (const dimension of dimensions) {
							const Particle = system.runInterval(() => {
								player.dimension.spawnParticle("minecraft:balloon_gas_particle", Vec3);
							});
							playerParticlesList.push(Particle);
						}

						system.run(() => {
							player.playSound('random.levelup');
							player.sendMessage(`§e ${x}, ${y}, ${z}§r §bhas been saved!`);
						});
					} else {
						player.sendMessage("§bThe values have been set before open the form to create the land with this coords!");
						system.run(() => player.playSound('random.pop'));
					}
				}
			}
		});
	}
}

function FromTo(player) {
	const FromToo = new ModalFormData();
	FromToo.title("Choose your area range");
	FromToo.textField("Name :", "Add the name of the area");

	if (selectedCoordinates.get(player).coords[0]) {
		FromToo.textField("From (x, y, z) :", "the (x, y, z) of the beginning", selectedCoordinates.get(player).coords[0]);
	} else {
		FromToo.textField("From (x, y, z) :", "the (x, y, z) of the beginning");
	}

	if (selectedCoordinates.get(player).coords[1]) {
		FromToo.textField("To (x, y, z) :", "the (x, y, z) of the ending", selectedCoordinates.get(player).coords[1]);
	} else {
		FromToo.textField("To (x, y, z) :", "the (x, y, z) of the ending");
	}

	FromToo.show(player).then(({ canceled, formValues }) => {
		// If the UI is closed or cancelled instead
		if (canceled) {
			// Handle the case when the player cancels the form
			player.sendMessage("§bThe area selection process has been canceled !");
			player.playSound('random.pop');
			for (const Particle of playerParticles.get(player)) {
				system.clearRun(Particle);
			}
			selectedCoordinates.delete(player);
			playerParticles.delete(player);
			return;
		}

		// Ensure that you're correctly handling the case when formValues is undefined
		if (!formValues || formValues.length !== 3) {
			player.sendMessage("Invalid form values.");
			player.playSound('random.break');
			return;
		}

		for (const Particle of playerParticles.get(player)) {
			system.clearRun(Particle);
		}

		selectedCoordinates.delete(player);
		playerParticles.delete(player);

		const [name, FromCoordinates, ToCoordinates] = formValues;
		const [fx, fy, fz] = FromCoordinates.split(' ').map(parseFloat);
		const [tx, ty, tz] = ToCoordinates.split(' ').map(parseFloat);

		const protectedAreas = new ProtectedAreas();
		const hasDuplicatedId = protectedAreas.getArea({ id: name });
		const hasIntersection = protectedAreas.getProtectedAreas().some(area => {
			let HI = new BlockVolume(area.from, area.to)
				.intersects(
					new BlockVolume(
						new Vector3(fx, fy + 60, fz),
						new Vector3(tx, ty - 10, tz)
					)
				);
			return HI;
		});

		if (hasDuplicatedId) {
			player.sendMessage(`§bThe name§r §e${name}§r §bhas been used before, try another name!`);
			player.playSound('random.break');
		} else if (isNaN(fx) || isNaN(fy) || isNaN(fz) || isNaN(tx) || isNaN(ty) || isNaN(tz)) {
			player.sendMessage("Wrong coordinates format! Please provide valid numbers.");
			player.playSound('random.break');
		} else if (hasIntersection) {
			player.sendMessage(`§nYou cannot take this area because it is close to another.`);
			player.playSound('random.break');
		} else {
			protectedAreas.setArea({
				name: name,
				from: new Vector3(fx, -64, fz),
				to: new Vector3(tx, 319, tz),
				owner: player.name,
				originalcr: new Vector3(fx, fy, fz)
			});

			protectedAreas.areaWhitelistAdd({
				id: name,
				player: player.name
			});

			player.sendMessage("§aYour area has been saved!");
			player.playSound('random.levelup');
		}
	});
}

function select(player) {
	const select = new ActionFormData()
		.title("LAND CLAIM MENU")
		.body("        §bTHIS ADDON MADE BY§r\n§o§a=> shadowgamer100k <=§r §bEnjoy :)")
		.button("CREATE AREA\n§o§s[Click Here]",
			'textures/ui/icon_book_writable.png')
		.button("MY AREAS\n§o§s[Click Here]",
			'textures/ui/icon_map.png')
		.button("GIVE ACCESS\n§o§s[Click Here]",
			'textures/ui/FriendsDiversity.png')
		.button("DELETE AREA\n§o§s[Click Here]",
			'textures/ui/icon_trash.png')
	if (player.hasTag("admin")) {
		select.button("ADMIN PANEL\n§o§s[Click Here]", 'textures/ui/op.png')
	}
	select.show(player).then(({
		canceled, selection
	}) => {
		if (canceled) return;
		else if (selection === 0) FromTo(player);
		else if (selection === 1) allMyAreas(player);
		else if (selection === 2) giveAccess(player);
		else if (selection === 3) DeleteAreas(player);
		else if (selection === 4) AdminPanel(player);
	})
}

function giveAccess(player) {
	const playerName = player.name;
	const areas = protectedAreas.getProtectedAreas();
	const playerAreas = areas.filter(area => area.owner === playerName || area.whitelist[0] === playerName);
	const areaNames = playerAreas.map(area => area.id);
	const players = world.getPlayers().map(p => p.name);
	if (areaNames.length === 0) {
		player.sendMessage("§nYou don't have access to any areas to grant access to.");
		player.playSound('random.break');
		return;
	}

	const accessForm = new ModalFormData()
		.title("Give Access")
		.dropdown("Select the area", areaNames, 0)
		.dropdown("Select a player to grant access to your area", players, 0);

	accessForm.show(player).then(({ canceled, formValues }) => {
		if (canceled) return;
		const [areaIndex, playerIndex] = formValues;
		const areaName = areaNames[areaIndex];
		const playerNameToAdd = players[playerIndex];

		protectedAreas.areaWhitelistAdd({
			id: areaName,
			player: playerNameToAdd
		});

		player.sendMessage(`§e${playerNameToAdd}§r §bhas been added to §r§e${areaName} §r§b whitelist.`);
		playerNameToAdd.sendMessage(`§e${playerName}§r has added you to the whitelist of §r§e${areaName}§r.`);
		player.playSound('random.levelup');
		playerNameToAdd.playSound('random.levelup');
	});
}

function DeleteAreas(player) {
	const playerName = player.name;
	const MyAreasList = protectedAreas.getProtectedAreas();
	const MyAreas = MyAreasList.filter(area => area.owner === playerName || area.whitelist[0] === playerName);
	const MyAreasName = MyAreas.map(area => area.id);
	const AresForm = new ModalFormData()
		.title("this is all your areas")
		.dropdown("Select the area",
			MyAreasName,
			0)
		.show(player).then(({
			canceled, formValues
		}) => {
			if (canceled) return;
			const [deletedArea] = formValues;
			protectedAreas.deleteArea({
				id: MyAreasName[deletedArea]
			});
			player.sendMessage(`§b${MyAreasName[deletedArea]}§f §edeleted from Protected Areas§f`);
			player.playSound('random.levelup')
		})
}

function allMyAreas(player) {
	const playerName = player.name;
	const areas = protectedAreas.getProtectedAreas();
	const myAreas = areas.filter(area => area.owner === playerName || area.whitelist[0] === playerName);

	if (myAreas.length === 0) {
		player.sendMessage("§bYou don't have any protected areas.");
		player.playSound('random.break');
	} else {
		const myAreaNames = myAreas.map(area => area.id);
		const areaFormData = new ActionFormData()
			.title("My Areas")
			.body("Select an area:");

		for (const myAreaName of myAreaNames) {
			areaFormData.button(`${myAreaName}\n§o§s[Click Here]`, 'textures/ui/world_glyph_color.png');
		}

		areaFormData.show(player).then(({ canceled, selection }) => {
			if (canceled) return;
			const AreaId = myAreaNames[selection];
			const selectedArea = myAreas[selection];
			const accessLists = selectedArea.whitelist;

			if (accessLists.length === 0) {
				player.sendMessage("§nThis area has no access permissions.");
			} else {
				const accessFormData = new ActionFormData()
					.title("Whitelist")
					.body("Select a player to manage:");

				for (let i = 0; i < accessLists.length; i++) {
					const accessList = accessLists[i];
					const isOwner = i === 0;

					const texture = isOwner ? 'textures/ui/op.png' : 'textures/ui/permissions_member_star.png';

					accessFormData.button(`${accessList}\n§o§s[Click Here]`, texture);
				}
				
				accessFormData.button("Manage Rules", "textures/ui/icon_book_writable.png");

				accessFormData.show(player).then(({ canceled, selection }) => {
					if (canceled) {
						return;
					}
					else if (selection == accessLists.length) {
						showRules(player, AreaId);
						return;
					}

					const selectedPlayer = accessLists[selection];
					const manageAccessFormData = new ActionFormData()
						.title("Manage Access")
						.body("What do you want to do with this player?");
					manageAccessFormData.button("Remove from Access\n§o§s[Click Here]", 'textures/ui/permissions_visitor_hand.png');

					manageAccessFormData.show(player).then(({ canceled, selection }) => {
						if (canceled) return;
						switch (selection) {
							case 0:
								if (selectedPlayer === playerName) {
									player.sendMessage("§bYou can't remove yourself!");
									player.playSound('random.break');
								} else if (selectedPlayer === accessLists[0]) {
									player.sendMessage("§nYou can't remove the owner of this area!");
									player.playSound('random.break');
								} else {
									const Accsp = new MessageFormData()
										.title("Are you sure!")
										.body("Do you want to remove this player from the access?")
										.button1("Yes")
										.button2("No");

									Accsp.show(player).then(({ canceled, selection }) => {
										if (selection === 0) {
											protectedAreas.areaWhitelistRemove({
												id: AreaId,
												player: selectedPlayer
											});

											player.sendMessage(`§b${selectedPlayer}§r §eremoved from the area.`);
											player.playSound('random.levelup');
										}
									});
								}
								break;
						}
					});
				});
			}
		});
	}
}

function AdminPanel(player) {
	const allPlayerAreas = protectedAreas.getProtectedAreas();
	const panel = new ActionFormData()
		.title("ADMIN PANEL")
		.body("Choose an option:")
		.button("All AREAS\n§o§s[Click Here]", 'textures/ui/saleribbon.png')
		.button("ClEAR All AREAS\n§o§s[Click Here]", 'textures/ui/icon_trash.png')
		.button("CLOSE\n§o§s[Click Here]", 'textures/ui/redX1.png')

	panel.show(player).then(response => {
		if (response.canceled) return;

		switch (response.selection) {
			case 0:
				if (allPlayerAreas.length === 0) {
					player.sendMessage("There are no protected areas.");
				} else {
					const playerAreas = new ActionFormData()
						.title("All Player's Areas")
						.body(`These are all the player's areas: §e${allPlayerAreas.length} area`);

					for (const playerArea of allPlayerAreas) {
						playerAreas.button(`${playerArea.id}\n§o§s[Click Here]`, 'textures/ui/icon_recipe_nature.png');
					}

					playerAreas.show(player).then(areaResponse => {
						if (areaResponse.canceled) return;
						const areaSelection = areaResponse.selection;

						if (areaSelection !== undefined) {
							const selectedArea = allPlayerAreas[areaSelection];
							const areaOwner = protectedAreas.getAreaWhitelist({ id: selectedArea.id });

							const Details = new ActionFormData()
								.title("Info about this area")
								.body(`Area Owner: §b${areaOwner[0]}§r\nArea From: §aX: ${Math.floor(selectedArea.from.x)} Y: ${Math.floor(selectedArea.from.y)} Z: ${Math.floor(selectedArea.from.z)}\n§rArea To: §aX: ${Math.floor(selectedArea.to.x)} Y: ${Math.floor(selectedArea.to.y)} Z: ${Math.floor(selectedArea.to.z)}\n§rArea Surface: §a${calculateSurfaceArea(Math.floor(selectedArea.from.x), Math.floor(selectedArea.from.y), Math.floor(selectedArea.to.x), Math.floor(selectedArea.to.y))} Block`)
								.button("REMOVE\n§o§s[Click Here]", 'textures/ui/icon_trash.png')
								.button("TELEPORT\n§o§s[Click Here]", 'textures/ui/icon_blackfriday.png');

							Details.show(player).then(Dtselection => {
								if (Dtselection.canceled) return;
								switch (Dtselection.selection) {
									case 0:
										const deletedArea = selectedArea.id;
										protectedAreas.deleteArea({ id: deletedArea });
										player.sendMessage(`the ${deletedArea} has been deleted !`);
										player.playSound('random.levelup');
										break;
									case 1:
										const { x, y, z } = selectedArea.originalcr;
										player.teleport(new Vector3(x, y + 1, z), { dimension: world.getDimension("overworld") });
										break;
									default:
										break;
								}
							});
						}
					});
				}
				break;
			case 1:
				const confirme = new MessageFormData()
					.title("Area you sure?")
					.body("Do you really want to delete all protected areas?")
					.button1("Yes, I want this")
					.button2("No, cancel")
				confirme.show(player).then(Conselection => {
					switch (Conselection.selection) {
						case 0:
							protectedAreas.deleteAllAreas();
							player.sendMessage("§6All the areas has been deleted!")
							break;
						case 1:
							player.sendMessage("§6The operation has been canceled");
							player.playSound('random.pop')
							break;
					}
				});
				break;
			case 2:
				return;
		}
	});
}

function calculateSurfaceArea(x1, y1, x2, y2) {
	const width = Math.abs(x2 - x1);
	const height = Math.abs(y2 - y1);
	const surfaceArea = width * height;
	return surfaceArea;
}

function showRules(player, areaId) {
	const RuleForm = new ModalFormData()
		.title("Rules");

	const rules = protectedAreas.getRules({ id: areaId });

	for (const ruleName in rules) {
		const rule = rules[ruleName];

		switch (rule.type) {
			case "boolean":
				if (rule.value == 'true' || rule.value == 1) rule.value = true;
				else rule.value = false;
				RuleForm.toggle(ruleName, rule.value);
				break;

			case "range":
				RuleForm.slider(ruleName, rule.min, rule.max, rule.value);
				break;

			case "dropdown":
				RuleForm.dropdown(ruleName, rule.values, rule.value);
				break;

			case "text":
				RuleForm.textField(ruleName, rule?.placeholder ?? "", rule.value);
				break;
		}
	}

	RuleForm.show(player)
	.then(({ canceled, formValues }) => {
		if (canceled) return;

		const ruleNames = Object.keys(rules);
		for (const valueIndex in formValues) {
			const ruleValue = formValues[valueIndex];
			const ruleName = ruleNames[valueIndex];

			console.warn(`Rule ${ruleName} has been set to ${ruleValue}`);
			rules[ruleName].value = ruleValue;
		}

		protectedAreas.updateRules({
			id: areaId,
			data: rules
		});
	});
}