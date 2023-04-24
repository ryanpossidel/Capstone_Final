var createError = require('http-errors')
var express = require('express')
const fileUpload = require('express-fileupload')
const spawner = require('child_process').spawn;
var path = require('path')
var logger = require('morgan')
var bodyParser = require('body-parser')
var flash = require('express-flash')
var cookieParser = require('cookie-parser')
var session = require('express-session')
var mysql = require('mysql')
var connection = require('./database')
var nodeRoutes = require('./routes/index')
var userRoute = require('./routes/users')
var app = express()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
  session({
    secret: '123@abcd',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
  }),
)

//Create Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'Malware'
});

//file upload
app.post('/upload',
    fileUpload({createParentPath: true}),
    (req,res) => {
        const files = req.files 
        console.log(files)

        Object.keys(files).forEach(key => {
            const filepath = path.join(__dirname, 'files', files[key].name)
            files[key].mv(filepath, (err) => {
                if (err) return res.status(500).json({status: "error", message: errr})
            })
        })

        //Gets the filename of the file that was uploaded and saves it to variable
        const filename_for_python = Object.keys(files).toString()
        
        //// Gets the hashes of the file and puts them into the database
        const data_to_pass_in = filename_for_python;
        console.log("Filename sent:", data_to_pass_in);
        
        // Gets the sha1 hash of the file
        var python_process = spawner('python', ['./hashes/gethash_sha1.py', data_to_pass_in]);
        python_process.stdout.on('data', (data) => {
            console.log('sha1:', data.toString())
            sha1_hash = data.toString()
            let post = {name: filename_for_python, sha1: sha1_hash, md5: '', sha256: '', imphash: '', imports: '' }
            let sql = 'INSERT INTO Malware_Table SET ?'
            let query = db.query(sql, post, err => {
                if(err){
                    throw err
                }
            })
        });

        // Gets the md5 hash of the file
        python_process = spawner('python', ['./hashes/gethash_md5.py', data_to_pass_in]);
        python_process.stdout.on('data', (data) => {
            console.log('md5:', data.toString())
            md5_hash = data.toString()
            let post = {md5: md5_hash}
            let sql = `UPDATE Malware_Table SET md5 = '${md5_hash} ' WHERE name = "${filename_for_python}"`
            let query = db.query(sql,post, err => {
                if(err){
                    throw err
                }
            })
        });

        // Gets the sha 256 hash of the file
        python_process = spawner('python', ['./hashes/gethash_sha256.py', data_to_pass_in]);
        python_process.stdout.on('data', (data) => {
            console.log('sh256:', data.toString())
            sha256_hash = data.toString()
            let post = {sha256: sha256_hash}
            let sql = `UPDATE Malware_Table SET sha256 = '${sha256_hash} ' WHERE name = "${filename_for_python}"`
            let query = db.query(sql,post, err => {
                if(err){
                    throw err
                }
            })
        });

        // Gets the import hash of the file
        python_process = spawner('python', ['./hashes/imphash.py', data_to_pass_in]);
        python_process.stdout.on('data', (data) => {
            console.log('imphash:', data.toString())
            imp_hash = data.toString()
            let post = {imphash: imp_hash}
            let sql = `UPDATE Malware_Table SET imphash = '${imp_hash} ' WHERE name = "${filename_for_python}"`
            let query = db.query(sql,post, err => {
                if(err){
                    throw err
                }
            })
        });

        // Gets the imports of the file
        python_process = spawner('python', ['./hashes/get_imports.py', data_to_pass_in]);
        python_process.stdout.on('data', (data) => {
            console.log('imports:', data.toString())
            imports = data.toString()
            let post = {imports: imports}
            let sql = `UPDATE Malware_Table SET imports = '${imports} ' WHERE name = "${filename_for_python}"`
            let query = db.query(sql,post, err => {
                if(err){
                    throw err
                }
            })
        });
        ///////////////////////////////////

        return res.json({status: 'success', messsage: Object.keys(files).toString()})
    }
)
///////////////

app.use(flash())

app.use('/', nodeRoutes)
app.use('/users', userRoute)
app.use(function (req, res, next) {
  next(createError(404))
})
app.listen(5555, function () {
  console.log('Node server running on port : 5555')
})
// error
app.use(function (err, req, res, next) {
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}
  res.status(err.status || 500)
  res.render('error')
})
module.exports = app