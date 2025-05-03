const express = require('express');
const {protect,authorize} = require('../middleware/auth');
const{
    getCourses,
    getCourse,
    addCourse,
    updateCourse,
    deleteCourse

} = require('../controllers/courses');
const router = express.Router({mergeParams:true});
const Course = require('../models/Courses');
const advancedResults = require('../middleware/advancedResults');
router.route('/:id')
.get(getCourse)
.put(protect,authorize('publisher','admin'),updateCourse)
.delete(protect,authorize('publisher','admin'),deleteCourse);

router.route('/').
get(advancedResults(Course,{
      path:'bootcamp',
                select:'name description'
}),getCourses).
post(protect,authorize('publisher','admin'),addCourse);

module.exports=router;
    