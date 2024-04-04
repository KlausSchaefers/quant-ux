import lang from '../dojo/_base/lang'
import DataFrame from '../common/DataFrame'
import Grouping from '../common/Grouping'
import PerformanceMonitor from '../core/PerformanceMonitor'


export default class {

	filterEvents (events, anno) {
		PerformanceMonitor.start('Analytics.filterEvents()',events.length)
		const bad = {};
		for (let i = 0; i < anno.length; i++) {
			let a = anno[i];
			if (!a.isValid) {
				bad[a.reference] = true;
			}
		}
		const temp = [];
		const l = events.length;
		for (let i = 0; i < l; i++) {
			var e = events[i];
			if (!bad[e.session]) {
				temp.push(e);
			}
		}
		PerformanceMonitor.end('Analytics.filterEvents()')
		return temp;
	}

	getSurveyAnswers (events, app, test, options) {
		PerformanceMonitor.start('Analytics.getSurveyAnswers()',events.length)
		const showId = options.showId
		const showTasksSucess = options.showTasksSucess
		const showTasksDuration = options.showTaskDetails
		const showTasksInteraction = options.showTaskDetails


		const result = {
			ids: [],
			rows: [],
			cols: [],
			labels: [],
			tasks: []
		}

		const eventsDF = new DataFrame(events);
		eventsDF.sortBy("time");

		let taskPer = {}
		if (test.tasks) {
			const taskPerDF = this.getTaskPerformance(eventsDF, test.tasks)
			taskPerDF.foreach(row => {
				if (!taskPer[row.session]) {
					taskPer[row.session] = {}
				}
				taskPer[row.session][row.task] = row
			})
		}


		let widgetColumnNames = {}
		let widgetTypes = {}
		let widgetColums = {}
		Object.values(app.widgets).forEach(w => {

			if (!widgetColumnNames[w.id]) {
				widgetTypes[w.id] = w.type
			
				if (w.props && w.props.isSurveyElement && w.type !== 'Password') {
					if (w.type === 'RadioTable') {
						const data = w.props.data
						if (data) {
				
							widgetColums[w.id] = []
							data.forEach((row, i) => {
								if (i > 0 && row[0]) {
									const col = row[0]
									widgetColums[w.id].push(col)

									result.cols.push({
										hidden: false,
										key: col,
										label: col,
										group: w.name,
										type: 'data',
										id: w.id
									})
								}
							})
					
						}	
					} else {
						widgetColumnNames[w.id] = w.name
						result.cols.push({
							hidden: false,
							key: w.name,
							label: w.name,
							group: w.name,
							type: 'data',
							id: w.id
						})
					}
				}
			}
		})

        result.cols.sort((a,b) => {
          a.group.localeCompare(b.group)
        })

		if (showId) {
			result.cols.unshift({
				key: 'id',
				label: 'ID',
				type: 'id',
				hidden: true,
			})			
		}

		if (test.tasks) {
			test.tasks.forEach(task => {
				if (showTasksSucess) {
					result.cols.push({
						key: task.name,
						label: task.name,
						group: task.name,
						type: 'task',
						hidden: true,
					})					
				}
				if (showTasksDuration) {
					const name = task.name + '_Duration'
					result.cols.push({
						key: name,
						label: name,
						group: task.name,
						type: 'task',
						hidden: true,
					})	
				
				}
				if (showTasksInteraction) {
					const name = task.name + '_Interactions'
					result.cols.push({
						key: name,
						label: name,
						group: task.name,
						type: 'task',
						hidden: true,
					})	
					result.cols.push(task.name + '_Interactions')
				}
			
			})
		}


		const sessionGrouping = eventsDF.groupBy("session");

		/**
		 * sort by start??
		 */
		let id = 1
		sessionGrouping.foreach((df, sessionID) => {
			let label = `Test ${id}`
			const row = {}
			const taskRow = []
			result.cols.forEach(c => row[c] = '-')
			
			df.sortBy("time");
			const sessionEvents = df.as_array();
			sessionEvents.forEach(e => {
				delete e.user
				if (app.widgets[e.widget]) {
					if (e.widget && e.state && widgetColumnNames[e.widget]) {
						const col = widgetColumnNames[e.widget]
						
						if (widgetTypes[e.widget] === 'Rating') {
							row[col] = (e.state.value * 1) + 1
						} else {
							let value = e.state.value
							if (this.isObject(value)) {
								value = Object.entries(value).map((e) => `${e[0]}: ${e[1]}`)
							}
							if (Array.isArray(value)) {
								row[col] = value.join(', ')
							} else {
								row[col] = value					
							}				
							
						}
					} else {
						if (widgetColums[e.widget]) {
							const keys = widgetColums[e.widget]
							const value = e.state.value
							keys.forEach(col => {
								row[col] = value[col]
							})
						} 
					}
				}
			})

			const start = sessionEvents.find(e => e.type === 'SessionStart')
			if (start && start.label) {
			  label = start.label
			}

			if (showId) {
				row['id'] = sessionID
			}

			if (test.tasks) {
				test.tasks.forEach(task => {
					if (taskPer[sessionID] && taskPer[sessionID][task.id]) {
						const taskData = taskPer[sessionID][task.id]
						taskRow.push(taskData)
						if (showTasksSucess) {
							row[task.name] = 'Completed'
						}
						if (showTasksSucess) {
							row[task.name + '_Duration'] = Math.round(taskData.duration / 1000)
						}
						if (showTasksSucess) {
							row[task.name + 'Interactions'] = taskData.interactions
						}
					}
				})
			}
			result.labels.push(label)
			result.tasks.push(taskRow)
			result.ids.push(sessionID)
			result.rows.push(row)
		})

		console.debug(result.labels)

		PerformanceMonitor.end('Analytics.getSurveyAnswers()')
		return result
	}

