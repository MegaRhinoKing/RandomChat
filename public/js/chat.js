port = 5001

const socket = io.connect("http:freshcraft.play.ai:5001/")
let selfid = undefined
let strangerid = undefined

const chatbox = document.getElementById("chatbox")
const connection = document.getElementById("connectionstatus")
const msgbox = document.getElementById("msgbox")

socket.on("stranger_found", (arg)=>{
    if (arg.userid == selfid) {
         strangerid = arg.strangerid
    }
    else if (arg.strangerid == selfid) {
        strangerid = arg.userid
    }

    document.title = "Stranger found!"
    connection.innerText = "Stranger found!"

    console.log("strangerid: " + strangerid + ". selfid:", selfid)

    msgbox.disabled = false

    socket.emit("new_entry", {[arg.userid]:strangerid})
})

socket.on("your_id", (arg) => {
    selfid = arg
})

socket.on("message", (arg) => {
    const author = arg.author
    const message = arg.message
    let sender_type = undefined

    if (author==selfid) {
        sender_type = "You: "
    }
    else if (author==strangerid) {
        sender_type = "Stranger: "
    }

    let para = document.createElement("P")
    para.innerText = sender_type+message
    document.getElementById("messages").appendChild(para)
})

socket.on("chat_ended", (arg) => {
    let para = document.createElement("P")
    para.innerText = "Stranger disconnected..."
    document.getElementById("messages").appendChild(para)
    msgbox.disabled = true
})

chatbox.onsubmit = (e)=>{
    e.preventDefault();
    console.log(e)
    const text = e.target[0].value
    e.target[0].value = ""

    socket.emit("message_to_server", {msg_details:{message:text,author:selfid},strangerid})

    //io.to(selfid).to(strangerid).emit("message", )
}

newchat.onclick = (e)=>{
    socket.emit("chat_left", strangerid)
    window.location.replace("/newchat");
}

