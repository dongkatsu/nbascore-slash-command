var NBA = require("nba");
var request = require('request');
var _ = require('underscore');

module.exports = function(req, res) {
	var searchTeam = req.query.text.trim();

	// User left search term empty
	if (!searchTeam) {
		res.json([{
			title: '<i>(enter a team name)</i>',
			text: ''
		}]);
		return;
	}

	try {
		var allTeams = NBA.stats.teamStats();
	} catch (err) {
      	res.status(500).send('Error');
      	return;
	} finally {
		allTeams.then(function(result) {
			var suggestTeam = _.reject(result, function(team) {
					var currName = team.teamName.toUpperCase();
					return !currName.includes(searchTeam.toUpperCase());
				});

			if (suggestTeam.length === 0) {
				// Search term does not match any team names
				res.json([{
					title: '<i>(no results)</i>',
					text: ''
				}]);
			} else {
				suggestTeam = _.map(suggestTeam, function(team) {
						return {
							title: team.teamName,
							text: team.teamId
						};
					});
				res.json(suggestTeam);
			}
		});
	}
};