	isObject(obj) {	
		return typeof obj === 'object' && obj !== null && ! Array.isArray(obj)
	}

	nornalizeContainerChildEvents (events) {
		events.forEach(e => {
			if (e.widget && e.widget.indexOf('-') > 0) {
				e.widget = e.widget.substring(0,e.widget.indexOf('-'))
			}
		})
		return events
	}

	getFirstNClicks(events, numberOfClicks) {
		var filtered = new DataFrame(events);

		var sessionGrouping = filtered.groupBy("session");

		var firstNEvents = [];
		sessionGrouping.foreach(function (df) {
			df.sortBy("time");
			var sessionEvents = df.as_array();
			var count = 0;
			for (var i = 0; i < sessionEvents.length; i++) {
				var event = sessionEvents[i];
				if (event.type == "ScreenLoaded" || event.type == "OverlayLoaded") {
					count = 0;
				} else {
					if (event.x >= 0 && event.y >= 0 && !event.noheat) {
						if (count < numberOfClicks) {
							firstNEvents.push(event);
							count++;
						}
					}
				}

			}
		});
		return firstNEvents;
	}


	getPValueBionimial() {

	}


	getScreenExplorationRate(df, model) {
		const screenCount = Object.keys(model.screens).length;
		const session = df.groupBy("session");
		const uniqueScreenPerSession = session.unique("screen");
		return uniqueScreenPerSession.mean() / screenCount;
	}


	getSuccessTaskNames(tasksPerformance, tasks) {
		const names = {};
		for (var i = 0; i < tasks.length; i++) {
			names[tasks[i].id] = tasks[i].name;
		}
		const result = {};
		const sessionGroup = tasksPerformance.groupBy("session");
		sessionGroup.foreach((session, id)  => {
			const temp = [];
			const successTasks = session.count("task").data;
			for (let taskID in successTasks) {
				temp.push(names[taskID]);
			}
			temp.sort();
			result[id] = temp;
		});
		return result;
	}

	/********************************************************************************************
	 * Tag Stuff
	 *******************************************************************************************/

	getTagAnalytics(tags) {

		const tagCount = {};
		const tagSessionCount = {};
		const tagTime = {};
		for (let i = 0; i < tags.length; i++) {
			const annotation = tags[i];
			const sessions = annotation.sessions;
			for (let id in sessions) {
				const sessionTags = sessions[id];
				const tagCounted = {};
				for (let j = 0; j < sessionTags.length; j++) {
					const t = sessionTags[j];
					if (!tagCount[t.tag]) {
						tagCount[t.tag] = 0;
					}
					tagCount[t.tag]++;
					if (!tagCounted[t.tag]) {
						if (!tagSessionCount[t.tag]) {
							tagSessionCount[t.tag] = 0;
						}
						tagSessionCount[t.tag]++;
						tagCounted[t.tag] = true;
					}
					if (!tagTime[t.tag]) {
						tagTime[t.tag] = 0;
					}
					tagTime[t.tag] += (t.start);
				}
			}
		}
		const result = [];
		for (let tag in tagCount) {
			result.push({
				tag: tag,
				count: tagCount[tag],
				sessions: tagSessionCount[tag],
				time: tagTime[tag] / tagCount[tag]
			});
		}
		return new DataFrame(result);
	}

	/********************************************************************************************
	 * Task Stuff
	 *******************************************************************************************/


