import { EntityEquippableComponent, EquipmentSlot, ItemDurabilityComponent } from "@minecraft/server";

/**
 * Some helper functions for the Epic Knights Mod created by theblackchimera, iPuchinin and Magistu
 * 
 * Documentations is provided by the co-author.
 * 
 * @author theblackchimera, iPuchinin, and Magistu
 * @co-author Virus5600
 */
export default {
    /**
     * Identifies whether the entity is a potion or not.
     * 
     * @param {any} entity The entity to test with.
     * 
     * @return {boolean} Returns `true` if it is a potion; `false` otherwise.
     */
    isPotion: function (entity) {
        return entity.typeId == "minecraft:splash_potion";
    },

    /**
     * Damages or decreases the item's durability. This could be chained with
     * any item methods since the function returns the item itself again.
     * 
     * @param {any} item The item to decrease the durability with.
     * @param {number} damage The amount of durability that will be deducted to the item.
     * 
     * @param {any} The original item provided.
     */
    damageWeapon: function (item, damage) {
        const durability = item?.getComponent(ItemDurabilityComponent.componentId);

        if (!durability) return item;
        durability.damage += damage;
        return item;
    },

    /**
     * Fetch the equipment's component from the given entity.
     * 
     * @param {any} entity The entity to fetch the equipment component from.
     * 
     * @return {any} The entity's equipment component.
     */
    getEquipmentComponent: function (entity) {
        return entity.getComponent(EntityEquippableComponent.componentId);
    },

    /**
     * Fetches the weapon a player is holding and returns it.
     * 
     * @param {any} player The player to test.
     * @param {boolean} offhand Identify whether to check the offhand or the mainhand. Defaults to `false`.
     * 
     * @param {any} The equipment the player is currently holding.
     */
    getWeapon: function (player, offhand = false) {
        return this.getEquipmentComponent(player)
            .getEquipment(offhand ? EquipmentSlot.Offhand : EquipmentSlot.Mainhand);
    },

    /**
     * Calculates a reduced damaged depending on whether it is a projectile
     * (but not a potion) or not. A 40% damage reduction will be applied if
     * it is not a projectile based damage.
     * 
     * @param {number} damage The initial amount of damage that will be inflicted.
     * @param {any} damager The entity that will damage the target entity.
     * @param {boolean} isProjectile Identifies whether the damager is a projectile entity. Defaults to `false`.
     * 
     * @return {number} Either a reduced damage or the original damage.
     */
    calculateReduction: function (damage, damager, isProjectile = false) {
        if (!this.isPotion(damager) && isProjectile) return damage;
        return damage - (damage * 0.4);
    },

    /**
     * Identifies whether a weapon is present.
     * 
     * @param {any} player An instance of player.
     * 
     * @returns boolean
     */
    findWeapon: function (player) {
        return [false, true]
            .map(offhand => this.getWeapon(player, offhand))
            .filter(item => item?.typeId.includes("twohanded"))[0];
    }
}