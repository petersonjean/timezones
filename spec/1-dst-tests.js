/*jslint nomen: true*/
/*global describe, expect, it, __*/
describe('DST', function () {
	it('1 - should make sure that tests are setup correctly', function () {
		expect(1).toBe(1);
	});
	it('2 - should validate against invalid inputs', function () {
		expect(function() {DST.getNextDSTEvent(new Date())}).toThrow(new Error("Date arguments must be moment.js Moment objects"));
		expect(function() {DST.getNextDSTEvent(moment('2013-01-01'), moment('2012-05-01'))}).toThrow(new Error("Start date can't be after end date"));
		expect(function() {DST.getNextDSTEvent(moment.tz('2013-01-01', 'Europe/London'), moment.tz('2013-01-06', 'Asia/Manila'))}).toThrow(new Error("Start date and end date must be in the same time zone"));
	});
	it('3 - should return correct values for FORWARD events locally (London)', function () {
		expect(DST.getNextDSTEvent(moment('2010-01-01 00:00:00')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2010-03-28T00:59:00+00:00]; AFTER:[2010-03-28T02:00:00+01:00];');
		expect(DST.getNextDSTEvent(moment('2011-01-01 00:00:00')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2011-03-27T00:59:00+00:00]; AFTER:[2011-03-27T02:00:00+01:00];');
		expect(DST.getNextDSTEvent(moment('2012-01-01 00:00:00')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2012-03-25T00:59:00+00:00]; AFTER:[2012-03-25T02:00:00+01:00];');
		expect(DST.getNextDSTEvent(moment('2013-01-01 00:00:00')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2013-03-31T00:59:00+00:00]; AFTER:[2013-03-31T02:00:00+01:00];');
	});
	it('4 - should return correct values for FORWARD events in other time zones', function () {
		expect(DST.getNextDSTEvent(DST.createTimeInTimezone('2013-01-01 00:00:00', 'Europe/Paris')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2013-03-31T01:59:00+01:00]; AFTER:[2013-03-31T03:00:00+02:00];');
		expect(DST.getNextDSTEvent(DST.createTimeInTimezone('2013-01-01 00:00:00', 'America/Los_Angeles')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2013-03-10T01:59:00-08:00]; AFTER:[2013-03-10T03:00:00-07:00];');
	});
	it('5 - should return correct values for FORWARD events on Lord Howe Island', function () {
		expect(DST.getNextDSTEvent(DST.createTimeInTimezone('2014-06-01 00:00:00', 'Australia/Lord_Howe')).toString()).toEqual('TYPE:[FORWARD]; BEFORE:[2014-10-05T01:59:00+10:30]; AFTER:[2014-10-05T02:30:00+11:00];');
	});
	it('6 - should return correct values for BACK events locally (London)', function () {
		expect(DST.getNextDSTEvent(moment('2010-06-01 00:00:00')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2010-10-31T01:59:00+01:00]; AFTER:[2010-10-31T01:00:00+00:00];');
		expect(DST.getNextDSTEvent(moment('2011-06-01 00:00:00')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2011-10-30T01:59:00+01:00]; AFTER:[2011-10-30T01:00:00+00:00];');
		expect(DST.getNextDSTEvent(moment('2012-06-01 00:00:00')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2012-10-28T01:59:00+01:00]; AFTER:[2012-10-28T01:00:00+00:00];');
		expect(DST.getNextDSTEvent(moment('2013-06-01 00:00:00')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2013-10-27T01:59:00+01:00]; AFTER:[2013-10-27T01:00:00+00:00];');
	});
	it('7 - should return correct values for BACK events in other time zones', function () {
		expect(DST.getNextDSTEvent(DST.createTimeInTimezone('2013-06-01 00:00:00', 'Europe/Paris')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2013-10-27T02:59:00+02:00]; AFTER:[2013-10-27T02:00:00+01:00];');
		expect(DST.getNextDSTEvent(DST.createTimeInTimezone('2013-06-01 00:00:00', 'America/Los_Angeles')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2013-11-03T01:59:00-07:00]; AFTER:[2013-11-03T01:00:00-08:00];');
	});
	it('8 - should return correct values for BACK events on Lord Howe Island', function () {
		expect(DST.getNextDSTEvent(DST.createTimeInTimezone('2013-01-01 00:00:00', 'Australia/Lord_Howe')).toString()).toEqual('TYPE:[BACK]; BEFORE:[2013-04-07T01:59:00+11:00]; AFTER:[2013-04-07T01:30:00+10:30];');
	});
	it('9 - should return null for territories which do not operate a DST that year', function () {
		expect(DST.getNextDSTEvent(moment('2010-01-01 00:00:00').tz('Asia/Manila')).eventType).toEqual('NO_DST');
		expect(DST.getNextDSTEvent(moment('1900-01-01 00:00:00').tz('Europe/London')).eventType).toEqual('NO_DST');
	});
	it('10 - should not keep searching for DST events beyond the specified end point', function () {
		expect(DST.getNextDSTEvent(moment.tz('1990-01-01 00:00:00', 'Europe/London'), moment.tz('1990-03-03 00:00:00', 'Europe/London')).eventType).toEqual('NO_DST');
	});
});
describe('Ambiguity', function () {
	it('1 - should identify nonexistent date time timezones', function () {
		expect(DST.timeExists('2014-03-30 01:15:00', 'Europe/London')).toEqual(false);
		expect(DST.timeExists('2014-03-09 02:15:00', 'America/Los_Angeles')).toEqual(false);
		expect(DST.timeExists('2014-10-05 02:15:00', 'Australia/Lord_Howe')).toEqual(false);
	});
	it('2 - should allow real date time timezone combos', function () {
		expect(DST.timeExists('2014-02-20 01:15:00', 'Europe/London')).toEqual(true);
		expect(DST.timeExists('2014-03-09 03:10:00', 'America/Los_Angeles')).toEqual(true);
		expect(DST.timeExists('2014-10-05 02:45:00', 'Australia/Lord_Howe')).toEqual(true);	// This fucker broke at 2014-02-10 16:05
		expect(DST.timeExists('2014-04-06 01:15:00', 'Australia/Lord_Howe')).toEqual(true);
		expect(DST.timeExists("2014-03-30 23:43:00", "Europe/London", "YYYY-MM-DD HH:mm")).toEqual(true); // This was broken in moment 2.4.0 + moment.tz 0.0.1
	});
	it('3 - should identify ambiguous dates', function () {
		expect(DST.timeIsAmbiguous('2014-10-26 01:15:00', 'Europe/London')).toEqual(['+01:00', '+00:00']);
		expect(DST.timeIsAmbiguous('2014-11-02 01:15:00', 'America/Los_Angeles')).toEqual(['-07:00', '-08:00']);
		expect(DST.timeIsAmbiguous('2014-04-06 01:45:00', 'Australia/Lord_Howe')).toEqual(['+11:00', '+10:30']);		
	});
	it('4 - should identify unambiguous dates', function() {
		expect(DST.timeIsAmbiguous('2014-10-24 01:15:00', 'Europe/London')).toEqual(false);
	})
});