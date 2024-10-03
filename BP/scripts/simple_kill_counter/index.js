import { DisplaySlotId, system, world } from "@minecraft/server";

const SKC = {
	/**
	 * Identifies what mode the kill counter is using. This could be "player" which only
	 * counts a kill if a player kills another player, or "all" which counts a kill if any
	 * entity kills another entity.
	 * 
	 * If this is set to `false`, the kill counter isn't initialized.
	 * 
	 * @type {("player" | "all" | false)}
	 * @default false
	 */
	counterMode: false,
	/**
	 * Initializes the kill counter, setting up the scoreboard and subscribing the kill
	 * counter to the entityDie event.
	 * 
	 * @returns void
	 */
	init: function () {
		// Create or collect the KillCounter scoreboard and put it in the sidebar.
		const killCounterObjective = world.scoreboard.getObjective("ocrp:kill_counter")
			?? SKC.initScoreboard();

		// Check if the counter mode is set in the world's dynamic properties. If
		// it isn't, set it to "player" and save it to the world's dynamic properties.	
		SKC.counterMode = world.getDynamicProperty("ocrp:counter_mode") ?? SKC.counterMode;
		if (!SKC.counterMode)
			world.setDynamicProperty("ocrp:counter_mode", "player");

		// Initializes the loop for the kill counter.
		system.runInterval(() => {
			// Defines the score of players with a DynamicProperty.
			const players = world.getAllPlayers();
			players.forEach((player) => {
				player.setDynamicProperty(
					"ocrp:score_kill_counter_objective",
					player.getDynamicProperty("ocrp:score_kill_counter_objective") ?? 0
				);

				killCounterObjective.setScore(player, player.getDynamicProperty("ocrp:score_kill_counter_objective"));
			});

			// Remove the players who are no longer in the world from the scoreboard.
			const killCounterParticipants = killCounterObjective.getParticipants();
			killCounterParticipants.forEach((killCounterParticipant) => {
				try {
					killCounterParticipant.getEntity();
				}
				catch (e) {
					killCounterObjective.removeParticipant(killCounterParticipant);
				};
			});
		});

		// Subscribes the kill counter to the entityDie event.
		let options = {};
		if (SKC.counterMode == "player")
			options.entityTypes = ["minecraft:player"];
		SKC.killCounter = subscribeKillCounter(options, false);

		// Subscribes the script events for the kill counter.
		subscribeScriptEvents(
			SKC.resetKillCounter,
			SKC.toggleMode,
			SKC.currentMode
		);
	},
	/**
	 * The kill counter function that is called when the entityDie event is received.
	 * 
	 * @param {ScriptEventCommandMessageAfterEvent} eventData The event data received from the script event.
	 * @returns void
	 */
	killCounter: function (eventData) {
		const { deadEntity: deadPlayer, damageSource } = eventData;
		const damagePlayer = damageSource.damagingEntity;

		if (damagePlayer.typeId !== "minecraft:player"
			|| damagePlayer === undefined)
			return;

		damagePlayer.setDynamicProperty(
			"ocrp:score_kill_counter_objective",
			damagePlayer.getDynamicProperty("ocrp:score_kill_counter_objective") + 1
		);
	},
	/**
	 * Resets the kill counter for all players in the world. Does not reset the kill counter of the
	 * players who are no longer in the world.
	 * 
	 * @returns void
	 */
	resetKillCounter: function (eventData) {
		const scriptEventID = eventData.id;
		if (scriptEventID !== "ocrp:reset_kill_counter")
			return;

		const players = world.getAllPlayers();
		players.forEach((player) => {
			player.setDynamicProperty("ocrp:score_kill_counter_objective", 0);
		});
	},
	/**
	 * Toggles the mode of the kill counter between "player" and "all". If the mode is "player",
	 * the kill counter will only count a kill if a player kills another player. If the mode is "all",
	 * the kill counter will count a kill if any entity kills another entity.
	 * 
	 * To toggle the mode, send a script event with the ID `ocrp:toggle_mode` and the message as either
	 * "player" or "all". If the message is not one of these two, the kill counter will toggle between
	 * "player" and "all".
	 * 
	 * Example:
	 * - `/scriptevent ocrp:toggle_mode all` - This will set the kill counter mode to "All".
	 * - `/scriptevent ocrp:toggle_mode player` - This will set the kill counter mode to "Player".
	 * - `/scriptevent ocrp:toggle_mode` - This will toggle the kill counter mode between "Player" and "All".
	 * - `/scriptevent ocrp:toggle_mode auysvdi` - The same with the above, it will toggle the kill counter mode between "Player" and "All".
	 * 
	 * @see {@link SKC.counterMode}
	 * 
	 * @returns void
	 */
	toggleMode: function (eventData) {
		const scriptEventID = eventData.id;
		const scriptEventMessage = eventData.message.toLowerCase();
		const choices = ["player", "all"];

		if (scriptEventID !== "ocrp:toggle_mode")
			return;
		
		SKC.counterMode = world.getDynamicProperty("ocrp:counter_mode") ?? SKC.counterMode;
		if (choices.includes(scriptEventMessage)) {
			let index = choices.indexOf(scriptEventMessage) === 0 ? 1 : 0;
			SKC.counterMode = choices[index];
		}

		switch (SKC.counterMode) {
			case false:
			case "all":
				SKC.counterMode = "player";
				break;

			case "player":
				SKC.counterMode = "all";
				break;
		}

		// Update the display name of the kill counter objective.
		SKC.initScoreboard(true);

		// Update the counter mode in the world's dynamic properties, then notify player.
		world.setDynamicProperty("ocrp:counter_mode", SKC.counterMode);
		world.sendMessage(`§aKill Counter mode has been set to: §b${`(${SKC.counterMode.charAt(0).toUpperCase()})` + SKC.counterMode.slice(1)}§r`);

		// Resubscribes the kill counter from the entityDie event.
		let options = {};
		if (SKC.counterMode == "player")
			options.entityTypes = ["minecraft:player"];
		SKC.killCounter = subscribeKillCounter(options);
	},
	/**
	 * Tells the current mode of the kill counter.
	 */
	currentMode: function (eventData) {
		const scriptEventID = eventData.id;
		if (scriptEventID !== "ocrp:current_mode" && scriptEventID !== "ocrp:mode")
			return;

		SKC.counterMode = world.getDynamicProperty("ocrp:counter_mode") ?? SKC.counterMode;
		world.sendMessage(`§aKill Counter mode is currently set to: §b${`(${SKC.counterMode.charAt(0).toUpperCase()})` + SKC.counterMode.slice(1)}§r`);
	},
	/**
	 * Initializes the scoreboard for the kill counter.
	 * 
	 * @param {boolean} removeObjective Whether to remove the objective if it already exists. Default is `false`.
	 * 
	 * @returns {ScoreboardObjective} Returns the initialized scoreboard objective.
	 */
	initScoreboard: function (removeObjective = false) {
		if (removeObjective)
			world.scoreboard.removeObjective("ocrp:kill_counter");

		const killCounterObjective = world.scoreboard
			.addObjective(
				"ocrp:kill_counter",
				`§cKills §b(${SKC.counterMode.charAt(0).toUpperCase()})§r`
			);

		world.scoreboard.setObjectiveAtDisplaySlot(
			DisplaySlotId.Sidebar,
			{ objective: killCounterObjective }
		);

		return killCounterObjective;
	}
};

