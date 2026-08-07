import Logger from "../../core/Logger";

const borderColorKeys = [
  "borderTopColor",
  "borderRightColor",
  "borderBottomColor",
  "borderLeftColor",
];

const borderWidthKeys = [
  "borderTopWidth",
  "borderRightWidth",
  "borderBottomWidth",
  "borderLeftWidth",
];

const borderStyleKeys = [
  "borderTopStyle",
  "borderRightStyle",
  "borderBottomStyle",
  "borderLeftStyle",
];

const stateKeys = ["style", "hover", "active", "focus", "error"];

/**
 * Restyles an AI generated app with a theme, so it looks like a
 * low fidelity wireframe. Only colors and border related props
 * (color + width) are touched, so that layout, spacing and
 * typography of the generated screen are preserved.
 */
export default class Wireframer {
  constructor(theme) {
    this.theme = theme;
  }

  apply(app) {
    Logger.log(-1, "Wireframer.apply() > enter");

    for (let sid in app.screens) {
      this.styleScreen(app.screens[sid]);
    }

    for (let wid in app.widgets) {
      const widget = app.widgets[wid];
      this.styleWidget(widget);
      this.removeBoxShadow(widget);
    }

    return app;
  }

  removeBoxShadow(widget) {
    stateKeys.forEach((key) => {
      const style = widget[key];
      if (style && style.boxShadow !== undefined) {
        delete style.boxShadow;
      }
    });
  }

  styleScreen(scrn) {
    if (!scrn.style) {
      return;
    }
    delete scrn.style.boxShadow;
    this.setColor(scrn.style, "background", "@screen-background");
  }

  styleWidget(widget) {
    switch (widget.type) {
      case "Label":
        return this.styleLabel(widget);
      case "TextBox":
      case "TextArea":
      case "Password":
        return this.styleFormField(widget);
      case "DropDown":
        return this.styleDropDown(widget);
      case "CheckBox":
      case "RadioBox2":
        return this.styleCheckable(widget);
      case "Table":
        return this.styleTable(widget);
      case "Image":
        return this.styleImage(widget);
      case "Box":
      case "Button":
      default:
        return this.styleButton(widget);
    }
  }

  styleLabel(widget) {
    const isPrimary = isBold(widget.style);
    const key = isPrimary ? "@label-color" : "@label-color-secondary";
    this.setColor(widget.style, "color", key);
    this.setColor(widget.hover, "color", "@label-color:hover");
    this.setColor(widget.error, "color", "@label-color:error");
    this.removeBorderAndBackground(widget);
  }

  removeBorderAndBackground(widget) {
    stateKeys.forEach((key) => {
      const style = widget[key];
      if (!style) {
        return;
      }
      delete style.background;
      borderColorKeys.forEach((k) => delete style[k]);
      borderWidthKeys.forEach((k) => delete style[k]);
      borderStyleKeys.forEach((k) => delete style[k]);
    });
  }

  removeBorder(widget) {
    stateKeys.forEach((key) => {
      const style = widget[key];
      if (!style) {
        return;
      }
      borderColorKeys.forEach((k) => delete style[k]);
      borderWidthKeys.forEach((k) => delete style[k]);
      borderStyleKeys.forEach((k) => delete style[k]);
    });
  }

  styleFormField(widget) {
    this.setColor(widget.style, "background", "@form-background");
    this.setColor(widget.style, "color", "@form-color");
    this.setBorderColor(widget.style, "@form-border-color");
    this.setBorderWidth(widget.style, "@border-width");

    this.setColor(widget.hover, "background", "@form-background:hover");
    this.setColor(widget.hover, "color", "@form-color:hover");
    this.setBorderColor(widget.hover, "@form-border-color:hover");
    this.setBorderWidth(widget.hover, "@border-width:hover");

    this.setColor(widget.focus, "background", "@form-background:focus");
    this.setColor(widget.focus, "color", "@form-color:focus");
    this.setBorderColor(widget.focus, "@form-border-color:focus");
    this.setBorderWidth(widget.focus, "@border-width:focus");

    this.setColor(widget.error, "background", "@form-background:error");
    this.setColor(widget.error, "color", "@form-color:error");
    this.setBorderColor(widget.error, "@form-border-color:error");
  }

  styleDropDown(widget) {
    this.styleFormField(widget);
    this.setColor(widget.style, "popupBackground", "@form-popup-background");
    this.setColor(widget.style, "popupColor", "@form-popup-color");
    this.setBorderColor(widget.style, "@form-popup-border-color");
    this.setColor(widget.hover, "popupBackground", "@form-popup-background:hover");
    this.setColor(widget.hover, "popupColor", "@form-popup-color:hover");
  }

  styleCheckable(widget) {
    this.setColor(widget.style, "background", "@form-background");
    this.setBorderColor(widget.style, "@form-border-color");
    this.setBorderWidth(widget.style, "@border-width");
    this.setColor(widget.style, "colorButton", "@background-active");

    this.setColor(widget.hover, "background", "@form-background:hover");
    this.setBorderColor(widget.hover, "@form-border-color:hover");

    this.setColor(widget.focus, "background", "@form-background:focus");
    this.setBorderColor(widget.focus, "@form-border-color:focus");

    this.setColor(widget.error, "background", "@form-background:error");
    this.setBorderColor(widget.error, "@form-border-color:error");
  }

