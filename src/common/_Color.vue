<script>
import Color from "dojo/_base/Color";
import touch from "dojo/touch";
import on from "dojo/on";
import css from "dojo/css";
import lang from "dojo/_base/lang";

export default {
  data: function() {
    return {
		colors_75: ["#F4BF00", "#FF1A00"],
		colors_50: ["#ff9105", "#ffbd21"],
		colors_25: ["#00A4E0", "#99cc00"],
		colors_0: ["#0099cc", "#2cb1e1"],
		redToYellow: ["#ff4444", "#ffae18"],
		yellowToGreen: ["#ffae18", "#83b600"],
		greenToGreen: ["#b6db49", "#75a800"],
		mini_palette: [
        "#ffffff", "#808080", "#000000",
        "#e2f4fb", "#33b5e5", "#0099cc",
        "#e5caf2", "#c182e0", "#9933cc",
        "#e2f0b6", "#92c500", "#669900",
        "#ffecc0", "#ffb61c", "#ff8a00",
        "#ffcaca", "#f83a3a", "#cc0000"],
      shadow_palette: [
        "#ffffff", "rgba(0,0,0,0.25)", "rgba(0,0,0,0.5)",
        "#e2f4fb", "#33b5e5", "#0099cc",
        "#e5caf2", "#c182e0", "#9933cc",
        "#e2f0b6", "#92c500", "#669900",
        "#ffecc0", "#ffb61c", "#ff8a00",
        "#ffcaca", "#f83a3a", "#cc0000"]
    };
  },
  methods: {
    mixColor(value) {
      if (value < 0.25) {
        let color = Color.blendColors(
          new Color(this.colors_0[0]),
          new Color(this.colors_0[1]),
          value
        );
        return color.toHex();
      } else if (value < 0.5) {
        let color = Color.blendColors(
          new Color(this.colors_25[0]),
          new Color(this.colors_25[1]),
          value
        );
        return color.toHex();
      } else if (value < 0.75) {
        let color = Color.blendColors(
          new Color(this.colors_50[0]),
          new Color(this.colors_50[1]),
          value
        );
        return color.toHex();
      } else {
        let color = Color.blendColors(
          new Color(this.colors_75[0]),
          new Color(this.colors_75[1]),
          value
        );

        return color.toHex();
      }
    },

    greenToRed(value) {
      if (value < 0.75) {
        let color = Color.blendColors(
          new Color(this.redToYellow[0]),
          new Color(this.redToYellow[1]),
          this.getPercentage(value, 0, 0.75)
        );
        return color.toHex();
      } else {
        let color = Color.blendColors(
          new Color(this.greenToGreen[0]),
          new Color(this.greenToGreen[1]),
          this.getPercentage(value, 0.75, 1)
        );
        return color.toHex();
      }
    },

    getPercentage(value, from, to) {
      var dif = to - from;
      var offSet = value - from;
      return offSet / dif;
    },

    renderColorBoxes(colors, parent, columns, callback) {
      var colorBoxes = {};
      var table = document.createElement("table");
      var tbody = document.createElement("tbody");
      table.appendChild(tbody);

      var tr = null;
      for (var i = 0; i < colors.length; i++) {
        if (i % columns == 0 || tr == null) {
          tr = document.createElement("tr");
          tbody.appendChild(tr);
        }
        var color = colors[i];
        var td = document.createElement("td");
        css.add(td, "MatcColorBox MatcColorBox" + (i % columns));
        var span = document.createElement("span");
        span.style.backgroundColor = color;
        if (this.hasAlpha(color)) {
          css.add(span, "MatcColorAlphaBox");
        }
        colorBoxes[color] = span;
        this.tempOwn(on(span, touch.press, lang.hitch(this, callback, color)));
        td.appendChild(span);
        tr.appendChild(td);
      }
      parent.appendChild(table);
      return colorBoxes;
    },

    hasAlpha (color) {
      if (color.indexOf('0.') > 0) {
        return true
      }
      return false
    }
  }
};
</script>




