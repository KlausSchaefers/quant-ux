<template>
	<div class="MatcPricing"></div>
</template>
<script>
import DojoWidget from 'dojo/DojoWidget'
import css from 'dojo/css'
import lang from 'dojo/_base/lang'
import on from 'dojo/on'
import touch from 'dojo/touch'
import Evented from 'dojo/Evented'
import DomBuilder from 'common/DomBuilder'




export default {
	name: 'Pricing',
	mixins: [Evented, DojoWidget],
	data: function () {
		return {
			role: "user",
			key: "",
			category: "default",
			labels: {
				"Free": "Free Forever",
				"Pro": "Quant-UX Account",
				"Enterprise": "Enterprise"
			}
		}
	},
	components: {},
	methods: {
		postCreate: function () {

			var db = new DomBuilder();

			this.detailLinks = [];

			this.expandedDetails = false;

			var row = db.div("row").build();

			//	this.renderColumn(row, "Free", 0, 3, this.getFeatures() , this.getShortFeatures());

			this.renderColumn(row, "Pro", 0, "Unlimited", this.getFeatures(true), this.getShortFeatures(true));

			//	this.renderColumn(row, "Enterprise", "Coming Soon", "Unlimited", this.getFeatures(true, true, true), this.getShortFeatures(true, true, true));


			css.add(this.domNode, "MatcPricingFeatureClosed");

			this.domNode.appendChild(row);
		},


		renderColumn: function (cntr, plan, price, apps, features, shortFeatures) {


			var db = new DomBuilder();

			var table = db.div("col-md-12 MatcCenter").table("MatcPricingTable").build(cntr);

			var head = db.thead().tr().td("MatcPricingTableHeader MatcPricingTableHeader" + plan).build(table);

			db.span("MatcPricingTableHeaderName", this.labels[plan]).build(head);
			db.span("MatcPricingTableHeaderPrice", price).build(head);

			if (!price.toLowerCase) {
				db.span("MatcPricingTableHeaderDollar", "$").build(head);
			}

			if (price != 0) {
				db.span("MatcPricingTableHeaderMonth", "/ month").build(head);
			}

			var body = db.tbody().build(table);

			var tdApps = db.tr().td("MatcCenter MatcPricingSeperator").build(body);
			db.span("MatcPricingBigNumber", apps).build(tdApps);
			db.span("MatcHint", "Prototypes").build(tdApps);


			var tdFeatures = db.tr().td("MatcPricingFeature MatcPricingSeperator ").build(body);


			let ulCntr = db.div("MatcPricingFeatureDetailsContainer").build(tdFeatures);
			for (var i = 0; i < features.length; i++) {
				const list = features[i];
				const ul = db.ul().build(ulCntr);
				for (var name in list) {
					if (list[name]) {
						const li = db.li().build(ul);
						db.span("mdi mdi-check").build(li);
						db.span("", name).build(li);
					} else {
						const li = db.li("MatcPricingFeatureDisable").build(ul);
						db.span("mdi mdi-close").build(li);
						db.span("", name + " (comming soon)").build(li);
					}
				}
			}


			ulCntr = db.div("MatcPricingFeatureShortContainer", "").build(tdFeatures);
			const ul = db.ul().build(ulCntr);
			for (const name in shortFeatures) {
				if (shortFeatures[name]) {
					const li = db.li().build(ul);
					db.span("mdi mdi-check").build(li);
					db.span("", name).build(li);
				} else {
					const li = db.li("MatcPricingFeatureDisable").build(ul);
					db.span("mdi mdi-close").build(li);
					db.span("", name + " (comming soon)").build(li);
				}
			}


			var link = db.div("").a("", "Show Details").build(tdFeatures);
			this.detailLinks.push(link)
			this.own(on(link, touch.release, lang.hitch(this, "toggleDetails")));



			var tdButton = db.tr().td("MatcCenter MatcPricingSeperator").build(body);
			var a = db.a("MatcButton MatcButtonXXL", "Sign Up").build(tdButton);

			var url = "#/register/Free/" + price + ".html";
			a.setAttribute("data-binding-method", url);
			a.setAttribute("href", url);

		},

		toggleDetails: function () {

			this.expandedDetails = !this.expandedDetails;

			if (this.expandedDetails) {
				css.remove(this.domNode, "MatcPricingFeatureClosed");
				for (let i = 0; i < this.detailLinks.length; i++) {
					this.detailLinks[i].innerHTML = "Hide Details";
				}
			} else {
				css.add(this.domNode, "MatcPricingFeatureClosed");
				for (let i = 0; i < this.detailLinks.length; i++) {
					this.detailLinks[i].innerHTML = "Show Details";
				}
			}
		},


		getFeatures: function (teamSharing, password, libs) {

			var section1 = {
				"Visual Prototype Editor": true,
				"Wireframe Templates": true,
				"iOS Templates ": true,
				"Material Design Templates ": true,
				"Bootstrap Design Templates": true
			};

			var section2 = {
				"Unlimited Tests": true,
				"Screen Recordings": true,
				"Task Analyzes ": true,
				"Click Heat Maps": true,
				"Mouse Heat Maps": true,
				"User Journe": true
			};

			var section3 = {
				"Public Sharing": true,
				"Comments": true,
				"Team Sharing ": teamSharing,
				"Password Protection": password,
				"Symbol Libraries": libs
			};


			return [section1, section2, section3];
		},

		getShortFeatures: function (teamSharing, password, libs) {

			var section1 = {
				"Visual Prototype Editor": true,
				"Unlimited Tests": true,
				"Visual Analytics": true,
				"Team Sharing ": teamSharing,
				"Password Protection": password,
				"Symbol Libraries": libs
			};


			return section1;
		}
	},
	mounted() {
	}
}
</script>
