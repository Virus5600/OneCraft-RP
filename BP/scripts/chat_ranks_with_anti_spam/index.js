import { chatrank } from './misc/chat.js'
import { world, system } from '@minecraft/server'
import { timer } from './misc/second.js'

let tick = 0, worldLoad = false;

export default {
	/**
	 * The main code body of "Chat Ranks with Anti Spam" Add-on. It's been put inside an object to easily integrate more functions of need be.
	 * 
	 * The idea to put inside an object to to clean the code and allow future updates to be easily integrated; an idea of the
	 * co-author.
	 * 
	 * @author DizzeryQ
	 * @co-author Virus5600
	 */
	init: function() {
		world.beforeEvents.chatSend.subscribe((data) => {
			chatrank(data)
		});
		
		system.runInterval(() => {
			tick++;

			if (!worldLoad) {
				world.getDimension('overworld')
					.runCommandAsync(`testfor @a`)
					.then((e) => {
						if (!worldLoad) {
							world.sendMessage(`World has loaded in ${tick} ticks`);
							worldLoad = true;
							
							if (!world.scoreboard.getObjective('chatsSent'))
								world.scoreboard.addObjective('chatsSent', 'chatsSent')
						}
					}, onrejected => {
						return
					});
			}
			
			if(system.currentTick % 20 == 0)
				timer()
		});
	}
}