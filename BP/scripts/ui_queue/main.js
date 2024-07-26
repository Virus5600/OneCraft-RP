import { world, system } from "@minecraft/server";

var ui_queue = {};
let start_queue = false;
var ui_now = {};
var ui_update_time = {};
var ui_update_loop = {};
var registered_id = [];
var registered_name = {};
var player_dimension = {};

export default {
	init: function() {
		system.afterEvents.scriptEventReceive.subscribe( s => {
			let id = s.sourceEntity.id;
			// console.warn("UDATEEEEEEEEEEE")
			if(!ui_queue[id]){
				ui_queue[id] = {};
				ui_now[id] = {};
				ui_update_time[id] = {};
				ui_update_loop[id] = {};
			}
			
			if(ui_now[id][s.id.split(":")[1]] == s.message){
				return;
			}else{
				ui_now[id][s.id.split(":")[1]] = s.message;
			}
			ui_queue[id][s.id.split(":")[1]] = s.message;
			ui_update_time[id][s.id.split(":")[1]] = system.currentTick + 20;
			ui_update_loop[id][s.id.split(":")[1]] = 0;
		
			if(registered_name[s.id.split(":")[1]] == undefined){
				registered_id.push(s.id.split(":")[1]);
				registered_name[s.id.split(":")[1]] = {};
			}
		}, { namespaces: [ "ui_load" ]});
		
		
		system.afterEvents.scriptEventReceive.subscribe( s => {
			if(s.id != "ui:set") return;
			let id = s.sourceEntity.id;
			if(!ui_queue[id]){
				ui_queue[id] = {};
				ui_now[id] = {};
				ui_update_time[id] = {};
				ui_update_loop[id] = {};
			}
			
			if(ui_now[id][s.message.split(" ")[1]] == s.message){
				return;
			}else{
				ui_now[id][s.message.split(" ")[1]] = s.message;
			}
			// console.warn("UDATE" + s.message)
			ui_queue[id][s.message.split(" ")[1]] = s.message.replace(" ", "");
			ui_update_time[id][s.message.split(" ")[1]] = system.currentTick + 20;
			ui_update_loop[id][s.message.split(" ")[1]] = 0;
		
			if(registered_name[s.message.split(" ")[1]] == undefined){
				registered_id.push(s.message.split(" ")[1]);
				registered_name[s.message.split(" ")[1]] = {};
			}
		}, { namespaces: [ "ui" ]});
		
		system.runInterval(() => {
			for(let playerData of world.getPlayers()){
				// console.warn(JSON.stringify(ui_now))
		// console.warn(JSON.stringify(ui_update_time))
				if(!start_queue){
					start_queue = true;
					return;
				}
				if(player_dimension[playerData.id] != playerData.dimension.id){
					for(let id of registered_id){
						if(ui_update_time[playerData.id][id] == undefined) continue;
						ui_update_time[playerData.id][id] = system.currentTick;
						ui_update_loop[playerData.id][id] = 0;
					}
		
					player_dimension[playerData.id] = playerData.dimension.id;
				}
		
				if(!ui_queue[playerData.id]) continue;
				
				// console.warn(JSON.stringify(ui_update_loop))
		
				let keys = Object.keys(ui_queue[playerData.id]);
				if(keys.length == 0){ 
					for(let id of registered_id){
						if(ui_update_time[playerData.id][id] == undefined || ui_now[playerData.id][id] == undefined) continue;
						if(system.currentTick - ui_update_time[playerData.id][id] > 10){
							ui_queue[playerData.id][id] = ui_now[playerData.id][id].replace(" " + id, id);
							ui_update_time[playerData.id][id] = system.currentTick + 20 * ui_update_loop[playerData.id][id];
							// console.warn("REFTRESH PATH " + ui_now[playerData.id][id].replace(" ", "") + " TICK : " + ui_update_time[playerData.id][id])
							// delete ui_now[playerData.id][id];
							ui_update_loop[playerData.id][id] += 1;
							// console.warn("TICK : " + ui_update_loop[playerData.id][id])
							if(Math.random > 0.6) break;
						}
					}
					continue;
				}
				let set_ui = keys[0];
				// console.warn(set_ui)
						// console.warn(ui_queue[playerData.id][set_ui])
				
				if(ui_queue[playerData.id][set_ui] != undefined){
					playerData.onScreenDisplay.setTitle(ui_queue[playerData.id][set_ui], {fadeInDuration : 0, fadeOutDuration : 0, stayDuration : 0});
					delete ui_queue[playerData.id][set_ui];
				} 
			}
		});
	}
}