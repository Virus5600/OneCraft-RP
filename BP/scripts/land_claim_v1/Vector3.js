export default class Vector3 {
	x;
	y;
	z;

	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	normalized() {
		let scalar = (1 / (this.length() || 1));

		this.x *= scalar;
		this.y *= scalar;
		this.z *= scalar;

		return this;
	}

	static add(v1, v2) {
		return new Vector3(
			v1.x + v2.x,
			v1.y + v2.y,
			v1.z + v2.z
		);
	}

	static subtract(v1, v2) {
		return new Vector3(
			v1.x - v2.x,
			v1.y - v2.y,
			v1.z - v2.z
		);
	}

	static multiply(v1, num) {
		return new Vector3(
			v1.x * num,
			v1.y * num,
			v1.z * num
		);
	}

	static divide(v1, v2) {
		return new Vector3(
			v1.x / v2.x,
			v1.y / v2.y,
			v1.z / v2.z
		);
	}

	static distance(v1, v2) {
		return Math.sqrt(
			Math.pow(v1.x - v2.x, 2) +
			Math.pow(v1.y - v2.y, 2) +
			Math.pow(v1.z - v2.z, 2)
		);
	}
}