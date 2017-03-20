var NBA = require('nba');
var moment = require('moment');
var request = require('request');
var _ = require('underscore');

module.exports = function lookUpGame(req, res) {
	var selectedId = parseInt(req.query.text.trim());

	try {
		var allScores = NBA.stats.scoreboard({
			gameDate: moment().format('L')
		});
	} catch(err) {
		res.status(500).send('Error');
		return;
	} finally {
		allScores.then(function(result) {
			var selectedTeamGame = _.findWhere(result.lineScore, {
				teamId: selectedId
			});

			// No game found with selected team
			if (typeof selectedTeamGame == 'undefined') {
				var html = '<div><strong>No Game Found!</strong></div>';
				res.json({
					body: html
				});
			}

			// Use found gameId to look up game time and pts
			var gameHeader = _.findWhere(result.gameHeader, {
				gameId: selectedTeamGame.gameId
			});
			var otherTeamId = (gameHeader.homeTeamId === selectedId) ? gameHeader.visitorTeamId : gameHeader.homeTeamId;
			var otherTeamGame = _.findWhere(result.lineScore, {
				teamId: otherTeamId
			});
			var gameTime = gameHeader.livePeriodTimeBcast.substring(0, gameHeader.livePeriodTimeBcast.indexOf('-'));
			var selectedTeamPts = (selectedTeamGame.pts != null) ? selectedTeamGame.pts : 0;
			var otherTeamPts = (otherTeamGame.pts != null) ? otherTeamGame.pts : 0;
			var html = '<div><strong>' + selectedTeamGame.teamAbbreviation + '</strong>&nbsp;' + 
				selectedTeamPts + '&nbsp;<u><i>' + gameTime + '</i></u>&nbsp;' + 
				otherTeamPts + '&nbsp;<strong>' + otherTeamGame.teamAbbreviation + '</strong></div>';
			res.json({
				body: html
			});
		});
	}
};
