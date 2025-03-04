const { Router } = require('express')
const leagueController = require('../controllers/leagueController')
const { checkAuth } = require('../middlewares/checkAuth')

const router = Router()

router.post('/league', checkAuth, leagueController.createLeague)
router.get('/leagues', checkAuth, leagueController.getAllLeagues)
router.get('/users/:userId/leagues', checkAuth, leagueController.getAllUserLeagues)
router.get('/leagues/:leagueSlug/users', checkAuth, leagueController.getLeagueUsers);
router.get('/leagues/:slug', checkAuth, leagueController.getLeagueBySlug);
router.put('/leagues/:slug', checkAuth, leagueController.editLeague);
router.delete('/leagues/:id', checkAuth, leagueController.deleteLeague);
router.post('/:leagueSlug/fakeusers', checkAuth, leagueController.addFakeUser);

module.exports = router