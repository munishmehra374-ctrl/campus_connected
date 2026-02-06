const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
    getAllSocieties, getSocietyById, toggleJoin, assignSenior,
    addWorkshop, deleteWorkshop, createSociety, deleteSociety
} = require('../controllers/societyController');

router.get('/', protect, getAllSocieties);
router.post('/', protect, authorize('admin'), createSociety);

// Logic Routes
router.post('/:id/toggle-join', protect, authorize('junior'), toggleJoin);
router.post('/:id/assign-senior', protect, authorize('senior'), assignSenior);

// Workshop Management
router.post('/:id/workshops', protect, authorize('senior', 'admin'), addWorkshop);
router.delete('/:id/workshops/:wsId', protect, authorize('senior', 'admin'), deleteWorkshop);

// Individual Resource
router.get('/:id', protect, getSocietyById);
router.delete('/:id', protect, authorize('admin'), deleteSociety);

module.exports = router;