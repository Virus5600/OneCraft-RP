import { world, system, ItemStack } from "@minecraft/server";
import { Vector } from "./Vector3";
import { addStamina, getConfigValue } from "./main";
import { getResistanceValue } from "./resistance_modifier";

let config = {
	"rns:aim_hook": "true"
};

function getActor(){
	let actor;
	for(let actor_type of world.getDimension("minecraft:overworld").getEntitiesAtBlockLocation({x:0, y:320, z:0})){
		if(actor_type.typeId == "kc:config_loader"){
			actor = actor_type;
			return actor;
		}
	}
	return actor;
}

const AIM_ITERATION = 40;

let ui_data = {};

function getConfigFromActor(){
	let l = {};
	let actor = getActor();
	if(actor == undefined) return {};
	for(let a of actor.getTags()){
		let b = a.split("=");
		l[b[0]] = b[1];
	}
	return l;
}

system.afterEvents.scriptEventReceive.subscribe( s => {
	config = getConfigFromActor();
}, { namespaces: [ "config_loaded" ]});

let grappling_hook = {};
let grappling_hook_entity = [];
let use_grappling_hook = {};
let grappling_hook_charge = {};
const AllDimensions = [ world.getDimension("minecraft:overworld"), world.getDimension("minecraft:nether"), world.getDimension("minecraft:the_end")];
let hook_projectile_temp = [];

export function isUsingGrapplingHook(source, scan_connect = false){
	if(scan_connect){
		return grappling_hook[source.id] != undefined && grappling_hook[source.id].location != undefined;
	}else{
		return grappling_hook[source.id] != undefined;
	}
}

let ui_temp = {};
function setUI(playerData, path, id){
	if(!ui_temp[playerData.id]){
		ui_temp[playerData.id] = { [id]: path };
	}else{
		if(ui_temp[playerData.id][id] == path) return;
	}
//	console.warn(path)
	playerData.runCommandAsync("scriptevent ui_load:" + id + " " + path + id);
	ui_temp[playerData.id][id] = path;
}

world.afterEvents.itemStopUse.subscribe(s => {
	delete use_grappling_hook[s.source.id];
	if(s.itemStack.typeId != "rns:grappling_hook_item" || !grappling_hook[s.source.id]) return;
	grappling_hook[s.source.id].activate = false;
});

world.afterEvents.itemReleaseUse.subscribe(s => {
	delete use_grappling_hook[s.source.id];
	if(s.itemStack.typeId != "rns:grappling_hook_item" || !grappling_hook[s.source.id]) return;
	grappling_hook[s.source.id].activate = false;

	let item_temp = s.itemStack;
	let durability = item_temp.getComponent("minecraft:durability");
	if(durability.damage < durability.maxDurability) durability.damage += 1;

	s.source.getComponent("minecraft:equippable").setEquipment("Mainhand", item_temp);
});