/**
 * Subscribes the kill counter to the entityDie event with the given options, allowing
 * the kill counter to count kills for the given entities.
 * 
 * @param {EntityEventOptions} options Additional filtering options for when the subscription fires.
 * @param {boolean} unsubscribe Whether to unsubscribe the kill counter from the entityDie event. Default is `true`.
 * 
 * @returns {Function} Returns the closure that can be used in future downstream calls to unsubscribe.
 */
function subscribeKillCounter(options, unsubscribe = true) {
	if (unsubscribe)
		world.afterEvents.entityDie.unsubscribe(SKC.killCounter);

	return world.afterEvents.entityDie.subscribe(
		SKC.killCounter,
		options
	);
}

/**
 * Subscribes the script events for the kill counter, allowing various events to be
 * received by the kill counter. The `callbacks` parameter is a list of functions that
 * will be called when the script event is received, and must be a function that takes
 * an `eventData` parameter.
 * 
 * @param  {...any} callbacks A list of functions that will be called when the script event is received.
 * 
 * @returns {Function} Returns the closure that can be used in future downstream calls to unsubscribe.
 */
function subscribeScriptEvents(...callbacks) {
	if (callbacks[0] instanceof Array)
		callbacks = callbacks[0];

	return system.afterEvents.scriptEventReceive.subscribe((eventData) => {
		callbacks.forEach((callback) => {
			try {
				callback(eventData);
			} catch (e) {
				console.error(e);
				console.warn(callback);
			}
		});
	}, {
		namespaces: ["ocrp"]
	});
}

export default SKC;