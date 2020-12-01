class DataBindingService {

  getDefautlBindings (widget) {

      if (widget && widget.type === 'Table') {
          return [
              { label: "Input", value: "default" },
              { label: "Selected", value: "output" },
              { label: "Action", value: "action" },
              { label: "Pagination", value: "pagination" }
          ]
      }
      if (widget && widget.type === 'Repeater') {
          return [
              { label: "In", value: "default" },
              { label: "Selected", value: "output" }
          ]
      }
      if (widget&& widget.type === 'Paging') {
          return [
              { label: "# Elements", value: "elements" },
              { label: "Selected", value: "output" }
          ]
      }
      if ([widget && 'TypeAheadTextBox', 'DropDown', 'MobileDropDown', 'CheckBoxGroup', 'RadioGroup', 'Timeline'].indexOf(widget.type) >= 0) {
          return [
              { label: "In & out", value: "default" },
              { label: "Options", value: "options" }
          ]
      }

      return [
          { label: "In & out", value: "default" }
      ]
  }
}

export default new DataBindingService()