	/**
	 * Creates a mini regex matcher for our tasks. It returns the first match of an flow!
	 *
	 * a match has the following properties:
	 *
	 *  duration: how long did the task take
	 *
	 *  count: how much events where between
	 *
	 */
	createMatcher(name, flow, strict) {

		return {
			name: name,
			match: null,
			flowPos: 0,
			step: flow[0],
			endStep: flow[flow.length - 1],
			flow: flow,
			start: null,
			startTime: 0,
			strict: strict,
			taskName: "",
			usePartialMatches: false,

			init(e) {
				this.start = e;
				this.startTime = e.time;
				this.interactions = 0;
			},

			next(e, i) {

				let result = null;

				/**
				 * Since 1.9: Check interactions only if task has started
				 */
				if (this.match) {
					if (e.type == "WidgetClick" ||
						e.type == "WidgetChange" ||
						e.type == "ScreenGesture" ||
						e.type == "WidgetGesture" ||
						e.type == "ScreenClick") {
						this.interactions++;
					}
				}

				/**
				 * check if we match the current event to the current
				 * step in the flow
				 */
				if (this._match(this.step, e)) {
					/**
					 * create a match object
					 */
					if (this.match == null) {

						this.match = {
							startTime: e.time,
							discoveryTime: e.time - this.startTime,
							endTime: 1,
							startPosition: i,
							endPosition: -1,
							duration: 0,
							count: -1,
							interactions: -1,
							partial: false,
							session: e.session,
							task: this.name,
							user: e.user,
							taskName: this.taskName,
							hits:[]
						};
						/**
						 * FIX in  1.9.5. We have to start counting interactions
						 * from the match if it is an interaction event
						 */

						if (e.type == "WidgetClick" ||
							e.type == "WidgetChange" ||
							e.type == "ScreenGesture" ||
							e.type == "WidgetGesture" ||
							e.type == "ScreenClick") {
							this.interactions++;
						}
					}

					/**
					 * Since 4.0.65 we also store the matches events
					 */
					this.match.hits.push({
						time: e.time, pos: i, step: this.flowPos	
					})

					/**
					 * we have matched the last event. pass the match the result and start again
					 */
					if (this.flow.length == this.flowPos + 1) {
						var endTime = this.getEndTime(e);

						this.match.endTime = endTime;
						this.match.endPosition = i;
						this.match.interactions = this.interactions;
						this.match.duration = this.match.endTime - this.match.startTime;
						this.match.count = (this.match.endPosition - this.match.startPosition) + 1;

						/**
						 * We have a hit!! return this match at the end of the method
						 */
						result = this.match;

						/**
						 * reset shit
						 */
						this.match = null;
						this.flowPos = -1 // minus one!!
					}

					

					/**
					 * now move on to the next step
					 */
					this.flowPos++;
					this.step = this.flow[this.flowPos];
				}

				/**
				 * check if we have a partial match. The last step must not be like the
				 * current step.
				 * 
				 * Since 4.3.8 We disabled partical Matches. Not sure if they are needed anywhere???
				 */
				if (this.usePartialMatches) {
					if (this.match != null && !this._match(this.step, this.endStep) && this._match(this.endStep, e)) {
					
						this.match.endTime = e.time;
						this.match.endPosition = i;
						this.match.duration = this.match.endTime - this.match.startTime;
						/**
						 * count on extra. because we start at event 2, than do two more step
						 * and we are at 4. But the user did three steps...
						 */
						this.match.count = (this.match.endPosition - this.match.startPosition) + 1;
						this.match.partial = true;
						result = this.match;

						/**
						 * reset
						 */
						this.reset();
					}
				}

				return result;
			},

			getEndTime(e) {

				if (e.state && e.state.children) {
					var children = e.state.children;
					var max = e.time;
					for (var i = 0; i < children.length; i++) {
						max = Math.max(max, children[i].time);
					}
					return max;
				}
				return e.time;
			},
			/**
			 * a: the flow event
			 * b: event from stream
			 */
			_match(a, b) {
				if ((a && b && a.screen == b.screen && a.widget == b.widget && a.type == b.type)) {
					if ((a.type == "ScreenGesture" && b.type == "ScreenGesture") ||
						(a.type == "WidgetGesture" && b.type == "WidgetGesture")) {
						if (a.gesture && b.gesture) {
							return a.gesture.type == b.gesture.type;
						}
						return false;
					}


					/**
					 * For widget state change events we will look also into the state
					 */
					if ((a.type == "WidgetClick" || a.type == "WidgetChange") && a.state && b.state) {

						var aState = a.state;
						var bState = b.state;


						if (aState.type == "text" || aState.type == "typing" || aState.type == "select" || aState.type == "open" || aState.type == "navigate") {
							/**
							 * For multi value widgets(textboxes, password, & textarea, and select boxes) and dropdown events
							 * we have a special
							 * handling and allow all values
							 */
							return aState.type == bState.type;

						} else {

							/**
							 * Otherwise check if type and value are the same for both states
							 */
							return (aState.type == bState.type) && (aState.value == bState.value);
						}
					}

					if ((a.state && !b.state) || (!a.state && b.state)) {
						return false;
					}
			
					return true;
				}
				return false;
			},

			reset() {
				this.match = null;
				this.flowPos = 0
				this.step = flow[0];
			}

		};

	}

