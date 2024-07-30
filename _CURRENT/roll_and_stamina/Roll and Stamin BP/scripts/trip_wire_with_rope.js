import { world, system, ItemStack } from "@minecraft/server";
import { isUsingGrapplingHook } from "./grappling_hook";
import { addStamina, isStaminaCooldown, getConfigValue } from "./main";
import { getResistanceValue } from "./resistance_modifier";

world.afterEvents.itemUse.subscribe(s=>{
    let main_hand_slot = s.source.selectedSlotIndex;
    let player_facing_block_name = s.source.getBlockFromViewDirection({ maxDistance: 10, includePassableBlocks: true });
    if(player_facing_block_name) player_facing_block_name = player_facing_block_name.block;

    if(s.itemStack.typeId != "minecraft:lead" || !player_facing_block_name) return;
    let item_used = false;
    if(player_facing_block_name.typeId == "minecraft:tripwire_hook"){
        let direction;
        switch (player_facing_block_name.permutation.getState("direction")) {
            case 0:
                direction = "south"
                break;
            case 1:
                direction = "west"
                break;
            case 2:
                direction = "north"
                break;
            case 3:
                direction = "east"
                break;
        }
        player_facing_block_name.setType("rns:trip_wire_with_rope");
        let permutation = player_facing_block_name.permutation;
        permutation = permutation.withState("minecraft:cardinal_direction", direction);
        
        player_facing_block_name.setPermutation(permutation);

        let rope_count = 6;
        let rope = player_facing_block_name.below();
        let rope_permutation = undefined;
        while(rope_count >= 0){
            if(!rope.isAir) break;
            let below_rope = rope.below();
            if(rope_count > 0 && !below_rope.isAir){
                rope_count = 0;
            }

            if(rope_permutation == undefined){
                rope.setType("rns:rope");
                rope_permutation = rope.permutation;
                rope_permutation = rope_permutation.withState("rope:connected", rope_count);
                rope.setPermutation(rope_permutation);
            }else{
                rope_permutation = rope_permutation.withState("rope:connected", rope_count);
                rope.setPermutation(rope_permutation);
            }
            rope = below_rope;
            rope_count--;
        }
        item_used = true;
    }else if(player_facing_block_name.typeId == "rns:rope" || player_facing_block_name.typeId == "rns:trip_wire_with_rope"){
        let rope = player_facing_block_name.below();
        for(let i = 0; i < 64; i++){
            if(!rope.hasTag("rope")) break;
            rope = rope.below();
        }
        if(!rope.hasTag("rope") && rope.isAir){
            let rope_count = 7;
            let rope_permutation = undefined;
            while(rope_count >= 0){
                if(!rope.isAir) break;
                let below_rope = rope.below();
                if(rope_count > 0 && !below_rope.isAir){
                    rope_count = 0;
                }

                if(rope_permutation == undefined){
                    rope.setType("rns:rope");
                    rope_permutation = rope.permutation;
                    rope_permutation = rope_permutation.withState("rope:connected", rope_count);
                    rope.setPermutation(rope_permutation);
                }else{
                    rope_permutation = rope_permutation.withState("rope:connected", rope_count);
                    rope.setPermutation(rope_permutation);
                }
                rope = below_rope;
                rope_count--;
            }
            item_used = true;
        }
    }
    if(item_used && s.source.getGameMode() != "creative"){
        let item = s.itemStack;
        if(item.amount > 1){
            item.amount = item.amount - 1;
        }else{
            item = undefined;
        }
        s.source.getComponent("minecraft:inventory").container.getSlot(main_hand_slot).setItem(item);
    }
});

let anim_name = {}

export function isUsingRope(source){
    return anim_name[source.id] != undefined
}

system.runInterval(()=>{
    for(let playerData of world.getPlayers()){
        let dimension = playerData.dimension;
        let current_block = dimension.getBlock(playerData.getHeadLocation());
        let anchor = 0;
        if(current_block == undefined || !current_block.hasTag("rope")){
            current_block = dimension.getBlock(playerData.location);
            anchor = 1;

        }
        if(current_block != undefined && current_block.hasTag("rope") && !playerData.isGliding && !playerData.isFlying && !playerData.isOnGround && !isUsingGrapplingHook(playerData, true)){
            let lift = -0.05;
            let animation_name = "animation.humanoid.rope.climb_down";
            if(playerData.isJumping){
                lift = 0.25;
                animation_name = "animation.humanoid.rope.climb_up";
            }
            if(playerData.isSneaking && anchor == 0){
                let y_vel = playerData.getVelocity().y;
                
                if(Math.abs(y_vel) < 0.100){
                   lift = -y_vel + 0.025; 
                }else{
                    lift = 0.05;
                }
                
                animation_name = "animation.humanoid.rope.steady";
            }
            if(playerData.isSneaking && playerData.isJumping){
                lift = -0.4;
                animation_name = "animation.humanoid.rope.climb_down_boost";
            }

            if(animation_name != "animation.humanoid.rope.climb_down_boost"){
                if(isStaminaCooldown(playerData)){
                    lift = -0.4;
                    animation_name = "animation.humanoid.rope.climb_down_boost";
                }else{
                    if(getConfigValue("rns:affect_rope")){
                        if(animation_name == "animation.humanoid.rope.climb_down"){
                            addStamina(playerData, 0.75);
                        }else if(animation_name == "animation.humanoid.rope.climb_up"){
                            addStamina(playerData, 1, 0.5);
                        }else{
                            addStamina(playerData, 1.5);
                        }
                    }
                }
            }
            playerData.applyKnockback(0, 0, 0, lift / (1 - getResistanceValue(playerData)));
            if(lift < 0 && animation_name != "animation.humanoid.rope.climb_down_boost") playerData.addEffect("slow_falling", 1, { showParticles: false, amplifier: 255 })
            
            if(anim_name[playerData.id] != animation_name){
                anim_name[playerData.id] = animation_name;

                playerData.playAnimation(animation_name, {
                    blendOutTime: 0.3,
                    stopExpression: "query.is_on_ground",
                    controller: "climbing_controller"
                });
            }
        }else{
            if(anim_name[playerData.id]){
                playerData.playAnimation("animation.humanoid.rope.stop", {
                    blendOutTime: 0.5,
                    stopExpression: "true",
                    controller: "climbing_controller"
                });
                delete anim_name[playerData.id];
            }
        }
    }
})

world.afterEvents.entitySpawn.subscribe(s=>{
    if(s.entity.typeId != "minecraft:item") return;

    let itemStack = s.entity.getComponent("minecraft:item").itemStack;

    if(itemStack.typeId == "rns:trip_wire_with_rope"){
        s.entity.dimension.spawnItem(new ItemStack("minecraft:tripwire_hook"), s.entity.location);
        s.entity.dimension.spawnItem(new ItemStack("minecraft:lead"), s.entity.location);
        s.entity.remove();
    }else if(itemStack.typeId == "rns:rope"){
        s.entity.remove();
    }
})