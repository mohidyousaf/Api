const { compareSync } = require("bcrypt");
//var console = require("consoleit");
var Joi = require('joi');



var tests = [
  // both empty - should fail
  {a: '', b: ''},
  // one not empty - should pass but is FAILING
  {a: 'aa', b: ''},
  // both not empty - should pass
  {a: 'aa', b: 'bb'},
  // one not empty, other key missing - should pass
  {a: 'aa'}
];

for(var i = 0; i < tests.length; i++) {
  const { error } = validate(tests[i]);
  if (error) {
    console.log(i);
    console.log(error.details[0].message);
  }
}