world.afterEvents.itemStartUse.subscribe(s => {
	if(s.itemStack.typeId != "rns:grappling_hook_item") return;
	let dimension = s.source.dimension;
	let rotation = s.source.getRotation();
	let enchantments = s.itemStack.getComponent("minecraft:enchantable");

	// entity.setProperty("hook:x_rot", rotation.x);
	// entity.setProperty("hook:y_rot", rotation.y);
	// entity.setProperty("hook:distance", 0);

	let multishot = false;
	let power = 0;
	if(enchantments.hasEnchantment("piercing")) power = enchantments.getEnchantment("piercing").level;
	if(enchantments.hasEnchantment("multishot")){
		multishot = true;
		power = 1;
	}
	
	grappling_hook_charge[s.source.id] = Math.max(grappling_hook_charge[s.source.id] - 20, 0);
	if(enchantments.hasEnchantment("quick_charge")){
		// setUI(s.source, "textures/ui/grappling_hook/default/" + (enchantments.getEnchantment("quick_charge").level + 1) + "_" + Math.floor(grappling_hook_charge[s.source.id] / 20), "grappling_charge_update");
		ui_data[s.source.id].charge = enchantments.getEnchantment("quick_charge").level + 1;
		ui_data[s.source.id].hook = Math.floor(grappling_hook_charge[s.source.id] / 20);
	}

	s.source.playAnimation("animation.humanoid.grappling_hook.fire", {
		blendOutTime: 0.1,
		controller: "grappling_hook_controller"
	});
	let loc = Vector.add(s.source.getHeadLocation(), s.source.getViewDirection());
	system.runTimeout(()=>{
		dimension.spawnParticle("rns:grappling_hook_smoke", loc);
		s.source.playSound("crossbow.shoot");
	}, 5)
	if(multishot){
		rotation.y -= 20;
		let multi_entity = [];
		let id = {};
		for(let i = 0; i < 2; i++){
			let entity = dimension.spawnEntity("rns:grappling_hook_projectile", loc);
			grappling_hook_entity.push(entity);
			let projectile = entity.getComponent("minecraft:projectile");
			projectile.owner = s.source;
			rotation.y += 40 * i;
			
			let direction = anglesToVector(rotation);
			if(config["rns:aim_hook"] == "true"){
				let head = s.source.getHeadLocation();
				let location = s.source.location;
				let max_iteration = AIM_ITERATION;
				let distance = dimension.getBlockFromRay(head, direction, { includePassableBlocks: false, maxDistance: 72 });
				if(distance){
					distance = Vector.distance(distance.block.location, location);
					max_iteration = 15;
				}else{
					distance = 72;
				}

				let hit = 0;
				let precision = 1;
				for(let j = 0; j < AIM_ITERATION; j++){
					if(hit > 1 || dimension.getEntitiesFromRay(Vector.add(head, Vector.multiply(direction, 3)), direction).length > 0) break;
					let temp_rotation = {
						x: rotation.x + Math.sin(j) * precision * 0.25,
						y: rotation.y + Math.cos(j) * precision,
						z: 0
					}
					let temp_direction = anglesToVector(temp_rotation);
					let new_dist = dimension.getBlockFromRay(head, temp_direction, { includePassableBlocks: false, maxDistance: 72 });
					if(new_dist){
						new_dist = Vector.distance(new_dist.block.location, location);
						if(new_dist < distance){
							distance = new_dist;
							direction = temp_direction;
							rotation = temp_rotation;
							// console.warn("iteration " + j + " from " + i + ": " + precision)
							precision = 0.5;
							max_iteration = j + 15;
							hit++;
						}
					}
					precision += 0.5;
					if(j > max_iteration) break;
				}
			}
			
			projectile.shoot(Vector.multiply(direction, 10), { uncertainty: 0 });
			id[entity.id] = i;
			multi_entity[i] = entity;
		}

		grappling_hook[s.source.id] = {
			activate: true,
			pull_back: false,
			location: undefined,
			projectile: multi_entity,
			tension: 1,
			max_distance: 64,
			start_tick: undefined,
			direction: undefined,
			velocity: undefined,
			multishot: [ 
				{
					location: undefined,
					activate: true,
					pull_back: false,
					attach: {
						entity: undefined,
						add: undefined
					}
				}, 
				{
					location: undefined,
					activate: true,
					pull_back: false,
					attach: {
						entity: undefined,
						add: undefined
					}
				}
			],
			id: id,
			loose_tick: system.currentTick + 200
		}
	}else{
		let entity = dimension.spawnEntity("rns:grappling_hook_projectile", loc);
		grappling_hook_entity.push(entity);
		let projectile = entity.getComponent("minecraft:projectile");
		projectile.owner = s.source;

		let direction = anglesToVector(rotation);
		
		if(config["rns:aim_hook"] == "true"){
			let head = s.source.getHeadLocation();
			let location = s.source.location;
			let max_iteration = AIM_ITERATION;
			let distance = dimension.getBlockFromRay(head, direction, { includePassableBlocks: false, maxDistance: 36 + power * 8 });
			if(distance){
				distance = Vector.distance(distance.block.location, location);
				max_iteration = 10;
			}else{
				distance = 81;
			}
			let hit = 0;
			let precision = 1;
			for(let j = 0; j < AIM_ITERATION; j++){
				if(hit > 1 || dimension.getEntitiesFromRay(Vector.add(head, Vector.multiply(direction, 3)), direction).length > 0) break;
				let temp_rotation = {
					x: rotation.x + Math.sin(j) * precision,
					y: rotation.y + Math.cos(j) * precision,
					z: 0
				}
				let temp_direction = anglesToVector(temp_rotation);
				let new_dist = dimension.getBlockFromRay(head, temp_direction, { includePassableBlocks: false, maxDistance: 81 });
				if(new_dist){
					new_dist = Vector.distance(new_dist.block.location, location);
					if(new_dist < distance){
						distance = new_dist;
						direction = temp_direction;
						rotation = temp_rotation;
						// console.warn("iteration " + j + ": " + precision)
						max_iteration = j + 10;
						precision = 1;
						hit++;
					}
				}
				precision += 0.5;
				if(j > max_iteration) break;
			}
		}
		projectile.shoot(Vector.multiply(direction, 2 + power * 4), { uncertainty: 0 });
		let id = {};
		id[entity.id] = 0;

		grappling_hook[s.source.id] = {
			activate: true,
			pull_back: false,
			location: undefined,
			projectile: [ entity ],
			tension: 1,
			max_distance: 32 + power * 12,
			start_tick: undefined,
			direction: undefined,
			velocity: undefined,
			multishot: [ 
				{
					location: undefined,
					activate: true,
					pull_back: false,
					attach: {
						entity: undefined,
						add: undefined
					}
				}
			],
			id: id,
			loose_tick: system.currentTick + 200
		}
	}
	s.source.startItemCooldown("grappling_hook", 1);
	use_grappling_hook[s.source.id] = true;
});