	/**
	 * Does some naive pattern matching. Loops for the entire stream,
	 * and checks from every event of, if we have a match. The matcher returns
	 * the first match!
	 */
	matchFlowInSession(df, flow, taskID, strict) {

		const result = [];
		const matcher = this.createMatcher(taskID, flow, strict)

		df.sortBy("time");
		const events = df.as_array();

		const l = events.length;
		matcher.init(events[0]);
		for (let i = 0; i < l; i++) {
			const e = events[i];
			const m = matcher.next(e, i);
			if (m) {
				if (strict) {
					if (flow.length == m.count) {
						result.push(m);
					}
				} else {
					result.push(m);
				}
			}
		}
		return result;
	}

	getFunnelInteraction(df, task, includeDropOff) {
		const result = {}
		const sessions = this.getTaskPerformance(df, [task])
		sessions.data.forEach(session => {
			this.addFunnelInteractionSteps(result, session, false)
		})

		if (includeDropOff) {
			const subtasks = this.getFunnelTasks(task);
			subtasks.forEach(subTask => {
				if (subTask.flow.length > 2 && subTask.flow.length < task.flow.length) {
					const sessions = this.getTaskPerformance(df, [subTask])
					sessions.data.forEach(session => {
						if (!result[session.session]) {
							this.addFunnelInteractionSteps(result, session, true)
						}
					})
				}
			})
		}

		return result
	}

	addFunnelInteractionSteps (result, session, isDropOff = false) {
		let lastPos = 0
		result[session.session] = []
		session.hits.forEach(hit => {
			const pos = hit.pos - lastPos
			result[session.session].push({
				value: pos,
				dropoff:isDropOff
			})
			lastPos = hit.pos
		})
	}


	getFunnelDuration(df, task, includeDropOff = false) {
		const result = {}
		const sessions = this.getTaskPerformance(df, [task])
		sessions.data.forEach(session => {
			this.addFunnelDurartionSteps(result, session)
		})


		if (includeDropOff) {
			const subtasks = this.getFunnelTasks(task);
			subtasks.forEach(subTask => {
				if (subTask.flow.length > 2 && subTask.flow.length < task.flow.length) {
					const sessions = this.getTaskPerformance(df, [subTask])
					sessions.data.forEach(session => {
						if (!result[session.session]) {
							this.addFunnelDurartionSteps(result, session, true)
						}
					})
				}
			})
		}
		return result
	}

	addFunnelDurartionSteps (result, session, isDropOff = false) {
		let lastTime = session.startTime
		result[session.session] = []
		session.hits.forEach(hit => {
			const duration = hit.time - lastTime
			result[session.session].push({
				value: duration,
				dropoff: isDropOff
			})
			lastTime = hit.time
		})
	}

	getFunnelMax (stepData) {
		let result = 0
		for (let id in stepData) {
			let steps = stepData[id]
			steps.forEach((step) => {
				result = Math.max(result, step.value)
			})
		}
		return result
	}

	getSessionSummary(events) {
		const result = {}
		const sessions = events.groupBy("session");
		sessions.foreach((session, id) => {
			const count = session.count('type')
			const screenLoads = count.get('ScreenLoaded', null, 0) + count.get('OverlayLoaded', null, 0)
			const uniqueScreens =  session.unique('screen')
			const clicks = session.select("type", "in",["ScreenClick","WidgetClick","WidgetChange", "ScreenGesture", "WidgetGesture"])
			result[id] = {
				session: id,
				size: session.size(),
				interactions: clicks.size(),
				date: session.min("time"),
				duration:  Math.ceil((session.max("time") - session.min("time"))),
				screenLoads: screenLoads,
				screenUnique: uniqueScreens,
				screenRatio: uniqueScreens / screenLoads,
				errors: count.get('ValidationError', null, 0)
			}
		})
		return result
	}


