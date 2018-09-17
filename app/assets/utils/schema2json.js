function hasValue(val) {
  return typeof val !== 'undefined';
}

function schema2json(schema) {
  let root;
  if (schema.type === 'object') {
    root = root || {};
    Object.keys(schema.properties).forEach(key => {
      root[key] = schema2json(schema.properties[key]);
    });
  } else if (schema.type === 'array') {
    root = schema.items ? [ schema2json(schema.items) ] : [];
  } else {
    if (hasValue(schema.example)) {
      root = schema.example;
    } else if (schema.enum && schema.enum[0] && hasValue(schema.enum[0].value)) {
      root = schema.enum[0].value;
    } else {
      root = '';
    }
  }

  return root;
}

export default schema2json;