world.afterEvents.projectileHitEntity.subscribe(s => {
	if(s.projectile.typeId != "rns:grappling_hook_projectile" || !grappling_hook[s.source.id]) return;
	let index = grappling_hook[s.source.id].id[s.projectile.id];
	if(grappling_hook[s.source.id].multishot[index].attach.entity != undefined) return;

	let entity = s.getEntityHit().entity;
	try{
		entity.applyKnockback(0, 0, 0, 0);
	}catch(err){
		return;
	}
	grappling_hook[s.source.id].multishot[index].attach.entity = entity;
	grappling_hook[s.source.id].multishot[index].attach.add = Vector.multiply(Vector.subtract(s.location, entity.location), { x: 0, y: -1, z: 0 });
	grappling_hook[s.source.id].multishot[index].pull_back = true;
});

world.afterEvents.projectileHitBlock.subscribe(s => {
	if(s.projectile.typeId != "rns:grappling_hook_projectile" || !grappling_hook[s.source.id]) return;

	let data = grappling_hook[s.source.id];
	let shoot_data = data.multishot[data.id[s.projectile.id]];
	if(!shoot_data) return;
	shoot_data.location = s.location;
	let multishot_length = 0;
	let average_location = { x: 0, y: 0, z: 0 };
	for(let projectile of data.multishot){
		if(!projectile.location) continue;

		average_location = Vector.add(average_location, projectile.location);
		multishot_length++;
	}

	if(multishot_length == 1){
		grappling_hook[s.source.id].location = s.location;
	}else{
		average_location = Vector.divide(average_location, 2);
		grappling_hook[s.source.id].location = average_location;
	}
	if(!grappling_hook[s.source.id].start_tick) grappling_hook[s.source.id].start_tick = system.currentTick + 5;
	
	s.projectile.getComponent("minecraft:projectile").shoot({ x: 0, y: 0, z: 0 });
	s.projectile.teleport(Vector.add(s.projectile.location, Vector.multiply(s.hitVector, -0.01)));
});

function anglesToVector(r) {
	return {
		x: Math.cos(r.x / 180 * Math.PI) * -Math.sin(r.y / 180 * Math.PI),
		y: -Math.sin(r.x / 180 * Math.PI),
		z: Math.cos(r.x / 180 * Math.PI) * Math.cos(r.y / 180 * Math.PI)
	};
}

function getTargetDegree(anchor, target) {
	let total = Vector.subtract(target, anchor);
	let y_rot = Math.atan2(total.z, total.x) * (180 / Math.PI) + 90;
	if(y_rot > 180) y_rot = y_rot - 360;
    
    return { 
		x: Math.atan2(total.y, Math.sqrt(total.x ** 2 + total.z ** 2)) * (180 / Math.PI),
		y: y_rot
	};
}