	getSessionDetails (events, tasks) {
		events.sortBy("time");
		const sessions = this.getSessionSummary(events)
		Object.values(sessions).forEach(session => {
			session.tasks = 0
			for (let t = 0; t < tasks.length; t++) {
				const task = tasks[t];
				session[task.id] = {
					name: task.name,
					success: 0,
					duration: -1,
					interactions: -1
				}
			}
		})
		
		const taskPerformance = this.getTaskPerformance(events, tasks).data
		taskPerformance.forEach(perf => {
			const session = sessions[perf.session]
			if (session) {
				session.tasks++
				const t = session[perf.task]
				t.success = 1
				t.duration = perf.duration
				t.interactions = perf.interactions
			} else {
				console.error('Analytics.getSessionDetails() > No session ??')
			}
		})

		return new DataFrame(Object.values(sessions))
	}

	convertSessionDetails (sessions) {
		return sessions.data.map(r => {
			const result = {}
			for (let key in r) {
				if (key !== 'start') {
					const value = r[key]
					if (value.name) {
						result[key] = value.success
					} else {
						result[key] = value
					}
				}
			}
			return result
		})
		
	}

	
	/**
	 * allowPartial is for funnel??
	 */
	getTaskPerformance(df, tasks, allowMultiMatch, allowPartial) {
		PerformanceMonitor.start('Analytics.getTaskPerformance()')
		const result = [];
		const matchers = [];
		for (let t = 0; t < tasks.length; t++) {
			const task = tasks[t];
			const flow = task.flow;
			if (flow && flow.length > 0) {
				const matcher = this.createMatcher(task.id, flow, task.strict);
				matcher.taskName = task.name;
				matchers.push(matcher);
			}
		}
		const matcherLength = matchers.length;

		df.sortBy("time");
		const sessions = df.groupBy("session");

		/**
		 * for every session match run all matchers
		 */
		sessions.foreach((session) => {

			/**
			 * loop over all events
			 */
			const events = session.as_array();
			const l = events.length;
		
			/**
			 * reset all matchers
			 */
			for (let m = 0; m < matcherLength; m++) {
				const matcher = matchers[m];
				matcher.reset();
				matcher.init(events[0]);
				matcher.disabled = false;
			}

			for (let i = 0; i < l; i++) {
				const e = events[i];
			
				/**
				 * run all matchers
				 */
				for (let m = 0; m < matcherLength; m++) {
					const matcher = matchers[m];
			
					/**
					 * Usually we want to match each task max once!
					 * If we have a match, the corresponding
					 * matched will be disabled
					 */
					if (!matcher.disabled) {
						const match = matcher.next(e, i);
						if (match) {
							if ((match.partial && allowPartial) || !match.partial) {
								/**
								 * Support strict matching
								 */
								if (matcher.strict) {
									if (match.count == matcher.flow.length) {
										result.push(match);
									}
								} else {
									result.push(match);
								}

								/**
								 * if we do not want to count if
								 * a user manages a task more than one time.
								 *
								 */
								if (!allowMultiMatch) {
									matcher.disabled = true;
								}
							}
						}
					}
				}
			}
		});
		PerformanceMonitor.end('Analytics.getTaskPerformance()')
		return new DataFrame(result);
	}

	getMergedTaskPerformance(df, tasks, annotations) {
		let result = [];
		const temp = this.getTaskPerformance(df, tasks);


		/**
		 * build fast lookup
		 */
		temp.setIndex(["session", "task"])

		/**
		 * first add all rows from the annotations.
		 */
		const l = annotations.length;
		for (let i = 0; i < l; i++) {
			const a = annotations[i];
			if (a.isValid) {
				const session = a.reference;
				for (let task in a.tasks) {
					const value = a.tasks[task];
					const row = temp.ix([session, task], true)

					if (value && !row) {
						//console.debug(session, task, " add ", value);
						/**
						 * Add an artifical math
						 * if there is now real match
						 */

						result.push({
							startTime: -1,
							discoveryTime: -1,
							endTime: -1,
							startPosition: -1,
							endPosition: -1,
							duration: 0,
							count: -1,
							partial: false,
							session: session,
							task: task,
							user: "" // FIXME: get later the user from this session
						})

					} else if (row && !value) {
						//console.debug(session, task, " remove ", value);
						/**
						 * else remove row
						 */
						const index = row.index;
						temp.remove(index)
					}
				}
			}
		}
		/**
		 * merge both sets.
		 */
		result = temp.data.concat(result);
		return new DataFrame(result);
	}


