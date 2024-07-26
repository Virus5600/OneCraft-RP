effect @a[hasitem={item=ocrp:cyclop_eye_helmet,location=slot.armor.head}] night_vision 13 1 true
effect @a[hasitem={item=ocrp:swamp_drowned_helmet,location=slot.armor.head}] water_breathing 13 1 true
effect @a[hasitem={item=ocrp:bandana,location=slot.armor.head}] blindness 4 1 true
effect @a[hasitem={item=ocrp:hermes_boots,location=slot.armor.feet}] speed 13 1 true
effect @a[hasitem={item=ocrp:hermes_boots,location=slot.armor.feet}] slow_falling 13 2 true

execute as @e[type=ocrp:griffin_projectile] at @s positioned ~ ~0.20 ~ run particle minecraft:basic_smoke_particle ~ ~ ~
execute as @e[type=ocrp:griffin_projectile_player] at @s positioned ~ ~0.20 ~ run particle minecraft:basic_smoke_particle ~ ~ ~

execute as @e[type=ocrp:fire_spirit] at @s positioned ~ ~0.20 ~ run particle minecraft:basic_flame_particle ~-0.20 ~0.10 ~-0.15

tag @a add dead
tag @e[type=player] remove dead

execute as @a[tag=dead, tag=!already_dead] at @s positioned ~ ~ ~ run summon ocrp:death ~ ~ ~

tag @a[tag=dead, tag=!already_dead] add already_dead
tag @a[tag=!dead, tag=already_dead] remove already_dead
tag @a add dead