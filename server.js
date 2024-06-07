var express = require('express');
var cors = require('cors');
const mysql = require('mysql');

const port = 8000;

const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    database:'practable',
    password:'',
    port:'3306'
});

const table = 'member'
var app = express();
app.use(cors());
app.use(express.json());

connection.connect((err)=>{
    if (err){
        console.error('Error connecting to database:',err);
        return;  
    }
    console.log(`Connected to database with threadID ${connection.threadId}`);
});

app.get('/',(req,res) =>{
    res.send('server is working')
})

app.get('/getdata',(req,res) =>{
    connection.query(`SELECT * FROM ${table}`,(err,result)=>{
    if (err) {
        res.status(500).send(err);
    } else {
        res.json(result);
    }
    });
});

app.get('/search',async(req,res)=>{
    const column =req.query.column;
    const value = req.query.value;

    if (!column || !value){
        return res.status(400).send('Column and value query parameters are required');
    }

    const query =`select *FROM ${table} WHERE ${column} =?`;

    
    connection.query(query, value,(err,result)=>{
        if (err) {
            console.error(err);
            return res.status(500).json({
                message:'Database searching failed'
            });
        }

        res.status(200).json(result);
    })
})

app.delete('/delete',async(req,res)=>{
    const column = req.query.column;
    const value = req.query.value;

    if (!column || !value){
        return res.status(400).send('Column and value query parameters are required ');
    }
    
    const query = `DELETE FROM ${table} WHERE ${column} = ?`;

    connection.query(query,value,(err,result)=>{
        if (err){
            console.error(err);
            return res.status(500).json({
                message: 'Database deletion failed'
            });
        }

        res.status(200).json({
            message:'Dartabase deletion succeded',
            affctedRows:result.affctedRows
        });
    });


});

app.post('/insert', async (req,res)=>{
    const student_data = req.body;
    console.log(student_data);

    if (!student_data || Object.keys(student_data).length === 0){
        return res.status(400).json({
            message : "No student data provided"
        });
    }
    
    
    const {id,name}=student_data

    const query = `
        INSERT INTO ${table}(id,name)
        VALUE (?, ?)
    `;

    const values = [id,name];

    
    connection.query(query,values, (err,result) =>{
        if (err){
            console.error(err);
            return res.stasus(500).json({
                message:'Database insertion failed'
            });
        }
        res.status(201).json({
            message:'Student data inserted successful'
        });
    });
});

app.put('/update',async(req,res)=>{
    const column  = req.query.column;
    const value = req.query.value;

    const update_data = req.body;

    if (!column ||!value){
        return res.status(400).send('Column and valur query parameters are required');
    }

    if (!update_data || Object.keys(update_data).length === 0){
        return res.status(400).json({
            message:"no student data provided to update"
        });
    }

    const values = [...Object.values(update_data), value]
    const setClause = Object.keys(update_data).map(key=>`${key}=?`).join(', ');
    const query = `update ${table} SET ${setClause} WHERE ${column} = ?`

    connection.query(query, values , (err, result)=>{
        if (err){
            return res.status(500).json({
                message:'Database updation failed', err
            });
        }

        res.status(200).json({
            message:'Student data updated successfully',
            affctedRows:result.affctedRows
        });
    });
});



app.listen(port,()=>{
    console.log(`server is running on  http://localhost:${port}`);
})