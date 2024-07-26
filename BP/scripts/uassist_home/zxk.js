import { EntityInventoryComponent, ItemLockMode, ItemStack, ItemTypes, system, world } from '@minecraft/server';
import { SystemE } from './Constants/Emojis';
import { UIAdminPlayers, UIGeneral, UIWelcome } from './Interface/forms';
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1f66e1 from './DataBase/ZXKDatabase';
import { isOp } from './Functions/Client';
import { ZxkDimensionTypes } from './Class/Libs/DimensionTypes';

export default {
	init: function() {
		world.beforeEvents.itemUse.subscribe(({
			itemStack: _0x1a300c,
			source: _0x4ffd4e
		}) => {
			if (_0x1a300c.typeId === "ocrp:homes") {
				const _0x21095b = SystemE[Math.floor(Math.random() * Object.keys(SystemE).length)];
				const _0x28df59 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1f66e1(_0x4ffd4e.id);
				const _0x2c659f = isOp(_0x4ffd4e) ? UIAdminPlayers : UIGeneral;
				if ((_0x28df59.getValue('ui', false) || false) === false) {
					system.run(() => UIWelcome(_0x4ffd4e, _0x2c659f(_0x4ffd4e, _0x4ffd4e.id, _0x21095b)));
					_0x28df59.setValue('ui', true);
					return;
				}
				system.run(() => _0x2c659f(_0x4ffd4e, _0x4ffd4e.id, _0x21095b));
			}
		});
		world.afterEvents.playerSpawn.subscribe(({
			player: _0x5d9acc,
			initialSpawn: _0x46d017
		}) => {
			if (_0x46d017) {
				const _0x16a732 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1f66e1(_0x5d9acc.id);
				try {
					_0x16a732.setValue("name", _0x5d9acc.name);
					_0x16a732.setValue('id', _0x5d9acc.id);
				} catch (_0x97cc13) {
					_0x16a732.newValue({
						'name': _0x5d9acc.name,
						'id': _0x5d9acc.id,
						'isShare': true,
						'isCustomLengthHomes': false,
						'ui': false
					});
					const _0x390cb2 = _0x5d9acc.getComponent(EntityInventoryComponent.componentId);
					const _0x303b38 = new ItemStack(ItemTypes.get("ocrp:homes"), 0x1);
					system.run(() => {
						_0x303b38.setLore(["§8§lUAssist §cHomes §dv0.1"]);
						_0x303b38.keepOnDeath = true;
						_0x303b38.lockMode = ItemLockMode.inventory;
						_0x390cb2.container.addItem(_0x303b38);
					});
					world.getDimension(ZxkDimensionTypes.Overworld).runCommandAsync("gamerule showtags false");
				}
			}
		});
	}
}