function isPlainObject(obj) {
  return obj ? typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype : false;
}

function getType(type) {
  const supportType = [ 'string', 'number', 'array', 'object', 'boolean', 'integer' ];
  if (!type) type = 'string';
  if (supportType.indexOf(type) !== -1) {
    return type;
  }
  return typeof type;
}

function json2schema(json) {
  let schema;

  if (isPlainObject(json)) {
    schema = schema || {
      title: '',
      type: 'object',
      properties: (function() {
        const props = {};
        Object.keys(json).forEach(key => {
          props[key] = json2schema(json[key]);
        });
        return props;
      })(),
      remark: '',
    };
  } else if (Array.isArray(json)) {
    schema = schema || {
      title: '',
      type: 'array',
      items: (function() {
        return json.length <= 0 ? null : json2schema(json[0]);
      })(),
      remark: '',
    };
  } else {
    schema = {
      title: '',
      type: getType(json),
      example: json,
      enum: [],
      remark: '',
    };
  }

  return schema;
}

export default json2schema;
