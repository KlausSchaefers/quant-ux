import Grouping from './Grouping'

export default class DataFrame {

	constructor(data) {
		this.data = data
		this._isDataFrame = true
	}

	as_array() {
		if (this.data.length) {
			return this.data;
		} else {
			var result = [];
			this.foreach(function (row) {
				result.push(row);
			});
			return result;
		}
	}

	as_dict(key) {
		const arr = this.as_array()
		const result = {}
		arr.forEach(row => {
			result[row[key]] = row
		})
		return result
	}

	push(row) {
		if (this.data.push) {
			this.data.push(row);
		} else {
			console.warn("Data is not array. cannot push");
		}
	}


	select(column, operator, value) {

		const result = [];
		let inLookup = null
		if (operator === 'in') {
			if (Array.isArray(value)) {
				inLookup = {}
				value.forEach(v => {
					inLookup[v] = true
				})				
			}
		}

		this.foreach(function (row) {

			const v = row[column];

			switch (operator) {
				case "==":
					if (v == value) {
						result.push(row);
					}
					break;
				case ">=":
					if (v >= value) {
						result.push(row);
					}
					break;
				case "<=":
					if (v <= value) {
						result.push(row);
					}
					break;
				case ">":
					if (v > value) {
						result.push(row);
					}
					break;
				case "<":
					if (v < value) {
						result.push(row);
					}
					break;
				case "!=":
					if (v != value) {
						result.push(row);
					}
					break;
				case "in":
					if (inLookup && inLookup[v]) {
						result.push(row);
					} else if (value.indexOf(v) >= 0) {
						result.push(row);
					}
					break;
				default:
					break;
			}
		});
		return new DataFrame(result);

	}

	columns() {
		var result = [];
		for (let i in this.data) {
			let row = this.data[i];
			for (let c in row) {
				result.push(c);
			}
			break;
		}
		return new DataFrame(result);
	}

	shape() {
		var l = this.size();
		var count = 0;
		for (let i in this.data) {
			let row = this.data[i];
			// could be done with objetc count...
			for (let c in row) { // eslint-disable-line no-unused-vars
				count++;
			}
			if (count == 0) {
				count = 1;
			}
			break;
		}
		return [l, count];
	}

	length() {
		return this.size();
	}

	size() {
		if (this.data && this.data.length) {
			return this.data.length;
		}

		if (this.data) {
			var size = 0;
			this.foreach(function () {
				size++;
			});
			return size;
		}
		return 0;
	}


	row(row, value) {
		if (value) {
			this.data[row] = value;
		} else {
			var v = this.data[row];
			if (v != null && isNaN(v) && !v._isDataFrame && !v.substring) {
				return new DataFrame(v);
			}
			return v;
		}
	}


	column(column, value) {
		if (value) {
			var data = this.data;
			this.foreach(function (v, i) {
				data[i][column] = value.get(i);
			}, column);
		} else {
			let result = {};
			this.foreach(function (v, i) {
				result[i] = v;
			}, column);
			return new DataFrame(result);
		}
	}

	get(row, column, defaultValue) {
		if (column != null && row != null) {
			return this.data[row][column];
		} else if (row != null) {
			/**
			 * FIXME This is very inefficnet! We hsould have some how a kind of variable what tells me
			 * what is to do! So in case
			 *
			 * BUG: is nun returns true for an [2000]
			 */
			var value = this.data[row];

			if (value && isNaN(value) && !value._isDataFrame && !value.substring) {
				return new DataFrame(value);
			}

			if (value == null || value == undefined) {
				value = defaultValue;
			}
			return value;

		}
	}
	
	col(column) {
		var result = [];
		this.foreach(function (value, id) {
			result[id] = value[column];
		});
		return new DataFrame(result);
	}


	hist(column, bins, p_min, p_max) {
		var values = [];
		var max = false;
		var min = false;
		this.foreach(function (value) {

			var v = value;
			if (column) {
				v = value[column];
			}

			values.push(v);
			if (max === false) {
				max = v;
			} else {
				max = Math.max(max, v);
			}

			if (min === false) {
				min = v;
			} else {
				min = Math.min(min, v);
			}
		});

		if (p_min != null && p_min != undefined) {
			min = p_min;
		}

		if (p_max != null && p_max != undefined) {
			max = p_max;
		}


		var width = (max - min) / bins;

		var buckets = [];
		for (let i = 0; i < bins; i++) {
			buckets[i] = {
				bucket: i,
				count: 0,
				from: (i * width) + min,
				to: ((i + 1) * width) + min
			}
		}



		for (let i = 0; i < values.length; i++) {
			var v = values[i];
			/**
			 * FIXME: This is somehow stupidly naive. Can't we calcute the
			 * bucket number somehow like:
			 *
			 *  var norm_v = v - min;
			 *  var b = Math.min(bins-1, Math.round(norm_v * width));
			 *
			 *  The round is false in here...
			 */

			/**
			 * We take the first bucket that fits!!!
			 */
			for (var b = 0; b < bins; b++) {
				var bucket = buckets[b];
				if (v >= bucket.from && v <= bucket.to) {
					bucket.count++;
					break;
				}
			}

		}
		return new DataFrame(buckets);
	}