	getFunnelSummary(df, task, annotation) {
		/**
		 * We simply build for each subflow a new task
		 */

		const tasks = this.getFunnelTasks(task);

		/**
		 * Now we run the normal task analytics
		 */
		const summary = this.getTaskSummary(df, tasks, annotation);
		const sessionCount = df.count("session").size();

		const all = [{
			label: task.name + "_all",
			id: task.id + "_all",
			value: sessionCount,
			sessionCount: sessionCount,
			p: 1,
			flow: 0,
		}];


		const result = all.concat(summary.reverse());
		for (let i = 1; i < result.length; i++) {
			const item = result[i];
			item.event = task.flow[i - 1];
		}

		return result;
	}

	getFunnelTasks(task) {
		const tasks = [];
		const flow = lang.clone(task.flow);
		while (flow.length > 0) {
			const t = lang.clone(task);
			t.id = task.id + "_" + flow.length;
			t.name += task.name + "_" + flow.length;
			t.flow = lang.clone(flow);
			tasks.push(t);
			flow.pop();
		}
		return tasks
	}
	

	getTaskStarts (df, tasks) {
		const startTasks = tasks.map(task => {
			const t = lang.clone(task);
			t.id = task.id
			t.name = task.name
			t.flow = [task.flow[0]] // just take the start of the flow
			return t
		})
		const summary = this.getTaskPerformance(df, startTasks);
		return summary
	}


	getTaskSummary(df, tasks, annotation) {

		const sessionCount = df.count("session").size();

		const tasksPerformance = this.getMergedTaskPerformance(df, tasks, annotation);
		const taskGrouping = tasksPerformance.groupBy("task");
	
		const startTaskPerformace = this.getTaskStarts(df, tasks)
		const startGrouping = startTaskPerformace.groupBy("task")
	
		const list = [];
		for (let i = 0; i < tasks.length; i++) {
			const task = tasks[i];
			let taskDf = taskGrouping.get(task.id);
		

			/**
			 * FIXME: This is a bug! The analytics.getMergedTaskPerformance(df, tasks, annotation );
			 * should have also performance for this task!
			 */
			if (taskDf) {
				const taskCount = taskDf.size();
				const startDf = startGrouping.get(task.id)
				let startCount = startDf ? startDf.size() : sessionCount
			
				/**
				 * for the time based stats we do not want manual
				 * annotated tasks
				 */
				taskDf = taskDf.select("startTime", ">", 0);


				list.push({
					label: task.name,
					id: task.id,
					value: taskCount,
					sessionCount: sessionCount,
					sessionStart: startCount / sessionCount,
					p: taskCount / startCount,
					success: taskCount / startCount,
					successRel: taskCount / startCount,
					successAbs: taskCount,
					flow: task.flow.length,
					startCount: startCount,
					startRel: startCount / sessionCount,

					startMean: taskDf.mean("startPosition"),
					startStd: taskDf.std("startPosition"),
					discoveryTimeMean: taskDf.mean("discoveryTime"),
					discoveryTimeStd: taskDf.std("discoveryTime"),
					durationMean: taskDf.mean("duration"),
					durationMedian: taskDf.median("duration"),
					durationStd: taskDf.std("duration"),
					countMean: taskDf.mean("count"),
					countStd: taskDf.std("count"),
					interactionsMean: taskDf.mean("interactions"),
					interactionsStd: taskDf.std("interactions")
				});
			} else {

				list.push({
					label: task.name,
					id: task.id,
					sessionCount: sessionCount,
					value: 0,
					p: 0,
					startCount:0,
					success: 0,
					successRel: 0,
					successAbs: 0,
					flow: task.flow.length,
					startAbs: 0,
					startMean: 0,
					startStd: 0,
					discoveryTimeMean: 0,
					discoveryTimeStd: 0,
					durationMean: 0,
					durationMedian: 0,
					durationStd: 0,
					countMean: 0,
					countStd: 0,
					interactionsMean: 0,
					interactionsStd: 0
				});
			}



		}
		return list;
	}


	/********************************************************************************************
	 * Overlay Stuff
	 *******************************************************************************************/

