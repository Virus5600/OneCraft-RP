import { world, system, ItemStack } from "@minecraft/server";
import { Vector } from "./Vector3";
import { isUsingRope } from "./trip_wire_with_rope";
import { Config } from "./config/config";
import { getResistanceValue } from "./resistance_modifier";

import "./grappling_hook";
import "./elevator_pad";
import "./glider";

let configuration = new Config("rns", "Roll and Stamina");

configuration.addComponent([
	{
		"name": "Enable Stamina",
		"identifier": "rns:stamina",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Speed Up When Sprinting",
		"identifier": "rns:speedup",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Stamina Exhausted Duration",
		"identifier": "rns:stamina_exhausted",
		"type": "dropdown",
		"option": [
			"Slow",
			"Normal",
			"Fast",
			"Light"
		],
		"value": 1
	},
	{
		"name": "Stamina Cooldown Duration",
		"identifier": "rns:stamina_cooldown",
		"type": "dropdown",
		"option": [
			"Slow",
			"Normal",
			"Fast",
			"Light"
		],
		"value": 1
	},
	{
		"name": "Stamina Strength",
		"identifier": "rns:stamina_strength",
		"type": "slider",
		"range": [ 1, 2048 ],
		"value_step": 1,
		"value": 512
	},
	{
		"name": "Enable Roll",
		"identifier": "rns:roll",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Immune After Rolling",
		"identifier": "rns:immune_roll",
		"type": "toggle",
		"value": false
	},
	{
		"name": "Allow Mid-air Roll",
		"identifier": "rns:mid_air_roll",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Roll Cooldown Duration",
		"identifier": "rns:roll_cooldown",
		"type": "dropdown",
		"option": [
			"Slow",
			"Normal",
			"Fast",
			"Light"
		],
		"value": 1
	},
	{
		"name": "Vertical Roll Strength",
		"identifier": "rns:roll_vertical_strength",
		"type": "slider",
		"range": [ 0, 40 ],
		"value_step": 1,
		"value": 10
	},
	{
		"name": "Horizontal Roll Strength",
		"identifier": "rns:roll_horizontal_strength",
		"type": "slider",
		"range": [ 0, 40 ],
		"value_step": 1,
		"value": 10
	},
	{
		"name": "Enable Fatigue",
		"identifier": "rns:fatigue",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Enable Edge Climb",
		"identifier": "rns:edge_climb",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Allow Edge Climb Pass Fence and Wall",
		"identifier": "rns:edge_climb_fence_gate",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Aim Assist Grappling Hook",
		"identifier": "rns:aim_hook",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Using Grappling Hook Affects Stamina",
		"identifier": "rns:affect_hook",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Using Rope Affects Stamina",
		"identifier": "rns:affect_rope",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Using Glider Affects Stamina",
		"identifier": "rns:affect_glider",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Slow When Damaged",
		"identifier": "rns:slow_damage",
		"type": "toggle",
		"value": true
	},
	{
		"name": "Armor Movement Fix",
		"identifier": "rns:movement_fix",
		"type": "slider",
		"range": [ 0, 2 ],
		"value_step": 1,
		"value": 1
	},
	{
		"name": "\n ---------- UI Settings ----------\n\nStamina UI Style",
		"identifier": "rns:stamina_style",
		"type": "dropdown",
		"option": [
			"Hide",
			"Default",
			"Zelda",
			"Right Bar"
		],
		"value": 1
	},
	{
		"name": "Roll UI Style",
		"identifier": "rns:roll_style",
		"type": "dropdown",
		"option": [
			"Hide",
			"Default",
			"Dungeon"
		],
		"value": 1
	},
	{
		"name": "Fatigue UI Style",
		"identifier": "rns:fatigue_style",
		"type": "dropdown",
		"option": [
			"Hide",
			"Default",
			"Emoji"
		],
		"value": 1
	},
	{
		"name": "Grappling Hook UI Style",
		"identifier": "rns:hook_style",
		"type": "dropdown",
		"option": [
			"Hide",
			"Default",
			"Text",
			"Right Bar"
		],
		"value": 1
	}
])

configuration.send();

export function getConfigValue(value){
	return configuration.getValue(value);
}

