import { system, world } from '@minecraft/server';
import ZVector from '../Class/ZVector';
import { ActionFormData, ModalFormData } from '@minecraft/server-ui';
import { UAConfig } from '../Config/UAConfig';
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4f282f from '../Class/ZHomes';
import { isOp, loadFullScreen, returnPlayer, sendText } from '../Functions/Client';
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af from '../Class/ZPlayers';
import { ZxkDimensionTypes } from '../Class/Libs/DimensionTypes';
import { ZxkSoundTypes } from "../Class/Libs/SoundTypes";
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x93487 from '../DataBase/ZXKDatabase';
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x25023c from '../Class/ZServer';
import { consoleLog } from '../Functions/Global';
const {
	Homes: {
		Predetermined: {
			NumberOfHomesByPlayer: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4d1ba6,
			WaitTime: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x44827e,
			BlockMovementDuringTeleport: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2261de,
			AllowHomeDimensionChange: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x85eb1c
		},
		Animations: {
			TeleportParticles: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2d6d47
		}
	}
} = UAConfig;
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3a5c93 = ['', '', '', '', '', '', '', '', '', '', ''];
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x18dd59 = BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x44827e === 0x0 ? 0x1 : BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x44827e;
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x30fe84 = new Map();
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x97bc5d = new Map();
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418 = new Map();
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x570af0 = new Map();
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4fff91 = new Map();
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x59d623 = [['', "_black", "_red", "_purple", "_white", "_green"], [" %ocrp.homes.form.general.edit.particles.def", " %ocrp.homes.form.general.edit.particles.black", " %ocrp.homes.form.general.edit.particles.red", " %ocrp.homes.form.general.edit.particles.purple", " %ocrp.homes.form.general.edit.particles.white", " %ocrp.homes.form.general.edit.particles.green"]];
const BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x299642 = [false, true, false];
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1a0656(_0x38b684, _0x3e6d3e, _0x4054a8) {
	const _0x460a0b = BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x93487.getDatabases().filter(_0x1f571c => _0x1f571c.startsWith("zdb:-"));
	const _0xf581c5 = new ActionFormData().title(_0x4054a8 + "§l§f | §r§f%ocrp.homes.form.admin.users.title").body(_0x4054a8 + " %ocrp.homes.form.admin.users.body \n\n");
	_0x460a0b.forEach(_0x3e315c => {
		const _0x4275a2 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x3e315c.replace(/zdb:/g, ''));
		_0xf581c5.button('§f' + _0x4275a2.getName() + "\n%ocrp.homes.form.accts.clic", "font/images/" + (_0x4275a2.isOnline() ? "userOn" : "userOff"));
	});
	_0xf581c5.show(_0x38b684).then(_0x4b8388 => {
		if (_0x4b8388.canceled) {
			return;
		}
		const _0x158ea6 = _0x460a0b[_0x4b8388.selection].replace(/zdb:/g, '');
		const _0x1e41ad = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x158ea6);
		const _0x5b3167 = new ActionFormData().title(_0x4054a8 + "§l§f | §r§f" + _0x1e41ad.getName()).body(_0x4054a8 + " %ocrp.homes.form.admin.users.body.1\n\n").button("§f%ocrp.homes.form.admin.users.boton.1\n%ocrp.homes.form.accts.clic", "font/images/homes").button("§f%ocrp.homes.form.admin.users.boton.2\n%ocrp.homes.form.accts.clic", "font/images/config").button("§f%ocrp.homes.form.accts.back\n%ocrp.homes.form.accts.clic", "font/images/back");
		_0x5b3167.show(_0x38b684).then(_0xc66dd7 => {
			if (_0xc66dd7.canceled) {
				return;
			}
			if (_0xc66dd7.selection === 0x2) {
				return BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1a0656(_0x38b684, _0x4054a8);
			}
			if (_0xc66dd7.selection === 0x0) {
				return BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1b5e83(_0x38b684, _0x158ea6, _0x4054a8);
			}
			if (_0xc66dd7.selection === 0x1) {
				return BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3f657e(_0x38b684, _0x158ea6, _0x4054a8);
			}
		});
	});
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3f657e(_0x29f99d, _0x38f48e, _0x8e9080) {
	const _0x506bad = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x38f48e);
	const _0x31ef77 = new ModalFormData().title(_0x8e9080 + "§l§f | §r§f" + _0x506bad.getName()).slider(_0x8e9080 + " %ocrp.homes.form.admin.options.user \n\n%ocrp.homes.form.admin.options.slider", 0x1, 0x3c, 0x1, _0x506bad.isCustomLengthHomes ? _0x506bad.getLimitHomes() : BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4d1ba6).dropdown("\n%ocrp.homes.form.general.toggle", [" §f%ocrp.homes.form.accts.ninguno", " §f%ocrp.homes.form.accts.allow", " §f%ocrp.homes.form.accts.deny"], _0x506bad.isShare ? 0x1 : 0x0).dropdown("\n%ocrp.homes.form.general.edit.particles", BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x59d623[0x1], BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x59d623[0x0].indexOf(_0x506bad.getParticleCustom()));
	_0x31ef77.show(_0x29f99d).then(_0x5b4aad => {
		if (_0x5b4aad.canceled) {
			return;
		}
		const _0x59719a = BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x299642[_0x5b4aad.formValues[0x1]];
		_0x506bad.setLimitHomes(_0x5b4aad.formValues[0x0]);
		_0x506bad.setShare(_0x59719a);
		_0x506bad.setParticleCustom(BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x59d623[0x0][_0x5b4aad.formValues[0x2] ?? 0x0]);
		sendText(_0x29f99d, {
			'text1': "%ocrp.homes.send.ampli.settings.player\n   §l-§r %ocrp.homes.send.ampli.limit.home",
			'text2': _0x5b4aad.formValues[0x0],
			'text3': "\n   §l-§r %ocrp.homes.send.share.limit.home",
			'text4': _0x5b4aad.formValues[0x1] === 0x1 ? "%ocrp.homes.send.share.limit.home.2" : "%ocrp.homes.send.share.limit.home.1",
			'text5': "\n   §l-§r %ocrp.homes.send.ampli.particles",
			'text6': BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x59d623[0x1][_0x5b4aad.formValues[0x2]]
		}, 0x0);
	});
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1b5e83(_0x4804b1, _0x165fc3, _0x21621e) {
	const _0xf26e24 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x165fc3);
	const _0x38c4ce = _0xf26e24.getCountHome();
	const _0x1a6e02 = _0xf26e24.getCountHomeOfFriends();
	const _0x577c27 = _0xf26e24.getHomesId() || [];
	const _0x516f88 = _0xf26e24.getHomesIdOfFriends() || [];
	const _0x1c956f = _0xf26e24.isCustomLengthHomes ? _0xf26e24.getLimitHomes() : BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4d1ba6;
	const _0x4ab032 = new ActionFormData().title(_0x21621e + "§l§f | §r§f%ocrp.homes.form.general.title").body(_0x21621e + " %ocrp.homes.form.general.body\n\n%ocrp.homes.form.general.body.0 §l" + _0x38c4ce + '/' + _0x1c956f + "§r %ocrp.homes.form.general.body.1").button("§f%ocrp.homes.form.accts.add\n%ocrp.homes.form.accts.clic", "font/images/agregar");
	if (_0x38c4ce !== 0x0) {
		for (const _0x14624b of _0x577c27) {
			const _0x375223 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4f282f(_0x165fc3, _0x14624b);
			_0x4ab032.button('§f' + _0x375223.getName() + "\n%ocrp.homes.form.accts.edit", _0x375223.getIcon());
		}
	}
	if (_0x1a6e02 !== 0x0) {
		for (const _0x4cf817 of _0x516f88) {
			const _0x20ffcb = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4f282f(_0x165fc3, _0x4cf817);
			const _0xb44faa = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x20ffcb.getBy());
			_0x4ab032.button('§f' + _0x20ffcb.getName() + "\n%ocrp.homes.form.accts.creator §b" + _0xb44faa.getName(), _0x20ffcb.getIcon());
		}
	}
	_0x4ab032.show(_0x4804b1).then(_0x1cda86 => {
		if (_0x1cda86.canceled) {
			return;
		}
		if (_0x1cda86.selection === 0x0) {
			if (_0x38c4ce === _0x1c956f) {
				return sendText(_0x4804b1, {
					'text1': "%ocrp.homes.send.error.create.home"
				}, 0x0);
			}
			const _0x133c70 = new ModalFormData().title(_0x21621e + "§l§f | §r§f%ocrp.homes.form.accts.add").textField(_0x21621e + " %ocrp.homes.form.home.add.ui.body\n\n%ocrp.homes.form.accts.addName", "My Home").textField("\n%ocrp.homes.form.home.add.ui.description", "My Best Home").dropdown("\n%ocrp.homes.form.home.add.ui.dropdown", BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3a5c93, 0x0);
			_0x133c70.show(_0x4804b1).then(_0x3f33fa => {
				if (_0x3f33fa.canceled) {
					return;
				}
				const _0x402787 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x25023c();
				const _0x9bdd4c = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4f282f(_0x165fc3);
				_0x9bdd4c.addHome({
					'name': _0x3f33fa.formValues[0x0],
					'description': _0x3f33fa.formValues[0x1],
					'icon': _0x3f33fa.formValues[0x2],
					'ubica': Math.floor(_0x4804b1.location.x) + '_' + Math.floor(_0x4804b1.location.y) + '_' + Math.floor(_0x4804b1.location.z),
					'dimension': _0x4804b1.dimension.id,
					'modal': 0x0,
					'by': _0xf26e24.getId(),
					'date': _0x402787.getDate() + " - " + _0x402787.getTime()
				});
				sendText(_0x4804b1, {
					'text1': '%ocrp.homes.send.add.home',
					'text2': _0x3f33fa.formValues[0x0]
				}, 0x0);
			});
			return;
		}
		const _0x41bf42 = _0x577c27.concat(_0x516f88);
		const _0x84cb66 = _0x41bf42[_0x1cda86.selection - 0x1];
		const _0x2d0640 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4f282f(_0x165fc3, _0x84cb66);
		const _0x42cce6 = new ActionFormData().title(_0x21621e + "§l§f | §r§f" + _0x2d0640.getName()).body(_0x21621e + " %ocrp.homes.form.home.edit.ui.description\n\n%ocrp.homes.form.home.edit.ui.description.name " + _0x2d0640.getName() + "§r\n%ocrp.homes.form.home.edit.ui.description.info " + _0x2d0640.getDescription() + "§r\n\n").button("§f%ocrp.homes.form.home.add.ui.title\n%ocrp.homes.form.accts.clic", 'font/images/edit').button("§f%ocrp.homes.form.home.edit.ui.dropdown.1\n%ocrp.homes.form.accts.clic", "font/images/tp").button("§f%ocrp.homes.form.general.title.1\n%ocrp.homes.form.accts.clic", 'font/images/friends').button("§f%ocrp.homes.form.accts.remove\n%ocrp.homes.form.accts.clic", "font/images/delete").button("§f%ocrp.homes.form.accts.back\n%ocrp.homes.form.accts.clic", "font/images/back");
		_0x42cce6.show(_0x4804b1).then(_0x51e399 => {
			if (_0x51e399.canceled) {
				return;
			}
			const _0x3e6b66 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x4804b1.id);
			const _0x4221bc = _0x2d0640.getBy() === _0x4804b1.id || _0x3e6b66.getPerm(_0x2d0640.unicalCode) || isOp(_0x4804b1);
			const _0x29658a = _0xf26e24.isShare || isOp(_0x4804b1);
			switch (_0x51e399.selection) {
				case 0x4:
					return BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1b5e83(_0x4804b1, _0x165fc3, _0x21621e);
				case 0x1:
					BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x263a89(_0x4804b1);
					BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1082ab(_0x4804b1, _0x2d0640, _0x165fc3);
					BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3ac540(_0x4804b1, _0x2d0640);
					break;
				case 0x2:
					if (!_0x29658a) {
						return sendText(_0x4804b1, {
							'text': '%ocrp.homes.send.error.no.friends.share'
						}, 0x0);
					}
					if (!_0x4221bc) {
						return sendText(_0x4804b1, {
							'text': "%ocrp.homes.send.error.no.acc"
						}, 0x0);
					}
					if (_0x38c4ce == 0x0) {
						return sendText(_0x4804b1, {
							'text1': '%ocrp.homes.send.error.no.have.home'
						}, 0x0);
					}
					const _0xde0bfd = _0x2d0640.getFriends();
					const _0x1e8dd8 = new ActionFormData().title(_0x21621e + "§l§f |§r §f%ocrp.homes.form.general.title.1").body(_0x21621e + " %ocrp.homes.form.general.body.2.1\n\n").button("§f%ocrp.homes.form.accts.add\n%ocrp.homes.form.accts.clic", "font/images/agregar");
					if (_0xde0bfd.length !== 0x0) {
						for (const _0x45825a of _0xde0bfd) {
							const _0x498c5a = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x45825a);
							_0x1e8dd8.button('§f' + _0x498c5a.getName() + "\n%ocrp.homes.form.accts.removeClic", "font/images/" + (_0x498c5a.isOnline() ? 'userOn' : 'userOff'));
						}
					}
					_0x1e8dd8.show(_0x4804b1).then(_0x19c68e => {
						if (_0x19c68e.canceled) {
							return;
						}
						if (_0x19c68e.selection === 0x0) {
							const _0x5d70e1 = world.getAllPlayers();
							const _0x1d7bd3 = _0x5d70e1.map(_0x5b116a => " §f" + _0x5b116a.name);
							const _0x136b98 = new ModalFormData().title(_0x21621e + "§l§f |§r §f%ocrp.homes.form.general.title.1").dropdown(_0x21621e + " %ocrp.homes.form.general.drop \n\n%ocrp.homes.form.general.drop.1", _0x1d7bd3, 0x0).dropdown("\n%ocrp.homes.form.general.drop.2 §8§o(%ocrp.homes.form.general.drop.2.3)§r", [" §f%ocrp.homes.form.accts.ninguno", " §f%ocrp.homes.form.general.drop.2.1", " §f%ocrp.homes.form.general.drop.2.2"], 0x0);
							_0x136b98.show(_0x4804b1).then(_0x1b5d97 => {
								if (_0x1b5d97.canceled || _0x1b5d97.formValues[0x1] === 0x0) {
									return;
								}
								const _0x43b657 = _0x5d70e1[_0x1b5d97.formValues[0x0]];
								const _0x5c1f87 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x43b657.id);
								if (_0x43b657.id === _0x4804b1.id && !isOp(_0x4804b1)) {
									return sendText(_0x4804b1, {
										'text1': "%ocrp.homes.send.error.iam"
									}, 0x0);
								}
								const _0x50a974 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x93487(_0x43b657.id);
								const _0x56be3c = _0x50a974.getValue("AllHomesOfFriends", []) || [];
								_0x50a974.setValue('AllHomesOfFriends', _0x56be3c.concat(_0x2d0640.unicalCode));
								if (_0x1b5d97.formValues[0x1] === 0x2) {
									_0x50a974.setValue(_0x2d0640.unicalCode, true);
								}
								_0x2d0640.addFriend(_0x43b657.id);
								sendText(_0x4804b1, {
									'text1': "%ocrp.homes.send.accts.add.friend",
									'text2': _0x43b657.name,
									'text3': '%ocrp.homes.send.accts.add.friend.1',
									'text4': _0x2d0640.getName()
								}, 0x0);
								if (_0x5c1f87.isOnline()) {
									return sendText(_0x43b657, {
										'text1': _0x4804b1.name,
										'text2': "%ocrp.homes.send.accts.add.friend.user",
										'text3': _0x2d0640.getName()
									}, 0x0);
								}
							});
							return;
						}
						const _0x2df77e = _0xde0bfd[_0x19c68e.selection - 0x1];
						const _0x4d8af2 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x93487(_0x2df77e);
						const _0x15a36f = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x2df77e);
						const _0x4bf15 = _0x4d8af2.getValue("AllHomesOfFriends", []) || [];
						_0x4d8af2.setValue("AllHomesOfFriends", _0x4bf15.filter(_0x456a16 => _0x456a16 !== _0x2d0640.unicalCode));
						_0x4d8af2.removeValue(_0x2d0640.unicalCode);
						_0x2d0640.removeFriend(_0x2df77e);
						sendText(_0x4804b1, {
							'text1': "%ocrp.homes.send.accts.remove.friend",
							'text2': _0x15a36f.getName(),
							'text3': "%ocrp.homes.send.accts.remove.friend.1",
							'text4': _0x2d0640.getName()
						}, 0x0);
						if (_0x15a36f.isOnline()) {
							return sendText(returnPlayer(_0x2df77e), {
								'text1': _0x4804b1.name,
								'text2': "%ocrp.homes.send.accts.remove.friend.user",
								'text3': _0x2d0640.getName()
							}, 0x0);
						}
					});
					return;
				case 0x3:
					if (!_0x4221bc) {
						return sendText(_0x4804b1, {
							'text': "%ocrp.homes.send.error.no.acc"
						}, 0x0);
					}
					sendText(_0x4804b1, {
						'text1': '%ocrp.homes.send.remove.home',
						'text2': _0x2d0640.getName()
					}, 0x0);
					return _0x2d0640.removeHome();
				case 0x0:
					if (!_0x4221bc) {
						return sendText(_0x4804b1, {
							'text': "%ocrp.homes.send.error.no.acc"
						}, 0x0);
					}
					const _0x1d83fc = new ModalFormData().title(_0x21621e + "§l§f | §r§f" + _0x2d0640.getName()).textField(_0x21621e + " %ocrp.homes.form.home.edit.ui.body\n\n%ocrp.homes.form.accts.addName", '', _0x2d0640.getName()).textField("\n%ocrp.homes.form.home.add.ui.description", '', _0x2d0640.getDescription()).dropdown("\n%ocrp.homes.form.home.add.ui.dropdown", BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3a5c93, Number(_0x2d0640.getIcon(true))).textField("\n%ocrp.homes.form.home.edit.ui.textField", '', _0x2d0640.getLocation());
					if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x85eb1c) {
						_0x1d83fc.dropdown("\n%ocrp.homes.form.home.edit.ui.dropdown", [" §fOverWorld", " §fNether", " §fThe End"], _0x2d0640.getModal());
					}
					_0x1d83fc.show(_0x4804b1).then(_0x84d10c => {
						if (_0x84d10c.canceled) {
							return;
						}
						if (/^(-?\d+)_(-?\d+)_(-?\d+)$/.test(_0x84d10c.formValues[0x3])) {
							const _0x93d2c4 = [ZxkDimensionTypes.Overworld, ZxkDimensionTypes.Nether, ZxkDimensionTypes.TheEnd];
							_0x2d0640.setHome({
								'name': _0x84d10c.formValues[0x0],
								'description': _0x84d10c.formValues[0x1],
								'icon': _0x84d10c.formValues[0x2],
								'ubica': _0x84d10c.formValues[0x3],
								'dimension': _0x93d2c4[_0x84d10c.formValues[0x4] ?? _0x2d0640.getModal() ?? 0x0],
								'modal': _0x84d10c.formValues[0x4]
							});
							sendText(_0x4804b1, {
								'text1': "%ocrp.homes.send.update"
							}, 0x0);
						} else {
							sendText(_0x4804b1, {
								'text1': '%ocrp.homes.send.error.edit.home'
							}, 0x0);
						}
					});
					break;
			}
		});
	});
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x263a89(_0x2d4894) {
	let _0x4c7c2f = BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x18dd59;
	const _0x524cf9 = () => {
		sendText(_0x2d4894, {
			'text1': '%ocrp.homes.send.teleport.current§c',
			'text2': _0x4c7c2f-- + 's'
		}, 0x0);
		if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.get(_0x2d4894) >= BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x18dd59 - 0x2) {
			loadFullScreen(_0x2d4894);
		} else {
			BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.set(_0x2d4894, (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.get(_0x2d4894) || 0x0) + 0x1);
		}
		if (_0x4c7c2f < 0x0) {
			_0x4c7c2f = 0x0;
			BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x58922b(_0x2d4894);
		}
	};
	const _0x578197 = system.runInterval(_0x524cf9, 0x14);
	BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x570af0.set(_0x2d4894, _0x578197);
	return _0x578197;
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1082ab(_0x5d74a7, _0x586391, _0x1dc610) {
	const _0x3c342b = () => {
		try {
			if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2261de) {
				const _0x3c324a = new ZVector(0x0, 0x0, 0x0);
				const _0x2b55a9 = new ZVector(_0x5d74a7.getVelocity().x, _0x5d74a7.getVelocity().y, _0x5d74a7.getVelocity().z);
				if (!_0x3c324a.equals(_0x2b55a9)) {
					BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x58922b(_0x5d74a7);
					return;
				}
			}
			if (!BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2d6d47) {
				return;
			}
			const _0x33f65a = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3eb6af(_0x1dc610);
			const _0x180eea = "ocrp:a" + (_0x33f65a.getParticleCustom() ?? '');
			const _0x439d9c = "ocrp:c" + (_0x33f65a.getParticleCustom() ?? '');
			try {
				world.getDimension(_0x586391.getDimension()).spawnParticle(_0x439d9c, _0x586391.getVct());
				world.getDimension(_0x5d74a7.dimension.id).spawnParticle(_0x439d9c, _0x5d74a7.location);
				if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.get(_0x5d74a7) >= BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x18dd59 - 0x2) {
					world.getDimension(_0x5d74a7.dimension.id).spawnParticle(_0x180eea, _0x5d74a7.location);
					world.getDimension(_0x5d74a7.dimension.id).spawnParticle(_0x180eea, _0x5d74a7.location);
					system.runTimeout(() => {
						if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x97bc5d.get(_0x5d74a7)) {
							BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x97bc5d.set(_0x5d74a7, false);
							return;
						}
						;
						world.getDimension(_0x586391.getDimension()).spawnParticle(_0x439d9c, _0x586391.getVct());
						world.getDimension(_0x586391.getDimension()).spawnParticle(_0x180eea, _0x586391.getVct());
					}, 60);
					return;
				}
			} catch (_0x3aeb4a) {
				world.getDimension(_0x5d74a7.dimension.id).spawnParticle(_0x439d9c, _0x5d74a7.location);
				if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.get(_0x5d74a7) >= BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x18dd59 - 0x2) {
					world.getDimension(_0x5d74a7.dimension.id).spawnParticle(_0x180eea, _0x5d74a7.location);
					world.getDimension(_0x5d74a7.dimension.id).spawnParticle(_0x180eea, _0x5d74a7.location);
					system.runTimeout(() => {
						if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x97bc5d.get(_0x5d74a7)) {
							BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x97bc5d.set(_0x5d74a7, false);
							return;
						}
						;
						world.getDimension(_0x586391.getDimension()).spawnParticle(_0x439d9c, _0x586391.getVct());
						world.getDimension(_0x586391.getDimension()).spawnParticle(_0x180eea, _0x586391.getVct());
					}, 60);
					return;
				}
			}
		} catch (_0x1fa337) { }
	};
	const _0x42651d = system.runInterval(_0x3c342b, 0x1);
	BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4fff91.set(_0x5d74a7, _0x42651d);
	return _0x42651d;
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3ac540(_0x47a60e, _0xedb940) {
	system.runTimeout(() => {
		if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x30fe84.get(_0x47a60e)) {
			BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x30fe84.set(_0x47a60e, false);
			return;
		}
		_0x47a60e.teleport(_0xedb940.getVct(), {
			'checkForBlocks': true,
			'keepVelocity': false,
			'dimension': world.getDimension(_0xedb940.getDimension() || ZxkDimensionTypes.Overworld)
		});
		sendText(_0x47a60e, {
			'text1': "%ocrp.homes.send.teleport",
			'text2': _0xedb940.getName()
		}, 0x0);
		BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.set(_0x47a60e, 0x0);
		system.clearRun(BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x570af0.get(_0x47a60e));
		system.clearRun(BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4fff91.get(_0x47a60e));
	}, 0x14 * BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x18dd59);
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x58922b(_0x29d9c7) {
	system.runTimeout(() => {
		BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x50f418.set(_0x29d9c7, 0x0);
		BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x30fe84.set(_0x29d9c7, true);
		BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x97bc5d.set(_0x29d9c7, true);
		if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x570af0.get(_0x29d9c7)) {
			system.clearRun(BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x570af0.get(_0x29d9c7));
		}
		if (BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4fff91.get(_0x29d9c7)) {
			system.clearRun(BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x4fff91.get(_0x29d9c7));
		}
	}, 0x1);
	sendText(_0x29d9c7, {
		'text1': "%ocrp.homes.send.error.movement.home"
	}, 0x0);
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x3d9002(_0x282f63) {
	return /^(-?\d+)_(-?\d+)_(-?\d+)$/.test(_0x282f63);
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0xfd2c43(_0x3f7cba, _0x5738de, _0x2f1493) {
	try {
		const _0xe37215 = new ActionFormData();
		_0xe37215.title("New Here??");
		_0xe37215.body("Thanks for downloading §cUAssist Homes§f, a simple and basic set home addon. This project is still in beta, so if you find any bugs, you can report them to §cjosemerohdp§f on §1discord§f. I hope you enjoy it, until next time.\n\n\n SixzJ");
		_0xe37215.button("§fAccept");
		_0xe37215.show(_0x3f7cba).then(() => {
			const _0x47fbbf = {
				'fade': 0.5,
				'loop': true,
				'volume': 0x1
			};
			_0x3f7cba.playSound(ZxkSoundTypes.randomLevelUp, _0x47fbbf);
			system.run(() => _0x5738de(_0x3f7cba, _0x2f1493));
		});
	} catch (_0xa61ae3) {
		consoleLog("Error en formularios[qqBienvenido]: " + _0xa61ae3.message);
	}
}
export { BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1b5e83 as UIGeneral, BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1a0656 as UIAdminPlayers, BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0xfd2c43 as UIWelcome };