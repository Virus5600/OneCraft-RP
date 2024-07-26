import { system, world } from '@minecraft/server';
export default class ZXKDatabase {
	constructor(_0x9b219a, _0x4df4ba = 'zdb:', _0x40afcb = "cpt") {
		this.unicalName = _0x9b219a;
		this.folder = _0x40afcb;
		this.prefix = _0x4df4ba;
		this.dbName = '' + _0x4df4ba + _0x9b219a;
		this.initializeDatabase();
		this.data = this.createProxy(this.getData());
	}
	["initializeDatabase"]() {
		if (!this.databaseExists()) {
			this.createDatabase();
		}
	}
	["databaseExists"]() {
		return world.getDynamicPropertyIds().includes(this.dbName);
	}
	["createDatabase"]() {
		world.setDynamicProperty(this.dbName, '§');
	}
	["createProxy"](_0x4e087e) {
		return new Proxy(_0x4e087e, {
			'get': (_0x297953, _0x1f7971) => {
				return Array.isArray(_0x297953[_0x1f7971]) ? this.createProxy(_0x297953[_0x1f7971]) : _0x297953[_0x1f7971];
			},
			'set': (_0x4ec034, _0x3cf7b7, _0x2b826b) => {
				_0x4ec034[_0x3cf7b7] = _0x2b826b;
				this.scheduleDataSave();
				return true;
			},
			'deleteProperty': (_0x5e06b8, _0x264502) => {
				delete _0x5e06b8[_0x264502];
				this.scheduleDataSave();
				return true;
			},
			'has': (_0x56ca66, _0x22b010) => {
				return _0x22b010 in _0x56ca66;
			},
			'ownKeys': _0x5e837c => {
				return Reflect.ownKeys(_0x5e837c);
			}
		});
	}
	["scheduleDataSave"]() {
		if (!this.savingData) {
			this.savingData = true;
			system.run(() => {
				this.saveData();
				this.savingData = false;
			});
		}
	}
	["getData"]() {
		const _0x1f8e0e = world.getDynamicProperty(this.dbName);
		if (typeof _0x1f8e0e === "string") {
			if (_0x1f8e0e === '§') {
				return {};
			}
			try {
				return JSON.parse(_0x1f8e0e);
			} catch (_0x30bbb6) {
				return {};
			}
		}
		return {};
	}
	["saveData"]() {
		const _0xfdbc03 = JSON.stringify(this.data);
		world.setDynamicProperty(this.dbName, _0xfdbc03);
	}
	static ["getPercentageOfTotalUsage"]() {
		const _0x5a5bc2 = world.getDynamicPropertyTotalByteCount() / 0x7fff * 0x64;
		return _0x5a5bc2.toFixed(0x2);
	}
	static ["getSubsDatabases"](_0x3d6722) {
		const _0x4b5580 = world.getDynamicPropertyIds();
		const _0x36966a = '[' + _0x3d6722 + ']:sub=';
		return _0x4b5580.filter(_0x4bde17 => _0x4bde17.startsWith(_0x36966a));
	}
	static ['getDatabases'](_0x1d4111 = 'zdb:') {
		const _0x4b02b5 = world.getDynamicPropertyIds();
		return _0x4b02b5.filter(_0x1a7424 => _0x1a7424.startsWith(_0x1d4111));
	}
	static ["getInstance"](_0x5f2c36, _0x477204 = 'zdb:') {
		const _0x5b7c4a = '' + _0x477204 + _0x5f2c36;
		return new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1ae7db(_0x5b7c4a, _0x477204);
	}
	static ["deleteAll"]() {
		this.getDatabases().forEach(_0x1f65a1 => {
			world.setDynamicProperty(_0x1f65a1);
		});
	}
	["hasKey"](_0x4dd4e6) {
		const _0x472c9c = this.data;
		if (this.folder === '') {
			return _0x4dd4e6 in _0x472c9c;
		}
		return _0x4dd4e6 in _0x472c9c[this.folder];
	}
	["hasValue"](_0x142084, _0x4bd0fb) {
		const _0x5ccf1c = this.data;
		if (_0x142084 === '') {
			return _0x4bd0fb in _0x5ccf1c[this.folder];
		}
		return _0x4bd0fb in _0x5ccf1c[this.folder][_0x142084];
	}
	['getValue'](_0x1f4005, _0x448ead) {
		try {
			return this.folder === '' ? this.data[_0x1f4005] : this.data[this.folder][_0x1f4005];
		} catch (_0x364e78) {
			return _0x448ead;
		}
	}
	["setValue"](_0x4417bc, _0x56f316) {
		this.data[this.folder][_0x4417bc] = _0x56f316;
		this.scheduleDataSave();
	}
	["removeValue"](_0x1aaf08) {
		delete this.data[this.folder][_0x1aaf08];
		this.scheduleDataSave();
	}
	["newValue"](_0x22d194) {
		this.data[this.folder] = _0x22d194;
		this.scheduleDataSave();
	}
	["deleteDB"]() {
		world.setDynamicProperty(this.dbName);
		this.data = {};
	}
	["showContent"]() {
		let _0x4d5c72 = [];
		const _0x3974e9 = this.data[this.folder];
		for (const _0x2fa40a of Object.keys(_0x3974e9)) {
			_0x4d5c72.push(_0x2fa40a + ": " + JSON.stringify(_0x3974e9[_0x2fa40a]) + '§r');
		}
		return _0x4d5c72;
	}
	["subDataBase"](_0x18871e) {
		return new BY_SIXZJ_ON_DISCORD_JOSEMEROHDP_0x1ae7db(_0x18871e, this.prefix);
	}
}