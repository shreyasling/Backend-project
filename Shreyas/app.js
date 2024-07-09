const express=require("express");
const bodyParser=require("body-parser")
const connectmongodb=require("./init/mongodb");


connectmongodb();

const {githubRoute}=require("./routes");

const app=express();

app.use(express.json({limit:"500mb"}))
app.use(bodyParser.urlencoded({extended:true,limit:"500mb"}));


app.use("/api/v1/gitHub",githubRoute)

module.exports=app;