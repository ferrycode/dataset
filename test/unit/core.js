module("Extracting Data");

(function() {
  var data = {
    "columns" : [
      { 
        "name" : "one", 
        "type" : "integer",
        "data" : [1, 2] 
      },
      { 
        "name" : "two", 
        "type" : "integer",
        "data" : [10, 20] 
      }
    ]
  };

  // rewrite parsing then come back here
  var ds = new DS.Dataset({ 
      data : data, 
      strict : true 
    }),
    pos1 = 0,
    pos2 = 1,
    rid1 = ds._rows[0]._id,
    rid2 = ds._rows[1]._id;

  test("getting values by position", 2, function() {
    equal(1, ds.get(pos1, "one"), "Can get the first value in the one column" )
    equal(2, ds.get(pos2, "one"), "Can get the second value in the one column" )
  });

  test("getting values by id", 2, function() {
    equal(1, ds.getByRowId(rid1, "one"), "Can get the first value in the one column" )
    equal(2, ds.getByRowId(rid2, "one"), "Can get the second value in the one column" )
  });

  test("getting a whole row by position", 2, function() {
    ok(typeof ds.get(pos1)._id !== "undefined", "Whole row fetch has _id");
    ok(typeof ds.get(pos1).data !== "undefined", "Whole row fetch has data");
  });

  test("getting a whole row by id", 2, function() {
    ok(typeof ds.getByRowId(rid1)._id !== "undefined", "Whole row fetch has _id");
    ok(typeof ds.getByRowId(rid1).data !== "undefined", "Whole row fetch has data");
  });

  test("filtering to rows via filter:row", 1, function() {
    var rid = 0,
        sub = ds.filter({ row : rid });
    equal( sub.get(rid, "one") , ds.get(rid, "one"), "Same data exists in sub dataset" )
  });

  test("filtering to rows via filter:rows", 2, function() {
    var pos1 = 0,
        pos2 = 1,
        sub = ds.filter({ rows : [pos1, pos2] });
    equal( sub.get(pos1, "one") , ds.get(pos1, "one"), "Same data exists in sub dataset" )
    equal( sub.get(pos2, "one") , ds.get(pos2, "one"), "Same data exists in sub dataset" )
  });

  test("filtering to rows via rows", function() {
    var rid = 0,
        sub = ds.rows(rid);

    equal( sub.get(rid, "one") , ds.get(rid, "one"), "Same data exists in sub dataset" )
  });

  test("filtering by columns - first", 5, function() {
    var sub = ds.filter({column:"one"});
    ok(sub._columns.length === 1, "only one column in new subset");
    ok(sub._rows.length === ds._rows.length, "same number of rows in both datasets");
    ok(sub._rows[0].data.length === 1, "only one item in the sub dataset's row");
    ok(sub._rows[0].data[0] === 1, "the value that got pulled is the first value in the one column first row.");
    ok(sub._rows[1].data[0] === 2, "the value that got pulled is the first value in the one column second row.");
  });

  test("filtering by columns - second", 5, function() {
    var sub = ds.filter({column:"two"});
    ok(sub._columns.length === 1, "only one column in new subset");
    ok(sub._rows.length === ds._rows.length, "same number of rows in both datasets");
    ok(sub._rows[0].data.length === 1, "only one item in the sub dataset's row");
    ok(sub._rows[0].data[0] === 10, "the value that got pulled is the first value in the one column first row.");
    ok(sub._rows[1].data[0] === 20, "the value that got pulled is the first value in the one column second row.");
  });
}());

module("Setting values");
(function() {

  test("Setting a single value by position", 2, function() {
    var obj = [
      {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1},
      {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
    ];

    var ds = new DS.Dataset({ data : obj }),
        rid = 0;

    ok(ds.get(rid, "character") === "α", "pre set character is correct");
    ds.set(rid, { "character" : "M" });
    ok(ds.get(rid, "character") === "M", "post set character is correct");

  });

  test("Setting a single value by id", 2, function() {
    var obj = [
      {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1},
      {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
    ];

    var ds = new DS.Dataset({ data : obj }),
        rid = ds._rows[0]._id;

    ok(ds.getByRowId(rid, "character") === "α", "pre set character is correct");
    ds.setByRowId(rid, { "character" : "M" });
    ok(ds.getByRowId(rid, "character") === "M", "post set character is correct");

  });

  test("Setting a single value to the same value that already exists", 2, function(){
    var obj = [
      {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1},
      {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
    ];

    var ds = new DS.Dataset({ data : obj }),
        rid = 0;

    ok(ds.get(rid, "character") === "α", "pre set character is correct");
    ds.set(rid, { "character" : "α" });
    ok(ds.get(rid, "character") === "α", "post set character is correct");

    // TODO: check that things weren't triggered here in the future.
  });

  test("Setting multiple values", 4, function() {
    var obj = [
      {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1},
      {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
    ];

    var ds = new DS.Dataset({ data : obj }),
        rid = 0;

    ok(ds.get(rid, "character") === "α", "pre set character is correct");
    ok(ds.get(rid, "name") === "alpha", "pre set character is correct");
    ds.set(rid, { "character" : "M", "name" : "Em" });
    ok(ds.get(rid, "character") === "M", "post set character is correct");
    ok(ds.get(rid, "name") === "Em", "post set character is correct");
  });

  test("Basic Queuing works on Set", 9, function() {
    var obj = [
      {"character" : "α", "name" : "alpha", "is_modern" : true, "numeric_value" : 1},
      {"character" : "ε", "name" : "epsilon", "is_modern" : false, "numeric_value" : 5}
    ];

    var ds = new DS.Dataset({ data : obj }),
        rid = 0;

    ds.push();

    ok(ds._queing === true, "queing started");
    ok(ds.get(rid, "character") === "α", "pre set character is correct");
    ok(ds.get(rid, "name") === "alpha", "pre set character is correct");
    ds.set(rid, { "character" : "M", "name" : "Em" });
    ok(ds.get(rid, "character") === "M", "post set character is correct");
    ok(ds.get(rid, "name") === "Em", "post set character is correct");

    ok(ds._deltaQueue.length === 1, "There are deltas in the queue");

    ok(_.isEqual(ds._deltaQueue[0], {

      _id : ds.get(rid)._id,
      old : {
        "character" : "α",
        "name" : "alpha"
      },
      changed : {
        "character" : "M",
        "name" : "Em"
      }
    }), "deltas are equal");

    ds.pop();
    ok(ds._queing === false, "no longer queing");
    ok(ds._deltaQueue.length === 0, "no deltas in the queue");
  });

  //TODO: add event related triggers here!

  //TODO: add subset related triggers here
  // - changing value in parent
  //   should change values in sub datasets.
  // - changing value in sub dataset
  //   should change value in parent?
  // May need to think about this in great detail.

})();



module("Type Checking");
(function() {
  test("Check Boolean type", 2, function() {
    var bTValue = true,
        bFValue = false;
    ok(DS.typeOf(bTValue)=="boolean", "Value should be boolean");
    ok(DS.typeOf(bFValue)=="boolean", "Value should be boolean");
  });

  test("Check number type", 2, function() {
    var value = 12,
        value2 = 0;
    ok(DS.typeOf(value)=="number", "Value should be number");
    ok(DS.typeOf(value2)=="number", "Value should be number");
  });

  test("Check number type", 2, function() {
    var value = "cats",
        value2 = "";
    ok(DS.typeOf(value)=="string", "Value should be string");
    ok(DS.typeOf(value2)=="string", "Value should be string");
  });
})();

