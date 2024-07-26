/**
 * Some utility functions for the Distance Indicator Mod created by its original author.
 * 
 * Documentations is provided by the co-author.
 * 
 * @author (Original Author of Distance Indicator)
 * @co-author Virus5600
 */
export class Utilities {
	/**
	 * Fetches all players that are not the provided `player`.
	 * 
	 * @param {*} player 
	 * @param {*} allPlayers
	 * 
	 * @returns {Array<any>} Returns an array of players excluding the provided `player`.
	 */
    static getOtherPlayers(player, allPlayers) {
        return allPlayers.filter((elementPlayer) => elementPlayer.id !== player.id);
    }

	/**
	 * Fetches the distance between two player locations.
	 * 
	 * @param {Object} playerLocationA The `x`, `y`, and `z` coordinates of the first player.
	 * @param {Object} playerLocationB The `x`, `y`, and `z` coordinates of the second player.
	 * 
	 * @returns {number} The distance between the two players' locations.
	 */
    static getDistance(playerLocationA, playerLocationB) {
        const { x: x1, y: y1, z: z1 } = playerLocationA;
        const { x: x2, y: y2, z: z2 } = playerLocationB;
        
		const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2);
        
		return Math.floor(distance);
    }

	/**
	 * Formats the distance list to meters. Also includes the player's name.
	 * 
	 * @param {Array} distanceList The list of distances between the player and other players.
	 * @param {Array} otherPlayers The list of other players.
	 * 
	 * @returns {string} The formatted distance list.
	 */
    static formatToMeters(distanceList, otherPlayers) {
        let distanceDisplay = "";
        for (let i = 0; i < distanceList.length; i++)
            distanceDisplay += `§a${otherPlayers[i].name}§f: ${distanceList[i]}m; `;

        return distanceDisplay.slice(0, -2);
    }

	/**
	 * Fetches the distance between the provided `player` and all other players.
	 * 
	 * @param {*} player The player to compare distances with.
	 * @param {*} allPlayers The list of all players.
	 * @param {boolean} display If `true`, the distances will be formatted to meters.
	 * 
	 * @returns {Array<number>|string} The list of distances between the `player` and all other players.
	 */
    static getDistanceAll(player, allPlayers, display = false) {
        const otherPlayers = this.getOtherPlayers(player, allPlayers);
        if (otherPlayers.length === 0)
            return "";
        
		const distances = otherPlayers.map((otherPlayer) => this.getDistance(player.location, otherPlayer.location));
        if (display)
            return this.formatToMeters(distances, otherPlayers);
        else
            return distances;
    }
}