// let refresh_ui = true;

// system.afterEvents.scriptEventReceive.subscribe( s => {
// 	refresh_ui = true;
// }, { namespaces: [ "config_loaded" ]});

// world.afterEvents.worldInitialize.subscribe( s => {
// 	let data = new DynamicPropertiesDefinition();
// 	data.defineNumber("rns:fatigue", 0);

// 	s.propertyRegistry.registerEntityTypeDynamicProperties(data, EntityTypes.get("minecraft:player"));
// });

let playerHurt = [];
let playerInBed =  {};
let rollCooldown = [];
let rollTime = [];
let staminaDuration = [];
let stamina_is_cooldown = [];
let player_on_ground = [];
var fatigue_data = world.scoreboard.getObjective("rns:fatigue");
if(fatigue_data == undefined){
	fatigue_data = world.scoreboard.addObjective("rns:fatigue", "fatigue");
}

let manuver = {};

const Fences = [ 
	"minecraft:acacia_fence", 
	"minecraft:birch_fence", 
	"minecraft:bamboo_fence", 
	"minecraft:cherry_fence", 
	"minecraft:crimson_fence", 
	"minecraft:dark_oak_fence", 
	"minecraft:jungle_fence", 
	"minecraft:mangrove_fence", 
	"minecraft:nether_brick_fence", 
	"minecraft:oak_fence", 
	"minecraft:spruce_fence", 
	"minecraft:warped_fence"
]

let current_player_speed = {};
let time_buffer = world.getAbsoluteTime();

var roll_path = [
	"",
	"textures/ui/roll/default/cooldown_",
	"textures/ui/roll/dungeon/cooldown_"
]

var stamina_path = [
	"",
	"textures/ui/stamina/default/bar_",
	"textures/ui/stamina/zelda/bar_"
]
var edge_climb_path = [
	"textures/ui/edge_climb/bar_0",
	"textures/ui/edge_climb/bar_1",
	"textures/ui/edge_climb/bar_2",
	"textures/ui/edge_climb/bar_3",
	"textures/ui/edge_climb/bar_4",
	"textures/ui/edge_climb/bar_5",
	"textures/ui/edge_climb/bar_6",
	"textures/ui/edge_climb/bar_7",
	"textures/ui/edge_climb/bar_8",
	"textures/ui/edge_climb/bar_9",
	"textures/ui/edge_climb/bar_10",
	"textures/ui/edge_climb/bar_11",
	"textures/ui/edge_climb/bar_12",
	"textures/ui/edge_climb/bar_13",
	"textures/ui/edge_climb/bar_14",
	"textures/ui/edge_climb/bar_15",
	"textures/ui/edge_climb/bar_16"
]

let edge_climb_duration = {};
var edge_climb_motion = [
	[ 0, 0.5 ],
	[ 0, 0.6 ],
	[ 0.1, 0.5 ],
	[ 0.2, 0.3 ],
	[ 0.6, 0.1 ],
	[ 0.3, 0.0 ],
	[ 0.0, -0.1 ],
	[ 0, -0.1 ],
	[ 0, 0 ]
]

export function getStamina(source){
	if(configuration.getValue("rns:stamina")){
		return staminaDuration[source.id];
	}else{
		return 0;
	}
}

export function getMaxStamina(source){
	return configuration.getValue("rns:stamina_strength");
}

export function isStaminaCooldown(source){
	return stamina_is_cooldown[source.id];
}

