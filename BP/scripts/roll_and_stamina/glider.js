import { world, system, ItemStack } from "@minecraft/server";
import { Vector } from "./Vector3";
import { addStamina, isStaminaCooldown, getConfigValue } from "./main";
import { getResistanceValue } from "./resistance_modifier";

let is_using_glider = {};
let glider_y_speed = {};
let glider_speed = {};
let glider_direction = {};

world.afterEvents.itemStartUse.subscribe(s => {
	if (s.itemStack.typeId != "ocrp:glider" || s.source.isOnGround || s.source.isInWater) {
		s.source.startItemCooldown("glider", 1);
		return;
	}

	s.source.playAnimation("animation.glider.use", {
		controller: "glider_controller",
		stopExpression: "(query.is_on_ground || query.is_in_water || !query.is_using_item || !query.is_item_name_any('slot.weapon.mainhand', 0, 'ocrp:glider'))",
		blendOutTime: 0
	});
	let durability = s.itemStack.getComponent("minecraft:durability");
	if (durability.damage >= durability.maxDurability) {
		s.source.startItemCooldown("glider", 1);
		return;
	}
	// if(is_using_glider[s.source.id] == undefined){
	is_using_glider[s.source.id] = s.source;
	glider_speed[s.source.id] = 0.01;
	glider_y_speed[s.source.id] = Math.max(0.1, -s.source.getVelocity().y / 5);
	glider_direction[s.source.id] = s.source.getViewDirection();
	s.source.startItemCooldown("glider", 1);
	// }else{
	// 	delete is_using_glider[s.source.id];
	// 	// s.source.playAnimation("animation.glider.use", { 
	// 	// 	controller: "glider_controller",
	// 	// 	stopExpression: "query.is_using_item",
	// 	// 	blendOutTime: 0
	// 	// });
	// }
});

world.afterEvents.itemStopUse.subscribe(s => {
	if (s.itemStack.typeId != "ocrp:glider") return;
	if (is_using_glider[s.source.id] != undefined) {
		delete is_using_glider[s.source.id];

		let item = s.itemStack;
		let durability = item.getComponent("minecraft:durability");
		durability.damage = durability.damage + 1;
		s.source.getComponent("minecraft:equippable").setEquipment("Mainhand", item);
	}
	// if(is_using_glider[s.source.id]) s.source.playAnimation("animation.glider.use", { 
	// 	controller: "glider_controller",
	// 	stopExpression: "(query.is_on_ground || query.is_in_water || query.is_using_item || !query.is_item_name_any('slot.weapon.mainhand', 0, 'ocrp:glider'))",
	// 	blendOutTime: 0
	// });
	// if(is_using_glider[s.source.id]) s.source.playAnimation("animation.glider.item.use", { 
	// 	controller: "glider_item_controller",
	// 	stopExpression: "(query.is_on_ground || query.is_in_water || query.is_using_item || !query.is_item_name_any('slot.weapon.mainhand', 0, 'ocrp:glider'))",
	// 	blendOutTime: 0
	// });
})

system.runInterval(() => {
	let key = Object.keys(is_using_glider);
	for (let id of key) {
		let playerData = is_using_glider[id];
		let item = playerData.getComponent("minecraft:equippable").getEquipment("Mainhand");
		if (playerData.isOnGround || playerData.isInWater || item == undefined || item.typeId != "ocrp:glider" || (getConfigValue("ocrp:affect_glider") && isStaminaCooldown(playerData))) {
			delete is_using_glider[id];
			playerData.startItemCooldown("glider", 20);
			continue;
		}

		let view = playerData.getViewDirection();
		let dist = (1 - Math.min(1.5, Vector.distance(view, glider_direction[id])) / 1.5);
		glider_direction[id] = Vector.multiply(glider_direction[id], 0.9).add(Vector.multiply(view, 0.1));
		let velocity = playerData.getVelocity();
		// console.warn(Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2))
		playerData.applyKnockback(glider_direction[id].x * Math.abs(glider_direction[id].y), glider_direction[id].z * Math.abs(glider_direction[id].y), glider_speed[id], -0.02 - (1 - glider_speed[id]) * glider_y_speed[id]);
		playerData.addEffect("slow_falling", 1, { amplifier: 64, showParticles: false });
		glider_speed[id] = (glider_speed[id] * 0.97 + 0.03) * (0.9 + dist * 0.1);

		if (getConfigValue("ocrp:affect_glider")) addStamina(playerData, 0.75, 0.5);
	}
})
