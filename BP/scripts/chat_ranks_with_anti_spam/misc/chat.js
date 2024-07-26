import { world, ChatSendBeforeEvent, system } from "@minecraft/server"

let messages = new Map()

/**
 * 
 * @param {ChatSendBeforeEvent} data 
 * @returns 
 */
function chatrank(data) {
    const tags = data.sender.getTags()
    let score;
    try {
        score = world.scoreboard.getObjective('chatsSent').getScore(data.sender.scoreboardIdentity)
    } catch (e) {
        score = 0;
    }
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))

    ranks = ranks.length ? ranks : ["§6Member"]

    if (score >= 3) {
        data.cancel = true
        return data.sender.sendMessage(`§l§4Hey! You're sending messages to quickly!`)
    }
    if (!messages.get(data.sender.name)) {
        messages.set(data.sender.name, data.message)
    } else {
        const oldMsg = messages.get(data.sender.name)
        if (oldMsg == data.message) {
            data.cancel = true
            return data.sender.sendMessage(`§l§cPlease do not spam chat!`)
        }
    }
    const text = `§f[${ranks.join("§r§f] [")}§r§f] §7${data.sender.nameTag}: §f${data.message}`
    world.sendMessage({ rawtext: [{ text: text }] })
    messages.set(data.sender.name, data.message)
    data.cancel = true
    const a = system.run(() => {
        world.scoreboard.getObjective('chatsSent').addScore(data.sender, 1)
        system.clearRun(a)
    })
}
export { chatrank }