	/**
	 * shall not be used!
	 */
	set(row, column, value) {
		if (column != null && row != null) {
			this.data[row][column] = value;
		} else if (row != null) {
			this.data[row] = value;
		}
	}

	sortBy(column, desc) {
		/**
		 * FIXME
		 */
		if (this.data.length || this.data.length == 0) {

			this.data.sort(function (a, b) {

				if (a._isDataFrame && b._isDataFrame) {
					if (desc) {
						return b.get(column) - a.get(column);
					} else {
						return a.get(column) - b.get(column);
					}

				} else {
					if (desc) {
						return b[column] - a[column];
					} else {
						return a[column] - b[column];
					}

				}
			});

		} else {
			console.error("Can onyl sort array of objects!");
		}
	}

	add(column, value) {
		if (!value) {
			value = column;
			column = null;
		}
		if (value._isDataFrame) {
			this.foreach(function (v, i) {
				return v + value.get(i);
			}, column);
		} else {
			this.foreach(function (v) {
				return v + value;
			}, column);
		}

	}

	minus(column, value) {
		if (!value) {
			value = column;
			column = null;
		}
		if (value._isDataFrame) {
			console.debu
			this.foreach(function (v, i) {
				return v - value.get(i);
			}, column);
		} else {
			this.foreach(function (v) {
				return v - value;
			}, column);
		}
	}

	mutliply(column, value) {
		if (!value) {
			value = column;
			column = null;
		}
		if (value._isDataFrame) {
			this.foreach(function (v, i) {
				return v * value.get(i);
			}, column);
		} else {
			this.foreach(function (v) {
				return v * value;
			}, column);
		}
	}

	divide(column, value) {
		if (!value) {
			value = column;
			column = null;
		}
		if (value._isDataFrame) {
			this.foreach(function (v, i) {
				return v / value.get(i);
			}, column);
		} else {
			this.foreach(function (v) {
				return v / value;
			}, column);
		}
	}

	median(column) {
		let list = []
		this.foreach(function (value) {
			list.push(value)
		}, column);
		list = list.sort(function (a, b) {
			return a - b
		})
		if (list.length > 0) {
			return list[Math.max(0, Math.floor(list.length / 2) - 1)];
		}
		return 0
	}

	mean(column) {
		const sum = this.sum(column);
		if (this.size() === 0) {
			return 0
		}
		return sum * 1.0 / this.size();
	}


	max(column) {
		let max = Number.MIN_VALUE;
		this.foreach(function (value) {
			max = Math.max(max, value);
		}, column);
		return max;
	}


	min(column) {
		let min = Number.MAX_VALUE;
		this.foreach(function (value) {
			min = Math.min(min, value);
		}, column);
		return min;
	}


	variance(column) {
		var mean = this.mean(column);
		var variance = 0;
		this.foreach(function (value) {
			var dif = mean - value;
			variance += (dif * dif);
		}, column);
		return variance * 1.0 / this.size();
	}

	std(column) {
		return Math.sqrt(this.variance(column));
	}

	sum(column) {
		var sum = 0;
		/**
		 * FIXME: we should check if we have to return a scaler or DataFrame in case column is null
		 */
		this.foreach(function (value) {
			sum += value;
		}, column);
		return sum;
	}

	/**
	 * returns the number of unique values in a column
	 */
	unique(column) {
		var temp = {};
		var result = 0;
		this.foreach(function (value) {
			if (!temp[value]) {
				temp[value] = true;
				result++;
			}
		}, column);
		return result;
	}


	/**
	 * returns the number of unique values in a column
	 */
	uniqueValues(column) {
		var temp = {};
		var result = [];
		this.foreach(function (value) {
			if (!temp[value]) {
				temp[value] = true;
				result.push(value);
			}
		}, column);
		return new DataFrame(result);
	}

