import { world } from '@minecraft/server';
import { AnuncioE, NotifiE, SystemE, TiendaE } from '../Constants/Emojis';
import { UAConfig } from '../Config/UAConfig';
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x542e8f from '../Class/ZPlayers';
const {
	Homes: {
		Animations: {
			TeleportAnimationScreen: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0xe2899f
		}
	},
	Admin: {
		Tags: BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0xbdd1ef
	}
} = UAConfig;
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x7e0365(_0x4391e0, _0x5d4daa = {}, _0x4b0dbd) {
	try {
		const _0x21eac3 = [SystemE, AnuncioE, NotifiE, TiendaE];
		const _0x4bd314 = _0x21eac3[_0x4b0dbd];
		const _0xf0c9c4 = Object.keys(_0x5d4daa).map(_0x5b48d2 => _0x5d4daa[_0x5b48d2]).join(" ");
		_0x4391e0.sendMessage(_0x4bd314[Math.floor(Math.random() * 0x5)] + " " + _0xf0c9c4);
	} catch (_0x32ab18) {
		throw new Error(_0x32ab18.message);
	}
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2f4dd9(_0x31fdd2) {
	return world.getAllPlayers().find(_0x263627 => _0x263627.id === _0x31fdd2);
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2ac1ab(_0x21a19e) {
	if (!BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0xe2899f) {
		return;
	}
	const _0x5287ed = {
		'': {
			'red': 0.996,
			'green': 0.498,
			'blue': 0x0
		},
		'_black': {
			'red': 0x0,
			'green': 0x0,
			'blue': 0x0
		},
		'_red': {
			'red': 0x1,
			'green': 0x0,
			'blue': 0.156
		},
		'_purple': {
			'red': 0.78,
			'green': 0x0,
			'blue': 0.956
		},
		'_white': {
			'red': 0x1,
			'green': 0x1,
			'blue': 0x1
		},
		'_green': {
			'red': 0x0,
			'green': 0.954,
			'blue': 0.086
		}
	};
	const _0x29f94e = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x542e8f(_0x21a19e.id);
	_0x21a19e.camera.fade({
		'fadeTime': {
			'fadeInTime': 0.5,
			'fadeOutTime': 0.5,
			'holdTime': 0x1
		},
		'fadeColor': _0x5287ed[_0x29f94e.getParticleCustom() ?? '']
	});
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1a3f1d(_0x563695) {
	if (_0x563695.isOp()) {
		return true;
	}
	for (const _0x551767 of BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0xbdd1ef) {
		if (_0x563695.hasTag(_0x551767)) {
			return true;
		}
	}
	return false;
}
export { BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x7e0365 as sendText, BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2f4dd9 as returnPlayer, BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x2ac1ab as loadFullScreen, BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1a3f1d as isOp };