import DataFrame from "./DataFrame";

export default class Grouping {

	constructor(data) {
		this.data = data
		this._isDataFrame = false
	}

	as_array() {
		var result = [];
		this.foreach(function (row) {
			result.push(row);
		});
		return result;
	}


	size() {
		return this._foreach("size");
	}

	get(i) {
		return this.data[i];
	}


	count(column) {
		var temp = this._foreach("count", column);
		return new Grouping(temp.data);
	}

	max(column) {
		return this._foreach("max", column);
	}

	min(column) {
		return this._foreach("min", column);
	}

	mean(column) {
		return this._foreach("mean", column);
	}

	variance(column) {
		return this._foreach("variance", column);
	}

	std(column) {
		return this._foreach("std", column);
	}

	sum(column) {
		return this._foreach("sum", column);
	}

	unique(column) {
		return this._foreach("unique", column);
	}

	groupBy() {

	}

	foreach(callback) {
		for (let i in this.data) {
			var df2 = this.data[i];
			callback(df2, i);
		}
	}

	_foreach(method, column) {
		var result = {};
		for (let i in this.data) {
			var df2 = this.data[i];
			var x = df2[method](column);		
			result[i] = x;
		}
		return new DataFrame (result);
	}

	print(deep) {
		for (let i in this.data) {
			var df2 = this.data[i];
			if (deep) {
				df2.foreach(function (row, j) {
					console.debug("  ", j, row);
				});
			}
		}
	}
}