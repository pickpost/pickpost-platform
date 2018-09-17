// 将 JSON 转化为 Schema
function isPlainObject(obj) {
  return obj ? typeof obj === 'object' && Object.getPrototypeOf(obj) === Object.prototype : false;
}

const supportType = [ 'string', 'number', 'array', 'object', 'boolean', 'integer' ];

function getType(type) {
  if (!type) type = 'string';
  if (supportType.indexOf(type) !== -1) {
    return type;
  }
  return typeof type;
}

function isSchema(object) {
  if (supportType.indexOf(object.type) !== -1) {
    return true;
  }
  return false;
}

function handleSchema(json, schema) {
  Object.assign(schema, json);
  if (schema.type === 'object') {
    delete schema.properties;
    parse(json.properties, schema);
  }
  if (schema.type === 'array') {
    delete schema.items;
    schema.items = {};
    parse(json.items, schema.items);
  }
}

function handleArray(arr, schema, str) {
  schema.type = 'array';
  if (arr.length <= 0) {
    schema.items = null;
  } else {
    schema.items = {};
    parse(arr[0], schema.items, str);
  }
}

function handleObject(json, schema, str) {
  if (isSchema(json)) {
    return handleSchema(json, schema);
  }
  schema.type = 'object';
  schema.required = [];
  const props = schema.properties = {};
  for (let key in json) {
    const item = json[key];
    let curSchema = props[key] = {};
    if (key[0] === '*') {
      delete props[key];
      key = key.substr(1);
      schema.required.push(key);
      curSchema = props[key] = {};
    }
    parse(item, curSchema, str + '.' + key);
  }
}

function parse(json, schema, str, schemaChange = {}) {
  if (schemaChange[str] && schemaChange[str].title) {
    schema.title = schemaChange[str].title;
  } else {
    schema.title = '';
  }
  schema.path = str;
  if (Array.isArray(json)) {
    handleArray(json, schema, str + '[0]');
  } else if (isPlainObject(json)) {
    handleObject(json, schema, str);
  } else {
    schema.type = getType(json);
    schema.example = json;
    schema.path = str;
    if (schemaChange[str] && schemaChange[str].enum) {
      schema.enum = schemaChange[str].enum;
    } else {
      schema.enum = [];
    }
    if (schemaChange[str] && schemaChange[str].example) {
      schema.example = schemaChange[str].example;
    } else {
      schema.example = json;
    }
  }
}

function ejs(data, schemaChange) {
  const JsonSchema = {};
  parse(data, JsonSchema, 'data', schemaChange);
  return JsonSchema;
}


// function json2schema(json) {
//   let schema;

//   if (isPlainObject(json)) {

//   } else if (Array.isArray(json)) {

//   }
// }

export default ejs;