	getOverlayTimeGrouping(df) {

		/**
		 * Overlay times
		 */
		var sessionGrouping = df.groupBy("session");
		var screenTimes = {};
		sessionGrouping.foreach(function (session) {
			session.sortBy("time");
			var startTimes = {};
			var currentTime = -1;
			var lastScreen = null;
			var t = null;

			session.foreach(function (row) {
				t = row["type"];
				currentTime = row["time"];
				var screenID = row["overlay"];
				/**
				 * start counting when overlay is shown
				 */
				if (t == "OverlayLoaded") {
					startTimes[screenID] = currentTime;
					lastScreen = screenID;
				}

				/**
				 * Stop when overlay is removed or other screen is loaded
				 */
				if (t == "OverlayRemoved") {
					if (startTimes[screenID]) {
						if (!screenTimes[screenID]) {
							screenTimes[screenID] = new DataFrame([]);
						}
						var dif = currentTime - startTimes[screenID];
						screenTimes[screenID].push(dif);
					}
					delete startTimes[screenID];
				}

				if (t == "ScreenLoaded") {
					for (let screenID in startTimes) {
						if (!screenTimes[screenID]) {
							screenTimes[screenID] = new DataFrame([]);
						}
						let dif = currentTime - startTimes[screenID];
						screenTimes[screenID].push(dif);
					}
					startTimes = {};
				}

				//|| t == "ScreenLoaded"


			});

			if (startTimes[lastScreen] && currentTime > 0 && t != "OverlayLoaded") {
				if (!screenTimes[lastScreen]) {
					screenTimes[lastScreen] = new DataFrame([]);
				}
				var dif = currentTime - startTimes[lastScreen];
				screenTimes[lastScreen].push(dif);
			}

		});

		return new Grouping(screenTimes, DataFrame);
	}

	/********************************************************************************************
	 * Screen Stuff
	 *******************************************************************************************/

	getScreenTimeGrouping(df) {

		/**
		 * Screen times
		 */
		var sessionGrouping = df.groupBy("session");
		var screenTimes = {};
		sessionGrouping.foreach(function (session) {
			session.sortBy("time");
			var lastTime = -1;
			var currentTime = -1;
			var lastScreen = null;
			var t = null;
			session.foreach(function (row) {
				t = row["type"];
				currentTime = row["time"];
				var screenID = row["screen"];
				if (t == "ScreenLoaded") {
					if (lastTime > -1) {
						if (!screenTimes[lastScreen]) {
							screenTimes[lastScreen] = new DataFrame([]);
						}
						var dif = currentTime - lastTime;
						screenTimes[lastScreen].push(dif);
					}
					lastTime = currentTime;
					lastScreen = screenID;
				}
			});

			if (lastTime > 0 && currentTime > 0 && t != "ScreenLoaded") {
				if (!screenTimes[lastScreen]) {
					screenTimes[lastScreen] = new DataFrame([]);
				}
				var dif = currentTime - lastTime;
				screenTimes[lastScreen].push(dif);
			}

		});

		return new Grouping(screenTimes, DataFrame);
	}

	getScreenTime(df) {

		/**
		 * Screen times
		 */
		var sessionGrouping = df.groupBy("session");
		var screenTimes = {};
		sessionGrouping.foreach(function (session) {
			session.sortBy("time");
			var lastTime = -1;
			var lastScreen = null;
			var t = null;
			var currentTime = -1;
			session.foreach(function (row) {
				var t = row["type"];
				currentTime = row["time"];
				var screenID = row["screen"];
				if (t == "ScreenLoaded") {
					if (lastTime > -1) {
						if (!screenTimes[lastScreen]) {
							screenTimes[lastScreen] = 0;
						}
						var dif = currentTime - lastTime;
						screenTimes[lastScreen] += dif;
					}
					lastTime = currentTime;
					lastScreen = screenID;
				}
			});

			if (lastTime > 0 && currentTime > 0 && t != "ScreenLoaded") {
				if (!screenTimes[lastScreen]) {
					screenTimes[lastScreen] = 0;
				}
				var dif = currentTime - lastTime;
				screenTimes[lastScreen] += dif;
			}
		});


		return new DataFrame(screenTimes);
	}



	/********************************************************************************************
	 * Widget Stuff
	 *******************************************************************************************/

	/**
	 * Get merged "report" for all widgets relative to the entire application!!
	 *
	 */
	getWidgetStatistics(app, df) {

		var result = {};


		/**
		 * Get all clicks for the widgets
		 */
		var widgetEvents = df.select("type", "==", "WidgetClick");
		// var widgetGrouping = widgetEvents.groupBy("widget");
		var widgetCounts = widgetEvents.count("widget");


		/**
		 * FIXME: Should be in Screen or?
		 */
		var totalWidgetEvents = widgetCounts.sum();


		var discoverTime = this.getWidgetDiscoverTime(df);
		var meanDiscoverTime = discoverTime.mean();
		var totalDicoverTime = meanDiscoverTime.max();
		var discoverTimeSTD = discoverTime.std();

		var widgetViewCount = discoverTime.size();


		var widgetFirstClick = this.getWidgetFirstClick(df);
		var totalFirstClicks = widgetFirstClick.sum();

		var screenLoadEvents = df.select("type", "in", ["ScreenLoaded", "OverlayLoaded"]);
		var screenLoads = screenLoadEvents.count("screen");


		for (var widgetID in app.widgets) {
			var parentScreenID = this._getParentScreenID(app, widgetID);
			result[widgetID] = {
				clicksAbs: widgetCounts.get(widgetID, null, 0),
				clicksRel: widgetCounts.get(widgetID, null, 0) / totalWidgetEvents,
				discoverTimeAbs: meanDiscoverTime.get(widgetID, null, 0),
				discoverTimeRel: meanDiscoverTime.get(widgetID, null, 0) / totalDicoverTime,
				discoverTimeStd: discoverTimeSTD.get(widgetID, null, 0),
				views: widgetViewCount.get(widgetID, null, 0),
				firstClicksAbs: widgetFirstClick.get(widgetID, null, 0),
				firstClicksRelApp: widgetFirstClick.get(widgetID, null, 0) / totalFirstClicks,
				firstClicksRelScreen: widgetFirstClick.get(widgetID, null, 0) / screenLoads.get(parentScreenID, null, 0),
			};

		}
		return result;
	}


