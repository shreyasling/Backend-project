const mongoose=require("mongoose")


const connectmongodb=async()=>{
    try {
       await mongoose.connect('mongodb://localhost:27017/github_user_data');
       console.log("Database connect successfully") 
    } catch (error) {
        console.log(error.message)
    }
}

module.exports=connectmongodb