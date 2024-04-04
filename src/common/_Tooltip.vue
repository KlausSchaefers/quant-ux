
<script>
import css from "dojo/css";

export default {
  name: "_Tooltip",
  mixins: [],
  data: function() {
    return {};
  },
  components: {},
  methods: {
    addTooltip(node, txt, customCSS) {
      const tooltip = document.createElement("div");
      css.add(tooltip, "vommondToolTip");
      if (customCSS) {
        css.add(tooltip, customCSS);
      }

      const arrow = document.createElement("div");
      tooltip.appendChild(arrow);
      css.add(arrow, "vommondToolTipArrow");
      css.add(node, "vommondToolTipCntr");

      const lbl = document.createElement("span");
      tooltip.appendChild(lbl);
      css.add(lbl, "vommondToolTipLabel");
      lbl.innerHTML = txt;

      node.appendChild(tooltip);
    }
  },
  mounted() {}
};
</script>


