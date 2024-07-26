import { world, system, Player } from "@minecraft/server";

/**
 * The main code body of Health Bar Add-On. It's been put inside an object to easily integrate more functions of need be.
 * 
 * The idea to put inside an object to to clean the code and allow future updates to be easily integrated; an idea of the
 * co-author.
 * 
 * @author (Original Author of Health Bar)
 * @co-author Virus5600
 */
export default {
	/**
	 * Initializes the original code of "Health Bar".
	 */
	init: function () {
		system.runInterval(() => {
			const overworld = world.getDimension("overworld");
			const nether = world.getDimension("nether");
			const the_end = world.getDimension("the_end");
		
		
			let entities = overworld.getEntities({ excludeFamilies: ['flag'], excludeTypes: ["sh:indique", "sh:fuel_machine"] });
			entities = entities.concat(nether.getEntities({ excludeFamilies: ['flag'], excludeTypes: ["sh:indique", "sh:fuel_machine"] }));
			entities = entities.concat(the_end.getEntities({ excludeFamilies: ['flag'], excludeTypes: ["sh:indique", "sh:fuel_machine"] }));
		
			for (const entity of entities) {
				const healthComponent = entity.getComponent("minecraft:health");
		
				const lines = entity.nameTag.split("\n");
				const exeName = lines[0];
		
				if (healthComponent) {
					const Vlhealth = healthComponent.currentValue;
					const health = Math.floor(Vlhealth);
					if (health >= 7 && health <= 50000) {
						if (exeName != undefined) {
							entity.nameTag = `${exeName}\n§e${health} `;
						} else {
							entity.nameTag = `§e${health} `;
						}
					} else if (health >= 3 && health <= 7) {
		
						if (exeName != undefined) {
							entity.nameTag = `${exeName}\n§a${health} `;
						} else {
							entity.nameTag = `§a${health} `;
						}
					} else if (health >= 0 && health <= 3) {
						if (exeName != undefined) {
							entity.nameTag = `${exeName}\n§c${health} `;
						} else {
							entity.nameTag = `§c${health} `;
						}
					}
				}
			}
		});
	}
}
