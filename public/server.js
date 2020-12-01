const express = require('express');
const app = express();
const port = 3000
const pool = require('./db')
var path = require('path')

app.use(express.static(path.join(__dirname, "css")));
app.engine('html', require('ejs').renderFile);
app.use(express.urlencoded());
app.use(express.json());

function changeCCN(ccn) {
    newCcn = "";
    for (i = 0; i < ccn.length; i++) {
        if (ccn.length - i > 4) {
            newCcn += "*";
        }else {
            newCcn += ccn[i];
        }
    }
    return newCcn;
}

app.post('/confirmation', async(req, res) => {
    body = req.body;
    ccn = changeCCN(body.credit_card);
    var book_ref = Math.random().toString(36).substr(2, 6);
    var ticket_no = Math.random().toString(36).substr(2, 13) + Math.random().toString(36).substr(2, 2);
    seats_available = await pool.query(`SELECT seats_available FROM flights WHERE arrival_airport = '${body.flight}';`);
    seats_available = seats_available.rows[0].seats_available;
    if (seats_available > 0) {
        q = `UPDATE flights SET seats_available = (seats_available-1), seats_booked = (seats_booked + 1) WHERE arrival_airport = '${body.flight}';`;
        pool.query(q);
        q = `INSERT INTO bookings (book_ref, book_date, card_number, total_amount) SELECT '${book_ref}', flights.scheduled_departure, ${body.credit_card}, ${body.fare_conditions} FROM flights WHERE arrival_airport = '${body.flight}';`;
        pool.query(q);
        q = `INSERT INTO ticket VALUES('${ticket_no}', '${book_ref}', '${body.name}', '${body.email_address}', '${body.phone_number}');`
        pool.query(q);
        res.render(__dirname + "/views/confirmation.html", {name:body.name, number:body.phone_number, email:body.email_address, cc:ccn, dep: "HOU", arr:body.flight, cost:body.fare_conditions});
    }else {
        res.redirect('/retry');
    }
});

app.get('/retry', function(req, res) {
    res.render(__dirname + "/views/retry.html")
});

app.get('/', function(req, res){
    res.sendFile('airlineweb.html', { root: __dirname + "/views" } );
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})