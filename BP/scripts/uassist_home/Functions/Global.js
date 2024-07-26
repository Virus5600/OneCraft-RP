import { UAConfig } from '../Config/UAConfig';
import BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x526507 from '../DataBase/ZXKDatabase';
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x26af75(_0x4df13e) {
	if (UAConfig.Developer.ConsoleLog) {
		return console.warn(_0x4df13e);
	}
}
function BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x536a5c() {
	const _0x53d434 = new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x526507("UUIDs");
	const _0x9e366e = _0x53d434.getValue("alm", []);
	let _0xf2e889;
	do {
		_0xf2e889 = Math.random().toString(0x24).substring(0x2, 0x8);
	} while (_0x9e366e.includes(_0xf2e889));
	_0x53d434.newValue({
		'alm': _0x9e366e.concat(_0xf2e889)
	});
	BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x26af75("Código generado: " + _0xf2e889);
	return _0xf2e889;
}
export { BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x26af75 as consoleLog, BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x536a5c as generarCodigoUnico };