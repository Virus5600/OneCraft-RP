// import { world, system, ItemTypes, ItemStack, EnchantmentType } from "@minecraft/server";
// import { Vector } from "./Vector3";
// import { getConfigValue } from "./main";

// let armor_list = [];
// let resistance_data = {};

// let protection = {level: 1, type: new EnchantmentType("protection")};
// for(let item of ItemTypes.getAll()){
//     let itemStack = new ItemStack(item.id);
//     if(itemStack.hasComponent("minecraft:enchantable") && !itemStack.hasTag("minecraft:is_tool")){
//         if(itemStack.getComponent("minecraft:enchantable").canAddEnchantment(protection)) armor_list.push(itemStack);
//     }
// }

// let timeout_tick = true;
// let location;
// let max_y = 0;
// let item_scan_id = system.runInterval(()=>{
// 	for(let playerData of world.getPlayers()){
//         if(location != undefined){
//             let dimension = playerData.dimension;
//             if(timeout_tick){
//                 system.runTimeout(()=>{
//                     console.warn(JSON.stringify(resistance_data))
//                     system.clearRun(item_scan_id);
//                 }, 8);
//                 timeout_tick = false;

//                 let entity = dimension.spawnEntity("ocrp:resistance_dummy", location);
//                 entity.applyKnockback(0, 0, 0, 1);
//                 system.runTimeout(()=>{
//                     max_y = entity.getVelocity().y;
//                     console.warn("Y Max: " + max_y)
//                     entity.remove();
//                 }, 1)
//             }
//             for(let item of armor_list){
//                 let entity = dimension.spawnEntity("ocrp:resistance_dummy", location);
//                 entity.runCommand("replaceitem entity @s slot.armor.head 0 " + item.typeId);
//                 entity.applyKnockback(0, 0, 0, 1);
//                 system.runTimeout(()=>{
//                     let value = Math.max(0, 1-entity.getVelocity().y);
//                     // console.warn(item.typeId + " = " + value);

//                     if(resistance_data[item.typeId] == undefined){
//                         resistance_data[item.typeId] = value;
//                     }else{
//                         resistance_data[item.typeId] = resistance_data[item.typeId] * 0.25 + value * 0.75;
//                     }
//                     entity.remove();
//                 }, 1)
//             }
//         }else{
//             if(playerData.isOnGround){
//                 location = playerData.location;
//             }else{
//                 let block = playerData.dimension.getBlockFromRay(playerData.location, { x: 0, y: -1, z: 0}, { maxDistance: 16 });
//                 if(block != undefined){
//                     location = Vector.add(block.block.location, block.faceLocation);
//                 }
//             }
//         }
//     }
// });

export function getResistanceValue(source) {
	// let equip = source.getComponent("minecraft:equippable");

	// let armor = [];
	// armor[0] = equip.getEquipment("Head");
	// armor[1] = equip.getEquipment("Chest");
	// armor[2] = equip.getEquipment("Legs");
	// armor[3] = equip.getEquipment("Feet");
	// let value = 0;

	// for(let item of armor){
	//     if(item == undefined) continue;
	//     if(resistance_data[item.typeId] != undefined){
	//         value += resistance_data[item.typeId];
	//     }
	// }
	// value *= max_y;
	// value *= getConfigValue("ocrp:movement_fix") * 0.8;
	// value = Math.min(value, 0.999);
	// return value;

	return 0;
}