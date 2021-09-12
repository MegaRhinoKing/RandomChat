const express = require('express')
const http = require('http')
var socket = require("socket.io")
const cookieParser = require('cookie-parser');
const cookie = require("cookie");
const { S_IFMT } = require('constants');

const app = express()

app.use(cookieParser())

const server = app.listen(3000, ()=> console.log("Listening on port 3000."))

app.use(express.static("public"))

const io = socket(server)

let waiting = []
let open = []

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/templates/homepage.html");
    
    let id = Math.floor(Math.random() * 100000000000) + 1;
    res.cookie("userid", id)
  });
 
  app.get("/newchat", (req, res) => {
    res.sendFile(__dirname + "/templates/newchat.html");
    let connected = false;

    userid = req.cookies.userid
    waiting.push(userid)
    let strangerid = null

    for (let i = 0; i < waiting.length; i++) {
      if (waiting[i]!==userid) {
        strangerid = waiting[i]
        let index= waiting.indexOf(waiting[i])
        if (index > -1) {
          waiting.splice(index, 1);
        }
        index = waiting.indexOf(userid)
        if (index > -1) {
          waiting.splice(index, 1);

        setTimeout(()=> {
          io.to(userid).to(strangerid).emit("stranger_found", {userid,strangerid})
          console.log(userid, strangerid, "message emited")
        }, 2000)
      }
      }}

  })

io.on("connection", function(socket){
    console.log('made socket connection,', socket.id)

    let cookief = socket.handshake.headers.cookie; 
    let cookies = cookie.parse(socket.handshake.headers.cookie);   
    let userid = cookies.userid
  
    socket.join(userid)
    io.to(userid).emit("your_id",userid)
    console.log(userid, "room joined")

    socket.on("message_to_server", (arg) => {
      const message = arg.msg_details.message
      const author = arg.msg_details.author

      console.log(message, author)

      io.to(arg.msg_details.author).to(arg.strangerid).emit("message", {message,author})
    })

    socket.on("chat_left", (arg) => {
      io.to(arg).emit("chat_ended", 1)
    })

    socket.on("new_entry", (arg) => {
      console.log("new entry",arg)
      open.push(arg)
    })

    socket.on("disconnecting", () => {
      console.log("disconnected",open)
      for (let i=0; i<open.length; i++) {
        for (const [key, value] of Object.entries(open[i])) {
          if (key==userid) {
            io.to(value).emit("chat_ended")
          }
        }

      }
      
    })
});


