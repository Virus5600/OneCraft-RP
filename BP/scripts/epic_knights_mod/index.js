import { EntityHealthComponent, system, world } from "@minecraft/server";
import functions from "./function";

/**
 * The main code body of Epic Knights Mod. It's been put inside an object to easily integrate more functions of need be.
 * 
 * The idea to put inside an object to to clean the code and allow future updates to be easily integrated; an idea of the
 * co-author.
 * 
 * @author theblackchimera, iPuchinin and Magistu
 * @co-author Virus5600
 */
export default {
    /**
     * Initializes the original code of Epic Knights Mod.
     */
    init: function () {
        const protectedPlayers = new Map();

        system.runInterval(async () => {
            // Gets all the players.
            for (const player of world.getPlayers()) {
                // Fetches the weapon of the player.
                const weapon = functions.findWeapon(player);

                // If the player has the vanilla minecraft shield, automatically skips this player.
                if (functions.getWeapon(player, true)?.typeId == "minecraft:shield")
                    continue;

                // If the player does have weapon and is not sneaking...
                if (!(weapon && player.isSneaking)) {
                    // Remove the player from the protected players then skip to the next player.
                    protectedPlayers.delete(player.nameTag);
                    continue
                }
                // Otherwise, if the player has a weapon and is sneaking but isn't in the list of protected players, add the player to the list.
                else if (!protectedPlayers.get(player.nameTag))
                    protectedPlayers.set(player.nameTag, weapon);

                // Lastly, apply a "Weakness V" effect for 20 seconds without showing the particles.
                player.addEffect("weakness", 20, { amplifier: 5, showParticles: false });
                // Then play the weapon blocking animation.
                player.playAnimation("animation.player.epic_knights_mod.weapon_blocking");
            }
        });

        // Checks for any players that are damaged or "hurt".
        world.afterEvents.entityHurt.subscribe((event) => {
            // Extract some needed variables from the entity hurt event.
            const { hurtEntity: player, damage, damageSource: source } = event;
            // Fetch some more needed variables from the source.
            const { damagingEntity: entity, damagingProjectile: projectile } = source;
            // And finally, get the player from the list of protected players.
            const protectedPlayer = protectedPlayers.get(player.nameTag);

            // If the player isn't in the list, immediately stop here.
            if (!protectedPlayer)
                return;

            // Otherwise, continue on and fetch the health component of the player, along with its supposed to be damage
            // that will be inflicted to the player
            const healthComponent = player.getComponent(EntityHealthComponent.componentId);
            const reduction = functions.calculateReduction(damage, entity || projectile, !!projectile);

            // Play the shield blocked sound...
            player.playSound('epic_knights_mod.item.shield.block');

            // Damage the "weapon" of the protected player (probably using a shield)
            functions.damageWeapon(player, protectedPlayer);

            // Then teleport the player back to its location, probably rendering the knockback effect nill.
            player.teleport(player.location);

            // Updates the player health.
            system.run(() => {
                healthComponent.setCurrentValue(healthComponent.currentValue + reduction);
            });
        }, {
            entityTypes: [
                "minecraft:player"
            ]
        });

        // Not sure on what this is... (Update 20240429 - This throws an error... commenting the line out)
        // system.beforeEvents.watchdogTerminate.subscribe(ev => ev.cancel = true);
    }
}