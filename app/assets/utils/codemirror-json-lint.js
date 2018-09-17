const CodeMirror = require('codemirror');
const JSON5 = require('json5');
// window.jsonlint = require('./jsonlint').default;

CodeMirror.registerHelper('lint', 'json', function(text) {
  const found = [];
  // if (!window.jsonlint) {
  //   if (window.console) {
  //     window.console.error('Error: window.jsonlint not defined, CodeMirror JSON linting cannot run.');
  //   }
  //   return found;
  // }
  // const jsonlint = window.jsonlint;
  // jsonlint.parseError = function(str, hash) {
  //   const loc = hash.loc;
  //   found.push({
  //     from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
  //     to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
  //     message: str,
  //   });
  // };
  try {
    // 使用非严格的JSON校验，允许comment，单双引号。
    if (typeof text === 'string' && text.trim() !== '') {
      JSON5.parse(text);
    }
  } catch (e) {
    const loc = {
      first_line: e.lineNumber,
      first_column: e.columnNumber,
      last_line: e.lineNumber,
      last_column: e.columnNumber,
    };
    found.push({
      from: CodeMirror.Pos(loc.first_line - 1, loc.first_column),
      to: CodeMirror.Pos(loc.last_line - 1, loc.last_column),
      message: e.message,
    });
  }
  return found;
});
