const {Client} = require('pg')

const client = new Client({
    host: "localhost",
    user: "postgres",
    port: "5432",
    password: "therock",
    database: "Pawy_Meals"

})
client.connect()

client.query(`Select * from employee`, (err, res)=>{
    if(!err){
        console.log(res.rows);
    } else {
        console.log(err.message);
    }
    client.end
})
//DATABASE_URL=postgres://postgres:therock@localhost:5432/Pawy_Meals