  styleTable(widget) {
    this.setColor(widget.style, "headerBackground", "@button-passive-background");
    this.setColor(widget.style, "headerColor", "@button-passive-color");
    this.setBorderColor(widget.style, "@form-border-color");
  }

  // eslint-disable-next-line no-unused-vars
  styleImage(widget) {
    // TODO: Here is a bug. This will get invisible
    //this.setBorderColor(widget.style, "@form-border-color");
    //console.debug(widget)
  }

  styleButton(widget) {
    if (isCardSized(widget)) {
      return this.styleCard(widget);
    }

    const background = widget.style ? widget.style.background : undefined;

    if (isTransparent(background)) {
      return this.styleGhostButton(widget);
    }

    // TODO: make here another check maybe for the CSS mode, or 
    // so to also use the 'passive'? Maybe check for disbaled 
    // in the HTML2QUX?
    const isPrimary = !isLight(background);
    const prefix = isPrimary ? "@button-primary" : "@button-secundary";

    this.setColor(widget.style, "background", `${prefix}-background`);
    this.setColor(widget.style, "color", `${prefix}-color`);
    this.setBorderColor(widget.style, `${prefix}-border-color`);

    this.setColor(widget.hover, "background", `${prefix}-background:hover`);
    this.setColor(widget.hover, "color", `${prefix}-color:hover`);
    this.setBorderColor(widget.hover, `${prefix}-border-color:hover`);

    this.setColor(widget.active, "background", `${prefix}-background:hover`);
    this.setColor(widget.active, "color", `${prefix}-color:hover`);
    this.setBorderColor(widget.active, `${prefix}-border-color:hover`);
  }

  // A button that is bigger than a typical control (e.g. used as a
  // clickable tile) reads as a container/card in a wireframe, so it
  // gets card colors instead of button colors.
  styleCard(widget) {
    const background = widget.style ? widget.style.background : undefined;

    if (isGradient(background)){
      this.setColor(widget.style, "background", "@card-gradient-background");
      return
    }

    if (!isTransparent(background)) {
      const isPrimary = !isLight(background);
      const key = isPrimary ? "@card-primary-background" : "@card-secondary-background";

      this.setColor(widget.style, "background", key);
      this.setColor(widget.hover, "background", key);
      this.setColor(widget.active, "background", key);
    }

    const colorKey = isBold(widget.style) ? "@label-color" : "@label-color-secondary";
    this.setColor(widget.style, "color", colorKey);
    this.setColor(widget.hover, "color", "@label-color:hover");
    this.setColor(widget.active, "color", "@label-color:hover");

    this.removeBorder(widget);
  }

  styleGhostButton(widget) {
    const isPrimary = isBold(widget.style);
    const colorKey = isPrimary ? "@label-color" : "@label-color-secondary";

    this.setColor(widget.style, "color", colorKey);
    if (hasBorder(widget.style)) {
      this.setBorderColor(widget.style, "@button-passive-border-color");
    }

    this.setColor(widget.hover, "color", "@label-color:hover");
    this.setColor(widget.active, "color", "@label-color:hover");
  }

  // -- helpers ------------------------------------------------------

  setColor(style, key, themeKey) {
    if (!style) {
      return;
    }
    const value = this.getThemeValue(themeKey);
    if (value === undefined) {
      return;
    }
    style[key] = value;
  }

  setBorderColor(style, themeKey) {
    if (!style) {
      return;
    }
    const value = this.getThemeValue(themeKey);
    if (value === undefined) {
      return;
    }
    borderColorKeys.forEach((key) => {
      style[key] = value;
    });
  }

  setBorderWidth(style, themeKey) {
    if (!style || !hasBorder(style)) {
      return;
    }
    const value = this.getThemeValue(themeKey);
    if (value === undefined) {
      return;
    }
    borderWidthKeys.forEach((key) => {
      style[key] = value;
    });
  }

  getThemeValue(themeKey) {
    const token = this.theme ? this.theme[themeKey] : undefined;
    if (!token) {
      return undefined;
    }
    const value = token.value;
    if (value === null || value === undefined || value === "") {
      return undefined;
    }
    return value;
  }
}

// -- color utils ------------------------------------------------------

function isBold(style) {
  if (!style || !style.fontWeight) {
    return false;
  }
  const weight = style.fontWeight;
  return weight === "bold" || parseInt(weight, 10) >= 600;
}

function hasBorder(style) {
  if (!style) {
    return false;
  }
  return borderWidthKeys.some((key) => style[key] > 0);
}

const CARD_SIZE_THRESHOLD = 100;

function isCardSized(widget) {
  return widget.w > CARD_SIZE_THRESHOLD || widget.h > CARD_SIZE_THRESHOLD;
}

function isTransparent(color) {
  return !color || color === "rgba(0, 0, 0, 0)" || color === "transparent";
}

function isGradient(color) {
  if (color.colors) {
    return true
  }
  return false
}

function isLight(color) {
  const rgb = parseColor(color);
  if (!rgb) {
    return true;
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance >= 0.5;
}

function parseColor(color) {
  if (!color || typeof color !== "string") {
    return null;
  }
  const match = color.match(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*[\d.]+\s*)?\)/
  );
  if (!match) {
    return null;
  }
  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
  };
}
