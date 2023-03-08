
<script>
import DojoWidget from "dojo/DojoWidget";
import _Color from "common/_Color";

export default {
  name: "Heat",
  mixins: [_Color, DojoWidget],
  data: function () {
    return {
      defaultRadius: 15,
      defaultBlur: 20,
      defaultGradient: {
        0.4: "blue",
        0.6: "cyan",
        0.7: "lime",
        0.8: "yellow",
        "1.0": "red",
      },
      max: -1,
    };
  },
  components: {},
  methods: {
    computeMouseDistribution(events, model) {
      var result = {};
      /**
       * Sort by screen
       */
      var screens = {};
      for (let i = 0; i < events.length; i++) {
        let event = events[i];
        if (!screens[event.screen]) {
          screens[event.screen] = [];
        }
        screens[event.screen].push(event);
      }

      /**
       * 1) for each screen
       */
      for (let id in screens) {
        var screenModel = model.screens[id];
        if (screenModel) {
          /**
           * 2) Loop over all events and build one array
           */
          var screenEvents = screens[id];
          var temp = [];
          for (let i = 0; i < screenEvents.length; i++) {
            /**
             * 2.a) Loop over all mouse position in the event.
             */
            let event = screenEvents[i];
            var xs = event.x;
            var ys = event.y;
            var ts = event.t;
            for (let j = 0; j < xs.length; j++) {
              temp.push({
                x: xs[j],
                y: ys[j],
                t: ts[j],
              });
            }
          }

          /**
           * 2.b) sort by time
           */
          temp.sort(function (a, b) {
            return a.t - b.t;
          });

          /**
           * 3)  build matrix
           */
          var width = screenModel.w;
          var height = screenModel.h;

          var lastT = 0;
          var m = {};
          var max = -1;

          for (let i = 0; i < temp.length; i++) {
            var e = temp[i];
            var tDif = 0;

            if (lastT > 0) {
              tDif = Math.log(e.t - lastT);
            }

            if (lastT > e.t) {
              console.error("wrong order", i, e.t);
            }

            /**
             * 4) Build matrix with tDif as intensity
             */
            if (e.x > 0 && e.y > 0) {
              var x = Math.round(e.x * width);
              var y = Math.round(e.y * height);

              if (m[x] == null) {
                m[x] = {};
              }
              if (m[x][y] == null) {
                m[x][y] = 0;
              }
              m[x][y] += tDif;

              max = Math.max(max, m[x][y]);
            }

            lastT = e.t;
          }

          result[id] = {
            max: max,
            values: this._matrixToData(m),
          };
        } else {
          console.debug("No Screen Model for ", id);
        }
      }

      return result;
    },

    /***********************************************************
     *  Click
     ***********************************************************/

    computeClickDistribution(value, width, height) {
      var m = {};
      var max = -1;
      for (var i = 0; i < value.length; i++) {
        var e = value[i];

        if (e.x && e.y && !e.noheat) {
          var x = Math.round(e.x * width);
          var y = Math.round(e.y * height);
          if (x > 0 && y > 0) {
            if (m[x] == null) {
              m[x] = {};
            }
            if (m[x][y] == null) {
              m[x][y] = 0;
            }
            m[x][y]++;

            max = Math.max(max, m[x][y]);
          }
        }
      }

      return {
        max: max,
        values: this._matrixToData(m),
      };
    },

    /**
     * convert sparse matrix to dense matrix that is needed for rendering
     */
    _matrixToData(m) {
      var data = [];
      for (var x in m) {
        var row = m[x];
        for (var y in row) {
          var pos = [];
          pos[0] = x;
          pos[1] = y;
          pos[2] = m[x][y];
          data.push(pos);
        }
      }
      return data;
    },

    cleanUpHeat() {
      delete this._circle;
    },

    /***************************************************************************************
     * code inspired by https://github.com/mourner/simpleheat/blob/gh-pages/simpleheat.js
     ***************************************************************************************/

    draw: function (ctx, data, max, width, height, minOpacity) {

      if (width <= 0 || height <= 0) {
        return
      }

      if (!this._circle) {
        this.radius(this.defaultRadius, this.defaultBlur);
      }
      if (!this._grad) {
        this.gradient(this.defaultGradient);
      }

      ctx.clearRect(0, 0, width, height);

      // draw a grayscale heatmap by putting a blurred circle at each data point
      for (var i = 0, len = data.length, p; i < len; i++) {
        p = data[i];
        ctx.globalAlpha = Math.max(
          p[2] / max,
          minOpacity === undefined ? 0.05 : minOpacity
        );
        ctx.drawImage(this._circle, p[0] - this._r, p[1] - this._r);
      }

      // colorize the heatmap, using opacity value of each pixel to get the right color from our gradient
      var colored = ctx.getImageData(0, 0, width, height);
      this._colorize(colored.data, this._grad);
      ctx.putImageData(colored, 0, 0);
    },

    radius: function (r, blur) {
      blur = blur || 15;

      // create a grayscale blurred circle image that we'll use for drawing points
      var circle = (this._circle = document.createElement("canvas"));
      var ctx = circle.getContext("2d");
      var r2 = (this._r = r + blur);

      circle.width = circle.height = r2 * 2;

      ctx.shadowOffsetX = ctx.shadowOffsetY = 200;
      ctx.shadowBlur = blur;
      ctx.shadowColor = "black";

      ctx.beginPath();
      ctx.arc(r2 - 200, r2 - 200, r, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();

      return this;
    },

    gradient: function (grad) {
      // create a 256x1 gradient that we'll use to turn a grayscale heatmap into a colored one
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      var gradient = ctx.createLinearGradient(0, 0, 0, 256);

      canvas.width = 1;
      canvas.height = 256;

      for (var i in grad) {
        gradient.addColorStop(i * 1, grad[i]);
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1, 256);

      this._grad = ctx.getImageData(0, 0, 1, 256).data;

      return this;
    },

    _colorize: function (pixels, gradient) {
      for (var i = 3, len = pixels.length, j; i < len; i += 4) {
        j = pixels[i] * 4; // get gradient color from opacity value

        if (j) {
          pixels[i - 3] = gradient[j];
          pixels[i - 2] = gradient[j + 1];
          pixels[i - 1] = gradient[j + 2];
        }
      }
    },

    /***********************************************************
     *  Scroll Heat Map Stuff
     ***********************************************************/

    computeScrollDurationDistrubtion(value, visibleScreenSize, height) {
      /**
       * Init heatmap with 0s
       */
      var result = [];
      for (let i = 0; i < height; i++) {
        result[i] = 1;
      }
      var max = 1;

      var lastEventTime = -1;
      var lastScrollTop = -1;
      for (let i = 0; i < value.length; i++) {
        var e = value[i];

        if (e.type == "SessionStart") {
          lastEventTime = -1;
          lastScrollTop = -1;
        }

        /**
         * We are just interested in the ScreenLoaded and ScreenScroll events
         */
        if (e.type == "ScreenScroll" || e.type == "ScreenLoaded") {
          var scrollTop = 0;
          if (e.type == "ScreenScroll" && e.state && e.state.children) {
            scrollTop = e.state.value * 1;
            scrollTop = Math.floor(visibleScreenSize * scrollTop);
          }

          if (lastEventTime >= 0 && lastScrollTop >= 0) {
            /**
             * Now inc for the visible area with the duration
             */
            var duration = e.time - lastEventTime;

            for (var j = 0; j < visibleScreenSize; j++) {
              var r = lastScrollTop + j;
              if (r < height) {
                result[r] += duration;
                max = Math.max(max, result[r]);
              }
            }
          }
          lastEventTime = e.time;
          lastScrollTop = scrollTop;
        }
      }

      return {
        max: max,
        values: result,
      };
    },

    computeScrollVisibiltyDistribution(value, visibleScreenSize, height) {
      /**
       * Init heatmap with 0s
       */
      var result = [];
      for (let i = 0; i < height; i++) {
        result[i] = 1;
      }
      let max = 1;

      /**
       * Loop over all events. Just just ScreenLoaded and Scroll events
       * to update the heapmap.
       *
       * We do this by user the concept of a ScreenSession. A ScreenSession includes all events,
       * from one ScreenLoaded event until the next ScreenLoaded event. We store for each ScreenSession
       * the max scrollTop value for all events in the session
       */
      var lastPageLoad = null;
      var pageSessions = {};
      for (let i = 0; i < value.length; i++) {
        var e = value[i];
        /**
         * We are just interested in the ScreenLoaded and ScreenScroll events
         */
        if (e.type == "ScreenScroll" || e.type == "ScreenLoaded") {
          if (e.type == "ScreenLoaded") {
            lastPageLoad = e.id;
            if (!pageSessions[lastPageLoad]) {
              pageSessions[lastPageLoad] = 0;
            }
          }
          var scrollTop = 0;
          if (e.type == "ScreenScroll" && e.state && e.state.children) {
            scrollTop = e.state.value * 1;
            scrollTop = Math.floor(visibleScreenSize * scrollTop);
          }
          pageSessions[lastPageLoad] = Math.max(
            scrollTop,
            pageSessions[lastPageLoad]
          );
        }
      }

      /**
       * Now we build the final gradient
       */
      for (var id in pageSessions) {
        let scrollTop = pageSessions[id];
        let to = visibleScreenSize * 1 + scrollTop * 1;
        for (var j = 0; j < to; j++) {
          if (j < height) {
            result[j] += 1;
            max = Math.max(max, result[j]);
          }
        }
      }

      return {
        max: max,
        values: result,
      };
    },

    drawSections(dist, ctx, height, width) {
      this.logger.log(2, "drawSections", "enter");

      var result = dist.values;
      if (!ctx) {
        ctx = this._ctx;
      }

      if (!width) {
        width = this._width;
      }

      if (!height) {
        height = this._height;
      }

      if (!dist.max) {
        console.warn("drawSections() > no max");
        dist.max = this.max;
      }

      /**
       * Now turn to relative values
       */
      var lastValue = -1;
      var lastY = 0;

      ctx.globalAlpha = 0.4;
      for (let i = 0; i < height; i++) {
        if (lastValue != result[i] && lastValue >= 0) {
          let value = lastValue / dist.max;
          /**
           * FIXME: get color from gradient!!
           */
          let color = this.mixColor(value);
          ctx.fillStyle = color;
          var h = i - lastY;
          ctx.fillRect(0, lastY, width, h);
          lastY = i;
        }
        lastValue = result[i];
      }

      /**
       * last section?
       */
      var value = lastValue / dist.max;
      var color = this.mixColor(value);
      ctx.fillStyle = color;
      ctx.fillRect(0, lastY, width, height);

      this.logger.log(2, "drawSections", "exit");
    },
  },
  mounted() {},
};
</script>