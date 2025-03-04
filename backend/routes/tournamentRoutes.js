const { Router } = require('express');
const tournamentController = require('../controllers/tournamentController');
const { checkAuth } = require('../middlewares/checkAuth');

const router = Router();

router.post('/leagues/:leagueSlug', checkAuth, tournamentController.createTournament);
router.put('/leagues/:leagueSlug/tournaments/:slug', checkAuth, tournamentController.editTournament);
router.delete('/leagues/:leagueSlug/tournaments/:slug', checkAuth, tournamentController.deleteTournament);
router.get('/leagues/:leagueSlug/tournaments/:slug', checkAuth, tournamentController.getTournamentBySlug);
router.get('/leagues/:leagueSlug/tournaments', checkAuth, tournamentController.getAllTournaments);

module.exports = router;
