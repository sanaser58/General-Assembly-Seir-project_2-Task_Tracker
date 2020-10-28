const express = require('express');
const router = express.Router();

//---------User model----------//
const user = require('../models/user');
const task = require('../models/task');


//---------Welcome Page----------//
router.get('/', (req, res) => res.render('greeting'));



//---------Dashboard GET----------//
let email = "";
router.get('/dashboard', (req, res) => {
    email = req.query.user;
    user.findOne({
        email: req.query.user
    }).then(user => {
        task.find({
            email: req.query.user
        }, (err, tasks) => {
            if (err) console.log(err);
            else {
                let days = [];
                days.push(getDates(0));
                days.push(getDates(1));
                days.push(getDates(2));
                days.push(getDates(3));
                days.push(getDates(4));
                days.push(getDates(5));
                days.push(getDates(6));
                res.render('dashboard', { tasks, user, days });
            }
        });
    })
}
);


//------------------Function to return date string--------------//
function getDates(n) {
    let date = new Date();
    date .setDate(date .getDate() + n);
    let newDate = date .toLocaleDateString('pt-br').split( '/' ).reverse( ).join( '-' );
    let day;
    switch (date .getDay()) {
        case 0: day = 'Sun';
            break;
        case 1: day = 'Mon';
            break;
        case 2: day = 'Tue';
            break;
        case 3: day = 'Wed';
            break;
        case 4: day = 'Thu';
            break;
        case 5: day = 'Fri';
            break;
        case 6: day = 'Sat';
            break;
    }
    return { date: newDate, day };
}


//-------------Handle Change View: Daily <--> Weekly--------------//
router.post('/user-view', (req, res) => {
    user.findOne({
        email
    })
        .then(user => {
            user.view = user.view === 'daily' ? 'weekly' : 'daily';
            user.save()
                .then(user => {
                    return res.redirect('back');
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log("Error changing view!");
            return;
        })
})


//---------Dashboard Add Task----------//
router.post('/dashboard', (req, res) => {
    const { content } = req.body;

    task.findOne({ content: content, email: email }).then(task => {
        if (task) {
            //---------Update existing task----------//
            let dates = task.dates, tzoffset = (new Date()).getTimezoneOffset() * 60000;
            let today = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
            dates.find(function (item, index) {
                if (item.date === today) {
                    console.log("Task exists!")
                    req.flash(
                        'error_msg',
                        'Task already exists!'
                    );
                    res.redirect('back');
                }
                else {
                    dates.push({ date: today, complete: 'none' });
                    task.dates = dates;
                    task.save()
                        .then(task => {
                            console.log(task);
                            res.redirect('back');
                        })
                        .catch(err => console.log(err));
                }
            });
        }
        else {
            let dates = [], tzoffset = (new Date()).getTimezoneOffset() * 60000;
            let localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 10);
            dates.push({ date: localISOTime, complete: 'none' });
            const newTask = new Task({
                content,
                email,
                dates
            });



             //---------Save Task----------//
             newTask
             .save()
             .then(task => {
                 console.log(task);
                 res.redirect('back');
             })
             .catch(err => console.log(err));
     }
 })
});


//---------Dashboard Add/Remove Task to/from Favorites----------//
router.get("/favorite-task", (req, res) => {
    let id = req.query.id;
    task.findOne({
        _id: {
            $in: [
                id
            ]
        },
        email
    })
        .then(task => {
            task.favorite = task.favorite ? false : true;
            task.save()
                .then(task => {
                    req.flash(
                        'success_msg',
                        task.favorite ? 'Task added to Favorites!' : 'Task removed from Favorites!'
                    );
                    return res.redirect('back');
                })
                .catch(err => console.log(err));
        })
        .catch(err => {
            console.log("Error adding to favorites!");
            return;
        })
});


//-------------Update status of task completion--------------//

router.get("/status-update", (req, res) => {
    let d = req.query.date;
    let id = req.query.id;
    task.findById(id, (err, task) => {
        if (err) {
            console.log("Error updating status!")
        }
        else {
            let dates = task.dates;
            let found = false;
            dates.find(function (item, index) {
                if (item.date === d) {
                    if (item.complete === 'yes') {
                        item.complete = 'no';
                    }
                    else if (item.complete === 'no') {
                        item.complete = 'none'
                    }
                    else if (item.complete === 'none') {
                        item.complete = 'yes'
                    }
                    found = true;
                }
            })
            if (!found) {
                dates.push({ date: d, complete: 'yes' })
            }
            task.dates = dates;
            task.save()
                .then(task => {
                    console.log(task);
                    res.redirect('back');
                })
                .catch(err => console.log(err));
        }
    })

})



//---------Deleting a task----------//
router.get("/remove", (req, res) => {
    let id = req.query.id;
    task.deleteMany({
        _id: {
            $in: [
                id
            ]
        },
        email
    }, (err) => {
        if (err) {
            console.log("Error in deleting record(s)!");
        }
        else {
            req.flash(
                'success_msg',
                'Record(s) deleted successfully!'
            );
            return res.redirect('back');
        }
    })
});

module.exports = router;