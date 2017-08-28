import test from 'tape';

test('basic tests', (t) => {

  console.log(new Float32Array().constructor === Float32Array);
  t.equal(true, true, 'true is true');

  t.end();
});
// TODO