const mysql = require('mysql2');

const conn = mysql.createConnection({
  // for offline mysql - "practice" online mongo
  // host: 'localhost',
  // user: 'root',
  // password: 'saketh4147',
  // database: 'rms',
    


  // online mysql
    host: 'bq35ggmveksgiyapykyw-mysql.services.clever-cloud.com',
    user: 'ujvkzd5a6z7uzrc1',
    password: '59pm9QME1GTHHbxhUWkE',
    database: 'bq35ggmveksgiyapykyw',
}); 
  conn.connect((err)=>{
    if(err)
    console.log('its error '+ err);
    else
    console.log("connected...");

  });

  module.exports = conn;