system.runInterval(()=>{
    for(let dimension of AllDimensions){
        for(let entity of dimension.getEntities({type: "rns:grappling_hook_projectile"})){
            let projectile = entity.getComponent("minecraft:projectile");
			if(!projectile.owner || !projectile.owner.isValid() || !use_grappling_hook[projectile.owner.id]) entity.remove();
        }
    }

	for(let playerData of world.getPlayers()){
		if(ui_data[playerData.id] == undefined){
			ui_data[playerData.id] = {
				hook: 0,
				charge: 0,
				display: 0
			}
		}else{
			playerData.runCommand("scriptevent ui_load:hook_data_update a" + ui_data[playerData.id].hook.toString() + ui_data[playerData.id].charge.toString() + getConfigValue("rns:hook_style").toString() + ui_data[playerData.id].display.toString() + "hook_data_update")
		}
		let player_container = playerData.getComponent("minecraft:inventory");
		let container = player_container.container;
		for(let i = 0; i < player_container.inventorySize; i++){
			let item = container.getItem(i);
			if(!item || (item.typeId != "rns:broken_grappling_hook_item" && item.typeId != "rns:grappling_hook_item")) continue;
			let durability = item.getComponent("minecraft:durability").damage;
			let transform_item = "";
			if(item.typeId == "rns:broken_grappling_hook_item"){
				transform_item = "rns:grappling_hook_item";
				if(durability == 128) continue;
			}else if(item.typeId == "rns:grappling_hook_item"){
				transform_item = "rns:broken_grappling_hook_item";
				if(durability < 128) continue;
			}
			

			let enchantments = item.getComponent("minecraft:enchantable").getEnchantments();
			let item_temp = new ItemStack(transform_item);
			item_temp.nameTag = item.nameTag;
			item_temp.keepOnDeath = item.keepOnDeath;
			item_temp.lockMode = item.lockMode;
			item_temp.setLore(item.getLore());
			item_temp.setCanPlaceOn(item.getCanPlaceOn());
			item_temp.setCanDestroy(item.getCanDestroy());
			for(let property_id of item.getDynamicPropertyIds()){
				item_temp.setDynamicProperty(property_id, item.getDynamicProperty(property_id));
			}
			item_temp.getComponent("minecraft:durability").damage = durability;
			item_temp.getComponent("minecraft:enchantable").addEnchantments(enchantments);
			// console.warn("tansfor to = " + transform_item)

			container.setItem(i, item_temp);
		}
		if(grappling_hook_charge[playerData.id] == undefined) grappling_hook_charge[playerData.id] = 0;
			// console.warn(Math.floor(grappling_hook_charge[playerData.id] / 20))
			// console.warn(grappling_hook_charge[playerData.id] / 20)
		// console.warn(JSON.stringify(use_grappling_hook))
		// console.warn(grappling_hook_entity.length)

		for(let hook of grappling_hook_entity){
			if(!hook.isValid()){
				grappling_hook_entity.pop(hook);
				continue;
			}
			let projectile = hook.getComponent("minecraft:projectile");
			if(!projectile.owner.isValid() || !use_grappling_hook[projectile.owner.id]){
				grappling_hook_entity.pop(hook);
				hook.remove();
			}
		}

		if(!grappling_hook[playerData.id]){
			let item = playerData.getComponent("minecraft:equippable").getEquipment("Mainhand");
			let max = 20;
			if(item != undefined && item.typeId == "rns:grappling_hook_item" && item.getComponent("minecraft:enchantable").hasEnchantment("quick_charge")){
				max = 20 + item.getComponent("minecraft:enchantable").getEnchantment("quick_charge").level * 20;
				
				// setUI(playerData, "textures/ui/grappling_hook/default/" + (item.getComponent("minecraft:enchantable").getEnchantment("quick_charge").level + 1) + "_" + Math.floor(grappling_hook_charge[playerData.id] / 20), "grappling_charge_update");
				ui_data[playerData.id].charge = item.getComponent("minecraft:enchantable").getEnchantment("quick_charge").level + 1;
				ui_data[playerData.id].hook = Math.floor(grappling_hook_charge[playerData.id] / 20);
			}else{
				// setUI(playerData, "", "grappling_charge_update");
				ui_data[playerData.id].charge = 0;
			}

			if(item != undefined && item.typeId == "rns:grappling_hook_item"){
				if(item.getComponent("minecraft:enchantable").hasEnchantment("multishot")){
					// setUI(playerData, "multi", "crosshair_grappling_update");
					ui_data[playerData.id].display = 2;
				}else{
					// setUI(playerData, "single", "crosshair_grappling_update");
					ui_data[playerData.id].display = 1;
				}
				try{
					playerData.runCommand("hud @s hide crosshair");
				}catch(err){}
			}else{
				try{
					playerData.runCommand("hud @s reset crosshair");
				}catch(err){}
				// setUI(playerData, "", "crosshair_grappling_update")
				ui_data[playerData.id].display = 0;
			}

			grappling_hook_charge[playerData.id] = Math.max(Math.min(grappling_hook_charge[playerData.id] + 0.5, max), 0);

			continue;
		}
		let data = grappling_hook[playerData.id];
		let location_0 = Vector.add(playerData.getHeadLocation(), playerData.getViewDirection());
		let activate = data.activate;
        let dimension = playerData.dimension;

		let all_back = true;

		for(let i = 0; i < data.multishot.length; i++){
			if(data.projectile[i].isValid() && !data.multishot[i].activate){
				data.projectile[i].remove();
			}
			all_back = all_back && !data.multishot[i].activate;
		}
		// console.warn(JSON.stringify(data))
		
		if(!activate || all_back){
			if(!activate && data.velocity && system.currentTick < data.loose_tick){
				let velocity = Vector.multiply(Vector.divide(data.velocity, Vector.getLength(data.velocity) / 3), data.tension);
				velocity = Vector.divide(velocity, 1 - getResistanceValue(playerData))
				playerData.applyKnockback(velocity.x, velocity.z, Math.sqrt(velocity.x ** 2 + velocity.z ** 2) * 0.5, velocity.y * 0.5);
			}
			for(let projectile of data.projectile){
				if(projectile.isValid()) projectile.remove();
			}
			delete grappling_hook[playerData.id];
			
			playerData.playAnimation("animation.humanoid.grappling_hook.cooldown", {
				blendOutTime: 0.1,
				controller: "grappling_hook_controller"
			});
			
			playerData.playAnimation("animation" , {
				blendOutTime: 0.1,
				controller: "grappling_hook_hand_controller"
			});
			if(grappling_hook_charge[playerData.id] >= 20){
				playerData.startItemCooldown("grappling_hook", 1);
			}else{
				playerData.startItemCooldown("grappling_hook", 45);
			}
			continue;
		}
		// playerData.startItemCooldown("grappling_hook", 5);

		for(let projectile of data.projectile){
			let shoot_data = data.multishot[data.id[projectile.id]];
			if(!projectile.isValid()){
				shoot_data.activate = false;
				continue;
			}

			let location_1 = projectile.location;
			let distance = Vector.distance(location_0, location_1);
			let rotation = getTargetDegree(location_1, location_0);

			projectile.setProperty("hook:x_rot", rotation.x);
			projectile.setProperty("hook:y_rot", rotation.y);
	
			if(shoot_data.location == undefined){
                let direction = Vector.subtract(location_0, location_1);
                direction = Vector.divide(direction, distance);
				if(shoot_data.pull_back){
					projectile.getComponent("minecraft:projectile").shoot(direction);
					if(shoot_data.attach.entity && shoot_data.attach.entity.isValid()){
						// if(shoot_data.attach.entity.typeId == "minecraft:player"){
							let attach_direction = Vector.add(location_1, shoot_data.attach.add);
							attach_direction = Vector.subtract(shoot_data.attach.entity.location, attach_direction);
							attach_direction = Vector.divide(attach_direction, -Vector.getLength(attach_direction) / 2);
							shoot_data.attach.entity.applyKnockback(attach_direction.x, attach_direction.z, Math.sqrt(attach_direction.x ** 2 + attach_direction.z ** 2), attach_direction.y);
						// }else{
						// 	let attach_location = Vector.add(location_1, shoot_data.attach.add);
						// 	let floor = dimension.getBlockFromRay(attach_location, { x: 0, y: -1, z: 0 }, {includePassableBlocks: false});
						// 	if(floor){
						// 		let floor_max = shoot_data.attach.entity.location.y;
						// 		let floor_dist = Vector.add(floor.block.location, floor.faceLocation).y;
						// 		if(floor_dist < floor_max){
						// 			attach_location.y = floor_max;
						// 		}
						// 	}
						// 	if(shoot_data.attach.entity.tryTeleport(attach_location)) shoot_data.attach.entity.teleport(attach_location);
						// }
					}
					if(distance < 3 ){
						if(shoot_data.attach.entity && shoot_data.attach.entity.isValid()){
							shoot_data.attach.entity.applyKnockback(0, 0, 0, 0);
						}
						shoot_data.activate = false;
					}
					distance += 1;
				}else{
					if(distance > data.max_distance){
						shoot_data.pull_back = true;
					}else{
						let blocking = dimension.getBlockFromRay(location_0, Vector.multiply(direction, -1), { includePassableBlocks: false, maxDistance: distance - 1});
						if(blocking != undefined){
							shoot_data.pull_back = true;
						}
					}
					distance = Math.max(distance - 10, 0);
				}
	
				projectile.setProperty("hook:distance", distance);
				continue;
			}
			if(shoot_data.pull_back){
				if(shoot_data.location) shoot_data.pull_back = false;
				continue;
			}
	
			projectile.setProperty("hook:distance", distance);
		}

		if(data.location == undefined || data.pull_back || data.projectile.length == 0 || !data.start_tick || system.currentTick < data.start_tick) continue;
		let velocity = playerData.getVelocity();

		let location_1 = data.location;
		let distance = Vector.distance(location_0, location_1);

		let rotation = getTargetDegree(location_1, location_0);

		let direction = Vector.subtract(location_0, location_1);
		
		let velocity_length = Math.min(Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2), 1);
		direction = Vector.divide(direction, -5);
		
		playerData.playAnimation("animation.humanoid.grappling_hook.hand_rotation_" + parseInt(rotation.x) , {
			blendOutTime: 0.3,
			controller: "grappling_hook_hand_controller"
		});
		// if(!data.velocity || velocity_length < 0.3){
		// 	data.velocity = Vector.multiply(direction, 0.7);
		// 	data.momentum = data.momentum * 0.95 + 0.05;
		// }else{
		// 	data.momentum = data.momentum * 0.99;
		// }

		// let vel = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
		// vel *= data.tension / 32;
		// // console.warn(rotation.x)
		
		
		// data.direction = direction;
		// direction = Vector.add(Vector.multiply(direction, 1 - data.momentum), Vector.multiply(data.velocity, data.momentum));
		
		// // let total_velocity = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);
		// // if(data.velocity){
		// // 	direction = Vector.add(direction, data.velocity);
			
		// // 	data.velocity = Vector.multiply(data.velocity, 0.9);
		// // 	if(total_velocity < 0.25) data.velocity = Vector.multiply(data.velocity, 0.7);
		// // }
		// // console.warn(Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2))
		


		// if(distance > 2){
		// 	playerData.applyKnockback(direction.x, direction.z, Math.sqrt(direction.x ** 2 + direction.z ** 2) * (data.power + data.momentum) * 2 * Math.log10(distance), (system.currentTick > data.loose_tick) ? -0.1 : (direction.y * vel * (data.power + data.momentum) * 0.5));
		// 	playerData.addEffect("slow_falling", 1, {amplifier: 64, showParticles: false});
		// }else{
		// 	if(data.tension > 2) data.tension = data.tension - data.power;
		// }
		data.direction = direction;
		if(!data.velocity){
			data.velocity = Vector.add(direction, Vector.multiply(velocity, 2));
			if(getConfigValue("rns:affect_hook") && !playerData.isOnGround) addStamina(playerData, 10, 1);
		}
		if(data.tension > 0.65 && getConfigValue("rns:affect_hook")) addStamina(playerData, 1);
		data.velocity = Vector.add(Vector.multiply(Vector.add(direction, velocity), 1 - velocity_length), Vector.multiply(data.velocity, velocity_length));
		direction = Vector.add(Vector.multiply(direction, 0.5), Vector.multiply(data.velocity, 0.5));
		let direction_head_strength = Math.max(0.0, data.tension * 0.6 - 0.2);
		direction = Vector.add(Vector.multiply(direction, 1 - direction_head_strength), Vector.multiply(playerData.getViewDirection(), direction_head_strength));
		direction = Vector.add(Vector.multiply(direction, data.tension), Vector.multiply({ x: 0, y: -1, z: 0 }, 1 - data.tension));
		// console.warn(direction_head_strength)
		if(!playerData.isOnGround) data.tension = data.tension * 0.996;
		if(distance > 2){
			direction = Vector.divide(direction, 1 - getResistanceValue(playerData))
			playerData.applyKnockback(direction.x, direction.z, Math.sqrt(direction.x ** 2 + direction.z ** 2), direction.y * 0.5);
			playerData.addEffect("slow_falling", 1, {amplifier: 64, showParticles: false});
		}

	}
});