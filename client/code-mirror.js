
var React = require('react')
var CM = require('codemirror/lib/codemirror')
var PT = React.PropTypes
var api = require('./api')

var CodeMirror = React.createClass({
  propTypes: {
    onScroll: PT.func,
    editorSettings: PT.object
  },

  componentDidUpdate: function (prevProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.cm.setValue(this.props.initialValue)
    }
  },

  componentDidMount: function () {
    require('codemirror/mode/markdown/markdown')

    var editorSettings = {
      value: this.props.initialValue || '',
      theme: 'default',
      mode: 'markdown',
      lineWrapping: true,
    }
    for (var key in this.props.editorSettings) {
      editorSettings[key] = this.props.editorSettings[key]
    }

    this.cm = CM(this.getDOMNode(), editorSettings);
    this.cm.on('change', (cm) => {
      this.props.onChange(cm.getValue())
    })
    this.cm.on('scroll', (cm) => {
      var node = cm.getScrollerElement()
      var max = node.scrollHeight - node.getBoundingClientRect().height
      this.props.onScroll(node.scrollTop / max)
    })
    var box = this.getDOMNode().getBoundingClientRect()
    this.cm.setSize(box.width, box.height)

    window.addEventListener('resize', this._onResize)

    document.addEventListener('paste', this._onPaste)
  },

  _onResize: function () {
    var box = this.getDOMNode().getBoundingClientRect()
    this.cm.setSize(box.width, box.height)
  },

  componentWillUnmount: function () {
    document.removeEventListener('paste', this._onPaste)
    document.removeEventListener('resize', this._onResize)
  },

  _onPaste: function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    if (!items.length) return
    var blob;
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].kind == 'file'){
        blob = items[i].getAsFile();
        break;
      }
    };
    if (!blob) return
    var reader = new FileReader();
    reader.onload = (event) => {
      api.uploadImage(event.target.result).then((src) =>
        this.cm.replaceSelection('![pasted image](' + src + ')')
      );
    };
    reader.readAsDataURL(blob);
  },

  render: function () {
    return <div/>
  }
})

module.exports = CodeMirror
