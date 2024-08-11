import { world, system, DisplaySlotId } from "@minecraft/server";

// Setup
const databaseObjective = world.scoreboard.getObjective("databaseObjective")
	?? world.scoreboard.addObjective("databaseObjective", "db");
const deathObjective = world.scoreboard.getObjective("deathObjective")
	?? world.scoreboard.addObjective("deathObjective", "§cDeaths§r");
const objectiveIdSidebarSlot = world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.Sidebar)?.objective.id;
const objectiveIdBelownameSlot = world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.BelowName)?.objective.id;
const objectiveIdListSlot = world.scoreboard.getObjectiveAtDisplaySlot(DisplaySlotId.List)?.objective.id;

if (objectiveIdSidebarSlot !== "deathObjective"
	&& objectiveIdBelownameSlot !== "deathObjective"
	&& objectiveIdListSlot !== "deathObjective") {
	world.scoreboard.setObjectiveAtDisplaySlot(DisplaySlotId.List, { objective: deathObjective });
}

export default {
	init: () => {
		system.runInterval(() => {
			const players = world.getAllPlayers();

			players.forEach((player) => {
				try {
					const playerDatabaseScore = databaseObjective.getScore(player.id);
					deathObjective.setScore(player, playerDatabaseScore);
				} catch (e) {
					deathObjective.setScore(player, 0);
					databaseObjective.setScore(player.id, 0);
				}
			});

			for (const participant of deathObjective.getParticipants()) {
				try {
					participant.getEntity();
				} catch (e) {
					deathObjective.removeParticipant(participant);
				}
			}
		});

		world.afterEvents.entityDie.subscribe((eventData) => {
			if (eventData.deadEntity.typeId !== "minecraft:player")
				return;

			const playerDead = eventData.deadEntity;
			databaseObjective.addScore(playerDead.id, 1);
		});
	}
};