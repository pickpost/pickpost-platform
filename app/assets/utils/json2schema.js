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

function json2schema(json, pathMap, parentsPath) {
  let schema;
  pathMap = pathMap || {};
  const newParentsPath = parentsPath || 'root';

  if (isPlainObject(json)) {
    schema = schema || {
      title: '',
      type: 'object',
      properties: (function() {
        const props = {};
        Object.keys(json).forEach(key => {
          props[key] = json2schema(json[key], pathMap, newParentsPath + '.' + key);
        });
        return props;
      })(),
      remark: '',
      path: newParentsPath,
    };
  } else if (Array.isArray(json)) {
    schema = schema || {
      title: '',
      type: 'array',
      items: (function() {
        return json.length <= 0 ? null : json2schema(json[0], pathMap, newParentsPath + '[0]');
      })(),
      remark: '',
      path: newParentsPath,
    };
  } else {
    schema = {
      title: '',
      type: getType(json),
      example: json,
      enum: [],
      remark: '',
      path: newParentsPath,
    };
  }

  if (pathMap[schema.path]) {
    schema = { ...schema, ...pathMap[schema.path] };
  }

  return schema;
}

export default json2schema;
