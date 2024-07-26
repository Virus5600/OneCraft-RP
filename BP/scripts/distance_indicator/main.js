import { world, system } from "@minecraft/server";
import { Utilities } from "./utilities";

/**
 * The main code body of Distance Indicator. It's been put inside an object to easily integrate more functions of need be.
 * 
 * The idea to put inside an object to to clean the code and allow future updates to be easily integrated; an idea of the
 * co-author.
 * 
 * @author (Original Author of Distance Indicator)
 * @co-author Virus5600
 */
export default {
	/**
	 * Subscribes all players to the Distance Indicator
	 */
	init: function () {
		system.runInterval(() => {
			const players = world.getAllPlayers();
			players.forEach((player) => {
				if (player.hasTag("dmc_indicator-Stop"))
					return;
				player.onScreenDisplay.setActionBar(`${Utilities.getDistanceAll(player, players, true)}`);
			});
		});

		system.afterEvents.scriptEventReceive.subscribe((eventData) => {
			const player = eventData.sourceEntity;
			switch (eventData.id) {
				case "dmc_indicator:stop":
					player.addTag("dmc_indicator-Stop");
					break;
				case "dmc_indicator:display":
					player.removeTag("dmc_indicator-Stop");
					break;
				default:
					player.sendMessage("§cThis id does not exist.");
					break;
			}
		}, { namespaces: ["dmc_indicator"] });

		world.getAllPlayers().forEach((player) => {
			player.sendMessage("§aDistance Indicator has been enabled.");
		});
	}
}