/**
 * Which parts of a widget's style the properties panel can edit, per widget
 * type. The toolbar (canvas/toolbar/mixins/_Render.vue) shows its controls
 * from these lists, and the AI import (ai/HTML2QUX.js) keeps only the styles
 * a control exists for, so an imported widget never carries a style the user
 * cannot change. One list for both, so they cannot drift apart.
 */

export const hasPadding = ["Button", "DateDropDown", "DropDown", "TypeAheadTextBox", "MobileDropDown", "Label", "TextBox", 'LockSlider',
	"TextArea", "Password", "SegmentButton", "SegmentPicker", "ToggleButton", "Table", 'Tree',
	'VerticalNavigation', 'Paging', 'LabeledTextBox', 'NavBar', 'NavMenu', 'LabeledTextArea',
	'SortableList', 'RadioTable', 'DragNDropTarget', 'Upload', 'GeoLocation', 'ImageGrid',
	'GridContainer', 'Chat', 'ChatTextBox','FlexContainer']

export const hasActiveViewMode = ["SegmentButton", "ToggleButton","VolumeSlider", "Tree", "VerticalNavigation",
	'Paging', 'Upload', 'IconToggleButton', 'NavBar', 'DragNDrop', 'AudioPlayer']

export const hasHoverViewMode = ["Box", "Button", "Label", "ToggleButton", "DragNDrop", "Upload", "WebLink", "Tree", "Camera",
	"VerticalNavigation", "Stepper", "Paging", "VisualPicker", 'IconToggleButton', 'IconButton',
	'DragNDropTarget', 'LabeledTextBox', 'NavBar', 'TextBox', 'LabeledTextBox', 'NavMenu',
	"DropDown", 'LabeledTextArea', 'SortableList', 'RadioTable', 'Icon',
	'SVGIcon', 'ImageGrid', 'AudioPlayer', 'Chat', 'ChatTextBox']

export const hasValign = ["Box", "Button", "Label", "Upload", "WebLink", "IconButton", "Paging",
	"ToggleButton", "SegmentButton", "SegmentPicker", "DragNDrop", "DragNDropTarget"]

export default { hasPadding, hasActiveViewMode, hasHoverViewMode, hasValign }
