import { world, system, BlockPermutation, ItemStack } from "@minecraft/server";
import { Vector } from "./Vector3";
import { getResistanceValue } from "./resistance_modifier";
import { isUsingGrapplingHook } from "./grappling_hook";

const ScanOffset = [
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
    { x: 1, y: 0, z: 1 },
    { x: -1, y: 0, z: 1 },
    { x: -1, y: 0, z: -1 },
    { x: 1, y: 0, z: -1 }
]

const ScanChain = {
    x: [
        { x: 2, y: 0, z: 0 },
        { x: -2, y: 0, z: 0 }
    ],
    z: [
        { x: 0, y: 0, z: 2 },
        { x: 0, y: 0, z: -2 }
    ]
}

const ScanEdge = [
    { x: -1.6, y: 0, z: 1.6 },
    { x: -1.6, y: 0, z: -1.6 },
    { x: 1.6, y: 0, z: 1.6 },
    { x: 1.6, y: 0, z: -1.6 }
]

const ScanPower = {
    z: [
        { x: 2, y: 0, z: 1 },
        { x: 2, y: 0, z: 0 },
        { x: 2, y: 0, z: -1 },
        { x: -2, y: 0, z: 1 },
        { x: -2, y: 0, z: 0 },
        { x: -2, y: 0, z: -1 }
    ],
    x: [
        { x: 1, y: 0, z: 2 },
        { x: 0, y: 0, z: 2 },
        { x: -1, y: 0, z: 2 },
        { x: 1, y: 0, z: -2 },
        { x: 0, y: 0, z: -2 },
        { x: -1, y: 0, z: -2 }
    ]
}

const ScanEdgeBLock = [
    { x: 1, y: 0, z: 0 },
    { x: -1, y: 0, z: 0 },
    { x: 0, y: 0, z: 1 },
    { x: 0, y: 0, z: -1 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: -1, z: 0 }
]

const ElevatorItem = new ItemStack("rns:elevator_pad_block", 1);

// const ReplacePad = BlockPermutation.resolve("rns:elevator_pad_block", { "elevator:level": 15 });
const ReplaceAir = BlockPermutation.resolve("minecraft:air");
const AllDimensions = [ world.getDimension("minecraft:overworld"), world.getDimension("minecraft:nether"), world.getDimension("minecraft:the_end")];

var redstone_power_map = {
    tick: 0,
    map: {}
}

function getRedstonePower(block){
	if(block.isAir || block.isLiquid) return undefined;
    if(system.currentTick > redstone_power_map.tick){
        redstone_power_map.tick = system.currentTick + 5;
        redstone_power_map.map = {};
    }
    
    let loc_parent_map = (new Vector(block.location)).toString();

    let power = getRedstoneBlock(block);
    if(power > 0){
        return power;
    }

    ScanEdgeBLock.forEach(offset=>{
        power = Math.max(getRedstoneBlock(block.offset(offset)), power);
    })
    
    redstone_power_map.map[loc_parent_map] = power;
    return power;
}

function getRedstoneBlock(block){
	if(block.isAir || block.isLiquid) return 0;
    let block_map = Vector.toString(block.location);
    if(redstone_power_map.map[block_map] != undefined){
        return redstone_power_map.map[block_map];
    }

	let permutation = block.permutation;
	let states = permutation.getAllStates();
	
	if(states["door:door_hinge_bit"] != undefined || states.door_hinge_bit != undefined){
		return 0;
	}else if(states.redstone_signal != undefined){
		return states.redstone_signal;
	}else if(states.button_pressed_bit){
		return 16;
	}else if(states.lever_direction != undefined && states.open_bit){
		return 16;
	}else if(states.powered_bit){
		return 16;
	}else if(permutation.matches("minecraft:redstone_torch") || permutation.matches("minecraft:redstone_block") || permutation.matches("minecraft:powered_repeater") || permutation.matches("minecraft:powered_comparator")){
		return 16;
	}
	return 0;
}

