import { world } from '@minecraft/server'
let seconds = 0

export function timer(){
    seconds++
    if(seconds >= 4){
        world.getDimension("overworld").runCommandAsync(`scoreboard players reset * chatsSent`)
        world.getDimension("overworld").runCommandAsync(`scoreboard players set "dummy" chatsSent 1`)
        seconds = 0
        return seconds
    }
    return seconds
}