//I'm writing my own testing framework because YOLO?

var Assert = function () {

	this.that = function(msg, actual, expected, quiet) {
		if (expected instanceof Array && actual instanceof Array) {
			return assertThatArray(msg, actual, expected);
		}

		if (actual == expected || (expected.equals && expected.equals(actual) )) {
			if (quiet !== true) console.log(msg + " PASS");
			return true;
		} else {
			console.log(msg + " FAIL");
			console.log("Expected " + expected + ", was " + actual);
			return false;
		}
	}

	var assertThatArray = function(msg, actual, expected) {
		var pass = true;
		if (actual.length == expected.length) {
			expected.forEach(function (e, i) {
				pass = pass & assert.that(msg + " index " + i, actual[i], expected[i], true);
			});
		} else {
			pass = false;
		}
		if (pass) {
			console.log(msg + " PASS");
		} else {
			console.log(msg + " FAIL\nExpected \n" + expected + "\nwas\n" + actual);
		}
		return pass;
	}
}

var assert = new Assert();

var is = function(val) {
	return val;
}

var tests = function() {

	var grid = createGrid(4,4);


	assert.that("horizontal LOS can see", grid.canSee(new Pos(0,0), new Pos(1,0)), is(true));
	assert.that("vertical LOS can see", grid.canSee(new Pos(0,0), new Pos(0,1)), is(true));

	grid.set(new Pos(1,1), 1);
	assert.that("horizontal LOS is blocked", grid.canSee(new Pos(1,0), new Pos(1,2)), is(false));
	assert.that("vertical LOS is blocked", grid.canSee(new Pos(0,1), new Pos(2,1)), is(false));

	grid.set(new Pos(1,1), 0);

	//To test complex LOS checks, we're going to spy on which cells are looked through.
	var cellsChecked = [];
	grid.canMove = function (pos) {
		cellsChecked.push(pos);
		return true;
	}

	//aO a is looking at b
	//Ob
	cellsChecked.splice(0);
	grid.canSee(new Pos(0,0), new Pos(1,1));
	var expected = [new Pos(0,0), new Pos(0,1), new Pos(1,0), new Pos(1,1)];
	assert.that("through corner with y increasing", cellsChecked, is(expected));

	//Ob a is looking at b
	//aO
	cellsChecked.splice(0);
	grid.canSee(new Pos(0,1), new Pos(1,0));
	var expected = [new Pos(0,0), new Pos(0,1), new Pos(1,0), new Pos(1,1)];
	assert.that("through corner with y decreasing", cellsChecked, is(expected));



	cellsChecked.splice(0);
	grid.canSee(new Pos(0,0), new Pos(1,2));
	var expected = [new Pos(0,0), new Pos(0,1), new Pos(1,1), new Pos(1,2)];
	assert.that("diagonal left-down cansee", cellsChecked, is(expected));

	cellsChecked.splice(0);
	grid.canSee(new Pos(0,0), new Pos(1,3));
	var expected = [new Pos(0,0), new Pos(0,1), new Pos(0,2), new Pos(1,1), new Pos(1,2), new Pos(1,3)];
	assert.that("diagonal left-down cansee steep", cellsChecked, is(expected));

}