world.beforeEvents.itemUseOn.subscribe(s=>{
    if(s.itemStack.typeId != "rns:elevator_pad_block") return;
    let has_space = true;
    let block = s.block.above();
    for(let offset of ScanOffset){
        if(!block.offset(offset).isAir){
            has_space = false;
            break;
        }
    }
    if(has_space){
        let rotation = s.source.getRotation().y / 180 * Math.PI;
        system.runTimeout(()=>{
            let can_place = false;
            let s_d = Math.round(Math.sin(rotation));
            let c_d = Math.round(Math.cos(rotation));
            let rot = 0;
            if(s_d == -1){
                rot = 1;
            }else if(s_d == 1){
                rot = 3;
            }
            if(c_d == -1){
                rot = 0;
            }else if(c_d == 1){
                rot = 2;
            }

            if(c_d != 0){
                if(block.east(2).permutation.matches("minecraft:chain", { "pillar_axis": "y" }) && block.west(2).permutation.matches("minecraft:chain", { "pillar_axis": "y" })){
                    can_place = true;
                }
            }
            if(s_d != 0){
                if(block.north(2).permutation.matches("minecraft:chain", { "pillar_axis": "y" }) && block.south(2).permutation.matches("minecraft:chain", { "pillar_axis": "y" })){
                    can_place = true;
                }
            }

            if(can_place){
                let location = block.location;
                location.x += 0.5;
                location.y += 1.125;
                location.z += 0.5;
                let pad = s.source.dimension.spawnEntity("rns:elevator_pad", location);
                pad.setProperty("elevator:rotation", rot);
                pad.setDynamicProperty("direction", 0);
                pad.setDynamicProperty("target_loc", 0);
                
                if(s.source.getGameMode() != "creative"){
                    let equip = s.source.getComponent("minecraft:equippable");
                    let item = equip.getEquipment("Mainhand");
                    if(item.amount > 1){
                        item.amount = item.amount - 1;
                    }else{
                        item = undefined;
                    }
                    equip.setEquipment("Mainhand", item);
                }
            }
        })
    }
    s.cancel = true;
});

world.afterEvents.entityHitEntity.subscribe(s=>{
    if(s.damagingEntity.typeId == "minecraft:player" && s.damagingEntity.isSneaking){
        s.damagingEntity.dimension.spawnItem(ElevatorItem, s.hitEntity.location);
        s.hitEntity.remove();
    }
}, { entityTypes: [ "rns:elevator_pad" ] })

