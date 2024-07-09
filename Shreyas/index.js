
const app=require("./app");
const port=8000;



//listen server

app.listen(port,()=>{
    console.log(`server is running on port ${port}`)
})