export function addStamina(source, value, amplifier = 0){
	if(source.getGameMode() == "creative" || staminaDuration[source.id] == undefined) return;
	staminaDuration[source.id] = Math.max(0, Math.min(configuration.getValue("rns:stamina_strength") + 1, staminaDuration[source.id] + value * ( 1 + configuration.getValue("rns:stamina_exhausted") * amplifier)));
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

let ui_data = {};

world.afterEvents.entityDie.subscribe(s=>{
	staminaDuration[s.deadEntity.id] = 0;
}, {entityTypes: [ "minecraft:player" ]})

system.runInterval(() => {
	let stamina_strength = configuration.getValue("rns:stamina_strength");
	let stamina_exhausted = configuration.getValue("rns:stamina_exhausted")*0.5+0.5;
	let stamina_cooldown = configuration.getValue("rns:stamina_cooldown")*0.5+0.5;
	
	let stamina_style = configuration.getValue("rns:stamina_style");
	let roll_style = configuration.getValue("rns:roll_style");
	let time = system.currentTick;
	for(let playerData of world.getPlayers()){
		// if(refresh_ui == true){
		// 	if(roll_style > 0){
		// 		if(rollCooldown[playerData.id] == undefined){
		// 			setUI(playerData, roll_path[roll_style] + 15, "roll_update");
		// 		}else{
		// 			let cooldown_delta = time - rollCooldown[playerData.id];
		// 			cooldown_delta = parseInt(cooldown_delta/6);
		// 			if(cooldown_delta <= 15){
		// 				setUI(playerData, roll_path[roll_style] + cooldown_delta, "roll_update");
		// 			}else{
		// 				setUI(playerData, roll_path[roll_style] + 15, "roll_update");
		// 			}
		// 		}
		// 	}else{
		// 		setUI(playerData, "", "roll_update");
		// 	}
			
			
		// 	if(stamina_style > 0){
		// 		if(staminaDuration[playerData.id] != undefined){
		// 			let cooldown_delta = (staminaDuration[playerData.id])/stamina_strength;
		// 			cooldown_delta = 100-parseInt(Math.min(cooldown_delta, 1)*100);
		// 			setUI(playerData, stamina_path[stamina_style]  + cooldown_delta, "stamina_update");
		// 		}else{
		// 			setUI(playerData, stamina_path[stamina_style]  + 100, "stamina_update");
		// 		}
		// 	}else{
		// 		setUI(playerData, "", "stamina_update");
		// 	}
		// 	setUI(playerData, "", "edge_climb_update");
		// 	if(!configuration.getValue("rns:fatigue")) setUI(playerData, "", "fatigue_update");
		// }

		if(ui_data[playerData.id] == undefined) ui_data[playerData.id] = {
			stamina: 0,
			roll: 15,
			fatigue: 0,
			climb: 0
		}

		//fatigue MAX 2048
		
		let fatigue = undefined;
		try{
			fatigue = fatigue_data.getScore(playerData);
		}catch(err){
			console.warn(playerData.name + " has no fatigue data, creating new data")
		}
		
		if(fatigue == undefined){
			fatigue_data.addScore(playerData, 0);
			fatigue = 0;
		}

		let multiplier_stamina = 1;
		// let blink_time = 4 - Math.max((fatigue / 512) - 4, 0);
		// console.warn(fatigue)
		// console.warn(blink_time * 300)

		// if(time % (300 * Number(blink_time)) == 0)playerData.camera.fade({fadeColor: {red: 0, green: 0, blue: 0}, fadeTime: {fadeInTime: 0.2, holdTime: 0.1, fadeOutTime: 0.4 }});

		if(configuration.getValue("rns:edge_climb") && !playerData.isInWater){
			if(manuver[playerData.id] == undefined){
				manuver[playerData.id] = 0;
				edge_climb_duration[playerData.id] = 17;
			}
			if(manuver[playerData.id] > 0 && playerData.isOnGround) manuver[playerData.id] = 0;

			if(manuver[playerData.id] != 2 && !playerData.isOnGround) manuver[playerData.id] = playerData.isJumping ? 1 : 0;
			// console.warn(manuver[playerData.id])
			
			if(manuver[playerData.id] > 0 && edge_climb_duration[playerData.id] == 17){
				let rot = playerData.getRotation();
				let rot_y = rot.y / 180 * Math.PI;
				let dir = {
					x: -Math.sin(rot_y) * 0.5,
					y: 0,
					z: Math.cos(rot_y) * 0.5
				}
				let loc = playerData.getHeadLocation();
				let y_head = loc.y;
				loc.y += 2;
				loc = Vector.add(loc, dir);
				let block = playerData.getBlockFromViewDirection({includePassableBlocks: false, maxDistance: 1});
				let below_block = playerData.dimension.getBlockFromRay(loc, {x: 0, y: -1, z: 0}, {includePassableBlocks: false, maxDistance: 4});
				
				if(block == undefined && below_block != undefined){
					let can_climb = Math.abs((below_block.block.location.y + below_block.faceLocation.y) - (loc.y - 2)) < 0.5;
					let is_blocked = false;
					if(configuration.getValue("rns:edge_climb_fence_gate") && !can_climb){
						is_blocked = Fences.includes(below_block.block.typeId);
						if(!is_blocked){
							let states_key = Object.keys(below_block.block.permutation.getAllStates());
							for(let state of states_key){
								if(state.includes("wall_connection")){
									is_blocked = true;
									break;
								}
							}
						}
					}
					let distance = (y_head - (below_block.block.location.y + below_block.faceLocation.y));
					if(can_climb || (is_blocked && distance < 2.0 && distance > 0.0)){
						edge_climb_duration[playerData.id] = 0;
						let i = 0;
						let stop_cast = time + 20;
						if(configuration.getValue("rns:stamina")) staminaDuration[playerData.id] += 10*stamina_exhausted;
						playerData.playAnimation("animation.humanoid.edge_climb", {
							controller: "climb_controller"
						});
						playerData.dimension.spawnParticle("rns:move_smoke", playerData.location);

						let runId = system.runInterval(()=>{
							dir = Vector.divide(dir, 1 - getResistanceValue(playerData))
							playerData.applyKnockback(dir.x, dir.z, edge_climb_motion[i][0], edge_climb_motion[i][1]);
							playerData.addEffect("slow_falling", 1, {amplifier: 64, showParticles: false})
							if((playerData.location.y + 1) > (below_block.block.location.y + below_block.faceLocation.y)) i++;
							if(i > 8 || system.currentTick > stop_cast){
								system.clearRun(runId);
								let cooldownId = system.runInterval(()=>{
									ui_data[playerData.id].climb = edge_climb_duration[playerData.id];
									edge_climb_duration[playerData.id] = edge_climb_duration[playerData.id] + 1;
									if(edge_climb_duration[playerData.id] == 17){
										system.clearRun(cooldownId);
										ui_data[playerData.id].climb = 0;
									}
								});
							}
						});
					}
				}
			}
		}

		let is_creative = (playerData.getGameMode() == "creative");
		if(!playerInBed[playerData.id]){
			playerInBed[playerData.id] = playerData.isSleeping;
		}else{
			if(playerData.isSleeping == true){
				system.runTimeout(()=>{
					playerInBed[playerData.id] = false;
				}, 2);
			}
		}

		if(world.getAbsoluteTime() - time_buffer > 1 && playerInBed[playerData.id]){
			staminaDuration[playerData.id] = 0;
		}



		if(!is_creative && configuration.getValue("rns:fatigue")){
			if(world.getAbsoluteTime() - time_buffer > 1 && playerInBed[playerData.id]){
				// playerData.setDynamicProperty("rns:fatigue", fatigue - (world.getAbsoluteTime() - time_buffer) / 200);
				fatigue -= (world.getAbsoluteTime() - time_buffer) / 4;
				fatigue = Math.max(fatigue, 0);
				fatigue_data.setScore(playerData, fatigue);
				playerData.removeEffect("mining_fatigue");
				playerData.removeEffect("weakness");
			}

			if(fatigue/128 < 17){
				// playerData.setDynamicProperty("rns:fatigue", fatigue + 0.0005);
				fatigue += 1 / 2;
			}
			if(fatigue < 0){
				// playerData.setDynamicProperty("rns:fatigue", 0.0);
				fatigue = 0;
			} 
			
			if((time_buffer % 400 == 0 || (fatigue * 10) % 10 > 9.99)){
				ui_data[playerData.id].fatigue = Math.min(Math.round(fatigue/128), 16);
			}
			if(fatigue/128 > 14 && playerData.getEffect("weakness") == undefined) playerData.addEffect("weakness", 600, {amplifier: parseInt(fatigue/128 - 14)});
			if(playerData.getEffect("mining_fatigue") == undefined){
				if(fatigue/128 > 12) playerData.addEffect("mining_fatigue", 600, {amplifier: parseInt(fatigue/128 - 12)});
				
			}else{
				// playerData.setDynamicProperty("rns:fatigue", fatigue + 0.001);
				fatigue += 2 / 2;
			}
			
			multiplier_stamina = Math.max((fatigue/128 - 8) / 4 , 0) + 1;
		}
		
		let is_riding = false;
		for(let ride of playerData.dimension.getEntities({ location: playerData.location, excludeTypes: ["minecraft:player"], maxDistance: 2})){
			if(ride.hasComponent("minecraft:rideable")){
				is_riding = true;
				break;
			}
		}
		
		let vel = playerData.getVelocity();
		// let player_speed = playerData.getComponent("minecraft:movement");
		let vel_calc = Math.sqrt(Math.pow(vel.x, 2) + Math.pow(vel.z, 2));
		let is_sprint = playerData.isSprinting;
		let stamina_amplification = 1;

		if(playerData.isInWater) player_on_ground[playerData.id] = false;
		if(!player_on_ground[playerData.id] && playerData.isOnGround){
			player_on_ground[playerData.id] = true;
		}

		if(configuration.getValue("rns:stamina")){
			let get_hunger = playerData.getEffect("hunger");
			let get_speed = playerData.getEffect("speed");

			// if(configuration.getValue("rns:speedup") && current_player_speed[playerData.id] != undefined && is_sprint){
			// 	if(staminaDuration[playerData.id] < stamina_strength / 2.0){
			// 		player_speed.setCurrentValue(current_player_speed[playerData.id] * ((1.75 - Math.min(staminaDuration[playerData.id] / stamina_strength * 2.0, 1.0) * 0.5)));
			// 	}
			// }else{
			// 	current_player_speed[playerData.id] = player_speed.currentValue;
			// }
			
			if(get_hunger != undefined){
				stamina_amplification += get_hunger.amplifier / 2;
			}
			if(get_speed != undefined){
				stamina_amplification /= 1 + get_speed.amplifier / 4;
			}
			if(staminaDuration[playerData.id] == undefined) staminaDuration[playerData.id] = 0;
			if(!is_creative){
				let use_stamina = false;
				
				if(playerData.isSwimming){
					if(stamina_is_cooldown[playerData.id]){
						playerData.applyKnockback(0, 0, 0, 0);
					}else{
						staminaDuration[playerData.id] += 0.5*stamina_exhausted*stamina_amplification * multiplier_stamina;
						if(configuration.getValue("rns:fatigue")){
							// playerData.setDynamicProperty("rns:fatigue", fatigue + 0.0005);
							fatigue += 1 / 2;
						}
						use_stamina = true;
					}
				}else{
					if(!stamina_is_cooldown[playerData.id] && player_on_ground[playerData.id] && playerData.isJumping && !playerData.isSneaking && !playerData.getEffect("jump_boost") && !is_riding){
						player_on_ground[playerData.id] = false;
						staminaDuration[playerData.id] += 10*stamina_exhausted*stamina_amplification * multiplier_stamina;
						if(configuration.getValue("rns:fatigue")){
							// playerData.setDynamicProperty("rns:fatigue", fatigue + 0.005);
							fatigue += 5 / 2;
						}
						use_stamina = true;
					}
					
					if(is_sprint && !is_riding && playerData.isOnGround && !stamina_is_cooldown[playerData.id]){
						if(staminaDuration[playerData.id] < stamina_strength && !playerData.isSwimming){
							staminaDuration[playerData.id] += 1.5*stamina_exhausted*stamina_amplification * multiplier_stamina;
							if(configuration.getValue("rns:fatigue")){
								// playerData.setDynamicProperty("rns:fatigue", fatigue + 0.0005);
								fatigue += 1 / 2;
							}
						}
						use_stamina = true;
					}

					if(stamina_is_cooldown[playerData.id] && playerData.isJumping && player_on_ground[playerData.id]) playerData.applyKnockback(0, 0, 0, -0.25);
				}

				if(!use_stamina && staminaDuration[playerData.id] > 0) staminaDuration[playerData.id] -= ((playerData.isSneaking) ? 1 : 0.5)*stamina_cooldown / multiplier_stamina; 
				
				if(staminaDuration[playerData.id] >= stamina_strength){
					staminaDuration[playerData.id] = stamina_strength;
					// let speed_value = player_speed.defaultValue;
					// let speed_decreased = speed_value/1.5;
					let duration = stamina_strength / 5;
					let runLoop = system.runInterval(() => {
						try{
							if(duration < 0){
								// player_speed.setCurrentValue(speed_value);
								stamina_is_cooldown[playerData.id] = false;
								system.clearRun(runLoop);
							}else{
								// player_speed.setCurrentValue(speed_decreased);
								stamina_is_cooldown[playerData.id] = true;
								staminaDuration[playerData.id] = staminaDuration[playerData.id] - 0.5;
							}
							duration--;
						}catch(err){
							system.clearRun(runLoop);
						}
					});
				}
				if(staminaDuration[playerData.id] >= 0){
					let cooldown_delta = (staminaDuration[playerData.id])/stamina_strength;
					cooldown_delta = 100-parseInt(Math.min(cooldown_delta, 1)*100);
					if(stamina_style != 0) ui_data[playerData.id].stamina = cooldown_delta;
				}
				
				if(time % 40 == 0){
					fatigue = Math.ceil(fatigue);
					fatigue_data.setScore(playerData, Math.min(fatigue, 2048));
				}
			}
		}
		if(!configuration.getValue("rns:roll")) continue;
		
		if(rollCooldown[playerData.id] != -1 && rollCooldown[playerData.id] != undefined){
			let cooldown_delta = time - rollCooldown[playerData.id];
			cooldown_delta = parseInt(cooldown_delta / 6 / multiplier_stamina * (configuration.getValue("rns:roll_cooldown") + 1));
			if(cooldown_delta <= 15){
				if(roll_style != 0) ui_data[playerData.id].roll = cooldown_delta;
			}else{
				rollCooldown[playerData.id] = -1;
			}
			return;
		}

		if(!configuration.getValue("rns:mid_air_roll") && !playerData.isOnGround) continue;
		
		if(playerData.isInWater || isUsingRope(playerData) || stamina_is_cooldown[playerData.id]) return;
		if(playerData.isSneaking){
			if(rollTime[playerData.id] == -1 || rollTime[playerData.id] == undefined){
				rollTime[playerData.id] = time;
			}
		}else{
			playerData.isSneaking = false;
			if(rollTime[playerData.id] != -1 && rollTime[playerData.id] != undefined){
				if(time - rollTime[playerData.id] < 5){
					if(configuration.getValue("rns:edge_climb")) manuver[playerData.id] = 2;
					let rot = playerData.getRotation();
					let rot_temp = Math.floor((Math.atan2(vel.z, vel.x) * 180 / Math.PI - 90));
					if(rot_temp < -180){
						rot_temp = rot_temp+360;
					}
					let delta_rot = Math.abs(rot_temp - Math.floor((rot.y)))
					delta_rot = Math.min(delta_rot, (360-delta_rot))
					let power = 1;
					let roll_anim = (delta_rot > 120) ? "animation.humanoid.roll_down" : "animation.humanoid.roll_up";
					let roll_anim_def = (delta_rot > 120) ? "animation.humanoid.roll_steady2" : "animation.humanoid.roll_steady";
					let resistance_value = 1 - getResistanceValue(playerData);
					if(Math.abs(vel.x) + Math.abs(vel.z) > 0.01){
						let vel_up = vel_calc*2;
						vel = Vector.divide(vel, resistance_value)
						playerData.applyKnockback(vel.x, vel.z, ((delta_rot > 120) ? 1.5 : 1)*0.2*configuration.getValue("rns:roll_horizontal_strength") / resistance_value, ((delta_rot > 120) ? 0.2 : 0.4)*configuration.getValue("rns:roll_vertical_strength")*0.05 / resistance_value);
					}else{
						rot.y = (rot.y + 45)* Math.PI/180;
						let velocity = {
							"x": (Math.cos(rot.y)-Math.sin(rot.y))*power,
							"y": 0,
							"z": (Math.sin(rot.y)+Math.cos(rot.y))*power,
						};
						velocity = Vector.divide(velocity, resistance_value)
						playerData.applyKnockback(velocity.x, velocity.z, 0.1*configuration.getValue("rns:roll_horizontal_strength") / resistance_value, configuration.getValue("rns:roll_vertical_strength")*0.05 / resistance_value);
						roll_anim = "animation.humanoid.roll_up";
					}
					if(configuration.getValue("rns:immune_roll")) playerData.addEffect("resistance", 10, {amplifier: 16, showParticles: false})
					rollCooldown[playerData.id] = time;
					playerData.playAnimation(roll_anim_def, {
						blendOutTime: 0.3,
						controller: "roll_steady_controller"
					});
					playerData.playAnimation(roll_anim, {
						controller: "roll_controller"
					});
					playerData.playAnimation("animation.humanoid.roll_head", {
						blendOutTime: 1,
						controller: "roll_head_controller"
					});
					playerData.dimension.spawnParticle("rns:move_smoke", playerData.location);

					if(!playerData.getEffect("jump_boost") && configuration.getValue("rns:stamina")){
						staminaDuration[playerData.id] += 10*stamina_exhausted*stamina_amplification * multiplier_stamina;
						if(configuration.getValue("rns:fatigue")){
							// playerData.setDynamicProperty("rns:fatigue", fatigue + 0.005);
							fatigue += 5 / 2;
							fatigue = Math.ceil(fatigue);
							fatigue_data.setScore(playerData, Math.min(fatigue, 2048));
						}
					}
				}
				rollTime[playerData.id] = -1; 
			}
		}
	}
	// if(refresh_ui == true) refresh_ui = false;
	time_buffer = world.getAbsoluteTime();
});

//set ui
system.runInterval(() => {
	for(let playerData of world.getPlayers()){
		let data = ui_data[playerData.id];

		playerData.runCommand("scriptevent ui_load:rns_data_update a" + data.stamina.toString().padStart(3, '0') + configuration.getValue("rns:stamina_style").toString() + data.roll.toString().padStart(2, '0') + configuration.getValue("rns:roll_style").toString() + "rns_data_update");
		playerData.runCommand("scriptevent ui_load:fnr_data_update a" + data.fatigue.toString().padStart(2, '0') + configuration.getValue("rns:fatigue_style").toString() + data.climb.toString().padStart(2, '0') + "10fnr_data_update");
	}
})

world.afterEvents.entityHurt.subscribe( s => {
	if(configuration.getValue("rns:slow_damage")) return;
	let player = s.hurtEntity;
	if(s.damageSource.cause == "magic" || playerHurt[player.id]) return;
	let player_speed = player.getComponent("minecraft:movement");
	let speed_value = player_speed.defaultValue;
	let speed_decreased = speed_value/1.5;
	let runLoop = system.runInterval(() => {
		player_speed.setCurrentValue(speed_decreased);
		playerHurt[player.id] = true;
	});
	let run = system.runInterval(() => {
		system.clearRun(runLoop);
		player_speed.setCurrentValue(speed_value);
		playerHurt[player.id] = false;
		system.clearRun(run);
	}, 30);
}, {entityTypes: [ "minecraft:player" ]});

world.afterEvents.entityHitBlock.subscribe( s => {
	if(configuration.getValue("rns:fatigue")) return;

	// let fatigue = s.damagingEntity.getDynamicProperty("rns:fatigue");
	// s.damagingEntity.setDynamicProperty("rns:fatigue", fatigue + 0.005);
	fatigue_data.addScore(s.damagingEntity, 5 / 2);
}, {entityTypes: [ "minecraft:player" ]});

world.afterEvents.entityHitEntity.subscribe( s => {
	if(configuration.getValue("rns:fatigue")) return;

	// let fatigue = s.damagingEntity.getDynamicProperty("rns:fatigue");
	// s.damagingEntity.setDynamicProperty("rns:fatigue", fatigue + 0.001);
	fatigue_data.addScore(s.damagingEntity, 2 / 2);
}, {entityTypes: [ "minecraft:player" ]});

world.afterEvents.entityDie.subscribe(s=>{
	staminaDuration[s.deadEntity.id] = 0;
	fatigue_data.setScore(s.deadEntity, 0);
}, {entityTypes: [ "minecraft:player" ]});