let stabile_entity = {};
system.runInterval(()=>{
    for(let dimension of AllDimensions){
        for(let entity of dimension.getEntities({ type: "rns:elevator_pad" })){
            if(dimension.getBlock(entity.location) == undefined) continue;
            
            if(stabile_entity[entity.id] == undefined) stabile_entity[entity.id] = [];

            let direction = entity.getDynamicProperty("direction");
            let rotation = entity.getProperty("elevator:rotation");
            if(direction != 0){
                let dir = (rotation % 2 == 0) ? "x" : "z";
                for(let i = 0; i < 2; i++){
                    let location = Vector.add(entity.location, ScanChain[dir][i]);
                    if(!dimension.getBlock(location).permutation.matches("minecraft:chain", { "pillar_axis": "y" })){
                        
                        direction = 0;
                        entity.setDynamicProperty("direction", direction);
                        break;
                    }
                    dimension.spawnParticle("rns:elevator_crack", location);
                }
                if(system.currentTick % 10 == 0){
                    dimension.playSound("block.grindstone.use", entity.location, { pitch: 0.5, volume: 1.0 });
                }
                if(system.currentTick % 5 == 0){
                    dimension.playSound("step.copper", entity.location, { pitch: 0.7, volume: 0.3 });
                }
            }
            if(direction == 0){
                entity.clearVelocity();
                try{
                    let dir = (rotation % 2 == 0) ? "x" : "z";
                    let y_target = undefined;
                    let block = dimension.getBlock(entity.location);
                    // for(let i = -1; i < 1; i++){
                    let i = system.currentTick % 2;
                    let chain_0 = block.offset(ScanChain[dir][0]);
                    let chain_1 = block.offset(ScanChain[dir][1]);

                    let scans = [
                        block.offset(ScanPower[dir][0]),
                        block.offset(ScanPower[dir][1]),
                        block.offset(ScanPower[dir][2]),
                        block.offset(ScanPower[dir][3]),
                        block.offset(ScanPower[dir][4]),
                        block.offset(ScanPower[dir][5])
                    ]
                    let iter = 0;
                    while(chain_0.permutation.matches("minecraft:chain", { "pillar_axis": "y" }) && chain_1.permutation.matches("minecraft:chain", { "pillar_axis": "y" })){
                        if(iter >= 3){
                            for(let scan of scans){
                                if(getRedstonePower(scan) > 0){
                                    y_target = scan.location.y;
                                    if(i == 0){
                                        direction = 1;
                                        y_target += 0.75;
                                    }else{
                                        direction = -1;
                                        y_target -= 0.25;
                                    }
                                    entity.setDynamicProperty("direction", direction);
                                    entity.setDynamicProperty("target_loc", y_target);
                                    break;
                                }
                            }
                        }
                        if(y_target != undefined) break;
                        
                        if(i == 0){
                            scans[0] = scans[0].above();
                            scans[1] = scans[1].above();
                            scans[2] = scans[2].above();
                            scans[3] = scans[3].above();
                            scans[4] = scans[4].above();
                            scans[5] = scans[5].above();
    
                            chain_0 = chain_0.above();
                            chain_1 = chain_1.above();
                        }else{
                            scans[0] = scans[0].below();
                            scans[1] = scans[1].below();
                            scans[2] = scans[2].below();
                            scans[3] = scans[3].below();
                            scans[4] = scans[4].below();
                            scans[5] = scans[5].below();
    
                            chain_0 = chain_0.below();
                            chain_1 = chain_1.below();
                        }
                        iter++;
                    }
                    //     if(y_target != undefined) break;
                    // }
                }catch(err){}
            }else if(direction == 1){
                let location = entity.location;
                location.y += 0.1;
    
                stabile_entity[entity.id] = [];
                // if(entity.tryTeleport(location, { checkForBlocks: true })) entity.teleport(location);
                entity.clearVelocity();
                if(entity.tryTeleport(location, { checkForBlocks: true }) && location.y < entity.getDynamicProperty("target_loc")){
                    entity.applyImpulse({ x: 0, y: 0.1, z: 0 });
                }else{
                    direction = 0;
                    entity.setDynamicProperty("direction", direction);
                }
            }else if(direction == -1){
                let location = entity.location;
                location.y -= 0.1;
    
                stabile_entity[entity.id] = [];
                // if(entity.tryTeleport(location, { checkForBlocks: true })) entity.teleport(location);

                entity.clearVelocity();
                if(entity.tryTeleport(location, { checkForBlocks: true }) && location.y > entity.getDynamicProperty("target_loc")){
                    entity.applyImpulse({ x: 0, y: -0.1, z: 0 });
                }else{
                    direction = 0;
                    entity.setDynamicProperty("direction", direction);
                }
            }
            
            entity.addEffect("slow_falling", 1, {amplifier: 64, showParticles: false});
            for(let target of dimension.getEntities({ location: Vector.subtract(entity.location, { x: 1.5, y: 0.8, z: 1.5 }), volume: { x: 2, y: 0.5, z: 2 }})){
                if(target.typeId == "rns:elevator_pad" || target.typeId == "rns:grappling_hook_projectile" || (target.typeId == "minecraft:player" && isUsingGrapplingHook(target, true))){
                    continue;
                }
                let distance = entity.location.y - target.location.y;
                if(distance >= 1.8) continue;
                if(direction == 1){
                    try{
                        if(target.typeId == "minecraft:player"){
                            if(target.isJumping){
                                target.applyKnockback( 0, 0, 0, (0.5 + distance / 2) * (1 + getResistanceValue(target)));
                            }else{
                                target.applyKnockback( 0, 0, 0, (0.101 + distance / 2) * (1 + getResistanceValue(target)));
                            }
                        }else{
                            target.applyKnockback( 0, 0, 0, 0.101 + distance / 2);
                        }
                    }catch(err){
                        target.applyImpulse({ x: 0, y: 0.201, z: 0 });
                    }
                        // console.warn(distance)
                        // let location = target.location;
                        // location.y = entity.location.y + 0.25;
                        // target.teleport(location)
                    
                    // if(target.typeId != "rns:elevator_dummy"){
                    //     if(!target.hasComponent("minecraft:riding")){
                    //         let location = target.location;
                    //         location.y = entity.location.y + 1;
                    //         let seat = dimension.spawnEntity("rns:elevator_dummy", location);
                    //         seat.getComponent("minecraft:rideable").addRider(target);
                    //     }
                    // }else{
                    //     if(target.getComponent("minecraft:rideable").getRiders().length == 0){
                    //         target.remove();
                    //     }else{
                    //         let location = target.location;
                    //         location.y = entity.location.y + 0.5;
                    //         target.teleport(location)
                    //     }
                    // }
                }else if(direction == 0){
                    if(!target.isOnGround && distance > 0.0 && !stabile_entity[entity.id].includes(target.id)){
                        if(target.typeId == "minecraft:player"){
                            target.applyKnockback( 0, 0, 0, (0.25 + distance / 2) * (1 + getResistanceValue(target)));
                            // console.warn(distance)
                        }else{
                            target.applyKnockback( 0, 0, 0, (0.25 + distance / 2));
                        }
                    }
                    stabile_entity[entity.id].push(target.id);
                    // if(target.typeId == "rns:elevator_dummy"){
                    //     let location = target.location;
                    //     location.y = entity.location.y + 1;
                    //     target.teleport(location)
                    //     target.remove();
                    // }
                }
                target.addEffect("slow_falling", 1, {amplifier: 64, showParticles: false});
            }
        }
    }
	
})