	count(column) {
		var result = {};
		this.foreach(function (value) {
			if (!result[value]) {
				result[value] = 0;
			}
			result[value]++;
		}, column);
		return new DataFrame(result);
	}

	groupBy(column) {
		var temp = {};
		this.foreach(function (row) {
			var value = row[column];
			if (!temp[value]) {
				temp[value] = new DataFrame([]);
			}
			temp[value].push(row);
		});
		return new Grouping(temp);
	}

	foreach(callback, column) {
		/**
		 * if(column == null){
		 * loop over all columns}
		 */
		//console.debug("foreach", this.data.length, column)
		if (this.data.length) {
			//console.debug("  -> Array");
			for (let i = 0; i < this.data.length; i++) {
				let row = this.data[i];
				if (column) {

					let value = callback(row[column], i);
					if (value != null) {
						row[column] = value;
					}
				} else {
					let value = callback(row, i);
					if (value != null) {
						this.data[i] = value;
					}
				}
			}
		} else {
			//	console.debug("  -> Object");
			for (let i in this.data) {
				let row = this.data[i];
				//	console.debug(" o ", row[column]);
				if (column) {
					let value = callback(row[column], i);
					if (value != null) {
						row[column] = value;
					}
				} else {
					let value = callback(row, i);
					if (value != null) {
						this.data[i] = value;
					}
				}
			}
		}
	}

	/**
	 * Set an index over some columns for faster lookup via the "ix()" method.
	 * We basically build up a tree which maps the values to the right row..
	 *
	 */
	setIndex(keys) {

		var index = {}
		var l = keys.length;
		this.foreach(function (row, i) {
			var node = index;
			for (let k = 0; k < l; k++) {
				var key = keys[k];
				let value = row[key];
				if (!node[value]) {
					if (k == l - 1) {
						if (node[value] == null) {
							node[value] = i;
						} else {
							/**
							 * FIXME: Is this really a restriction??
							 */
							console.error("Multi index not supoprted");
						}

					} else {
						node[value] = {};
					}
				}
				node = node[value];
			}

		});

		this.index = index;
	}

	/**
	 * get *ONE* row by index values. The value have to be in the same
	 * order as the columns called in the setIndex!
	 *
	 * @param values: array of values to be found
	 *
	 * @includeIndex boolean: Also return the index not only the row. If true, the result
	 * 						  will look like {row:..., index:key}, where key is int or string
	 *
	 */
	ix(values, includeIndex) {

		if (this.index) {

			var node = this.index;
			var l = values.length
			for (var k = 0; k < l; k++) {
				var value = values[k];
				if (node[value] != null) {
					if (k == l - 1) {
						var index = node[value];
						if (includeIndex) {
							return {
								row: this.data[index],
								index: index
							};
						} else {
							return this.data[index];
						}

					} else {
						node = node[value];
					}
				} else {
					return null;
				}
			}
		} else {
			console.error("DataFrame.ix() > Error: No Index!");
		}
		return null;
	}


	remove(row) {
		if (this.data.length) {
			this.data.splice(row, 1);
		} else {
			delete this.data[row];
		}
	}


	print() {
		var header = false;
		var me = this;
		var s = "";
		this.foreach(function (row) {

			if (!header) {
				header = true;
				for (let k in row) {
					s += me._correctLength(k, Math.max(20, k.length)) + " | ";
				}
				s += "\n";
			}
			for (let k in row) {
				s += me._correctLength(row[k] + "", Math.max(20, k.length)) + " | ";
			}
			s += "\n";
		});

		console.debug(s);
		return s;
	}

	_correctLength(s, l) {
		s += "";
		if (s.length < l) {
			while (s.length < l)
				s += " ";
		} else {
			s = s.substring(0, l - 3) + ".. ";
		}
		return s;
	}


	toCSV(columns) {
		var s = "";
		var l = columns.length;
		this.foreach(function (row) {
			for (let i = 0; i < l; i++) {
				var c = columns[i];
				if (i > 0) {
					s += ",";
				}
				s += row[c];
			}
			s += "\n";
		});

		return s;
	}


	roundTimestampToDate(column) {
		this.foreach(function (timestamp) {
			if (timestamp) {
				var d = new Date(timestamp);
				d.setMinutes(0);
				d.setMilliseconds(0);
				return d.getTime();
			}
			return 0;
		}, column)
	}

	merge (other) {
		if (Array.isArray(this.data) && Array.isArray(other.data)) {
			let newData = this.data.concat(other.data)
			return new DataFrame(newData)
		}
		console.error('DataFrame.merge() > Cannot merge to object frames')
		return new DataFrame([])
	}

}