	_getParentScreenID(model, widgetID) {
		/**
		 * FIXME: This could be faster
		 */
		for (var id in model.screens) {
			var screen = model.screens[id];
			var i = screen.children.indexOf(widgetID);
			if (i > -1) {
				return screen.id;
			}
		}
		return null;
	}



	/**
	 * Return a grouping containing the time needed
	 * from a ScreenLoad until the widget was clicked
	 */
	getWidgetDiscoverTime(df) {

		/**
		 * Scan each session
		 */
		var sessionGrouping = df.groupBy("session");
		var widgetGetOrder = {};
		// var widgetFirstClicks = {};
		sessionGrouping.foreach(function (session) {
			/**
			 * sort by time
			 */
			session.sortBy("time");
			// var t = null;
			var loadTime = 0;
			var widgetWasClicked = {};
			// var count = 0;
			session.foreach(function (row) {
				var type = row["type"];
				var widgetID = row["widget"];
				var time = row["time"];

				if (type == "ScreenLoaded" || type == "OverlayLoaded") {
					/**
					 * Screen load : set reference time and clear flag map
					 * for seen widgets.
					 */
					loadTime = time;
					widgetWasClicked = {};
					// count = 0;

				} else if (type == "WidgetClick" && widgetID) {
					/**
					 *  We do not want to count widget clicks double... so we
					 *  remember that we have seen the widget already in a
					 *  screen session.
					 */
					if (!widgetWasClicked[widgetID]) {
						if (!widgetGetOrder[widgetID]) {
							widgetGetOrder[widgetID] = new DataFrame([]);
						}
						widgetGetOrder[widgetID].push(time - loadTime);
						widgetWasClicked[widgetID] = true;
					}
				}
			});
		});
		return new Grouping(widgetGetOrder);
	}


	/**
	 * Return a grouping containing the time needed
	 * from a ScreenLoad until the widget was clicked
	 */
	getWidgetFirstClick(df) {

		/**
		 * Scan each session
		 */
		var sessionGrouping = df.groupBy("session");

		var widgetFirstClicks = {};
		sessionGrouping.foreach(function (session) {
			/**
			 * sort by time
			 */
			session.sortBy("time");
			var count = 0;
			session.foreach(function (row) {
				var type = row["type"];
				var widgetID = row["widget"];
				// var time = row["time"];

				if (type == "ScreenLoaded" || type == "OverlayLoaded") {
					count = 0;
				} else if (type == "WidgetClick" && widgetID) {
					if (count == 0) {
						if (!widgetFirstClicks[widgetID]) {
							widgetFirstClicks[widgetID] = 0;
						}

						widgetFirstClicks[widgetID]++;
						count++;
					}
				}
			});

		});
		return new DataFrame(widgetFirstClicks);

	}



	getWidgetDiscoverOrder(df) {

		/**
		 * Scan each session
		 */
		var sessionGrouping = df.groupBy("session");
		var widgetGetOrder = {};
		sessionGrouping.foreach(function (session) {
			/**
			 * sort by time
			 */
			session.sortBy("time");
			var t = null;
			var count = 0;
			session.foreach(function (row) {
				t = row["type"];
				var widgetID = row["widget"];
				if (t == "ScreenLoaded" || t == "OverlayLoaded") {
					count = 0;
					//console.debug(" ----- ");
				}
				if (widgetID) {
					count++;
					//console.debug(" - ", widgetID, count);
					if (!widgetGetOrder[widgetID]) {
						widgetGetOrder[widgetID] = new DataFrame([]);
					}
					widgetGetOrder[widgetID].push(count);
				}

			});


		});

		return new Grouping(widgetGetOrder, DataFrame);

	}

}

